"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_helpers = require("../helpers");
const deploy_objects = require("../objects");
const Enumerable = require("node-enumerable");
const FS = require("fs");
const i18 = require("../i18");
const Path = require("path");
const Slack = require('@slack/client');
class SlackPlugin extends deploy_objects.DeployPluginBase {
    deployFile(file, target, opts) {
        const ME = this;
        let hasCanceled = false;
        ME.onCancelling(() => hasCanceled = true, opts);
        let completedInvoked = false;
        const COMPLETED = (err) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            if (opts.onCompleted) {
                opts.onCompleted(ME, {
                    canceled: hasCanceled,
                    error: err,
                    file: file,
                    target: target,
                });
            }
        };
        if (hasCanceled) {
            COMPLETED(null);
        }
        else {
            try {
                const RELATIVE_TARGET_FILE_PATH = deploy_helpers.toRelativeTargetPathWithValues(file, target, ME.context.values(), opts.baseDirectory);
                if (false === RELATIVE_TARGET_FILE_PATH) {
                    COMPLETED(new Error(i18.t('relativePaths.couldNotResolve', file)));
                    return;
                }
                const CHANNELS = Enumerable.from(deploy_helpers.asArray(target.channels)).selectMany(c => {
                    return deploy_helpers.toStringSafe(c)
                        .split(',');
                }).select(c => {
                    return c.trim();
                }).where(c => {
                    return '' !== c;
                }).distinct()
                    .joinToString(',');
                const TOKEN = deploy_helpers.toStringSafe(target.token).trim();
                const CLIENT = new Slack.WebClient(TOKEN);
                const FILENAME = Path.basename(file);
                if (opts.onBeforeDeploy) {
                    opts.onBeforeDeploy(ME, {
                        destination: CHANNELS,
                        file: file,
                        target: target,
                    });
                }
                const UPLOAD_OPTS = {
                    file: FS.createReadStream(file),
                    filetype: 'auto',
                    channels: CHANNELS,
                    title: RELATIVE_TARGET_FILE_PATH,
                };
                CLIENT.files.upload(FILENAME, UPLOAD_OPTS, function (err, res) {
                    COMPLETED(err);
                });
            }
            catch (e) {
                COMPLETED(e);
            }
        }
    }
    info() {
        return {
            description: i18.t('plugins.slack.description'),
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
    return new SlackPlugin(ctx);
}
exports.createPlugin = createPlugin;
//# sourceMappingURL=slack.js.map