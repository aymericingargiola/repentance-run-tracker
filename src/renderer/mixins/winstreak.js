export default {
    computed: {
        usedGameStates() {
            if (this.winStreakRepo.all().length > 0) {
                const usedGameStates = this.winStreakRepo.all().reduce((result, winstreak) => {
                    if(!result['gameStates']) result['gameStates'] = []
                    result['gameStates'].push(winstreak.gameState)
                    return result;
                }, {}).gameStates
                return usedGameStates.filter(gState => gState != this.gameState)
            } else {
                return []
            }
        },
        availableGameStates() {
            return this.gameStateOptions.filter(gState => !this.usedGameStates.includes(gState))
        },
        availableGameStatesSelectOptions() {
            return this.availableGameStates.map(option => ({"id":option,"value":option}))
        },
        allCharacters() {
            return this.characterRepo.where('ignore', false).get()
        },
        lastBosses() {
            return this.entityRepo.where('lastBoss', true).get()
        }
    },
    methods: {
        bossSelected(id) {
            this.bosses.includes(id) ? this.bosses = this.bosses.filter((bossId) => bossId !== id) : this.bosses.push(id)
        },
        characterSelected(id) {
            this.characters.includes(id) ? this.characters = this.characters.filter((characterId) => characterId !== id) : this.characters.push(id)
            this.randomNormal = this.randomNormal && this.characters.length > 0 ? !this.randomNormal : this.characters.length === 0 ? this.randomNormal = true : this.randomNormal
            this.randomAlternate = this.randomAlternate ? !this.randomAlternate : this.randomAlternate
        },
        randomSelected(type) {
            if (type === 'normal' && this.randomNormal) return
            if (type === 'alternate' && this.randomAlternate) return
            this.randomNormal = type === 'normal' ? !this.randomNormal : this.randomNormal ? !this.randomNormal : this.randomNormal
            this.randomAlternate = type === 'alternate' ? !this.randomAlternate : this.randomAlternate ? !this.randomAlternate : this.randomAlternate
            this.characters = []
        },
        onUpdateSaveSelect(selected) {
            this.gameState = selected.length > 0 ? selected[0].value : null
        }
    }
}