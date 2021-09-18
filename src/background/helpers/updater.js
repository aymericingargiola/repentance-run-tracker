const { autoUpdater } = require('electron-updater')
const isDevelopment = process.env.NODE_ENV !== 'production'
const { ipcMain } = require('electron')
// const log = require('electron-log')
let win

if(!isDevelopment && !process.env.IS_TEST) {
    // autoUpdater.logger = log
    // autoUpdater.logger["transports"].file.level = "info"
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = false
    autoUpdater.setFeedURL({
        provider: 'github',
        repo: 'repentance-run-tracker',
        owner: 'aymericingargiola',
        private: false,
    })
}

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    win.webContents.send('UPDATE_DOWNLOADED')
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