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
const deploy_contracts = require("./contracts");
const deploy_globals = require("./globals");
const deploy_helpers = require("./helpers");
const FS = require("fs");
const i18 = require("./i18");
const Moment = require("moment");
const Path = require("path");
const vscode = require("vscode");
const Workflows = require("node-workflows");
const Zip = require('node-zip');
/**
 * A basic deploy plugin that is specially based on single
 * file operations (s. deployFile() method).
 */
class DeployPluginBase {
    /**
     * Initializes a new instance of that class.
     *
     * @param {deploy_contracts.DeployContext} [ctx] The underlying deploy context.
     */
    constructor(ctx) {
        this._context = ctx;
        deploy_globals.EVENTS.on(deploy_contracts.EVENT_CONFIG_RELOADED, this.onConfigReloaded);
    }
    /** @inheritdoc */
    get canGetFileInfo() {
        return false;
    }
    /** @inheritdoc */
    get canPull() {
        return false;
    }
    /** @inheritdoc */
    compareFiles(file, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = this;
            if (!opts) {
                opts = {};
            }
            let wf = Workflows.create();
            // get info about REMOTE file
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                return yield me.getFileInfo(file, target, opts);
            }));
            // check if local file exists
            wf.next((ctx) => {
                let right = ctx.previousValue;
                return new Promise((resolve, reject) => {
                    try {
                        let left = {
                            exists: undefined,
                            isRemote: false,
                        };
                        FS.exists(file, (exists) => {
                            left.exists = exists;
                            if (!left.exists) {
                                ctx.finish(); // no need to get local file info
                            }
                            let result = {
                                left: left,
                                right: right,
                            };
                            ctx.result = result;
                            resolve(result);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            // get local file info
            wf.next((ctx) => {
                let result = ctx.previousValue;
                return new Promise((resolve, reject) => {
                    FS.lstat(file, (err, stat) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            try {
                                result.left.name = Path.basename(file);
                                result.left.path = Path.dirname(file);
                                result.left.modifyTime = Moment(stat.ctime);
                                result.left.size = stat.size;
                                resolve(result);
                            }
                            catch (e) {
                                reject(e);
                            }
                        }
                    });
                });
            });
            return yield wf.start();
        });
    }
    /** @inheritdoc */
    compareWorkspace(files, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = this;
            let wf = Workflows.create();
            wf.next((ctx) => {
                ctx.result = [];
            });
            files.forEach(f => {
                wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                    let compareResult = yield me.compareFiles(f, target, opts);
                    ctx.result.push(compareResult);
                    return compareResult;
                }));
            });
            return yield wf.start();
        });
    }
    /**
     * Gets the underlying deploy context.
     */
    get context() {
        return this._context;
    }
    /**
     * Creates a basic data transformer context.
     *
     * @param {deploy_contracts.TransformableDeployTarget} target The target.
     * @param {deploy_contracts.DataTransformerMode} mode The mode.
     * @param {any} [subCtx] The "sub" context.
     */
    createDataTransformerContext(target, mode, subCtx = {}) {
        let me = this;
        return {
            context: subCtx,
            data: undefined,
            emitGlobal: function () {
                return me.context
                    .emitGlobal
                    .apply(me.context, arguments);
            },
            globals: me.context.globals(),
            mode: mode,
            options: deploy_helpers.cloneObject((target || {}).transformerOptions),
            replaceWithValues: (val) => {
                return me.context.replaceWithValues(val);
            },
            require: function (id) {
                return me.context.require(id);
            },
        };
    }
    /** @inheritdoc */
    deployWorkspace(files, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        let hasCancelled = false;
        let filesTodo = files.map(x => x);
        let completed = (err) => {
            filesTodo = [];
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    target: target,
                });
            }
        };
        hasCancelled = me.context.isCancelling();
        if (hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            try {
                let deployNextFile;
                let fileCompleted = function (sender, e) {
                    try {
                        if (opts.onFileCompleted) {
                            opts.onFileCompleted(sender, e);
                        }
                        hasCancelled = hasCancelled || deploy_helpers.toBooleanSafe(e.canceled);
                        if (hasCancelled) {
                            completed(); // cancellation requested
                        }
                        else {
                            deployNextFile();
                        }
                    }
                    catch (err) {
                        me.context.log(i18.t('errors.withCategory', 'DeployPluginBase.deployWorkspace(1)', err));
                    }
                };
                deployNextFile = () => {
                    if (filesTodo.length < 1) {
                        completed();
                        return;
                    }
                    let f = filesTodo.shift();
                    if (!f) {
                        completed();
                        return;
                    }
                    try {
                        me.deployFile(f, target, {
                            context: opts.context,
                            onBeforeDeploy: (sender, e) => {
                                if (opts.onBeforeDeployFile) {
                                    opts.onBeforeDeployFile(sender, e);
                                }
                            },
                            onCompleted: (sender, e) => {
                                fileCompleted(sender, e);
                            }
                        });
                    }
                    catch (e) {
                        fileCompleted(me, {
                            error: e,
                            file: f,
                            target: target,
                        });
                    }
                };
                deployNextFile();
            }
            catch (e) {
                completed(e);
            }
        }
    }
    /** @inheritdoc */
    dispose() {
        deploy_globals.EVENTS.removeListener(deploy_contracts.EVENT_CONFIG_RELOADED, this.onConfigReloaded);
    }
    /** @inheritdoc */
    downloadFile(file, target, opts) {
        throw new Error("Not implemented!");
    }
    /** @inheritdoc */
    getFileInfo(file, target, opts) {
        throw new Error("Not implemented!");
    }
    /**
     * Returns the others targets and their plugins.
     *
     * @param {deploy_contracts.DeployTarget} target The target for this plugin.
     * @param {string | string[]} otherTargets The list of names of the "others" targets.
     *
     * @return {deploy_contracts.DeployTargetWithPlugins[]} The targets and their plugins.
     */
    getTargetsWithPlugins(target, otherTargets) {
        let batchTargets = [];
        let normalizeString = (val) => {
            return deploy_helpers.normalizeString(val);
        };
        let myTargetName = normalizeString(target.name);
        let targetNames = deploy_helpers.asArray(otherTargets)
            .map(x => normalizeString(x))
            .filter(x => '' !== x);
        if (targetNames.indexOf(myTargetName) > -1) {
            // no recurrence!
            vscode.window.showWarningMessage(i18.t('targets.cannotUseRecurrence', myTargetName));
        }
        // prevent recurrence
        targetNames = targetNames.filter(x => x !== myTargetName);
        let knownTargets = this.context.targets();
        let knownPlugins = this.context.plugins();
        // first find targets by name
        let foundTargets = [];
        targetNames.forEach(tn => {
            let found = false;
            knownTargets.forEach(t => {
                if (normalizeString(t.name) === tn) {
                    found = true;
                    foundTargets.push(t);
                }
            });
            if (!found) {
                // we have an unknown target here
                vscode.window.showWarningMessage(i18.t('targets.notFound', tn));
            }
        });
        // now collect plugins for each
        // found target
        foundTargets.forEach(t => {
            let newBatchTarget = {
                plugins: [],
                target: t,
            };
            knownPlugins.forEach(pi => {
                let pluginType = normalizeString(pi.__type);
                if (!pluginType || (pluginType === normalizeString(t.type))) {
                    newBatchTarget.plugins
                        .push(pi);
                }
            });
            batchTargets.push(newBatchTarget);
        });
        return batchTargets;
    }
    /**
     * Loads a data transformer by target.

     * @param {TTarget} target The target.
     * @param {deploy_contracts.DataTransformerMode} mode The mode.
     * @param {(t: TTarget) => string} [scriptProvider] The custom logic to get the script path.
     *
     * @returns {deploy_contracts.DataTransformer} The loaded transformer.
     */
    loadDataTransformer(target, mode, scriptProvider) {
        if (!scriptProvider) {
            scriptProvider = (t) => t.transformer; // default
        }
        let transformer;
        let script = deploy_helpers.toStringSafe(scriptProvider(target));
        script = this.context.replaceWithValues(script);
        if (!deploy_helpers.isEmptyString(script)) {
            let scriptModule = deploy_helpers.loadDataTransformerModule(script);
            if (scriptModule) {
                switch (mode) {
                    case deploy_contracts.DataTransformerMode.Restore:
                        transformer = scriptModule.restoreData;
                        if (!transformer) {
                            transformer = scriptModule.transformData;
                        }
                        break;
                    case deploy_contracts.DataTransformerMode.Transform:
                        transformer = scriptModule.transformData;
                        if (!transformer) {
                            transformer = scriptModule.restoreData;
                        }
                        break;
                }
            }
        }
        return deploy_helpers.toDataTransformerSafe(transformer);
    }
    /**
     * Registers for a callback for a 'cancel' event that is called once.
     *
     * @param {deploy_contracts.EventHandler} callback The callback to register.
     * @param {deploy_contracts.DeployFileOptions | deploy_contracts.DeployWorkspaceOptions} [opts] The underlying options.
     */
    onCancelling(callback, opts) {
        let ctx;
        if (opts) {
            ctx = opts.context;
        }
        ctx = ctx || this.context;
        if (ctx) {
            ctx.once(deploy_contracts.EVENT_CANCEL_DEPLOY, callback);
        }
    }
    /**
     * Is invoked after app config has been reloaded.
     *
     * @param {deploy_contracts.DeployConfiguration} cfg The new config.
     */
    onConfigReloaded(cfg) {
    }
    /** @inheritdoc */
    pullFile(file, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        let hasCancelled = false;
        let completed = (err) => {
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        let downloadCompleted = (downloadedData) => {
            try {
                if (!downloadedData) {
                    downloadedData = Buffer.alloc(0);
                }
                if (hasCancelled) {
                    completed(null);
                }
                else {
                    FS.writeFile(file, downloadedData, (err) => {
                        completed(err);
                    });
                }
            }
            catch (e) {
                completed(e);
            }
        };
        me.onCancelling(() => hasCancelled = true);
        if (hasCancelled) {
            completed(null);
        }
        else {
            try {
                let result = this.downloadFile(file, target, {
                    baseDirectory: opts.baseDirectory,
                    context: opts.context,
                    onBeforeDeploy: opts.onBeforeDeploy,
                });
                if (result) {
                    if (hasCancelled) {
                        completed(null);
                    }
                    else {
                        if (Buffer.isBuffer(result)) {
                            downloadCompleted(result);
                        }
                        else {
                            result.then((d) => {
                                downloadCompleted(d);
                            }).catch((err) => {
                                completed(err);
                            });
                        }
                    }
                }
                else {
                    downloadCompleted(null);
                }
            }
            catch (e) {
                completed(e);
            }
        }
    }
    /** @inheritdoc */
    pullWorkspace(files, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        let hasCancelled = false;
        let filesTodo = files.map(x => x);
        let completed = (err) => {
            filesTodo = [];
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    target: target,
                });
            }
        };
        hasCancelled = me.context.isCancelling();
        if (hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            try {
                let pullNextFile;
                let fileCompleted = function (sender, e) {
                    try {
                        if (opts.onFileCompleted) {
                            opts.onFileCompleted(sender, e);
                        }
                        hasCancelled = hasCancelled || deploy_helpers.toBooleanSafe(e.canceled);
                        if (hasCancelled) {
                            completed(); // cancellation requested
                        }
                        else {
                            pullNextFile();
                        }
                    }
                    catch (err) {
                        me.context.log(i18.t('errors.withCategory', 'DeployPluginBase.pullWorkspace(1)', err));
                    }
                };
                pullNextFile = () => {
                    if (filesTodo.length < 1) {
                        completed();
                        return;
                    }
                    let f = filesTodo.shift();
                    if (!f) {
                        completed();
                        return;
                    }
                    try {
                        me.pullFile(f, target, {
                            context: opts.context,
                            onBeforeDeploy: (sender, e) => {
                                if (opts.onBeforeDeployFile) {
                                    opts.onBeforeDeployFile(sender, e);
                                }
                            },
                            onCompleted: (sender, e) => {
                                fileCompleted(sender, e);
                            }
                        });
                    }
                    catch (e) {
                        fileCompleted(me, {
                            error: e,
                            file: f,
                            target: target,
                        });
                    }
                };
                pullNextFile();
            }
            catch (e) {
                completed(e);
            }
        }
    }
}
exports.DeployPluginBase = DeployPluginBase;
/**
 * A basic deploy plugin that is specially based on multi
 * file operations (s. deployWorkspace() method).
 */
class MultiFileDeployPluginBase extends DeployPluginBase {
    /** @inheritdoc */
    deployFile(file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let completedInvoked = false;
        let completed = (sender, e) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            if (opts.onCompleted) {
                opts.onCompleted(sender, {
                    canceled: e.canceled,
                    error: e.error,
                    file: e.file,
                    target: e.target,
                });
            }
        };
        this.deployWorkspace([file], target, {
            context: opts.context,
            onBeforeDeployFile: (sender, e) => {
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(sender, {
                        destination: e.destination,
                        file: e.file,
                        target: e.target,
                    });
                }
            },
            onFileCompleted: (sender, e) => {
                completed(sender, e);
            },
            onCompleted: (sender, e) => {
                completed(sender, {
                    canceled: e.canceled,
                    error: e.error,
                    file: file,
                    target: e.target,
                });
            },
        });
    }
    /** @inheritdoc */
    pullFile(file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        let completedInvoked = false;
        let completed = (sender, e) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            if (opts.onCompleted) {
                opts.onCompleted(sender, {
                    canceled: e.canceled,
                    error: e.error,
                    file: e.file,
                    target: e.target,
                });
            }
        };
        this.pullWorkspace([file], target, {
            context: opts.context,
            onBeforeDeployFile: (sender, e) => {
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(sender, {
                        destination: e.destination,
                        file: e.file,
                        target: e.target,
                    });
                }
            },
            onFileCompleted: (sender, e) => {
                completed(sender, e);
            },
            onCompleted: (sender, e) => {
                completed(sender, {
                    canceled: e.canceled,
                    error: e.error,
                    file: file,
                    target: e.target,
                });
            },
        });
    }
    /** @inheritdoc */
    pullWorkspace(files, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        let hasCancelled = false;
        files.forEach(x => {
            hasCancelled = hasCancelled || me.context.isCancelling();
            if (opts.onBeforeDeployFile) {
                opts.onBeforeDeployFile(me, {
                    destination: null,
                    file: x,
                    target: target,
                });
            }
            if (opts.onFileCompleted) {
                opts.onFileCompleted(me, {
                    canceled: hasCancelled,
                    error: new Error("Not implemented!"),
                    file: x,
                    target: target,
                });
            }
        });
        hasCancelled = hasCancelled || me.context.isCancelling();
        if (opts.onCompleted) {
            opts.onCompleted(me, {
                canceled: hasCancelled,
                error: new Error("Not implemented!"),
                target: target,
            });
        }
    }
}
exports.MultiFileDeployPluginBase = MultiFileDeployPluginBase;
/**
 * A basic deploy plugin that is specially based on multi
 * file operations which uses a context, like a network connection (s. deployFileWithContext() method).
 */
class DeployPluginWithContextBase extends MultiFileDeployPluginBase {
    /** @inheritdoc */
    compareFiles(file, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        return new Promise((resolve, reject) => {
            let wrapper;
            let completed = (err, result) => {
                let finished = () => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                };
                me.destroyContext(wrapper).then(() => {
                    finished();
                }).catch(() => {
                    finished();
                });
            };
            let wf = Workflows.create();
            // create context
            wf.next((wfCtx) => __awaiter(this, void 0, void 0, function* () {
                wrapper = yield me.createContext(target, [file], opts, deploy_contracts.DeployDirection.FileInfo);
            }));
            // compare file
            wf.next((wfCtx) => __awaiter(this, void 0, void 0, function* () {
                wfCtx.result = yield me.compareFilesWithContext(wrapper.context, file, target, opts);
            }));
            wf.start().then((result) => {
                completed(null, result);
            }).catch((err) => {
                completed(err);
            });
        });
    }
    /**
     * Compares a local file with a remote one by using a context.
     *
     * @param {TContext} ctx The context.
     * @param {string} file The file to compare.
     * @param {DeployTarget} target The source from where to download the file from.
     * @param {DeployFileOptions} [opts] Additional options.
     *
     * @return {Promise<FileCompareResult>} The result.
     */
    compareFilesWithContext(ctx, file, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = this;
            let wf = Workflows.create();
            // get info about REMOTE file
            wf.next(() => __awaiter(this, void 0, void 0, function* () {
                return yield me.getFileInfoWithContext(ctx, file, target, opts);
            }));
            // check if local file exists
            wf.next((ctx) => {
                let right = ctx.previousValue;
                return new Promise((resolve, reject) => {
                    try {
                        let left = {
                            exists: undefined,
                            isRemote: false,
                        };
                        FS.exists(file, (exists) => {
                            left.exists = exists;
                            if (!left.exists) {
                                ctx.finish(); // no need to get local file info
                            }
                            let result = {
                                left: left,
                                right: right,
                            };
                            ctx.result = result;
                            resolve(result);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            // get local file info
            wf.next((ctx) => {
                let result = ctx.previousValue;
                return new Promise((resolve, reject) => {
                    FS.lstat(file, (err, stat) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            try {
                                result.left.name = Path.basename(file);
                                result.left.path = Path.dirname(file);
                                result.left.modifyTime = Moment(stat.ctime);
                                result.left.size = stat.size;
                                resolve(result);
                            }
                            catch (e) {
                                reject(e);
                            }
                        }
                    });
                });
            });
            return yield wf.start();
        });
    }
    /** @inheritdoc */
    compareWorkspace(files, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        return new Promise((resolve, reject) => {
            let wrapper;
            let completed = (err, result) => {
                let finished = () => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                };
                me.destroyContext(wrapper).then(() => {
                    finished();
                }).catch(() => {
                    finished();
                });
            };
            let wf = Workflows.create();
            // create context
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                wrapper = yield me.createContext(target, files, opts, deploy_contracts.DeployDirection.FileInfo);
                ctx.result = [];
            }));
            // check files
            files.forEach(f => {
                wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                    let compareResult = yield me.compareFilesWithContext(wrapper.context, f, target, opts);
                    ctx.result.push(compareResult);
                    return compareResult;
                }));
            });
            wf.start().then((result) => {
                completed(null, result);
            }).catch((err) => {
                completed(err);
            });
        });
    }
    /** @inheritdoc */
    deployWorkspace(files, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        // report that whole operation has been completed
        let filesTodo = files.map(x => x); // create "TODO"" list
        let hasCancelled = false;
        let completed = (err) => {
            filesTodo = [];
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    target: target,
                });
            }
        };
        hasCancelled = me.context.isCancelling();
        if (hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            // destroy context before raise
            // "completed" event
            let destroyContext = (wrapper, completedErr) => {
                try {
                    if (wrapper.destroy) {
                        // destroy context
                        wrapper.destroy().then(() => {
                            completed(completedErr);
                        }).catch((e) => {
                            me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.deployWorkspace(2)', e));
                            completed(completedErr);
                        });
                    }
                    else {
                        completed(completedErr);
                    }
                }
                catch (e) {
                    me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.deployWorkspace(1)', e));
                    completed(completedErr);
                }
            };
            try {
                // create context...
                this.createContext(target, files, opts, deploy_contracts.DeployDirection.Deploy).then((wrapper) => {
                    try {
                        let deployNext;
                        // report that single file
                        // deployment has been completed
                        let fileCompleted = function (file, err, canceled) {
                            if (opts.onFileCompleted) {
                                opts.onFileCompleted(me, {
                                    canceled: canceled,
                                    error: err,
                                    file: file,
                                    target: target,
                                });
                            }
                            hasCancelled = hasCancelled || deploy_helpers.toBooleanSafe(canceled);
                            if (hasCancelled) {
                                destroyContext(wrapper, null);
                            }
                            else {
                                deployNext(); // deploy next
                            }
                        };
                        deployNext = () => {
                            if (filesTodo.length < 1) {
                                destroyContext(wrapper);
                                return;
                            }
                            let currentFile = filesTodo.shift();
                            try {
                                me.deployFileWithContext(wrapper.context, currentFile, target, {
                                    context: opts.context,
                                    onBeforeDeploy: (sender, e) => {
                                        if (opts.onBeforeDeployFile) {
                                            opts.onBeforeDeployFile(sender, {
                                                destination: e.destination,
                                                file: e.file,
                                                target: e.target,
                                            });
                                        }
                                    },
                                    onCompleted: (sender, e) => {
                                        fileCompleted(e.file, e.error, e.canceled);
                                    }
                                });
                            }
                            catch (e) {
                                fileCompleted(currentFile, e); // deploy error
                            }
                        };
                        deployNext(); // start with first file
                    }
                    catch (e) {
                        destroyContext(wrapper, e); // global deploy error
                    }
                }).catch((err) => {
                    completed(err); // could not create context
                });
            }
            catch (e) {
                completed(e); // global error
            }
        }
    }
    /**
     * Destroys a context.
     *
     * @param {DeployPluginContextWrapper<TContext>} wrapper The wrapper with the context.
     *
     * @return {Promise<TContext>} The promise.
     */
    destroyContext(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            if (wrapper) {
                if (wrapper.destroy) {
                    return yield wrapper.destroy();
                }
            }
        });
    }
    /** @inheritdoc */
    downloadFile(file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        return new Promise((resolve, reject) => {
            let completed = (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            };
            // destroy context before raise
            // "completed" event
            let destroyContext = (wrapper, completedErr, data) => {
                try {
                    if (wrapper.destroy) {
                        // destroy context
                        wrapper.destroy().then(() => {
                            completed(completedErr, data);
                        }).catch((e) => {
                            me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.downloadFile(2)', e));
                            completed(completedErr, data);
                        });
                    }
                    else {
                        completed(completedErr, data);
                    }
                }
                catch (e) {
                    me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.downloadFile(1)', e));
                    completed(completedErr, data);
                }
            };
            // create context...
            me.createContext(target, [file], opts, deploy_contracts.DeployDirection.Download).then((wrapper) => {
                try {
                    let result = me.downloadFileWithContext(wrapper.context, file, target, opts);
                    if (result) {
                        if (Buffer.isBuffer(result)) {
                            destroyContext(wrapper, null, result);
                        }
                        else {
                            result.then((data) => {
                                destroyContext(wrapper, null, data);
                            }).catch((err) => {
                                destroyContext(wrapper, err);
                            });
                        }
                    }
                    else {
                        destroyContext(wrapper, null);
                    }
                }
                catch (e) {
                    destroyContext(wrapper, e);
                }
            }).catch((err) => {
                completed(err);
            });
        });
    }
    /**
     * Downloads a file by using a context.
     *
     * @param {TContext} ctx The context to use.
     * @param {string} file The path of the local file.
     * @param {DeployTarget} target The target.
     * @param {DeployFileOptions} [opts] Additional options.
     *
     * @return {Promise<Buffer>|Buffer} The result.
     */
    downloadFileWithContext(ctx, file, target, opts) {
        throw new Error("Not implemented!");
    }
    /** @inheritdoc */
    getFileInfo(file, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        return new Promise((resolve, reject) => {
            let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
            let wf = Workflows.create();
            let wrapper;
            wf.once('end', (err, wcnt, info) => {
                if (wrapper) {
                    if (wrapper.destroy) {
                        try {
                            Promise.resolve(wrapper.destroy()).then(() => {
                                completed(err, info);
                            }).catch((e) => {
                                me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.getFileInfo(2)', e));
                                completed(err, info);
                            });
                        }
                        catch (e) {
                            me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.getFileInfo(1)', e));
                            completed(err, info);
                        }
                    }
                    else {
                        completed(err, info);
                    }
                }
                else {
                    completed(err, info);
                }
            });
            // create context
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                return yield me.createContext(target, [file], opts, deploy_contracts.DeployDirection.FileInfo);
            }));
            // get file info
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                wrapper = ctx.previousValue;
                return yield me.getFileInfoWithContext(wrapper.context, file, target, opts);
            }));
            // write result
            wf.next((ctx) => {
                ctx.result = ctx.previousValue;
            });
            wf.start().then(() => {
                // is done by 'end' event
            }).catch((err) => {
                // is done by 'end' event
            });
        });
    }
    /**
     * Gets the info of a file by using a context.
     *
     * @param {TContext} ctx The context to use.
     * @param {string} file The path of the local file.
     * @param {DeployTarget} target The target.
     * @param {DeployFileOptions} [opts] Additional options.
     *
     * @return {Promise<deploy_contracts.FileInfo>|deploy_contracts.FileInfo} The result.
     */
    getFileInfoWithContext(ctx, file, target, opts) {
        throw new Error("Not implemented!");
    }
    /**
     * Pulls a file by using a context.
     *
     * @param {TContext} ctx The context to use.
     * @param {string} file The path of the local file.
     * @param {DeployTarget} target The target.
     * @param {DeployFileOptions} [opts] Additional options.
     */
    pullFileWithContext(ctx, file, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        let hasCancelled = false;
        let completed = (err) => {
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        let downloadCompleted = (downloadedData) => {
            try {
                if (!downloadedData) {
                    downloadedData = Buffer.alloc(0);
                }
                if (hasCancelled) {
                    completed(null);
                }
                else {
                    FS.writeFile(file, downloadedData, (err) => {
                        completed(err);
                    });
                }
            }
            catch (e) {
                completed(e);
            }
        };
        me.onCancelling(() => hasCancelled = true);
        if (hasCancelled) {
            completed(null);
        }
        else {
            try {
                let result = this.downloadFileWithContext(ctx, file, target, {
                    baseDirectory: opts.baseDirectory,
                    context: opts.context,
                    onBeforeDeploy: opts.onBeforeDeploy,
                });
                if (result) {
                    if (hasCancelled) {
                        completed(null);
                    }
                    else {
                        if (Buffer.isBuffer(result)) {
                            downloadCompleted(result);
                        }
                        else {
                            result.then((d) => {
                                downloadCompleted(d);
                            }).catch((err) => {
                                completed(err);
                            });
                        }
                    }
                }
                else {
                    downloadCompleted(null);
                }
            }
            catch (e) {
                completed(e);
            }
        }
    }
    /** @inheritdoc */
    pullWorkspace(files, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        // report that whole operation has been completed
        let filesTodo = files.map(x => x); // create "TODO"" list
        let hasCancelled = false;
        let completed = (err) => {
            filesTodo = [];
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    target: target,
                });
            }
        };
        hasCancelled = me.context.isCancelling();
        if (hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            // destroy context before raise
            // "completed" event
            let destroyContext = (wrapper, completedErr) => {
                try {
                    if (wrapper.destroy) {
                        // destroy context
                        wrapper.destroy().then(() => {
                            completed(completedErr);
                        }).catch((e) => {
                            me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.pullWorkspace(2)', e));
                            completed(completedErr);
                        });
                    }
                    else {
                        completed(completedErr);
                    }
                }
                catch (e) {
                    me.context.log(i18.t('errors.withCategory', 'DeployPluginWithContextBase.pullWorkspace(1)', e));
                    completed(completedErr);
                }
            };
            try {
                // create context...
                this.createContext(target, files, opts, deploy_contracts.DeployDirection.Pull).then((wrapper) => {
                    try {
                        let pullNext;
                        // report that single file
                        // pull has been completed
                        let fileCompleted = function (file, err, canceled) {
                            if (opts.onFileCompleted) {
                                opts.onFileCompleted(me, {
                                    canceled: canceled,
                                    error: err,
                                    file: file,
                                    target: target,
                                });
                            }
                            hasCancelled = hasCancelled || deploy_helpers.toBooleanSafe(canceled);
                            if (hasCancelled) {
                                destroyContext(wrapper, null);
                            }
                            else {
                                pullNext(); // pull next
                            }
                        };
                        pullNext = () => {
                            if (filesTodo.length < 1) {
                                destroyContext(wrapper);
                                return;
                            }
                            let currentFile = filesTodo.shift();
                            try {
                                me.pullFileWithContext(wrapper.context, currentFile, target, {
                                    context: opts.context,
                                    onBeforeDeploy: (sender, e) => {
                                        if (opts.onBeforeDeployFile) {
                                            opts.onBeforeDeployFile(sender, {
                                                destination: e.destination,
                                                file: e.file,
                                                target: e.target,
                                            });
                                        }
                                    },
                                    onCompleted: (sender, e) => {
                                        fileCompleted(e.file, e.error, e.canceled);
                                    }
                                });
                            }
                            catch (e) {
                                fileCompleted(currentFile, e); // pull error
                            }
                        };
                        pullNext(); // start with first file
                    }
                    catch (e) {
                        destroyContext(wrapper, e); // global deploy error
                    }
                }).catch((err) => {
                    completed(err); // could not create context
                });
            }
            catch (e) {
                completed(e); // global error
            }
        }
    }
}
exports.DeployPluginWithContextBase = DeployPluginWithContextBase;
/**
 * A deployer plugin that creates a ZIP file to deploy files to.
 */
class ZipFileDeployPluginBase extends DeployPluginWithContextBase {
    /** @inheritdoc */
    get canGetFileInfo() {
        return true;
    }
    /** @inheritdoc */
    createContext(target, files, opts, direction) {
        let me = this;
        let funcArgs = arguments;
        return new Promise((resolve, reject) => {
            try {
                me.createZipFile.apply(me, funcArgs).then((zipFile) => {
                    let wrapper = {
                        context: zipFile,
                    };
                    if (deploy_contracts.DeployDirection.Deploy === direction) {
                        wrapper.destroy = () => {
                            return me.deployZipFile(zipFile, target);
                        };
                    }
                    resolve(wrapper);
                }, (err) => {
                    reject(err);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * Creates or loads a ZIP file instance.
     *
     * @param {deploy_contracts.DeployTarget} target The target.
     * @param {string[]} files The files to deploy.
     * @param {deploy_contracts.DeployFileOptions|deploy_contracts.DeployWorkspaceOptions} opts The underlying options.
     * @param {deploy_contracts.DeployDirection} direction The direction.
     *
     * @return {Promise<any>} The promise.
     */
    createZipFile(target, files, opts, direction) {
        return new Promise((resolve, reject) => {
            try {
                resolve(new Zip());
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /** @inheritdoc */
    deployFileWithContext(zipFile, file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        let hasCancelled = false;
        let completed = (err) => {
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        hasCancelled = me.context.isCancelling();
        if (hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
            if (false === relativePath) {
                relativePath = file;
            }
            if (opts.onBeforeDeploy) {
                opts.onBeforeDeploy(me, {
                    destination: `zip://${relativePath}`,
                    file: file,
                    target: target,
                });
            }
            try {
                FS.readFile(file, (err, data) => {
                    if (err) {
                        completed(err);
                        return;
                    }
                    try {
                        let zipEntry = relativePath.trim();
                        while (0 === zipEntry.indexOf('/')) {
                            zipEntry = zipEntry.substr(1);
                        }
                        zipFile.file(zipEntry, data);
                        completed();
                    }
                    catch (e) {
                        completed(e);
                    }
                });
            }
            catch (e) {
                completed(e);
            }
        }
    }
    /** @inheritdoc */
    downloadFileWithContext(zipFile, file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        let hasCancelled = false;
        let result = null;
        me.onCancelling(() => hasCancelled = true);
        let err;
        try {
            if (!hasCancelled) {
                let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativePath) {
                    relativePath = file;
                }
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(me, {
                        destination: `zip://${relativePath}`,
                        file: file,
                        target: target,
                    });
                }
                let zipEntry = relativePath.trim();
                while (0 === zipEntry.indexOf('/')) {
                    zipEntry = zipEntry.substr(1);
                }
                if (zipFile.files && zipFile.files[zipEntry]) {
                    let f = zipFile.files[zipEntry];
                    if (f) {
                        result = f.asNodeBuffer();
                        if (!result) {
                            throw new Error('No data!'); //TODO
                        }
                    }
                    else {
                        throw i18.t('plugins.zip.fileNotFound');
                    }
                }
                else {
                    throw i18.t('plugins.zip.fileNotFound');
                }
            }
        }
        catch (e) {
            err = e;
        }
        if (opts.onCompleted) {
            opts.onCompleted(me, {
                canceled: hasCancelled,
                error: err,
                file: file,
                target: target,
            });
        }
        if (err) {
            throw err;
        }
        return result;
    }
    /** @inheritdoc */
    getFileInfo(file, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        return new Promise((resolve, reject) => {
            let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
            let wf = Workflows.create();
            let wrapper;
            let destroyContext = (err, info) => {
                if (!info) {
                    info = {
                        exists: false,
                        isRemote: true,
                    };
                }
                if (wrapper) {
                    if (wrapper.destroy) {
                        try {
                            Promise.resolve(wrapper.destroy()).then(() => {
                                completed(null, info);
                            }).catch((e) => {
                                me.context.log(i18.t('errors.withCategory', 'ZipFileDeployPluginBase.getFileInfo(2)', e));
                                completed(null, info);
                            });
                        }
                        catch (e) {
                            me.context.log(i18.t('errors.withCategory', 'ZipFileDeployPluginBase.getFileInfo(1)', e));
                            completed(null, info);
                        }
                    }
                    else {
                        completed(null, info);
                    }
                }
                else {
                    completed(null, info);
                }
            };
            // create context
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                return yield me.createContext(target, [file], opts, deploy_contracts.DeployDirection.FileInfo);
            }));
            // get file info
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                wrapper = ctx.previousValue;
                return yield me.getFileInfoWithContext(wrapper.context, file, target, opts);
            }));
            // write result
            wf.next((ctx) => {
                ctx.result = ctx.previousValue;
            });
            wf.start().then((info) => {
                destroyContext(null, info);
            }).catch((err) => {
                destroyContext(err);
            });
        });
    }
    /** @inheritdoc */
    getFileInfoWithContext(zipFile, file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        me.getFileInfo;
        let hasCancelled = false;
        let result = {
            exists: false,
            isRemote: true,
        };
        me.onCancelling(() => hasCancelled = true);
        let err;
        try {
            if (!hasCancelled) {
                let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativePath) {
                    relativePath = file;
                }
                let zipEntry = relativePath.trim();
                while (0 === zipEntry.indexOf('/')) {
                    zipEntry = zipEntry.substr(1);
                }
                if (zipFile.files && zipFile.files[zipEntry]) {
                    let f = zipFile.files[zipEntry];
                    if (f) {
                        result.exists = true;
                        // last change date
                        if (!deploy_helpers.isNullUndefinedOrEmptyString(f.date)) {
                            try {
                                result.modifyTime = Moment(f.date);
                            }
                            catch (e) {
                                // TODO: log
                            }
                        }
                        // file size
                        try {
                            let data = f.asNodeBuffer();
                            if (data) {
                                result.size = data.length;
                            }
                        }
                        catch (e) {
                            // TODO: log
                        }
                        // filename
                        try {
                            result.name = Path.basename(relativePath);
                        }
                        catch (e) {
                            result.name = deploy_helpers.toStringSafe(f.name);
                        }
                        // path
                        try {
                            result.path = Path.dirname(relativePath);
                        }
                        catch (e) {
                            result.path = relativePath;
                        }
                    }
                    else {
                        throw i18.t('plugins.zip.fileNotFound');
                    }
                }
                else {
                    throw i18.t('plugins.zip.fileNotFound');
                }
            }
        }
        catch (e) {
            err = e;
        }
        if (err) {
            throw err;
        }
        return result;
    }
}
exports.ZipFileDeployPluginBase = ZipFileDeployPluginBase;
/**
 * A base plugin that deploys to other targets.
 */
class MultiTargetDeployPluginBase extends MultiFileDeployPluginBase {
    /** @inheritdoc */
    deployWorkspace(files, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        let ctx = this.createContext(target);
        let targetsTodo = ctx.targets.map(x => x);
        let completed = (err) => {
            targetsTodo = [];
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: ctx.hasCancelled,
                    target: target,
                });
            }
        };
        me.onCancelling(() => ctx.hasCancelled = true, opts);
        if (ctx.hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            try {
                let deployNextTarget;
                deployNextTarget = () => {
                    if (targetsTodo.length < 1) {
                        completed();
                        return;
                    }
                    if (ctx.hasCancelled) {
                        completed();
                        return;
                    }
                    let currentTarget = targetsTodo.shift();
                    let pluginsTodo = currentTarget.plugins.map(x => x);
                    let targetCompleted = (err) => {
                        pluginsTodo = [];
                        deployNextTarget();
                    };
                    let deployNextPlugin;
                    deployNextPlugin = () => {
                        if (pluginsTodo.length < 1) {
                            targetCompleted();
                            return;
                        }
                        if (ctx.hasCancelled) {
                            completed();
                            return;
                        }
                        let pluginCompleted = (err, canceled) => {
                            deployNextPlugin();
                        };
                        let currentPlugin = pluginsTodo.shift();
                        try {
                            currentPlugin.deployWorkspace(files, currentTarget.target, {
                                context: opts.context,
                                onBeforeDeployFile: (sender, e) => {
                                    if (opts.onBeforeDeployFile) {
                                        let destination = deploy_helpers.toStringSafe(currentTarget.target.name).trim();
                                        if (!destination) {
                                            destination = deploy_helpers.toStringSafe(currentPlugin.__type).trim();
                                        }
                                        if (!destination) {
                                            deploy_helpers.toStringSafe(currentPlugin.__file).trim();
                                        }
                                        let originalDestination = deploy_helpers.toStringSafe(e.destination);
                                        if (destination) {
                                            destination = `[${destination}] ${originalDestination}`;
                                        }
                                        else {
                                            destination = originalDestination;
                                        }
                                        opts.onBeforeDeployFile(me, {
                                            destination: destination,
                                            file: e.file,
                                            target: e.target,
                                        });
                                    }
                                },
                                onCompleted: (sender, e) => {
                                    ctx.hasCancelled = ctx.hasCancelled || e.canceled;
                                    pluginCompleted(e.error, e.canceled);
                                },
                                onFileCompleted: (sender, e) => {
                                    if (opts.onFileCompleted) {
                                        opts.onFileCompleted(me, {
                                            canceled: e.canceled,
                                            error: e.error,
                                            file: e.file,
                                            target: e.target,
                                        });
                                    }
                                }
                            });
                        }
                        catch (e) {
                            targetCompleted(e);
                        }
                    };
                    deployNextPlugin();
                };
                deployNextTarget();
            }
            catch (e) {
                completed(e);
            }
        }
    }
    /** @inheritdoc */
    pullWorkspace(files, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        let ctx = this.createContext(target);
        let targetsTodo = ctx.targets.map(x => x);
        let completed = (err) => {
            targetsTodo = [];
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: ctx.hasCancelled,
                    target: target,
                });
            }
        };
        ctx.hasCancelled = me.context.isCancelling();
        if (ctx.hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            try {
                let pullNextTarget;
                pullNextTarget = () => {
                    if (targetsTodo.length < 1) {
                        completed();
                        return;
                    }
                    if (ctx.hasCancelled) {
                        completed();
                        return;
                    }
                    let currentTarget = targetsTodo.shift();
                    let pluginsTodo = currentTarget.plugins.map(x => x);
                    let targetCompleted = (err) => {
                        pluginsTodo = [];
                        pullNextTarget();
                    };
                    let pullNextPlugin;
                    pullNextPlugin = () => {
                        if (pluginsTodo.length < 1) {
                            targetCompleted();
                            return;
                        }
                        if (ctx.hasCancelled) {
                            completed();
                            return;
                        }
                        let pluginCompleted = (err, canceled) => {
                            pullNextPlugin();
                        };
                        let currentPlugin = pluginsTodo.shift();
                        try {
                            currentPlugin.pullWorkspace(files, currentTarget.target, {
                                context: opts.context,
                                onBeforeDeployFile: (sender, e) => {
                                    if (opts.onBeforeDeployFile) {
                                        let destination = deploy_helpers.toStringSafe(currentTarget.target.name).trim();
                                        if (!destination) {
                                            destination = deploy_helpers.toStringSafe(currentPlugin.__type).trim();
                                        }
                                        if (!destination) {
                                            deploy_helpers.toStringSafe(currentPlugin.__file).trim();
                                        }
                                        let originalDestination = deploy_helpers.toStringSafe(e.destination);
                                        if (destination) {
                                            destination = `[${destination}] ${originalDestination}`;
                                        }
                                        else {
                                            destination = originalDestination;
                                        }
                                        opts.onBeforeDeployFile(me, {
                                            destination: destination,
                                            file: e.file,
                                            target: e.target,
                                        });
                                    }
                                },
                                onCompleted: (sender, e) => {
                                    ctx.hasCancelled = ctx.hasCancelled || e.canceled;
                                    pluginCompleted(e.error, e.canceled);
                                },
                                onFileCompleted: (sender, e) => {
                                    if (opts.onFileCompleted) {
                                        opts.onFileCompleted(me, {
                                            canceled: e.canceled,
                                            error: e.error,
                                            file: e.file,
                                            target: e.target,
                                        });
                                    }
                                }
                            });
                        }
                        catch (e) {
                            targetCompleted(e);
                        }
                    };
                    pullNextPlugin();
                };
                pullNextTarget();
            }
            catch (e) {
                completed(e);
            }
        }
    }
}
exports.MultiTargetDeployPluginBase = MultiTargetDeployPluginBase;
/**
 * A basic object cache.
 *
 * @template T Type of the objects.
 */
class ObjectCacheBase {
    /** @inheritdoc */
    has(obj, name) {
        let notFound = Symbol('NOT_FOUND');
        return notFound !== this.get(obj, name, notFound);
    }
    /**
     * Normalizes a value name.
     *
     * @param string name The input value.
     *
     * @return {string} The output value.
     */
    static normalizeName(name) {
        return deploy_helpers.normalizeString(name);
    }
}
exports.ObjectCacheBase = ObjectCacheBase;
/**
 * A cache for targets.
 */
class DeployTargetCache extends ObjectCacheBase {
    constructor() {
        super(...arguments);
        /**
         * The underlying storage.
         */
        this._storage = {};
    }
    /** @inheritdoc */
    get(target, name, defaultValue) {
        let targetKey = this.getStorageKeyForTarget(target);
        name = DeployTargetCache.normalizeName(name);
        let targetItem = this._storage[targetKey];
        if (!deploy_helpers.isNullOrUndefined(targetItem)) {
            for (let p in targetItem) {
                if (p === name) {
                    return targetItem[p];
                }
            }
        }
        return defaultValue;
    }
    /**
     * Returns the storage key for a target.
     *
     * @param {deploy_contracts.DeployTarget} target The target.
     *
     * @returns {string} The key.
     */
    getStorageKeyForTarget(target) {
        let key;
        if (target) {
            key = deploy_helpers.toStringSafe(target.__id) + '::' + deploy_helpers.normalizeString(target.name);
        }
        return key;
    }
    /** @inheritdoc */
    set(target, name, value) {
        let targetKey = this.getStorageKeyForTarget(target);
        name = DeployTargetCache.normalizeName(name);
        let targetItem = this._storage[targetKey];
        if (deploy_helpers.isNullOrUndefined(targetItem)) {
            this._storage[targetKey] = targetItem = {};
        }
        targetItem[name] = value;
        return this;
    }
}
exports.DeployTargetCache = DeployTargetCache;
/**
 * A simple popup button.
 */
class SimplePopupButton {
    /** @inheritdoc */
    get action() {
        return this._action;
    }
    set action(newValue) {
        this._action = newValue;
    }
    /** @inheritdoc */
    get tag() {
        return this._tag;
    }
    set tag(newValue) {
        this._tag = newValue;
    }
    /** @inheritdoc */
    get title() {
        return this._title;
    }
    set title(newValue) {
        this._title = newValue;
    }
    /** @inheritdoc */
    toString() {
        return this._title || 'SimplePopupButton';
    }
}
exports.SimplePopupButton = SimplePopupButton;
//# sourceMappingURL=objects.js.map