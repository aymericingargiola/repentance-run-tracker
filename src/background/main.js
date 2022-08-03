'use strict'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { startLogsWatch, itemTrackerWindowState } from './runs-watcher'
import { startModWatch } from './mod-watcher'
import { checkOldFolder, readyToSync, initConfig, initRuns, initTrash } from './helpers/readyToSync'
import { buildJsons } from './helpers/jsonBuilder'
import * as modFile from '!raw-loader!./mod-watcher/mod/main.lua'
import * as modMetadata from '!raw-loader!./mod-watcher/mod/metadata.xml'
import { checkForUpdate } from './helpers/updater'
import { cleanBackups, backupDatas } from './helpers/backupDatas'
const { syncApp } = require('./helpers/sync')
const isDevelopment = process.env.NODE_ENV !== 'production'
const { ipcMain } = require('electron')
const elog = require('electron-log')
const path = require('path')
const fs = require('fs')
const appDataFolder = process.env.APPDATA
const oldFolderName = "repentance-run-tracker"
const oldFolderPath = path.normalize(`${appDataFolder}\\${oldFolderName}`)
const dataFolder = app.getPath("userData")
let win, winTracker, config, runs, trash

elog.info(`App is starting... | App Version : ${app.getVersion()} | Node version : ${process.version} | Electron version : ${process.versions.electron}`)

process.on('unhandledRejection', (error, p) => {
  console.log(error)
  elog.error(error)
  if (win) {
    syncApp(win, { trigger: 'send app error', error: {message:error.message,stack:error.stack} })
    win.setAlwaysOnTop(true)
    win.show()
    win.focus()
  }
})

process.on('uncaughtException', (error) => {
  console.log(error)
  elog.error(error)
  if (win) {
    try {
      syncApp(win, { trigger: 'send app error', error: {message:error.message,stack:error.stack}})
      win.setAlwaysOnTop(true)
      win.show()
      win.focus() 
    } catch (error) {
      console.log("Can't handle exception from frontend, win seems destroyed")
    }
  }
})

ipcMain.on('READ_FILE', (event, payload) => {
  const content = fs.readFileSync(payload.path);
  event.reply('READ_FILE', { content })
})

ipcMain.on('MINIMIZE_APP', (event, payload) => {
  win.minimize()
})

ipcMain.on('HIDE_APP', (event, payload) => {
  win.hide()
})

ipcMain.on('CLOSE_APP', async (event, payload) => {
  await backupDatas(dataFolder)
  elog.info('Closing app...')
  app.exit()
})

ipcMain.on('RESTART_APP', async (event, payload) => {
  await backupDatas(dataFolder)
  elog.info('Closing app...')
  app.relaunch()
  app.exit()
})

ipcMain.on('FULLSCREEN_APP', (event, payload) => {
  if (win.isNormal()) {
    win.maximize()
  } else {
    win.unmaximize()
  }
})

ipcMain.on('APP_VERSION', (event) => {
  event.reply('APP_VERSION', { appVersion: app.getVersion() })
})

ipcMain.on('OPEN_ITEMTRACKER', async (event, payload) => {
  openItemTracker()
})

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function openItemTracker() {
  if (winTracker) return
  winTracker = new BrowserWindow({
    title: "Item Tracker",
    width: 1000,
    height: 400,
    minWidth: 200,
    minHeight: 100,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    frame: true,
    darkTheme: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.resolve(__static, 'preload.js')
    }
  })

  readyToSync(false, winTracker)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await winTracker.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/tracker`)
    if (!process.env.IS_TEST) winTracker.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    winTracker.loadURL('app://./index.html/#/tracker')
  }

  winTracker.webContents.on('new-window', function(e, url) {
    e.preventDefault()
    require('electron').shell.openExternal(url)
  })

  winTracker.on('close', function(e) { 
    e.preventDefault()
    winTracker.destroy()
    winTracker = undefined
    readyToSync(false, winTracker)
    itemTrackerWindowState(winTracker)
  })

  itemTrackerWindowState(winTracker)
}

async function createWindow() {
  await checkOldFolder(oldFolderPath, dataFolder)
  await cleanBackups()
  if(!config) config = await initConfig()
  if(!runs) runs = await initRuns()
  if(!trash) trash = await initTrash()
  // Create the browser window.
  win = new BrowserWindow({
    title: "Repentance Run Tracker",
    width: 1000,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    darkTheme: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.resolve(__static, 'preload.js')
    }
  })
  readyToSync(win, false)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  //Check for app updates
  win.once('ready-to-show', () => {
    if(!isDevelopment && !process.env.IS_TEST) {
      checkForUpdate(win)
    }
  })

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault()
    require('electron').shell.openExternal(url)
  })
  
  startLogsWatch(win, config, runs, trash)
  startModWatch(win, isDevelopment, modFile.default, modMetadata.default, config)
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    elog.info('Closing app...')
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}