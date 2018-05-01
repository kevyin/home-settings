"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default host address.
 */
exports.DEFAULT_HOST = '127.0.0.1';
/**
 * The default directory where remote files should be stored.
 */
exports.DEFAULT_HOST_DIR = './';
/**
 * Default maximum size of a remote JSON message.
 */
exports.DEFAULT_MAX_MESSAGE_SIZE = 16777215;
/**
 * The default algorithm for crypting data by password.
 */
exports.DEFAULT_PASSWORD_ALGORITHM = 'aes-256-ctr';
/**
 * Default TCP port of a host.
 */
exports.DEFAULT_PORT = 23979;
/**
 * Name of the event to cancel a deployment.
 */
exports.EVENT_CANCEL_DEPLOY = 'deploy.cancel';
/**
 * Name of the event to cancel a pull.
 */
exports.EVENT_CANCEL_PULL = 'pull.cancel';
/**
 * Name of the event that is raised when
 * configuration has been reloaded.
 */
exports.EVENT_CONFIG_RELOADED = 'deploy.config.reloaded';
/**
 * Name of the event that deploys files.
 */
exports.EVENT_DEPLOYFILES = 'deploy.deployFiles';
/**
 * Name of the event for the 'complete' for the
 * event that deploys files.
 */
exports.EVENT_DEPLOYFILES_COMPLETE = 'deploy.deployFiles.complete';
/**
 * Name of the event for the 'error' for the
 * event that deploys files.
 */
exports.EVENT_DEPLOYFILES_ERROR = 'deploy.deployFiles.error';
/**
 * Name of the event for the 'success' for the
 * event that deploys files.
 */
exports.EVENT_DEPLOYFILES_SUCCESS = 'deploy.deployFiles.success';
/**
 * Name of the event that is raised when 'deploy on change'
 * feature should be disabled.
 */
exports.EVENT_DEPLOYONCHANGE_DISABLE = 'deploy.deployOnChange.disable';
/**
 * Name of the event that is raised when 'deploy on change'
 * feature should be enabled.
 */
exports.EVENT_DEPLOYONCHANGE_ENABLE = 'deploy.deployOnChange.enable';
/**
 * Name of the event that is raised when 'deploy on change'
 * feature should be toggled.
 */
exports.EVENT_DEPLOYONCHANGE_TOGGLE = 'deploy.deployOnChange.toggle';
/**
 * Name of the event that is raised when 'deploy on save'
 * feature should be disabled.
 */
exports.EVENT_DEPLOYONSAVE_DISABLE = 'deploy.deployOnSave.disable';
/**
 * Name of the event that is raised when 'deploy on save'
 * feature should be enabled.
 */
exports.EVENT_DEPLOYONSAVE_ENABLE = 'deploy.deployOnSave.enable';
/**
 * Name of the event that is raised when 'deploy on save'
 * feature should be toggled.
 */
exports.EVENT_DEPLOYONSAVE_TOGGLE = 'deploy.deployOnSave.toggle';
/**
 * Name of the event that is raised when 'sync when open'
 * feature should be disabled.
 */
exports.EVENT_SYNCWHENOPEN_DISABLE = 'deploy.syncWhenOpen.disable';
/**
 * Name of the event that is raised when 'sync when open'
 * feature should be enabled.
 */
exports.EVENT_SYNCWHENOPEN_ENABLE = 'deploy.syncWhenOpen.enable';
/**
 * Name of the event that is raised when 'sync when open'
 * feature should be toggled.
 */
exports.EVENT_SYNCWHENOPEN_TOGGLE = 'deploy.syncWhenOpen.toggle';
/**
 * Name of the event that is raised when workspace (folder) changed.
 */
exports.EVENT_WORKSPACE_CHANGED = 'deploy.workspace.changed';
/**
 * The transformer mode.
 */
var DataTransformerMode;
(function (DataTransformerMode) {
    /**
     * Restore transformed data.
     */
    DataTransformerMode[DataTransformerMode["Restore"] = 0] = "Restore";
    /**
     * Transform UNtransformed data.
     */
    DataTransformerMode[DataTransformerMode["Transform"] = 1] = "Transform";
})(DataTransformerMode = exports.DataTransformerMode || (exports.DataTransformerMode = {}));
/**
 * List of deploy directions.
 */
var DeployDirection;
(function (DeployDirection) {
    /**
     * Deploy (from workspace to target)
     */
    DeployDirection[DeployDirection["Deploy"] = 1] = "Deploy";
    /**
     * Pull (From target to workspace)
     */
    DeployDirection[DeployDirection["Pull"] = 2] = "Pull";
    /**
     * Download from target
     */
    DeployDirection[DeployDirection["Download"] = 3] = "Download";
    /**
     * Get information about a file.
     */
    DeployDirection[DeployDirection["FileInfo"] = 4] = "FileInfo";
})(DeployDirection = exports.DeployDirection || (exports.DeployDirection = {}));
/**
 * List of deploy operation kinds.
 */
var DeployOperationKind;
(function (DeployOperationKind) {
    /**
     * Before deployment starts.
     */
    DeployOperationKind[DeployOperationKind["Before"] = 0] = "Before";
    /**
     * After successful deployment.
     */
    DeployOperationKind[DeployOperationKind["After"] = 1] = "After";
})(DeployOperationKind = exports.DeployOperationKind || (exports.DeployOperationKind = {}));
//# sourceMappingURL=contracts.js.map