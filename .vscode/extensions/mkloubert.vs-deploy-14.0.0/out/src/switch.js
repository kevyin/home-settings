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
const deploy_values = require("./values");
const Enumerable = require("node-enumerable");
const i18 = require("./i18");
const vscode = require("vscode");
const BUTTONS = [];
const KEY_SWITCH_STATES = 'vsdSwitchStates';
let nextButtonId = -1;
let switchStates = {};
/**
 * Changes a switch target.
 */
function changeSwitch() {
    return __awaiter(this, void 0, void 0, function* () {
        const ME = this;
        const TARGETS = ME.getTargets().filter(t => {
            return isSwitch(t);
        });
        let selectedOption;
        let selectedTarget;
        const SELECT_TARGET_OPTION = (index) => __awaiter(this, void 0, void 0, function* () {
            yield selectTargetOption.apply(ME, [selectedTarget, index]);
        });
        const QUICK_PICKS = TARGETS.map((t, i) => {
            const LABEL = getSwitchName(t, i);
            const DESCRIPTION = deploy_helpers.toStringSafe(t.description).trim();
            return {
                action: () => __awaiter(this, void 0, void 0, function* () {
                    selectedTarget = t;
                    yield SELECT_TARGET_OPTION(i);
                }),
                description: DESCRIPTION,
                label: LABEL,
            };
        });
        if (QUICK_PICKS.length < 1) {
            vscode.window.showWarningMessage('[vs-deploy] ' + i18.t('plugins.switch.noDefined'));
            return;
        }
        let targetAction;
        if (1 === QUICK_PICKS.length) {
            targetAction = QUICK_PICKS[0].action;
        }
        else {
            const SELECTED_ITEM = yield vscode.window.showQuickPick(QUICK_PICKS, {
                placeHolder: i18.t('plugins.switch.selectSwitch'),
            });
            if (SELECTED_ITEM) {
                targetAction = SELECTED_ITEM.action;
            }
        }
        if (targetAction) {
            yield Promise.resolve(targetAction());
        }
    });
}
exports.changeSwitch = changeSwitch;
/**
 * Returns the current option of a target.
 *
 * @param {deploy_plugins_switch.DeployTargetSwitch} target The target.
 * @param {TDefault} [defaultValue] The custom default value.
 *
 * @return {deploy_plugins_switch.DeployTargetSwitchOption|TDefault} The option (if found).
 */
function getCurrentOptionOf(target, defaultValue = false) {
    if (!target) {
        return target;
    }
    const TARGET_NAME = deploy_helpers.normalizeString(target.name);
    const STATES = getSelectedSwitchOptions();
    if (STATES) {
        const OPTION = STATES[TARGET_NAME];
        if ('object' === typeof OPTION) {
            return OPTION; // found
        }
        else {
            // get first (default) one
            // instead
            return Enumerable.from(getTargetOptionsOf(target)).orderBy(o => {
                return deploy_helpers.toBooleanSafe(o.isDefault) ? 0 : 1;
            }).firstOrDefault(x => true, defaultValue);
        }
    }
    return defaultValue;
}
exports.getCurrentOptionOf = getCurrentOptionOf;
/**
 * Returns the object that stores the states of all switches.
 *
 * @return {SelectedSwitchOptions} The object with the states.
 */
function getSelectedSwitchOptions() {
    return switchStates || {};
}
exports.getSelectedSwitchOptions = getSelectedSwitchOptions;
function getSwitches() {
    const ME = this;
    return ME.getTargets().filter(t => {
        return isSwitch(t);
    });
}
function getSwitchName(target, index) {
    if (!target) {
        return target;
    }
    let name = deploy_helpers.toStringSafe(target.name).trim();
    if ('' === name) {
        name = i18.t('plugins.switch.defaultName', index + 1);
    }
    return name;
}
function getSwitchOptionName(target, index) {
    if (!target) {
        return target;
    }
    let name = deploy_helpers.toStringSafe(target.name).trim();
    if ('' === name) {
        name = i18.t('plugins.switch.defaultOptionName', index + 1);
    }
    return name;
}
/**
 * Returns the options of a switch target.
 *
 * @param {deploy_plugins_switch.DeployTargetSwitch} target The target.
 *
 * @return {deploy_plugins_switch.DeployTargetSwitchOption[]} The options.
 */
function getTargetOptionsOf(target) {
    if (deploy_helpers.isNullOrUndefined(target)) {
        return target;
    }
    const TARGET_NAME = deploy_helpers.normalizeString(target.name);
    const OPTIONS = [];
    let objIndex = -1;
    Enumerable.from(deploy_helpers.asArray(target.options)).where(v => {
        return !deploy_helpers.isNullOrUndefined(v);
    }).select(v => {
        ++objIndex;
        v = deploy_helpers.cloneObject(v);
        if ('object' !== typeof v) {
            v = {
                targets: [deploy_helpers.normalizeString(v)]
            };
        }
        v.__id = `${target.__id}\n` +
            `${deploy_helpers.normalizeString(deploy_helpers.getSortValue(v))}\n` +
            `${objIndex}\n` +
            `${deploy_helpers.normalizeString(v.name)}`;
        v.__index = objIndex;
        v.targets = Enumerable.from(deploy_helpers.asArray(v.targets)).select(t => {
            return deploy_helpers.normalizeString(t);
        }).where(t => '' !== t &&
            TARGET_NAME !== t)
            .distinct()
            .toArray();
        return v;
    })
        .pushTo(OPTIONS);
    return OPTIONS.sort((x, y) => {
        return deploy_helpers.compareValuesBy(x, y, o => deploy_helpers.getSortValue(o));
    });
}
exports.getTargetOptionsOf = getTargetOptionsOf;
function isSwitch(target) {
    if (target) {
        return [
            'switch'
        ].indexOf(deploy_helpers.normalizeString(target.type)) > -1;
    }
    return false;
}
function printSwitchStates() {
    const ME = this;
    try {
        const SWITCHES = getSwitches.apply(ME, []);
        if (SWITCHES.length > 0) {
            ME.outputChannel.appendLine('');
            ME.outputChannel.appendLine(i18.t('plugins.switch.states'));
            SWITCHES.forEach((s, i) => {
                const TARGET_NAME = getSwitchName(s, i);
                ME.outputChannel.append(i18.t('plugins.switch.item', TARGET_NAME));
                const OPTION = getCurrentOptionOf(s);
                if (false === OPTION) {
                    ME.outputChannel.appendLine(`<${i18.t('plugins.switch.noOptionSelected')}>`);
                }
                else {
                    ME.outputChannel.appendLine("'" + getSwitchOptionName(OPTION, OPTION.__index) + "'");
                }
            });
            ME.outputChannel.appendLine('');
        }
    }
    catch (e) {
        ME.log(`[ERROR :: vs-deploy] switch.printSwitchStates(): ${deploy_helpers.toStringSafe(e)}`);
    }
}
exports.printSwitchStates = printSwitchStates;
/**
 * Reloads the switch buttons.
 */
function reloadButtons() {
    const ME = this;
    while (BUTTONS.length > 0) {
        const BTN = BUTTONS.shift();
        deploy_helpers.tryDispose(BTN.button);
        deploy_helpers.tryDispose(BTN.command);
    }
    const SWITCHES = getSwitches.apply(ME, []);
    SWITCHES.forEach((s, i) => {
        let newBtn;
        let newCmd;
        try {
            if (deploy_helpers.isNullOrUndefined(s.button)) {
                return;
            }
            if ('object' !== typeof s.button) {
                if (!deploy_helpers.toBooleanSafe(s.button)) {
                    return;
                }
            }
            let btn = s.button;
            if ('object' !== typeof btn) {
                btn = {};
            }
            if (!deploy_helpers.toBooleanSafe(btn.enabled, true)) {
                return;
            }
            const ID = nextButtonId++;
            let color = deploy_helpers.normalizeString(btn.color);
            const IS_RIGHT = deploy_helpers.toBooleanSafe(btn.isRight);
            let prio = parseInt(deploy_helpers.toStringSafe(btn.priority).trim());
            if (deploy_helpers.isEmptyString(color)) {
                color = '#ffffff';
            }
            if (isNaN(prio)) {
                prio = undefined;
            }
            const ALIGNMENT = IS_RIGHT ? vscode.StatusBarAlignment.Right
                : vscode.StatusBarAlignment.Left;
            const COMMAND = 'extension.deploy.switches.button' + ID;
            newCmd = vscode.commands.registerCommand(COMMAND, () => __awaiter(this, void 0, void 0, function* () {
                yield selectTargetOption.apply(ME, [s, i]);
            }));
            newBtn = vscode.window.createStatusBarItem(ALIGNMENT, prio);
            newBtn.color = color;
            newBtn.command = COMMAND;
            newBtn.show();
            BUTTONS.push({
                button: newBtn,
                command: newCmd,
                index: i,
                settings: deploy_helpers.cloneObject(btn),
                switch: s,
            });
        }
        catch (e) {
            deploy_helpers.tryDispose(newBtn);
            deploy_helpers.tryDispose(newCmd);
            ME.log(`[ERROR :: vs-deploy] switch.reloadButtons(): ${deploy_helpers.toStringSafe(e)}`);
        }
    });
    updateButtons.apply(ME, []);
}
exports.reloadButtons = reloadButtons;
/**
 * Reloads the target states for switches.
 */
function reloadTargetStates() {
    const ME = this;
    resetTargetStates();
    try {
        const STATES = ME.context.workspaceState.get(KEY_SWITCH_STATES);
        if (STATES) {
            const SWITCHES = getSwitches.apply(ME, []);
            for (let p in STATES) {
                const OPTION_ID = STATES[p];
                if (deploy_helpers.isEmptyString(OPTION_ID)) {
                    continue;
                }
                const TARGET_NAME = deploy_helpers.normalizeString(p);
                SWITCHES.filter(s => {
                    return TARGET_NAME === deploy_helpers.normalizeString(s.name);
                }).forEach(s => {
                    Enumerable.from(getTargetOptionsOf(s)).where(o => {
                        return o.__id === OPTION_ID;
                    }).forEach(o => {
                        setCurrentOptionFor(s, o);
                    });
                });
            }
        }
        // clean update
        saveStates.apply(ME, []).then(() => {
        }).catch((err) => {
            ME.log(`[ERROR :: vs-deploy] switch.reloadTargetStates(2): ${deploy_helpers.toStringSafe(err)}`);
        });
    }
    catch (e) {
        ME.log(`[ERROR :: vs-deploy] switch.reloadTargetStates(1): ${deploy_helpers.toStringSafe(e)}`);
    }
}
exports.reloadTargetStates = reloadTargetStates;
/**
 * Resets all target states for switches.
 */
function resetTargetStates() {
    switchStates = {};
}
exports.resetTargetStates = resetTargetStates;
/**
 * Saves the states to the current workspace.
 */
function saveStates() {
    return __awaiter(this, void 0, void 0, function* () {
        const ME = this;
        try {
            let newValue;
            const STATES = getSelectedSwitchOptions();
            if (STATES) {
                newValue = {};
                for (let p in STATES) {
                    newValue[p] = STATES[p].__id;
                }
            }
            yield ME.context.workspaceState.update(KEY_SWITCH_STATES, newValue);
        }
        catch (e) {
            ME.log(`[ERROR :: vs-deploy] switch.saveStates(): ${deploy_helpers.toStringSafe(e)}`);
        }
    });
}
exports.saveStates = saveStates;
function selectTargetOption(target, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const ME = this;
        if (!target) {
            return;
        }
        let selectedOption;
        const SWITCH_NAME = getSwitchName(target, index);
        const OPTIONS = Enumerable.from(getTargetOptionsOf(target))
            .toArray()
            .sort((x, y) => {
            return deploy_helpers.compareValuesBy(x, y, i => deploy_helpers.getSortValue(i, () => ME.name));
        });
        const SELECT_OPTION = () => __awaiter(this, void 0, void 0, function* () {
            if (!selectedOption) {
                return;
            }
            setCurrentOptionFor(target, selectedOption);
            yield saveStates.apply(ME, []);
            printSwitchStates.apply(ME, []);
            updateButtons.apply(ME, []);
        });
        const OPTION_QUICK_PICKS = OPTIONS.map((o, i) => {
            const LABEL = getSwitchOptionName(o, i);
            const DESCRIPTION = deploy_helpers.toStringSafe(o.description).trim();
            let details = '';
            let isSelected = false;
            const SELECTED_OPTION_OF_TARGET = getCurrentOptionOf(target);
            if (SELECTED_OPTION_OF_TARGET) {
                if (o.__id === SELECTED_OPTION_OF_TARGET.__id) {
                    isSelected = true;
                }
            }
            return {
                action: () => __awaiter(this, void 0, void 0, function* () {
                    selectedOption = o;
                    yield SELECT_OPTION();
                }),
                description: DESCRIPTION,
                detail: isSelected ? `(${i18.t('selected')})` : '',
                label: LABEL,
            };
        });
        if (OPTION_QUICK_PICKS.length < 1) {
            vscode.window.showWarningMessage('[vs-deploy] ' + i18.t('plugins.switch.noOptionsDefined', SWITCH_NAME));
            return;
        }
        let action;
        if (1 === OPTION_QUICK_PICKS.length) {
            action = OPTION_QUICK_PICKS[0].action;
        }
        else {
            const SELECTED_ITEM = yield vscode.window.showQuickPick(OPTION_QUICK_PICKS, {
                placeHolder: i18.t('plugins.switch.selectOption', SWITCH_NAME),
            });
            if (SELECTED_ITEM) {
                action = SELECTED_ITEM.action;
            }
        }
        if (action) {
            yield Promise.resolve(action());
        }
    });
}
/**
 * Sets the current option for a switch target.
 *
 * @param {deploy_plugins_switch.DeployTargetSwitch} target The target.
 * @param {deploy_plugins_switch.DeployTargetSwitchOption} option The option to set.
 *
 * @return {Object} The new data.
 */
function setCurrentOptionFor(target, option) {
    if (!target) {
        return target;
    }
    const NAME = deploy_helpers.normalizeString(target.name);
    const STATES = getSelectedSwitchOptions();
    if (STATES) {
        STATES[NAME] = option;
        return {
            option: STATES[NAME],
            target: target,
        };
    }
}
exports.setCurrentOptionFor = setCurrentOptionFor;
function updateButtons() {
    const ME = this;
    BUTTONS.forEach(btn => {
        const SWITCH_NAME = getSwitchName(btn.switch, btn.index);
        const OPTION = getCurrentOptionOf(btn.switch);
        const VALUES = [
            new deploy_values.StaticValue({
                name: 'selectedSwitch',
                value: SWITCH_NAME,
            }),
            new deploy_values.StaticValue({
                name: 'selectedSwitchOption',
                value: false === OPTION ? undefined
                    : getSwitchOptionName(OPTION, OPTION.__index),
            }),
        ];
        ME.getValues().forEach(v => {
            VALUES.push(v);
        });
        let text = deploy_helpers.toStringSafe(deploy_values.replaceWithValues(VALUES, btn.settings.text)).trim();
        if ('' === text) {
            // default text
            text = i18.t('plugins.switch.button.text', SWITCH_NAME);
        }
        let tooltip = deploy_helpers.toStringSafe(deploy_values.replaceWithValues(VALUES, btn.settings.tooltip)).trim();
        if ('' === tooltip) {
            // default tooltip
            if (false === OPTION) {
                tooltip = i18.t('plugins.switch.button.tooltip', i18.t('plugins.switch.noOptionSelected'));
            }
            else {
                tooltip = i18.t('plugins.switch.button.tooltip', `'${getSwitchOptionName(OPTION, OPTION.__index)}'`);
            }
        }
        btn.button.text = text;
        btn.button.tooltip = tooltip;
    });
}
//# sourceMappingURL=switch.js.map