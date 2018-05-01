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
const AzureStorage = require("azure-storage");
const deploy_contracts = require("../contracts");
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const FS = require("fs");
const i18 = require("../i18");
const Moment = require("moment");
const Path = require("path");
const TMP = require("tmp");
const vscode = require("vscode");
const TARGET_CACHE_ACCESS_KEY = 'accessKey';
class AzureBlobPlugin extends deploy_objects.DeployPluginWithContextBase {
    get canGetFileInfo() {
        return true;
    }
    get canPull() {
        return true;
    }
    createContext(target, files, opts) {
        let me = this;
        let containerName = deploy_helpers.toStringSafe(target.container)
            .trim();
        let dir = deploy_helpers.toStringSafe(target.dir).trim();
        while ((dir.length > 0) && (0 === dir.indexOf('/'))) {
            dir = dir.substr(1).trim();
        }
        while ((dir.length > 0) && ((dir.length - 1) === dir.lastIndexOf('/'))) {
            dir = dir.substr(0, dir.length - 1).trim();
        }
        dir += '/';
        return new Promise((resolve, reject) => {
            let completed = (err, wrapper) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(wrapper);
                }
            };
            try {
                let accessKey = deploy_helpers.toStringSafe(target.accessKey);
                let ctx = {
                    container: containerName,
                    dir: dir,
                    hasCancelled: false,
                    service: undefined,
                };
                let wrapper = {
                    context: ctx,
                };
                me.onCancelling(() => wrapper.context.hasCancelled = true, opts);
                let prepareWrapper = (hasCancelled) => {
                    try {
                        ctx.hasCancelled = hasCancelled;
                        if (!ctx.hasCancelled) {
                            ctx.service = AzureStorage.createBlobService(target.account, accessKey, target.host);
                        }
                        completed(null, wrapper);
                    }
                    catch (e) {
                        completed(e);
                    }
                };
                let askForTokenIfNeeded = () => {
                    let showKeyPrompt = false;
                    if (deploy_helpers.isEmptyString(accessKey)) {
                        // no token
                        let keyFromCache = deploy_helpers.toStringSafe(me.context.targetCache().get(target, TARGET_CACHE_ACCESS_KEY));
                        if ('' === keyFromCache) {
                            // nothing in cache
                            showKeyPrompt = deploy_helpers.toBooleanSafe(target.promptForKey, true);
                        }
                        else {
                            accessKey = keyFromCache;
                        }
                    }
                    if (showKeyPrompt) {
                        vscode.window.showInputBox({
                            ignoreFocusOut: true,
                            placeHolder: i18.t('prompts.inputAccessKey'),
                            password: true,
                        }).then((keyFromUser) => {
                            if (deploy_helpers.isEmptyString(keyFromUser)) {
                                // cancelled
                                prepareWrapper(true);
                            }
                            else {
                                accessKey = keyFromUser;
                                me.context.targetCache().set(target, TARGET_CACHE_ACCESS_KEY, keyFromUser);
                                prepareWrapper(false);
                            }
                        }, (err) => {
                            completed(err);
                        });
                    }
                    else {
                        prepareWrapper(false);
                    }
                };
                askForTokenIfNeeded();
            }
            catch (e) {
                completed(e);
            }
        });
    }
    deployFileWithContext(ctx, file, target, opts) {
        let me = this;
        let completed = (err) => {
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: ctx.hasCancelled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        if (ctx.hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            try {
                let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativePath) {
                    completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                    return;
                }
                // remove leading '/' chars
                let blob = relativePath;
                while (0 === blob.indexOf('/')) {
                    blob = blob.substr(1);
                }
                blob = ctx.dir + blob;
                while (0 === blob.indexOf('/')) {
                    blob = blob.substr(1);
                }
                let contentType = deploy_helpers.normalizeString(target.contentType);
                if ('' === contentType) {
                    // no explicit content type
                    if (deploy_helpers.toBooleanSafe(target.detectMime, true)) { // detect?
                        contentType = deploy_helpers.detectMimeByFilename(file);
                    }
                }
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(me, {
                        destination: blob,
                        file: file,
                        target: target,
                    });
                }
                FS.readFile(file, (err, data) => {
                    if (err) {
                        completed(err);
                        return;
                    }
                    if (ctx.hasCancelled) {
                        completed();
                        return;
                    }
                    try {
                        let accessLevel = deploy_helpers.toStringSafe(target.publicAccessLevel);
                        if (deploy_helpers.isEmptyString(accessLevel)) {
                            accessLevel = 'blob';
                        }
                        let opts = {
                            publicAccessLevel: accessLevel
                        };
                        let subCtx = {
                            file: file,
                            remoteFile: relativePath,
                        };
                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx);
                        tCtx.data = data;
                        let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                        Promise.resolve(tResult).then((transformedData) => {
                            ctx.service.createContainerIfNotExists(ctx.container, opts, (err) => {
                                if (err) {
                                    completed(err);
                                    return;
                                }
                                if (ctx.hasCancelled) {
                                    completed();
                                    return;
                                }
                                ctx.service.createBlockBlobFromText(ctx.container, blob, transformedData, {
                                    contentSettings: {
                                        contentType: contentType,
                                    },
                                }, (err) => {
                                    completed(err);
                                });
                            });
                        }).catch((err) => {
                            completed(err);
                        });
                    }
                    catch (e) {
                        completed(e);
                    }
                });
            }
            catch (e) {
                completed(e);
            }
        }
    }
    downloadFileWithContext(ctx, file, target, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            let completed = (err, data) => {
                if (opts.onCompleted) {
                    opts.onCompleted(me, {
                        canceled: ctx.hasCancelled,
                        error: err,
                        file: file,
                        target: target,
                    });
                }
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            };
            if (ctx.hasCancelled) {
                completed(null); // cancellation requested
            }
            else {
                try {
                    let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                    if (false === relativePath) {
                        completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                        return;
                    }
                    // remove leading '/' chars
                    let blob = relativePath;
                    while (0 === blob.indexOf('/')) {
                        blob = blob.substr(1);
                    }
                    blob = ctx.dir + blob;
                    while (0 === blob.indexOf('/')) {
                        blob = blob.substr(1);
                    }
                    if (opts.onBeforeDeploy) {
                        opts.onBeforeDeploy(me, {
                            destination: blob,
                            file: file,
                            target: target,
                        });
                    }
                    TMP.tmpName({
                        keep: true,
                    }, (err, tmpPath) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            // delete temp file
                            let deleteTempFile = (e, data) => {
                                FS.exists(tmpPath, (exists) => {
                                    if (exists) {
                                        FS.unlink(tmpPath, () => {
                                            completed(e, data);
                                        });
                                    }
                                    else {
                                        completed(e, data); // nothing to delete
                                    }
                                });
                            };
                            ctx.service.getBlobToLocalFile(ctx.container, blob, tmpPath, (e) => {
                                if (e) {
                                    deleteTempFile(e); // could not download blob
                                }
                                else {
                                    FS.readFile(tmpPath, (e, data) => {
                                        try {
                                            let subCtx = {
                                                file: file,
                                                remoteFile: relativePath,
                                                tempFile: tmpPath,
                                            };
                                            let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Restore, subCtx);
                                            tCtx.data = data;
                                            let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Restore)(tCtx);
                                            Promise.resolve(tResult).then((untransformedData) => {
                                                deleteTempFile(null, untransformedData);
                                            }).catch((err) => {
                                                deleteTempFile(err);
                                            });
                                        }
                                        catch (err) {
                                            deleteTempFile(err);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                catch (e) {
                    completed(e);
                }
            }
        });
    }
    getFileInfoWithContext(ctx, file, target, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            let completed = (err, info) => {
                if (!info) {
                    info = {
                        exists: false,
                        isRemote: true,
                    };
                }
                resolve(info);
            };
            if (ctx.hasCancelled) {
                completed(null); // cancellation requested
            }
            else {
                try {
                    let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                    if (false === relativePath) {
                        completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                        return;
                    }
                    // remove leading '/' chars
                    let blob = relativePath;
                    while (0 === blob.indexOf('/')) {
                        blob = blob.substr(1);
                    }
                    blob = ctx.dir + blob;
                    while (0 === blob.indexOf('/')) {
                        blob = blob.substr(1);
                    }
                    ctx.service.getBlobProperties(ctx.container, blob, (err, result) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            let info = {
                                exists: true,
                                isRemote: true,
                                name: Path.basename(relativePath),
                                path: Path.dirname(relativePath),
                            };
                            if (!deploy_helpers.isNullUndefinedOrEmptyString(result.lastModified)) {
                                try {
                                    info.modifyTime = Moment(result.lastModified);
                                }
                                catch (e) {
                                }
                            }
                            if (!deploy_helpers.isNullUndefinedOrEmptyString(result.contentLength)) {
                                try {
                                    info.size = parseInt(deploy_helpers.toStringSafe(result.contentLength).trim());
                                }
                                catch (e) {
                                }
                            }
                            completed(err, info);
                        }
                    });
                }
                catch (e) {
                    completed(e);
                }
            }
        });
    }
    info() {
        return {
            description: i18.t('plugins.azureblob.description'),
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
    return new AzureBlobPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=azureblob.js.map