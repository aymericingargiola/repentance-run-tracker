<template>
    <transition name="open">
        <div v-if="isOpen" class="config-popup edit-run-popup">
            <div class="overlay" v-on:click="openOrCloseEditRun()"></div>
            <div class="config-items edit-run">
                <div class="mid" :style="{backgroundImage:`url('img/cards/big-frame.png')`}"></div>
                <div class="content">
                    <div class="heading">Edit Run</div>
                    <div class="config-item">
                        <div class="title">Run title</div>
                        <input type="texte" v-model="customName" @change="updateCustomName">
                    </div>
                    <div class="config-item">
                        <div class="title">Run duration</div>
                        <vue-timepicker v-model="runDuration" @change="updateRunDuration" format="HH:mm:ss"></vue-timepicker>
                    </div>
                    <div class="config-item">
                        <div class="title">Video link</div>
                        <input type="texte" v-model="videoLink" @change="updateVideoLink">
                    </div>
                    <div class="config-item">
                        <div class="title">Video Highlights</div>
                        <Tags :tags="videoHighlights" :type="'time'" :video-link="videoLink" @addItem="addVideoHighlight" @removeItem="removeVideoHighlight"></Tags>
                    </div>
                    <div class="config-item">
                        <div class="title">Tags</div>
                        <Tags :disabled="true" :type="'string'" @addItem="addTag" @removeItem="removeTag"></Tags>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
import Tags from '../Tools/Tags.vue'
export default {
    name: "EditRun",
    components: {
        Tags
    },
    data() {
        return {
            isOpen: false,
            id: null
        }
    },
    mounted() {
        this.$root.$on('OPEN_EDITRUN', (id) => {
            if(id) this.id = id
            this.isOpen = !this.isOpen
        })
    },
    watch: {
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        currentRun() {
            return this.runRepo.query().where('id', this.id).first()
        },
        customName: {
            get: function() {
                return this.currentRun.customName
            },
            set: function (value) {
                this.runRepo.update({ id: this.currentRun.id, customName: value })
            }
        },
        runDuration: {
            get: function() {
                return this.currentRun.runDuration
            },
            set: function (value) {
                this.runRepo.update({ id: this.currentRun.id, runDuration: value })
            }
        },
        videoLink: {
            get: function() {
                return this.currentRun.videoLink
            },
            set: function (value) {
                this.runRepo.update({ id: this.currentRun.id, videoLink: value })
            }
        },
        videoHighlights: {
            get: function() {
                return this.currentRun.videoHighlights
            },
            set: function (value) {
                this.runRepo.update({ id: this.currentRun.id, videoHighlights: value })
            }
        },
        tags: {
            get: function() {
                return this.currentRun.tags
            },
            set: function (value) {
                this.runRepo.update({ id: this.currentRun.id, tags: value })
            }
        }
    },
    methods: {
        openOrCloseEditRun() {
            this.$root.$emit('OPEN_EDITRUN')
        },
        updateCustomName(e) {
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'customName', value: e.target.value })
        },
        updateRunDuration(e) {
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'runDuration', value: e.displayTime })
        },
        updateVideoLink(e) {
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'videoLink', value: e.target.value })
        },
        addVideoHighlight(value) {
            this.videoHighlights = value
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'videoHighlights', value: value })
        },
        removeVideoHighlight(value) {
            this.videoHighlights = value
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'videoHighlights', value: value })
        },
        addTag(value) {
            this.tags = value
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'tags', value: value })
        },
        removeTag(value) {
            this.tags = value
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'tags', value: value })
        }
    },
}
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
// .edit-run-popup {
//     position: fixed;
//     top: 30px;
//     width: 100%;
//     height: calc(100% - 30px);
//     z-index: 2;
//     padding: 48px;
//     > .overlay {
//         content: "";
//         position: absolute;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: transparent;
//         z-index: 0;
//     }
//     &.open-enter-active, &.open-leave-active {
//         transition: .2s;
//     }
//     &.open-enter, &.open-leave-to {
//         opacity: 0;
//         transform: scale(0.95) translateY(100%) scaleX(0.20);
//     }
//     .edit-run {
//         position: relative;
//         z-index: 1;
//         height: 100%;
//         > .mid {
//             z-index: 0;
//             position: absolute;
//             background-repeat: no-repeat;
//             background-size: 100% 100%;
//             pointer-events: none;
//         }
//         > .mid {
//             height: 100%;
//             width: 100%;
//             left: 0px;
//             top: 0px;
//             background-repeat: no-repeat;
//         }
//         .content {
//             height: 100%;
//             overflow: auto;
//             position: relative;
//             z-index: 1;
//             padding: 36px 36px 56px 28px;
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//         }
//         .heading {
//             font-size: 80px;
//             font-weight: bold;
//             margin-bottom: 28px;
//         }
//         .config-item {
//             display: flex;
//             flex-wrap: wrap;
//             justify-content: center;
//             width: 100%;
//             .title {
//                 margin-right: 12px;
//                 pointer-events: none;
//             }
//             .hint {
//                 width: 100%;
//                 font-size: 12px;
//                 transition: 0.25s ease;
//                 transform: scale(0.8);
//                 opacity: 0;
//                 pointer-events: none;
//                 min-height: 12px;
//             }
//             &:not(:first-child) {
//                 margin-top: 16px;
//             }
//             &:hover {
//                 .hint {
//                     opacity: 0.8;
//                     transform: scale(1);
//                 }
//             }
//         }
//     }
// }
</style>