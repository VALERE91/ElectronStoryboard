/// <reference path="../typings/tsd.d.ts" />
/// <reference path="Storyboard.ts" />
var BrowserWindow = require('browser-window');
var app = require('app');
var storyboard = require("./Storyboard");
require('crash-reporter').start();
var mainWindow = null;
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});
app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        preload: __dirname + "/preload.js",
        'web-preferences': { 'web-security': false } });
    var myStoryboard = new storyboard.Storyboard(__dirname + "/../storyboard.json", require("ipc"), mainWindow, require('protocol'));
    myStoryboard.start();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});
