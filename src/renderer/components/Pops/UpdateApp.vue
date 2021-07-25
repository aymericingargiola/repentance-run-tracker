<template>
    <transition name="fade">
        <div v-if="updateDownloaded" class="pop-up update-app" @click="update">
            <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
            <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
            <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
            <div class="title">Update available, click here to update</div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "UpdateApp",
    data() {
        return {
            updateDownloaded: false,
        }
    },
    mounted() {
        window.ipc.on('UPDATE_DOWNLOADED', () => {
            this.updateDownloaded = true
        })
    },
    computed: {
    },
    methods: {
        update() {
            this.clicked = true
            window?.ipc?.send('RESTART_APP')
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
    max-width: 200px;
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