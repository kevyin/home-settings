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
class EachPlugin extends deploy_objects.MultiFileDeployPluginBase {
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
            // target.to
            let properties = deploy_helpers.asArray(target['to'])
                .map(p => deploy_helpers.toStringSafe(p).trim())
                .filter(p => '' !== p);
            properties = deploy_helpers.distinctArray(properties);
            let wf = Workflows.create();
            wf.next(() => __awaiter(this, void 0, void 0, function* () {
                // target.from
                let values;
                if (!deploy_helpers.isNullOrUndefined(target.from)) {
                    if (Array.isArray(target.from)) {
                        values = deploy_helpers.asArray(target.from);
                    }
                    else {
                        // from file
                        let src = deploy_helpers.toStringSafe(target.from);
                        let loadedValues = JSON.parse((yield deploy_helpers.loadFrom(src)).data.toString('utf8'));
                        if (!deploy_helpers.isNullOrUndefined(loadedValues)) {
                            values = deploy_helpers.asArray(loadedValues);
                        }
                    }
                }
                values = deploy_helpers.asArray(deploy_helpers.isNullOrUndefined(values) ? [] : values);
                return values.map(v => {
                    if (deploy_helpers.toBooleanSafe(target.usePlaceholders)) {
                        if ('string' === typeof v) {
                            v = me.context.replaceWithValues(v);
                        }
                    }
                    return v;
                });
            }));
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                let values = ctx.previousValue;
                let wfTargets = Workflows.create();
                // collect targets
                me.getTargetsWithPlugins(target, targets).forEach(tp => {
                    // deploy to current target
                    // for each value
                    values.forEach(v => {
                        let clonedTarget = deploy_helpers.cloneObject(tp.target);
                        // fill properties with value
                        wfTargets.next(() => {
                            properties.forEach(p => {
                                clonedTarget[p] = deploy_helpers.cloneObject(v);
                            });
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
                    });
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
            description: i18.t('plugins.each.description'),
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
    return new EachPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=each.js.map