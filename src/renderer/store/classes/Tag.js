import { Model } from '@vuex-orm/core'
import Run from './Run'

export default class Tag extends Model {
    static entity = 'tags'
    static fields() {
        return {
            id: this.uid(),
            value: this.string(''),
            runs_ids: this.attr([]),
            runs: this.hasManyBy(Run, 'runs_ids'),
        }
    }
}