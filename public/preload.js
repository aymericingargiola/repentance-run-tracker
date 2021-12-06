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
  'APP_VERSION',
  'UPDATE_AVAILABLE',
  'UPDATE_DOWNLOADED',
  'UPDATE_PROGRESS',
  'RESTART_APP',
  'IS_APP_READY',
  'OPEN_ITEMTRACKER',
  'ASK_CONFIG',
  'SYNC_SEND_CONFIG',
  'SYNC_UPDATE_CONFIG',
  'USER_UPDATE_CONFIG',
  'ASK_ENTITIES',
  'SYNC_SEND_ENTITIES',
  'ASK_FLOORS',
  'SYNC_SEND_FLOORS',
  'ASK_CHARACTERS',
  'SYNC_SEND_CHARACTERS',
  'SYNC_SEND_APP_ERROR',
  'ASK_ERROR_ZIP',
  'ASK_WINSTREAKS',
  'SYNC_SEND_WINSTREAKS',
  'USER_UPDATE_WINSTREAK',
  'USER_CREATE_WINSTREAK',
  'USER_REMOVE_WINSTREAK',
  'ASK_TAGS',
  'SYNC_SEND_TAGS',
  'USER_UPDATE_TAGS',
  'USER_CREATE_TAGS',
  'USER_REMOVE_TAGS',
  'SYNC_WATCH_STATUS',
  'ASK_RUNS',
  'SYNC_SEND_RUNS',
  'SYNC_CREATE_RUN',
  'SYNC_UPDATE_RUN',
  'SYNC_REMOVE_RUN',
  'SYNC_ASK_REMOVE_RUN',
  'USER_UPDATE_RUN',
  'USER_REMOVE_RUN',
  'ASK_TRASH',
  'SYNC_SEND_TRASH',
  'SYNC_ADD_RUN_TO_TRASH',
  'SYNC_REMOVE_RUNS_FROM_TRASH',
  'SYNC_EMPTY_TRASH',
  'USER_RESTORE_RUNS_FROM_TRASH',
  'USER_REMOVE_RUNS_FROM_TRASH',
  'USER_EMPTY_TRASH',
  'DEBUG_LOGS'
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