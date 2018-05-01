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
const i18 = require("../i18");
const Moment = require("moment");
const Path = require("path");
const Workflows = require("node-workflows");
class TestPlugin extends deploy_objects.DeployPluginBase {
    get canGetFileInfo() {
        return true;
    }
    get canPull() {
        return true;
    }
    deployFile(file, target, opts) {
        this.downloadFile(file, target, opts, deploy_contracts.DataTransformerMode.Transform).then(() => {
            // already handled
        }).catch(() => {
            // already handled
        });
    }
    downloadFile(file, target, opts, transformMode) {
        if (!opts) {
            opts = {};
        }
        if (arguments.length < 4) {
            transformMode = deploy_contracts.DataTransformerMode.Restore;
        }
        let me = this;
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
            me.onCancelling(() => hasCancelled = true, opts);
            try {
                let relativePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
                if (false === relativePath) {
                    completed(new Error(i18.t('relativePaths.couldNotResolve', file)));
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
                    if (hasCancelled) {
                        completed(null); // cancellation requested
                        return;
                    }
                    if (err) {
                        completed(err);
                    }
                    else {
                        try {
                            let subCtx = {
                                file: file,
                                remoteFile: relativePath,
                            };
                            let tCtx = me.createDataTransformerContext(target, transformMode, subCtx);
                            tCtx.data = data;
                            let transformer = me.loadDataTransformer(target, transformMode);
                            let tResult = Promise.resolve(transformer(tCtx));
                            tResult.then(() => {
                                completed(null);
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
            catch (e) {
                completed(e);
            }
        });
    }
    getFileInfo(file, target, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = this;
            if (!opts) {
                opts = {};
            }
            let relativeTargetFilePath = deploy_helpers.toRelativeTargetPathWithValues(file, target, me.context.values(), opts.baseDirectory);
            if (false === relativeTargetFilePath) {
                throw new Error(i18.t('relativePaths.couldNotResolve', file));
            }
            let targetFile = file;
            let targetDirectory = Path.dirname(targetFile);
            let wf = Workflows.create();
            // check if exist
            wf.next((ctx) => {
                let result = {
                    exists: undefined,
                    isRemote: true,
                };
                ctx.result = result;
                return new Promise((resolve, reject) => {
                    FS.exists(targetFile, (exists) => {
                        result.exists = exists;
                        if (!result.exists) {
                            ctx.finish(); // no file, no info
                        }
                        resolve();
                    });
                });
            });
            // get file info?
            wf.next((ctx) => {
                let result = ctx.result;
                return new Promise((resolve, reject) => {
                    FS.lstat(targetFile, (err, stat) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            try {
                                result.name = Path.basename(targetFile);
                                result.path = targetDirectory;
                                result.modifyTime = Moment(stat.ctime);
                                result.size = stat.size;
                                resolve();
                            }
                            catch (e) {
                                reject(e);
                            }
                        }
                    });
                });
            });
            return wf.start();
        });
    }
    info() {
        return {
            description: i18.t('plugins.test.description'),
        };
    }
    pullFile(file, target, opts) {
        this.downloadFile(file, target, opts, deploy_contracts.DataTransformerMode.Restore).then(() => {
            // already handled
        }).catch(() => {
            // already handled
        });
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
    return new TestPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=test.js.map