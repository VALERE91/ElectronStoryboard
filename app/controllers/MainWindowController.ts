/// <reference path="../../typings/tsd.d.ts" />

import Application = require("../../core/Controller");

export class MainWindowController extends Application.Controller{

	constructor(ipc : Object, window : GitHubElectron.BrowserWindow, arg : Object){
		super(ipc,window);
		this._window.openDevTools();
	}

	public onStart():void{
	}

	public onStop(callback : (err : any)=> void):void{
		callback(null);
	}
}
