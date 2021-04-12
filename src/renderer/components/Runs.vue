<template>
    <section class="section runs" v-if="this.allRunsMostRecentFirst">
        <!-- <span class="logs" style="font-size:12px">{{this.allRunsMostRecentFirst}}</span> -->
        <transition-group name="run-group-transition" tag="ul" class="runs-container">
            <template v-for="(run, ridx) in allRunsMostRecentFirst">
                <li :class="
                [
                'run', 'run-group-transition-item',
                run.runEnd.win === true ? 'run-win' : run.runEnd.win === false ? 'run-death' : 'run-unfinished',
                run.toRemove.status === true && run.toRemove.checkedByUser === false ? 'run-to-remove-unchecked' : run.toRemove.status === true && run.toRemove.checkedByUser === true ?'run-to-remove-checked' : ''
                ]" :data-id="run.id + ridx" :key="run.id">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-big-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-big-mid_01.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-big-right_01.png')`}"></div>
                    <div class="run-content">
                        <div v-if="run.characters[0]" class="character" :style="{backgroundImage:`url('img/cards/characters-small.png')`}">
                            <div class="before" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                            <div class="after" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                            <div class="name">{{run.characters[0].name}}</div>
                            <div class="image" :style="{backgroundImage:`url('img/characters/${run.characters[0].trueName} ${parseInt(run.characters[0].id) > 20 ? `Alt` : ``}.png')`}"></div>
                        </div>
                        <vue-scroll :ops="opsFloors" :class="['custom-scroll-floors']" :ref="ridx === 0 ? 'firstRunFloorsScroller' : ''">
                            <transition-group name="floors-group-transition" tag="ul" class="floors">
                                <template v-for="(floor, fidx) in run.floors">
                                    <li :class="['floor', 'floors-group-transition-item', floor.death ? 'death-here' : '']" :data-id="floor.id" :key="floor.id + fidx">
                                        <div class="floor-content" :style="{backgroundImage:`url('img/textures/floors/${floor.group}-ground.png')`}">
                                            <div class="top-info">
                                                <div class="icon floor" :style="{backgroundImage:`url('img/icons/floors/${floor.group}.png')`}"></div>
                                                <div class="icon curse" :style="{backgroundImage:`url('img/icons/curses/${floor.curse}.png')`}"></div>
                                            </div>
                                            <div class="floor-wrapper">
                                                <div class="floor-name">{{floor.name}}</div>
                                                    <transition-group name="item-group-transition" tag="ul" class="items">
                                                        <li class="item-group-transition-item" v-for="(item, tidx) in floor.itemsCollected" :key="item.title + tidx">
                                                            <div class="name">
                                                                {{item.title}}
                                                            </div>
                                                            <a class="item-image" :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`" target="_blank">
                                                                <img :src="`img/icons/collectibles/${item.id < 10 ? `00${item.id}` : item.id < 100 ? `0${item.id}` : item.id }.png`">
                                                                <!-- <div class="item-image" :style="{backgroundImage:`url('img/icons/collectibles/${item.id < 10 ? `00${item.id}` : item.id < 100 ? `0${item.id}` : item.id }.png')`}"></div> -->
                                                            </a>
                                                        </li>
                                                    </transition-group>
                                            </div>
                                        </div>
                                    </li>
                                </template>
                            </transition-group>
                        </vue-scroll>
                    </div>
                </li>
            </template>
      </transition-group>
    </section>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Run from '../store/classes/Run'
export default {
    name: "Runs",
    data() {
        return {
            canUpdateRun: true,
            tempUpdateRun: null,
            opsFloors: {
                vuescroll: {
                    mode: 'slide',
                    detectResize: true,
                    wheelScrollDuration: 0,
                    zooming: false,
                    scroller: {
                        speedMultiplier: 0.5,
                    }
                },
                scrollPanel: {
                    scrollingY: false,
                },
                rail: {
                    opacity: 0,
                    size: '0px'
                },
                bar: {
                    disable: true
                }
            }
        }
    },
    mounted() {
        window.ipc.on('SYNC_CREATE_RUN', (response) => {
            console.log(response)
            this.runRepo.insert(response.run)
            this.canUpdateRun = false
            setTimeout(() => {
                if(this.tempUpdateRun != null) {
                    this.updateRun = this.tempUpdateRun
                    this.tempUpdateRun = null
                }
                this.canUpdateRun = true
            }, 1500);
        })
        window.ipc.on('SYNC_UPDATE_RUN', (response) => {
            console.log(response)
            if(!this.canUpdateRun) {
                this.tempUpdateRun = response.run
            } else {
                this.updateRun = response.run
                this.$refs.firstRunFloorsScroller[0].scrollTo({x:"100%"}, 1000)
                setTimeout(() => {
                    this.$refs.firstRunFloorsScroller[0].refresh()
                }, 1000);
                setTimeout(() => {
                    this.$refs.firstRunFloorsScroller[0].scrollTo({x:"100%"}, 1000)
                }, 1000);
            }
        })
        window.ipc.on('SYNC_REMOVE_RUN', (response) => {
            console.log(response)
            this.runRepo.destroy(response.run)
        })
        window.ipc.on('SYNC_ASK_REMOVE_RUN', (response) => {
            console.log(response)
            this.updateRun = response.run
        })
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        allRuns() {
            return this.runRepo.all()
        },
        allRunsMostRecentFirst() {
            return this.runRepo.orderBy('runUpdate', 'desc').get()
        },
        updateRun: {
            get: function(run) {
                return this.runRepo.query().where('id', run.id).get()
            },
            set: function (run) {
                console.log(run)
                this.runRepo.update(run)
            }
        },
    },
    methods: {
    },
};
</script>

<style lang="scss">
@import "../assets/styles/scss/vars/_colors";
.section.runs {
    padding: 20px;
    position: relative;
}
.runs-container {
    position: relative;
}
.run {
    position: relative;
    margin-bottom: 0px;
    box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
    transition: 1.5s ease;
    width: 100%;
    // cursor: pointer;
    &:not(:first-child) {
        margin-top: 12px;
    }
    &.run-group-transition-enter{
        opacity: 0;
        transform: translateY(100%);
    }
    &.run-group-transition-leave-to {
        opacity: 0;
        transform: translateY(50px);
        filter: grayscale(100)
    }
    &.run-group-transition-leave-active {
        position: absolute;
        width: 100%;
    }
    &.run-group-transition-move {
        transition: transform 1.5s ease;
    }
    &.run-group-transition-item {
        transition: all 1.5s ease;
        //display: block;
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
        width: 15px;
        left: 0px;
        top: 0px;
        transform: translateX(-14.25px);
    }
    > .after {
        height: 100%;
        width: 15px;
        right: 0px;
        top: 0px;
        transform: translateX(14.25px);
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
    .run-content {
        z-index: 1;
        position: relative;
        display: flex;
        padding: 24px;
        padding-bottom: 32px;
        overflow: hidden;
        width: 100%;
        z-index: 1;
        &::before {
            content: "";
            position: absolute;
            height: 85%;
            width: 140px;
            background: linear-gradient(to right, $paper-white-darker 70%, transparent 100%);
            //background: black;
            left: 0px;
            top: calc(50% - 6px);
            opacity: 1;
            transform: translateX(0px) translateY(-50%);
            z-index: 2;
        }
        &::after {
            content: "";
            position: absolute;
            height: 85%;
            width: 50px;
            background: linear-gradient(to left, $paper-white-darker 20%, transparent 100%);
            right: 0px;
            top: calc(50% - 6px);
            opacity: 1;
            transform: translateX(0px) translateY(-50%);
            z-index: 2;
        }
        .character {
            z-index: 2;
            margin-right: 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 140px;
            height: 137px;
            flex-shrink: 0;
            //flex-grow: 1;
            padding: 16px;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            position: relative;
            transform: translateY(-2px) scale(1.25);
            .before, .after {
                position: absolute;
                left: 0px;
                top: 0px;
                height: 20px;
                width: 20px;
                transform: translate(4px, 13px);
            }
            .after {
                right: 0px;
                left: unset;
                top: 0px;
                transform: translate(-9px, 6px);
                z-index: 2;
            }
            > * {
                transform: rotate(-3deg);
            }
            .name {
                margin-bottom: 2px;
                font-size: 16px;
            }
            .image {
                height: 50px;
                width: 50px;
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
            }
        }
        .custom-scroll-floors {
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
            .floor {
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
                                transition: 0.5s ease;
                                overflow: visible;
                                .name {
                                    display: none;
                                }
                                .item-image {
                                    width: 50px;
                                    z-index: 0;
                                    position: absolute;
                                    left: 50%;
                                    top: 50%;
                                    transform: translate(-50%, -50%);
                                    img {
                                        pointer-events: none;
                                        width: 100%;
                                        height: 100%;
                                        transition: 1s;
                                    }
                                }
                                &:hover {
                                    cursor: pointer;
                                    .item-image {
                                        img {
                                            z-index: 1;
                                            transform: scale(1.1) rotate(-10deg) translateY(-10px);
                                        }
                                    }
                                }
                                &.item-group-transition-enter, &.item-group-transition-leave-to {
                                    opacity: 0;
                                    transform: translateX(-100%);
                                }
                                &.item-group-transition-leave-active {
                                    position: absolute;
                                }
                                &.item-group-transition-move {
                                    transition: transform 0.7s ease;
                                }
                                &.item-group-transition-item {
                                    transition: all 0.7s;
                                    display: inline-block;
                                    //margin: 0 5px;
                                }
                                &:hover {
                                    flex-grow: 2;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    &.run-unfinished {
        &:first-child {
            .run-content {
                .floors {
                    .floor {
                        &:last-child {
                            .floor-content {
                                outline: 5px dashed rgba(0,0,0,0.1);
                                outline-offset: 0px;
                                animation-name: outline-zooming;
                                animation-iteration-count: infinite;
                                animation-duration: 1s;
                                @keyframes outline-zooming {
                                    0% {
                                        outline-offset: 0px;
                                        outline: 5px dashed rgba(0,0,0,0.1);
                                    }
                                    25% {
                                        outline-offset: 3px;
                                        outline: 5px dashed rgba(0,0,0,0.3);
                                    }
                                    50% {
                                        outline-offset: 3px;
                                        outline: 5px dashed rgba(0,0,0,0.3);
                                    }
                                    100% {
                                        outline-offset: 0px;
                                        outline: 5px dashed rgba(0,0,0,0.1);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>