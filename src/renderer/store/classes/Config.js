import { Model } from '@vuex-orm/core'

export default class Config extends Model {
    static entity = 'config'
    static fields() {
        return {
            id: this.string(null),
            value: this.attr(null),
            choices: this.attr(null),
            name: this.string(null),
            hint: this.string(null),
            type: this.string(null),
            disabled: this.boolean(false)
        }
    }
}