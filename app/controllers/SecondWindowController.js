/// <reference path="../../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Application = require("../../core/Controller");
var SecondWindowController = (function (_super) {
    __extends(SecondWindowController, _super);
    function SecondWindowController(ipc, window, arg) {
        _super.call(this, ipc, window);
        this._arg = arg;
    }
    SecondWindowController.prototype.onStart = function () {
        console.log("Start second controller");
        this.sendToRenderProcess("test", this._arg);
    };
    SecondWindowController.prototype.onStop = function (callback) {
        console.log("Stop second controller");
        callback(null);
    };
    return SecondWindowController;
})(Application.Controller);
exports.SecondWindowController = SecondWindowController;
