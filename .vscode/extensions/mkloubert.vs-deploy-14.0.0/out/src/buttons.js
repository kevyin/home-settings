"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("./helpers");
const i18 = require("./i18");
const vscode = require("vscode");
let nextDeployPackageCommandId = Number.MAX_SAFE_INTEGER;
let packageButtons = [];
/**
 * Reloads the package buttons.
 */
function reloadPackageButtons() {
    let me = this;
    // remove old
    unloadPackageButtons();
    me.getPackages().forEach((p, idx) => {
        let btn;
        let cmd;
        let disposeItems = false;
        try {
            let packageButton;
            if (!deploy_helpers.isNullOrUndefined(p.button)) {
                if ('object' !== typeof p.button) {
                    packageButton = {
                        enabled: deploy_helpers.toBooleanSafe(p.button),
                    };
                }
                else {
                    packageButton = p.button;
                }
            }
            if (packageButton && deploy_helpers.toBooleanSafe(packageButton.enabled, true)) {
                // command ID
                let cmdName = deploy_helpers.toStringSafe(packageButton.command).trim();
                if ('' === cmdName) {
                    cmdName = 'extension.deploy.deployPackageByButton' + (nextDeployPackageCommandId--);
                }
                // alignment
                let align = vscode.StatusBarAlignment.Left;
                if (deploy_helpers.toBooleanSafe(packageButton.isRight)) {
                    align = vscode.StatusBarAlignment.Right;
                }
                // priority
                let prio = parseFloat(deploy_helpers.toStringSafe(packageButton.priority).trim());
                if (isNaN(prio)) {
                    prio = undefined;
                }
                // text
                let text = deploy_helpers.toStringSafe(packageButton.text);
                text = me.replaceWithValues(text);
                if (deploy_helpers.isEmptyString(text)) {
                    text = deploy_helpers.toStringSafe(p.name).trim();
                }
                if (deploy_helpers.isEmptyString(text)) {
                    text = i18.t('packages.defaultName', idx + 1);
                }
                // tooltip
                let tooltip = deploy_helpers.toStringSafe(packageButton.tooltip);
                tooltip = me.replaceWithValues(tooltip);
                if (deploy_helpers.isEmptyString(tooltip)) {
                    tooltip = deploy_helpers.toStringSafe(p.description).trim();
                }
                if (deploy_helpers.isEmptyString(tooltip)) {
                    tooltip = cmdName;
                }
                // create and setup button
                btn = vscode.window.createStatusBarItem(align, prio);
                if (!deploy_helpers.isEmptyString(text)) {
                    btn.text = text;
                }
                if (!deploy_helpers.isEmptyString(tooltip)) {
                    btn.tooltip = tooltip;
                }
                // register underlying command
                cmd = vscode.commands.registerCommand(cmdName, () => {
                    try {
                        btn.hide();
                        let allTargets = me.getTargets();
                        // collect explicit targets
                        let targetNames = deploy_helpers.asArray(packageButton.targets)
                            .map(x => deploy_helpers.normalizeString(x))
                            .filter(x => '' !== x);
                        targetNames = deploy_helpers.distinctArray(targetNames);
                        let targetToDeployTo = [];
                        targetNames.forEach(tn => {
                            // find matching targets by name
                            let machtingTargets = [];
                            for (let i = 0; i < allTargets.length; i++) {
                                let t = allTargets[i];
                                if (deploy_helpers.normalizeString(t.name) === tn) {
                                    machtingTargets.push(t);
                                }
                            }
                            if (machtingTargets.length > 0) {
                                targetToDeployTo = targetToDeployTo.concat(machtingTargets);
                            }
                            else {
                                // could not find any target
                                if (deploy_helpers.toBooleanSafe(me.config.showWarningsForNonExistingTargets)) {
                                    vscode.window.showWarningMessage(i18.t('packages.couldNotFindTarget', tn, p.name));
                                }
                            }
                        });
                        me.deployWorkspace(p, targetToDeployTo).then((code) => {
                            btn.show();
                        }).catch((err) => {
                            btn.show();
                            me.log(i18.t('errors.withCategory', `buttons.reloadPackageButtons(3.${idx})`, err));
                        });
                    }
                    catch (e) {
                        btn.show();
                        me.log(i18.t('errors.withCategory', `buttons.reloadPackageButtons(2.${idx})`, e));
                    }
                });
                btn.command = cmdName;
                btn.show();
            }
            if (btn && cmd) {
                let btnEntry = {
                    button: btn,
                    command: cmd,
                    index: undefined,
                };
                btnEntry.index = packageButtons.push(btnEntry) - 1;
            }
            else {
                disposeItems = true;
            }
        }
        catch (e) {
            disposeItems = true;
            me.log(i18.t('errors.withCategory', `buttons.reloadPackageButtons(1.${idx})`, e));
        }
        finally {
            if (disposeItems) {
                deploy_helpers.tryDispose(btn);
                deploy_helpers.tryDispose(cmd);
            }
        }
    });
}
exports.reloadPackageButtons = reloadPackageButtons;
/**
 * Unloads current package buttons.
 */
function unloadPackageButtons() {
    while (packageButtons.length > 0) {
        let pb = packageButtons.shift();
        pb.index = null;
        deploy_helpers.tryDispose(pb.button);
        deploy_helpers.tryDispose(pb.command);
    }
}
exports.unloadPackageButtons = unloadPackageButtons;
//# sourceMappingURL=buttons.js.map