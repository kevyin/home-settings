"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const deploy_workspace = require("../workspace");
const i18 = require("../i18");
const Path = require("path");
const vscode = require("vscode");
function createAppArgsList(file, app, args) {
    file = deploy_helpers.toStringSafe(file);
    if (app) {
        if (!Path.isAbsolute(app)) {
            app = Path.join(deploy_workspace.getRootPath(), app);
        }
    }
    if (!args) {
        args = [];
    }
    args = args.map(x => {
        x = deploy_helpers.toStringSafe(x);
        x = deploy_helpers.replaceAllStrings(x, '${file}', file);
        return x;
    });
    return [app].concat(args)
        .filter(x => x);
}
class AppPlugin extends deploy_objects.MultiFileDeployPluginBase {
    /** @inheritdoc */
    deployWorkspace(files, target, opts) {
        let me = this;
        if (!opts) {
            opts = {};
        }
        let completed = (err) => {
            files.forEach(x => {
                if (opts.onBeforeDeployFile) {
                    opts.onBeforeDeployFile(me, {
                        destination: app,
                        file: x,
                        target: target,
                    });
                }
                if (opts.onFileCompleted) {
                    opts.onFileCompleted(me, {
                        error: err,
                        file: x,
                        target: target,
                    });
                }
            });
            if (opts.onCompleted) {
                opts.onCompleted(me, {
                    error: err,
                    target: target,
                });
            }
        };
        let app = deploy_helpers.toStringSafe(target.app);
        app = me.context.replaceWithValues(app);
        let submitTheListOfFiles = deploy_helpers.toBooleanSafe(target.submitFileList, true);
        let waitForApp = deploy_helpers.toBooleanSafe(target.wait);
        if (deploy_helpers.toBooleanSafe(target.runInTerminal)) {
            // run in terminal
            let args = deploy_helpers.asArray(target.arguments)
                .map(x => deploy_helpers.toStringSafe(x))
                .filter(x => x);
            if (submitTheListOfFiles) {
                args = args.concat(files);
            }
            let terminalName = '[vs-deploy]';
            if (!deploy_helpers.isEmptyString(target.name)) {
                terminalName += ' ' + deploy_helpers.toStringSafe(target.name).trim();
            }
            if (!Path.isAbsolute(app)) {
                app = Path.join(deploy_workspace.getRootPath(), app);
            }
            app = Path.resolve(app);
            let terminal = vscode.window.createTerminal(terminalName, app, args);
            terminal.show();
        }
        else {
            let firstFile = files[0];
            let nextFiles = files.filter((x, i) => i > 0);
            let args = [];
            if (target.arguments) {
                args = args.concat(deploy_helpers.asArray(target.arguments));
            }
            if (submitTheListOfFiles) {
                args = args.concat(nextFiles)
                    .filter(x => x);
            }
            let separator = deploy_helpers.toStringSafe(target.separator);
            if ('' === separator) {
                separator = ' ';
            }
            let appOpts;
            let firstAppArg;
            if (submitTheListOfFiles) {
                firstAppArg = firstFile;
                appOpts = createAppArgsList(nextFiles.join(separator), app, args);
            }
            else {
                if (args.length < 1) {
                    firstAppArg = app;
                }
                else {
                    firstAppArg = args[0];
                    appOpts = createAppArgsList(nextFiles.join(separator), app, args.filter((x, i) => i > 0));
                }
            }
            deploy_helpers.open(firstAppArg, {
                app: appOpts,
                env: deploy_helpers.makeEnvVarsForProcess(target, me.context.values()),
                wait: waitForApp,
            }).then(() => {
                completed();
            }).catch((err) => {
                completed(err);
            });
        }
    }
    info() {
        return {
            description: i18.t('plugins.app.description'),
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
    return new AppPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=app.js.map