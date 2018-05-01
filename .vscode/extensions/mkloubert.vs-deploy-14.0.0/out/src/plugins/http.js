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
const deploy_values = require("../values");
const FS = require("fs");
const HTTP = require("http");
const HTTPs = require("https");
const i18 = require("../i18");
const MIME = require('mime');
const Moment = require("moment");
const Path = require("path");
const URL = require("url");
const vscode = require("vscode");
const DATE_RFC2822_UTC = "ddd, DD MMM YYYY HH:mm:ss [GMT]";
const TARGET_CACHE_PASSWORD = 'password';
class HttpPlugin extends deploy_objects.DeployPluginBase {
    deployFile(file, target, opts) {
        let now = Moment().utc();
        if (!opts) {
            opts = {};
        }
        let me = this;
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
        me.onCancelling(() => hasCancelled = true, opts);
        if (hasCancelled) {
            completed(); // cancellation requested
        }
        else {
            let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
            if (false === relativePath) {
                completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
                return;
            }
            let url = deploy_helpers.toStringSafe(target.url).trim();
            if (!url) {
                url = 'http://localhost';
            }
            let method = deploy_helpers.toStringSafe(target.method).toUpperCase().trim();
            if (!method) {
                method = 'PUT';
            }
            let headers = target.headers;
            if (!headers) {
                headers = {};
            }
            let user = deploy_helpers.toStringSafe(target.user);
            let pwd;
            if ('' !== user) {
                pwd = deploy_helpers.toStringSafe(target.password);
                if ('' === pwd) {
                    pwd = undefined;
                }
            }
            let submitFileHeader = deploy_helpers.toBooleanSafe(target.submitFileHeader, false);
            if (submitFileHeader) {
                headers['X-vsdeploy-file'] = relativePath;
            }
            let contentType = deploy_helpers.detectMimeByFilename(file);
            try {
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(me, {
                        destination: url,
                        file: file,
                        target: target,
                    });
                }
                let startRequest = () => {
                    if ('' !== user) {
                        headers['Authorization'] = 'Basic ' +
                            (new Buffer(`${user}:${pwd}`)).toString('base64');
                    }
                    // get file info
                    FS.lstat(file, (err, stats) => {
                        if (err) {
                            completed(err);
                            return;
                        }
                        let creationTime = Moment(stats.birthtime).utc();
                        let lastWriteTime = Moment(stats.mtime).utc();
                        // read file
                        FS.readFile(file, (err, untransformedData) => {
                            if (err) {
                                completed(err);
                                return;
                            }
                            try {
                                let subCtx = {
                                    globals: me.context.globals(),
                                    file: file,
                                    remoteFile: relativePath,
                                    url: url,
                                };
                                let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx);
                                tCtx.data = untransformedData;
                                let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                                Promise.resolve(tResult).then((dataToSend) => {
                                    try {
                                        let parsePlaceHolders = (str, transformer) => {
                                            let values = deploy_values.getBuildInValues().map(x => {
                                                let sv = new deploy_values.StaticValue({
                                                    name: x.name,
                                                    value: transformer(x.value),
                                                });
                                                sv.id = x.id;
                                                return sv;
                                            });
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-Date',
                                                value: transformer(now.format(DATE_RFC2822_UTC))
                                            }));
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File',
                                                value: transformer(relativePath)
                                            }));
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File-Mime',
                                                value: transformer(contentType)
                                            }));
                                            let basename = Path.basename(file);
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File-Name',
                                                value: transformer(basename)
                                            }));
                                            let extname = Path.extname(file);
                                            let rootname = basename.substr(0, basename.length - extname.length);
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File-Root',
                                                value: transformer(rootname)
                                            }));
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File-Size',
                                                value: transformer(dataToSend.length)
                                            }));
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File-Time-Changed',
                                                value: transformer(lastWriteTime.format(DATE_RFC2822_UTC))
                                            }));
                                            values.push(new deploy_values.StaticValue({
                                                name: 'VSDeploy-File-Time-Created',
                                                value: transformer(lastWriteTime.format(DATE_RFC2822_UTC))
                                            }));
                                            str = deploy_values.replaceWithValues(values, str);
                                            return deploy_helpers.toStringSafe(str);
                                        };
                                        let encodeUrlValues = deploy_helpers.toBooleanSafe(target.encodeUrlValues, true);
                                        let targetUrl = URL.parse(parsePlaceHolders(url, encodeUrlValues ? encodeURIComponent : deploy_helpers.toStringSafe));
                                        let submitFile = deploy_helpers.toBooleanSafe(target.submitFile, true);
                                        let submitContentLength = deploy_helpers.toBooleanSafe(target.submitContentLength, true);
                                        if (submitFile && submitContentLength) {
                                            headers['Content-length'] = deploy_helpers.toStringSafe(dataToSend.length, '0');
                                        }
                                        let submitContentType = deploy_helpers.toBooleanSafe(target.submitContentType, true);
                                        if (submitFile && submitContentType) {
                                            headers['Content-type'] = contentType;
                                        }
                                        let submitDate = deploy_helpers.toBooleanSafe(target.submitDate, true);
                                        if (submitDate) {
                                            headers['Date'] = now.format(DATE_RFC2822_UTC); // RFC 2822
                                        }
                                        let headersToSubmit = {};
                                        for (let p in headers) {
                                            headersToSubmit[p] = parsePlaceHolders(headers[p], deploy_helpers.toStringSafe);
                                        }
                                        let protocol = deploy_helpers.toStringSafe(targetUrl.protocol).toLowerCase().trim();
                                        if ('' === protocol) {
                                            protocol = 'http:';
                                        }
                                        let httpModule;
                                        switch (protocol) {
                                            case 'http:':
                                                httpModule = HTTP;
                                                break;
                                            case 'https:':
                                                httpModule = HTTPs;
                                                break;
                                        }
                                        if (!httpModule) {
                                            completed(new Error(i18.t('plugins.http.protocolNotSupported', protocol)));
                                            return;
                                        }
                                        let hostName = deploy_helpers.toStringSafe(targetUrl.hostname).toLowerCase().trim();
                                        if (!hostName) {
                                            hostName = 'localhost';
                                        }
                                        let port = deploy_helpers.toStringSafe(targetUrl.port).trim();
                                        if ('' === port) {
                                            port = 'http:' === protocol ? '80' : '443';
                                        }
                                        // start the request
                                        let req = httpModule.request({
                                            headers: headersToSubmit,
                                            host: hostName,
                                            method: method,
                                            path: targetUrl.path,
                                            port: parseInt(port),
                                            protocol: protocol,
                                        }, (resp) => {
                                            if (resp.statusCode > 399 && resp.statusCode < 500) {
                                                completed(new Error(`Client error: [${resp.statusCode}] '${resp.statusMessage}'`));
                                                return;
                                            }
                                            if (resp.statusCode > 499 && resp.statusCode < 600) {
                                                completed(new Error(`Server error: [${resp.statusCode}] '${resp.statusMessage}'`));
                                                return;
                                            }
                                            if (resp.statusCode > 599) {
                                                completed(new Error(`Error: [${resp.statusCode}] '${resp.statusMessage}'`));
                                                return;
                                            }
                                            if (!(resp.statusCode > 199 && resp.statusCode < 300)) {
                                                completed(new Error(`No success: [${resp.statusCode}] '${resp.statusMessage}'`));
                                                return;
                                            }
                                            completed();
                                        });
                                        req.once('error', (err) => {
                                            if (err) {
                                                completed(err);
                                            }
                                        });
                                        if (submitFile) {
                                            // send file content
                                            req.write(dataToSend);
                                        }
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
                        });
                    });
                };
                let askForPasswordIfNeeded = () => {
                    let showPasswordPrompt = false;
                    if (!deploy_helpers.isEmptyString(user) && deploy_helpers.isNullOrUndefined(pwd)) {
                        // user defined, but no password
                        let pwdFromCache = deploy_helpers.toStringSafe(me.context.targetCache().get(target, TARGET_CACHE_PASSWORD));
                        if ('' === pwdFromCache) {
                            // nothing in cache
                            showPasswordPrompt = deploy_helpers.toBooleanSafe(target.promptForPassword, true);
                        }
                        else {
                            pwd = pwdFromCache;
                        }
                    }
                    if (showPasswordPrompt) {
                        vscode.window.showInputBox({
                            ignoreFocusOut: true,
                            placeHolder: i18.t('prompts.inputPassword'),
                            password: true,
                        }).then((passwordFromUser) => {
                            if ('undefined' === typeof passwordFromUser) {
                                hasCancelled = true;
                                completed(null); // cancelled
                            }
                            else {
                                pwd = passwordFromUser;
                                me.context.targetCache().set(target, TARGET_CACHE_PASSWORD, passwordFromUser);
                                startRequest();
                            }
                        }, (err) => {
                            completed(err);
                        });
                    }
                    else {
                        startRequest();
                    }
                };
                askForPasswordIfNeeded();
            }
            catch (e) {
                completed(e);
            }
        }
    }
    info() {
        return {
            description: i18.t('plugins.http.description'),
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
    return new HttpPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=http.js.map