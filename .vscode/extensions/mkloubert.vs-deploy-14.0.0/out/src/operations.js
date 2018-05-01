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
const deploy_compilers = require("./compilers");
const deploy_helpers = require("./helpers");
const deploy_sql = require("./sql");
const deploy_workspace = require("./workspace");
const HTTP = require("http");
const HTTPs = require("https");
const i18 = require("./i18");
const Path = require("path");
const Url = require("url");
const vscode = require("vscode");
let httpOperationStates;
/**
 * Compiles files.
 *
 * @param {OperationContext<T>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function compile(ctx) {
    return new Promise((resolve, reject) => {
        let completed = (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        };
        try {
            let compileOp = deploy_helpers.cloneObject(ctx.operation);
            let updateFilesProperty = (property = "files") => {
                if (!deploy_helpers.toBooleanSafe(compileOp.useFilesOfDeployment)) {
                    return; // do not use files of deployment
                }
                if (deploy_helpers.isNullOrUndefined(compileOp.options)) {
                    compileOp.options = {}; // initialize
                }
                if (deploy_helpers.isNullOrUndefined(compileOp.options[property])) {
                    // only if not explicit defined
                    compileOp.options[property] = ctx.files.map(x => x); // create copy
                }
            };
            let compilerName = deploy_helpers.normalizeString(compileOp.compiler);
            let compiler;
            let compilerArgs;
            switch (compilerName) {
                case 'coffeescript':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.CoffeeScript;
                    compilerArgs = [compileOp.options];
                    break;
                case 'htmlminifier':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.HtmlMinifier;
                    compilerArgs = [compileOp.options];
                    break;
                case 'less':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.Less;
                    compilerArgs = [compileOp.options];
                    break;
                case 'pug':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.Pug;
                    compilerArgs = [compileOp.options];
                    break;
                case 'script':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.Script;
                    compilerArgs = [ctx.config, compileOp.options];
                    break;
                case 'typescript':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.TypeScript;
                    compilerArgs = [compileOp.options];
                    break;
                case 'uglifyjs':
                    updateFilesProperty();
                    compiler = deploy_compilers.Compiler.UglifyJS;
                    compilerArgs = [compileOp.options];
                    break;
            }
            if (deploy_helpers.isNullOrUndefined(compiler)) {
                // unknown compiler
                completed(new Error(i18.t('deploy.operations.unknownCompiler', compilerName)));
            }
            else {
                deploy_compilers.compile(compiler, compilerArgs).then((result) => {
                    let sourceFiles = [];
                    if (result.files) {
                        sourceFiles = result.files
                            .filter(x => !deploy_helpers.isEmptyString(x))
                            .map(x => Path.resolve(x));
                    }
                    sourceFiles = deploy_helpers.distinctArray(sourceFiles);
                    let compilerErrors = [];
                    if (result.errors) {
                        compilerErrors = result.errors
                            .filter(x => x);
                    }
                    let err;
                    if (compilerErrors.length > 0) {
                        ctx.outputChannel.appendLine('');
                        result.errors.forEach(x => {
                            ctx.outputChannel.appendLine(`[${x.file}] ${x.error}`);
                        });
                        let failedFiles = compilerErrors.map(x => x.file)
                            .filter(x => !deploy_helpers.isEmptyString(x))
                            .map(x => Path.resolve(x));
                        failedFiles = deploy_helpers.distinctArray(failedFiles);
                        if (failedFiles.length > 0) {
                            let errMsg;
                            if (failedFiles.length >= sourceFiles.length) {
                                // all failed
                                errMsg = i18.t("deploy.operations.noFileCompiled", sourceFiles.length);
                            }
                            else {
                                // some failed
                                errMsg = i18.t("deploy.operations.someFilesNotCompiled", failedFiles.length, sourceFiles.length);
                            }
                            err = new Error(errMsg);
                        }
                    }
                    completed(err);
                }).catch((err) => {
                    completed(err);
                });
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.compile = compile;
/**
 * Returns the (display) name of an operation.
 *
 * @param {deploy_contracts.DeployOperation} operation The operation.
 *
 * @return {string} The (display) name.
 */
function getOperationName(operation) {
    let operationName;
    if (operation) {
        operationName = deploy_helpers.toStringSafe(operation.name).trim();
        if (!operationName) {
            operationName = deploy_helpers.normalizeString(operation.type);
            if (!operationName) {
                operationName = 'open';
            }
        }
    }
    return operationName;
}
exports.getOperationName = getOperationName;
/**
 * Does a HTTP request.
 *
 * @param {OperationContext<deploy_contracts.DeployHttpOperation>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function http(ctx) {
    let me = this;
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let operation = ctx.operation;
            let u = deploy_helpers.toStringSafe(operation.url);
            if (deploy_helpers.isEmptyString(u)) {
                u = 'http://localhost/';
            }
            let url = Url.parse(u);
            let host = deploy_helpers.normalizeString(url.hostname);
            if ('' === host) {
                host = 'localhost';
            }
            let method = deploy_helpers.normalizeString(operation.method, x => x.toUpperCase().trim());
            if ('' === method) {
                method = 'GET';
            }
            let headers = deploy_helpers.cloneObject(operation.headers);
            if (!deploy_helpers.isEmptyString(operation.username)) {
                // Basic Auth
                let username = deploy_helpers.toStringSafe(operation.username);
                let password = deploy_helpers.toStringSafe(operation.password);
                headers = headers || {};
                headers['Authorization'] = 'Basic ' + (new Buffer(username + ':' + password, 'ascii').toString('base64'));
            }
            if (headers) {
                for (let prop in headers) {
                    let name = deploy_helpers.normalizeString(prop);
                    let value = headers[prop];
                    let usePlaceholders;
                    if ('boolean' === typeof operation.noPlaceholdersForTheseHeaders) {
                        usePlaceholders = !operation.noPlaceholdersForTheseHeaders;
                    }
                    else {
                        usePlaceholders = deploy_helpers.asArray(operation.noPlaceholdersForTheseHeaders)
                            .map(x => deploy_helpers.normalizeString(prop))
                            .indexOf(name) < 0;
                    }
                    if (usePlaceholders) {
                        value = me.replaceWithValues(value);
                    }
                    headers[prop] = value;
                }
            }
            let port = deploy_helpers.toStringSafe(url.port);
            let opts = {
                host: host,
                headers: headers,
                method: method,
                path: url.path,
                protocol: url.protocol,
            };
            let callback = (resp) => {
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
            };
            let httpModule;
            let req;
            switch (deploy_helpers.normalizeString(url.protocol)) {
                case 'https:':
                    httpModule = HTTPs;
                    if ('' === port) {
                        port = '443';
                    }
                    break;
                default:
                    httpModule = HTTP;
                    if ('' === port) {
                        port = '80';
                    }
                    break;
            }
            opts.port = parseInt(port);
            req = httpModule.request(opts, callback);
            let startRequest = () => {
                try {
                    req.end();
                }
                catch (e) {
                    completed(e);
                }
            };
            if (deploy_helpers.isNullOrUndefined(operation.body)) {
                startRequest();
            }
            else {
                // send request body
                let body = deploy_helpers.toStringSafe(operation.body);
                if (deploy_helpers.toBooleanSafe(operation.isBodyBase64)) {
                    body = (new Buffer(body, 'base64')).toString('ascii'); // is Base64
                }
                if (deploy_helpers.toBooleanSafe(operation.isBodyScript)) {
                    // 'body' is path to a script
                    let bodyScript = body;
                    bodyScript = me.replaceWithValues(bodyScript);
                    if (deploy_helpers.isEmptyString(bodyScript)) {
                        bodyScript = './getBody.js';
                    }
                    if (!Path.isAbsolute(bodyScript)) {
                        bodyScript = Path.join(deploy_workspace.getRootPath(), bodyScript);
                    }
                    bodyScript = Path.resolve(bodyScript);
                    let bodyModule = deploy_helpers.loadModule(bodyScript);
                    if (bodyModule) {
                        if (bodyModule.getBody) {
                            let args = {
                                context: ctx,
                                globals: me.getGlobals(),
                                replaceWithValues: (val) => {
                                    return me.replaceWithValues(val);
                                },
                                state: undefined,
                                url: url,
                            };
                            // args.state
                            Object.defineProperty(args, 'state', {
                                get: () => { return httpOperationStates[bodyScript]; },
                                set: (newValue) => {
                                    httpOperationStates[bodyScript] = newValue;
                                },
                            });
                            Promise.resolve(bodyModule.getBody(args)).then((r) => {
                                try {
                                    let bodyData = r;
                                    if (deploy_helpers.isNullOrUndefined(bodyData)) {
                                        bodyData = Buffer.alloc(0);
                                    }
                                    if (!Buffer.isBuffer(bodyData)) {
                                        // handle as string
                                        bodyData = new Buffer(deploy_helpers.toStringSafe(bodyData), 'ascii');
                                    }
                                    if (bodyData.length > 0) {
                                        req.write(bodyData);
                                    }
                                    startRequest();
                                }
                                catch (e) {
                                    completed(e);
                                }
                            }).catch((err) => {
                                completed(err);
                            });
                        }
                        else {
                            startRequest();
                        }
                    }
                    else {
                        startRequest();
                    }
                }
                else {
                    startRequest();
                }
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.http = http;
/**
 * Opens something.
 *
 * @param {OperationContext<deploy_contracts.DeployOpenOperation>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function open(ctx) {
    let me = this;
    const GET_FINAL_ARGS = (argList) => {
        if (deploy_helpers.toBooleanSafe(ctx.operation.usePlaceholdersInArguments)) {
            argList = argList.map(a => {
                return me.replaceWithValues(a);
            });
        }
        return argList;
    };
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let openOperation = ctx.operation;
            let operationTarget = deploy_helpers.toStringSafe(openOperation.target);
            let waitForExit = deploy_helpers.toBooleanSafe(openOperation.wait, true);
            if (deploy_helpers.toBooleanSafe(openOperation.runInTerminal)) {
                // run in terminal
                let args = deploy_helpers.asArray(openOperation.arguments)
                    .map(x => deploy_helpers.toStringSafe(x))
                    .filter(x => '' !== x);
                let terminalName = '[vs-deploy]';
                if (!deploy_helpers.isEmptyString(openOperation.name)) {
                    terminalName += ' ' + deploy_helpers.toStringSafe(openOperation.name).trim();
                }
                let app = deploy_helpers.toStringSafe(openOperation.target);
                app = me.replaceWithValues(app);
                if (!Path.isAbsolute(app)) {
                    app = Path.join(deploy_workspace.getRootPath(), app);
                }
                app = Path.resolve(app);
                let terminal = vscode.window.createTerminal(terminalName, app, GET_FINAL_ARGS(args));
                terminal.show();
            }
            else {
                let openArgs = [];
                if (openOperation.arguments) {
                    openArgs = openArgs.concat(deploy_helpers.asArray(openOperation.arguments));
                }
                openArgs = openArgs.map(x => deploy_helpers.toStringSafe(x))
                    .filter(x => '' !== x);
                if (openArgs.length > 0) {
                    let app = operationTarget;
                    app = me.replaceWithValues(app);
                    operationTarget = GET_FINAL_ARGS([openArgs.pop()])[0];
                    openArgs = [app].concat(GET_FINAL_ARGS(openArgs));
                }
                ctx.outputChannel.append(i18.t('deploy.operations.open', operationTarget));
                deploy_helpers.open(operationTarget, {
                    app: openArgs,
                    env: deploy_helpers.makeEnvVarsForProcess(openOperation, me.getValues()),
                    wait: waitForExit,
                }).then(function () {
                    ctx.outputChannel.appendLine(i18.t('ok'));
                    completed();
                }).catch((err) => {
                    completed(err);
                });
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.open = open;
/**
 * Resets all operations and their state values.
 */
function resetOperations() {
    httpOperationStates = {};
}
exports.resetOperations = resetOperations;
/**
 * Executes SQL statements.
 *
 * @param {OperationContext<deploy_contracts.DeploySqlOperation>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function sql(ctx) {
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            //TODO: password prompt
            let sqlOp = ctx.operation;
            let type;
            let args;
            let engineName = deploy_helpers.normalizeString(sqlOp.engine);
            switch (engineName) {
                case '':
                case 'mysql':
                    // MySQL
                    type = deploy_sql.SqlConnectionType.MySql;
                    args = [
                        sqlOp.options,
                    ];
                    break;
                case 'sql':
                    // Microsoft SQL
                    type = deploy_sql.SqlConnectionType.MSSql;
                    args = [
                        sqlOp.options,
                    ];
                    break;
            }
            if (deploy_helpers.isNullOrUndefined(type)) {
                // unknown SQL engine
                completed(new Error(i18.t('deploy.operations.unknownSqlEngine', engineName)));
            }
            else {
                let queries = deploy_helpers.asArray(sqlOp.queries)
                    .filter(x => x);
                deploy_sql.createSqlConnection(type, args).then((conn) => {
                    let queriesCompleted = (err) => {
                        conn.close().then(() => {
                            completed(err);
                        }).then((err2) => {
                            //TODO: log
                            completed(err);
                        });
                    };
                    let invokeNextQuery;
                    invokeNextQuery = () => {
                        if (queries.length < 1) {
                            queriesCompleted();
                            return;
                        }
                        let q = queries.shift();
                        conn.query(q).then(() => {
                            invokeNextQuery();
                        }).catch((err) => {
                            queriesCompleted(err);
                        });
                    };
                    invokeNextQuery();
                }).catch((err) => {
                    completed(err);
                });
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.sql = sql;
/**
 * Executes Visual Studio Code commands.
 *
 * @param {OperationContext<deploy_contracts.DeployVSCommandOperation>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function vscommand(ctx) {
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let vsCmdOp = ctx.operation;
            let commandId = deploy_helpers.toStringSafe(vsCmdOp.command).trim();
            if (!deploy_helpers.isEmptyString(commandId)) {
                let args = vsCmdOp.arguments;
                if (!args) {
                    args = [];
                }
                if (deploy_helpers.toBooleanSafe(vsCmdOp.submitContext)) {
                    // submit DeployVSCommandOperationContext object
                    // as first argument
                    let cmdCtx = {
                        command: commandId,
                        globals: ctx.globals,
                        files: ctx.files,
                        kind: ctx.kind,
                        operation: vsCmdOp,
                        options: vsCmdOp.contextOptions,
                        require: (id) => {
                            return require(id);
                        }
                    };
                    args = [cmdCtx].concat(args);
                }
                args = [commandId].concat(args);
                vscode.commands.executeCommand.apply(null, args).then(() => {
                    completed();
                }, (err) => {
                    completed(err);
                });
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.vscommand = vscommand;
/**
 * Waits.
 *
 * @param {OperationContext<deploy_contracts.DeployWaitOperation>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function wait(ctx) {
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let waitTime = parseFloat(deploy_helpers.toStringSafe(ctx.operation.time).trim());
            if (isNaN(waitTime)) {
                waitTime = 1000;
            }
            setTimeout(() => {
                completed();
            }, waitTime);
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.wait = wait;
/**
 * Runs Microsoft's WebDeploy.
 *
 * @param {OperationContext<deploy_contracts.DeployWebDeployOperation>} ctx The execution context.
 *
 * @returns {Promise<boolean>} The promise.
 */
function webdeploy(ctx) {
    let me = this;
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let webDeployOp = ctx.operation;
            let msDeploy = 'msdeploy.exe';
            if (!deploy_helpers.isEmptyString(webDeployOp.exec)) {
                msDeploy = deploy_helpers.toStringSafe(webDeployOp.exec);
            }
            let args = [
                // -source
                `-source:${deploy_helpers.toStringSafe(webDeployOp.source)}`,
            ];
            // -<param>:<value>
            let paramsWithValues = [
                'dest', 'declareParam', 'setParam', 'setParamFile', 'declareParamFile',
                'removeParam', 'disableLink', 'enableLink', 'disableRule', 'enableRule',
                'replace', 'skip', 'disableSkipDirective', 'enableSkipDirective',
                'preSync', 'postSync',
                'retryAttempts', 'retryInterval',
                'appHostConfigDir', 'webServerDir', 'xpath',
            ];
            for (let i = 0; i < paramsWithValues.length; i++) {
                let p = paramsWithValues[i];
                if (!deploy_helpers.isEmptyString(webDeployOp[p])) {
                    args.push(`-${p}:${deploy_helpers.toStringSafe(webDeployOp[p])}`);
                }
            }
            // -<param>
            let boolParams = [
                'whatif', 'disableAppStore', 'allowUntrusted',
                'showSecure', 'xml', 'unicode', 'useCheckSum',
                'verbose',
            ];
            for (let i = 0; i < boolParams.length; i++) {
                let p = boolParams[i];
                if (deploy_helpers.toBooleanSafe(webDeployOp[p])) {
                    args.push(`-${p}`);
                }
            }
            if (deploy_helpers.toBooleanSafe(webDeployOp.runInTerminal)) {
                // run in terminal
                let terminalName = '[vs-deploy :: WebDeploy]';
                if (!deploy_helpers.isEmptyString(webDeployOp.name)) {
                    terminalName += ' ' + deploy_helpers.toStringSafe(webDeployOp.name).trim();
                }
                let app = msDeploy;
                if (!Path.isAbsolute(app)) {
                    app = Path.join(deploy_workspace.getRootPath(), app);
                }
                app = Path.resolve(app);
                let terminal = vscode.window.createTerminal(terminalName, app, args);
                terminal.show();
            }
            else {
                let openOpts = {
                    app: [msDeploy].concat(args)
                        .map(x => deploy_helpers.toStringSafe(x))
                        .filter(x => x),
                    cwd: webDeployOp.dir,
                    env: deploy_helpers.makeEnvVarsForProcess(webDeployOp, me.getValues()),
                    wait: deploy_helpers.toBooleanSafe(webDeployOp.wait, true),
                };
                let target = `-verb:${deploy_helpers.toStringSafe(webDeployOp.verb)}`;
                deploy_helpers.open(target, openOpts).then(() => {
                    ctx.outputChannel.appendLine(i18.t('ok'));
                    completed();
                }).catch((err) => {
                    completed(err);
                });
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.webdeploy = webdeploy;
//# sourceMappingURL=operations.js.map