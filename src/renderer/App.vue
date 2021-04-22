<template>
  <div id="app">
    <Taskbar :app-version="appVersion"/>
    <!-- <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link> -->
    <div class="main">
        <div v-if="updateAvailable">{{updateAvailable}}</div>
        <div v-if="updateDownloaded">{{updateDownloaded}}</div>
        <transition name="fade">
          <div class="overlay-watch-status" v-if="!watchStatus || loading">
              <div class="image-1 animated" :style="{backgroundImage:loadingImage1}"></div>
              <div class="image-2 animated" :style="{backgroundImage:loadingImage2}"></div>
          </div>
        </transition>
        <router-view />
    </div>
  </div>
</template>

<script>
import Taskbar from './components/Taskbar.vue'
import { mapRepos } from '@vuex-orm/core'
const loadingImagesStringTemplate = "url('img/loadimages/loadimages-#.png')"
export default {
  name: 'App',
  components: {
    Taskbar
  },
  data() {
    return {
      appVersion: null,
      updateAvailable: false,
      updateDownloaded: false,
      watchStatus: false,
      loading: false,
      loadingSignature: null,
      loadingImage1: "url('img/loadimages/loadimages-001.png')",
      loadingImage2: "url('img/loadimages/loadimages-002_2.png')"
    }
  },
  computed: mapRepos({
  }),
  mounted () {
    this.randomLoadingImages()

    window.ipc.send('IS_APP_READY')
    window.ipc.on('SYNC_WATCH_STATUS', (response) => {
        console.log(response)
        if(response.watching === false) this.randomLoadingImages()
        this.watchStatus = response.watching
    })

    //Get app version
    if (!this.appVersion) window.ipc.send('APP_VERSION');
    window.ipc.on('APP_VERSION', (response) => {
      this.appVersion = response.appVersion
    })

    window.ipc.on('UPDATE_AVAILABLE', () => {
      console.log("app update available")
      this.updateAvailable = true
    })
    window.ipc.on('UPDATE_DOWNLOADED', (response) => {
      console.log("app update downloaded", response)
      this.updateDownloaded = true
    })
  },
  methods: {
    restartApp() {
      window.ipc.send('RESTART_APP')
    },
    randomLoadingImages() {
      //Random images for loader
      let nb = Math.floor(Math.random()*(56-1+1)+1);
      if (nb < 10) nb = `00${nb}`
      else if (nb < 100) nb = `0${nb}`
      this.loadingImage1 = loadingImagesStringTemplate.replace('#', nb)
      this.loadingImage2 = loadingImagesStringTemplate.replace('#', `${nb}_2`)
    }
  }
}
</script>

<style lang="scss">
  @import "assets/styles/scss/vars/_animations";
  @import "assets/styles/scss/vars/_colors";
  @import "assets/styles/scss/vars/_fonts";

  html {
    font-family: "Baby Doll", sans-serif;
    text-align: center;
    color: $text-dark;
    background-color: $paper-white-dark;
    overflow: hidden;
    body {
      padding: 0;
      padding-top: 45px;
      margin: 0;
      background-color: $paper-white-dark;
      background-image: url("../../public/img/emptyscreen.png");
      background-repeat: no-repeat;
      background-size: cover;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      &::before {
        pointer-events: none;
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0px;
        top: 0px;
        background-image: url("../../public/img/menuoverlay.png");
        background-repeat: no-repeat;
        background-size: cover;
        z-index: 100;
      }
      &::after {
        pointer-events: none;
        content: "";
        position: absolute;
        width: 800px;
        height: 800px;
        left: 0px;
        bottom: 0px;
        background-image: url("../../public/img/menushadow.png");
        background-repeat: no-repeat;
        background-size: contain;
        background-position: bottom;
        z-index: 100;
      }
      #app {
        width: 100%;
        height: 100%;
        .main {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
      }
    }
  }

  //Reset
  * {
    box-sizing: border-box;
    image-rendering: pixelated;
    & ul {
      padding: 0;
      margin: 0;
    }
    & li {
      list-style: none;
    }
  }

  //Scrollbar styling
  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;
  }
  ::-webkit-scrollbar-track {
    margin-bottom: 8px;
  }
  ::-webkit-scrollbar-thumb {
    min-height: 40px;
    background-color: $dark-background;
    outline: 2px solid $darker-background;
    outline-offset: -6px;
    &:hover {
      outline: 3px solid $darker-background;
      outline-offset: -4px;
    }
  }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-track {
    border: 4px solid transparent;
    background-clip: padding-box;
    border-radius: 0px;
  }
  ::-webkit-scrollbar-track {
    background-color: $darker-background;
  }
  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  //Overlay watch status
  .overlay-watch-status {
    display: none;
    background: black;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0px;
    z-index: 800;
    .image-1, .image-2 {
      position: absolute;
      left: 0px;
      top: 0px;
      height: 100%;
      width: 100%;
      background-repeat: no-repeat;
      background-position: center;
      transform: scale(4);
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
    &.fade-enter-active, &.fade-leave-active {
      transition: opacity .5s;
    }
    &.fade-enter, &.fade-leave-to {
      opacity: 0;
    }
  }
</style>
