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
const deploy_helpers = require("./helpers");
const deploy_objects = require("./objects");
const deploy_res_css = require("./resources/css");
const deploy_res_html = require("./resources/html");
const deploy_res_javascript = require("./resources/javascript");
const deploy_urls = require("./urls");
const deploy_values = require("./values");
const HtmlEntities = require("html-entities");
const i18 = require("./i18");
const Marked = require("marked");
const Path = require("path");
const vscode = require("vscode");
const Workflows = require("node-workflows");
/**
 * Checks files.
 *
 * @param {string[]} files the files to check.
 * @param {deploy_contracts.DeployTarget} target The target.
 * @param {deploy_contracts.DeployPlugin} plugin The plugin.
 *
 * @returns {(Promise<false|null|FileCompareResult[]>)} The result.
 */
function checkFiles(files, target, plugin) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!plugin.compareFiles && !plugin.compareWorkspace) {
            return false; // not supported
        }
        if (!plugin.canGetFileInfo) {
            return null; // no file info support
        }
        let wf = Workflows.create();
        wf.next((ctx) => {
            ctx.result = [];
        });
        if (plugin.compareWorkspace) {
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                let results = ctx.result;
                let compareRes = yield plugin.compareWorkspace(files, target);
                results.push
                    .apply(results, compareRes);
                return compareRes;
            }));
        }
        else {
            // use compareFiles() instead
            files.forEach(f => {
                wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                    let results = ctx.result;
                    let compareRes = yield plugin.compareFiles(f, target);
                    results.push(compareRes);
                    return compareRes;
                }));
            });
        }
        return yield wf.start();
    });
}
exports.checkFiles = checkFiles;
/**
 * Checks for newer files.
 *
 * @param {string[]} files the files to check.
 * @param {deploy_contracts.DeployTarget} target The target.
 * @param {deploy_contracts.DeployPlugin} plugin The plugin.
 *
 * @returns {Promise<boolean>} The promise.
 */
function checkForNewerFiles(files, target, plugin) {
    return __awaiter(this, void 0, void 0, function* () {
        let me = this;
        let wf = Workflows.create();
        wf.next((ctx) => {
            ctx.result = true;
        });
        let differences = yield checkFiles(files, target, plugin);
        if (Array.isArray(differences)) {
            wf.next(() => __awaiter(this, void 0, void 0, function* () {
                return differences.filter(d => {
                    try {
                        if (!d.right.exists) {
                            return false; // only if exist
                        }
                        if (!d.right.modifyTime) {
                            return false; // cannot compare
                        }
                        if (!d.left.modifyTime) {
                            return true;
                        }
                        return d.right.modifyTime.utc()
                            .isAfter(d.left.modifyTime.utc());
                    }
                    catch (e) {
                        d.right.error = e;
                        return true;
                    }
                });
            }));
            // check data
            wf.next((ctx) => __awaiter(this, void 0, void 0, function* () {
                let newerFiles = ctx.previousValue;
                for (let i = 0; i < newerFiles.length;) {
                    let nf = newerFiles[i];
                    let remove = false;
                    if (!nf.right.error) {
                        try {
                            if (plugin.canPull) {
                                let leftData = (yield deploy_helpers.loadFrom(Path.join(nf.left.path, nf.left.name))).data;
                                let rightdata = yield plugin.downloadFile(Path.join(nf.left.path, nf.left.name), target);
                                let toComparableBuffer = (b) => __awaiter(this, void 0, void 0, function* () {
                                    let isBinary = yield deploy_helpers.isBinaryContent(b);
                                    if (!isBinary) {
                                        let str = b.toString('ascii');
                                        str = deploy_helpers.replaceAllStrings(str, "\r", "");
                                        str = deploy_helpers.replaceAllStrings(str, "\t", "    ");
                                        b = new Buffer(str, 'ascii');
                                    }
                                    return b;
                                });
                                leftData = yield toComparableBuffer(leftData);
                                rightdata = yield toComparableBuffer(rightdata);
                                if (leftData.equals(rightdata)) {
                                    remove = true;
                                }
                            }
                        }
                        catch (e) {
                            nf.right.error = e;
                        }
                    }
                    if (remove) {
                        newerFiles.splice(i, 1);
                    }
                    else {
                        i++;
                    }
                }
                return newerFiles;
            }));
            // show wanring if newer files were found
            wf.next((ctx) => {
                let newerFiles = ctx.previousValue;
                return new Promise((resolve, reject) => {
                    let localFiles = newerFiles.map(nf => {
                        return Path.join(nf.left.path, nf.left.name);
                    }).map(lf => {
                        return Path.resolve(lf);
                    });
                    if (newerFiles.length > 0) {
                        ctx.result = false;
                        let msg = i18.t('deploy.newerFiles.message', newerFiles.length);
                        // [BUTTON] show
                        let showBtn = new deploy_objects.SimplePopupButton();
                        showBtn.action = () => {
                            ctx.result = false;
                            showFilesInBrowsers(me, newerFiles, target).then(() => {
                                resolve();
                            }).catch((err) => {
                                reject(err);
                            });
                        };
                        showBtn.title = i18.t('deploy.newerFiles.show');
                        // [BUTTON] deploy
                        let deployBtn = new deploy_objects.SimplePopupButton();
                        deployBtn.action = () => {
                            ctx.result = true;
                            resolve();
                        };
                        deployBtn.title = i18.t('deploy.newerFiles.deploy');
                        let args = [msg, showBtn, deployBtn];
                        // show popup
                        vscode.window.showWarningMessage.apply(null, args).then((btn) => {
                            try {
                                if (btn) {
                                    btn.action();
                                }
                                else {
                                    ctx.result = null;
                                    resolve();
                                }
                            }
                            catch (e) {
                                reject(e);
                            }
                        }, (err) => {
                            reject(err);
                        });
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        return yield wf.start();
    });
}
exports.checkForNewerFiles = checkForNewerFiles;
function showFilesInBrowsers(me, files, target) {
    return __awaiter(this, void 0, void 0, function* () {
        let title;
        if (deploy_helpers.isNullUndefinedOrEmptyString(target.name)) {
            title = i18.t('deploy.newerFiles.titleNoTarget');
        }
        else {
            title = i18.t('deploy.newerFiles.title', target.name);
        }
        let htmlEncoder = new HtmlEntities.AllHtmlEntities();
        let markdown = `# ${htmlEncoder.encode(title)}\n`;
        markdown += `| ${htmlEncoder.encode(i18.t('deploy.newerFiles.localFile'))} | ${htmlEncoder.encode(i18.t('deploy.newerFiles.modifyTime'))} | ${htmlEncoder.encode(i18.t('deploy.newerFiles.size'))} | ${htmlEncoder.encode(i18.t('deploy.newerFiles.remoteFile'))} | ${htmlEncoder.encode(i18.t('deploy.newerFiles.modifyTime'))} | ${htmlEncoder.encode(i18.t('deploy.newerFiles.size'))}\n`;
        markdown += "| ---------- |:--:|:--:| ---------- |:--:|:--:|\n";
        files.map(f => {
            let localFile = Path.join(f.left.path, f.left.name);
            let relLocalPath = deploy_helpers.toRelativePath(localFile);
            if (false !== relLocalPath) {
                localFile = relLocalPath;
            }
            let remoteFile = f.right.name;
            if (!deploy_helpers.isNullUndefinedOrEmptyString(f.right.path)) {
                remoteFile = Path.join(f.right.path, f.right.name);
                remoteFile = deploy_helpers.replaceAllStrings(remoteFile, Path.sep, '/');
                let relRemotePath = deploy_helpers.toRelativeTargetPathWithValues(remoteFile, target, me.getValues());
                if (false !== relRemotePath) {
                    remoteFile = relRemotePath;
                }
            }
            return {
                localFile: localFile,
                localModifyTime: f.left.modifyTime,
                localSize: f.left.size,
                remoteFile: remoteFile,
                remoteModifyTime: f.right.modifyTime,
                remoteSize: f.right.size,
            };
        }).sort((x, y) => {
            let comp0 = deploy_helpers.compareValuesBy(x, y, t => deploy_helpers.normalizeString(t.localFile));
            if (0 !== comp0) {
                return comp0;
            }
            return deploy_helpers.compareValuesBy(x, y, t => deploy_helpers.normalizeString(t.remoteFile));
        }).forEach(x => {
            markdown += `| ${htmlEncoder.encode(x.localFile)}`;
            // local last change
            markdown += '| ';
            if (x.localModifyTime) {
                markdown += x.localModifyTime.format(i18.t('format.dateTime'));
            }
            else {
                markdown += '?';
            }
            markdown += ' ';
            // local size
            markdown += '| ';
            if (isNaN(x.localSize)) {
                markdown += '?';
            }
            else {
                markdown += x.localSize;
            }
            markdown += ' ';
            markdown += `| ${htmlEncoder.encode(x.remoteFile)}`;
            // remote last change
            markdown += '| ';
            if (x.remoteModifyTime) {
                markdown += x.remoteModifyTime.format(i18.t('format.dateTime'));
            }
            else {
                markdown += '?';
            }
            markdown += ' ';
            // remote size
            markdown += '| ';
            if (isNaN(x.remoteSize)) {
                markdown += '?';
            }
            else {
                markdown += x.remoteSize;
            }
            markdown += ' ';
            markdown += "|\n";
        });
        let header = deploy_res_html.getContentSync('header_markdown_template.html').toString('utf8');
        let footer = deploy_res_html.getContentSync('footer_markdown_template.html').toString('utf8');
        let jquery = deploy_res_javascript.getContentSync('jquery.min.js').toString('utf8');
        let script = deploy_res_javascript.getContentSync('script.js').toString('utf8');
        let highlightJS = deploy_res_javascript.getContentSync('highlight.pack.js').toString('utf8');
        let css_highlightJS_css = deploy_res_css.getContentSync('highlight.darkula.css').toString('utf8');
        let css_highlightJS_css_default = deploy_res_css.getContentSync('highlight.default.css').toString('utf8');
        let css = deploy_res_css.getContentSync('styles.css').toString('utf8');
        let html = header + footer;
        let values = [];
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-jQuery',
            value: JSON.stringify(stringToBase64(jquery)),
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-CSS',
            value: css,
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-highlightjs-CSS',
            value: css_highlightJS_css,
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-highlightjs-CSS-default',
            value: css_highlightJS_css_default,
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-highlightjs',
            value: JSON.stringify(stringToBase64(highlightJS)),
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-content',
            value: JSON.stringify(stringToBase64(Marked(markdown, {
                breaks: true,
                gfm: true,
                tables: true,
            }))),
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-header',
            value: '',
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-footer',
            value: '',
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-project-page',
            value: deploy_urls.PROJECT_PAGE,
        }));
        values.push(new deploy_values.StaticValue({
            name: 'vsDeploy-script',
            value: JSON.stringify(stringToBase64(script)),
        }));
        html = deploy_values.replaceWithValues(values, html);
        yield me.openHtml(html, '[vs-deploy] ' + title);
    });
}
function stringToBase64(str) {
    str = deploy_helpers.toStringSafe(str);
    return (new Buffer(str, 'utf8')).toString('base64');
}
//# sourceMappingURL=diff.js.map