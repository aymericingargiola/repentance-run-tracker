<template>
    <li
    v-if="winStreak"
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
            <div v-if="usedGameStates && editing">
                <CustomSelect
                type="single"
                hide-at="0"
                :items="availableGameStatesSelectOptions"
                :label="$tc('dictionary.save')"
                :empty-message="$t('select.noSavesSelected')"
                :selectedValue="this.winStreak.gameState.toString()"
                @updateSelect="onUpdateSaveSelect"
                />
            </div>
            <div v-if="editing" class="adjust-number">
                {{ $t('strings.adjustNumber') }} :
                <input
                id="adjustNumber"
                v-model="adjustNumber"
                type="number"
                name="adjust number"
                class="size-auto"
                >
            </div>
            <div v-if="!editing" class="title editable" :class="editing ? 'editing-item' : ''">
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
            <ul v-if="editing">
                <li
                    :class="['character', randomNormal ? 'selected' : '']"
                    @click="randomSelected('normal')"
                >
                    <span
                    class="small-portrait character image"
                    :style="{backgroundImage:`url('img/characters/small portraits/undefined.png')`}"
                    />
                    <span class="name">{{ $t('strings.randomNormal') }}</span>
                </li>
                <li
                    :class="['character', randomAlternate ? 'selected' : '']"
                    @click="randomSelected('alternate')"
                >
                    <span
                    class="small-portrait character image"
                    :style="{backgroundImage:`url('img/characters/small portraits/undefined.png')`}"
                    />
                    <span class="name">{{ $t('strings.randomTainted') }}</span>
                </li>
                <template v-for="character in allCharacters">
                    <li
                    :key="character.id"
                    :class="['character', characters.includes(character.id) ? 'selected' : '']"
                    @click="characterSelected(character.id)"
                    >
                    <span
                        class="small-portrait character image"
                        :style="{backgroundImage:`url('img/characters/small portraits/${character.id}.png')`}"
                    />
                    <span class="name">{{ character.id === '19' ? `${$t(`players.19.name`)} & ${$t(`players.20.name`)}` : `${$t(`players.${character.id}.name`)}` }} {{ character.version === "Alternate" ? `(${$t('dictionary.tainted')})` : "" }} {{ characters.includes(character.id) ? `(${characters.findIndex(char => char === character.id) + 1})` : '' }}</span>
                    </li>
                </template>
                </ul>
            <div v-if="!winStreak.randomNormal && !winStreak.randomAlt && !editing">
                <template
                v-for="(character, index) in winStreak.characters_ids"
                tag="ul"
                >
                <li
                    :key="winStreak.id+character"
                    :class="['character', streak % winStreak.characters_ids.length === index ? 'current' : 'not-current']"
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
            <div v-if="editing" >
                <template v-for="boss in lastBosses">
                    <li
                        :key="boss.id"
                        :class="['boss', bosses.includes(boss.id) ? 'selected' : '']"
                        @click="bossSelected(boss.id)"
                    >
                        <span
                        class="small-portrait boss image"
                        :style="{backgroundImage:`url('img/entities/small portraits/${boss.portrait}.png')`}"
                        />
                        <span class="name">{{ $t(`entities.${boss.id.replaceAll('.', '-')}.name`) }} {{ bosses.includes(boss.id) ? `(${bosses.findIndex(bo => bo === boss.id) + 1})` : '' }}</span>
                    </li>
                </template>
            </div>
            <div v-if="!editing" >
                <template
                v-for="(boss, index) in winStreak.bosses_ids"
                tag="ul"
                >
                <li
                    :key="winStreak.id+boss"
                    :class="['boss', streak % winStreak.bosses_ids.length === index ? 'current' : 'not-current']"
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
            <div v-if="!editing" class="number">
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
                <span class="wins">{{ streak }}</span>
            </div>
            <div class="buttons">
            <div v-if="!editing" class="edit">
                <button @click="edit()">
                {{ $t('dictionary.edit') }}
                </button>
            </div>
            <div v-if="!editing" class="remove">
                <button @click="remove()">
                {{ $t('dictionary.remove') }}
                </button>
            </div>
            <div v-if="editing" class="save">
                <button @click="save()">
                {{ $tc('dictionary.save') }}
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
import CustomSelect from '../Tools/CustomSelect.vue'
import winstreakMixin from '../../mixins/winstreak'
export default {
    name: "WinStreakItem",
      props: {
      winStreak: Object,
    },
    components: {
        CustomSelect
    },
    mixins: [winstreakMixin],
    data() {
        return {
          gameStateOptions: [1, 2, 3],
          gameState: this.winStreak.gameState,
          randomNormal: this.winStreak.randomNormal,
          randomAlternate: this.winStreak.randomAlt,
          adjustNumber: this.winStreak.adjustNumber,
          characters: this.winStreak.characters_ids.slice(),
          bosses: this.winStreak.bosses_ids.slice(),
          editing: false
        }
    },
    mounted() {
        if (this.actualWinStreak?.first().init === false) {
            this.getRuns()
        }
        window.ipc.on('SYNC_UPDATE_RUN', (response) => {
            if (this.actualWinStreak?.first()?.archived === false && response.channel === "run end" && parseInt(response.run.gameState) === this.actualWinStreak?.first()?.gameState) {
                let newRuns = []
                if (this.winStreakWithRuns?.runs.length > 0) newRuns = [...this.winStreakWithRuns?.runs]
                newRuns.push(response.run)
                newRuns.reverse()
                this.getRuns(newRuns)
            }
        })
    },
    computed: {
        ...mapRepos({
            runRepo: Run,
            winStreakRepo: WinStreak,
            entityRepo: Entity,
            floorRepo: Floor,
            characterRepo: Character
        }),
        runsRep() {
            return this.runRepo
        },
        entities() {
            return this.entityRepo
        },
        charactersRep() {
            return this.characterRepo
        },
        actualWinStreak() {
            return this.winStreakRepo?.where("id", this.winStreak?.id)
        },
        winStreakWithRuns() {
            return this.actualWinStreak?.with('runs')?.first()
        },
        streak() {
            return (this.winStreakWithRuns?.runs?.length > 0 ? this.winStreakWithRuns.runs.filter((run) => run.runEnd.win !== false).length : 0) + this.actualWinStreak?.first()?.adjustNumber
        }
    },
    methods: {
        remove() {
            this.winStreakRepo.where("id", this.actualWinStreak?.first()?.id).delete()
            window?.ipc?.send('USER_REMOVE_WINSTREAK', this.actualWinStreak?.first()?.id)
        },
        edit() {
          this.editing = true
        },
        save() {
            const updateObj = {
                gameState: this.gameState,
                randomNormal: this.randomNormal,
                randomAlt: this.randomAlternate,
                characters_ids: this.characters,
                bosses_ids: this.bosses,
                adjustNumber: this.adjustNumber,
            }
            this.actualWinStreak?.update(updateObj)
            this.getRuns()
            this.editing = false
        },
        cancel() {
          this.gameState = this.winStreak.gameState,
          this.randomNormal = this.winStreak.randomNormal,
          this.randomAlternate = this.winStreak.randomAlt,
          this.adjustNumber = this.winStreak.adjustNumber,
          this.characters = this.winStreak.characters_ids.slice(),
          this.bosses = this.winStreak.bosses_ids.slice(),
          this.editing = false
        },
        check(rns) {
            let checkRuns = rns
            let streakKiller

            if (this.actualWinStreak?.first()?.init === false) {
                this.winStreakRepo.where('id', this.actualWinStreak?.first()?.id).update({
                    init: true
                })
            }

            // check first death
            let deathIndex = checkRuns.findIndex(run => run.runEnd.win === false)
            if (deathIndex === 0 && this.actualWinStreak?.first()?.runs?.length > 0) {
                // Winstreak is over
                streakKiller = checkRuns[deathIndex]
                deathIndex = checkRuns.findIndex((run, index) => index !== 0 && run.runEnd.win === false)
                this.winStreakRepo.where('id', this.actualWinStreak?.first()?.id).update({
                    archived: true
                })
                // Mark winstreak run killer
                this.runRepo.where('id', streakKiller.id).update({
                    runKiller: checkRuns.length + this.actualWinStreak?.first()?.adjustNumber
                })
                window?.ipc?.send('USER_UPDATE_RUN', { id: streakKiller.id, property: 'runKiller', value: checkRuns.length })
                // Add new rule
                this.winStreakRepo.save({
                    gameState: this.actualWinStreak?.first()?.gameState,
                    randomNormal: this.actualWinStreak?.first()?.randomNormal,
                    randomAlt: this.actualWinStreak?.first()?.randomAlternate,
                    characters_ids: this.actualWinStreak?.first()?.characters_ids.slice(),
                    bosses_ids: this.actualWinStreak?.first()?.bosses_ids.slice()
                })
                window?.ipc?.send('USER_CREATE_WINSTREAK', this.winStreakRepo.query().all().slice(-1)[0])
                checkRuns.sort((a, b) => a.runUpdate < b.runUpdate ? -1 : a.runUpdate < b.runUpdate ? 1 : 0)
                return checkRuns.map(r => r.id)
            }
            checkRuns = deathIndex > -1 ? checkRuns.slice(0,deathIndex) : checkRuns
            
            // check if random normal characters
            if (this.actualWinStreak?.first()?.randomNormal) {
                const notNormalCharacterIndex = checkRuns.findIndex(run => parseInt(run.characters[0].id) > 20)
                checkRuns = notNormalCharacterIndex > -1 ? checkRuns.slice(0,notNormalCharacterIndex) : checkRuns
            }

            // check if alt (tainted) characters
            if (this.actualWinStreak?.first()?.randomAlt) {
                const notAltCharacterIndex = checkRuns.findIndex(run => parseInt(run.characters[0].id) < 21)
                checkRuns = notAltCharacterIndex > -1 ? checkRuns.slice(0,notAltCharacterIndex) : checkRuns
            }

            // reorganize valid runs from oldest to most recent to match characters/bosses pattern
            checkRuns.sort((a, b) => a.runUpdate < b.runUpdate ? -1 : a.runUpdate < b.runUpdate ? 1 : 0)
            
            // check if streak has to follow a specific characters/bosses order
            if (!this.actualWinStreak?.first()?.randomAlt && !this.actualWinStreak?.first()?.randomNormal) {
                const checkCharactersAndBosses = checkRuns.reduce((arr, run) => {
                    if(!arr['runs']) arr['runs'] = []
                    if(!arr['index']) arr['index'] = 0
                    const bossFloors = this.entities.where('id', this.actualWinStreak?.first()?.bosses_ids[arr['index'] % this.actualWinStreak?.first()?.bosses_ids.length]).first().floors_ids
                    const runFloors = run.floors.map((runFloor) => { return runFloor.id })
                    if (run.characters[0].id === this.actualWinStreak?.first()?.characters_ids[arr['index'] % this.actualWinStreak?.first()?.characters_ids.length] && bossFloors.some(bossFloor => runFloors.includes(bossFloor))) {
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
                    const bossFloors = this.entities.where('id', this.actualWinStreak?.first()?.bosses_ids[arr['index'] % this.actualWinStreak?.first()?.bosses_ids.length]).first().floors_ids
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

            return  checkRuns?.length > 0 ? checkRuns.map(r => r.id) : checkRuns
        },
        filter(r) {
            // gamestate
            if (r.gameState != this.actualWinStreak?.first()?.gameState) return

            // game end
            if(!r.runEnd.date) return

            // death
            if(r.runEnd.win === false) return r

            return r
        },
        getRuns(rns) {
            const runs = !rns ? this.check(this.runsRep.where((run) => { return this.filter(run) }).orderBy('runUpdate', 'desc').get()) : this.check(rns)
            this.winStreakRepo.where('id', this.actualWinStreak?.first()?.id).update({
                runs_ids: runs
            })
            window?.ipc?.send('USER_UPDATE_WINSTREAK', { id: this.actualWinStreak?.first()?.id, value: this.winStreakRepo.where('id', this.actualWinStreak?.first()?.id).first()})
        },
        getCharacter(characterId) {
            return this.charactersRep.where('id', characterId).first()
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
        .characters {
            ul {
                max-height: 94px;
                overflow: auto;
                overflow-x: hidden;
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
        li:not(.item):not(.current):not(.not-current) {
            transition: 0.25s ease;
            cursor: pointer;
            opacity: 0.6;
            &.selected {
                opacity: 1;
                //font-weight: bold;
                //transform: scale(1) translateX(10px);
                transform: translateX(15%) scale(1.3);
                &::before {
                    //content: "▶";
                }
            }
        }
        .adjust-number {
            input {
                width: 80px;
            }
        }
        .editable {
            transition: 0.5s ease;
        }
        .editing-item {
            opacity: 0.3;
        }
    }
}
</style>