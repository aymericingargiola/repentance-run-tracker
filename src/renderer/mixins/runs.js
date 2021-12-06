export default {
    methods: {
        validRunUpdate(update) {
            const channelsToCheck = ["interval updates", "change room"]
            if (!channelsToCheck.includes(update.channel)) return true
            if (!this.runRepo.query().where('id', update.run.id).first()) return false
            if (JSON.stringify(this.runRepo.query().where('id', update.run.id).first().characters) !== JSON.stringify(update.run.characters)) return true
            if (JSON.stringify(this.runRepo.query().where('id', update.run.id).first().floors) !== JSON.stringify(update.run.floors)) return true
            if (JSON.stringify(this.runRepo.query().where('id', update.run.id).first().runEnd) !== JSON.stringify(update.run.runEnd)) return true
            return false
        }
    }
}