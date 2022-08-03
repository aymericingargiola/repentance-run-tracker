<template>
    <li
    v-if="runs.length > 0 && entities.length > 0 && charactersRep.length > 0"
    class="win-streak-item"
    >
        <div
            class="before"
            :style="{backgroundImage:`url('img/cards/bar-ws-left_01.png')`}"
        />
        <div
            class="mid"
            :style="{backgroundImage:`url('img/cards/bar-ws-mid_01.png')`}"
        />
        <div
            class="after"
            :style="{backgroundImage:`url('img/cards/bar-ws-right_01.png')`}"
        />
        <div class="content">
            <div class="title">
            <div
                class="before"
                :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
            />
            <div
                class="mid"
                :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"
            />
            <div
                class="after"
                :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"
            />
            <span>{{ $t('strings.winStreakSave') }} {{ winStreak.gameState }}</span>
            </div>
            <div class="characters">
            <span class="title">
                <div
                class="before"
                :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
                />
                <div
                class="mid"
                :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"
                />
                <div
                class="after"
                :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"
                />
                <span>{{ $tc('dictionary.character', winStreak.characters_ids.length) }}</span>
            </span>
            <div v-if="!winStreak.randomNormal && !winStreak.randomAlt">
                <template
                v-for="(character, index) in winStreak.characters_ids"
                tag="ul"
                >
                <li
                    :key="winStreak.id+character"
                    :class="['character', getRuns(winStreak).number % winStreak.characters_ids.length === index ? 'current' : 'not-current']"
                >
                    <span
                    class="small-portrait character image"
                    :style="{backgroundImage:`url('img/characters/small portraits/${character}.png')`}"
                    />
                    <span class="name">{{ getCharacter(character).id === '19' ? `${$t(`players.19.name`)} & ${$t(`players.20.name`)}` : `${$t(`players.${getCharacter(character).id}.name`)}` }} {{ getCharacter(character).version === "Alternate" ? `(${$t('dictionary.tainted')})` : "" }}</span>
                </li>
                </template>
            </div>
            <div v-if="winStreak.randomNormal || winStreak.randomAlt">
                <span
                class="small-portrait character image"
                :style="{backgroundImage:`url('img/characters/small portraits/undefined.png')`}"
                />
                <span class="name">{{ winStreak.randomNormal ? `${$t('strings.randomNormal')}` : `${$t('strings.randomTainted')}` }}</span>
            </div>
            </div>
            <div class="bosses">
            <span class="title">
                <div
                class="before"
                :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
                />
                <div
                class="mid"
                :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"
                />
                <div
                class="after"
                :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"
                />
                <span>{{ $tc('dictionary.boss', winStreak.characters_ids.length) }}</span>
            </span>
            <div>
                <template
                v-for="(boss, index) in winStreak.bosses_ids"
                tag="ul"
                >
                <li
                    :key="winStreak.id+boss"
                    :class="['boss', getRuns(winStreak).number % winStreak.bosses_ids.length === index ? 'current' : 'not-current']"
                >
                    <span
                    class="small-portrait boss image"
                    :style="{backgroundImage:`url('img/entities/small portraits/${getBoss(boss).portrait}.png')`}"
                    />
                    <span class="name">{{ $t(`entities.${getBoss(boss).id.replaceAll('.', '-')}.name`) }}</span>
                </li>
                </template>
            </div>
            </div>
            <div class="number">
            <div
                class="before"
                :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
            />
            <div
                class="mid"
                :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"
            />
            <div
                class="after"
                :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"
            />
            <div
                class="pin"
                :style="{backgroundImage:`url('img/icons/pin.png')`}"
            />
            <span
                class="icon small"
                :style="{backgroundImage:`url('img/icons/hud/crown.png')`}"
            />
            <span class="wins">{{ getRuns(winStreak).number }}</span>
            </div>
            <div class="buttons">
            <div v-if="!editing" class="edit">
                <button @click="edit()">
                {{ $t('dictionary.edit') }}
                </button>
            </div>
            <div v-if="!editing" class="remove">
                <button @click="remove(winStreak.id)">
                {{ $t('dictionary.remove') }}
                </button>
            </div>
            <div v-if="editing" class="save">
                <button @click="save(winStreak.id)">
                {{ $t('dictionary.save') }}
                </button>
            </div>
            <div v-if="editing" class="cancel">
                <button @click="cancel()">
                {{ $t('dictionary.cancel') }}
                </button>
            </div>
            </div>
        </div>
    </li>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Floor from '../../store/classes/Floor'
import Character from '../../store/classes/Character'
export default {
    name: "WinStreakItem",
      props: {
      winStreak: Object,
    },
    data() {
        return {
          gameStateOptions: [1, 2, 3],
          gameState: null,
          randomNormal: true,
          randomAlternate: false,
          adjustNumber: 0,
          characters: [],
          bosses: [],
          editing: false
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
            return this.runRepo?.all().length > 0 ? this.runRepo.all() : []
        },
        entities() {
            return this.entityRepo?.all().length > 0 ? this.entityRepo?.all() : []
        },
        charactersRep() {
            return this.characterRepo?.all().length > 0 ? this.characterRepo?.all() : []
        }
    },
    methods: {
        remove(winstreakId) {
            this.winStreakRepo.where("id", winstreakId).delete()
            window?.ipc?.send('USER_REMOVE_WINSTREAK', winstreakId)
        },
        edit() {
          this.editing = true
        },
        save(winstreakId) {
          console.log(winstreakId)
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
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
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
        padding: 4px 4px 8px 4px;
        margin-left: 8px;
        margin-top: 16px;
        display: inline-flex;
        align-items: center;
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
        .icon {
            margin-right: 8px;
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
            display: flex;
            align-items: center;
            &:not(:only-child) {
                transition: 0.25s ease;
                &.not-current {
                    opacity: 0.6;
                    //transform: scale(1) translateX(0px);
                }
                &.current {
                    transform: translateX(15%) scale(1.3);
                    //font-weight: bold;
                    &::before {
                        //content: "▶";
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
                left: 1px;
                top: 0px;
                transform: translateX(-8px);
            }
            > .after {
                height: 100%;
                width: 12px;
                right: 1px;
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
</style>