"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
// The MIT License (MIT)
// 
// vs-deploy (https://github.com/mkloubert/vs-deploy)
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
const deploy_contracts = require("../contracts");
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const deploy_workspace = require("../workspace");
const FS = require("fs");
const FSExtra = require("fs-extra");
const i18 = require("../i18");
const Moment = require("moment");
const Path = require("path");
const Zip = require('node-zip');
class ZIPPlugin extends deploy_objects.ZipFileDeployPluginBase {
    get canPull() {
        return true;
    }
    createZipFile(target, files, opts, direction) {
        let me = this;
        if (direction === deploy_contracts.DeployDirection.Deploy) {
            return super.createZipFile.apply(me, arguments);
        }
        return new Promise((resolve, reject) => {
            let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
            try {
                let targetDir = deploy_helpers.toStringSafe(target.target);
                targetDir = me.context.replaceWithValues(targetDir);
                if (!targetDir) {
                    targetDir = './';
                }
                if (!Path.isAbsolute(targetDir)) {
                    targetDir = Path.join(deploy_workspace.getRootPath(), targetDir);
                }
                let notFound = () => {
                    completed(i18.t('plugins.zip.noFileFound'));
                };
                let loadZIP = (zipFileName) => {
                    if (deploy_helpers.isEmptyString(zipFileName)) {
                        notFound();
                    }
                    else {
                        zipFileName = Path.join(targetDir, deploy_helpers.toStringSafe(zipFileName));
                        FS.readFile(zipFileName, (err, transformedData) => {
                            if (err) {
                                completed(err);
                            }
                            else {
                                try {
                                    let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Restore);
                                    tCtx.data = transformedData;
                                    let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Restore)(tCtx);
                                    Promise.resolve(tResult).then((untransformedData) => {
                                        try {
                                            let zip = Zip(untransformedData, { base64: false });
                                            completed(null, zip);
                                        }
                                        catch (e) {
                                            completed(e);
                                        }
                                    }).catch((err) => {
                                        completed(err);
                                    });
                                }
                                catch (e) {
                                    completed(e);
                                }
                            }
                        });
                    }
                };
                if (deploy_helpers.isEmptyString(target.fileName)) {
                    FS.readdir(targetDir, (err, files) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            const REGEX = /^(workspace_)(\d{8})(_)((\d{6}))(\.)(zip)$/i;
                            files = files.filter(x => REGEX.test(x)).sort((x, y) => {
                                return deploy_helpers.compareValuesBy(y, x, t => deploy_helpers.normalizeString(t));
                            });
                            let zipFileName;
                            if (files.length > 0) {
                                zipFileName = files[0];
                            }
                            loadZIP(zipFileName);
                        }
                    });
                }
                else {
                    // custom filename
                    let zipFileName = deploy_helpers.toStringSafe(target.fileName);
                    zipFileName = me.context.replaceWithValues(zipFileName);
                    loadZIP(zipFileName);
                }
            }
            catch (e) {
                completed(e);
            }
        });
    }
    deployZipFile(zip, target) {
        let now = Moment();
        let me = this;
        let targetDir = deploy_helpers.toStringSafe(target.target);
        targetDir = me.context.replaceWithValues(targetDir);
        if (!targetDir) {
            targetDir = './';
        }
        if (!Path.isAbsolute(targetDir)) {
            targetDir = Path.join(deploy_workspace.getRootPath(), targetDir);
        }
        let openAfterCreated = deploy_helpers.toBooleanSafe(target.open, true);
        return new Promise((resolve, reject) => {
            let completed = (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(zip);
                }
            };
            try {
                // now deploy by saving to file
                let deploy = (zipFile) => {
                    try {
                        let zippedData = new Buffer(zip.generate({
                            base64: false,
                            compression: 'DEFLATE',
                        }), 'binary');
                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform);
                        tCtx.data = zippedData;
                        let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                        Promise.resolve(tResult).then((transformedData) => {
                            FS.writeFile(zipFile, transformedData, (err) => {
                                zippedData = null;
                                if (err) {
                                    completed(err);
                                    return;
                                }
                                completed();
                                if (openAfterCreated) {
                                    deploy_helpers.open(zipFile).catch((err) => {
                                        me.context.log(i18.t('errors.withCategory', 'ZIPPlugin.deployWorkspace()', err));
                                    });
                                }
                            });
                        }).catch((err) => {
                            completed(err);
                        });
                    }
                    catch (e) {
                        completed(e);
                    }
                };
                let deleteFile = (zipFile) => {
                    FS.unlink(zipFile, (err) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            deploy(zipFile);
                        }
                    });
                };
                // check if target directory is
                // really a directory
                let checkIfDirectory = () => {
                    FS.lstat(targetDir, (err, stats) => {
                        try {
                            if (err) {
                                completed(err);
                                return;
                            }
                            if (stats.isDirectory()) {
                                let deleteIfExists = false;
                                let zipFileName;
                                if (deploy_helpers.isEmptyString(target.fileName)) {
                                    zipFileName = `workspace_${now.format('YYYYMMDD')}_${now.format('HHmmss')}.zip`;
                                }
                                else {
                                    // custom filename
                                    // that is deleted if it exists
                                    deleteIfExists = true;
                                    zipFileName = deploy_helpers.toStringSafe(target.fileName);
                                    zipFileName = me.context.replaceWithValues(zipFileName);
                                }
                                let zipFile = Path.join(targetDir, zipFileName);
                                let zipRelativePath = deploy_helpers.toRelativeTargetPathWithValues(zipFile, target, me.context.values());
                                if (false === zipRelativePath) {
                                    zipRelativePath = zipFile;
                                }
                                FS.exists(zipFile, (exists) => {
                                    if (exists) {
                                        if (deleteIfExists) {
                                            deleteFile(zipFile);
                                        }
                                        else {
                                            // we do not overwrite existing files
                                            // with auto generated names
                                            completed(new Error(i18.t('plugins.zip.fileAlreadyExists', zipRelativePath)));
                                        }
                                    }
                                    else {
                                        deploy(zipFile);
                                    }
                                });
                            }
                            else {
                                // no directory
                                completed(new Error(i18.t('isNo.directory', targetDir)));
                            }
                        }
                        catch (e) {
                            completed(e);
                        }
                    });
                };
                // first check if target directory exists
                FS.exists(targetDir, (exists) => {
                    if (exists) {
                        checkIfDirectory();
                    }
                    else {
                        // no => try to create
                        FSExtra.mkdirs(targetDir, function (err) {
                            if (err) {
                                completed(err);
                                return;
                            }
                            checkIfDirectory();
                        });
                    }
                });
            }
            catch (e) {
                completed(e);
            }
        });
    }
    info() {
        return {
            description: i18.t('plugins.zip.description'),
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
    return new ZIPPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=zip.js.map