<template>
  <div class="taskbar">
    <div class="background" />
    <div class="drag" />
    <div class="logo">
      repentance run tracker 
      <div class="app-version">
        {{ appVersion }}
      </div>
      <div
        v-if="watchStatus"
        class="watch-status"
      >
        [watching game]
      </div>
    </div>
    <div class="menu center-menu" />
    <div
      v-if="$isElectron"
      class="menu right-menu"
    >
      <!-- <span class="action-btn item-tracker" v-on:click="openItemTracker()"></span> -->
      <span
        class="action-btn open-trash"
        @click="openOrCloseTrash()"
      />
      <span
        class="action-btn config"
        @click="openOrCloseSettings()"
      />
      <span
        class="action-btn minimize-app"
        @click="minimizeApp()"
      />
      <span
        class="action-btn fullscreen-app"
        @click="fullscreenApp()"
      />
      <span
        class="action-btn close-app"
        @click="closeApp()"
      />
    </div>
  </div>
</template>

<script>
export default {
    name: "Taskbar",
    props: {
        appVersion: String,
        watchStatus: Boolean
    },
    data() {
        return {
        }
    },
    computed: {
    },
    mounted() {
    },
    methods: {
        minimizeApp() {
            window?.ipc?.send('MINIMIZE_APP');
        },
        fullscreenApp() {
            window?.ipc?.send('FULLSCREEN_APP');
        },
        closeApp() {
            window?.ipc?.send('CLOSE_APP');
        },
        openOrCloseSettings() {
            this.$root.$emit('OPEN_SETTINGS')
        },
        openOrCloseTrash() {
            this.$root.$emit('OPEN_TRASH')
        },
        openItemTracker() {
            window?.ipc?.send('OPEN_ITEMTRACKER');
        }
    },
};
</script>

<style lang="scss">
@import "../assets/styles/scss/vars/_colors";
.taskbar {
    font-family: "Up Heaval", sans-serif;
    position: fixed;
    top: 0px;
    display: flex;
    width: 100%;
    height: 30px;
    color: $text-dark;
    align-items: center;
    pointer-events: none;
    justify-content: space-between;
    z-index: 1000;
    overflow: auto;
    * {
        -webkit-app-region: no-drag;
    }
    &::before {
        content: "";
        background-color: $paper-white;
        height: calc(100% - 9px);
        width: 100%;
        pointer-events: none;
        position: absolute;
        top: 0px;
        left: 0px;
    }
    .background {
        position: absolute;
        bottom: 0px;
        width: 100%;
        height: 9px;
        pointer-events: none;
        background-image: url("../../../public/img/taskbar-bottom.png");
        background-repeat: repeat-x;
        background-size: contain;
        background-position: top;
    }
    .drag {
        position: absolute;
        z-index: 10;
        -webkit-app-region: drag;
        left: 8px;
        top: 4px;
        width: calc(100% - 16px);
        height: calc(100% - 4px);
    }
    .logo {
        position: relative;
        z-index: 0;
        font-size: 14px;
        font-weight: bold;
        opacity: 1;
        padding: 0px 8px;
        letter-spacing: 3px;
        pointer-events: none;
        -webkit-app-region: drag;
        transform: translateY(-4px);
        .app-version {
            font-size: 10px;
            pointer-events: none;
            opacity: 0.5;
            z-index: 0;
            display: inline-block;
            height: 0px;
        }
        .watch-status {
            display: inline-block;
            font-size: 10px;
            margin-left: 8px;
            opacity: 0.5;
            letter-spacing: 2px;
            pointer-events: none;
            height: 0px;
        }
    }
    .menu {
        pointer-events: all;
        position: relative;
        z-index: 20;
        transform: translateY(-4px);
        &.center-menu {
            font-size: 12px;
            font-weight: bold;
            ul {
                list-style: none;
                padding: 0px;
                margin: 0px;
                display: flex;
                li {
                    &:not(:first-child) {
                        margin-left: 16px;
                    }
                }
            }
        }
        &.right-menu {
            display: flex;
            .action-btn {
                position: relative;
                display: block;
                width: 30px;
                height: 30px;
                cursor: pointer;
                padding: 5px;
                transition: 0.3s ease;
                &.close-app {
                    background-image: url("../../../public/img/icons/close.png");
                    background-repeat: no-repeat;
                    background-size: cover;
                    transform: scale(0.55);
                    &:hover {
                        opacity: 0.5;
                        transform: scale(0.65) rotate(-10deg);
                    }
                }
                &.fullscreen-app {
                    background-image: url("../../../public/img/icons/frame.png");
                    background-repeat: no-repeat;
                    background-size: cover;
                    transform: scale(0.55);
                    &:hover {
                        opacity: 0.5;
                        transform: scale(0.65) rotate(-10deg);
                    }
                }
                &.minimize-app {
                    background-image: url("../../../public/img/icons/minimize.png");
                    background-repeat: no-repeat;
                    background-size: cover;
                    transform: scale(0.55);
                    &:hover {
                        opacity: 0.5;
                        transform: scale(0.65) rotate(-10deg);
                    }
                }
                &.config {
                    background-image: url("../../../public/img/icons/config.png");
                    background-repeat: no-repeat;
                    background-size: cover;
                    transform: scale(0.55);
                    &:hover {
                        opacity: 0.5;
                        transform: scale(0.65) rotate(-10deg);
                    }
                }
                &.open-trash {
                    background-image: url("../../../public/img/icons/trash.png");
                    background-repeat: no-repeat;
                    background-size: cover;
                    transform: scale(0.55);
                    &:hover {
                        opacity: 0.5;
                        transform: scale(0.65) rotate(-10deg);
                    }
                }
                &.item-tracker {
                    background-image: url("../../../public/img/icons/play.png");
                    background-repeat: no-repeat;
                    background-size: cover;
                    transform: scale(0.55);
                    &:hover {
                        opacity: 0.5;
                        transform: scale(0.65) rotate(-10deg);
                    }
                }
                svg {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
}
</style>
