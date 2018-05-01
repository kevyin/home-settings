"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("./helpers");
const MergeDeep = require('merge-deep');
/**
 * Returns the list of packages.
 *
 * @returns {DeployPackage[]} The packages.
 */
function getPackages() {
    let me = this;
    let packages = (me.config.packages || []).filter(x => x);
    // load from
    packages = deploy_helpers.loadBaseSettingsFromFiles(packages, me.getValues());
    // inherit and merge
    packages = deploy_helpers.mergeInheritables(packages);
    let myName = me.name;
    packages = deploy_helpers.sortPackages(packages, () => myName);
    // isFor
    packages = packages.filter(p => {
        let validHosts = deploy_helpers.asArray(p.isFor)
            .map(x => deploy_helpers.normalizeString(x))
            .filter(x => '' !== x);
        if (validHosts.length < 1) {
            return true;
        }
        return validHosts.indexOf(myName) > -1;
    });
    // platforms
    packages = deploy_helpers.filterPlatformItems(packages);
    // if
    packages = me.filterConditionalItems(packages);
    return packages.map(p => {
        return deploy_helpers.applyValues(p, me.getValues());
    });
}
exports.getPackages = getPackages;
//# sourceMappingURL=packages.js.map