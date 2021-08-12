import { Model } from '@vuex-orm/core'

export default class WinStreak extends Model {
    static entity = 'winStreaks'
    static fields() {
        return {
            id: this.uid(),
            gameState: this.number(0),
            randomNormal: this.boolean(false),
            randomAlt: this.boolean(false),
            characters: this.attr(null),
            boss: this.attr(null),
            adjustNumber: this.number(0)
        }
    }
}