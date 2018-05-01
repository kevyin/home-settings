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
const Path = require("path");
const vscode = require("vscode");
let currentFolder = false;
/**
 * Returns the root path of the selected workspace folder.
 *
 * @return {string} The root path.
 */
function getRootPath() {
    let folder;
    if (false === currentFolder) {
        if (vscode.workspace.workspaceFolders) {
            if (vscode.workspace.workspaceFolders.length > 0) {
                folder = vscode.workspace.workspaceFolders[0];
            }
        }
    }
    else {
        folder = currentFolder;
    }
    let workspace_root;
    if (folder) {
        workspace_root = vscode.workspace.getWorkspaceFolder(folder.uri)
            .uri
            .fsPath;
    }
    else {
        try {
            workspace_root = vscode.workspace.rootPath;
        }
        catch (e) {
            //TODO: log
            workspace_root = undefined;
        }
    }
    if ('undefined' !== typeof workspace_root) {
        return Path.resolve(workspace_root);
    }
}
exports.getRootPath = getRootPath;
/**
 * Resets the selected workspace folder.
 */
function resetSelectedWorkspaceFolder() {
    currentFolder = false;
}
exports.resetSelectedWorkspaceFolder = resetSelectedWorkspaceFolder;
/**
 * Selects the workspace.
 *
 * @return {Promise<vscode.WorkspaceFolder>} The promise with the folder (if selected).
 */
function selectWorkspace() {
    return __awaiter(this, void 0, void 0, function* () {
        const FOLDER = yield vscode.window.showWorkspaceFolderPick();
        if (FOLDER) {
            currentFolder = FOLDER;
        }
        return FOLDER;
    });
}
exports.selectWorkspace = selectWorkspace;
/**
 * Sets the current workspace (folder).
 *
 * @param {vscode.WorkspaceFolder} wsf The new folder.
 *
 * @return {vscode.WorkspaceFolder|false} The new folder.
 */
function setWorkspace(wsf) {
    return currentFolder = wsf || false;
}
exports.setWorkspace = setWorkspace;
//# sourceMappingURL=workspace.js.map