/**
 * Storyboard
 */
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Controller.ts" />

import Application = require("./Controller");
import path = require("path");
import fs = require("fs");

export class Storyboard {

	private _storyBoard : Object;
	private _ipc : any;
	private _currentView : any;
	private _currentController : any;
	private _mainWindow : GitHubElectron.BrowserWindow;
	private _protocol : any;

	constructor(file : string, ipc: any, mainWindow : GitHubElectron.BrowserWindow,protocol : any) {
		this._storyBoard = require(file);
		this._ipc = ipc;
		this._mainWindow = mainWindow;
		this._protocol = protocol;
		this.initProtocol();

		for (var view in this._storyBoard)
		{
			if (this._storyBoard.hasOwnProperty(view))
			{
				var element = this._storyBoard[view];

				if(element.hasOwnProperty("view")
				&& element.hasOwnProperty("main")
				&& element["main"])
				{
					this._currentView = element;
					if(element.hasOwnProperty("controller"))
					{
						this._currentController = element["controller"];
					}
				}
			}
		}

		this._ipc.on('storyboard',this.ipcStoryboardListener);
		this._ipc.on('dom-ready',()=>{
			this._currentController.onStart();
		});
		this._mainWindow.on("close", () =>{
			if(this._currentController){
				this._currentController.onStop((err:any)=>{

				});
			}
		});
	}

	private initProtocol():void{
		//Register application protocols
		//Get the index.html view
		this._protocol.registerProtocol('view', (request) => {
			var url = request.url.substr(7);
			let filePath = __dirname + '/../app/views/' + url;
			var stat = fs.statSync(filePath);

			if(stat.isFile()){
				return new this._protocol.RequestFileJob(path.normalize(filePath));
			}
			else{
				return new this._protocol.RequestFileJob(path.normalize(filePath + "/index.html"));
			}
		});

		//Return a JS file depends of the current view
		this._protocol.registerProtocol('app', (request) => {
			var url = request.url.substr(6);
			let filePath = __dirname + '/../app/views/'+ this._currentView["view"] + "/js/" + url;
			var stat = fs.statSync(filePath);

			if(stat.isFile()){
				return new this._protocol.RequestFileJob(path.normalize(filePath));
			}
			else{
				return new this._protocol.RequestFileJob(path.normalize( __dirname + '/../app/views/globals/js/' + url));
			}
		});

		this._protocol.registerProtocol('css', (request) => {
			var url = request.url.substr(6)
			let filePath = __dirname + '/../app/views/'+ this._currentView["view"] + "/css/" + url;
			var stat = fs.statSync(filePath);

			if(stat.isFile()){
				return new this._protocol.RequestFileJob(path.normalize(filePath));
			}
			else{
				return new this._protocol.RequestFileJob(path.normalize( __dirname + '/../app/views/globals/css/' + url));
			}
		});

		this._protocol.registerProtocol('img', (request) => {
			var url = request.url.substr(6)
			let filePath = __dirname + '/../app/views/'+ this._currentView["view"] + "/img/" + url;
			var stat = fs.statSync(filePath);

			if(stat.isFile()){
				return new this._protocol.RequestFileJob(path.normalize(filePath));
			}
			else{
				return new this._protocol.RequestFileJob(path.normalize( __dirname + '/../app/views/globals/img/' + url));
			}
		});

		this._protocol.interceptProtocol('file',(request) => {
			var url = request.url.substr(7);
			if(url.split('/')[0]==="bower"){
				return new this._protocol.RequestFileJob(path.normalize(__dirname + '/../app/bower_components/' + url.substr(6)));
			}
		});
	}

	public start():void{
		this._currentController = null;
		this.loadController(this._currentView["controller"],null);
		this._mainWindow.loadUrl("view://" + this._currentView.view);
	}

	private loadController(name : string, arg: any):void{
		if(this._currentView.hasOwnProperty("controller"))
		{
			var importController = require("../app/controllers/" + this._currentView.controller + ".js");
			for (var key in importController) {
				if (importController.hasOwnProperty(key)) {
					var element = importController[key];
					this._currentController = new element(this._ipc, this._mainWindow,arg);
					break;
				}
			}
		}
	}

	private ipcStoryboardListener = (event : any, arg : any) =>
	{
		var view:Object = this.ipcEventHandler(arg);

		if(view["view"] && view["view"] !== this._currentView["view"])
		{
			this._currentController.onStop((err)=>{
				this._currentView = view;
				this._currentController = null;
				this.loadController(view["controller"],arg);
				this._mainWindow.loadUrl("view://" + this._currentView.view);
				this._mainWindow.on('complete',()=>{
					this._currentController.onStart();
					console.log("DOM-Ready");
				});
			});
		}
	}

	private ipcEventHandler(arg : any) : Object{
		var view:Object;
		if(arg.hasOwnProperty("event")){
			this._currentView.events.forEach(viewEvent => {
				if(viewEvent && viewEvent.name && viewEvent.view && viewEvent.name === arg.event){
					view = this._storyBoard[viewEvent.view];
				}
			});
		}
		return view;
	}
}
