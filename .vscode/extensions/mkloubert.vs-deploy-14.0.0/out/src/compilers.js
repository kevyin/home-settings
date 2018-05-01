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
const CoffeeScript = require('coffeescript');
const deploy_globals = require("./globals");
const deploy_helpers = require("./helpers");
const deploy_workspace = require("./workspace");
const FS = require("fs");
const Glob = require('glob');
const HtmlMinifier = require("html-minifier");
const i18 = require("./i18");
const LESS = require('less');
const Path = require("path");
const Pug = require('pug');
const TypeScript = require('typescript');
const UglifyJS = require("uglify-js");
const Workflows = require("node-workflows");
/**
 * List of known compilers.
 */
var Compiler;
(function (Compiler) {
    /**
     * Less
     */
    Compiler[Compiler["Less"] = 0] = "Less";
    /**
     * TypeScript
     */
    Compiler[Compiler["TypeScript"] = 1] = "TypeScript";
    /**
     * Script based compiler
     */
    Compiler[Compiler["Script"] = 2] = "Script";
    /**
     * UglifyJS
     */
    Compiler[Compiler["UglifyJS"] = 3] = "UglifyJS";
    /**
     * Pug
     */
    Compiler[Compiler["Pug"] = 4] = "Pug";
    /**
     * Html Minifier
     */
    Compiler[Compiler["HtmlMinifier"] = 5] = "HtmlMinifier";
    /**
     * CoffeeScript
     */
    Compiler[Compiler["CoffeeScript"] = 6] = "CoffeeScript";
})(Compiler = exports.Compiler || (exports.Compiler = {}));
/**
 * Collects files to compile.
 *
 * @param {CompilerOptions} defaultOpts The default options.
 * @param {CompilerOptions} [opts] The options.
 *
 * @returns Promise<string[]> The promise.
 */
function collectCompilerFiles(defaultOpts, opts) {
    if (!defaultOpts) {
        defaultOpts = {
            files: '**',
        };
    }
    if (!opts) {
        opts = {};
    }
    let cleanupStringList = (list) => {
        list = deploy_helpers.asArray(list)
            .map(x => deploy_helpers.toStringSafe(x))
            .filter(x => !deploy_helpers.isEmptyString(x));
        return deploy_helpers.distinctArray(list);
    };
    let filters = cleanupStringList(opts.files);
    if (filters.length < 1) {
        // use defaults
        filters = cleanupStringList(defaultOpts.files);
    }
    let filesToExclude = cleanupStringList(opts.exclude);
    if (filesToExclude.length < 1) {
        // use defaults
        filesToExclude = cleanupStringList(defaultOpts.exclude);
    }
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let filesToCompile = [];
            let nextFilter;
            nextFilter = () => {
                if (filters.length < 1) {
                    filesToCompile = filesToCompile.filter(x => !deploy_helpers.isEmptyString(x))
                        .map(x => Path.resolve(x));
                    filesToCompile = deploy_helpers.asArray(filesToCompile);
                    completed(null, filesToCompile);
                    return;
                }
                let f = filters.shift();
                try {
                    Glob(f, {
                        absolute: true,
                        cwd: deploy_workspace.getRootPath(),
                        dot: true,
                        ignore: filesToExclude,
                        nodir: true,
                        root: deploy_workspace.getRootPath(),
                    }, (err, files) => {
                        if (err) {
                            completed(err);
                        }
                        else {
                            filesToCompile = filesToCompile.concat(files);
                            nextFilter();
                        }
                    });
                }
                catch (e) {
                    completed(e);
                }
            };
            nextFilter();
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.collectCompilerFiles = collectCompilerFiles;
/**
 * Compiles (files).
 *
 * @param {Compiler} compiler The compiler to use.
 * @param {any[]} [args] One or more arguments for the compilation.
 *
 * @returns {Promise<CompilerResult>} The promise.
 */
function compile(compiler, args) {
    let me = this;
    if (!args) {
        args = [];
    }
    return new Promise((resolve, reject) => {
        let func;
        switch (compiler) {
            case Compiler.CoffeeScript:
                // CoffeeScript
                func = compileCoffeeScript;
                break;
            case Compiler.HtmlMinifier:
                // Html Minifier
                func = compileHtmlMinifier;
                break;
            case Compiler.Less:
                // LESS
                func = compileLess;
                break;
            case Compiler.Pug:
                // Pug
                func = compliePug;
                break;
            case Compiler.Script:
                // script based compiler
                func = compileScript;
                break;
            case Compiler.TypeScript:
                // TypeScript
                func = compileTypeScript;
                break;
            case Compiler.UglifyJS:
                // UglifyJS
                func = compileUglifyJS;
                break;
        }
        if (func) {
            try {
                func.apply(me, args).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }
            catch (e) {
                reject(e);
            }
        }
        else {
            reject(new Error(`Compiler '${compiler}' is not supported!`));
        }
    });
}
exports.compile = compile;
/**
 * Compiles CoffeeScript files.
 *
 * @param {CoffeeScriptCompilerOptions} [opts] The options.
 *
 * @returns Promise<CoffeeScriptCompilerResult> The promise.
 */
function compileCoffeeScript(opts) {
    if (!opts) {
        opts = {};
    }
    let enc = deploy_helpers.normalizeString(opts.encoding);
    if ('' === enc) {
        enc = 'utf8';
    }
    let outExt = deploy_helpers.toStringSafe(opts.extension);
    if (deploy_helpers.isEmptyString(outExt)) {
        outExt = 'js';
    }
    return new Promise((resolve, reject) => {
        let completed = (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        };
        try {
            collectCompilerFiles({
                files: "/**/*.coffee",
            }, opts).then((filesToCompile) => {
                let result = {
                    errors: [],
                    files: filesToCompile.map(x => x),
                };
                let coffeeOpts = deploy_helpers.cloneObject(opts);
                delete coffeeOpts['files'];
                delete coffeeOpts['exclude'];
                delete coffeeOpts['encoding'];
                delete coffeeOpts['extension'];
                coffeeOpts['inlineMap'] = deploy_helpers.toBooleanSafe(coffeeOpts['sourceMap']);
                coffeeOpts['sourceMap'] = false;
                let wf = Workflows.create();
                filesToCompile.forEach(f => {
                    return new Promise((res, rej) => {
                        let addError = (err) => {
                            result.errors.push({
                                error: err,
                                file: f,
                            });
                            res();
                        };
                        FS.readFile(f, (err, data) => {
                            try {
                                if (err) {
                                    addError(err);
                                    return;
                                }
                                let coffeeCode = data.toString(enc);
                                let jsCode = CoffeeScript.compile(coffeeCode, opts);
                                let outDir = Path.dirname(f);
                                let ext = Path.extname(f);
                                let fileName = Path.basename(f, ext);
                                let outputFile = Path.join(outDir, fileName + '.' + outExt);
                                FS.writeFile(outputFile, new Buffer(jsCode, 'utf8'), (err) => {
                                    if (err) {
                                        addError(err);
                                    }
                                    else {
                                        res();
                                    }
                                });
                            }
                            catch (e) {
                                addError(e);
                            }
                        });
                    });
                });
                wf.start().then(() => {
                    completed(null, result);
                }).catch((err) => {
                    completed(err);
                });
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.compileCoffeeScript = compileCoffeeScript;
/**
 * Compiles JavaScript files with UglifyJS.
 *
 * @param {HtmlMinifierCompilerOptions} [opts] The options.
 *
 * @returns Promise<HtmlMinifierCompilerResult> The promise.
 */
function compileHtmlMinifier(opts) {
    if (!opts) {
        opts = {};
    }
    let enc = deploy_helpers.normalizeString(opts.encoding);
    if ('' === enc) {
        enc = 'utf8';
    }
    let outExt = deploy_helpers.toStringSafe(opts.extension);
    if (deploy_helpers.isEmptyString(opts.extension)) {
        outExt = 'min.html';
    }
    let deleteOnSuccess = deploy_helpers.toBooleanSafe(opts.deleteSources);
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            collectCompilerFiles({
                files: "/**/*.html",
            }, opts).then((filesToCompile) => {
                try {
                    let result = {
                        errors: [],
                        files: filesToCompile.map(x => x),
                    };
                    let htmlMiniOpts = deploy_helpers.cloneObject(opts);
                    delete htmlMiniOpts['deleteSources'];
                    delete htmlMiniOpts['files'];
                    delete htmlMiniOpts['exclude'];
                    delete htmlMiniOpts['encoding'];
                    delete htmlMiniOpts['extension'];
                    let nextFile;
                    let addError = (err, file) => {
                        result.errors.push({
                            error: err,
                            file: file,
                        });
                        nextFile();
                    };
                    nextFile = () => {
                        if (filesToCompile.length < 1) {
                            completed(null, result);
                            return;
                        }
                        let f = filesToCompile.shift();
                        try {
                            let outDir = Path.dirname(f);
                            let ext = Path.extname(f);
                            let fileName = Path.basename(f, ext);
                            let outputFile = Path.join(outDir, fileName + '.' + outExt);
                            let deleteSourceFile = () => {
                                if (deleteOnSuccess) {
                                    FS.unlink(f, (err) => {
                                        if (err) {
                                            addError(err, f);
                                        }
                                        else {
                                            nextFile();
                                        }
                                    });
                                }
                                else {
                                    nextFile();
                                }
                            };
                            FS.readFile(f, (err, data) => {
                                if (err) {
                                    addError(err, f);
                                }
                                else {
                                    try {
                                        let code = data.toString(enc);
                                        let ugliCode = HtmlMinifier.minify(code, htmlMiniOpts);
                                        FS.writeFile(outputFile, new Buffer(ugliCode, enc), (err) => {
                                            if (err) {
                                                addError(err, f);
                                            }
                                            else {
                                                deleteSourceFile();
                                            }
                                        });
                                    }
                                    catch (e) {
                                        addError(err, f);
                                    }
                                }
                            });
                        }
                        catch (e) {
                            addError(e, f);
                        }
                    };
                    nextFile();
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
}
exports.compileHtmlMinifier = compileHtmlMinifier;
/**
 * Compiles LESS files.
 *
 * @param {LessCompilerOptions} [opts] The options.
 *
 * @returns Promise<LessCompilerResult> The promise.
 */
function compileLess(opts) {
    if (!opts) {
        opts = {};
    }
    let compressOutput = deploy_helpers.toBooleanSafe(opts.compress);
    let enc = deploy_helpers.normalizeString(opts.encoding);
    if ('' === enc) {
        enc = 'utf8';
    }
    let searchPaths = deploy_helpers.asArray(opts.paths)
        .map(x => deploy_helpers.toStringSafe(x))
        .filter(x => !deploy_helpers.isEmptyString(x));
    searchPaths = deploy_helpers.distinctArray(searchPaths);
    let outExt = deploy_helpers.toStringSafe(opts.extension);
    if (deploy_helpers.isEmptyString(outExt)) {
        outExt = 'css';
    }
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            collectCompilerFiles({
                files: "/**/*.less",
            }, opts).then((filesToCompile) => {
                let result = {
                    errors: [],
                    files: filesToCompile.map(x => x),
                };
                let compileNext;
                let compileCompleted = (file, err) => {
                    if (err) {
                        result.errors.push({
                            error: err,
                            file: file,
                        });
                    }
                    compileNext();
                };
                compileNext = () => {
                    if (filesToCompile.length < 1) {
                        completed(null, result);
                        return;
                    }
                    let f = filesToCompile.shift();
                    FS.readFile(f, (err, data) => {
                        if (err) {
                            compileCompleted(f, err);
                            return;
                        }
                        try {
                            let lessCode = data.toString(enc);
                            let dir = Path.dirname(f);
                            let fileExt = Path.extname(f);
                            let fileName = Path.basename(f, fileExt);
                            let outputFile = Path.join(dir, fileName + '.' + outExt);
                            let compilerPaths;
                            if (searchPaths.length > 0) {
                                compilerPaths = searchPaths.map(x => {
                                    if (!Path.isAbsolute(x)) {
                                        x = Path.join(dir, x);
                                    }
                                    return x;
                                });
                            }
                            if (compilerPaths) {
                                compilerPaths = compilerPaths.filter(x => !deploy_helpers.isEmptyString(x))
                                    .map(x => Path.resolve(x));
                                compilerPaths = deploy_helpers.distinctArray(compilerPaths);
                            }
                            // compile...
                            LESS.render(lessCode, {
                                compress: compressOutput,
                                paths: compilerPaths,
                            }, (err, output) => {
                                try {
                                    if (err) {
                                        compileCompleted(f, err); // compile error
                                    }
                                    else {
                                        let outData = new Buffer(deploy_helpers.toStringSafe(output.css), enc);
                                        let writeToFile = () => {
                                            FS.writeFile(outputFile, outData, (err) => {
                                                outData = null;
                                                compileCompleted(f, err);
                                            });
                                        };
                                        // check if output file exists
                                        FS.exists(outputFile, (fileExists) => {
                                            if (fileExists) {
                                                // yes, no check if really a file
                                                FS.lstat(outputFile, (err, stats) => {
                                                    if (err) {
                                                        compileCompleted(f, err);
                                                    }
                                                    else {
                                                        if (stats.isFile()) {
                                                            // now delete existing file...
                                                            FS.unlink(outputFile, (err) => {
                                                                if (err) {
                                                                    compileCompleted(f, err);
                                                                }
                                                                else {
                                                                    writeToFile(); // write to file
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            // no
                                                            compileCompleted(f, new Error(i18.t('isNo.file', outputFile)));
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                writeToFile(); // no, write to file
                                            }
                                        });
                                    }
                                }
                                catch (e) {
                                    compileCompleted(f, e);
                                }
                            });
                        }
                        catch (e) {
                            compileCompleted(e); // read file error
                        }
                    });
                };
                compileNext(); // start compiling
            }).catch((err) => {
                completed(err);
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.compileLess = compileLess;
/**
 * Compiles Pug files.
 *
 * @param {PugCompilerOptions} [opts] The options.
 *
 * @returns Promise<PugCompilerResult> The promise.
 */
function compliePug(opts) {
    if (!opts) {
        opts = {};
    }
    let enc = deploy_helpers.normalizeString(opts.encoding);
    if ('' === enc) {
        enc = 'utf8';
    }
    let outExt = deploy_helpers.toStringSafe(opts.extension);
    if (deploy_helpers.isEmptyString(opts.extension)) {
        outExt = 'html';
    }
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            collectCompilerFiles({
                files: "/**/*.pug",
            }, opts).then((filesToCompile) => {
                try {
                    let result = {
                        errors: [],
                        files: filesToCompile.map(x => x),
                    };
                    let pugOpts = deploy_helpers.cloneObject(opts);
                    delete pugOpts['files'];
                    delete pugOpts['exclude'];
                    delete pugOpts['encoding'];
                    delete pugOpts['extension'];
                    let nextFile;
                    let addError = (err, file) => {
                        result.errors.push({
                            error: err,
                            file: file,
                        });
                        nextFile();
                    };
                    nextFile = () => {
                        if (filesToCompile.length < 1) {
                            completed(null, result);
                            return;
                        }
                        let f = filesToCompile.shift();
                        let dir = Path.dirname(f);
                        let ext = Path.extname(f);
                        let fn = Path.basename(f, ext);
                        let outFile = Path.join(dir, fn + '.' + outExt);
                        FS.readFile(f, (err, data) => {
                            if (err) {
                                addError(err, f);
                            }
                            else {
                                try {
                                    pugOpts['filename'] = f;
                                    let pugSrc = data.toString(enc);
                                    let html = Pug.render(pugSrc, pugOpts);
                                    FS.writeFile(outFile, new Buffer(html, enc), (err) => {
                                        if (err) {
                                            addError(err, f);
                                        }
                                        else {
                                            nextFile();
                                        }
                                    });
                                }
                                catch (e) {
                                    addError(e, f);
                                }
                            }
                        });
                    };
                    nextFile();
                }
                catch (e) {
                    completed(e);
                }
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.compliePug = compliePug;
/**
 * Compiles files via a script.
 *
 * @param {ScriptCompilerOptions} [opts] The options.
 *
 * @returns Promise<TypeScriptCompilerResult> The promise.
 */
function compileScript(cfg, opts) {
    if (!opts) {
        opts = {
            script: './compile.js',
        };
    }
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            let compilerModule = deploy_helpers.loadModule(opts.script);
            if (compilerModule) {
                if (compilerModule.compile) {
                    collectCompilerFiles({
                        files: '**',
                    }, opts).then((filesToCompile) => {
                        let sym = Symbol("deploy.compilers.compileScript");
                        let args = {
                            deployFiles: (files, targets) => {
                                return deploy_helpers.deployFiles(files, targets, sym);
                            },
                            emitGlobal: function () {
                                return deploy_globals.EVENTS
                                    .emit
                                    .apply(deploy_globals.EVENTS, arguments);
                            },
                            files: filesToCompile,
                            globals: deploy_helpers.cloneObject(cfg.globals),
                            options: opts,
                            require: function (id) {
                                return require(id);
                            },
                            result: {
                                errors: [],
                                files: filesToCompile.map(x => x),
                            },
                        };
                        Promise.resolve(compilerModule.compile(args)).then((result) => {
                            completed(null, result || args.result);
                        }).catch((err) => {
                            completed(err);
                        });
                    }).catch((err) => {
                        completed(err);
                    });
                }
                else {
                    completed(new Error('No compile() function found!'));
                }
            }
            else {
                completed(new Error('No compiler module found!'));
            }
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.compileScript = compileScript;
/**
 * Compiles TypeScript files.
 *
 * @param {TypeScriptCompilerOptions} [opts] The options.
 *
 * @returns Promise<TypeScriptCompilerResult> The promise.
 */
function compileTypeScript(opts) {
    if (!opts) {
        opts = {};
    }
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            collectCompilerFiles({
                files: "/**/*.ts",
            }, opts).then((filesToCompile) => {
                try {
                    // create compiler
                    let program = TypeScript.createProgram(filesToCompile, opts);
                    // execute
                    let result = program.emit();
                    result.errors = [];
                    result.files = filesToCompile;
                    // collect errors
                    let allDiagnostics = TypeScript.getPreEmitDiagnostics(program).concat(result.diagnostics);
                    allDiagnostics.forEach(x => {
                        if (x.category != TypeScript.DiagnosticCategory.Error) {
                            return;
                        }
                        result.errors
                            .push({
                            diagnostic: x,
                            error: new Error(`[TS${x.code}] Offset ${x.start} :: ${x.messageText}`),
                            file: x.file.fileName,
                        });
                    });
                    completed(null, result);
                }
                catch (e) {
                    completed(e);
                }
            });
        }
        catch (e) {
            completed(e);
        }
    });
}
exports.compileTypeScript = compileTypeScript;
;
/**
 * Compiles JavaScript files with UglifyJS.
 *
 * @param {UglifyJSCompilerOptions} [opts] The options.
 *
 * @returns Promise<UglifyJSCompilerResult> The promise.
 */
function compileUglifyJS(opts) {
    if (!opts) {
        opts = {};
    }
    let enc = deploy_helpers.normalizeString(opts.encoding);
    if ('' === enc) {
        enc = 'utf8';
    }
    let outExt = deploy_helpers.toStringSafe(opts.extension);
    if (deploy_helpers.isEmptyString(opts.extension)) {
        outExt = 'min.js';
    }
    let deleteOnSuccess = deploy_helpers.toBooleanSafe(opts.deleteSources);
    return new Promise((resolve, reject) => {
        let completed = deploy_helpers.createSimplePromiseCompletedAction(resolve, reject);
        try {
            collectCompilerFiles({
                files: "/**/*.js",
            }, opts).then((filesToCompile) => {
                try {
                    let result = {
                        errors: [],
                        files: filesToCompile.map(x => x),
                    };
                    let uglifyOpts = deploy_helpers.cloneObject(opts);
                    delete uglifyOpts['deleteSources'];
                    delete uglifyOpts['files'];
                    delete uglifyOpts['exclude'];
                    delete uglifyOpts['encoding'];
                    delete uglifyOpts['extension'];
                    let nextFile;
                    let addError = (err, file) => {
                        result.errors.push({
                            error: err,
                            file: file,
                        });
                        nextFile();
                    };
                    nextFile = () => {
                        if (filesToCompile.length < 1) {
                            completed(null, result);
                            return;
                        }
                        let f = filesToCompile.shift();
                        try {
                            let outDir = Path.dirname(f);
                            let ext = Path.extname(f);
                            let fileName = Path.basename(f, ext);
                            let outputFile = Path.join(outDir, fileName + '.' + outExt);
                            let ur = UglifyJS.minify([f], uglifyOpts);
                            let ugliCode = deploy_helpers.toStringSafe(ur.code);
                            let deleteSourceFile = () => {
                                if (deleteOnSuccess) {
                                    FS.unlink(f, (err) => {
                                        if (err) {
                                            addError(err, f);
                                        }
                                        else {
                                            nextFile();
                                        }
                                    });
                                }
                                else {
                                    nextFile();
                                }
                            };
                            FS.writeFile(outputFile, new Buffer(ugliCode, enc), (err) => {
                                if (err) {
                                    addError(err, f);
                                }
                                else {
                                    deleteSourceFile();
                                }
                            });
                        }
                        catch (e) {
                            addError(e, f);
                        }
                    };
                    nextFile();
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
}
exports.compileUglifyJS = compileUglifyJS;
//# sourceMappingURL=compilers.js.map