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
const Crypto = require("crypto");
const deploy_contracts = require("../contracts");
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const FS = require("fs");
const i18 = require("../i18");
const Moment = require("moment");
const Net = require("net");
const UUID = require("uuid");
const ZLib = require("zlib");
class RemotePlugin extends deploy_objects.DeployPluginWithContextBase {
    createContext(target, files, opts) {
        let me = this;
        return new Promise((resolve, reject) => {
            try {
                let now = Moment().utc();
                let hosts = deploy_helpers.asArray(target.hosts)
                    .map(x => deploy_helpers.toStringSafe(x))
                    .filter(x => x);
                let id = deploy_helpers.toStringSafe(UUID.v4());
                id = deploy_helpers.replaceAllStrings(id, '-', '');
                let ctx = {
                    counter: 0,
                    hasCancelled: false,
                    hosts: hosts,
                    session: `${now.format('YYYYMMDDHHmmss')}-${id}`,
                    totalCount: files.length,
                };
                me.onCancelling(() => ctx.hasCancelled = true, opts);
                let wrapper = {
                    context: ctx,
                };
                resolve(wrapper);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deployFileWithContext(ctx, file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        ++ctx.counter;
        let allErrors = [];
        let completed = (err) => {
            if (err) {
                allErrors.push(err);
            }
            if (allErrors.length > 1) {
                err = new Error(allErrors.map((x, i) => i18.t('errors.countable', i + 1, x))
                    .join('\n\n'));
            }
            else if (1 === allErrors.length) {
                err = allErrors[0];
            }
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
            // data transformer
            let transformer = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform);
            // whole JSON transformer
            let jsonTransformer = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform, (t) => t.messageTransformer);
            let pwd = deploy_helpers.toStringSafe(target.password);
            if ('' !== pwd) {
                // add password wrapper
                let baseJsonTransformer = jsonTransformer;
                let pwdAlgo = deploy_helpers.normalizeString(target.passwordAlgorithm);
                if ('' === pwdAlgo) {
                    pwdAlgo = deploy_contracts.DEFAULT_PASSWORD_ALGORITHM;
                }
                jsonTransformer = (ctx) => {
                    return new Promise((resolve, reject) => {
                        try {
                            let btResult = Promise.resolve(baseJsonTransformer(ctx));
                            btResult.then((uncryptedData) => {
                                try {
                                    let cipher = Crypto.createCipher(pwdAlgo, pwd);
                                    let a = cipher.update(uncryptedData);
                                    let b = cipher.final();
                                    // return crypted data
                                    resolve(Buffer.concat([a, b]));
                                }
                                catch (e) {
                                    reject(e);
                                }
                            }).catch((err) => {
                                reject(err);
                            });
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                };
            }
            try {
                let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativePath) {
                    completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                    return;
                }
                while (0 === relativePath.indexOf('/')) {
                    relativePath = relativePath.substr(1);
                }
                if (!relativePath) {
                    completed(new Error(i18.t('relativePaths.isEmpty', file)));
                    return;
                }
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(me, {
                        destination: relativePath,
                        file: file,
                        target: target,
                    });
                }
                FS.readFile(file, (err, data) => {
                    if (err) {
                        completed(err);
                        return;
                    }
                    try {
                        let remoteFile = {
                            isFirst: 1 === ctx.counter,
                            isLast: ctx.counter === ctx.totalCount,
                            name: relativePath,
                            nr: ctx.counter,
                            session: ctx.session,
                            tag: target.tag,
                            totalCount: ctx.totalCount,
                        };
                        let transformCtx = {
                            file: file,
                            globals: me.context.globals(),
                            remoteFile: remoteFile,
                        };
                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, transformCtx);
                        tCtx.data = data;
                        let tResult = Promise.resolve(transformer(tCtx));
                        tResult.then((transformedFileData) => {
                            ZLib.gzip(transformedFileData, (err, compressedData) => {
                                if (err) {
                                    completed(err);
                                    return;
                                }
                                if (deploy_helpers.isNullOrUndefined(transformCtx.compress)) {
                                    // auto compression
                                    remoteFile.isCompressed = compressedData.length < transformedFileData.length;
                                }
                                else {
                                    remoteFile.isCompressed = deploy_helpers.toBooleanSafe(transformCtx.compress);
                                }
                                let dataToSend = remoteFile.isCompressed ? compressedData : transformedFileData;
                                try {
                                    remoteFile.data = dataToSend.toString('base64');
                                }
                                catch (e) {
                                    completed(e);
                                    return;
                                }
                                let json;
                                try {
                                    json = new Buffer(JSON.stringify(remoteFile), 'utf8');
                                }
                                catch (e) {
                                    completed(e);
                                    return;
                                }
                                try {
                                    let jsonTransformerCtx = {
                                        file: file,
                                        globals: me.context.globals(),
                                        remoteFile: remoteFile,
                                    };
                                    let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, jsonTransformerCtx);
                                    tCtx.data = json;
                                    tCtx.options = deploy_helpers.cloneObject(target.messageTransformerOptions);
                                    let tResult = jsonTransformer(tCtx);
                                    Promise.resolve(tResult).then((transformedJsonData) => {
                                        let hostsTodo = ctx.hosts.map(x => x);
                                        let deployNext;
                                        deployNext = () => {
                                            if (hostsTodo.length < 1) {
                                                completed();
                                                return;
                                            }
                                            let h = hostsTodo.pop();
                                            if (!h) {
                                                completed();
                                                return;
                                            }
                                            let hostCompleted = (err) => {
                                                if (err) {
                                                    allErrors.push(err);
                                                }
                                                deployNext();
                                            };
                                            try {
                                                let addr = h;
                                                let port = deploy_contracts.DEFAULT_PORT;
                                                let separator = h.indexOf(':');
                                                if (separator > -1) {
                                                    addr = deploy_helpers.toStringSafe(h.substr(0, separator).toLowerCase().trim(), deploy_contracts.DEFAULT_HOST);
                                                    port = parseInt(deploy_helpers.toStringSafe(h.substr(separator + 1).trim(), '' + deploy_contracts.DEFAULT_PORT));
                                                }
                                                let client = new Net.Socket();
                                                client.on('error', (err) => {
                                                    hostCompleted(err);
                                                });
                                                client.connect(port, addr, (err) => {
                                                    if (err) {
                                                        hostCompleted(err);
                                                        return;
                                                    }
                                                    try {
                                                        let dataLength = Buffer.alloc(4);
                                                        dataLength.writeUInt32LE(transformedJsonData.length, 0);
                                                        client.write(dataLength);
                                                        client.write(transformedJsonData);
                                                        try {
                                                            client.destroy();
                                                        }
                                                        catch (e) {
                                                            me.context.log(i18.t('errors.withCategory', 'RemotePlugin.deployFile().client.connect()', e));
                                                        }
                                                        hostCompleted();
                                                    }
                                                    catch (e) {
                                                        hostCompleted(e);
                                                    }
                                                });
                                            }
                                            catch (e) {
                                                hostCompleted(e);
                                            }
                                        };
                                        deployNext();
                                    }).catch((err) => {
                                        completed(err); // JSON data transformation failed
                                    });
                                }
                                catch (e) {
                                    completed(e);
                                }
                            });
                        }).catch((err) => {
                            completed(err); // file data transformation failed
                        });
                    }
                    catch (e) { // tResult
                        completed(e);
                    }
                });
            }
            catch (e) {
                completed(e);
            }
        }
    }
    info() {
        return {
            description: i18.t('plugins.remote.description'),
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
    return new RemotePlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=remote.js.map