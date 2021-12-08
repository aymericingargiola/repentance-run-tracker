<template>
    <vue-scroll v-if="ops && floors" :ops="ops" class="run-el custom-scroll-floors" :ref="index === 0 ? 'firstRunFloorsScroller' : ''">
        <transition-group name="floors-group-transition" tag="ul" class="floors">
            <template v-for="(floor, fidx) in floors">
                <li v-if="floor" :class="['run-el', 'floor', 'floors-group-transition-item', floor.death ? 'death-here' : '']" :data-id="floor.id" :key="floor.id + fidx">
                    <div class="floor-content" :style="{backgroundImage:`url('img/textures/floors${gameMode === 'greed' ? '/greed' : ''}/${floor.group}-ground.png')`}">
                        <div class="top-info">
                            <div class="icon floor" :style="{backgroundImage:`url('img/icons/floors/${floor.group}.png')`}"></div>
                            <div v-if="floor.curse" class="icon curse" :style="{backgroundImage:`url('img/icons/curses/${floor.curse}.png')`}"></div>
                        </div>
                        <div class="floor-wrapper">
                            <div class="floor-name">{{floor.name}}</div>
                            <transition-group name="item-group-transition" tag="ul" class="items">
                                <template v-for="(item, tidx) in floor.itemsCollected">
                                    <li v-if="getConfig('hideActiveItems') && !getConfig('hideActiveItems').value || getConfig('hideActiveItems') && getConfig('hideActiveItems').value && item.itemType != 'Active'" class="item-group-transition-item" :key="item.title + tidx">
                                        <a v-if="item.id >= 0" class="item-image" :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`" target="_blank">
                                            <div class="name">
                                                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"></div>
                                                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"></div>
                                                <span>{{item.title}}</span>
                                            </div>
                                            <div v-if="validCharacters && (validCharacters.length > 1 || validCharacters[0].id === '19')" class="player-icon">
                                                <img :src="`img/characters/small portraits/${characters[0].id === '19' && item.player === '1' ? '20' : characters[parseInt(item.player)].id}.png`">
                                            </div>
                                            <img v-if="item.type === 'trinket'" :src="`img/icons/trinkets/${(`00${item.id}`).slice(-3)}.png`">
                                            <img v-else :src="`img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`">
                                        </a>
                                        <a v-else class="item-image glitched">
                                            <div class="name">
                                                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"></div>
                                                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"></div>
                                                <span>{{item.title}}</span>
                                            </div>
                                            <div v-if="validCharacters && (validCharacters.length > 1 || validCharacters[0].id === '19')" class="player-icon">
                                                <img :src="`img/characters/small portraits/${characters[0].id === '19' && item.player === '1' ? '20' : characters[parseInt(item.player)].id}.png`">
                                            </div>
                                            <div class="glitched-image">
                                                <template v-for="index in 3">
                                                    <div class="contain" :key="`glitched ${index}`">
                                                        <img class="glitched" onerror="this.src='img/icons/collectibles/023.png'" :src="`img/icons/collectibles/${randomItemId()}.png`">
                                                    </div>
                                                </template>
                                            </div>
                                        </a>
                                    </li>
                                </template>
                            </transition-group>
                        </div>
                    </div>
                </li>
            </template>
        </transition-group>
    </vue-scroll>
</template>

<script>
import runsMinxin from '../../mixins/runs'
import { mapRepos } from '@vuex-orm/core'
import Config from '../../store/classes/Config'
import Run from '../../store/classes/Run'
export default {
    name: "RunFloorsSlider",
    mixins: [runsMinxin],
    props: {
        ops: Object,
        index: Number,
        floors: Array,
        liveUpdate: Boolean,
        gameMode: String,
        characters: Array
    },
    components: {
    },
    data() {
        return {
            canUpdateRun: true
        }
    },
    computed: {
        ...mapRepos({
            configRepo: Config,
            runRepo: Run
        }),
        validCharacters() {
            return this.characters ? this.characters.filter(character => character.bypass !== true) : []
        }
    },
    methods: {
        getConfig(id) {
            return this.configRepo.query().where('id', id).get()[0]
        },
        randomItemId() {
            let id = Math.floor(Math.random()*(700-1+1)+1);
            if (id < 10) id = `00${id}`
            else if (id < 100) id = `0${id}`
            return id
        }
    },
    mounted() {
        if (this.index === 0 && this.$refs["firstRunFloorsScroller"]) {
            window.ipc.on('SYNC_CREATE_RUN', () => {
                this.canUpdateRun = false
                setTimeout(() => {
                    this.canUpdateRun = true
                }, 1500)
            })
            window.ipc.on('SYNC_UPDATE_RUN', (response) => {
                if(this.canUpdateRun && this.$refs["firstRunFloorsScroller"] && this.validRunUpdate(response)) {
                    this.$refs["firstRunFloorsScroller"].scrollTo({x:"100%"}, 1000)
                    setTimeout(() => {
                        this.$refs["firstRunFloorsScroller"].refresh()
                    }, 1000)
                    setTimeout(() => {
                        this.$refs["firstRunFloorsScroller"].scrollTo({x:"100%"}, 1000)
                    }, 1000)
                }
            })
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
@import "../../assets/styles/scss/vars/_animations";
.run-el.custom-scroll-floors {
    height: unset !important;
    overflow: visible !important;
    .__panel {
        overflow: visible!important;
        height: 137px;
    }
}
.floors {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    z-index: 0;
    transition: 1s ease;
    .run-el.floor {
        height: 100%;
        transition: 1s ease;
        &:not(:first-child) {
            margin-left: 24px;
        }
        &:last-child {
            .floor-content {
                margin-right: 224px;
            }
        }
        &.floors-group-transition-enter{
            opacity: 0;
            transform: translateX(100%);
            .floor-content {
                .top-info {
                    .icon {
                        &.floor {
                            width: 100%;
                            height: 100%;
                            transform: translate(0px, 0px);
                        }
                        &.curse {
                            opacity: 0;
                        }
                    }
                }
            }
        }
        &.floors-group-transition-leave-to {
            opacity: 0;
            transform: translateX(200%);
        }
        &.floors-group-transition-leave-active {
            position: absolute;
            //width: 100%;
        }
        &.floors-group-transition-move {
            transition: transform 1s ease;
        }
        &.floors-group-transition-item {
            transition: all 1s ease;
            display: block;
        }
        .floor-content {
            position: relative;
            //width: 1200px;
            height: 100%;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            box-shadow: inset 0px 10px 40px rgba(0, 0, 0, 1);
            width: 200px;
            border-radius: 20px;
            .top-info {
                display: flex;
                position: absolute;
                left: 0px;
                top: 0px;
                z-index: 3;
                pointer-events: none;
                width: 100%;
                height: 100%;
                .icon {
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: contain;
                    //transform: scale(2);
                    &.floor {
                        transition: 1s ease;
                        transition-delay: 1s;
                        width: 48px;
                        height: 32px;
                        transform: translate(-12px, -12px);
                    }
                    &.curse {
                        opacity: 1;
                        width: 30px;
                        height: 30px;
                        position: absolute;
                        transform: translate(16px);
                        transition: 1s ease;
                        transition-delay: 2s;
                    }
                }
            }
            .floor-wrapper {
                position: relative;
                overflow: hidden;
                height: 100%;
                width: 100%;
                display: flex;
                border-radius: 20px;
                &::before {
                    content: "";
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    box-shadow: inset 0px 0px 10px rgba(0,0,0,0.15);
                    pointer-events: none;
                    z-index: 2;
                }
                .floor-name {
                    z-index: 0;
                    font-family: "Up Heaval", sans-serif;
                    font-size: 30px;
                    position: absolute;
                    left: 10px;
                    top: 10px;
                    opacity: 0.6;
                    mix-blend-mode: screen;
                    text-align: left;
                }
                .custom-scroll-items {
                    height: unset !important;
                    overflow: visible !important;
                    .__panel {
                        overflow: visible!important;
                    }
                }
                .items {
                    padding: 10px;
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-wrap: wrap;
                    min-height: 100%;
                    min-width: calc(100% + 50px);
                    padding-right: 60px;
                    overflow-x: hidden;
                    overflow-y: overlay;
                    .item-group-transition-item {
                        // flex: 1;
                        //height: 40px;
                        // min-width: 25px;
                        position: relative;
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-items: center;
                        //padding: 5px;
                        padding: 10px;
                        max-width: 50px;
                        min-width: 5px;
                        min-height: 5px;
                        transition: 1s ease;
                        overflow: visible;
                        .item-image {
                            opacity: 1;
                            width: 50px;
                            z-index: 0;
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                            .name {
                                position: absolute;
                                z-index: 3;
                                padding: 5px 0px 10px 0px;
                                font-size: 10px;
                                transition: 1s ease;
                                left: 50%;
                                opacity: 0;
                                transform: translateX(-50%) rotate(0deg) translateY(0px);
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
                                    transform: translateX(-7px);
                                }
                                > .after {
                                    height: 100%;
                                    width: 12px;
                                    right: 0px;
                                    top: 0px;
                                    transform: translateX(11px);
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
                                > span {
                                    position: relative;
                                    z-index: 3;
                                }
                            }
                            img {
                                position: relative;
                                z-index: 1;
                                pointer-events: none;
                                width: 100%;
                                height: 100%;
                                transition: 1s;
                            }
                            .player-icon {
                                position: absolute;
                                z-index: 2;
                                pointer-events: none;
                                transition: 1s ease;
                            }
                            &.glitched {
                                .glitched-image {
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    height: 50px;
                                    width: 32px;
                                    margin: auto;
                                    transition: 1s;
                                    .contain {
                                        position: relative;
                                        width: calc(32px/3);
                                        height: 100%;
                                        overflow: hidden;
                                        > img {
                                            position: absolute;
                                            width: 100%;
                                            height: 100%;
                                            object-fit: cover;
                                            left: 50%;
                                            top: 50%;
                                            transform: translate(-50%, -50%);
                                        }
                                        &:first-child {
                                            > img {
                                                object-position: -12px;
                                            }
                                        }
                                        &:last-child {
                                            > img {
                                                object-position: -28px;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        &:hover {
                            cursor: pointer;
                            .item-image {
                                z-index: 1;
                                .name {
                                    opacity: 1;
                                    transform: translateX(-50%) rotate(-10deg) translateY(25px);
                                }
                                > img, .glitched-image {
                                    transform: scale(1.1) rotate(-10deg) translateY(-10px);
                                }
                                .player-icon {
                                    opacity: 0;
                                }
                            }
                        }
                        &.item-group-transition-enter, &.item-group-transition-leave-to {
                            opacity: 0;
                            transform: translateX(-100%);
                        }
                        &.item-group-transition-leave-active {
                            position: absolute;
                            height: 100%;
                        }
                        &.item-group-transition-move {
                            transition: transform 0.7s ease, opacity 1s ease, filter 1s ease;
                        }
                        &.item-group-transition-item {
                            transition: transform 0.7s ease, opacity 1s ease, filter 1s ease;
                            display: inline-block;
                            //margin: 0 5px;
                        }
                        &:hover {
                            z-index: 1;
                            flex-grow: 2;
                            opacity: 1;
                            filter: grayscale(0);
                        }
                    }
                    &:hover {
                        > li {
                            z-index: 0;
                            opacity: 0.2;
                            filter: grayscale(1);
                        }
                    }
                }
            }
        }
    }
}
</style>