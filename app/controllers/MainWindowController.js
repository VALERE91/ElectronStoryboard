/// <reference path="../../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Application = require("../../core/Controller");
var MainWindowController = (function (_super) {
    __extends(MainWindowController, _super);
    function MainWindowController(ipc, window, arg) {
        _super.call(this, ipc, window);
        this._window.openDevTools();
    }
    MainWindowController.prototype.onStart = function () {
    };
    MainWindowController.prototype.onStop = function (callback) {
        callback(null);
    };
    return MainWindowController;
})(Application.Controller);
exports.MainWindowController = MainWindowController;
