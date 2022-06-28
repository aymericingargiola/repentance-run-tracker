const { autoUpdater } = require('electron-updater')
const isDevelopment = process.env.NODE_ENV !== 'production'
const { ipcMain } = require('electron')
// const log = require('electron-log')
let win

if(!isDevelopment && !process.env.IS_TEST) {
    // autoUpdater.logger = log
    // autoUpdater.logger["transports"].file.level = "info"
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.setFeedURL({
        provider: 'github',
        repo: 'repentance-run-tracker',
        owner: 'aymericingargiola',
        private: false,
    })
}

autoUpdater.on('update-available', (infos) => {
    win.webContents.send('UPDATE_AVAILABLE', infos)
})

autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('UPDATE_PROGRESS', progress)
})

autoUpdater.on('update-downloaded', (infos) => {
    win.webContents.send('UPDATE_DOWNLOADED', infos)
})

ipcMain.on('RESTART_APP', () => {
    autoUpdater.quitAndInstall(false, true)
})

module.exports = {
	checkForUpdate: function(window) {
		win = window ? window : win;
        if(win) autoUpdater.checkForUpdates()
	}
}