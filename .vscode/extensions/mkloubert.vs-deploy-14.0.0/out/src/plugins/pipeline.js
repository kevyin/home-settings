"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const deploy_workspace = require("../workspace");
const i18 = require("../i18");
const Path = require("path");
class PipelinePlugin extends deploy_objects.MultiTargetDeployPluginBase {
    constructor() {
        super(...arguments);
        this._globalState = {};
        this._scriptStates = {};
    }
    createContext(target) {
        return {
            hasCancelled: false,
            targets: this.getTargetsWithPlugins(target, target.target),
        };
    }
    deployWorkspace(files, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        let ctx = this.createContext(target);
        let completed = (err) => {
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
                let scriptFile = getScriptFile(target, me);
                let relativeScriptPath = deploy_helpers.toRelativePath(scriptFile, opts.baseDirectory);
                if (false === relativeScriptPath) {
                    relativeScriptPath = scriptFile;
                }
                let scriptModule = loadScriptModule(scriptFile);
                if (!scriptModule.pipe) {
                    throw new Error(i18.t('plugins.pipeline.noPipeFunction', relativeScriptPath));
                }
                let allStates = me._scriptStates;
                let args = {
                    baseDirectory: opts.baseDirectory,
                    canceled: me.context.isCancelling(),
                    context: me.context,
                    deployOptions: opts,
                    emitGlobal: function () {
                        return me.context
                            .emitGlobal
                            .apply(me.context, arguments);
                    },
                    files: files,
                    globals: me.context.globals(),
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
                Promise.resolve(scriptModule.pipe(args)).then((a) => {
                    if (ctx.hasCancelled) {
                        completed();
                        return;
                    }
                    a = a || args;
                    let newFileList = deploy_helpers.asArray(a.files)
                        .filter(x => !deploy_helpers.isEmptyString(x));
                    super.deployWorkspace(newFileList, target, {
                        baseDirectory: a.baseDirectory,
                        context: opts.context,
                        onBeforeDeployFile: (sender, e) => {
                            if (opts.onBeforeDeployFile) {
                                opts.onBeforeDeployFile(sender, {
                                    destination: e.destination,
                                    file: e.file,
                                    target: e.target,
                                });
                            }
                        },
                        onCompleted: (sender, e) => {
                            let pipeCompleted = () => {
                                ctx.hasCancelled = e.canceled;
                                completed(e.error);
                            };
                            try {
                                if (scriptModule.onPipeCompleted) {
                                    Promise.resolve(scriptModule.onPipeCompleted(a, e.error)).then(() => {
                                        pipeCompleted();
                                    }).catch((err) => {
                                        me.context.log(i18.t('errors.withCategory', 'PipelinePlugin.deployWorkspace(2)', err));
                                        pipeCompleted();
                                    });
                                }
                                else {
                                    pipeCompleted();
                                }
                            }
                            catch (ex) {
                                me.context.log(i18.t('errors.withCategory', 'PipelinePlugin.deployWorkspace(1)', ex));
                                pipeCompleted();
                            }
                        },
                        onFileCompleted: (sender, e) => {
                            if (opts.onFileCompleted) {
                                opts.onFileCompleted(sender, {
                                    error: e.error,
                                    file: e.file,
                                    target: e.target,
                                });
                            }
                        }
                    });
                }).catch((err) => {
                    completed(err);
                });
            }
            catch (e) {
                completed(e);
            }
        }
    }
    info() {
        return {
            description: i18.t('plugins.pipeline.description'),
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
    return new PipelinePlugin(ctx);
}
exports.createPlugin = createPlugin;
function getScriptFile(target, plugin) {
    let scriptFile = deploy_helpers.toStringSafe(target.script);
    scriptFile = plugin.context.replaceWithValues(scriptFile);
    if (!scriptFile) {
        scriptFile = './pipeline.js';
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
//# sourceMappingURL=pipeline.js.map