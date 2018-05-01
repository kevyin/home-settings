"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("./helpers");
const deploy_values = require("./values");
const deploy_workspace = require("./workspace");
const FS = require("fs");
const i18 = require("./i18");
const Path = require("path");
const MergeDeep = require('merge-deep');
const OS = require("os");
const vscode = require("vscode");
const Workflows = require("node-workflows");
let buildTaskTimer;
let gitPullTimer;
/**
 * Returns a merged config object.
 *
 * @param {deploy_contracts.DeployConfiguration} cfg The base object.
 *
 * @returns {Promise<deploy_contracts.DeployConfiguration>} The promise.
 */
function mergeConfig(cfg) {
    let values = deploy_values.getBuildInValues();
    values = values.concat(deploy_values.toValueObjects(cfg.values));
    let myName;
    if (cfg) {
        myName = cfg.name;
    }
    if (deploy_helpers.isEmptyString(myName)) {
        myName = OS.hostname();
    }
    myName = deploy_helpers.normalizeString(myName);
    return new Promise((resolve, reject) => {
        let completed = (err, c) => {
            if (err) {
                reject(err);
            }
            else {
                let result = c || cfg;
                if (result) {
                    try {
                        delete result['imports'];
                    }
                    catch (e) {
                        deploy_helpers.log(i18.t('errors.withCategory', 'config.mergeConfig(1)', e));
                    }
                }
                try {
                    result = deploy_helpers.cloneObject(result);
                }
                catch (e) {
                    deploy_helpers.log(i18.t('errors.withCategory', 'config.mergeConfig(2)', e));
                }
                resolve(result);
            }
        };
        try {
            if (cfg) {
                let wf = Workflows.create();
                // normalize list
                // by keeping sure to have
                // import entry objects
                let allImports = deploy_helpers.asArray(cfg.imports).filter(x => x).map(imp => {
                    if ('object' !== typeof imp) {
                        // convert to object
                        imp = {
                            from: deploy_helpers.toStringSafe(imp),
                        };
                    }
                    return imp;
                });
                // isFor
                allImports = allImports.filter(imp => {
                    let validHosts = deploy_helpers.asArray(imp.isFor)
                        .map(x => deploy_helpers.normalizeString(x))
                        .filter(x => '' !== x);
                    if (validHosts.length < 1) {
                        return true;
                    }
                    return validHosts.indexOf(myName) > -1;
                });
                // platforms
                allImports = deploy_helpers.filterPlatformItems(allImports);
                // if
                allImports = deploy_helpers.filterConditionalItems(allImports, values);
                // sort
                allImports = allImports.sort((x, y) => {
                    return deploy_helpers.compareValuesBy(x, y, t => deploy_helpers.getSortValue(t, () => myName));
                });
                // build workflow actions for each import entry
                allImports.filter(x => x).forEach(imp => {
                    wf.next((ctx) => {
                        let c = ctx.value;
                        return new Promise((res, rej) => {
                            try {
                                // get file path
                                let src = deploy_helpers.toStringSafe(imp.from);
                                src = deploy_values.replaceWithValues(values, src);
                                if (!Path.isAbsolute(src)) {
                                    src = Path.join(deploy_workspace.getRootPath(), '.vscode', src);
                                }
                                src = Path.resolve(src);
                                let loadImportFile = () => {
                                    FS.readFile(src, (err, data) => {
                                        if (err) {
                                            rej(err);
                                        }
                                        else {
                                            try {
                                                if (data && data.length > 0) {
                                                    let childCfg = JSON.parse(data.toString('utf8'));
                                                    if (childCfg) {
                                                        mergeConfig(childCfg).then((cc) => {
                                                            try {
                                                                if (cc) {
                                                                    let newCfg = cc;
                                                                    if (deploy_helpers.toBooleanSafe(imp.merge, true)) {
                                                                        newCfg = MergeDeep({}, c, cc);
                                                                    }
                                                                    cc = newCfg;
                                                                }
                                                                ctx.value = deploy_helpers.cloneObject(cc);
                                                                res();
                                                            }
                                                            catch (e) {
                                                                rej(e); // update error
                                                            }
                                                        }).catch((err) => {
                                                            rej(err);
                                                        });
                                                    }
                                                    else {
                                                        res(); // empty => no update
                                                    }
                                                }
                                                else {
                                                    res(); // no data
                                                }
                                            }
                                            catch (e) {
                                                res(e); // JSON error
                                            }
                                        }
                                    });
                                };
                                if ('' !== src.trim()) {
                                    // first check if file exists
                                    FS.exists(src, (exists) => {
                                        if (exists) {
                                            loadImportFile();
                                        }
                                        else {
                                            res(); // files does no exist
                                        }
                                    });
                                }
                                else {
                                    res(); // no file defined
                                }
                            }
                            catch (e) {
                                rej(e);
                            }
                        });
                    });
                });
                wf.on('action.after', (err, ctx) => {
                    if (!err) {
                        ctx.result = ctx.value; // update result
                    }
                });
                wf.start(cfg).then((newCfg) => {
                    completed(null, newCfg || cfg);
                }).catch((err) => {
                    completed(err);
                });
            }
            else {
                completed(null);
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.mergeConfig = mergeConfig;
/**
 * Runs the build task, if defined in config.
 */
function runBuildTask() {
    let me = this;
    let cfg = me.config;
    // close old timer (if defined)
    try {
        let btt = buildTaskTimer;
        if (btt) {
            clearTimeout(btt);
        }
    }
    catch (e) {
        me.log(i18.t('errors.withCategory', 'config.runBuildTask(1)', e));
    }
    finally {
        buildTaskTimer = null;
    }
    let doRun = false;
    let timeToWait;
    if (!deploy_helpers.isNullOrUndefined(cfg.runBuildTaskOnStartup)) {
        if ('boolean' === typeof cfg.runBuildTaskOnStartup) {
            doRun = cfg.runBuildTaskOnStartup;
        }
        else {
            doRun = true;
            timeToWait = parseInt(deploy_helpers.toStringSafe(cfg.runBuildTaskOnStartup));
        }
    }
    let executeBuildTaskCommand = () => {
        vscode.commands.executeCommand('workbench.action.tasks.build').then(() => {
        }, (err) => {
            me.log(i18.t('errors.withCategory', 'config.runBuildTask(2)', err));
        });
    };
    if (doRun) {
        if (isNaN(timeToWait)) {
            executeBuildTaskCommand();
        }
        else {
            buildTaskTimer = setTimeout(() => {
                executeBuildTaskCommand();
            }, timeToWait);
        }
    }
}
exports.runBuildTask = runBuildTask;
/**
 * Runs the git sync, if defined in config.
 *
 * @return {Promise<any>} The promise.
 */
function runGitPull() {
    let me = this;
    let cfg = me.config;
    return new Promise((resolve, reject) => {
        try {
            // close old timer (if defined)
            try {
                let gst = gitPullTimer;
                if (gst) {
                    clearTimeout(gst);
                }
            }
            catch (e) {
                me.log(i18.t('errors.withCategory', 'config.runGitPull(1)', e));
            }
            finally {
                gitPullTimer = null;
            }
            let doRun = false;
            let timeToWait;
            if (!deploy_helpers.isNullOrUndefined(cfg.runGitPullOnStartup)) {
                if ('boolean' === typeof cfg.runGitPullOnStartup) {
                    doRun = cfg.runGitPullOnStartup;
                }
                else {
                    doRun = true;
                    timeToWait = parseInt(deploy_helpers.toStringSafe(cfg.runGitPullOnStartup));
                }
            }
            let executeGitSyncCommand = () => {
                vscode.commands.executeCommand('git.pull').then(() => {
                    resolve();
                }, (err) => {
                    reject(err);
                });
            };
            if (doRun) {
                if (isNaN(timeToWait)) {
                    executeGitSyncCommand();
                }
                else {
                    gitPullTimer = setTimeout(() => {
                        executeGitSyncCommand();
                    }, timeToWait);
                }
            }
            else {
                resolve();
            }
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.runGitPull = runGitPull;
//# sourceMappingURL=config.js.map