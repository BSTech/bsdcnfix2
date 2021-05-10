//---------------------
//notificationScreen.js
//---------------------
//original code:

notificationWindow = new _electron.BrowserWindow({
    title: title,
    frame: false,
    resizable: false,
    show: false,
    acceptFirstMouse: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
//patch:

notificationWindow = new _electron.BrowserWindow({
    title: title,
    frame: false,
    resizable: false,
    show: false,
    acceptFirstMouse: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true, preload: _path.default.join(__dirname, "nspreload.js")
    }
  });
  


//----------------------
//notifications/index.js
//----------------------
//original code:

r=n(24).ipcRenderer;e.exports={send:function(e,...t){r.send("DISCORD_"+e,...t)},on:function(e,t){r.on("DISCORD_"+e,t)},removeListener:function(e,t){r.removeListener("DISCORD_"+e,t)}}}

... throw u.framesToPop=1,u}}},function(e,t){e.exports=require("electron")},function(e,t,n){"use strict";n.r(t); ...

//patch:

r=n(24).ipcRenderer;e.exports={send:function(e,...t){r.send("DISCORD_"+e,...t)},on:function(e,t){r.on_fix("DISCORD_"+e,t)},removeListener:function(e,t){r.removeListener_fix("DISCORD_"+e,t)}}}

... throw u.framesToPop=1,u}}},function(e,t){e.exports=fix.require_fixed("electron")},function(e,t,n){"use strict";n.r(t); ...



//------------
//nspreload.js
//------------

const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("fix", {
	require_fixed: (a) => {
		if (a === "electron") {
			var q = require(a);
			q.ipcRenderer.on_fix = (a, b) => {
				q.ipcRenderer.on(a, b);
			};
			q.ipcRenderer.removeListener_fix = (a, b) => {
				q.ipcRenderer.removeListener(a, b);
			};
			return q;
		}
	}
});