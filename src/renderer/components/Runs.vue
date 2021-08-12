<template>
    <section class="section runs">
        <div v-if="this.allRuns && this.allRuns.length > 0" class="filters">
            <div class="search">
                <input v-model="filterText" @input="resetPagination" placeholder="Search runs">
            </div>
        </div>
        <transition-group name="run-group-transition" tag="ul" class="runs-container">
            <template v-for="(run, ridx) in filteredRuns">
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
                        <div class="infos">
                            <ul>
                                <li class="info status" title="Run status">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        <div class="icon" :style="{backgroundImage:`url('img/icons/hud/${run.runEnd.win === true ? `crown` : run.runEnd.win === false ? `dead` : `race`}.png')`}"></div>
                                    </div>
                                </li>
                                <li class="info game-state" title="Save file">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        <div class="icon" :style="{backgroundImage:`url('img/icons/hud/gamestate.png')`}"></div>
                                        <div class="text-icon big">{{run.gameState}}</div>
                                    </div>
                                </li>
                                <li class="info character-name">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        {{run.characters[0].trueName}}
                                    </div>
                                </li>
                                <li class="info seed" title="Seed">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        {{run.seed}}
                                    </div>
                                </li>
                                <li class="info date" title="Run start date">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        {{getDate(run.runStart, getConfig("dateFormat") ? getConfig("dateFormat").value : 'MM/DD/YY')}} - {{getDate(run.runStart, getConfig("hourFormat") ? getConfig("hourFormat").value : 'hh:mm a')}}
                                    </div>
                                </li>
                                <li v-if="run.runEnd.date" class="info date" title="Run duration">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        <div class="icon" :style="{backgroundImage:`url('img/icons/hud/time.png')`}"></div>
                                        <div class="text-icon">{{run.runDuration}}</div>
                                    </div>
                                </li>
                                <li class="info edit" @click="openOrCloseEditRun(run.id)">
                                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                                    <div class="content">
                                        <div class="icon" :style="{backgroundImage:`url('img/icons/config.png')`}"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div v-if="run.characters[0]" class="character" :style="{backgroundImage:`url('img/cards/characters-small.png')`}">
                            <div class="before" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                            <div class="after" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
                            <div v-if="run.characters[0].stats && parseInt(run.characters[0].id) != 10 && parseInt(run.characters[0].id) != 14 && (run.floors[run.floors.length - 1] && run.floors[run.floors.length - 1].curse != 'Curse of the Unknown' || run.runEnd.date != null)" class="hearts">
                                <template v-for="rhidx in run.characters[0].stats.life.maxHearts / 2">
                                    <div class="heart-container red-heart" :key="`red-heart-${rhidx}`">
                                        <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/red-heart-${run.characters[0].stats.life.hearts > run.characters[0].stats.life.maxHearts ? `full` : run.characters[0].stats.life.hearts - (rhidx - 1) * 2 > 1 ? `full` : run.characters[0].stats.life.hearts - (rhidx - 1) * 2 > 0 ? `half` : `empty`}.png')`}"></div>
                                    </div>
                                </template>
                                <template v-for="bhidx in run.characters[0].stats.life.boneHearts">
                                    <div class="heart-container bone-heart" :key="`bone-heart-${bhidx}`">
                                        <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/bone-heart-${(run.characters[0].stats.life.hearts - run.characters[0].stats.life.maxHearts) - (bhidx - 1) * 2 > 1 ? `full` : (run.characters[0].stats.life.hearts - run.characters[0].stats.life.maxHearts) - (bhidx - 1) * 2 > 0 ? `half` : `empty`}.png')`}"></div>
                                    </div>
                                </template>
                                <template v-for="shidx in Math.ceil(run.characters[0].stats.life.soulHearts / 2)">
                                    <div class="heart-container soul-heart" :key="`soul-heart-${shidx}`">
                                        <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/soul-heart-${run.characters[0].stats.life.soulHearts - (shidx - 1) * 2 > 1 ? `full` : `half`}.png')`}"></div>
                                    </div>
                                </template>
                                <!-- There is an issue to calculate black heart, if you have blue hearts between black hearts it will count as black heart so i only show blue hearts for the moment (it includes black heart also) -->
                                <!-- <template v-for="blhidx in calcBlackHeart(run.characters[0].stats.life.blackHearts)">
                                    {{calcBlackHeart(run.characters[0].stats.life.blackHearts)}}
                                    <div class="heart-container black-heart" :key="`black-heart-${blhidx}`">
                                        <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/black-heart-${calcBlackHeart(run.characters[0].stats.life.blackHearts)*2 - (blhidx - 1) * 2 > 1 ? `full` : `half`}.png')`}"></div>
                                    </div>
                                </template> -->
                            </div>
                            <div v-if="run.characters[0].stats && parseInt(run.characters[0].id) === 14 && (run.floors[run.floors.length - 1] && run.floors[run.floors.length - 1].curse != 'Curse of the Unknown' || run.runEnd.date != null)" class="hearts">
                                <template v-for="chidx in run.characters[0].stats.life.maxHearts / 2">
                                    <div class="heart-container coin-heart" :key="`red-heart-${chidx}`">
                                        <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/coin-heart-${run.characters[0].stats.life.hearts - (chidx - 1) * 2 > 1 ? `full` : `empty`}.png')`}"></div>
                                    </div>
                                </template>
                            </div>
                            <div v-if="run.characters[0].stats && run.floors[run.floors.length - 1] && run.floors[run.floors.length - 1].curse === 'Curse of the Unknown'" class="hearts">
                                <div class="heart-container unknow-heart">
                                    <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/unknow-heart.png')`}"></div>
                                </div>
                            </div>
                            <div v-if="run.characters[0].stats" class="usables">
                                <ul>
                                    <li class="coins">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/hud/coin.png')`}"></div>
                                        <span class="value">
                                            {{(`0${run.characters[0].stats.usables.coins}`).slice(-2)}}
                                        </span>
                                    </li>
                                    <li class="bombs">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/hud/bomb.png')`}"></div>
                                        <span class="value">
                                            {{(`0${run.characters[0].stats.usables.bombs}`).slice(-2)}}
                                        </span>
                                    </li>
                                    <li class="keys">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/hud/key.png')`}"></div>
                                        <span class="value">
                                            {{(`0${run.characters[0].stats.usables.keys}`).slice(-2)}}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <ul class="active-items">
                                <template v-for="(item, ctidx) in run.characters[0].activables">
                                    <li class="item" :key="item.title + ctidx">
                                        <div class="name">
                                            {{item.title}}
                                        </div>
                                        <a class="item-image" :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`" target="_blank">
                                            <img :src="`img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`">
                                        </a>
                                    </li>
                                </template>
                            </ul>
                            <div class="image" :style="{backgroundImage:`url('img/characters/${run.characters[0].trueName}${parseInt(run.characters[0].id) > 20 ? ` Alt` : ``}.png')`}"></div>
                            <div v-if="run.characters[0].stats" class="stats">
                                <ul>
                                    <li class="speed">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/stats/speed.png')`}"></div>
                                        <span class="value">
                                            {{(Math.round(run.characters[0].stats.stats.moveSpeed * 100) / 100).toFixed(2)}}
                                        </span>
                                        <span class="value-small">
                                            {{(Math.round(run.characters[0].stats.stats.moveSpeed * 100) / 100).toFixed(1)}}
                                        </span>
                                    </li>
                                    <li class="tear-rate">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/stats/tearrate.png')`}"></div>
                                        <span class="value">
                                            {{(Math.round(run.characters[0].stats.stats.currentFireDelay * 100) / 100).toFixed(2)}}
                                        </span>
                                        <span class="value-small">
                                            {{(Math.round(run.characters[0].stats.stats.currentFireDelay * 100) / 100).toFixed(1)}}
                                        </span>
                                    </li>
                                    <li class="damage">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/stats/damage.png')`}"></div>
                                        <span class="value">
                                            {{(Math.round(run.characters[0].stats.stats.damage * 100) / 100).toFixed(2)}}
                                        </span>
                                        <span class="value-small">
                                            {{(Math.round(run.characters[0].stats.stats.damage * 100) / 100).toFixed(1)}}
                                        </span>
                                    </li>
                                    <li class="luck">
                                        <div class="image" :style="{backgroundImage:`url('img/icons/stats/luck.png')`}"></div>
                                        <span class="value">
                                            {{(Math.round(run.characters[0].stats.stats.luck * 100) / 100).toFixed(2)}}
                                        </span>
                                        <span class="value-small">
                                            {{(Math.round(run.characters[0].stats.stats.luck * 100) / 100).toFixed(1)}}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <vue-scroll :ops="opsFloors" :class="['custom-scroll-floors']" :ref="ridx === 0 ? 'firstRunFloorsScroller' : ''">
                            <transition-group name="floors-group-transition" tag="ul" class="floors">
                                <template v-for="(floor, fidx) in run.floors">
                                    <li v-if="floor" :class="['floor', 'floors-group-transition-item', floor.death ? 'death-here' : '']" :data-id="floor.id" :key="floor.id + fidx">
                                        <div class="floor-content" :style="{backgroundImage:`url('img/textures/floors/${floor.group}-ground.png')`}">
                                            <div class="top-info">
                                                <div class="icon floor" :style="{backgroundImage:`url('img/icons/floors/${floor.group}.png')`}"></div>
                                                <div v-if="floor.curse" class="icon curse" :style="{backgroundImage:`url('img/icons/curses/${floor.curse}.png')`}"></div>
                                            </div>
                                            <div class="floor-wrapper">
                                                <div class="floor-name">{{floor.name}}</div>
                                                <transition-group name="item-group-transition" tag="ul" class="items">
                                                    <template v-for="(item, tidx) in floor.itemsCollected">
                                                        <li v-if="!hideActiveItems || !hideActiveItems.value || (hideActiveItems.value && item.itemType != 'Active')" class="item-group-transition-item" :key="item.title + tidx">
                                                            <div class="name">
                                                                {{item.title}}
                                                            </div>
                                                            <a class="item-image" :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`" target="_blank">
                                                                <img :src="`img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`">
                                                                <!-- <div class="item-image" :style="{backgroundImage:`url('img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`}"></div> -->
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
                    </div>
                </li>
            </template>
      </transition-group>
        <div v-if="Math.ceil(filteredRunsTotal.length / filterLimitPerPage) > 1" class="navigation-container">
            <div class="navigation">
                <template v-for="page in Math.ceil(filteredRunsTotal.length / filterLimitPerPage)">
                    <div v-if="page === 1 || page === Math.ceil(filteredRunsTotal.length / filterLimitPerPage) || [currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2].includes(page)" :class="['page',currentPage === page ? 'active' : '']" v-on:click="filterOffset = filterLimitPerPage * (page - 1); currentPage = page" :key="`page-${page}`">{{page}}</div>
                    <div v-if="(page > 1 || page <  Math.ceil(filteredRunsTotal.length / filterLimitPerPage)) && (page === currentPage-3 && currentPage >= 5 || page === currentPage+3 && currentPage <= Math.ceil(filteredRunsTotal.length / filterLimitPerPage)-4)" class="page-offset" :key="`page-${page}`">...</div>
                </template>
            </div>
        </div>
        <div v-if="this.filteredRuns && this.filteredRuns.length === 0" class="empty-runs">
            <div class="image-1 animated" style="background-image:url('img/loadimages/loadimages-001.png')"></div>
            <div class="image-2 animated" style="background-image:url('img/loadimages/loadimages-001_2.png')"></div>
            <div class="message">
                <span v-if="this.allRuns && this.allRuns.length === 0">Start your first run !</span>
                <span v-if="this.filteredRuns && this.filteredRuns.length === 0 && this.allRuns && this.allRuns.length > 0">No runs found</span>
            </div>
        </div>
    </section>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Run from '../store/classes/Run'
import Tag from '../store/classes/Tag'
import Config from '../store/classes/Config'
import moment from 'moment'
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
            },
            currentPage: 1,
            filterLimitPerPage: 6,
            filterOffset: 0,
            filterOrder: 'desc',
            filterText: '',
            filterCharacter: [],
            filterCharacterVersion: '',
            filterGameState: 0,
            filterWiNOrDeath: '',
            filterDateFrom: 0,
            filterDateTo: 0
        }
    },
    mounted() {
        window.ipc.send('ASK_RUNS')
        window.ipc.on('SYNC_SEND_RUNS', (response) => {
            console.log(response)
            this.runRepo.fresh(response.runs)
        })
        window.ipc.send('ASK_TAGS')
        window.ipc.on('SYNC_SEND_TAGS', (response) => {
            console.log(response)
            this.tagRepo.fresh(response.tags)
        })
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
            runRepo: Run,
            tagRepo: Tag,
            configRepo: Config
        }),
        allRuns() {
            return this.runRepo.all()
        },
        filteredRunsTotal() {
            return this.runRepo.orderBy('runUpdate', this.filterOrder).where((run) => { return this.filter(run) }).get()
        },
        filteredRuns() {
            return this.filteredRunsTotal.slice(this.filterOffset, this.filterLimitPerPage+this.filterOffset)
        },
        hideActiveItems() {
            return this.configRepo.find('hideActiveItems')
        },
        updateRun: {
            get: function(run) {
                return this.runRepo.query().where('id', run.id).get().first()
            },
            set: function (run) {
                this.runRepo.where('id', run.id).update(run)
            }
        }
    },
    methods: {
        resetPagination() {
            this.currentPage = this.currentPage === 1 ? this.currentPage : 1
            this.filterOffset = this.filterOffset === 0 ? this.filterOffset : 0
        },
        filter(run) {
            // Text filter
            if(this.filterText.length > 3) {
                const textSearchValue = this.filterText.normalize('NFC').toLowerCase()
                const characterName = run.characters[0].trueName.normalize('NFC').toLowerCase()
                const customRunName = run.customName.normalize('NFC').toLowerCase()
                const id = run.id.normalize('NFC').toLowerCase()
                if (
                    !characterName.includes(textSearchValue) &&
                    !customRunName.includes(textSearchValue) ||
                    !id.includes(textSearchValue)
                    ) return
            }

            return run
        },
        openOrCloseEditRun(id) {
            this.$root.$emit('OPEN_EDITRUN', id)
        },
        getDate(unixDate, format) {
            return moment.unix(unixDate).format(format)
        },
        getConfig(id) {
            return this.configRepo.query().where('id', id).get()[0]
        }
        // calcBlackHeart(nb) {
        //     if (nb === 3) return 2
        //     if (nb === 1) return 1
        //     let i = 0
        //     let n = nb - 1
        //     while (n > 1) {
        //         n = n / 2;
        //         i++
        //     }
        //     return i
        // }
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
    padding: 0px 24px;
}
.filters {
    margin-bottom: 16px;
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
    }
    &.run-group-transition-leave-active {
        position: absolute;
        width: calc(100% - 48px);
    }
    &.run-group-transition-move {
        transition: transform 1s ease;
    }
    &.run-group-transition-item {
        transition: transform 1s ease, opacity 1s ease;
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
        padding-bottom: 56px;
        padding-top: 72px;
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
        .infos {
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
            .hearts {
                position: absolute;
                display: flex;
                flex-wrap: wrap;
                width: calc(12*6px);
                top: 10px;
                left: 30px;
                .heart-container {
                    width: 12px;
                    height: 9px;
                    .heart {
                        width: 17px;
                        height: 16px;
                    }
                }
            }
            .stats {
                position: absolute;
                width: 100%;
                bottom: 16px;
                left: 0px;
                transform: scale(0.8) rotate(-3deg);
                ul {
                    display: flex;
                    justify-content: space-between;
                    &:hover {
                        li {
                            opacity: 0.1;
                        }
                    }
                    li {
                        transition: 0.25s ease;
                        display: flex;
                        align-items: center;
                        position: relative;
                        .image {
                            width: 16px;
                            height: 16px;
                        }
                        .value, .value-small {
                            transition: 0.25s ease;
                            font-size: 12px;
                            pointer-events: none;
                            cursor: default;
                        }
                        .value {
                            opacity: 0;
                            position: absolute;
                            left: 16px;
                        }
                        &:not(:first-child) {
                            margin-left: 3px;
                        }
                        &:hover {
                            transform: scale(1.5);
                            opacity: 1;
                            .value {
                                opacity: 1;
                            }
                            .value-small {
                                opacity: 0;
                            }
                            &:last-child {
                                transform: scale(1.5) translateX(-10px);
                            }
                        }
                    }
                }
            }
            .usables {
                transition: 0.25s ease;
                position: absolute;
                top: 24px;
                left: 4px;
                transform: scale(0.7) rotate(-3deg);
                ul {
                    li {
                        display: flex;
                        align-items: center;
                        height: 16px;
                        pointer-events: none;
                        .image {
                            width: 18px;
                            height: 18px;
                        }
                        .value {

                        }
                    }
                }
                &:hover {
                    transform: scale(1) rotate(-3deg) translate(5px, 10px);
                }
            }
            .active-items {
                position: absolute;
                right: 20px;
                top: 24px;
                .item {
                    .name {
                        display: none;
                    }
                }
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
                                    height: 100%;
                                }
                                &.item-group-transition-move {
                                    transition: transform 0.7s ease;
                                }
                                &.item-group-transition-item {
                                    transition: transform 0.7s ease;
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
    &.run-death {
        .run-content {
            .character {
                .hearts {
                    filter: grayscale(1);
                    opacity: 0.5;
                }
            }
        }
    }
}
.navigation-container {
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 0;
    .navigation {
        display: flex;
        align-items: center;
        .page, .page-offset {
            padding: 8px;
        }
        .page {
            opacity: 0.7;
            cursor: pointer;
            transition: 0.5s ease;
            &.active {
                opacity: 1;
                font-size: 170%;
            }
            &-offset {
                pointer-events: none;
                cursor: default;
            }
        }
    }
}
.empty-runs {
    position: relative;
    height: calc(100vh - 70px);
    overflow: hidden;
    .image-1, .image-2 {
      position: absolute;
      left: 0px;
      top: 0px;
      height: 100%;
      width: 100%;
      background-repeat: no-repeat;
      background-position: center;
      transform: scale(2);
      &.animated {
        animation-name: alternate;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-duration: 0.20s;
        animation-direction: alternate;
      }
    }
    .image-2 {
      animation-delay: 0.20s;
    }
}
</style>