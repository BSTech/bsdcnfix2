//Author: BSTech

const { writeFileSync, readFileSync } = require('fs');
const { homedir } = require('os');
let userpath = homedir();
writeFileSync(`${userpath}\\AppData\\Local\\Discord\\app-1.0.9001\\modules\\discord_desktop_core-1\\discord_desktop_core\\core.asar`, 
process_archive(readFileSync(`${userpath}\\AppData\\Local\\Discord\\app-1.0.9001\\modules\\discord_desktop_core-1\\discord_desktop_core\\_core.asar`)));
console.log('Done');

function process_archive(data)
{
	var p1 = data.readInt32LE(0);
	var hdrsize = data.readInt32LE(4);
	var localoffset = data.readInt32LE(8) + 12;
	var actuallistsize = data.readInt32LE(12);
	var dataoffset = hdrsize + 8;
	var tmplength = data.length;
	
	var list = JSON.parse(data.toString('utf8', 16, actuallistsize + 16));
	
	var notificationScreenJSEntry = list.files.app.files['notificationScreen.js'];
	var indexJSEntry = list.files.app.files.notifications.files['index.js'];
	
	delete list.files.app.files['notificationScreen.js'];
	delete list.files.app.files.notifications.files['index.js'];
	
	notificationScreenJSEntry.offset = parseInt(notificationScreenJSEntry.offset) + localoffset;
	indexJSEntry.offset = parseInt(indexJSEntry.offset) + localoffset;
	
	var notificationScreen = data.toString('utf8', notificationScreenJSEntry.offset, notificationScreenJSEntry.offset + notificationScreenJSEntry.size);
	var indexJS = data.toString('utf8', indexJSEntry.offset, indexJSEntry.offset + indexJSEntry.size);
	
	notificationScreen = notificationScreen.replace('nodeIntegration: true', 'nodeIntegration: true, preload: _path.default.join(__dirname, "nspreload.js")');
	indexJS = indexJS.replace('{e.exports=require("electron")}', '{e.exports=fix.require_fixed("electron")}').replace('{r.on("DISCORD_"+e,t)}', '{r.on_fix("DISCORD_"+e,t)}').replace('{r.removeListener("DISCORD_"+e,t)}', '{r.removeListener_fix("DISCORD_"+e,t)}');
	
	var newData = Buffer.alloc(data.length + 150000); //this can leave additional empty bytes at the end of file but this doesn't affect anything
	
	//----- Stub/placeholder for file table entries -----
	notificationScreenJSEntry.offset = tmplength;
	notificationScreenJSEntry.size = notificationScreen.length;
	list.files.app.files['notificationScreen.js'] = notificationScreenJSEntry;
	
	tmplength += notificationScreen.length;
	
	indexJSEntry.offset = tmplength;
	indexJSEntry.size = indexJS.length;
	list.files.app.files.notifications.files['index.js'] = indexJSEntry;
	
	tmplength += indexJS.length;
	//---------------------------------------------------
	
	
	const preload_script = 'const{contextBridge}=require("electron");contextBridge.exposeInMainWorld("fix",{require_fixed:(a)=>{if(a==="electron"){var q=require(a);q.ipcRenderer.on_fix=(a,b)=>{q.ipcRenderer.on(a,b);};q.ipcRenderer.removeListener_fix=(a,b)=>{q.ipcRenderer.removeListener(a,b);}; return q;}}});';
	
	//------ Stub/placeholder for file table entry ------
	list.files.app.files['nspreload.js'] = { size: preload_script.length, offset: tmplength };
	//---------------------------------------------------
	
	
	
	var json = JSON.stringify(list);
	var jsonl = (Math.ceil((json.length) / 4) * 4) + 4;
	
	localoffset = jsonl + 4;
	var ofpos = 0;
	
	ofpos = newData.writeInt32LE(p1, 0);
	ofpos = newData.writeInt32LE(jsonl + 12, ofpos);
	ofpos = newData.writeInt32LE(localoffset + 4, ofpos);
	ofpos = newData.writeInt32LE(json.length, ofpos);
	newData.fill(0, ofpos, jsonl); ofpos += jsonl;
	
	for (var j = 0; j < jsonl - json.length; j++) ofpos = newData.writeInt8(0, ofpos);
	
	var tableEnd = ofpos;
	ofpos += data.copy(newData, ofpos, dataoffset);
	
	list.files.app.files['notificationScreen.js'].offset = ofpos - tableEnd;
	list.files.app.files['notificationScreen.js'].offset += ''; //simple int to string conversion
	ofpos += newData.write(notificationScreen, ofpos, notificationScreen.length);
	
	list.files.app.files.notifications.files['index.js'].offset = ofpos - tableEnd;
	list.files.app.files.notifications.files['index.js'].offset += '';
	ofpos += newData.write(indexJS, ofpos, indexJS.length);
	
	list.files.app.files['nspreload.js'].offset = ofpos - tableEnd;
	list.files.app.files['nspreload.js'].offset += '';
	newData.write(preload_script, ofpos, preload_script.length);
	
	var json = JSON.stringify(list);
	newData.writeInt32LE(json.length, 12);
	newData.write(json, 16, json.length);

	
	return newData;
}