<template>
    <div class="section win-streaks">
        <div class="win-streaks-container" v-if="runs.all().length > 0 && entities.all().length > 0 && characters.all().length > 0">
            <ul>
                <template v-for="winStreak in allWinStreaks">
                    <li v-if="allWinStreaks.length > 0" class="win-streak-item" :key="winStreak.id">
                        <div class="before" :style="{backgroundImage:`url('img/cards/bar-ws-left_01.png')`}"></div>
                        <div class="mid" :style="{backgroundImage:`url('img/cards/bar-ws-mid_01.png')`}"></div>
                        <div class="after" :style="{backgroundImage:`url('img/cards/bar-ws-right_01.png')`}"></div>
                        <div class="content">
                            <div class="title">
                                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                <span>Win Streak (save {{winStreak.gameState}})</span>
                            </div>
                            <div class="characters">
                                <span class="title">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <span>{{winStreak.characters_ids.length > 1 ? 'Characters' : 'Character'}}</span>
                                </span>
                                <div v-if="!winStreak.randomNormal && !winStreak.randomAlt">
                                    <template v-for="(character, index) in winStreak.characters_ids" tag="ul">
                                        <li :class="['character', getRuns(winStreak).number % winStreak.characters_ids.length === index ? 'current' : 'not-current']" :key="winStreak.id+character">
                                            {{getCharacter(character).name}}
                                        </li>
                                    </template>
                                </div>
                                <div v-if="winStreak.randomNormal || winStreak.randomAlt">
                                    {{winStreak.randomNormal ? 'Random normal' : 'Random tainted'}}
                                </div>
                            </div>
                            <div class="bosses">
                                <span class="title">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <span>{{winStreak.bosses_ids.length > 1 ? 'Bosses' : 'Boss'}}</span>
                                </span>
                                <div>
                                    <template v-for="(boss, index) in winStreak.bosses_ids" tag="ul">
                                        <li :class="['boss', getRuns(winStreak).number % winStreak.bosses_ids.length === index ? 'current' : 'not-current']" :key="winStreak.id+boss">
                                            {{getBoss(boss).name}}
                                        </li>
                                    </template>
                                </div>
                            </div>
                            <div class="number">
                                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"></div>
                                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"></div>
                                <div class="pin" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                                <span>Streak : {{getRuns(winStreak).number}}</span>
                            </div>
                            <div class="buttons">
                                <div class="remove">
                                    <button v-on:click="remove()">Remove</button>
                                </div>
                            </div>
                        </div>
                    </li>
                </template>
                <WinStreakAdd v-if="allWinStreaks && allWinStreaks.length < 3" />
            </ul>
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
        remove() {
            console.log("remove")
        },
        check(runs, winStreak) {
            let checkRuns = runs
            let cancelAdjustNumber = false

            // check first death
            const deathIndex = checkRuns.findIndex(run => run.runEnd.win === false)
            checkRuns = deathIndex > -1 ? checkRuns.slice(0,deathIndex) : checkRuns
            cancelAdjustNumber = deathIndex > -1
            
            // check if random normal characters
            if (winStreak.randomNormal) {
                const notNormalCharacterIndex = checkRuns.findIndex(run => parseInt(run.characters[0].id) > 20)
                checkRuns = notNormalCharacterIndex > -1 ? checkRuns.slice(0,notNormalCharacterIndex) : checkRuns
            }

            // check if alt (tainted) characters
            if (winStreak.randomAlt) {
                const notAltCharacterIndex = checkRuns.findIndex(run => parseInt(run.characters[0].id) < 21)
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
                        if(!cancelAdjustNumber) cancelAdjustNumber = true
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
                        if(!cancelAdjustNumber) cancelAdjustNumber = true
                    }
                    return arr;
                }, {})
                checkRuns = !checkBosses.runs ? [] : checkBosses.runs
            }
            return {runs:checkRuns, number: checkRuns.length + (cancelAdjustNumber ? 0 : winStreak.adjustNumber)}
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
.win-streaks {
    padding: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .head {
        width: 100%;
    }
    .win-streaks-container {
        position: relative;
        padding: 0px 24px;
        width: 100%;
        > ul {
            align-items: flex-start;
            display: flex;
            margin-left: -25px;
            margin-right: -25px;
        }
    }
    .win-streak-item {
        position: relative;
        padding: 20px 12px 28px 12px;
        margin-left: 25px;
        margin-right: 25px;
        width: calc(100%/3);
        > .before, > .after, > .mid {
            z-index: 0;
            position: absolute;
            background-repeat: no-repeat;
            background-size: 100% 100%;
            pointer-events: none;
        }
        > .before {
            content: "";
            height: 100%;
            width: 21px;
            left: 0px;
            top: 0px;
            transform: translateX(-21px);
        }
        > .after {
            height: 100%;
            width: 21px;
            right: 0px;
            top: 0px;
            transform: translateX(21px);
        }
        > .mid {
            height: 100%;
            width: 100%;
            left: 0px;
            top: 0px;
            background-size: contain;
            background-repeat: repeat-x;
        }
        .number {
            position: relative;
            z-index: 0;
            font-size: 26px;
            font-weight: bold;
            padding: 0px 4px 4px 4px;
            margin-left: 8px;
            margin-top: 16px;
            display: inline-block;
            //transform: rotate(-12deg);
            // bottom: -14px;
            // right: -8px;
            > .before, > .after, > .mid, > .pin {
                z-index: 0;
                position: absolute;
                background-repeat: no-repeat;
                background-size: 100% 100%;
                pointer-events: none;
            }
            > .before {
                content: "";
                height: 100%;
                width: 8px;
                left: 0px;
                top: 0px;
                transform: translateX(-8px);
            }
            > .after {
                height: 100%;
                width: 12px;
                right: 0px;
                top: 0px;
                transform: translateX(12px);
                z-index: 2;
            }
            > .mid {
                height: 100%;
                width: 100%;
                left: 0px;
                top: 0px;
                background-size: contain;
                background-repeat: repeat-x;
            }
            > .pin {
                height: 12px;
                width: 12px;
                right: 50%;
                top: -3px;
                transform: translateX(50%);
            }
            span {
                z-index: 1;
                position: relative;
            }
        }
        .content {
            z-index: 1;
            position: relative;
            text-align: left;
            li {
                &:not(:only-child) {
                    transition: 0.25s ease;
                    &.not-current {
                        opacity: 0.7;
                        transform: scale(1) translateX(0px);
                    }
                    &.current {
                        transform: scale(1) translateX(10px);
                        font-weight: bold;
                        &::before {
                            content: "▶";
                        }
                    }
                }
            }
            .title {
                position: relative;
                padding: 5px 10px 10px 10px;
                margin-bottom: 2px;
                display: inline-block;
                transform: translateX(10px);
                > span {
                    position: relative;
                }
                > .before, .after, .mid {
                    z-index: 0;
                    position: absolute;
                    background-repeat: no-repeat;
                    background-size: 100% 100%;
                    pointer-events: none;
                }
                > .before {
                    content: "";
                    height: 100%;
                    width: 8px;
                    left: 0px;
                    top: 0px;
                    transform: translateX(-8px);
                }
                > .after {
                    height: 100%;
                    width: 12px;
                    right: 0px;
                    top: 0px;
                    transform: translateX(12px);
                    z-index: 2;
                }
                > .mid {
                    height: 100%;
                    width: 100%;
                    left: 0px;
                    top: 0px;
                    background-size: contain;
                    background-repeat: repeat-x;
                }
            }
            > div {
                &:not(:first-child) {
                    margin-top: 16px;
                }
                &.characters {
                    margin-top: 8px;
                }
            }
            .buttons {
                margin-bottom: 20px;
                > div {
                    display: inline;
                    &:not(:first-child) {
                        margin-left: 8px;
                    }
                }
            }
        }
    }
}
</style>