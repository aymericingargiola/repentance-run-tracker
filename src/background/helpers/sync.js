module.exports = {
    syncApp: function(win, params) {
        if (!win) return console.log(`[syncApp()] Window parameter is ${win} ! Trigger : ${params.trigger}`)
        switch (params.trigger) {
            case 'send app error':
                win.webContents.send('SYNC_SEND_APP_ERROR', params)
                break
            case 'logs watch status':
                win.webContents.send('SYNC_WATCH_STATUS', params)
                break
            case 'send config':
                win.webContents.send('SYNC_SEND_CONFIG', params)
                break
            case 'update config':
                win.webContents.send('SYNC_UPDATE_CONFIG', params)
                break
            case 'send entities':
                win.webContents.send('SYNC_SEND_ENTITIES', params)
                break
            case 'send floors':
                win.webContents.send('SYNC_SEND_FLOORS', params)
                break
            case 'send characters':
                win.webContents.send('SYNC_SEND_CHARACTERS', params)
                break
            case 'send winstreaks':
                win.webContents.send('SYNC_SEND_WINSTREAKS', params)
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
            case 'send trash':
                win.webContents.send('SYNC_SEND_TRASH', params)
                break
            case 'add run to trash':
                win.webContents.send('SYNC_ADD_RUN_TO_TRASH', params)
                break
            case 'remove runs from trash':
                win.webContents.send('SYNC_REMOVE_RUNS_FROM_TRASH', params)
                break
            case 'empty trash':
                win.webContents.send('SYNC_EMPTY_TRASH')
                break
            default:
                console.log(`[syncApp()] "${params.trigger}" is not a valid parameter`)
        }
    }
}