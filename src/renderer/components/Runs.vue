<template>
    <section class="section runs">
        <!-- <span class="logs" style="font-size:8px">{{this.allRunsMostRecentFirst}}</span> -->
        <!-- <div></div> -->
        <transition-group name="run-group-transition" tag="ul" class="runs-container">
            <template v-for="(run, idx) in allRunsMostRecentFirst">
                <li :class="['run', 'run-group-transition-item', run.runEnd.win === true ? 'run-win' : run.runEnd.win === false ? 'run-death' : 'run-unfinished']" :data-id="run.id" :key="idx">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-big-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-big-mid_01.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-big-right_01.png')`}"></div>
                    <div class="run-content">
                        <div class="character" :style="{backgroundImage:`url('img/cards/characters-small.png')`}" :data-character="run.character.name">
                            <div class="before" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                            <div class="after" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                            <div class="name">{{run.character.name}}</div>
                            <div class="image" :style="{backgroundImage:`url('img/characters/${run.character.name}.png')`}"></div>
                        </div>
                        <transition-group name="floors-group-transition" tag="ul" class="floors">
                            <template v-for="(floor, fidx) in run.floors">
                                <li :class="['floor', 'floors-group-transition-item', floor.death ? 'death-here' : '']" :data-id="floor.id" :key="idx + fidx">
                                    <div class="floor-content" :style="{backgroundImage:`url('img/textures/floors/${floor.group}-ground.png')`}">
                                        <div class="top-info">
                                            <div class="icon floor" :style="{backgroundImage:`url('img/icons/floors/${floor.group}.png')`}"></div>
                                            <div class="icon curse" :style="{backgroundImage:`url('img/icons/curses/${floor.curse}.png')`}"></div>
                                        </div>
                                        <div class="floor-wrapper">
                                            <div class="floor-name">{{floor.name}}</div>
                                            <transition-group name="item-group-transition" tag="ul" class="items">
                                                <li class="item-group-transition-item" v-for="(item, tidx) in floor.itemsCollected" :key="idx + fidx + tidx">
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
    canUpdateRun: true,
    tempUpdateRun: null,
    data() {
        return {

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
            }
        })
        window.ipc.on('SYNC_REMOVE_RUN', (response) => {
            console.log(response)
            this.runRepo.destroy(response.run.id)
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
            //return this.allRuns.map(run => { return run }).sort((a, b)=>{if(a.runUpdate < b.runUpdate) {return 1} else if(a.runUpdate > b.runUpdate) {return -1}})
            return this.runRepo.orderBy('runUpdate', 'desc').get()
        },
        updateRun: {
            get: function(run) {
                return this.runRepo.query().where('id', run.id).get()
            },
            set: function (run) {
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
}
.run {
    position: relative;
    margin-bottom: 0px;
    box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
    transition: 1.5s ease;
    // cursor: pointer;
    &:not(:first-child) {
        margin-top: 12px;
    }
    &.run-group-transition-enter, &.run-group-transition-leave-to {
        opacity: 0;
        transform: translateX(100%);
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
        display: block;
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
        &::before {
            content: "";
            position: absolute;
            height: 85%;
            width: 100px;
            background: linear-gradient(to left, $paper-white-darker 20%, transparent 100%);
            right: 0px;
            top: calc(50% - 6px);
            opacity: 1;
            transform: translateX(-15px) translateY(-50%);
        }
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
        .character {
            margin-right: 16px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100px;
            height: 100px;
            flex-shrink: 0;
            //flex-grow: 1;
            padding: 16px;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            position: relative;
            .before, .after {
                position: absolute;
                left: 0px;
                top: 0px;
                height: 20px;
                width: 20px;
                transform: translate(4px, -2px);
            }
            .after {
                right: 0px;
                left: unset;
                top: 0px;
                transform: translate(-8px, -4px);
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
        .floors {
            display: flex;
            .floor {
                height: 100%;
                &:not(:first-child) {
                    margin-left: 24px;
                }
                .floor-content {
                    position: relative;
                    //width: 1200px;
                    height: 100%;
                    background-position: left;
                    background-size: contain;
                    background-repeat: repeat;
                    box-shadow: inset 0px 0px 10px rgba(0,0,0,1);
                    outline: 6px dashed rgba(0,0,0,0.2);
                    outline-offset: 4px;
                    min-width: 200px;
                    .top-info {
                        display: flex;
                        transform: translateY(-8px);
                        position: absolute;
                        left: 0px;
                        top: 0px;
                        z-index: 2;
                        .icon {
                            background-position: center;
                            background-repeat: no-repeat;
                            background-size: contain;
                            transform: scale(2);
                            &.floor {
                                width: 28px;
                                height: 16px;
                            }
                            &.curse {
                                width: 15px;
                                height: 15px;
                                transform: translateY(3px) scale(2);
                            }
                        }
                    }
                    .floor-wrapper {
                        position: relative;
                        overflow: hidden;
                        height: 100%;
                        display: flex;
                        .floor-name {
                            z-index: 0;
                            font-family: "Up Heaval", sans-serif;
                            font-size: 36px;
                            position: absolute;
                            left: 10px;
                            top: 10px;
                            opacity: 0.4;
                            mix-blend-mode: soft-light;
                            white-space: nowrap;
                        }
                        .items {
                            padding: 10px;
                            position: relative;
                            z-index: 1;
                            display: flex;
                            flex-wrap: wrap;
                            overflow-x: hidden;
                            width: 100%;
                            height: 100%;
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
}
</style>