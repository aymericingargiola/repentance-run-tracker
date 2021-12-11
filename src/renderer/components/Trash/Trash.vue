<template>
    <transition name="open-trash">
        <div v-if="isOpen" class="trash">
            <div class="before" :style="{backgroundImage:`url('img/textures/borders/chest-top.png')`}"></div>
            <div class="mid" :style="{backgroundImage:`url('img/textures/floors/mines-ground.png')`}"></div>
            <div class="trash-container">
                <div class="buttons">
                    <div class="mid" :style="{backgroundImage:`url('img/textures/floors/chest-ground.png')`}"></div>
                    <div class="btn empty">
                        <button :disabled="trashRuns.all().length < 1" class="warning" @click="emptyTrash()">{{$t('trash.emptyTrash')}}</button>
                    </div>
                    <div class="btn delete">
                        <button class="warning" :disabled="selected.length === 0" @click="deleteSelected()">{{$t('strings.deleteSelected')}}</button>
                    </div>
                    <div class="btn restore">
                        <button :disabled="selected.length === 0" @click="restoreSelected()">{{$t('strings.restoreSelected')}}</button>
                    </div>
                    <div class="btn close">
                        <button @click="close()">{{$t('dictionary.close')}}</button>
                    </div>
                </div>
                <transition-group name="trash-run-group-transition" tag="ul" class="runs-container">
                        <template v-for="(run, ridx) in allTrashRuns">
                            <li :class="
                            [
                            'run', 'trash-item', 'trash-run-group-transition-item',
                            selected.includes(run.id) ? 'selected' : '',
                            run.runEnd.win === true ? 'run-win' : run.runEnd.win === false ? 'run-death' : 'run-unfinished',
                            run.toRemove.status === true && run.toRemove.checkedByUser === false ? 'run-to-remove-unchecked' : run.toRemove.status === true && run.toRemove.checkedByUser === true ?'run-to-remove-checked' : ''
                            ]" :data-id="run.id + ridx" :key="run.id" @click="runSelected(run.id)">
                                <!-- <div class="before" :style="{backgroundImage:`url('img/cards/bar-big-left_01.png')`}"></div>
                                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-big-mid_01.png')`}"></div>
                                <div class="after" :style="{backgroundImage:`url('img/cards/bar-big-right_01.png')`}"></div> -->
                                <div class="run-content">
                                    <RunCharacter :characters="run.characters" :floors="run.floors" :run-end="run.runEnd"/>
                                    <RunInfos :id="run.id" :gameState="run.gameState" :seed="run.seed" :characters="run.characters" :floors="run.floors" :run-start="run.runStart" :run-end="run.runEnd" :run-duration="run.runDuration" :hide-edit="true"/>
                                    
                                </div>
                            </li>
                        </template>
                </transition-group>
                <div class="trash-empty" v-if="trashRuns.all().length < 1">
                    <span class="message">
                        {{$t('trash.trashIsEmpty')}}
                    </span>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import TrashRun from '../../store/classes/TrashRun'
import RunInfos from '../../components/RunsElements/Infos.vue'
import RunCharacter from '../../components/RunsElements/Character.vue'
export default {
    name: "Trash",
    components: {
        RunInfos,
        RunCharacter
    },
    data() {
        return {
            isOpen: false,
            selected: []
        }
    },
    computed: {
        ...mapRepos({
            trashRunRepo: TrashRun,
        }),
        trashRuns() {
            return this.trashRunRepo
        },
        allTrashRuns() {
            return this.trashRunRepo.all()
        }
    },
    methods: {
        runSelected(id) {
            this.selected.includes(id) ? this.selected = this.selected.filter((runId) => runId !== id) : this.selected.push(id)
        },
        restoreSelected() {
            window.ipc.send('USER_RESTORE_RUNS_FROM_TRASH', this.selected)
            this.selected = []
        },
        deleteSelected() {
            window.ipc.send('USER_REMOVE_RUNS_FROM_TRASH', this.selected)
            this.selected = []
        },
        emptyTrash() {
            window.ipc.send('USER_EMPTY_TRASH')
            this.selected = []
        },
        close() {
            this.isOpen = false
        }
    },
    mounted() {
        this.$root.$on('OPEN_TRASH', () => {
            this.isOpen = !this.isOpen
        })
        window.ipc.send('ASK_TRASH')
        window.ipc.on('SYNC_SEND_TRASH', (response) => {
            console.log(response)
            this.trashRunRepo.fresh(response.trash)
        })
        window.ipc.on('SYNC_ADD_RUN_TO_TRASH', (response) => {
            console.log(response)
            this.trashRunRepo.save(response.run)
        })
        window.ipc.on('SYNC_REMOVE_RUNS_FROM_TRASH', (response) => {
            console.log(response)
            this.trashRunRepo.destroy(response.runs)
        })
        window.ipc.on('SYNC_EMPTY_TRASH', () => {
            console.log("Empty trash")
            this.trashRunRepo.flush()
        })
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
@import "../../assets/styles/scss/vars/_animations";
.trash {
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 45vh;
    z-index: 10;
    box-shadow: 0px -20px 20px rgba(0, 0, 0, 0.5);
    transition: 0.5s ease;
    &.open-trash-enter-active, &.open-trash-leave-active {
    }
    &.open-trash-enter, &.open-trash-leave-to {
        transform: translate(0px, 150%);
    }
    > .before, > .mid {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
    }
    > .before {
        height: 17px;
        background-repeat: repeat;
        z-index: 3;
        box-shadow: 0px 8px 10px rgba(0,0,0,0.8);
    }
    > .mid {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        z-index: -1;
    }
    .trash-container {
        height: 100%;
        .buttons {
            width: 100%;
            display: flex;
            position: absolute;
            width: 100%;
            left: 0px;
            top: 19px;
            padding: 8px 16px;
            z-index: 2;
            box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.8);
            .btn {
                position: relative;
                z-index: 1;
                &:not(:nth-child(2)) {
                    margin-left: 16px;
                }
                &:last-child {
                    margin-left: auto;
                }
            }
            > .before, > .mid {
                position: absolute;
                left: 0px;
                top: 0px;
                width: 100%;
                height: 100%;
                background-repeat: no-repeat;
                background-size: cover;
                background-position: center;
            }
        }
        .runs-container {
            margin-top: 16px;
            display: flex;
            flex-wrap: wrap;
            overflow: auto;
            overflow-x: hidden;
            height: 100%;
            justify-content: space-evenly;
            padding-top: 16px;
            align-items: baseline;
            position: relative;
            z-index: 1;
            padding: 50px 0px 16px 0px;
            .run {
                width: auto;
                box-shadow: none;
                margin-top: 0px;
                margin-bottom: 0px;
                transition: 1s $transitionBounce;
                &:not(:first-child) {
                    margin-top: 0px;
                    margin-bottom: 0px;
                }
                &.trash-run-group-transition-enter{
                    opacity: 0;
                    //transform: translateY(100%);
                }
                &.trash-run-group-transition-leave-to {
                    opacity: 0;
                    //transform: translateY(50px);
                }
                &.trash-run-group-transition-leave-active {
                    position: absolute;
                    //width: calc(100% - 48px);
                }
                &.trash-run-group-transition-move {
                    //transition: transform 1s ease;
                }
                &.trashrun-group-transition-item {
                    //transition: transform 1s ease, opacity 1s ease;
                    //display: block;
                }
                .run-content {
                    flex-direction: column;
                    padding-bottom: 24px;
                    padding-top: 24px;
                    overflow: visible;
                    &::before, &::after {
                        display: none;
                    }
                    .run-el.infos {
                        position: absolute;
                        z-index: 1;
                        left: 50%;
                        opacity: 0;
                        transform: translateX(-50%) scale(0.5);
                        transition: 0.5s $transitionBounce;
                        ul {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;
                            li {
                                margin-left: 8px;
                                margin-right: 8px;
                                > .before {
                                    left: 2px;
                                }
                                > .after {
                                    right: 2px;
                                }
                            }
                        }
                    }
                    .run-el.character {
                        margin-right: 0px;
                        transform: translateY(0px) scale(1.00);
                        transition: 0.5s $transitionBounce;
                        pointer-events: none;
                    }
                }
                &:hover {
                    cursor: pointer;
                    .run-content {
                        .run-el.infos {
                            opacity: 1;
                            transform: translateX(-50%) scale(1);
                        }
                        .run-el.character {
                            opacity: 0;
                            transform: translateY(0px) scale(0.5);
                            pointer-events: none;
                        }
                    }
                }
                &.selected {
                    transform: rotate(360deg);
                    .run-content {
                        .run-el.character {
                            opacity: 1;
                            filter: grayscale(100) brightness(100%) contrast(1) invert(1);
                            transform: translateY(0px) scale(0.8);
                        }
                    }
                    &:hover {
                        .run-content {
                            .run-el.infos {
                                opacity: 0;
                                transform: translateX(-50%) scale(0.5);
                                pointer-events: none;
                            }
                            .run-el.character {
                                opacity: 1;
                                transform: translateY(0px) scale(0.8);
                            }
                        }
                    }
                }
            }
        }
        .trash-empty {
            position: absolute;
            left: 0px;
            top: 0px;
            z-index: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            .message {
                color: $paper-white;
                font-size: 40px;
                font-weight: bold;
            }
        }
    }
}
</style>