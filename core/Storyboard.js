/**
 * Storyboard
 */
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Controller.ts" />
var path = require("path");
var fs = require("fs");
var Storyboard = (function () {
    function Storyboard(file, ipc, mainWindow, protocol) {
        var _this = this;
        this.ipcStoryboardListener = function (event, arg) {
            var view = _this.ipcEventHandler(arg);
            if (view["view"] && view["view"] !== _this._currentView["view"]) {
                _this._currentController.onStop(function (err) {
                    _this._currentView = view;
                    _this._currentController = null;
                    _this.loadController(view["controller"], arg);
                    _this._mainWindow.loadUrl("view://" + _this._currentView.view);
                    _this._mainWindow.on('complete', function () {
                        _this._currentController.onStart();
                        console.log("DOM-Ready");
                    });
                });
            }
        };
        this._storyBoard = require(file);
        this._ipc = ipc;
        this._mainWindow = mainWindow;
        this._protocol = protocol;
        this.initProtocol();
        for (var view in this._storyBoard) {
            if (this._storyBoard.hasOwnProperty(view)) {
                var element = this._storyBoard[view];
                if (element.hasOwnProperty("view")
                    && element.hasOwnProperty("main")
                    && element["main"]) {
                    this._currentView = element;
                    if (element.hasOwnProperty("controller")) {
                        this._currentController = element["controller"];
                    }
                }
            }
        }
        this._ipc.on('storyboard', this.ipcStoryboardListener);
        this._ipc.on('dom-ready', function () {
            _this._currentController.onStart();
        });
        this._mainWindow.on("close", function () {
            if (_this._currentController) {
                _this._currentController.onStop(function (err) {
                });
            }
        });
    }
    Storyboard.prototype.initProtocol = function () {
        var _this = this;
        this._protocol.registerProtocol('view', function (request) {
            var url = request.url.substr(7);
            var filePath = __dirname + '/../app/views/' + url;
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                return new _this._protocol.RequestFileJob(path.normalize(filePath));
            }
            else {
                return new _this._protocol.RequestFileJob(path.normalize(filePath + "/index.html"));
            }
        });
        this._protocol.registerProtocol('app', function (request) {
            var url = request.url.substr(6);
            var filePath = __dirname + '/../app/views/' + _this._currentView["view"] + "/js/" + url;
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                return new _this._protocol.RequestFileJob(path.normalize(filePath));
            }
            else {
                return new _this._protocol.RequestFileJob(path.normalize(__dirname + '/../app/views/globals/js/' + url));
            }
        });
        this._protocol.registerProtocol('css', function (request) {
            var url = request.url.substr(6);
            var filePath = __dirname + '/../app/views/' + _this._currentView["view"] + "/css/" + url;
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                return new _this._protocol.RequestFileJob(path.normalize(filePath));
            }
            else {
                return new _this._protocol.RequestFileJob(path.normalize(__dirname + '/../app/views/globals/css/' + url));
            }
        });
        this._protocol.registerProtocol('img', function (request) {
            var url = request.url.substr(6);
            var filePath = __dirname + '/../app/views/' + _this._currentView["view"] + "/img/" + url;
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                return new _this._protocol.RequestFileJob(path.normalize(filePath));
            }
            else {
                return new _this._protocol.RequestFileJob(path.normalize(__dirname + '/../app/views/globals/img/' + url));
            }
        });
        this._protocol.interceptProtocol('file', function (request) {
            var url = request.url.substr(7);
            if (url.split('/')[0] === "bower") {
                return new _this._protocol.RequestFileJob(path.normalize(__dirname + '/../app/bower_components/' + url.substr(6)));
            }
        });
    };
    Storyboard.prototype.start = function () {
        this._currentController = null;
        this.loadController(this._currentView["controller"], null);
        this._mainWindow.loadUrl("view://" + this._currentView.view);
    };
    Storyboard.prototype.loadController = function (name, arg) {
        if (this._currentView.hasOwnProperty("controller")) {
            var importController = require("../app/controllers/" + this._currentView.controller + ".js");
            for (var key in importController) {
                if (importController.hasOwnProperty(key)) {
                    var element = importController[key];
                    this._currentController = new element(this._ipc, this._mainWindow, arg);
                    break;
                }
            }
        }
    };
    Storyboard.prototype.ipcEventHandler = function (arg) {
        var _this = this;
        var view;
        if (arg.hasOwnProperty("event")) {
            this._currentView.events.forEach(function (viewEvent) {
                if (viewEvent && viewEvent.name && viewEvent.view && viewEvent.name === arg.event) {
                    view = _this._storyBoard[viewEvent.view];
                }
            });
        }
        return view;
    };
    return Storyboard;
})();
exports.Storyboard = Storyboard;
