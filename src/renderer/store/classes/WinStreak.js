import { Model } from '@vuex-orm/core'

export default class WinStreak extends Model {
    static entity = 'winStreak'
    static fields() {
        return {
            id: this.uid(),
            gameState: this.number(0),
            randomCharacters: this.boolean(false),
            characters: this.attr(null),
            bosses: this.attr(null)
        }
    }
}