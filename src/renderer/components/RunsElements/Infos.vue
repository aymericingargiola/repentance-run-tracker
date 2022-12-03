<template>
  <div class="run-el infos">
    <ul>
      <li
        v-if="runEnd"
        class="info status"
        title="Run status"
      >
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
        <div class="content">
          <div
            class="icon"
            :style="{backgroundImage:`url('img/icons/hud/${runEnd.win === true ? `crown` : runEnd.win === false ? `dead` : `race`}.png')`}"
          />
        </div>
      </li>
      <li
        v-if="gameState"
        class="info game-state"
        title="Save file"
      >
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
        <div class="content">
          <div
            class="icon"
            :style="{backgroundImage:`url('img/icons/hud/gamestate.png')`}"
          />
          <div class="text-icon big">
            {{ gameState }}
          </div>
        </div>
      </li>
      <li
        v-if="characters"
        class="info character-name"
      >
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
        <div
          v-if="firstCharacter"
          class="content"
        >
          {{ firstCharacter.id === '19' ? `${$t(`players.19.name`)} & ${$t(`players.20.name`)}` : `${t(`players.${firstCharacter.id}.name`, firstCharacter.name)}` }}
        </div>
      </li>
      <li
        v-if="seed"
        class="info seed"
        title="Seed"
      >
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
        <div class="content">
          {{ seed }}
        </div>
      </li>
      <li
        v-if="runStart"
        class="info date"
        title="Run start date"
      >
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
        <div class="content">
          {{ getDate(runStart, getConfig("dateFormat") ? getConfig("dateFormat").value : 'MM/DD/YY') }} - {{ getDate(runStart, getConfig("hourFormat") ? getConfig("hourFormat").value : 'hh:mm a') }}
        </div>
      </li>
      <li
        v-if="runDuration"
        class="info date"
        title="Run duration"
      >
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
        <div class="content">
          <div
            class="icon"
            :style="{backgroundImage:`url('img/icons/hud/time.png')`}"
          />
          <div class="text-icon">
            {{ runDuration }}
          </div>
        </div>
      </li>
      <li
        v-if="runKiller"
        class="info run-killer"
        title="Total win streak before this death"
      >
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
        <div class="content">
          <div
            class="icon"
            :style="{backgroundImage:`url('img/icons/hud/crown.png')`}"
          />
          <div class="text-icon">
            {{ runKiller }}
          </div>
        </div>
      </li>
      <li
        v-if="!hideDetails && id"
        class="info details clickable"
        @click="openOrCloseRunDetails(id)"
      >
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
        <div class="content">
          <div
            class="icon"
            :style="{backgroundImage:`url('img/icons/chart.png')`}"
          />
        </div>
      </li>
      <li
        v-if="!hideEdit && id"
        class="info edit clickable"
        @click="openOrCloseEditRun(id)"
      >
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
        <div class="content">
          <div
            class="icon"
            :style="{backgroundImage:`url('img/icons/config.png')`}"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Config from '../../store/classes/Config'
import i18nMixin from '../../mixins/i18n'
export default {
    name: "RunInfos",
    mixins: [i18nMixin],
    props: {
        id: String,
        characters: Array,
        gameState: Number,
        seed: String,
        runStart: Number,
        runEnd: Object,
        runDuration: String,
        runKiller: Number,
        hideEdit: Boolean,
        hideDetails: Boolean
    },
    data() {
        return {
        }
    },
    computed: {
        ...mapRepos({
            configRepo: Config
        }),
        firstCharacter() {
          return this.characters[0]
        }
    },
    mounted() {
    },
    methods: {
        openOrCloseEditRun(id) {
            this.$root.$emit('OPEN_EDITRUN', id)
        },
        openOrCloseRunDetails(id) {
            this.$root.$emit('OPEN_RUNDETAILS', id)
        },
        getDate(unixDate, format) {
            return this.$helpers.formatDate(unixDate, format)
        },
        getConfig(id) {
            return this.configRepo.query().where('id', id).get()[0]
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.run-el.infos {
    position: absolute;
    top: 14px;
    left: 14px;
    width: calc(100% - 22px);
    z-index: 3;
    ul {
        display: flex;
        width: 100%;
        li {
            position: relative;
            padding: 5px 10px 10px 10px;
            z-index: 2;
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
            .content {
                position: relative;
                z-index: 2;
                min-height: 18px;
                pointer-events: none;
            }
            &:not(:first-child) {
                margin-left: 20px;
            }
            &.clickable {
                pointer-events: all;
                cursor: pointer;
                &:nth-last-child(2) {
                    margin-left: auto;
                }
            }
            .icon {
                position: absolute;
                width: 20px;
                height: 20px;
                background-repeat: no-repeat;
                background-position: center;
                left: 0;
                top: 50%;
                transform: translate(-50%, -50%);
                background-size: contain;
            }
            .text-icon {
                padding-left: 16px;
                &.big {
                    transform: scale(1.5) translate(-2px, -1px);
                }
            }
        }
    }
}
</style>