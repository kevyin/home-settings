"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("./helpers");
/**
 * HTML content provider.
 */
class HtmlTextDocumentContentProvider {
    /**
     * Initializes a new instance of that class.
     *
     * @param {vs_deploy.Deployer} controller The underlying controller instance.
     */
    constructor(controller) {
        this._CONTROLLER = controller;
    }
    /**
     * Gets the underlying controller.
     */
    get controller() {
        return this._CONTROLLER;
    }
    /** @inheritdoc */
    provideTextDocumentContent(uri, token) {
        let me = this;
        let func;
        let funcThisArgs = me;
        switch (deploy_helpers.normalizeString(uri.authority)) {
            case 'authority':
                func = me.getHtmlDoc;
                break;
        }
        if (!func) {
            func = () => null;
        }
        return Promise.resolve(func.apply(funcThisArgs, [uri]));
    }
    /**
     * Returns a HTML document by its URI.
     *
     * @param {vscode.Uri} uri The URI.
     *
     * @return {string} The HTML content.
     */
    getHtmlDoc(uri) {
        let htmlDocs = this.controller.htmlDocuments;
        let doc;
        let params = deploy_helpers.uriParamsToObject(uri);
        let idValue = decodeURIComponent(deploy_helpers.getUrlParam(params, 'id'));
        if (!deploy_helpers.isEmptyString(idValue)) {
            let id = idValue.trim();
            // search for document
            for (let i = 0; i < htmlDocs.length; i++) {
                let d = htmlDocs[i];
                if (deploy_helpers.toStringSafe(d.id).trim() === id) {
                    doc = d;
                    break;
                }
            }
        }
        let html = '';
        if (doc) {
            if (doc.body) {
                let enc = deploy_helpers.normalizeString(doc.encoding);
                if ('' === enc) {
                    enc = 'utf8';
                }
                html = doc.body.toString(enc);
            }
        }
        return html;
    }
}
exports.HtmlTextDocumentContentProvider = HtmlTextDocumentContentProvider;
//# sourceMappingURL=content.js.map