export default {
    methods: {
        validRunUpdate(update) {
            if (update.channel != "interval updates") return true
            if (JSON.stringify(this.runRepo.query().where('id', update.run.id).first().characters) !== JSON.stringify(update.run.characters)) return true
            if (JSON.stringify(this.runRepo.query().where('id', update.run.id).first().floors) !== JSON.stringify(update.run.floors)) return true
            if (JSON.stringify(this.runRepo.query().where('id', update.run.id).first().runEnd) !== JSON.stringify(update.run.runEnd)) return true
            return false
        }
    }
}