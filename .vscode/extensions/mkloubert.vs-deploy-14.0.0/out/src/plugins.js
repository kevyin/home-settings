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
const deploy_contracts = require("./contracts");
const deploy_helpers = require("./helpers");
const deploy_workspace = require("./workspace");
const Events = require("events");
const i18 = require("./i18");
const vscode = require("vscode");
/**
 * Creates a deploy context for a plugin.
 *
 * @param {deploy_contracts.DeployContext} [baseCtx] The optional base context.
 *
 * @return {deploy_contracts.DeployContext} The created context.
 */
function createPluginContext(baseCtx) {
    let eventEmitter = new Events.EventEmitter();
    let hasCancelled = false;
    const WORKSPACE_ROOT = deploy_workspace.getRootPath();
    let ctx;
    ctx = {
        config: null,
        deployFiles: null,
        dispose: () => {
            try {
                eventEmitter.removeAllListeners(deploy_contracts.EVENT_CANCEL_DEPLOY);
            }
            catch (e) {
                deploy_helpers.log(i18.t('errors.withCategory', 'Deployer.reloadPlugins().ctx.dispose', e));
            }
            finally {
                eventEmitter = null;
                hasCancelled = null;
                ctx = null;
                baseCtx = null;
            }
        },
        emit: function () {
            return eventEmitter.emit
                .apply(eventEmitter, arguments);
        },
        emitGlobal: null,
        error: function (msg) {
            if (msg) {
                vscode.window.showErrorMessage('' + msg);
            }
            return this;
        },
        filterConditionalItems: null,
        globals: null,
        info: function (msg) {
            if (msg) {
                vscode.window.showInformationMessage('' + msg);
            }
            return this;
        },
        isActive: () => !deploy_helpers.isEmptyString(deploy_workspace.getRootPath()),
        isCancelling: () => hasCancelled,
        log: null,
        once: function (event, cb) {
            eventEmitter.once(event, function (sender, e) {
                try {
                    if (cb) {
                        cb(sender, e);
                    }
                }
                catch (e) {
                    deploy_helpers.log(i18.t('errors.withCategory', 'Deployer.reloadPlugins().ctx.once', e));
                }
            });
            return this;
        },
        openHtml: null,
        outputChannel: null,
        packageFile: null,
        packages: null,
        plugins: null,
        replaceWithValues: null,
        require: function (id) {
            return require(id);
        },
        targetCache: null,
        targets: null,
        values: null,
        warn: function (msg) {
            if (msg) {
                vscode.window.showWarningMessage('' + msg);
            }
            return this;
        },
        workspace: function () {
            return WORKSPACE_ROOT;
        },
        write: function (msg) {
            msg = deploy_helpers.toStringSafe(msg);
            this.outputChannel().append(msg);
            return this;
        },
        writeLine: function (msg) {
            msg = deploy_helpers.toStringSafe(msg);
            this.outputChannel().appendLine(msg);
            return this;
        },
    };
    ctx.once(deploy_contracts.EVENT_CANCEL_DEPLOY, () => {
        hasCancelled = true;
    });
    if (baseCtx) {
        ctx.config = () => baseCtx.config();
        ctx.deployFiles = function () {
            return baseCtx.deployFiles
                .apply(baseCtx, arguments);
        };
        ctx.emitGlobal = function () {
            return baseCtx.emitGlobal
                .apply(baseCtx, arguments);
        };
        ctx.filterConditionalItems = (items) => baseCtx.filterConditionalItems(items),
            ctx.globals = () => baseCtx.globals();
        ctx.isActive = () => baseCtx.isActive();
        ctx.log = function (msg) {
            baseCtx.log(msg);
            return this;
        };
        ctx.openHtml = function () {
            return baseCtx.openHtml
                .apply(baseCtx, arguments);
        };
        ctx.outputChannel = () => baseCtx.outputChannel();
        ctx.packageFile = () => baseCtx.packageFile();
        ctx.packages = () => baseCtx.packages();
        ctx.plugins = () => baseCtx.plugins();
        ctx.replaceWithValues = (val) => baseCtx.replaceWithValues(val);
        ctx.targetCache = () => baseCtx.targetCache(),
            ctx.targets = () => baseCtx.targets();
        ctx.values = () => baseCtx.values();
    }
    return ctx;
}
exports.createPluginContext = createPluginContext;
//# sourceMappingURL=plugins.js.map