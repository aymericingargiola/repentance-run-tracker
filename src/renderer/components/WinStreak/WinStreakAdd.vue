<template>
    <li :class="['win-streak-item add', !editing ? 'short' : '']">
        <div class="before" :style="{backgroundImage:`url('img/cards/bar-ws-left_01.png')`}"></div>
        <div class="mid" :style="{backgroundImage:`url('img/cards/bar-ws-mid_01.png')`}"></div>
        <div class="after" :style="{backgroundImage:`url('img/cards/bar-ws-right_01.png')`}"></div>
        <div :class="['content', editing ? 'expended' : '']">
            <div v-if="usedGameStates">
                Save : 
                <select v-model="gameState" name="game state" id="gameState">
                    <template v-for="(option, idx) in availableGameStates">
                        <option :value="option" :key="`option-${idx}`">{{option}}</option>
                    </template>
                </select>
            </div>
            <div class="adjust-number">
                Adjust number :
                <input type="number" id="adjustNumber" name="adjust number" v-model="adjustNumber">
            </div>
            <div v-if="allCharacters" class="characters">
                <span class="title">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                    <span>Characters</span>
                </span>
                <ul>
                    <li :class="['character', randomNormal ? 'selected' : '']" v-on:click="randomSelected('normal')">
                        Random normal
                    </li>
                    <li :class="['character', randomAlternate ? 'selected' : '']" v-on:click="randomSelected('alternate')">
                        Random alternate
                    </li>
                    <template v-for="character in allCharacters">
                        <li :class="['character', characters.includes(character.id) ? 'selected' : '']" :key="character.id" v-on:click="characterSelected(character.id)">
                            {{character.trueName}} ({{character.version}}) {{characters.includes(character.id) ? `(${characters.findIndex(char => char === character.id) + 1})` : ''}}
                        </li>
                    </template>
                </ul>
            </div>
            <div v-if="lastBosses" class="bosses">
                <span class="title">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                    <span>Bosses</span>
                </span>
                <template v-for="boss in lastBosses">
                    <li :class="['boss', bosses.includes(boss.id) ? 'selected' : '']" :key="boss.id" v-on:click="bossSelected(boss.id)">
                        {{boss.name}} {{bosses.includes(boss.id) ? `(${bosses.findIndex(bo => bo === boss.id) + 1})` : ''}}
                    </li>
                </template>
            </div>
            <div class="buttons">
                <div class="cancel">
                    <button v-on:click="cancel()">Cancel</button>
                </div>
                <div class="add-rule">
                    <button :disabled="!gameState || bosses.length === 0" v-on:click="addRule()">Add rule</button>
                </div>
            </div>
        </div>
        <div :class="['expend', editing ? 'hidden' : '']">
            <div v-on:click="editing = !editing">
                (+)
                <span>Add win streak rule</span>
            </div>
        </div>
    </li>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Character from '../../store/classes/Character'
export default {
    name: "winStreaksAdd",
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
            winStreakRepo: WinStreak,
            entityRepo: Entity,
            characterRepo: Character
        }),
        usedGameStates() {
            if (this.winStreakRepo.all().length > 0) {
                return this.winStreakRepo.all().reduce((result, winstreak) => {
                    if(!result['gameStates']) result['gameStates'] = []
                    result['gameStates'].push(winstreak.gameState)
                    return result;
                }, {}).gameStates   
            } else {
                return []
            }
        },
        availableGameStates() {
            return this.gameStateOptions.filter(gState => !this.usedGameStates.includes(gState))
        },
        allCharacters() {
            return this.characterRepo.where('ignore', false).get()
        },
        lastBosses() {
            return this.entityRepo.where('lastBoss', true).get()
        }
    },
    methods: {
        cancel() {
            this.editing = false
            this.reset()
        },
        reset() {
            this.randomNormal = true
            this.randomAlternate = false
            this.characters = []
            this.bosses = []
            this.adjustNumber = 0
            this.gameState = null
        },
        addRule() {
            this.winStreakRepo.save({
                gameState: this.gameState,
                randomNormal: this.randomNormal,
                randomAlt: this.randomAlternate,
                characters_ids: this.characters,
                bosses_ids: this.bosses,
                adjustNumber: this.adjustNumber
            })
        },
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
        }
    },
    mounted() {
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.win-streak-item {
    &.add {
        transition: 0.5s ease;
        &.short {
            opacity: 0.7;
            transform: scale(0.90);
            &:hover {
                opacity: 1;
            }
        }
        .content {
            max-height: 100px;
            position: relative;
            transition: 0.5s ease;
            overflow: hidden;
            opacity: 0.2;
            &::after {
                content: "";
                position: absolute;
                height: 50px;
                width: 100%;
                background: linear-gradient(to top, $paper-white-darker 20%, transparent 100%);
                bottom: 0px;
                left: 0px;
                opacity: 1;
                z-index: 0;
                pointer-events: none;
                transition: 0.25s ease;
            }
            &.expended {
              max-height: 480px;
              opacity: 1;
              &::after {
                  opacity: 0;
              }
            }
        }
        .expend {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 85%;
            font-size: 56px;
            backdrop-filter: blur(2px);
            z-index: 1;
            transform: translateY(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 0.25s ease;
            > div {
                cursor: pointer;
                font-size: 56px;
                span {
                    font-size: 16px;
                    width: 100%;
                    display: block;
                }
            }
            &.hidden {
                opacity: 0;
                pointer-events: none;
            }
        }
        li {
            transition: 0.25s ease;
            cursor: pointer;
            opacity: 0.5;
            &.selected {
                opacity: 1;
                font-weight: bold;
                transform: scale(1) translateX(10px);
                &::before {
                    content: "▶";
                }
            }
        }
        .characters {
            ul {
                max-height: 94px;
                overflow: auto;
                overflow-x: hidden;
            }
        }
        .adjust-number {
            input {
                width: 80px;
            }
        }
    }
}
</style>