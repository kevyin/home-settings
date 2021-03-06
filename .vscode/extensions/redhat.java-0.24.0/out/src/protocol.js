'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
/**
 * The message type. Copied from vscode protocol
 */
var MessageType;
(function (MessageType) {
    /**
     * An error message.
     */
    MessageType[MessageType["Error"] = 1] = "Error";
    /**
     * A warning message.
     */
    MessageType[MessageType["Warning"] = 2] = "Warning";
    /**
     * An information message.
     */
    MessageType[MessageType["Info"] = 3] = "Info";
    /**
     * A log message.
     */
    MessageType[MessageType["Log"] = 4] = "Log";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * A functionality status
 */
var FeatureStatus;
(function (FeatureStatus) {
    /**
     * Disabled.
     */
    FeatureStatus[FeatureStatus["disabled"] = 0] = "disabled";
    /**
     * Enabled manually.
     */
    FeatureStatus[FeatureStatus["interactive"] = 1] = "interactive";
    /**
     * Enabled automatically.
     */
    FeatureStatus[FeatureStatus["automatic"] = 2] = "automatic";
})(FeatureStatus = exports.FeatureStatus || (exports.FeatureStatus = {}));
var CompileWorkspaceStatus;
(function (CompileWorkspaceStatus) {
    CompileWorkspaceStatus[CompileWorkspaceStatus["FAILED"] = 0] = "FAILED";
    CompileWorkspaceStatus[CompileWorkspaceStatus["SUCCEED"] = 1] = "SUCCEED";
    CompileWorkspaceStatus[CompileWorkspaceStatus["WITHERROR"] = 2] = "WITHERROR";
    CompileWorkspaceStatus[CompileWorkspaceStatus["CANCELLED"] = 3] = "CANCELLED";
})(CompileWorkspaceStatus = exports.CompileWorkspaceStatus || (exports.CompileWorkspaceStatus = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new vscode_languageclient_1.NotificationType('language/status');
})(StatusNotification = exports.StatusNotification || (exports.StatusNotification = {}));
var ProgressReportNotification;
(function (ProgressReportNotification) {
    ProgressReportNotification.type = new vscode_languageclient_1.NotificationType('language/progressReport');
})(ProgressReportNotification = exports.ProgressReportNotification || (exports.ProgressReportNotification = {}));
var ClassFileContentsRequest;
(function (ClassFileContentsRequest) {
    ClassFileContentsRequest.type = new vscode_languageclient_1.RequestType('java/classFileContents');
})(ClassFileContentsRequest = exports.ClassFileContentsRequest || (exports.ClassFileContentsRequest = {}));
var ProjectConfigurationUpdateRequest;
(function (ProjectConfigurationUpdateRequest) {
    ProjectConfigurationUpdateRequest.type = new vscode_languageclient_1.NotificationType('java/projectConfigurationUpdate');
})(ProjectConfigurationUpdateRequest = exports.ProjectConfigurationUpdateRequest || (exports.ProjectConfigurationUpdateRequest = {}));
var ActionableNotification;
(function (ActionableNotification) {
    ActionableNotification.type = new vscode_languageclient_1.NotificationType('language/actionableNotification');
})(ActionableNotification = exports.ActionableNotification || (exports.ActionableNotification = {}));
var CompileWorkspaceRequest;
(function (CompileWorkspaceRequest) {
    CompileWorkspaceRequest.type = new vscode_languageclient_1.RequestType('java/buildWorkspace');
})(CompileWorkspaceRequest = exports.CompileWorkspaceRequest || (exports.CompileWorkspaceRequest = {}));
var ExecuteClientCommandRequest;
(function (ExecuteClientCommandRequest) {
    ExecuteClientCommandRequest.type = new vscode_languageclient_1.RequestType('workspace/executeClientCommand');
})(ExecuteClientCommandRequest = exports.ExecuteClientCommandRequest || (exports.ExecuteClientCommandRequest = {}));
//# sourceMappingURL=protocol.js.map