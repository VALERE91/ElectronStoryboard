/// <reference path="../../typings/tsd.d.ts" />

import Application = require("../../core/Controller");

export class SecondWindowController extends Application.Controller{
    private _arg : any;

	constructor(ipc : Object, window : GitHubElectron.BrowserWindow, arg : Object){
		super(ipc,window);
        //this._window.openDevTools();
        this._arg = arg;
	}
	
	public onStart():void{
		console.log("Start second controller");
		this.sendToRenderProcess("test",this._arg);
	}
	
	public onStop(callback : (err : any)=> void):void{
		console.log("Stop second controller");
		callback(null);
	}
}