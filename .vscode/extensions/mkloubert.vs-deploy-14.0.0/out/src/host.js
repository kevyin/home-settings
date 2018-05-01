'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("crypto");
const deploy_contracts = require("./contracts");
const deploy_helpers = require("./helpers");
const deploy_workspace = require("./workspace");
const FS = require("fs");
const FSExtra = require("fs-extra");
const i18 = require("./i18");
const Net = require("net");
const Path = require("path");
const ZLib = require("zlib");
/**
 * Transformation type.
 */
var TransformationType;
(function (TransformationType) {
    /**
     * File data
     */
    TransformationType[TransformationType["FileData"] = 0] = "FileData";
    /**
     * (JSON) message
     */
    TransformationType[TransformationType["Message"] = 1] = "Message";
})(TransformationType = exports.TransformationType || (exports.TransformationType = {}));
/**
 * A deploy host.
 */
class DeployHost {
    /**
     * Initializes a new instance of that class.
     *
     * @param {Deployer} deploy The underlying deployer.
     */
    constructor(deployer) {
        this._DEPLOYER = deployer;
    }
    /**
     * Gets the current config.
     */
    get config() {
        return this.deployer.config;
    }
    /**
     * Gets the underlying deployer.
     */
    get deployer() {
        return this._DEPLOYER;
    }
    /**
     * Logs a message.
     *
     * @param {any} msg The message to log.
     *
     * @chainable
     */
    log(msg) {
        this.deployer.log(msg);
        return this;
    }
    /**
     * Gets the output channel.
     */
    get outputChannel() {
        return this.deployer.outputChannel;
    }
    /**
     * Starts the host.
     *
     * @returns {Promise<any>} The promise.
     */
    start() {
        let me = this;
        return new Promise((resolve, reject) => {
            let startCompleted = (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(me);
                }
            };
            if (me._server) {
                startCompleted(); // already started
                return;
            }
            let cfg = me.config;
            let dir;
            let jsonTransformer;
            let jsonTransformerOpts;
            let maxMsgSize = deploy_contracts.DEFAULT_MAX_MESSAGE_SIZE;
            let pwd;
            let port = deploy_contracts.DEFAULT_PORT;
            let transformer;
            let transformerOpts;
            let validator;
            let validatorOpts;
            if (cfg.host) {
                port = parseInt(deploy_helpers.toStringSafe(cfg.host.port, '' + deploy_contracts.DEFAULT_PORT));
                maxMsgSize = parseInt(deploy_helpers.toStringSafe(cfg.host.maxMessageSize, '' + deploy_contracts.DEFAULT_MAX_MESSAGE_SIZE));
                dir = cfg.host.dir;
                // file data transformer
                transformerOpts = cfg.host.transformerOptions;
                if (cfg.host.transformer) {
                    let transformerModuleScript = deploy_helpers.toStringSafe(cfg.host.transformer);
                    transformerModuleScript = me.deployer.replaceWithValues(transformerModuleScript);
                    let transformerModule = deploy_helpers.loadDataTransformerModule(transformerModuleScript);
                    if (transformerModule) {
                        transformer = transformerModule.restoreData ||
                            transformerModule.transformData;
                    }
                }
                // JSON data transformer
                jsonTransformerOpts = cfg.host.messageTransformerOptions;
                if (cfg.host.messageTransformer) {
                    let jsonTransformerModuleScript = deploy_helpers.toStringSafe(cfg.host.messageTransformer);
                    jsonTransformerModuleScript = me.deployer.replaceWithValues(jsonTransformerModuleScript);
                    let jsonTransformerModule = deploy_helpers.loadDataTransformerModule(jsonTransformerModuleScript);
                    if (jsonTransformerModule) {
                        jsonTransformer = jsonTransformerModule.restoreData ||
                            jsonTransformerModule.transformData;
                    }
                }
                // file validator
                validatorOpts = cfg.host.validatorOptions;
                if (cfg.host.validator) {
                    let validatorModuleScript = deploy_helpers.toStringSafe(cfg.host.validator);
                    validatorModuleScript = me.deployer.replaceWithValues(validatorModuleScript);
                    let validatorModule = deploy_helpers.loadValidatorModule(validatorModuleScript);
                    if (validatorModule) {
                        validator = validatorModule.validate;
                    }
                }
                pwd = deploy_helpers.toStringSafe(cfg.host.password);
            }
            dir = deploy_helpers.toStringSafe(dir, deploy_contracts.DEFAULT_HOST_DIR);
            dir = me.deployer.replaceWithValues(dir);
            if (!Path.isAbsolute(dir)) {
                dir = Path.join(deploy_workspace.getRootPath(), dir);
            }
            jsonTransformer = deploy_helpers.toDataTransformerSafe(jsonTransformer);
            if (!deploy_helpers.isNullUndefinedOrEmptyString(pwd)) {
                // add password wrapper
                let baseJsonTransformer = jsonTransformer;
                let pwdAlgo = deploy_helpers.normalizeString(cfg.host.passwordAlgorithm);
                if ('' === pwdAlgo) {
                    pwdAlgo = deploy_contracts.DEFAULT_PASSWORD_ALGORITHM;
                }
                jsonTransformer = (ctx) => {
                    return new Promise((resolve, reject) => {
                        try {
                            let decipher = Crypto.createDecipher(pwdAlgo, pwd);
                            let a = decipher.update(ctx.data);
                            let b = decipher.final();
                            // update data for base transformer
                            ctx.data = Buffer.concat([a, b]);
                            let btResult = Promise.resolve(baseJsonTransformer(ctx));
                            btResult.then((uncryptedData) => {
                                resolve(uncryptedData);
                            }).catch((err) => {
                                reject(err);
                            });
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                };
            }
            transformer = deploy_helpers.toDataTransformerSafe(transformer);
            validator = deploy_helpers.toValidatorSafe(validator);
            let server = Net.createServer((socket) => {
                let remoteClient = {
                    address: socket.remoteAddress,
                    port: socket.remotePort,
                };
                let showError = (err) => {
                    me.log(i18.t('errors.withCategory', 'DeployHost.start().createServer()', err));
                };
                let closeSocket = () => {
                    try {
                        socket.destroy();
                    }
                    catch (e) {
                        me.log(i18.t('errors.withCategory', 'DeployHost.start().createServer(1)', e));
                    }
                };
                let startReading = () => {
                    try {
                        deploy_helpers.readSocket(socket, 4).then((dlBuff) => {
                            if (4 !== dlBuff.length) { // must have the size of 4
                                me.log(i18.t('warnings.withCategory', 'DeployHost.start().createServer()', `Invalid data buffer length ${dlBuff.length}`));
                                closeSocket();
                                return;
                            }
                            let dataLength = dlBuff.readUInt32LE(0);
                            if (dataLength > maxMsgSize) { // out of range
                                me.log(i18.t('warnings.withCategory', 'DeployHost.start().createServer()', `Invalid data length ${dataLength}`));
                                closeSocket();
                                return;
                            }
                            deploy_helpers.readSocket(socket, dataLength).then((msgBuff) => {
                                closeSocket();
                                if (msgBuff.length !== dataLength) { // non-exptected data length
                                    me.log(i18.t('warnings.withCategory', 'DeployHost.start().createServer()', `Invalid buffer length ${msgBuff.length}`));
                                    return;
                                }
                                let completed = (err, file) => {
                                    if (err) {
                                        let failMsg = '';
                                        if (file) {
                                            failMsg += `'${deploy_helpers.toStringSafe(file)}'; `;
                                        }
                                        failMsg += deploy_helpers.toStringSafe(err);
                                        me.outputChannel.appendLine(i18.t('host.receiveFile.failed', failMsg));
                                    }
                                    else {
                                        let okMsg = '';
                                        if (file) {
                                            okMsg = `: '${deploy_helpers.toStringSafe(file)}'`;
                                        }
                                        me.outputChannel.appendLine(i18.t('host.receiveFile.ok', okMsg));
                                    }
                                };
                                // restore "transformered" JSON message
                                try {
                                    let jsonTransformerCtx = {
                                        globals: me.deployer.getGlobals(),
                                        remote: remoteClient,
                                        type: TransformationType.Message,
                                    };
                                    let jtCtx = {
                                        context: jsonTransformerCtx,
                                        data: msgBuff,
                                        emitGlobal: function () {
                                            return me.deployer
                                                .emit
                                                .apply(me.deployer, arguments);
                                        },
                                        globals: me.deployer.getGlobals(),
                                        mode: deploy_contracts.DataTransformerMode.Restore,
                                        options: jsonTransformerOpts,
                                        replaceWithValues: (val) => {
                                            return me.deployer.replaceWithValues(val);
                                        },
                                        require: function (id) {
                                            return require(id);
                                        },
                                    };
                                    let jtResult = Promise.resolve(jsonTransformer(jtCtx));
                                    jtResult.then((untransformedMsgBuff) => {
                                        try {
                                            let json = untransformedMsgBuff.toString('utf8');
                                            let file;
                                            if (json) {
                                                file = JSON.parse(json);
                                            }
                                            if (file) {
                                                // output that we are receiving a file...
                                                let fileInfo = '';
                                                if (!deploy_helpers.isNullOrUndefined(file.nr)) {
                                                    let fileNr = parseInt(deploy_helpers.toStringSafe(file.nr));
                                                    if (!isNaN(fileNr)) {
                                                        fileInfo += ` (${fileNr}`;
                                                        if (!deploy_helpers.isNullOrUndefined(file.totalCount)) {
                                                            let totalCount = parseInt(deploy_helpers.toStringSafe(file.totalCount));
                                                            if (!isNaN(totalCount)) {
                                                                fileInfo += ` / ${totalCount}`;
                                                                if (0 !== totalCount) {
                                                                    let percentage = Math.floor(fileNr / totalCount * 10000.0) / 100.0;
                                                                    fileInfo += `; ${percentage}%`;
                                                                }
                                                            }
                                                        }
                                                        fileInfo += ")";
                                                    }
                                                }
                                                let receiveFileMsg = i18.t('host.receiveFile.receiving', remoteClient.address, remoteClient.port, fileInfo);
                                                me.outputChannel.append(receiveFileMsg);
                                                file.name = deploy_helpers.toStringSafe(file.name);
                                                file.name = deploy_helpers.replaceAllStrings(file.name, Path.sep, '/');
                                                if (file.name) {
                                                    let fileCompleted = (err) => {
                                                        completed(err, file.name);
                                                    };
                                                    try {
                                                        let base64 = deploy_helpers.toStringSafe(file.data);
                                                        let data;
                                                        if (base64) {
                                                            data = new Buffer(base64, 'base64');
                                                        }
                                                        else {
                                                            data = Buffer.alloc(0);
                                                        }
                                                        file.data = data;
                                                        let targetFile = Path.join(dir, file.name);
                                                        let handleData = function (data) {
                                                            try {
                                                                while (0 === file.name.indexOf('/')) {
                                                                    file.name = file.name.substr(1);
                                                                }
                                                                if (file.name) {
                                                                    let targetDir = Path.dirname(targetFile);
                                                                    let copyFile = () => {
                                                                        try {
                                                                            FS.writeFile(targetFile, file.data, (err) => {
                                                                                if (err) {
                                                                                    fileCompleted(err);
                                                                                    return;
                                                                                }
                                                                                fileCompleted();
                                                                            });
                                                                        }
                                                                        catch (e) {
                                                                            fileCompleted(e);
                                                                        }
                                                                    };
                                                                    // check if targetDir is a directory
                                                                    let checkIfTargetDirIsDir = () => {
                                                                        FS.lstat(targetDir, (err, stats) => {
                                                                            if (err) {
                                                                                fileCompleted(err);
                                                                                return;
                                                                            }
                                                                            if (stats.isDirectory()) {
                                                                                copyFile(); // yes, continue...
                                                                            }
                                                                            else {
                                                                                // no => ERROR
                                                                                fileCompleted(new Error(i18.t('isNo.directory', targetDir)));
                                                                            }
                                                                        });
                                                                    };
                                                                    // check if targetDir exists
                                                                    let checkIfTargetDirExists = () => {
                                                                        FS.exists(targetDir, (exists) => {
                                                                            if (exists) {
                                                                                // yes, continue...
                                                                                checkIfTargetDirIsDir();
                                                                            }
                                                                            else {
                                                                                // no, try to create
                                                                                FSExtra.mkdirs(targetDir, function (err) {
                                                                                    if (err) {
                                                                                        fileCompleted(err);
                                                                                        return;
                                                                                    }
                                                                                    checkIfTargetDirIsDir();
                                                                                });
                                                                            }
                                                                        });
                                                                    };
                                                                    FS.exists(targetFile, (exists) => {
                                                                        if (exists) {
                                                                            try {
                                                                                FS.lstat(targetFile, (err, stats) => {
                                                                                    if (err) {
                                                                                        fileCompleted(err);
                                                                                        return;
                                                                                    }
                                                                                    if (stats.isFile()) {
                                                                                        FS.unlink(targetFile, (err) => {
                                                                                            if (err) {
                                                                                                fileCompleted(err);
                                                                                                return;
                                                                                            }
                                                                                            checkIfTargetDirExists();
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        fileCompleted(new Error(i18.t('isNo.file', targetFile)));
                                                                                    }
                                                                                });
                                                                            }
                                                                            catch (e) {
                                                                                fileCompleted(e);
                                                                            }
                                                                        }
                                                                        else {
                                                                            checkIfTargetDirExists();
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    fileCompleted(new Error(i18.t('host.errors.noFilename', 2)));
                                                                }
                                                                // if (file.name) #2
                                                            }
                                                            catch (e) {
                                                                fileCompleted(e);
                                                            }
                                                        }; // handleData()
                                                        let validateFile = () => {
                                                            let validatorCtx = {
                                                                globals: me.deployer.getGlobals(),
                                                                remote: remoteClient,
                                                                target: targetFile,
                                                            };
                                                            let validatorArgs = {
                                                                context: validatorCtx,
                                                                emitGlobal: function () {
                                                                    return me.deployer
                                                                        .emit
                                                                        .apply(me.deployer, arguments);
                                                                },
                                                                globals: me.deployer.getGlobals(),
                                                                options: validatorOpts,
                                                                require: function (id) {
                                                                    return require(id);
                                                                },
                                                                replaceWithValues: (v) => me.deployer.replaceWithValues(v),
                                                                value: file,
                                                            };
                                                            try {
                                                                let updateTargetFile = (action) => {
                                                                    let vc = validatorArgs.context;
                                                                    if (vc) {
                                                                        if (!deploy_helpers.isEmptyString(vc.target)) {
                                                                            targetFile = vc.target;
                                                                        }
                                                                    }
                                                                    if (!Path.isAbsolute(targetFile)) {
                                                                        targetFile = Path.join(deploy_workspace.getRootPath(), targetFile);
                                                                    }
                                                                    action();
                                                                }; // updateTargetFile()
                                                                // check if file is valid
                                                                validator(validatorArgs).then((isValid) => {
                                                                    if (isValid) {
                                                                        updateTargetFile(() => {
                                                                            handleData(file.data);
                                                                        });
                                                                    }
                                                                    else {
                                                                        // no => rejected
                                                                        updateTargetFile(() => {
                                                                            fileCompleted(new Error(i18.t('host.errors.fileRejected', file.name)));
                                                                        });
                                                                    }
                                                                }).catch((err) => {
                                                                    fileCompleted(err);
                                                                });
                                                            }
                                                            catch (e) {
                                                                fileCompleted(e);
                                                            }
                                                        }; // validateFile
                                                        let untransformTheData = function (data) {
                                                            if (arguments.length > 0) {
                                                                file.data = data;
                                                            }
                                                            try {
                                                                let transformerCtx = {
                                                                    file: file,
                                                                    globals: me.deployer.getGlobals(),
                                                                    remote: remoteClient,
                                                                    type: TransformationType.FileData,
                                                                };
                                                                let tCtx = {
                                                                    context: transformerCtx,
                                                                    data: file.data,
                                                                    emitGlobal: function () {
                                                                        return me.deployer
                                                                            .emit
                                                                            .apply(me.deployer, arguments);
                                                                    },
                                                                    globals: me.deployer.getGlobals(),
                                                                    require: function (id) {
                                                                        return require(id);
                                                                    },
                                                                    replaceWithValues: (val) => {
                                                                        return me.deployer.replaceWithValues(val);
                                                                    },
                                                                    mode: deploy_contracts.DataTransformerMode.Restore,
                                                                    options: transformerOpts,
                                                                };
                                                                let tResult = Promise.resolve(transformer(tCtx));
                                                                tResult.then((untransformedData) => {
                                                                    file.data = untransformedData;
                                                                    validateFile();
                                                                }).catch((err) => {
                                                                    fileCompleted(err);
                                                                });
                                                            }
                                                            catch (e) {
                                                                fileCompleted(e);
                                                            }
                                                        }; // untransformTheData()
                                                        if (file.isCompressed) {
                                                            ZLib.gunzip(file.data, (err, uncompressedData) => {
                                                                if (err) {
                                                                    fileCompleted(err);
                                                                    return;
                                                                }
                                                                untransformTheData(uncompressedData);
                                                            });
                                                        }
                                                        else {
                                                            untransformTheData();
                                                        }
                                                    }
                                                    catch (e) {
                                                        fileCompleted(e);
                                                    }
                                                }
                                                else {
                                                    completed(new Error(i18.t('host.errors.noFilename', 1)));
                                                }
                                                // if (file.name) #1
                                            }
                                            else {
                                                completed(new Error(i18.t('host.errors.noData')));
                                            }
                                            // if (file)
                                        }
                                        catch (e) {
                                            completed(e);
                                        }
                                    }).catch((err) => {
                                        completed(err);
                                    });
                                }
                                catch (e) {
                                    completed(e);
                                }
                            }).catch((err) => {
                                me.log(i18.t('errors.withCategory', 'DeployHost.start().createServer(3)', err));
                                closeSocket();
                            });
                        }).catch((err) => {
                            me.log(i18.t('errors.withCategory', 'DeployHost.start().createServer(4)', err));
                            closeSocket();
                        });
                    }
                    catch (e) {
                        me.log(i18.t('errors.withCategory', 'DeployHost.start().createServer(5)', e));
                        closeSocket();
                    }
                }; // startReading()
                let checkIfDirIsDirectory = () => {
                    // now check if directory
                    FS.lstat(dir, (err, stats) => {
                        if (err) {
                            showError(err);
                            return;
                        }
                        if (stats.isDirectory()) {
                            startReading(); // all is fine => start reading
                        }
                        else {
                            showError(new Error(i18.t('isNo.directory', dir)));
                        }
                    });
                }; // checkIfDirIsDirectory()
                // first check if target directory does exist
                FS.exists(dir, (exists) => {
                    if (exists) {
                        checkIfDirIsDirectory();
                    }
                    else {
                        // directory does not exist => create
                        FSExtra.mkdirs(dir, function (err) {
                            if (err) {
                                showError(err);
                                return;
                            }
                            checkIfDirIsDirectory();
                        });
                    }
                });
            });
            server.on('listening', (err) => {
                if (err) {
                    startCompleted(err);
                }
                else {
                    try {
                        me._server = server;
                        startCompleted();
                    }
                    catch (e) {
                        startCompleted(e);
                    }
                }
            });
            server.on('error', (err) => {
                if (err) {
                    startCompleted(err);
                }
            });
            try {
                // start listening
                server.listen(port);
            }
            catch (e) {
                startCompleted(e);
            }
        });
    }
    /**
     * Stops the host.
     *
     * @returns {Promise<any>} The promise.
     */
    stop() {
        let me = this;
        return new Promise((resolve, reject) => {
            let stopCompleted = (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(me);
                }
            };
            let srv = me._server;
            if (!srv) {
                stopCompleted(); // already stopped / not running
                return;
            }
            srv.close((err) => {
                if (!err) {
                    me._server = null;
                }
                stopCompleted(err);
            });
        });
    }
}
exports.DeployHost = DeployHost;
//# sourceMappingURL=host.js.map