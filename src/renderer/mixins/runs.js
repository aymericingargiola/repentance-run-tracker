export default {
    methods: {
        validRunUpdate(update) {
            const channelsToCheck = ["interval updates", "change room"]
            const run = this.runRepo.query().where('id', update.run.id).first()
            if (!channelsToCheck.includes(update.channel)) return true
            if (!run) return false
            if (JSON.stringify(run.characters) !== JSON.stringify(update.run.characters)) return true
            if (JSON.stringify(run.floors) !== JSON.stringify(update.run.floors)) return true
            if (JSON.stringify(run.runEnd) !== JSON.stringify(update.run.runEnd)) return true
            return false
        }
    }
}