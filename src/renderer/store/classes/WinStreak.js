import { Model } from '@vuex-orm/core'
import Character from './Character'
import Entity from './Entity'
import Run from './Run'
export default class WinStreak extends Model {
    static entity = 'winStreaks'
    static fields() {
        return {
            id: this.uid(),
            gameState: this.number(0),
            randomNormal: this.boolean(false),
            randomAlt: this.boolean(false),
            characters_ids: this.attr(null),
            characters: this.hasManyBy(Character, 'characters_ids'),
            bosses_ids: this.attr(null),
            bosses: this.hasManyBy(Entity, 'bosses_ids'),
            adjustNumber: this.number(0),
            runs_ids: this.attr([]),
            runs: this.hasManyBy(Run, 'runs_ids'),
            init: this.boolean(false),
            archived: this.boolean(false)
        }
    }
}