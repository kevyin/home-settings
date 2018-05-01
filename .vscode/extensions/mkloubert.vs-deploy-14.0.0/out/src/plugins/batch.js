"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_objects = require("../objects");
const i18 = require("../i18");
class BatchPlugin extends deploy_objects.MultiTargetDeployPluginBase {
    createContext(target) {
        return {
            hasCancelled: false,
            targets: this.getTargetsWithPlugins(target, target.targets),
        };
    }
    info() {
        return {
            description: i18.t('plugins.batch.description'),
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
    return new BatchPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=batch.js.map