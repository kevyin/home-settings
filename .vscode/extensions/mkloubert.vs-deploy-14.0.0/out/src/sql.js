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
const deploy_helpers = require("./helpers");
let MSSQL;
let MYSQL;
// try load Microsoft SQL module
try {
    MSSQL = require('mssql');
}
catch (e) {
    deploy_helpers.log(`Could not load MS-SQL module: ${deploy_helpers.toStringSafe(e)}`);
}
// try load MySQL
try {
    MYSQL = require('mysql');
}
catch (e) {
    deploy_helpers.log(`Could not load MySQL module: ${deploy_helpers.toStringSafe(e)}`);
}
/**
 * List of known SQL connection types.
 */
var SqlConnectionType;
(function (SqlConnectionType) {
    /**
     * MySQL
     */
    SqlConnectionType[SqlConnectionType["MySql"] = 0] = "MySql";
    /**
     * Microsoft SQL
     */
    SqlConnectionType[SqlConnectionType["MSSql"] = 1] = "MSSql";
})(SqlConnectionType = exports.SqlConnectionType || (exports.SqlConnectionType = {}));
/**
 * Creates a new MSSQL connection.
 *
 * @param {MSSqlOptions} [opts] The options for the connection.
 *
 * @returns {Promise<MSSqlConnection>} The promise.
 */
function createMSSqlConnection(opts) {
    if (!opts) {
        opts = {};
    }
    return new Promise((resolve, reject) => {
        let completed = (err, conn) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(conn);
            }
        };
        if (!MSSQL) {
            completed(new Error(`Microsoft SQL is currently not available!`));
            return;
        }
        try {
            let driver = deploy_helpers.toStringSafe(opts.driver).toLowerCase().trim();
            if (!driver) {
                driver = 'tedious';
            }
            let host = deploy_helpers.toStringSafe(opts.host).toLowerCase().trim();
            if (!host) {
                host = '127.0.0.1';
            }
            let port = deploy_helpers.toStringSafe(opts.port).trim();
            if ('' === port) {
                port = '1433';
            }
            let user = deploy_helpers.toStringSafe(opts.user).trim();
            if ('' === user) {
                user = 'sa';
            }
            let pwd = deploy_helpers.toStringSafe(opts.password);
            if ('' === pwd) {
                pwd = undefined;
            }
            let db = deploy_helpers.toStringSafe(opts.database).trim();
            if ('' === db) {
                db = undefined;
            }
            let connOpts = {
                database: db,
                driver: driver,
                server: host,
                port: parseInt(port),
                user: user,
                password: pwd,
                options: {
                    encrypt: deploy_helpers.toBooleanSafe(opts.encrypt),
                },
            };
            let connection = new MSSQL.Connection(connOpts);
            connection.connect().then(function (mssqlConn) {
                let conn = {
                    close: () => {
                        return new Promise((resolve2, reject2) => {
                            try {
                                mssqlConn.close();
                                resolve2();
                            }
                            catch (e) {
                                reject2(e);
                            }
                        });
                    },
                    connection: mssqlConn,
                    name: `mssql://${host}:${port}/${deploy_helpers.toStringSafe(db)}`,
                    query: (sql, args) => {
                        return new Promise((resolve2, reject2) => {
                            try {
                                let req = new MSSQL.Request(mssqlConn);
                                req.query(sql).then((recordset) => {
                                    let result = {};
                                    resolve2(result);
                                }).catch((err) => {
                                    reject2(err);
                                });
                            }
                            catch (e) {
                                reject2(e);
                            }
                        });
                    },
                    type: SqlConnectionType.MSSql,
                };
                completed(null, conn);
            }).catch((err) => {
                completed(err);
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.createMSSqlConnection = createMSSqlConnection;
/**
 * Creates a new MySQL connection.
 *
 * @param {MySqlOptions} [opts] The options for the connection.
 *
 * @returns {Promise<MySqlConnection>} The promise.
 */
function createMySqlConnection(opts) {
    if (!opts) {
        opts = {};
    }
    return new Promise((resolve, reject) => {
        let completed = (err, conn) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(conn);
            }
        };
        if (!MYSQL) {
            completed(new Error(`MySQL is currently not available!`));
            return;
        }
        try {
            let host = deploy_helpers.toStringSafe(opts.host).toLowerCase().trim();
            if ('' === host) {
                host = '127.0.0.1';
            }
            let port = deploy_helpers.toStringSafe(opts.port).trim();
            if ('' === port) {
                port = '3306';
            }
            let user = deploy_helpers.toStringSafe(opts.user).trim();
            if ('' === user) {
                user = 'root';
            }
            let pwd = deploy_helpers.toStringSafe(opts.password);
            if ('' === pwd) {
                pwd = undefined;
            }
            let db = deploy_helpers.toStringSafe(opts.database).trim();
            if ('' === db) {
                db = undefined;
            }
            let connOpts = {
                database: db,
                host: host,
                port: parseInt(port),
                user: user,
                password: pwd,
            };
            if (!deploy_helpers.isNullOrUndefined(opts.rejectUnauthorized)) {
                connOpts['ssl'] = {
                    rejectUnauthorized: deploy_helpers.toBooleanSafe(opts.rejectUnauthorized),
                };
            }
            let connection = MYSQL.createConnection(connOpts);
            connection.connect(function (err) {
                if (err) {
                    completed(err);
                    return;
                }
                let conn = {
                    close: () => {
                        return new Promise((resolve2, reject2) => {
                            try {
                                connection.end((err) => {
                                    if (err) {
                                        reject2(err);
                                    }
                                    else {
                                        resolve2();
                                    }
                                });
                            }
                            catch (e) {
                                reject2(e);
                            }
                        });
                    },
                    connection: connection,
                    name: `mysql://${host}:${port}/${deploy_helpers.toStringSafe(db)}`,
                    query: (sql, args) => {
                        return new Promise((resolve2, reject2) => {
                            try {
                                connection.query({
                                    sql: sql,
                                    values: args,
                                }, (err, rows) => {
                                    if (err) {
                                        reject2(err);
                                    }
                                    else {
                                        let result = {};
                                        resolve2(result);
                                    }
                                });
                            }
                            catch (e) {
                                reject2(e);
                            }
                        });
                    },
                    type: SqlConnectionType.MySql,
                };
                completed(null, conn);
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.createMySqlConnection = createMySqlConnection;
/**
 * Creates a new SQL connection.
 *
 * @param {SqlConnectionType} type The type of the connection.
 * @param {any[]} [args] One or more arguments for the connection.
 *
 * @returns {Promise<SqlConnection>} The promise.
 */
function createSqlConnection(type, args) {
    let me = this;
    if (!args) {
        args = [];
    }
    return new Promise((resolve, reject) => {
        let func;
        switch (type) {
            case SqlConnectionType.MSSql:
                // Microsoft SQL
                func = createMSSqlConnection;
                break;
            case SqlConnectionType.MySql:
                // MySQL
                func = createMySqlConnection;
                break;
        }
        if (func) {
            try {
                func.apply(me, args).then((conn) => {
                    resolve(conn);
                }).catch((err) => {
                    reject(err);
                });
            }
            catch (e) {
                reject(e);
            }
        }
        else {
            reject(new Error(`Type '${type}' is not supported!`));
        }
    });
}
exports.createSqlConnection = createSqlConnection;
//# sourceMappingURL=sql.js.map