import { Model } from '@vuex-orm/core'
import Tag from './Tag'

export default class Run extends Model {
    static entity = 'runs'
    static fields() {
        return {
            id: this.attr(null),
            runBuilderVersion: this.number(1),
            customName: this.string(''),
            videoLink: this.string(''),
            videoHighlights: this.attr([]),
            tags_ids: this.attr([]),
            tags: this.hasManyBy(Tag, 'tags_ids'),
            seed: this.string(''),
            gameState: this.number(0),
            gameMode: this.string(''),
            gameOptions: this.attr(null),
            runStart: this.attr(null),
            runUpdate: this.attr(null),
            runUserUpdate: this.attr(null),
            runEnd: this.attr(null),
            runKiller: this.number(0),
            runDuration: this.string(''),
            characters: this.attr(null),
            floors: this.attr(null),
            toRemove: this.attr(null),
            extendedSaveMode: this.boolean(false),
            otherModsLoaded: this.attr([]),
            backup: this.attr(null)
        }
    }
}