<template>
    <transition name="fade">
        <div v-if="updateDownloaded || updateProgress" class="pop-up update-app" @click="update">
            <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
            <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"></div>
            <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"></div>
            <div v-if="updateProgress" class="title">{{$t('update.updateDownloading', { updateVersion: updateVersion, updateProgressInfos: Math.round(updateProgressInfos.percent) })}}
            </div>
            <div v-if="updateDownloaded" class="title">{{$t('update.updateDownloaded', { updateVersion: updateVersion })}}</div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "UpdateApp",
    data() {
        return {
            updateAvailable: false,
            updateAvailableInfos: null,
            updateProgress: false,
            updateProgressInfos: null,
            updateDownloaded: false,
            updateDownloadedInfos: null,
        }
    },
    mounted() {
        window.ipc.on('UPDATE_AVAILABLE', (infos) => {
            this.updateAvailable = true
            this.updateAvailableInfos = infos
        })
        window.ipc.on('UPDATE_PROGRESS', (progress) => {
            this.updateProgress = true
            this.updateProgressInfos = progress
        })
        window.ipc.on('UPDATE_DOWNLOADED', (infos) => {
            this.updateProgress = false
            this.updateDownloaded = true
            this.updateDownloadedInfos = infos
        })
    },
    computed: {
        updateVersion() {
            return this.updateAvailableInfos ? this.updateAvailableInfos.version : null
        },
        updateSize() {
            return this.updateAvailableInfos ? this.updateAvailableInfos.size : null
        },
        updateName() {
            return this.updateAvailableInfos ? this.updateAvailableInfos.releaseName : null
        },
        updateNotes() {
            return this.updateAvailableInfos ? this.updateAvailableInfos.releaseNotes : null
        }
    },
    methods: {
        update() {
            if (this.updateDownloaded) {
                window?.ipc?.send('RESTART_APP')
            }
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.pop-up.update-app {
    position: fixed;
    top: 40px;
    right: 30px;
    z-index: 10;
    width: 300px;
    cursor: pointer;
    padding: 8px 8px 16px 8px;
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
    .title {
        pointer-events: none;
        position: relative;
        z-index: 1;
    }
    &.fade-enter-active, &.fade-leave-active {
        transition: opacity .5s;
    }
    &.fade-enter, .fade-leave-to {
        opacity: 0;
    }
}
</style>