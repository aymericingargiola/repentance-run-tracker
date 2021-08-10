module.exports = {
    syncApp: function(win, params) {
        if (!win) return console.log(`[syncApp()] Window parameter is ${win} !`, params)
        switch (params.trigger) {
            case 'logs watch status':
                win.webContents.send('SYNC_WATCH_STATUS', params)
                break
            case 'send config':
                win.webContents.send('SYNC_SEND_CONFIG', params)
                break
            case 'update config':
                win.webContents.send('SYNC_UPDATE_CONFIG', params)
                break
            case 'send winstreak':
                win.webContents.send('SYNC_SEND_WINSTREAK', params)
                break
            case 'send tags':
                win.webContents.send('SYNC_SEND_TAGS', params)
                break
            case 'send runs':
                win.webContents.send('SYNC_SEND_RUNS', params)
                break
            case 'create run':
                win.webContents.send('SYNC_CREATE_RUN', params)
                break
            case 'update run':
                win.webContents.send('SYNC_UPDATE_RUN', params)
                break
            case 'remove run':
                win.webContents.send('SYNC_REMOVE_RUN', params)
                break
            case 'ask remove run':
                win.webContents.send('SYNC_ASK_REMOVE_RUN', params)
                break
        }
    }
}