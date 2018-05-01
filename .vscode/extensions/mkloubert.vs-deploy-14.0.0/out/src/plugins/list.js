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
const deploy_plugins = require("../plugins");
const i18 = require("../i18");
const Workflows = require("node-workflows");
const vscode = require("vscode");
class ListPlugin extends deploy_objects.MultiFileDeployPluginBase {
    deployWorkspace(files, target, opts) {
        if (!opts) {
            opts = {};
        }
        let hasCancelled = false;
        let completedInvoked = false;
        let completed = (err) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    target: target,
                });
            }
        };
        let me = this;
        me.onCancelling(() => hasCancelled = true, opts);
        let afterWorkflowsAction = (err, ctx) => {
            if (ctx && hasCancelled) {
                ctx.finish();
            }
        };
        try {
            let allEntries = deploy_helpers.asArray(target.entries)
                .filter(x => x);
            let targets = deploy_helpers.asArray(target.targets)
                .map(t => deploy_helpers.normalizeString(t))
                .filter(t => '' !== t);
            targets = deploy_helpers.distinctArray(targets);
            let wf = Workflows.create();
            // let user select one entry
            wf.next((wfCtx) => {
                return new Promise((resolve, reject) => {
                    if (allEntries.length > 0) {
                        let quickPicks = allEntries.map((e, i) => {
                            let label = deploy_helpers.toStringSafe(e.name).trim();
                            if ('' === label) {
                                label = `Entry #${i}`;
                            }
                            let desc = deploy_helpers.toStringSafe(e.description).trim();
                            let detail = me.context.replaceWithValues(e.detail);
                            if (deploy_helpers.isEmptyString(detail)) {
                                detail = undefined;
                            }
                            return {
                                description: desc,
                                detail: detail,
                                entry: e,
                                label: label,
                            };
                        });
                        let placeholder = deploy_helpers.toStringSafe(target.placeholder).trim();
                        if ('' === placeholder) {
                            placeholder = i18.t('plugins.list.selectEntry');
                        }
                        vscode.window.showQuickPick(quickPicks, {
                            placeHolder: placeholder,
                        }).then((qp) => {
                            if (qp) {
                                wfCtx.value = qp.entry;
                            }
                            resolve();
                        }, (err) => {
                            reject(err);
                        });
                    }
                    else {
                        resolve();
                    }
                });
            });
            // cancel if user has NOT selected
            // any entry
            wf.next((wfCtx) => {
                if (!wfCtx.value) {
                    hasCancelled = true;
                    afterWorkflowsAction(null, wfCtx);
                }
            });
            // create an action for each target
            me.getTargetsWithPlugins(target, targets).forEach(tp => {
                wf.next((wfCtx) => __awaiter(this, void 0, void 0, function* () {
                    let entry = wfCtx.value;
                    let wfTarget = Workflows.create();
                    // deploy for each plugin
                    tp.plugins.forEach(p => {
                        let clonedTarget = deploy_helpers.cloneObject(tp.target);
                        // apply settings
                        let settings = deploy_helpers.cloneObject(entry.settings);
                        for (let prop in settings) {
                            clonedTarget[prop] = settings[prop];
                        }
                        wfTarget.next((wfTargetCtx) => {
                            return new Promise((resolve, reject) => {
                                p.deployWorkspace(files, clonedTarget, {
                                    baseDirectory: opts.baseDirectory,
                                    context: deploy_plugins.createPluginContext(opts.context || me.context),
                                    onBeforeDeployFile: (sender, e) => {
                                        if (opts.onBeforeDeployFile) {
                                            opts.onBeforeDeployFile(me, {
                                                destination: e.destination,
                                                file: e.file,
                                                target: clonedTarget,
                                            });
                                        }
                                    },
                                    onCompleted: (sender, e) => {
                                        if (e.error) {
                                            reject(e.error);
                                        }
                                        else {
                                            resolve();
                                        }
                                    },
                                    onFileCompleted: (sender, e) => {
                                        if (opts.onFileCompleted) {
                                            opts.onFileCompleted(me, {
                                                canceled: e.canceled,
                                                error: e.error,
                                                file: e.file,
                                                target: clonedTarget,
                                            });
                                        }
                                    },
                                });
                            });
                        });
                    });
                    wfTarget.on('action.after', afterWorkflowsAction);
                    yield wfTarget.start();
                }));
            });
            wf.on('action.after', afterWorkflowsAction);
            // start the workflow
            wf.start().then(() => {
                completed(null);
            }).catch((err) => {
                completed(err);
            });
        }
        catch (e) {
            completed(e);
        }
    }
    info() {
        return {
            description: i18.t('plugins.list.description'),
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
    return new ListPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=list.js.map