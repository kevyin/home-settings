"use strict";
/// <reference types="node" />
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
const deploy_workspace = require("../workspace");
const i18 = require("../i18");
const Path = require("path");
class ScriptPlugin extends deploy_objects.DeployPluginBase {
    constructor() {
        super(...arguments);
        this._globalState = {};
        this._scriptStates = {};
    }
    get canGetFileInfo() {
        return true;
    }
    get canPull() {
        return true;
    }
    deployFile(file, target, opts) {
        this.deployOrPullFile(deploy_contracts.DeployDirection.Deploy, file, target, opts);
    }
    deployOrPullFile(direction, file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        return new Promise((resolve, reject) => {
            let hasCancelled = false;
            let completed = (err, args) => {
                if (opts.onCompleted) {
                    opts.onCompleted(me, {
                        canceled: hasCancelled,
                        error: err,
                        file: file,
                        target: target,
                    });
                }
                if (err) {
                    reject(err);
                }
                else {
                    resolve(args);
                }
            };
            me.onCancelling(() => hasCancelled = true, opts);
            if (hasCancelled) {
                completed(null); // cancellation requested
            }
            else {
                try {
                    let scriptFile = getScriptFile(target, me);
                    let relativeScriptPath = deploy_helpers.toRelativePath(scriptFile, opts.baseDirectory);
                    if (false === relativeScriptPath) {
                        relativeScriptPath = scriptFile;
                    }
                    let scriptModule = loadScriptModule(scriptFile);
                    let scriptFunction;
                    switch (direction) {
                        case deploy_contracts.DeployDirection.Pull:
                            scriptFunction = scriptModule['pullFile'] || scriptModule['deployFile'];
                            break;
                        default:
                            // deploy
                            scriptFunction = scriptModule['deployFile'] || scriptModule['pullFile'];
                            break;
                    }
                    if (!scriptFunction) {
                        throw new Error(i18.t('plugins.script.noDeployFileFunction', relativeScriptPath));
                    }
                    let allStates = me._scriptStates;
                    let info;
                    if (deploy_contracts.DeployDirection.Pull === direction) {
                        info = {
                            exists: false,
                            isRemote: true,
                        };
                    }
                    let args = {
                        canceled: me.context.isCancelling(),
                        context: me.context,
                        deployOptions: opts,
                        direction: direction,
                        emitGlobal: function () {
                            return me.context
                                .emitGlobal
                                .apply(me.context, arguments);
                        },
                        file: file,
                        globals: me.context.globals(),
                        info: info,
                        onBeforeDeploy: (destination) => {
                            if (opts.onBeforeDeploy) {
                                opts.onBeforeDeploy(me, {
                                    destination: destination,
                                    file: file,
                                    target: target,
                                });
                                return true;
                            }
                            return false;
                        },
                        openHtml: function () {
                            return me.context.openHtml
                                .apply(me.context, arguments);
                        },
                        replaceWithValues: (v) => me.context.replaceWithValues(v),
                        require: function (id) {
                            return me.context.require(id);
                        },
                        sender: me,
                        target: target,
                        targetOptions: target.options,
                    };
                    // args.globalState
                    Object.defineProperty(args, 'globalState', {
                        enumerable: true,
                        get: () => {
                            return me._globalState;
                        },
                    });
                    // args.state
                    Object.defineProperty(args, 'state', {
                        enumerable: true,
                        get: () => {
                            return allStates[scriptFile];
                        },
                        set: (v) => {
                            allStates[scriptFile] = v;
                        },
                    });
                    args.context.once('deploy.cancel', function () {
                        if (false === args.canceled) {
                            args.canceled = true;
                        }
                    });
                    Promise.resolve(scriptFunction(args)).then((a) => {
                        hasCancelled = (a || args).canceled;
                        completed(null, a || args);
                    }).catch((err) => {
                        if (!err) {
                            // define generic error message
                            err = new Error(i18.t('plugins.script.deployFileFailed', file, relativeScriptPath));
                        }
                        completed(err);
                    });
                }
                catch (e) {
                    completed(e);
                }
            }
        });
    }
    deployWorkspace(files, target, opts) {
        this.deployOrPullWorkspace(deploy_contracts.DeployDirection.Deploy, files, target, opts);
    }
    deployOrPullWorkspace(direction, files, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        return new Promise((resolve, reject) => {
            let hasCancelled = false;
            let completed = (err, args) => {
                if (opts.onCompleted) {
                    opts.onCompleted(me, {
                        canceled: hasCancelled,
                        error: err,
                        target: target,
                    });
                }
                if (err) {
                    reject(err);
                }
                else {
                    resolve(args);
                }
            };
            me.onCancelling(() => hasCancelled = true, opts);
            if (hasCancelled) {
                completed(null); // cancellation requested
            }
            else {
                try {
                    let scriptFile = getScriptFile(target, me);
                    let relativeScriptPath = deploy_helpers.toRelativePath(scriptFile, opts.baseDirectory);
                    if (false === relativeScriptPath) {
                        relativeScriptPath = scriptFile;
                    }
                    let scriptModule = loadScriptModule(scriptFile);
                    let scriptFunction;
                    switch (direction) {
                        case deploy_contracts.DeployDirection.Pull:
                            scriptFunction = scriptModule['pullWorkspace'] || scriptModule['deployWorkspace'];
                            break;
                        default:
                            // deploy
                            scriptFunction = scriptModule['deployWorkspace'] || scriptModule['pullWorkspace'];
                            break;
                    }
                    if (scriptFunction) {
                        // custom function
                        let allStates = me._scriptStates;
                        let args = {
                            canceled: me.context.isCancelling(),
                            context: me.context,
                            deployOptions: opts,
                            direction: direction,
                            emitGlobal: function () {
                                return me.context
                                    .emitGlobal
                                    .apply(me.context, arguments);
                            },
                            files: files,
                            globals: me.context.globals(),
                            onBeforeDeployFile: function (fileOrIndex, destination) {
                                if (opts.onBeforeDeployFile) {
                                    if (deploy_helpers.isNullOrUndefined(fileOrIndex)) {
                                        fileOrIndex = 0;
                                    }
                                    if ('string' !== typeof fileOrIndex) {
                                        fileOrIndex = parseInt(deploy_helpers.toStringSafe(fileOrIndex).trim());
                                        fileOrIndex = args.files[fileOrIndex];
                                    }
                                    opts.onBeforeDeployFile(me, {
                                        destination: destination,
                                        file: fileOrIndex,
                                        target: target,
                                    });
                                    return true;
                                }
                                return false;
                            },
                            onFileCompleted: function (fileOrIndex, err) {
                                if (opts.onFileCompleted) {
                                    if (deploy_helpers.isNullOrUndefined(fileOrIndex)) {
                                        fileOrIndex = 0;
                                    }
                                    if ('string' !== typeof fileOrIndex) {
                                        fileOrIndex = parseInt(deploy_helpers.toStringSafe(fileOrIndex).trim());
                                        fileOrIndex = args.files[fileOrIndex];
                                    }
                                    opts.onFileCompleted(me, {
                                        canceled: args.canceled,
                                        error: err,
                                        file: fileOrIndex,
                                        target: target,
                                    });
                                    return true;
                                }
                                return false;
                            },
                            openHtml: function () {
                                return me.context.openHtml
                                    .apply(me.context, arguments);
                            },
                            replaceWithValues: (v) => me.context.replaceWithValues(v),
                            require: function (id) {
                                return me.context.require(id);
                            },
                            sender: me,
                            target: target,
                            targetOptions: target.options,
                        };
                        // args.globalState
                        Object.defineProperty(args, 'globalState', {
                            enumerable: true,
                            get: () => {
                                return me._globalState;
                            },
                        });
                        // args.state
                        Object.defineProperty(args, 'state', {
                            enumerable: true,
                            get: () => {
                                return allStates[scriptFile];
                            },
                            set: (v) => {
                                allStates[scriptFile] = v;
                            },
                        });
                        args.context.once('deploy.cancel', function () {
                            if (false === args.canceled) {
                                args.canceled = true;
                            }
                        });
                        Promise.resolve(scriptFunction(args)).then((a) => {
                            hasCancelled = (a || args).canceled;
                            completed(null, a || args);
                        }).catch((err) => {
                            if (!err) {
                                // define generic error message
                                err = new Error(i18.t('plugins.script.deployWorkspaceFailed', relativeScriptPath));
                            }
                            completed(err);
                        });
                    }
                    else {
                        // use default
                        super.deployWorkspace(files, target, opts);
                    }
                }
                catch (e) {
                    completed(e);
                }
            }
        });
    }
    downloadFile(file, target, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            me.deployOrPullFile(deploy_contracts.DeployDirection.Pull, file, target, opts).then((args) => {
                resolve(args.data);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    getFileInfo(file, target, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            me.deployOrPullFile(deploy_contracts.DeployDirection.FileInfo, file, target, opts).then((args) => {
                resolve(args.info || {
                    exists: false,
                    isRemote: true,
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }
    info() {
        return {
            description: i18.t('plugins.script.description'),
        };
    }
    onConfigReloaded(cfg) {
        this._globalState = {};
        this._scriptStates = {};
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
    return new ScriptPlugin(ctx);
}
exports.createPlugin = createPlugin;
function getScriptFile(target, plugin) {
    let scriptFile = deploy_helpers.toStringSafe(target.script);
    scriptFile = plugin.context.replaceWithValues(scriptFile);
    if ('' === scriptFile.trim()) {
        scriptFile = './deploy.js';
    }
    if (!Path.isAbsolute(scriptFile)) {
        scriptFile = Path.join(deploy_workspace.getRootPath(), scriptFile);
    }
    return scriptFile;
}
function loadScriptModule(scriptFile) {
    scriptFile = Path.resolve(scriptFile);
    delete require.cache[scriptFile];
    return require(scriptFile);
}
//# sourceMappingURL=script.js.map