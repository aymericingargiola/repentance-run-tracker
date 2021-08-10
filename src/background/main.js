'use strict'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'
import { writeFileAsync, fileResolve } from './tools/fileSystem'
import { startLogsWatch, liveTrackerWindowState } from './runs-watcher'
import { startModWatch } from './mod-watcher'
import * as modFile from '!raw-loader!./mod-watcher/mod/main.lua'
import * as modMetadata from '!raw-loader!./mod-watcher/mod/metadata.xml'
const log = require('electron-log')
const isDevelopment = process.env.NODE_ENV !== 'production'
const { ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { syncApp } = require('./sync')
const dataFolder = app.getPath("userData")
const configTemplate = require('./jsons/configTemplate.json')
let win, winTracker, config, winStreak, tags, runs

if(!isDevelopment && !process.env.IS_TEST) {
  autoUpdater.logger = log
  autoUpdater.logger["transports"].file.level = "info"
  
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = false
  
  autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'repentance-run-tracker',
    owner: 'aymericingargiola',
    private: false,
  })
}

// console.log("electron", process.versions.electron)

ipcMain.on('ASK_CONFIG', async (event, payload) => {
  const window = payload && payload.window === "liveTracker" ? winTracker : win
  if (!config) config = await initConfig()
  syncApp(window,{trigger: "send config", config: config})
})

ipcMain.on('USER_UPDATE_CONFIG', async (event, payload) => {
  if (!config) config = await initConfig()
  config.find(configItem => configItem.id === payload.id).value = payload.value
  await writeFileAsync(dataFolder, 'config.json', JSON.stringify(config))
})

ipcMain.on('ASK_WINSTREAK', async (event, payload) => {
  const window = payload && payload.window === "liveTracker" ? winTracker : win
  if (!winStreak) winStreak = await initWinStreak()
  syncApp(window,{trigger: "send winstreak", winStreak: winStreak})
})

ipcMain.on('USER_CREATE_WINSTREAK', async (event, payload) => {
  if (!winStreak) winStreak = await initWinStreak()
  winStreak.push(payload)
  await writeFileAsync(dataFolder, 'winstreak.json', JSON.stringify(winStreak))
})

ipcMain.on('USER_REMOVE_WINSTREAK', async (event, payload) => {
  if (!winStreak) winStreak = await initWinStreak()
  const winStreakIndex = winStreak.findIndex(winStreakItem => winStreakItem.id === payload)
  if(winStreakIndex != -1) {
      winStreak.splice(winStreakIndex, 1)
      await writeFileAsync(dataFolder, 'winstreak.json', JSON.stringify(winStreak))
  } else {
      console.log(`Impossible to find : ${payload}, this winstreak doesn't exist on the backend ! (Sync issue ?)`)
  }
})

ipcMain.on('USER_UPDATE_WINSTREAK', async (event, payload) => {
  if (!winStreak) winStreak = await initWinstreak()
  winStreak.find(winStreakItem => winStreakItem.id === payload.id)[payload.property] = payload.value
  await writeFileAsync(dataFolder, 'winstreak.json', JSON.stringify(winStreak))
})

ipcMain.on('ASK_TAGS', async (event, payload) => {
  const window = payload && payload.window === "liveTracker" ? winTracker : win
  if (!tags) tags = await initTags()
  syncApp(window,{trigger: "send tags", tags: tags})
})

ipcMain.on('USER_CREATE_TAGS', async (event, payload) => {
  if (!tags) tags = await initTags()
  tags.push(payload)
  await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags))
})

ipcMain.on('USER_REMOVE_TAGS', async (event, payload) => {
  if (!tags) tags = await initTags()
  const tagsIndex = tags.findIndex(tag => tag.value === payload)
  if(tagsIndex != -1) {
      tags.splice(tagsIndex, 1)
      await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags))
  } else {
      console.log(`Impossible to find : ${payload}, this tag doesn't exist on the backend ! (Sync issue ?)`)
  }
})

ipcMain.on('USER_UPDATE_TAGS', async (event, payload) => {
  if (!tags) tags = await initTags()
  tags.find(tag => tag.id === payload.id)[payload.property] = payload.value
  await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags))
})

ipcMain.on('ASK_RUNS', async (event, payload) => {
  const window = payload && payload.window === "liveTracker" ? winTracker : win
  if (!runs) runs = await initRuns()
  syncApp(window,{trigger: "send runs", runs: runs})
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
  await writeFileAsync(dataFolder, 'store.json', payload)
  app.exit()
})

ipcMain.on('FULLSCREEN_APP', (event, payload) => {
  if (win.isNormal()) {
    win.maximize()
  } else {
    win.unmaximize()
  }
})

ipcMain.on('SAVE_STORE', async (event, payload) => {
  await writeFileAsync(dataFolder, 'store.json', payload)
})

ipcMain.on('APP_VERSION', (event) => {
  event.reply('APP_VERSION', { appVersion: app.getVersion() })
})

ipcMain.on('OPEN_LIVETRACKER', async (event, payload) => {
  openLiveTracker()
})

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function initConfig() {
  // Load app config file
  const loadConfig = await fileResolve(dataFolder, 'config.json', JSON.stringify(configTemplate))
  let tempConfig = JSON.parse(fs.readFileSync(loadConfig))
  configTemplate.forEach((field) => {
    const tempConfigField = tempConfig.find(configItem => configItem.id === field.id)
    if(!tempConfigField) tempConfig.push(field)
    if(tempConfigField && tempConfigField.choices != field.choices) tempConfigField.choices = field.choices
    if(tempConfigField && tempConfigField.name != field.name) tempConfigField.name = field.name
    if(tempConfigField && tempConfigField.hint != field.hint) tempConfigField.hint = field.hint
    if(tempConfigField && tempConfigField.type != field.type) tempConfigField.type = field.type
    if(tempConfigField && tempConfigField.disabled != field.disabled) tempConfigField.disabled = field.disabled
  })
  await writeFileAsync(dataFolder, 'config.json', JSON.stringify(tempConfig))
  return tempConfig
}

async function initWinStreak() {
  // Load winstreak
  const loadWinstreak = await fileResolve(dataFolder, 'winstreak.json', '[]')
  return JSON.parse(fs.readFileSync(loadWinstreak))
}

async function initTags() {
  // Load tags
  const loadTags = await fileResolve(dataFolder, 'tags.json', '[]')
  return JSON.parse(fs.readFileSync(loadTags))
}

async function initRuns() {
  // Load runs
  const loadRuns = await fileResolve(dataFolder, 'runs.json', '[]')
  return JSON.parse(fs.readFileSync(loadRuns))
}

async function openLiveTracker() {
  if (winTracker) return
  winTracker = new BrowserWindow({
    title: "Live Tracker",
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
    liveTrackerWindowState(winTracker)
  })

  liveTrackerWindowState(winTracker)
}

async function createWindow() {
  if(!config) config = await initConfig()
  if(!runs) runs = await initRuns()
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
      autoUpdater.checkForUpdates()
    }
  })

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault()
    require('electron').shell.openExternal(url)
  })

  startLogsWatch(win, config, runs)
  startModWatch(win, isDevelopment, modFile.default, modMetadata.default, config)
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
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

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
  win.webContents.send('UPDATE_DOWNLOADED')
})

ipcMain.on('RESTART_APP', () => {
  autoUpdater.quitAndInstall()
})