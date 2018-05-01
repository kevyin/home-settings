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
const deploy_helpers = require("./helpers");
const deploy_targets = require("./targets");
const FS = require("fs");
const i18 = require("./i18");
const Path = require("path");
const Workflows = require("node-workflows");
function normalizeFilePath(file) {
    return deploy_helpers.replaceAllStrings(file, Path.sep, '/');
}
/**
 * Synchronizes a document after it has been opened.
 *
 * @param {vscode.TextDocument} doc The document.
 *
 * @returns {Promise<any>} The promise.
 */
function syncDocumentWhenOpen(doc) {
    return syncFileWhenOpen.apply(this, [doc.fileName]);
}
exports.syncDocumentWhenOpen = syncDocumentWhenOpen;
/**
 * Synchronizes a document after it has been opened.
 *
 * @param {vscode.TextDocument} doc The document.
 *
 * @returns {Promise<any>} The promise.
 */
function syncFileWhenOpen(file) {
    let me = this;
    let cfg = me.config;
    let lastConfigUpdate = me.lastConfigUpdate;
    let startTime = me.startTime;
    return new Promise((resolve, reject) => {
        try {
            if (!lastConfigUpdate || !startTime || deploy_helpers.isEmptyString(file)) {
                resolve();
                return;
            }
            file = normalizeFilePath(file);
            let wf = Workflows.create();
            wf.next((ctx) => {
                ctx.result = [];
            });
            me.getPackages().forEach(pkg => {
                wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                    let packagesAndFilters = ctx.result;
                    if (!deploy_helpers.isNullOrUndefined(pkg.syncWhenOpen)) {
                        if (false !== pkg.syncWhenOpen) {
                            let filter;
                            let fastFileCheck = deploy_helpers.toBooleanSafe(pkg.fastCheckOnSync, deploy_helpers.toBooleanSafe(cfg.fastCheckOnSync));
                            if (true === pkg.syncWhenOpen) {
                                // files of package
                                filter = deploy_helpers.cloneObject(pkg);
                                filter.target = pkg.targets;
                            }
                            else {
                                if ('object' === typeof pkg.syncWhenOpen) {
                                    filter = pkg.syncWhenOpen;
                                }
                                else {
                                    // target name
                                    filter = deploy_helpers.cloneObject(pkg);
                                    filter.target = deploy_helpers.toStringSafe(pkg.syncWhenOpen);
                                }
                            }
                            let fileChecker;
                            if (fastFileCheck) {
                                fileChecker = () => {
                                    return deploy_helpers.doesFileMatchByFilter(file, filter);
                                };
                            }
                            else {
                                let filesByFilter = yield deploy_helpers.getFilesByFilterAsync(filter, me.useGitIgnoreStylePatternsInFilter(filter));
                                filesByFilter = filesByFilter.map(x => normalizeFilePath(x));
                                fileChecker = () => {
                                    return filesByFilter.indexOf(file) > -1;
                                };
                            }
                            if (fileChecker()) {
                                packagesAndFilters.push({
                                    filter: filter,
                                    package: pkg,
                                });
                            }
                        }
                    }
                }));
            });
            wf.start().then((packagesAndFilters) => {
                if (packagesAndFilters.length < 1) {
                    resolve();
                    return;
                }
                let targets = me.getTargets();
                let wfPackages = Workflows.create();
                wfPackages.next((ctxPkg) => {
                    return new Promise((res, rej) => {
                        FS.lstat(file, (err, stats) => {
                            if (err) {
                                rej(err);
                            }
                            else {
                                ctxPkg.value = stats;
                                res();
                            }
                        });
                    });
                });
                packagesAndFilters.forEach(pf => {
                    let alwaysSyncIfNewer = deploy_helpers.toBooleanSafe(pf.package.alwaysSyncIfNewer, deploy_helpers.toBooleanSafe(cfg.alwaysSyncIfNewer));
                    let timeToCompareWithLocalFile;
                    if (deploy_helpers.toBooleanSafe(cfg.useWorkspaceStartTimeForSyncWhenOpen, deploy_helpers.toBooleanSafe(pf.package.useWorkspaceStartTimeForSyncWhenOpen))) {
                        timeToCompareWithLocalFile = startTime;
                    }
                    else {
                        timeToCompareWithLocalFile = lastConfigUpdate;
                    }
                    let targetNames = deploy_helpers.asArray(pf.filter.target);
                    targetNames = targetNames.map(x => deploy_helpers.normalizeString(x));
                    targetNames = targetNames.filter(x => '' !== x);
                    if (targetNames.length < 1) {
                        // from package
                        targetNames = deploy_helpers.asArray(pf.package.targets);
                    }
                    // cleanups
                    targetNames = deploy_helpers.asArray(targetNames);
                    targetNames = targetNames.map(x => deploy_helpers.normalizeString(x));
                    targetNames = targetNames.filter(x => '' !== x);
                    targetNames = deploy_helpers.distinctArray(targetNames);
                    let machtingTargets = targets.filter(t => {
                        return targetNames.indexOf(deploy_helpers.normalizeString(t.name))
                            > -1;
                    });
                    deploy_targets.getPluginsForTarget(machtingTargets, me.plugins).forEach(targetWithPlugin => {
                        let supportedPlugins = targetWithPlugin.plugins
                            .filter(x => x.canPull && x.canGetFileInfo);
                        supportedPlugins.forEach(pi => {
                            wfPackages.next((ctxPkg) => {
                                let fileStats = ctxPkg.value;
                                return new Promise((res, rej) => {
                                    let syncCompletedInvoked = false;
                                    let syncCompleted = (err, okMsg) => {
                                        if (syncCompletedInvoked) {
                                            return;
                                        }
                                        syncCompletedInvoked = true;
                                        if (err) {
                                            me.outputChannel.appendLine(i18.t('failed', err));
                                            rej(err);
                                        }
                                        else {
                                            me.outputChannel.appendLine(okMsg);
                                            res();
                                        }
                                    };
                                    try {
                                        // output channel message
                                        {
                                            let targetName = deploy_helpers.toStringSafe(targetWithPlugin.target.name).trim();
                                            let pullingMsg;
                                            if ('' !== targetName) {
                                                targetName = ` ('${targetName}')`;
                                            }
                                            pullingMsg = i18.t('sync.file.synchronize', file, targetName);
                                            me.outputChannel.append(pullingMsg);
                                        }
                                        // get info of remote file
                                        Promise.resolve(pi.getFileInfo(file, targetWithPlugin.target)).then((fi) => {
                                            if (fi) {
                                                if (fi.exists) {
                                                    try {
                                                        let remoteFileIsNewer = false;
                                                        if (fi.modifyTime) {
                                                            remoteFileIsNewer = fi.modifyTime.isAfter(fileStats.mtime);
                                                        }
                                                        if (remoteFileIsNewer) {
                                                            // sync local with remote file ...
                                                            if (alwaysSyncIfNewer || timeToCompareWithLocalFile.isAfter(fileStats.mtime)) {
                                                                // ... if local not changed
                                                                // since the current session
                                                                if (!syncCompletedInvoked) {
                                                                    pi.pullFile(file, targetWithPlugin.target, {
                                                                        onCompleted: (sender, e) => {
                                                                            syncCompleted(e.error, i18.t('ok'));
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                            else {
                                                                syncCompleted(null, i18.t('sync.file.localChangedWithinSession'));
                                                            }
                                                        }
                                                        else {
                                                            syncCompleted(null, i18.t('sync.file.localIsNewer'));
                                                        }
                                                    }
                                                    catch (e) {
                                                        syncCompleted(e);
                                                    }
                                                }
                                                else {
                                                    syncCompleted(null, i18.t('sync.file.doesNotExistOnRemote'));
                                                }
                                            }
                                            else {
                                                syncCompleted(null, i18.t('canceled'));
                                            }
                                        }).catch((err) => {
                                            syncCompleted(err); // could not get file info
                                        });
                                    }
                                    catch (e) {
                                        syncCompleted(e);
                                    }
                                });
                            });
                        });
                    });
                });
                wfPackages.start().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.syncFileWhenOpen = syncFileWhenOpen;
//# sourceMappingURL=sync.js.map