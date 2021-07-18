import { Model } from '@vuex-orm/core'

export default class Run extends Model {
    static entity = 'runs'
    static fields() {
        return {
            id: this.attr(null),
            customName: this.string(''),
            videoLink: this.string(''),
            videoHighlights: this.attr(null),
            tags: this.attr(null),
            seed: this.string(''),
            gameState: this.string(''),
            gameMode: this.string(''),
            gameOptions: this.attr(null),
            runStart: this.attr(null),
            runUpdate: this.attr(null),
            runUserUpdate: this.attr(null),
            runEnd: this.attr(null),
            runDuration: this.string(''),
            characters: this.attr(null),
            floors: this.attr(null),
            toRemove: this.attr(null),
            extendedSaveMode: this.boolean(false),
            otherModLoaded: this.boolean(false),
            backup: this.attr(null)
        }
    }
}