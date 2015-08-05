/// <reference path="../typings/tsd.d.ts" />
var Controller = (function () {
    function Controller(ipc, window) {
        this._ipc = ipc;
        this._window = window;
    }
    Controller.prototype.sendToRenderProcess = function (channel, arg) {
        this._window.webContents.send(channel, arg);
    };
    Controller.prototype.loadView = function (view) {
        this._window.loadUrl("view://" + view);
    };
    Controller.prototype.onStart = function () {
        throw new Error("You muste redefine onStart() method in all your controllers");
    };
    Controller.prototype.onStop = function (callback) {
        callback(null);
    };
    return Controller;
})();
exports.Controller = Controller;
