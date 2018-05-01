"use strict";
/// <reference types="node" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The MIT License (MIT)
// 
// vs-deploy (https://github.com/mkloubert/vs-deploy)
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
const deploy_contracts = require("../contracts");
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const deploy_values = require("../values");
const deploy_workspace = require("../workspace");
const FS = require("fs");
const i18 = require("../i18");
const Moment = require("moment");
const Path = require("path");
const SFTP = require('ssh2-sftp-client');
const sshpk = require("sshpk");
const TMP = require("tmp");
const vscode = require("vscode");
const Workflows = require("node-workflows");
const MODE_PAD = '000';
const TOUCH_TIME_FORMAT = 'YYYYMMDDHHmm.ss';
function toHashSafe(hash) {
    return deploy_helpers.normalizeString(hash);
}
function toSFTPPath(path) {
    return deploy_helpers.replaceAllStrings(path, Path.sep, '/');
}
class SFtpPlugin extends deploy_objects.DeployPluginWithContextBase {
    applyExecActionsToWorkflow(eventName, ctx, wf, commands, values) {
        let me = this;
        let commandsToExecute = deploy_helpers.asArray(commands)
            .map((x, i) => {
            if ('object' !== typeof x) {
                x = {
                    command: deploy_helpers.toStringSafe(x),
                };
            }
            x = deploy_helpers.cloneObject(x);
            x.__index = i;
            return x;
        })
            .filter(x => !deploy_helpers.isEmptyString(x.command));
        const ALL_VALUES = deploy_helpers.asArray(values)
            .filter(v => v);
        if (ctx.executionValues) {
            for (let p in ctx.executionValues) {
                ALL_VALUES.push(new deploy_values.StaticValue({
                    name: p,
                    value: ctx.executionValues[p],
                }));
            }
        }
        commandsToExecute.forEach(uc => {
            wf.next(() => {
                return new Promise((resolve, reject) => {
                    try {
                        let cmd = me.context.replaceWithValues(uc.command);
                        cmd = deploy_values.replaceWithValues(ALL_VALUES, cmd);
                        const OUTPUT_CHANNEL = me.context.outputChannel();
                        const VERBOSE = deploy_helpers.toBooleanSafe(uc.verbose);
                        const WRITE_OUTPUT_TO = deploy_helpers.toStringSafe(uc.writeOutputTo).trim();
                        let outputEnc = deploy_helpers.normalizeString(uc.outputEncoding);
                        if ('' === outputEnc) {
                            outputEnc = 'utf8';
                        }
                        let client = ctx.connection.client;
                        OUTPUT_CHANNEL.appendLine('');
                        OUTPUT_CHANNEL.appendLine(`[SSH command :: ${deploy_helpers.toStringSafe(eventName)} :: #${uc.__index + 1}] Executing '${deploy_helpers.toStringSafe(cmd)}'...`);
                        const NO_OUTPUT = deploy_helpers.toBooleanSafe(uc.noOutput, ctx.noCommandOutput);
                        let execFunc = client['exec'];
                        let execArgs = [
                            cmd,
                            function (err, stream) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                let commandResult = Buffer.alloc(0);
                                let outputFinishedInvoked = false;
                                const OUTPUT_FINISHED = (outputErr, cmdOutput) => {
                                    if (outputFinishedInvoked) {
                                        return;
                                    }
                                    outputFinishedInvoked = true;
                                    if (outputErr) {
                                        deploy_helpers.log(i18.t('errors.withCategory', 'plugins.sftp.applyExecActionsToWorkflow(1)', outputErr));
                                    }
                                    try {
                                        let valueToWrite = deploy_helpers.toStringSafe(cmdOutput);
                                        if ('' !== WRITE_OUTPUT_TO) {
                                            try {
                                                const EXECUTE_BEFORE_WRITE_OUTPUT_TO = deploy_helpers.toStringSafe(uc.executeBeforeWriteOutputTo);
                                                if ('' !== EXECUTE_BEFORE_WRITE_OUTPUT_TO.trim()) {
                                                    // execute JavaScript code
                                                    // BEFORE write output as placeholder
                                                    const CODE_VALUE = new deploy_values.CodeValue({
                                                        name: '',
                                                        code: EXECUTE_BEFORE_WRITE_OUTPUT_TO,
                                                        type: "code",
                                                    });
                                                    const CURRENT_OUTPUT_VALUE = new deploy_values.StaticValue({
                                                        name: WRITE_OUTPUT_TO,
                                                        value: valueToWrite,
                                                    });
                                                    CODE_VALUE.otherValueProvider = () => {
                                                        return ALL_VALUES.concat([CURRENT_OUTPUT_VALUE]);
                                                    };
                                                    valueToWrite = CODE_VALUE.value;
                                                }
                                            }
                                            catch (e) {
                                                deploy_helpers.log(i18.t('errors.withCategory', 'plugins.sftp.applyExecActionsToWorkflow(2)', e));
                                            }
                                            ctx.executionValues[WRITE_OUTPUT_TO] = valueToWrite;
                                        }
                                        if (VERBOSE) {
                                            OUTPUT_CHANNEL.append(deploy_helpers.toStringSafe(valueToWrite));
                                        }
                                    }
                                    catch (e) {
                                        deploy_helpers.log(i18.t('errors.withCategory', 'plugins.sftp.applyExecActionsToWorkflow(3)', e));
                                    }
                                    finally {
                                        resolve();
                                    }
                                };
                                // try get execution result
                                try {
                                    if (NO_OUTPUT) {
                                        OUTPUT_FINISHED(null); // skip
                                    }
                                    else {
                                        stream.once('error', (streamErr) => {
                                            OUTPUT_FINISHED(streamErr);
                                        });
                                        stream.once('end', () => {
                                            try {
                                                OUTPUT_FINISHED(null, commandResult.toString(outputEnc));
                                            }
                                            catch (e) {
                                                OUTPUT_FINISHED(e);
                                            }
                                        });
                                        stream.on('data', (data) => {
                                            try {
                                                if (!Buffer.isBuffer(data)) {
                                                    data = new Buffer(deploy_helpers.toStringSafe(data), outputEnc);
                                                }
                                                if (data.length > 0) {
                                                    commandResult = Buffer.concat([commandResult, data]);
                                                }
                                            }
                                            catch (e) {
                                                OUTPUT_FINISHED(e);
                                            }
                                        });
                                    }
                                }
                                catch (e) {
                                    OUTPUT_FINISHED(e);
                                }
                            },
                        ];
                        execFunc.apply(client, execArgs);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }
    get canGetFileInfo() {
        return true;
    }
    get canPull() {
        return true;
    }
    createContext(target, files, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            let completed = (err, conn) => {
                if (err) {
                    reject(err);
                }
                else {
                    let dataTransformer;
                    if (target.unix) {
                        if (deploy_helpers.toBooleanSafe(target.unix.convertCRLF)) {
                            let textEnc = deploy_helpers.normalizeString(target.unix.encoding);
                            if ('' === textEnc) {
                                textEnc = 'ascii';
                            }
                            dataTransformer = (ctx) => {
                                return new Promise((resolve2, reject2) => {
                                    let completed2 = deploy_helpers.createSimplePromiseCompletedAction(resolve2, reject2);
                                    deploy_helpers.isBinaryContent(ctx.data).then((isBinary) => {
                                        try {
                                            let newData = ctx.data;
                                            if (!isBinary) {
                                                // seems to be a text file
                                                newData = new Buffer(deploy_helpers.replaceAllStrings(newData.toString(textEnc), "\r\n", "\n"), textEnc);
                                            }
                                            completed2(null, newData);
                                        }
                                        catch (e) {
                                            completed2(e);
                                        }
                                    }).catch((err2) => {
                                        completed2(err2);
                                    });
                                });
                            };
                        }
                    }
                    let ctx = {
                        cachedRemoteDirectories: {},
                        connection: conn,
                        dataTransformer: deploy_helpers.toDataTransformerSafe(dataTransformer),
                        executionValues: {},
                        hasCancelled: deploy_helpers.isNullOrUndefined(conn),
                        noCommandOutput: deploy_helpers.toBooleanSafe(target.noCommandOutput, true),
                        user: user,
                    };
                    me.onCancelling(() => ctx.hasCancelled = true, opts);
                    let connectionEstablishWorkflow = Workflows.create();
                    let connectionValues = [];
                    // user
                    connectionValues.push(new deploy_values.StaticValue({
                        name: 'user',
                        value: ctx.user,
                    }));
                    let appendTimeValue = (name, timeValue) => {
                        connectionValues.push(new deploy_values.StaticValue({
                            name: name + '_iso',
                            value: Moment(timeValue).toISOString(),
                        }));
                        connectionValues.push(new deploy_values.StaticValue({
                            name: name + '_iso_utc',
                            value: Moment(timeValue).utc().toISOString(),
                        }));
                        connectionValues.push(new deploy_values.StaticValue({
                            name: name + '_touch',
                            value: Moment(timeValue).format(TOUCH_TIME_FORMAT),
                        }));
                        connectionValues.push(new deploy_values.StaticValue({
                            name: name + '_touch_utc',
                            value: Moment(timeValue).utc().format(TOUCH_TIME_FORMAT),
                        }));
                        connectionValues.push(new deploy_values.StaticValue({
                            name: name + '_unix',
                            value: Moment(timeValue).unix(),
                        }));
                        connectionValues.push(new deploy_values.StaticValue({
                            name: name + '_unix_utc',
                            value: Moment(timeValue).utc().unix(),
                        }));
                    };
                    connectionEstablishWorkflow.next((cewfCtx) => {
                        let wrapper = {
                            context: ctx,
                            destroy: function () {
                                return new Promise((resolve2, reject2) => {
                                    delete ctx.cachedRemoteDirectories;
                                    let closingConnectionWorkflow = Workflows.create();
                                    // setup "close" time
                                    connectionEstablishWorkflow.next(() => {
                                        appendTimeValue('close_time', new Date());
                                    });
                                    // commands to execute BEFORE connection is closed
                                    me.applyExecActionsToWorkflow('closing', ctx, closingConnectionWorkflow, target.closing, connectionValues);
                                    closingConnectionWorkflow.next(() => {
                                        if (conn) {
                                            conn.end();
                                        }
                                    });
                                    closingConnectionWorkflow.start().then(() => {
                                        resolve2(conn);
                                    }).catch((e) => {
                                        reject2(e);
                                    });
                                });
                            },
                        };
                        cewfCtx.result = wrapper;
                    });
                    // setup "connection" time
                    connectionEstablishWorkflow.next(() => {
                        appendTimeValue('connected_time', new Date());
                    });
                    // commands to execute after
                    // connection has been established
                    me.applyExecActionsToWorkflow('connected', ctx, connectionEstablishWorkflow, target.connected, connectionValues);
                    connectionEstablishWorkflow.start().then((wrapper) => {
                        resolve(wrapper);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            };
            // host & TCP port
            let host = deploy_helpers.toStringSafe(target.host, deploy_contracts.DEFAULT_HOST);
            let port = parseInt(deploy_helpers.toStringSafe(target.port, '22').trim());
            // username and password
            let user = deploy_helpers.toStringSafe(target.user);
            if ('' === user) {
                user = undefined;
            }
            let pwd = deploy_helpers.toStringSafe(target.password);
            if ('' === pwd) {
                pwd = undefined;
            }
            // supported hashes
            let hashes = deploy_helpers.asArray(target.hashes)
                .map(x => toHashSafe(x))
                .filter(x => '' !== x);
            hashes = deploy_helpers.distinctArray(hashes);
            let hashAlgo = toHashSafe(target.hashAlgorithm);
            if ('' === hashAlgo) {
                hashAlgo = 'md5';
            }
            let privateKeyFile = deploy_helpers.toStringSafe(target.privateKey);
            privateKeyFile = me.context.replaceWithValues(privateKeyFile);
            if ('' !== privateKeyFile.trim()) {
                if (!Path.isAbsolute(privateKeyFile)) {
                    privateKeyFile = Path.join(deploy_workspace.getRootPath(), privateKeyFile);
                }
            }
            let agent = deploy_helpers.toStringSafe(target.agent);
            agent = me.context.replaceWithValues(agent);
            if ('' === agent.trim()) {
                agent = undefined;
            }
            let agentForward = deploy_helpers.toBooleanSafe(target.agentForward);
            let tryKeyboard = deploy_helpers.toBooleanSafe(target.tryKeyboard);
            let readyTimeout = parseInt(deploy_helpers.toStringSafe(target.readyTimeout).trim());
            if (isNaN(readyTimeout)) {
                readyTimeout = undefined;
            }
            let privateKeyPassphrase = deploy_helpers.toStringSafe(target.privateKeyPassphrase);
            if ('' === privateKeyPassphrase) {
                privateKeyPassphrase = undefined;
            }
            try {
                let privateKey;
                let openConnection = () => {
                    if (!privateKey) {
                        if (!user) {
                            user = 'anonymous';
                        }
                    }
                    let conn = new SFTP();
                    if (tryKeyboard) {
                        conn.client.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
                            try {
                                finish([pwd]);
                            }
                            catch (e) {
                                deploy_helpers.log(i18.t('errors.withCategory', 'plugins.sftp.keyboard-interactive', e));
                            }
                        });
                    }
                    conn.connect({
                        host: host,
                        port: port,
                        username: user,
                        password: pwd,
                        privateKey: privateKey,
                        passphrase: privateKeyPassphrase,
                        hostHash: hashAlgo,
                        hostVerifier: (hashedKey, cb) => {
                            hashedKey = toHashSafe(hashedKey);
                            if (hashes.length < 1) {
                                return true;
                            }
                            return hashes.indexOf(hashedKey) > -1;
                        },
                        agent: agent,
                        agentForward: agentForward,
                        tryKeyboard: tryKeyboard,
                        readyTimeout: readyTimeout,
                    }).then(() => {
                        completed(null, conn);
                    }).catch((err) => {
                        completed(err);
                    });
                };
                let setupPrivateKeyIfNeeded = () => {
                    try {
                        if (privateKey) {
                            let privateKeySourceFormat = deploy_helpers.toStringSafe(me.context.replaceWithValues(target.privateKeySourceFormat));
                            privateKeySourceFormat = privateKeySourceFormat.trim();
                            if ('' !== privateKeySourceFormat) {
                                let privateKeyTargetFormat = deploy_helpers.toStringSafe(me.context.replaceWithValues(target.privateKeyTargetFormat));
                                privateKeyTargetFormat = privateKeyTargetFormat.trim();
                                if ('' === privateKeyTargetFormat) {
                                    privateKeyTargetFormat = 'ssh';
                                }
                                const OPTS = {
                                    'filename': privateKeyFile,
                                    'passphrase': privateKeyPassphrase,
                                };
                                privateKey = sshpk.parsePrivateKey(privateKey, privateKeySourceFormat, OPTS)
                                    .toBuffer(privateKeyTargetFormat, OPTS);
                            }
                        }
                        openConnection();
                    }
                    catch (e) {
                        completed(e);
                    }
                };
                let askForPasswordIfNeeded = (defaultValueForShowPasswordPrompt, passwordGetter, passwordSetter, cacheKey) => {
                    let showPasswordPrompt = false;
                    if (!deploy_helpers.isEmptyString(user) && deploy_helpers.isNullOrUndefined(passwordGetter())) {
                        // user defined, but no password
                        let pwdFromCache = deploy_helpers.toStringSafe(me.context.targetCache().get(target, cacheKey));
                        if ('' === pwdFromCache) {
                            // nothing in cache
                            showPasswordPrompt = deploy_helpers.toBooleanSafe(target.promptForPassword, defaultValueForShowPasswordPrompt);
                        }
                        else {
                            passwordSetter(pwdFromCache);
                        }
                    }
                    if (showPasswordPrompt) {
                        vscode.window.showInputBox({
                            ignoreFocusOut: true,
                            placeHolder: i18.t('prompts.inputPassword'),
                            password: true,
                        }).then((passwordFromUser) => {
                            if ('undefined' === typeof passwordFromUser) {
                                completed(null, null); // cancelled
                            }
                            else {
                                passwordSetter(passwordFromUser);
                                me.context.targetCache().set(target, cacheKey, passwordFromUser);
                                setupPrivateKeyIfNeeded();
                            }
                        }, (err) => {
                            completed(err);
                        });
                    }
                    else {
                        setupPrivateKeyIfNeeded();
                    }
                };
                if (deploy_helpers.isNullUndefinedOrEmptyString(privateKeyFile)) {
                    askForPasswordIfNeeded(true, () => pwd, (pwdToSet) => pwd = pwdToSet, 'password');
                }
                else {
                    // try read private key
                    FS.readFile(privateKeyFile, (err, data) => {
                        if (err) {
                            completed(err);
                            return;
                        }
                        privateKey = data;
                        askForPasswordIfNeeded(false, () => privateKeyPassphrase, (pwdToSet) => privateKeyPassphrase = pwdToSet, 'privateKeyPassphrase');
                    });
                }
            }
            catch (e) {
                completed(e); // global error
            }
        });
    }
    deployFileWithContext(ctx, file, target, opts) {
        let me = this;
        let completed = (err) => {
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: ctx.hasCancelled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        if (ctx.hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            let relativeFilePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
            if (false === relativeFilePath) {
                completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                return;
            }
            let dir = me.getDirFromTarget(target);
            let targetFile = toSFTPPath(Path.join(dir, relativeFilePath));
            let targetDirectory = toSFTPPath(Path.dirname(targetFile));
            let getModeValue = (pathVal) => {
                let mode;
                if (!deploy_helpers.isNullOrUndefined(target.modes)) {
                    let asOctalNumber = (val) => {
                        if (deploy_helpers.isNullUndefinedOrEmptyString(val)) {
                            return;
                        }
                        return parseInt(deploy_helpers.toStringSafe(val).trim(), 8);
                    };
                    if ('object' === typeof target.modes) {
                        for (let p in target.modes) {
                            let r = new RegExp(p);
                            if (r.test(deploy_helpers.toStringSafe(pathVal))) {
                                mode = asOctalNumber(target.modes[p]);
                            }
                        }
                    }
                    else {
                        // handle as string or number
                        mode = asOctalNumber(target.modes);
                    }
                }
                if (deploy_helpers.isNullUndefinedOrEmptyString(mode)) {
                    mode = undefined;
                }
                return mode;
            };
            let putOpts = {};
            putOpts['mode'] = getModeValue(targetFile);
            if (deploy_helpers.toBooleanSafe(target.updateModesOfDirectories)) {
                putOpts['dirMode'] = getModeValue(targetDirectory);
            }
            // upload the file
            let uploadFile = (initDirCache) => {
                if (ctx.hasCancelled) {
                    completed(); // cancellation requested
                    return;
                }
                if (deploy_helpers.toBooleanSafe(initDirCache)) {
                    ctx.cachedRemoteDirectories[targetDirectory] = [];
                }
                FS.readFile(file, (err, untransformedJsonData) => {
                    if (err) {
                        completed(err);
                        return;
                    }
                    try {
                        let subCtx = {
                            file: file,
                            remoteFile: relativeFilePath,
                            sftp: ctx,
                        };
                        let dtCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx);
                        dtCtx.data = untransformedJsonData;
                        let dtResult = Promise.resolve(ctx.dataTransformer(dtCtx));
                        dtResult.then((transformedData) => {
                            try {
                                let subCtx2 = {
                                    file: file,
                                    remoteFile: relativeFilePath,
                                    sftp: ctx,
                                };
                                let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx2);
                                tCtx.data = transformedData;
                                let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                                Promise.resolve(tResult).then((dataToUpload) => {
                                    let putWorkflow = Workflows.create();
                                    let putValues = [];
                                    // get information of the local file
                                    putWorkflow.next((wfCtx) => {
                                        return new Promise((resolve, reject) => {
                                            FS.lstat(file, (err, stats) => {
                                                if (err) {
                                                    reject(err);
                                                }
                                                else {
                                                    let ftu = {
                                                        localPath: file,
                                                        stats: stats,
                                                        values: putValues,
                                                    };
                                                    wfCtx.value = ftu;
                                                    resolve();
                                                }
                                            });
                                        });
                                    });
                                    // "time" values
                                    putWorkflow.next((wfCtx) => {
                                        let ftu = wfCtx.value;
                                        let timeProperties = ['ctime', 'atime', 'mtime', 'birthtime'];
                                        timeProperties.forEach(tp => {
                                            let timeValue = ftu.stats[tp];
                                            if (!timeValue) {
                                                return;
                                            }
                                            ftu.values.push(new deploy_values.StaticValue({
                                                name: tp + '_iso',
                                                value: Moment(timeValue).toISOString(),
                                            }));
                                            ftu.values.push(new deploy_values.StaticValue({
                                                name: tp + '_iso_utc',
                                                value: Moment(timeValue).utc().toISOString(),
                                            }));
                                            ftu.values.push(new deploy_values.StaticValue({
                                                name: tp + '_touch',
                                                value: Moment(timeValue).format(TOUCH_TIME_FORMAT),
                                            }));
                                            ftu.values.push(new deploy_values.StaticValue({
                                                name: tp + '_touch_utc',
                                                value: Moment(timeValue).utc().format(TOUCH_TIME_FORMAT),
                                            }));
                                            ftu.values.push(new deploy_values.StaticValue({
                                                name: tp + '_unix',
                                                value: Moment(timeValue).unix(),
                                            }));
                                            ftu.values.push(new deploy_values.StaticValue({
                                                name: tp + '_unix_utc',
                                                value: Moment(timeValue).utc().unix(),
                                            }));
                                        });
                                        // GID & UID
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'gid',
                                            value: ftu.stats.gid,
                                        }));
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'uid',
                                            value: ftu.stats.uid,
                                        }));
                                        // file & directory
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'remote_file',
                                            value: targetFile,
                                        }));
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'remote_dir',
                                            value: targetDirectory,
                                        }));
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'remote_name',
                                            value: Path.basename(targetFile),
                                        }));
                                        let modeFull = ftu.stats.mode.toString(8);
                                        let modeDec = ftu.stats.mode.toString();
                                        let modeSmall = modeFull;
                                        modeSmall = MODE_PAD.substring(0, MODE_PAD.length - modeSmall.length) + modeSmall;
                                        if (modeSmall.length >= 3) {
                                            modeSmall = modeSmall.substr(-3, 3);
                                        }
                                        // mode
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'mode',
                                            value: modeSmall,
                                        }));
                                        // mode_full
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'mode_full',
                                            value: modeFull,
                                        }));
                                        // mode_decimal
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'mode_decimal',
                                            value: modeDec,
                                        }));
                                        // user
                                        ftu.values.push(new deploy_values.StaticValue({
                                            name: 'user',
                                            value: ctx.user,
                                        }));
                                    });
                                    let applyExecActions = (eventName, commands) => {
                                        me.applyExecActionsToWorkflow(eventName, ctx, putWorkflow, commands, putValues);
                                    };
                                    // commands to execute BEFORE the upload
                                    applyExecActions('beforeUpload', target.beforeUpload);
                                    // upload
                                    putWorkflow.next(() => {
                                        return new Promise((resolve, reject) => {
                                            ctx.connection.put(dataToUpload, targetFile).then(() => {
                                                if (deploy_helpers.isNullOrUndefined(putOpts['mode'])) {
                                                    resolve();
                                                }
                                                else {
                                                    ctx.connection.sftp.chmod(targetFile, putOpts['mode'], (err) => {
                                                        if (err) {
                                                            reject(err);
                                                        }
                                                        else {
                                                            resolve();
                                                        }
                                                    });
                                                }
                                            }).catch((e) => {
                                                reject(e);
                                            });
                                        });
                                    });
                                    // commands to execute AFTER the upload
                                    applyExecActions('uploaded', target.uploaded);
                                    putWorkflow.start().then(() => {
                                        completed();
                                    }).catch((e) => {
                                        completed(e);
                                    });
                                }).catch((e) => {
                                    completed(e);
                                });
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
                });
            };
            if (opts.onBeforeDeploy) {
                opts.onBeforeDeploy(me, {
                    destination: targetDirectory,
                    file: file,
                    target: target,
                });
            }
            let changeModForDirectory = (initDirCache) => {
                if (ctx.hasCancelled) {
                    completed(); // cancellation requested
                    return;
                }
                if (deploy_helpers.isNullUndefinedOrEmptyString(putOpts['dirMode'])) {
                    uploadFile(initDirCache);
                }
                else {
                    ctx.connection.sftp.chmod(targetDirectory, putOpts['dirMode'], (err) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            uploadFile(initDirCache);
                        }
                    });
                }
            };
            if (deploy_helpers.isNullOrUndefined(ctx.cachedRemoteDirectories[targetDirectory])) {
                // first check if target directory exists
                ctx.connection.list(targetDirectory).then(() => {
                    changeModForDirectory(true);
                }).catch((err) => {
                    // no => try to create
                    if (ctx.hasCancelled) {
                        completed(); // cancellation requested
                        return;
                    }
                    ctx.connection.mkdir(targetDirectory, true).then(() => {
                        changeModForDirectory(true);
                    }).catch((err) => {
                        completed(err);
                    });
                });
            }
            else {
                changeModForDirectory();
            }
        }
    }
    downloadFileWithContext(ctx, file, target, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            let completedInvoked = false;
            let completed = (err, data) => {
                if (completedInvoked) {
                    return;
                }
                completedInvoked = true;
                if (opts.onCompleted) {
                    opts.onCompleted(me, {
                        canceled: ctx.hasCancelled,
                        error: err,
                        file: file,
                        target: target,
                    });
                }
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            };
            if (ctx.hasCancelled) {
                completed(null); // cancellation requested
            }
            else {
                let relativeFilePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativeFilePath) {
                    completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                    return;
                }
                let dir = me.getDirFromTarget(target);
                let targetFile = toSFTPPath(Path.join(dir, relativeFilePath));
                let targetDirectory = toSFTPPath(Path.dirname(targetFile));
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(me, {
                        destination: targetDirectory,
                        file: file,
                        target: target,
                    });
                }
                ctx.connection.get(targetFile).then((data) => {
                    if (data) {
                        try {
                            data.once('error', (err) => {
                                ;
                                completed(err);
                            });
                            TMP.tmpName({
                                keep: true,
                            }, (err, tmpFile) => {
                                if (err) {
                                    completed(err);
                                }
                                else {
                                    let deleteTempFile = (err, data) => {
                                        // delete temp file ...
                                        FS.exists(tmpFile, (exists) => {
                                            if (exists) {
                                                // ... if exist
                                                FS.unlink(tmpFile, () => {
                                                    completed(err, data);
                                                });
                                            }
                                            else {
                                                completed(err, data);
                                            }
                                        });
                                    };
                                    let downloadCompleted = (err) => {
                                        if (err) {
                                            deleteTempFile(err);
                                        }
                                        else {
                                            FS.readFile(tmpFile, (err, transformedData) => {
                                                if (err) {
                                                    deleteTempFile(err);
                                                }
                                                else {
                                                    try {
                                                        let subCtx = {
                                                            file: file,
                                                            remoteFile: relativeFilePath,
                                                        };
                                                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Restore, subCtx);
                                                        tCtx.data = transformedData;
                                                        let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Restore)(tCtx);
                                                        Promise.resolve(tResult).then((untransformedJsonData) => {
                                                            deleteTempFile(null, untransformedJsonData);
                                                        }).catch((e) => {
                                                            deleteTempFile(e);
                                                        });
                                                    }
                                                    catch (e) {
                                                        deleteTempFile(e);
                                                    }
                                                }
                                            });
                                        }
                                    };
                                    try {
                                        // copy to temp file
                                        let pipe = data.pipe(FS.createWriteStream(tmpFile));
                                        pipe.once('error', (err) => {
                                            ;
                                            downloadCompleted(err);
                                        });
                                        data.once('end', () => {
                                            downloadCompleted(null);
                                        });
                                    }
                                    catch (e) {
                                        downloadCompleted(e);
                                    }
                                }
                            });
                        }
                        catch (e) {
                            completed(e);
                        }
                    }
                    else {
                        completed(new Error("No data!")); //TODO
                    }
                }).catch((err) => {
                    completed(err);
                });
            }
        });
    }
    getDirFromTarget(target) {
        let dir = this.context.replaceWithValues(target.dir);
        if (deploy_helpers.isEmptyString(dir)) {
            dir = '/';
        }
        return dir;
    }
    getFileInfoWithContext(ctx, file, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = this;
            let relativeFilePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
            if (false === relativeFilePath) {
                throw new Error(i18.t('relativePaths.couldNotResolve', file));
            }
            let dir = me.getDirFromTarget(target);
            let targetFile = toSFTPPath(Path.join(dir, relativeFilePath));
            let targetDirectory = toSFTPPath(Path.dirname(targetFile));
            let fileName = Path.basename(targetFile);
            let wf = Workflows.create();
            wf.on('action.after', function (err, wfCtx) {
                if (ctx.hasCancelled) {
                    wfCtx.finish();
                }
            });
            wf.next(() => __awaiter(this, void 0, void 0, function* () {
                let info = {
                    exists: false,
                    isRemote: true,
                };
                try {
                    let files = yield ctx.connection.list(targetDirectory);
                    let remoteInfo;
                    for (let i = 0; i < files.length; i++) {
                        let ri = files[i];
                        if (ri.name === fileName) {
                            remoteInfo = ri;
                            break;
                        }
                    }
                    if (remoteInfo) {
                        info.exists = true;
                        info.name = remoteInfo.name;
                        info.path = targetDirectory;
                        info.size = remoteInfo.size;
                        try {
                            if (!isNaN(remoteInfo.modifyTime)) {
                                info.modifyTime = Moment(new Date(remoteInfo.modifyTime));
                            }
                        }
                        catch (e) {
                            me.context.log(i18.t('errors.withCategory', 'SFtpPlugin.getFileInfoWithContext(modifyTime)', e));
                        }
                    }
                }
                catch (e) {
                    // does not exist here
                }
                return info;
            }));
            // write to result
            wf.next((wfCtx) => {
                let info = wfCtx.previousValue;
                wfCtx.result = info;
            });
            if (!ctx.hasCancelled) {
                return yield wf.start();
            }
        });
    }
    info() {
        return {
            description: i18.t('plugins.sftp.description'),
        };
    }
}
/**
 * Creates a new Plugin.
 *
 * @param {deploy_contracts.DeployContext} ctx The deploy context.
 *
 * @returns {deploy_contracts.DeployPlugin} The new instance.
 */
function createPlugin(ctx) {
    return new SFtpPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=sftp.js.map