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
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const deploy_switch = require("../switch");
const i18 = require("../i18");
const vscode = require("vscode");
class SwitchPlugin extends deploy_objects.MultiFileDeployPluginBase {
    get canGetFileInfo() {
        return true;
    }
    get canPull() {
        return true;
    }
    deployWorkspace(files, target, opts) {
        const ME = this;
        if (!opts) {
            opts = {};
        }
        let canceled = false;
        ME.onCancelling(() => canceled = true, opts);
        let completedInvoked = false;
        const COMPLETED = (err) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            if (opts.onCompleted) {
                opts.onCompleted(ME, {
                    canceled: canceled,
                    error: err,
                    target: target,
                });
            }
        };
        const OPTION = ME.getSwitchOption(target);
        if (false === OPTION) {
            canceled = true;
            COMPLETED(null);
            return;
        }
        const TARGETS_AND_PLUGINS = ME.getTargetsWithPlugins(target, OPTION.targets);
        if (TARGETS_AND_PLUGINS.length < 1) {
            canceled = true;
            COMPLETED(null); //TODO: error message
            return;
        }
        ME.forEachTargetAndPlugin(target, TARGETS_AND_PLUGINS, (t, p) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const COMPLETED = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
                try {
                    if (p.deployWorkspace) {
                        p.deployWorkspace(files, t, {
                            baseDirectory: opts.baseDirectory,
                            context: opts.context || ME.context,
                            onBeforeDeployFile: (sender, e) => {
                                if (opts.onBeforeDeployFile) {
                                    opts.onBeforeDeployFile(ME, {
                                        destination: e.destination,
                                        file: e.file,
                                        target: t,
                                    });
                                }
                            },
                            onCompleted: (sender, e) => {
                                COMPLETED(e.error);
                            },
                            onFileCompleted: (sender, e) => {
                                if (opts.onFileCompleted) {
                                    opts.onFileCompleted(ME, {
                                        canceled: e.canceled,
                                        error: e.error,
                                        file: e.file,
                                        target: t,
                                    });
                                }
                            }
                        });
                    }
                    else {
                        COMPLETED(null);
                    }
                }
                catch (e) {
                    COMPLETED(e);
                }
            }));
        }).then(() => {
            COMPLETED(null);
        }).catch((err) => {
            COMPLETED(err);
        });
    }
    downloadFile(file, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const ME = this;
            if (!opts) {
                opts = {};
            }
            let canceled = false;
            ME.onCancelling(() => canceled = true, opts);
            let completedInvoked = false;
            const COMPLETED = (err) => {
                if (completedInvoked) {
                    return;
                }
                completedInvoked = true;
                if (opts.onCompleted) {
                    opts.onCompleted(ME, {
                        canceled: canceled,
                        error: err,
                        file: file,
                        target: target,
                    });
                }
            };
            const OPTION = ME.getSwitchOption(target);
            if (false === OPTION) {
                canceled = true;
                COMPLETED(null);
                return;
            }
            const TARGETS_AND_PLUGINS = ME.getTargetsWithPlugins(target, OPTION.targets);
            if (TARGETS_AND_PLUGINS.length < 1) {
                canceled = true;
                COMPLETED(null); //TODO: error message
                return;
            }
            let data;
            yield ME.forEachTargetAndPlugin(target, TARGETS_AND_PLUGINS, (t, p) => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const COMPLETED = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
                    try {
                        if (p.downloadFile) {
                            data = yield Promise.resolve(p.downloadFile(file, t, {
                                baseDirectory: opts.baseDirectory,
                                context: opts.context || ME.context,
                                onBeforeDeploy: (sender, e) => {
                                    if (opts.onBeforeDeploy) {
                                        opts.onBeforeDeploy(ME, {
                                            destination: e.destination,
                                            file: e.file,
                                            target: e.target,
                                        });
                                    }
                                },
                                onCompleted: (sender, e) => {
                                    COMPLETED(e.error);
                                }
                            }));
                        }
                    }
                    catch (e) {
                        COMPLETED(e);
                    }
                }));
            }));
            return data;
        });
    }
    forEachTargetAndPlugin(target, targetsWithPlugins, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const ME = this;
            return new Promise((resolve, reject) => {
                const COMPLETED = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
                let canceled = false;
                ME.onCancelling(() => canceled = true);
                try {
                    let nextTarget;
                    nextTarget = () => {
                        if (canceled) {
                            COMPLETED(null);
                            return;
                        }
                        if (targetsWithPlugins.length < 1) {
                            COMPLETED(null);
                            return;
                        }
                        try {
                            const TARGET_AND_PLUGINS = targetsWithPlugins.shift();
                            const TARGET = deploy_helpers.cloneObject(TARGET_AND_PLUGINS.target);
                            const PLUGINS = TARGET_AND_PLUGINS.plugins.map(p => p);
                            let nextPlugin;
                            nextPlugin = () => {
                                if (canceled) {
                                    COMPLETED(null);
                                    return;
                                }
                                if (PLUGINS.length < 1) {
                                    nextTarget();
                                    return;
                                }
                                try {
                                    const P = PLUGINS.shift();
                                    if (action) {
                                        Promise.resolve(action(TARGET, P)).then(() => {
                                            nextPlugin();
                                        }).catch((err) => {
                                            COMPLETED(err);
                                        });
                                    }
                                    else {
                                        nextPlugin();
                                    }
                                }
                                catch (e) {
                                    COMPLETED(e);
                                }
                            };
                            nextPlugin(); // start with first plugin
                            // of current target
                        }
                        catch (e) {
                            COMPLETED(e);
                        }
                    };
                    nextTarget(); // start with first target
                }
                catch (e) {
                    COMPLETED(e);
                }
            });
        });
    }
    getFileInfo(file, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const ME = this;
            if (!opts) {
                opts = {};
            }
            let canceled = false;
            ME.onCancelling(() => canceled = true, opts);
            let completedInvoked = false;
            const COMPLETED = (err) => {
                if (completedInvoked) {
                    return;
                }
                completedInvoked = true;
                if (opts.onCompleted) {
                    opts.onCompleted(ME, {
                        canceled: canceled,
                        error: err,
                        file: file,
                        target: target,
                    });
                }
            };
            const OPTION = ME.getSwitchOption(target);
            if (false === OPTION) {
                canceled = true;
                COMPLETED(null);
                return;
            }
            const TARGETS_AND_PLUGINS = ME.getTargetsWithPlugins(target, OPTION.targets);
            if (TARGETS_AND_PLUGINS.length < 1) {
                canceled = true;
                COMPLETED(null); //TODO: error message
                return;
            }
            let fi;
            yield ME.forEachTargetAndPlugin(target, TARGETS_AND_PLUGINS, (t, p) => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const COMPLETED = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
                    try {
                        if (p.getFileInfo) {
                            fi = yield Promise.resolve(p.getFileInfo(file, t, {
                                baseDirectory: opts.baseDirectory,
                                context: opts.context || ME.context,
                                onBeforeDeploy: (sender, e) => {
                                    if (opts.onBeforeDeploy) {
                                        opts.onBeforeDeploy(ME, {
                                            destination: e.destination,
                                            file: e.file,
                                            target: e.target,
                                        });
                                    }
                                },
                                onCompleted: (sender, e) => {
                                    COMPLETED(e.error);
                                }
                            }));
                        }
                    }
                    catch (e) {
                        COMPLETED(e);
                    }
                }));
            }));
            return fi;
        });
    }
    getSwitchOption(target) {
        const OPTION = deploy_switch.getCurrentOptionOf(target);
        if (false === OPTION) {
            vscode.window.showWarningMessage('[vs-deploy] ' + i18.t('plugins.switch.noOptionSelected'));
            return false;
        }
        return OPTION;
    }
    info() {
        return {
            description: i18.t('plugins.switch.description'),
        };
    }
    pullFile(file, target, opts) {
        const ME = this;
        if (!opts) {
            opts = {};
        }
        let canceled = false;
        ME.onCancelling(() => canceled = true, opts);
        let completedInvoked = false;
        const COMPLETED = (err) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            if (opts.onCompleted) {
                opts.onCompleted(ME, {
                    canceled: canceled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        const OPTION = ME.getSwitchOption(target);
        if (false === OPTION) {
            canceled = true;
            COMPLETED(null);
            return;
        }
        const TARGETS_AND_PLUGINS = ME.getTargetsWithPlugins(target, OPTION.targets);
        if (TARGETS_AND_PLUGINS.length < 1) {
            canceled = true;
            COMPLETED(null); //TODO: error message
            return;
        }
        ME.forEachTargetAndPlugin(target, TARGETS_AND_PLUGINS, (t, p) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const COMPLETED = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
                try {
                    if (p.pullFile) {
                        p.pullFile(file, t, {
                            baseDirectory: opts.baseDirectory,
                            context: opts.context || ME.context,
                            onBeforeDeploy: (sender, e) => {
                                if (opts.onBeforeDeploy) {
                                    opts.onBeforeDeploy(ME, {
                                        destination: e.destination,
                                        file: e.file,
                                        target: e.target,
                                    });
                                }
                            },
                            onCompleted: (sender, e) => {
                                COMPLETED(e.error);
                            },
                        });
                    }
                }
                catch (e) {
                    COMPLETED(e);
                }
            });
        })).then(() => {
            COMPLETED(null);
        }).catch((err) => {
            COMPLETED(err);
        });
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
    return new SwitchPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=switch.js.map