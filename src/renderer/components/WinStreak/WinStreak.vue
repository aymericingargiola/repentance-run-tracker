<template>
    <div class="win-streak-container">
        <div v-if="allWinStreaks.length > 0 && runs.all().length > 0 && entities.all().length > 0 && characters.all().length > 0">
            <template v-for="winStreak in allWinStreaks">
                <div class="win-streak-item" :key="winStreak.id">
                    <div class="number">
                        {{getRuns(winStreak).length + winStreak.adjustNumber}}
                    </div>
                    <div class="content">
                        <span class="title">Win Streak</span>
                        <div class="characters">
                            <template v-for="(character, index) in winStreak.characters_ids" tag="ul">
                                <li :class="['character', (getRuns(winStreak).length + 1) % winStreak.characters_ids.length === index + 1 ? 'current' : 'not-current']" :key="winStreak.id+character">
                                    {{getCharacter(parseInt(character)).name}}
                                </li>
                            </template>
                        </div>
                        <div class="Bosses">
                            <template v-for="(boss, index) in winStreak.bosses_ids" tag="ul">
                                <li :class="['boss', (getRuns(winStreak).length + 1) % winStreak.bosses_ids.length === index + 1 ? 'current' : 'not-current']" :key="winStreak.id+boss">
                                    {{getBoss(boss).name}}
                                </li>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div v-if="this.allWinStreaks && this.allWinStreaks.length < 3">
            <WinStreakAdd/>
        </div>
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import WinStreakAdd from './WinStreakAdd.vue'
import Run from '../../store/classes/Run'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Floor from '../../store/classes/Floor'
import Character from '../../store/classes/Character'
export default {
    name: "winStreaks",
    components: {
        WinStreakAdd
    },
    data() {
        return {
        }
    },
    computed: {
        ...mapRepos({
            runRepo: Run,
            winStreakRepo: WinStreak,
            entityRepo: Entity,
            floorRepo: Floor,
            characterRepo: Character
        }),
        runs() {
            return this.runRepo
        },
        allWinStreaks() {
            return this.winStreakRepo.all()
        },
        entities() {
            return this.entityRepo
        },
        characters() {
            return this.characterRepo
        }
    },
    methods: {
        check(runs, winStreak) {
            let checkRuns = runs

            // check first death
            const deathIndex = checkRuns.findIndex(run => run.runEnd.win === false)
            checkRuns = deathIndex > -1 ? checkRuns.slice(0,deathIndex) : checkRuns

            // check if random normal characters
            if (winStreak.randomNormal) {
                const notNormalCharacterIndex = checkRuns.findIndex(run => parseInt(run.characters[0].id) < 21)
                checkRuns = notNormalCharacterIndex > -1 ? checkRuns.slice(0,notNormalCharacterIndex) : checkRuns
            }

            // check if alt (tainted) characters
            if (winStreak.randomAlt) {
                const notAltCharacterIndex = checkRuns.findIndex(run => parseInt(run.characters[0].id) > 20)
                checkRuns = notAltCharacterIndex > -1 ? checkRuns.slice(0,notAltCharacterIndex) : checkRuns
            }

            // reorganize valid runs from oldest to most recent to match characters/bosses pattern
            checkRuns.sort((a, b) => a.runUpdate < b.runUpdate ? -1 : a.runUpdate < b.runUpdate ? 1 : 0)
            
            // check if streak has to follow a specific characters/bosses order
            if (!winStreak.randomAlt && !winStreak.randomNormal) {
                const checkCharactersAndBosses = checkRuns.reduce((arr, run) => {
                    if(!arr['runs']) arr['runs'] = []
                    if(!arr['index']) arr['index'] = 0
                    const bossFloors = this.entities.where('id', winStreak.bosses_ids[arr['index'] % winStreak.bosses_ids.length]).first().floors_ids
                    const runFloors = run.floors.map((runFloor) => { return runFloor.id })
                    if (run.characters[0].id === winStreak.characters_ids[arr['index'] % winStreak.characters_ids.length] && bossFloors.some(bossFloor => runFloors.includes(bossFloor))) {
                        arr['runs'].push(run)
                        arr['index']++
                    }
                    else {
                        arr['runs'] = []
                        arr['index'] = 0
                    }
                    return arr;
                }, {})
                checkRuns = !checkCharactersAndBosses.runs ? [] : checkCharactersAndBosses.runs
            } else {
                const checkBosses = checkRuns.reduce((arr, run) => {
                    if(!arr['runs']) arr['runs'] = []
                    if(!arr['index']) arr['index'] = 0
                    const bossFloors = this.entities.where('id', winStreak.bosses_ids[arr['index'] % winStreak.bosses_ids.length]).first().floors_ids
                    const runFloors = run.floors.map((runFloor) => { return runFloor.id })
                    if (bossFloors.some(bossFloor => runFloors.includes(bossFloor))) {
                        arr['runs'].push(run)
                        arr['index']++
                    }
                    else {
                        arr['runs'] = []
                        arr['index'] = 0
                    }
                    return arr;
                }, {})
                checkRuns = !checkBosses.runs ? [] : checkBosses.runs
            }

            return checkRuns
        },
        filter(run, winStreak) {
            // gamestate
            if (run.gameState != winStreak.gameState) return

            // game end
            if(!run.runEnd.date) return

            // death
            if(run.runEnd.win === false) return run

            return run
        },
        getRuns(winStreak) {
            return this.check(this.runs.where((run) => { return this.filter(run, winStreak) }).orderBy('runUpdate', 'desc').get(), winStreak)
        },
        getCharacter(characterId) {
            return this.characters.where('id', characterId).first()
        },
        getBoss(bossId) {
            return this.entities.where('id', bossId).first()
        }
    },
    mounted() {
        window.ipc.send('ASK_WINSTREAKS')
        window.ipc.send('ASK_ENTITIES')
        window.ipc.send('ASK_FLOORS')
        window.ipc.send('ASK_CHARACTERS')
        window.ipc.on('SYNC_SEND_WINSTREAKS', (response) => {
            console.log(response)
            this.winStreakRepo.fresh(response.winStreaks)
        })
        window.ipc.on('SYNC_SEND_ENTITIES', (response) => {
            console.log(response)
            this.entityRepo.fresh(response.entities)
        })
        window.ipc.on('SYNC_SEND_FLOORS', (response) => {
            console.log(response)
            this.floorRepo.fresh(response.floors)
        })
        window.ipc.on('SYNC_SEND_CHARACTERS', (response) => {
            console.log(response)
            this.characterRepo.fresh(response.characters)
        })
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";

</style>