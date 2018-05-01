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
function flattenMapItem(items, context, level = 0, maxDepth = 64) {
    return __awaiter(this, void 0, void 0, function* () {
        let objs = [];
        if (level < maxDepth) {
            let itemList = deploy_helpers.asArray(items).filter(mi => {
                if ('object' !== typeof mi) {
                    return !deploy_helpers.isEmptyString(mi);
                }
                return !deploy_helpers.isNullOrUndefined(mi);
            });
            for (let i = 0; i < itemList.length; i++) {
                let mi = itemList[i];
                if ('object' !== typeof mi) {
                    let src = deploy_helpers.toStringSafe(mi);
                    let json = JSON.parse((yield deploy_helpers.loadFrom(src)).data.toString('utf8'));
                    if (json) {
                        let subObjs = yield flattenMapItem(json, context, level + 1, maxDepth);
                        objs = objs.concat(subObjs);
                    }
                }
                else {
                    objs.push(mi);
                }
            }
        }
        return objs;
    });
}
function parsePlaceHolders(v, usePlaceHolders, context, level = 0, maxDepth = 64) {
    v = deploy_helpers.cloneObject(v);
    if (level < maxDepth) {
        usePlaceHolders = deploy_helpers.toBooleanSafe(usePlaceHolders);
        if (usePlaceHolders) {
            if ('object' === typeof v) {
                for (let p in v) {
                    v[p] = parsePlaceHolders(v[p], usePlaceHolders, context, level + 1, maxDepth);
                }
            }
            else {
                if ('string' === typeof v) {
                    v = context.replaceWithValues(v);
                }
            }
        }
    }
    else {
        context.log(`[WARNING] map.parsePlaceHolders(): Maximum reached: ${level}`);
    }
    return v;
}
class MapPlugin extends deploy_objects.MultiFileDeployPluginBase {
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
            // target.targets
            let targets = deploy_helpers.asArray(target.targets)
                .map(t => deploy_helpers.normalizeString(t))
                .filter(t => '' !== t);
            targets = deploy_helpers.distinctArray(targets);
            let wf = Workflows.create();
            // collect values
            wf.next(() => __awaiter(this, void 0, void 0, function* () {
                // targets.from
                return deploy_helpers.asArray(yield flattenMapItem(target.from, me.context))
                    .map(v => parsePlaceHolders(v, target.usePlaceholders, me.context));
            }));
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                let values = ctx.previousValue;
                let wfTargets = Workflows.create();
                // collect targets
                me.getTargetsWithPlugins(target, targets).forEach(tp => {
                    // deploy to current target
                    // for each value
                    values.forEach((v) => __awaiter(this, void 0, void 0, function* () {
                        let clonedTarget = deploy_helpers.cloneObject(tp.target);
                        // fill properties with value
                        wfTargets.next(() => {
                            for (let p in v) {
                                clonedTarget[p] = deploy_helpers.cloneObject(v[p]);
                            }
                        });
                        // deploy
                        wfTargets.next(() => __awaiter(this, void 0, void 0, function* () {
                            let wfPlugins = Workflows.create();
                            // to each underlying plugin
                            tp.plugins.forEach(p => {
                                wfPlugins.next(() => {
                                    return new Promise((resolve, reject) => {
                                        try {
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
                                        }
                                        catch (e) {
                                            reject(e);
                                        }
                                    });
                                });
                            });
                            wfPlugins.on('action.after', afterWorkflowsAction);
                            yield wfPlugins.start();
                        }));
                    }));
                });
                wfTargets.on('action.after', afterWorkflowsAction);
                yield wfTargets.start();
            }));
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
            description: i18.t('plugins.map.description'),
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
    return new MapPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=map.js.map