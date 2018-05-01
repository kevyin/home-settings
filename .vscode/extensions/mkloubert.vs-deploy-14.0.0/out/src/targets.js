"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("./helpers");
const Enumerable = require("node-enumerable");
const MergeDeep = require('merge-deep');
/**
 * Returns targets with their plugins.
 *
 * @param {deploy_contracts.DeployTarget | deploy_contracts.DeployTarget[]} targets One or more target.
 * @param {(deploy_contracts.DeployPlugin|deploy_contracts.DeployPlugin[])} plugins All known plugins.
 *
 * @returns {TargetWithPlugins[]} The targets with their plugins.
 */
function getPluginsForTarget(targets, plugins) {
    let allTargets = deploy_helpers.asArray(targets)
        .filter(x => x);
    return Enumerable.from(allTargets).select(t => {
        let targetType = deploy_helpers.normalizeString(t.type);
        let matchingPlugins = deploy_helpers.asArray(plugins);
        matchingPlugins = matchingPlugins.filter(x => x);
        matchingPlugins = matchingPlugins.filter(pi => {
            let pluginType = deploy_helpers.normalizeString(pi.__type);
            return '' === pluginType ||
                pluginType === targetType;
        });
        return {
            plugins: matchingPlugins,
            target: t,
        };
    }).toArray();
}
exports.getPluginsForTarget = getPluginsForTarget;
/**
 * Returns the list of targets.
 *
 * @returns {DeployTarget[]} The targets.
 */
function getTargets() {
    let me = this;
    let targets = me.allTargetsFromConfig;
    // load from
    targets = deploy_helpers.loadBaseSettingsFromFiles(targets, me.getValues());
    // inherit and merge
    targets = deploy_helpers.mergeInheritables(targets);
    let myName = me.name;
    targets = deploy_helpers.sortTargets(targets, () => myName);
    // isFor
    targets = targets.filter(t => {
        let validHosts = deploy_helpers.asArray(t.isFor)
            .map(x => deploy_helpers.normalizeString(x))
            .filter(x => '' !== x);
        if (validHosts.length < 1) {
            return true;
        }
        return validHosts.indexOf(myName) > -1;
    });
    // platforms
    targets = deploy_helpers.filterPlatformItems(targets);
    // if
    targets = me.filterConditionalItems(targets);
    return targets.map(t => {
        return deploy_helpers.applyValues(t, me.getValues());
    });
}
exports.getTargets = getTargets;
//# sourceMappingURL=targets.js.map