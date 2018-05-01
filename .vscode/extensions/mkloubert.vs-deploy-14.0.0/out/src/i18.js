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
const FS = require("fs");
const i18next = require("i18next");
const Path = require("path");
const vscode = require("vscode");
/**
 * Returns a translated string by key.
 *
 * @param {string} key The key.
 * @param {any} [args] The optional arguments.
 *
 * @return {string} The "translated" string.
 */
function t(key, ...args) {
    let formatStr = i18next.t(deploy_helpers.toStringSafe(key).trim());
    formatStr = deploy_helpers.toStringSafe(formatStr);
    return deploy_helpers.formatArray(formatStr, args);
}
exports.t = t;
/**
 * Initializes the language repository.
 *
 * @param {string} [lang] The custom language to use.
 *
 * @returns {Promise<any>} The promise.
 */
function init(lang) {
    if (deploy_helpers.isEmptyString(lang)) {
        lang = vscode.env.language;
    }
    lang = normalizeLangName(lang);
    if ('' === lang) {
        lang = 'en';
    }
    return new Promise((resolve, reject) => {
        let completed = (err, tr) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(tr);
            }
        };
        try {
            let langDir = Path.join(__dirname, 'lang');
            let resources = {};
            // initialize 'i18next'
            // with collected data
            let initLang = () => {
                i18next.init({
                    lng: lang,
                    resources: resources,
                    fallbackLng: 'en',
                }, (err, tr) => {
                    completed(err, tr);
                });
            };
            // load language files
            let loadFiles = () => {
                FS.readdir(langDir, (err, files) => {
                    if (err) {
                        completed(err);
                        return;
                    }
                    // load files
                    for (let i = 0; i < files.length; i++) {
                        try {
                            let fileName = files[i];
                            if (fileName.length < 3) {
                                continue;
                            }
                            if ('.js' !== fileName.substr(fileName.length - 3)) {
                                continue; // no JavaScript file
                            }
                            let langName = normalizeLangName(fileName.substr(0, fileName.length - 3));
                            if ('' === langName) {
                                continue; // no language name available
                            }
                            let fullPath = Path.join(langDir, fileName);
                            fullPath = Path.resolve(fullPath);
                            let stats = FS.lstatSync(fullPath);
                            if (!stats.isFile()) {
                                continue; // no file
                            }
                            // deleted cached data
                            // and load current translation
                            // from file
                            delete require.cache[fullPath];
                            resources[langName] = {
                                translation: require(fullPath).translation,
                            };
                        }
                        catch (e) {
                            deploy_helpers.log(`[vs-deploy :: ERROR] i18.init(): ${deploy_helpers.toStringSafe(e)}`);
                        }
                    }
                    initLang();
                });
            };
            // check if directory
            let checkIfDirectory = () => {
                FS.lstat(langDir, (err, stats) => {
                    if (stats.isDirectory()) {
                        loadFiles();
                    }
                    else {
                        completed(new Error(`'${langDir}' is no directory!`));
                    }
                });
            };
            FS.exists(langDir, (exists) => {
                if (exists) {
                    checkIfDirectory();
                }
                else {
                    initLang();
                }
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.init = init;
function normalizeLangName(lang) {
    lang = deploy_helpers.normalizeString(lang);
    lang = deploy_helpers.replaceAllStrings(lang, '-', '_');
    return lang;
}
//# sourceMappingURL=i18.js.map