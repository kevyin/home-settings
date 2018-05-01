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
const AWS = require("aws-sdk");
const deploy_contracts = require("../contracts");
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const FS = require("fs");
const i18 = require("../i18");
const Moment = require("moment");
const KNOWN_CREDENTIAL_CLASSES = {
    'cognito': AWS.CognitoIdentityCredentials,
    'ec2': AWS.ECSCredentials,
    'ec2meta': AWS.EC2MetadataCredentials,
    'environment': AWS.EnvironmentCredentials,
    'file': AWS.FileSystemCredentials,
    'saml': AWS.SAMLCredentials,
    'shared': AWS.SharedIniFileCredentials,
    'temp': AWS.TemporaryCredentials,
    'web': AWS.WebIdentityCredentials,
};
class S3BucketPlugin extends deploy_objects.DeployPluginWithContextBase {
    get canGetFileInfo() {
        return true;
    }
    get canPull() {
        return true;
    }
    createContext(target, files, opts) {
        let me = this;
        AWS.config.signatureVersion = "v4";
        let bucketName = deploy_helpers.toStringSafe(target.bucket)
            .trim();
        let acl = deploy_helpers.toStringSafe(target.acl);
        if (deploy_helpers.isEmptyString(acl)) {
            acl = 'public-read';
        }
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
            // detect credential provider
            let credentialClass = AWS.SharedIniFileCredentials;
            let credentialConfig;
            let credentialType;
            if (target.credentials) {
                credentialType = deploy_helpers.toStringSafe(target.credentials.type)
                    .toLowerCase().trim();
                if (!deploy_helpers.isEmptyString(credentialType)) {
                    credentialClass = KNOWN_CREDENTIAL_CLASSES[credentialType];
                }
                credentialConfig = target.credentials.config;
            }
            if (!credentialClass) {
                completed(new Error(i18.t('plugins.s3bucket.credentialTypeNotSupported', credentialType)));
                return;
            }
            try {
                AWS.config.credentials = new credentialClass(credentialConfig);
                let s3bucket = new AWS.S3({
                    params: {
                        Bucket: bucketName,
                        ACL: acl,
                    }
                });
                let wrapper = {
                    context: {
                        bucket: bucketName,
                        connection: s3bucket,
                        dir: dir,
                        hasCancelled: false,
                    },
                };
                me.onCancelling(() => wrapper.context.hasCancelled = true, opts);
                completed(null, wrapper);
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
                let bucketKey = relativePath;
                while (0 === bucketKey.indexOf('/')) {
                    bucketKey = bucketKey.substr(1);
                }
                bucketKey = ctx.dir + bucketKey;
                while (0 === bucketKey.indexOf('/')) {
                    bucketKey = bucketKey.substr(1);
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
                        destination: bucketKey,
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
                        let subCtx = {
                            file: file,
                            remoteFile: relativePath,
                        };
                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx);
                        tCtx.data = data;
                        let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                        Promise.resolve(tResult).then((transformedJsonData) => {
                            ctx.connection.createBucket(() => {
                                if (ctx.hasCancelled) {
                                    completed();
                                    return;
                                }
                                let params = {
                                    Key: bucketKey,
                                    Body: transformedJsonData,
                                };
                                if (!deploy_helpers.isEmptyString(contentType)) {
                                    params['ContentType'] = contentType;
                                }
                                ctx.connection.putObject(params, (err) => {
                                    completed(err);
                                });
                            });
                        }).catch((e) => {
                            completed(e);
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
                    let bucketKey = relativePath;
                    while (0 === bucketKey.indexOf('/')) {
                        bucketKey = bucketKey.substr(1);
                    }
                    while (0 === bucketKey.indexOf('/')) {
                        bucketKey = bucketKey.substr(1);
                    }
                    if (opts.onBeforeDeploy) {
                        opts.onBeforeDeploy(me, {
                            destination: bucketKey,
                            file: file,
                            target: target,
                        });
                    }
                    let params = {
                        Key: bucketKey,
                    };
                    ctx.connection.getObject(params, (err, data) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            try {
                                let subCtx = {
                                    file: file,
                                    remoteFile: relativePath,
                                };
                                let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Restore, subCtx);
                                tCtx.data = data.Body;
                                let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Restore)(tCtx);
                                Promise.resolve(tResult).then((untransformedJsonData) => {
                                    completed(null, untransformedJsonData);
                                }).catch((e) => {
                                    completed(e);
                                });
                            }
                            catch (e) {
                                completed(e);
                            }
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
            let completed = (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            };
            try {
                let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativePath) {
                    completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                    return;
                }
                // remove leading '/' chars
                let bucketKey = relativePath;
                while (0 === bucketKey.indexOf('/')) {
                    bucketKey = bucketKey.substr(1);
                }
                while (0 === bucketKey.indexOf('/')) {
                    bucketKey = bucketKey.substr(1);
                }
                let params = {
                    Key: bucketKey,
                };
                ctx.connection.getObject(params, (err, data) => {
                    let result = {
                        exists: false,
                        isRemote: true,
                    };
                    if (!err && data) {
                        result.exists = true;
                        result.size = data.ContentLength;
                        result.name = target.bucket;
                        result.path = bucketKey;
                        if (data.LastModified) {
                            try {
                                result.modifyTime = Moment(data.LastModified);
                            }
                            catch (e) {
                                //TODO: log
                            }
                        }
                    }
                    completed(null, result);
                });
            }
            catch (e) {
                completed(e);
            }
        });
    }
    info() {
        return {
            description: i18.t('plugins.s3bucket.description'),
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
    return new S3BucketPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=s3bucket.js.map