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
const deploy_sql = require("../sql");
const FS = require("fs");
const i18 = require("../i18");
const Path = require("path");
class SqlPlugin extends deploy_objects.DeployPluginWithContextBase {
    createContext(target, files, opts) {
        let me = this;
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
                let type;
                let args;
                let enc = deploy_helpers.normalizeString(target.encoding);
                if (!enc) {
                    enc = 'utf8';
                }
                let engineName = deploy_helpers.normalizeString(target.engine);
                switch (engineName) {
                    case '':
                    case 'mysql':
                        // MySQL
                        type = deploy_sql.SqlConnectionType.MySql;
                        args = [
                            target.options,
                        ];
                        break;
                    case 'sql':
                        // Microsoft SQL
                        type = deploy_sql.SqlConnectionType.MSSql;
                        args = [
                            target.options,
                        ];
                        break;
                }
                if (deploy_helpers.isNullOrUndefined(type)) {
                    completed(new Error(i18.t('plugins.sql.unknownEngine', engineName)));
                }
                else {
                    deploy_sql.createSqlConnection(type, args).then((conn) => {
                        let ctx = {
                            connection: conn,
                            encoding: enc,
                            hasCancelled: false,
                            sqlFilesOnly: deploy_helpers.toBooleanSafe(target.sqlFilesOnly, true),
                        };
                        me.onCancelling(() => ctx.hasCancelled = true, opts);
                        let wrapper = {
                            context: ctx,
                            destroy: () => {
                                return new Promise((resolve2, reject2) => {
                                    conn.close().then(() => {
                                        resolve2(ctx);
                                    }).catch((err) => {
                                        reject2(err);
                                    });
                                });
                            },
                        };
                        completed(null, wrapper);
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
        try {
            if (opts.onBeforeDeploy) {
                opts.onBeforeDeploy(me, {
                    destination: ctx.connection.name,
                    file: file,
                    target: target,
                });
            }
            let isValidFile = true;
            if (ctx.sqlFilesOnly) {
                isValidFile = false;
                let temp = file.toLowerCase().trim();
                switch (Path.extname(temp)) {
                    case '.sql':
                        isValidFile = true;
                        break;
                }
            }
            if (isValidFile) {
                FS.readFile(file, (err, queryData) => {
                    if (err) {
                        completed(err);
                        return;
                    }
                    try {
                        let subCtx = {
                            file: file,
                        };
                        let tCtx = me.createDataTransformerContext(target, deploy_contracts.DataTransformerMode.Transform, subCtx);
                        tCtx.data = queryData;
                        let tResult = me.loadDataTransformer(target, deploy_contracts.DataTransformerMode.Transform)(tCtx);
                        Promise.resolve(tResult).then((data) => {
                            try {
                                let query = data.toString(ctx.encoding);
                                ctx.connection.query(query).then(() => {
                                    completed();
                                }).catch((err) => {
                                    completed(err);
                                });
                            }
                            catch (e) {
                                completed(e);
                            }
                        }).catch((e) => {
                            completed(e);
                        });
                    }
                    catch (e) {
                        completed(e);
                    }
                });
            }
            else {
                completed(i18.t('plugins.sql.invalidFile'));
            }
        }
        catch (e) {
            completed(e);
        }
    }
    info() {
        return {
            description: i18.t('plugins.sql.description'),
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
    return new SqlPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=sql.js.map