const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
  'READ_FILE', 
  'WRITE_FILE', 
  'COPY_FILE', 
  'REMOVE_FILE', 
  'MINIMIZE_APP', 
  'HIDE_APP', 
  'CLOSE_APP', 
  'FULLSCREEN_APP',
  'IS_APP_READY',
  'SAVE_STORE',
  'SYNC_WATCH_STATUS',
  'SYNC_CREATE_RUN',
  'SYNC_UPDATE_RUN',
  'SYNC_REMOVE_RUN',
  'SYNC_ASK_REMOVE_RUN',
  'USER_EDIT_RUN',
  'USER_REMOVE_RUN'
];
contextBridge.exposeInMainWorld(
  'ipc', {
    send: (channel, data) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, func) => {
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender` and is a security risk
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
  },
);