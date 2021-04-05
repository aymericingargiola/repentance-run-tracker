'use strict'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { writeFileAsync } from './tools/fileSystem'
import { startLogsWatch } from './logsWatcher'
import moment from 'moment'
const isDevelopment = process.env.NODE_ENV !== 'production'
const { ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const dataFolder = path.resolve(process.cwd(), 'datas')
let win

console.log("electron", process.versions.electron)

ipcMain.on('READ_FILE', (event, payload) => {
  const content = fs.readFileSync(payload.path);
  event.reply('READ_FILE', { content });
});

ipcMain.on('MINIMIZE_APP', (event, payload) => {
  win.minimize();
});

ipcMain.on('HIDE_APP', (event, payload) => {
  win.hide();
});

ipcMain.on('CLOSE_APP', async (event, payload) => {
  await writeFileAsync(dataFolder, 'store.json', payload)
  app.exit();
});

ipcMain.on('FULLSCREEN_APP', (event, payload) => {
  if (win.isNormal()) {
    win.maximize();
  } else {
    win.unmaximize();
  }
});

ipcMain.on('SAVE_STORE', async (event, payload) => {
  await writeFileAsync(dataFolder, 'store.json', payload)
});

ipcMain.on('SAVE_STORE', async (event, payload) => {
  await writeFileAsync(dataFolder, 'store.json', payload)
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
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

  startLogsWatch(win)
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