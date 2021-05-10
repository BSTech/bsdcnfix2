# bsdcnfix2
Unofficial Discord Ghost Notification Panel Fixer

If you have questions about the "ToS" legality of this code, please see below.

## What is the purpose of this tool?

This tool patches a file of the Discord module to fix invisible notifications.
This is not the same "out-of-screen" issue which, again, I fixed it 2 years ago (see "bsdcnfix" in my repos).
This is also not the "unclickable screen portion" bug.

## What is the bug?

Someone at Discord has forgotten to expose&tweak the inter-process communication system to the notification panel renderer.

## How does this tool work?

This tool patches a file of Discord module (`modules/discord_desktop_core-1/discord_desktop_core/core.asar`) to make it making use of `BrowserWindow` preload scripts with context isolation to fix `require is not defined` error with the following steps:

- It "patches" `notificationScreen.js` to set a preload script called `nspreload.js`
- It generates `nspreload.js` to expose a relay `require` function, checks what is `require`d and if it is `electron` then it relays `ipcRenderer`'s `on` and `removeListener` functions (electron bug?) since they are made invisible to renderer context, they are finally exposed to renderers as `fix.require_fixed`.
- It "patches" `notifications/index.js` to make it use the functions mentioned in the previous step.
- It packs the freshly modified core.asar back in an ugly way.

If you have trust issues, you can consult a programmer and ask what does the code does. I could have only given core.asar file too but I wanted to gain your trust by writing this code.  
I also added what patches are applied in the fixer code as a separate file (detail.js) to make them easier for you to understand.

## How to use it?

First of all, you need to install node.js (tested on v12.14.1, it should also work with newer versions). If you have it already or installed it right now:

- Save the file `bsdcnfix2.js` only.
- Quit Discord.
- Navigate to Discord app location (AppData > Local > Discord > app-1.0.9001).
- Navigate to desktop module (modules > discord_desktop_core-1 > discord_desktop_core).
- Rename core.asar to \_core.asar, this achieves both making a backup in case of breaking something and provides the template for this tool (Do NOT delete this file even after done).
- Run `node bsdcnfix2` from anywhere you wish (command prompt, powershell, etc.).
- Check if a new "core.asar" is spawned in the same folder.
- Launch Discord and wait for a notification.

If something goes wrong, simply delete "core.asar" and rename "\_core.asar" back to "core.asar".  
If you update Discord and this feature gets broken again, just apply the fix again beginning from the first step.

## Is it legal? (RANT)

Probably not, and I don't care. If they are so upset about this tool, they can feel free to add 3-5 lines of code to simply fix it. I suggest them realize why it is so hard to fix the world's tiniest bug which explains itself (it's been 2 months) and realize why they caused someone to write 80+ lines of code to fix it while I am not even an employee at Discord.  
If you don't have this bug on Windows 10 version, I want to suggest you two things: either remove the notification panel entirely or make Discord only Windows 10 compatible.  

This tool does not collect/steal/share any data as you can understand from the codes. It just does some responsible developer's work instead. I wish I could earn money too...  
If you wonder why the code is so ugly: I have written it in a hurry and I have done everything in trial-and-error style.

### Contact: reddit/u/bstech_ or bstechgaming@gmail.com
