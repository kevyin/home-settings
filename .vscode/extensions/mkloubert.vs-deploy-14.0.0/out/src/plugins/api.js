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
const FS = require("fs");
const HTTP = require("http");
const HTTPs = require("http");
const i18 = require("../i18");
const URL = require("url");
const vscode = require("vscode");
const TARGET_CACHE_PASSWORD = 'password';
class ApiPlugin extends deploy_objects.DeployPluginBase {
    askForPasswordIfNeeded(target) {
        let me = this;
        return new Promise((resolve, reject) => {
            let completed = (err, cancelled) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(cancelled);
                }
            };
            let showPasswordPrompt = false;
            if (!deploy_helpers.isEmptyString(target.user) && deploy_helpers.isNullOrUndefined(target.password)) {
                // user defined, but no password
                let pwdFromCache = deploy_helpers.toStringSafe(me.context.targetCache().get(target, TARGET_CACHE_PASSWORD));
                if ('' === pwdFromCache) {
                    // nothing in cache
                    showPasswordPrompt = deploy_helpers.toBooleanSafe(target.promptForPassword, true);
                }
                else {
                    target.password = pwdFromCache;
                }
            }
            if (showPasswordPrompt) {
                vscode.window.showInputBox({
                    ignoreFocusOut: true,
                    placeHolder: i18.t('prompts.inputPassword'),
                    password: true,
                }).then((passwordFromUser) => {
                    if ('undefined' === typeof passwordFromUser) {
                        completed(null, true); // cancelled
                    }
                    else {
                        target.password = passwordFromUser;
                        me.context.targetCache().set(target, TARGET_CACHE_PASSWORD, passwordFromUser);
                        completed(null, false);
                    }
                }, (err) => {
                    completed(err);
                });
            }
            else {
                completed(null, false);
            }
        });
    }
    get canPull() {
        return true;
    }
    /** @inheritdoc */
    deployFile(file, target, opts) {
        let me = this;
        target = deploy_helpers.cloneObject(target);
        let hasCancelled = false;
        let completed = (err) => {
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    canceled: hasCancelled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        me.onCancelling(() => {
            hasCancelled = true;
        });
        if (hasCancelled) {
            completed();
            return;
        }
        try {
            let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
            if (false === relativePath) {
                completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                return;
            }
            let host = deploy_helpers.normalizeString(target.host);
            if (!host) {
                host = '127.0.0.1';
            }
            let port = target.port;
            if (deploy_helpers.isEmptyString(port)) {
                port = 1781;
            }
            else {
                port = parseInt(deploy_helpers.toStringSafe(port).trim());
            }
            let isSecure = deploy_helpers.toBooleanSafe(target.isSecure);
            let headers = {
                'Content-type': deploy_helpers.detectMimeByFilename(file),
            };
            let user = deploy_helpers.normalizeString(target.user);
            if (user) {
                let pwd = deploy_helpers.toStringSafe(target.password);
                headers['Authorization'] = `Basic ${(new Buffer(user + ':' + pwd).toString('base64'))}`;
            }
            let destination = `http${isSecure ? 's' : ''}://${host}:${port}/api/workspace${relativePath}`;
            let url = URL.parse(destination);
            if (opts.onBeforeDeploy) {
                opts.onBeforeDeploy(me, {
                    destination: destination,
                    file: file,
                    target: target,
                });
            }
            let startRequest = (data) => {
                try {
                    let reqOpts = {
                        headers: headers,
                        host: host,
                        method: 'PUT',
                        path: url.pathname,
                        port: port,
                        protocol: url.protocol,
                    };
                    let responseListener = (res) => {
                        let err;
                        if (res.statusCode >= 400 && res.statusCode < 500) {
                            switch (res.statusCode) {
                                case 401:
                                    err = new Error(i18.t('plugins.api.clientErrors.unauthorized'));
                                    break;
                                case 404:
                                    err = new Error(i18.t('plugins.api.clientErrors.noPermissions'));
                                    break;
                                default:
                                    err = new Error(i18.t('plugins.api.clientErrors.unknown', res.statusCode, res.statusMessage));
                                    break;
                            }
                        }
                        else if (res.statusCode >= 500 && res.statusCode < 600) {
                            switch (res.statusCode) {
                                default:
                                    err = new Error(i18.t('plugins.api.serverErrors.unknown', res.statusCode, res.statusMessage));
                                    break;
                            }
                        }
                        completed(err);
                    };
                    let req;
                    if (isSecure) {
                        req = HTTPs.request(reqOpts, responseListener);
                    }
                    else {
                        req = HTTP.request(reqOpts, responseListener);
                    }
                    req.once('error', (err) => {
                        completed(err);
                    });
                    let subCtx = {
                        file: file,
                        remoteFile: relativePath,
                    };
                    let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx);
                    tCtx.data = data;
                    let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                    Promise.resolve(tResult).then((transformedData) => {
                        try {
                            req.write(transformedData);
                            req.end();
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
            };
            me.askForPasswordIfNeeded(target).then((cancelled) => {
                hasCancelled = cancelled;
                if (hasCancelled) {
                    completed(null);
                }
                else {
                    FS.readFile(file, (err, data) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            startRequest(data);
                        }
                    });
                }
            }).catch((err) => {
                completed(err);
            });
        }
        catch (e) {
            completed(e);
        }
    }
    /** @inheritdoc */
    downloadFile(file, target, opts) {
        if (!opts) {
            opts = {};
        }
        let me = this;
        target = deploy_helpers.cloneObject(target);
        return new Promise((resolve, reject) => {
            let hasCancelled = false;
            let completed = (err, data) => {
                if (opts.onCompleted) {
                    opts.onCompleted(me, {
                        canceled: hasCancelled,
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
            me.onCancelling(() => {
                hasCancelled = true;
            });
            if (hasCancelled) {
                completed(null);
                return;
            }
            let startRequest = () => {
                try {
                    let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                    if (false === relativePath) {
                        completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                        return;
                    }
                    let host = deploy_helpers.normalizeString(target.host);
                    if (!host) {
                        host = '127.0.0.1';
                    }
                    let port = target.port;
                    if (deploy_helpers.isEmptyString(port)) {
                        port = 1781;
                    }
                    else {
                        port = parseInt(deploy_helpers.toStringSafe(port).trim());
                    }
                    let isSecure = deploy_helpers.toBooleanSafe(target.isSecure);
                    let headers = {
                        'Content-type': deploy_helpers.detectMimeByFilename(file),
                    };
                    let user = deploy_helpers.normalizeString(target.user);
                    if (user) {
                        let pwd = deploy_helpers.toStringSafe(target.password);
                        headers['Authorization'] = `Basic ${(new Buffer(user + ':' + pwd).toString('base64'))}`;
                    }
                    let destination = `http${isSecure ? 's' : ''}://${host}:${port}/api/workspace${relativePath}`;
                    let url = URL.parse(destination);
                    if (opts.onBeforeDeploy) {
                        opts.onBeforeDeploy(me, {
                            destination: destination,
                            file: file,
                            target: target,
                        });
                    }
                    let reqOpts = {
                        headers: headers,
                        host: host,
                        method: 'GET',
                        path: url.pathname,
                        port: port,
                        protocol: url.protocol,
                    };
                    let responseListener = (res) => {
                        let err;
                        if (res.statusCode >= 400 && res.statusCode < 500) {
                            switch (res.statusCode) {
                                case 401:
                                    err = new Error(i18.t('plugins.api.clientErrors.unauthorized'));
                                    break;
                                case 404:
                                    err = new Error(i18.t('plugins.api.clientErrors.notFound'));
                                    break;
                                default:
                                    err = new Error(i18.t('plugins.api.clientErrors.unknown', res.statusCode, res.statusMessage));
                                    break;
                            }
                        }
                        else if (res.statusCode >= 500 && res.statusCode < 600) {
                            switch (res.statusCode) {
                                default:
                                    err = new Error(i18.t('plugins.api.serverErrors.unknown', res.statusCode, res.statusMessage));
                                    break;
                            }
                        }
                        if (err) {
                            completed(err);
                        }
                        else {
                            let isFile = false; // x-vscode-restapi-type
                            if (res.headers) {
                                for (let p in res.headers) {
                                    if ('x-vscode-restapi-type' === deploy_helpers.normalizeString(p)) {
                                        if ('file' === deploy_helpers.normalizeString(res.headers[p])) {
                                            isFile = true;
                                        }
                                    }
                                }
                            }
                            if (isFile) {
                                deploy_helpers.readHttpBody(res).then((data) => {
                                    try {
                                        let subCtx = {
                                            file: file,
                                            remoteFile: relativePath,
                                        };
                                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Restore, subCtx);
                                        tCtx.data = data;
                                        let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Restore)(tCtx);
                                        Promise.resolve(tResult).then((untransformedData) => {
                                            completed(null, untransformedData);
                                        }).catch((err) => {
                                            completed(err);
                                        });
                                    }
                                    catch (e) {
                                        completed(e);
                                    }
                                }).catch((err) => {
                                    completed(err);
                                });
                            }
                            else {
                                completed(i18.t('isNo.file', relativePath));
                            }
                        }
                    };
                    let req;
                    if (isSecure) {
                        req = HTTPs.request(reqOpts, responseListener);
                    }
                    else {
                        req = HTTP.request(reqOpts, responseListener);
                    }
                    req.once('error', (err) => {
                        completed(err);
                    });
                    req.end();
                }
                catch (e) {
                    completed(e);
                }
            };
            me.askForPasswordIfNeeded(target).then((cancelled) => {
                hasCancelled = cancelled;
                if (hasCancelled) {
                    completed(null);
                }
                else {
                    startRequest();
                }
            }).catch((err) => {
                completed(err);
            });
        });
    }
    info() {
        return {
            description: i18.t('plugins.api.description'),
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
    return new ApiPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=api.js.map