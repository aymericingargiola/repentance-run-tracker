import { Model } from '@vuex-orm/core'

export default class Run extends Model {
    static entity = 'runs'
    static fields() {
        return {
            id: this.attr(null),
            customName: this.string(null),
            seed: this.string(null),
            gameState: this.string(null),
            gameMode: this.string(null),
            gameOptions: this.string(null),
            runStart: this.number(null),
            runUpdate: this.number(null),
            runUserUpdate: this.number(null),
            runEnd: this.attr(null),
            runDuration: this.number(null),
            characters: this.attr(null),
            floors: this.attr(null),
            toRemove: this.attr(null),
            extendedSaveMode: this.boolean(false),
            otherModLoaded: this.boolean(false)
        }
    }
}