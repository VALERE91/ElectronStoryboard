/// <reference path="../typings/tsd.d.ts" />

export class Controller {
    protected _ipc: Object;
    protected _window: GitHubElectron.BrowserWindow;

    constructor(ipc: Object, window: GitHubElectron.BrowserWindow) {
        this._ipc = ipc;
        this._window = window;
    }

    protected sendToRenderProcess(channel: string, arg: Object): void {
        this._window.webContents.send(channel, arg);
    }

    protected loadView(view: string): void {
        this._window.loadUrl("view://" + view);
    }
    
    public onStart():void{
        throw new Error("You muste redefine onStart() method in all your controllers");
    }
    
    public onStop(callback : (err : any)=>void){
        callback(null);
    }
}   
