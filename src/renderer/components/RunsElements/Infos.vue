<template>
    <div class="run-el infos">
        <ul>
            <li v-if="runEnd" class="info status" title="Run status">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    <div class="icon" :style="{backgroundImage:`url('img/icons/hud/${runEnd.win === true ? `crown` : runEnd.win === false ? `dead` : `race`}.png')`}"></div>
                </div>
            </li>
            <li v-if="gameState" class="info game-state" title="Save file">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    <div class="icon" :style="{backgroundImage:`url('img/icons/hud/gamestate.png')`}"></div>
                    <div class="text-icon big">{{gameState}}</div>
                </div>
            </li>
            <li v-if="characters" class="info character-name">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    {{characters[0].id === '19' ? `${$t(`players.19.name`)} & ${$t(`players.20.name`)}` : `${$t(`players.${characters[0].id}.name`)}` }}
                </div>
            </li>
            <li v-if="seed" class="info seed" title="Seed">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    {{seed}}
                </div>
            </li>
            <li v-if="runStart" class="info date" title="Run start date">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    {{getDate(runStart, getConfig("dateFormat") ? getConfig("dateFormat").value : 'MM/DD/YY')}} - {{getDate(runStart, getConfig("hourFormat") ? getConfig("hourFormat").value : 'hh:mm a')}}
                </div>
            </li>
            <li v-if="runDuration" class="info date" title="Run duration">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    <div class="icon" :style="{backgroundImage:`url('img/icons/hud/time.png')`}"></div>
                    <div class="text-icon">{{runDuration}}</div>
                </div>
            </li>
            <li v-if="!hideEdit && id" class="info edit" @click="openOrCloseEditRun(id)">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="content">
                    <div class="icon" :style="{backgroundImage:`url('img/icons/config.png')`}"></div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Config from '../../store/classes/Config'
export default {
    name: "RunInfos",
    props: {
        id: String,
        characters: Array,
        gameState: Number,
        seed: String,
        runStart: Number,
        runEnd: Object,
        runDuration: String,
        hideEdit: Boolean
    },
    components: {
    },
    data() {
        return {
        }
    },
    computed: {
        ...mapRepos({
            configRepo: Config
        })
    },
    methods: {
        openOrCloseEditRun(id) {
            this.$root.$emit('OPEN_EDITRUN', id)
        },
        getDate(unixDate, format) {
            return this.$helpers.formatDate(unixDate, format)
        },
        getConfig(id) {
            return this.configRepo.query().where('id', id).get()[0]
        }
    },
    mounted() {
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
            &:last-child {
                margin-left: auto;
                pointer-events: all;
                cursor: pointer;
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