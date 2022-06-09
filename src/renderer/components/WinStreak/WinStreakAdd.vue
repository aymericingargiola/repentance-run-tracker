<template>
  <li :class="['win-streak-item add', !editing ? 'short' : '']">
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
    <div :class="['content', editing ? 'expended' : '']">
      <div v-if="usedGameStates">
        <CustomSelect
          type="single"
          hide-at="0"
          :items="availableGameStatesSelectOptions"
          :label="$tc('dictionary.save')"
          :empty-message="$t('select.noSavesSelected')"
          @updateSelect="onUpdateSaveSelect"
        />
      </div>
      <div class="adjust-number">
        {{ $t('strings.adjustNumber') }} :
        <input
          id="adjustNumber"
          v-model="adjustNumber"
          type="number"
          name="adjust number"
          class="size-auto"
        >
      </div>
      <div
        v-if="allCharacters"
        class="characters"
      >
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
          <span>{{ $tc('dictionary.character', 2) }}</span>
        </span>
        <ul>
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
      </div>
      <div
        v-if="lastBosses"
        class="bosses"
      >
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
          <span>{{ $tc('dictionary.boss', 2) }}</span>
        </span>
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
      <div class="buttons">
        <div class="cancel">
          <button @click="cancel()">
            {{ $t('dictionary.cancel') }}
          </button>
        </div>
        <div class="add-rule">
          <button
            :disabled="!gameState || bosses.length === 0"
            @click="addRule()"
          >
            {{ $tc('strings.addRule') }}
          </button>
        </div>
      </div>
    </div>
    <div :class="['expend', editing ? 'hidden' : '']">
      <div @click="editing = !editing">
        (+)
        <span>{{ $t('strings.addWinStreakRule') }}</span>
      </div>
    </div>
  </li>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Character from '../../store/classes/Character'
import CustomSelect from '../Tools/CustomSelect.vue'
export default {
    name: "WinStreaksAdd",
    components: {
        CustomSelect
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
    mounted() {
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
            window?.ipc?.send('USER_CREATE_WINSTREAK', this.winStreakRepo.query().all().slice(-1)[0])
            this.cancel()
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
        },
        onUpdateSaveSelect(selected) {
            this.gameState = selected.length > 0 ? selected[0].value : null
        }
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
            &:hover {
                opacity: 1;
            }
        }
        .content {
            max-height: 100px;
            position: relative;
            transition: 0.5s ease;
            overflow: hidden;
            opacity: 0.4;
            transform: scale(0.9);
            &::after {
                content: "";
                position: absolute;
                height: 80px;
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
              max-height: 600px;
              opacity: 1;
              transform: scale(1);
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
            transform: translateY(10px) scale(1);
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
                transform: translateY(10px) scale(0.7);
                pointer-events: none;
            }
        }
        li:not(.item) {
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