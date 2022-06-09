<template>
  <div id="app">
    <Taskbar :app-version="appVersion" />
    <!-- <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link> -->
    <div class="main">
      <transition name="fade">
        <div
          v-if="!watchStatus || loading"
          class="overlay-watch-status"
        >
          <div
            class="image-1 animated"
            :style="{backgroundImage:loadingImage1}"
          />
          <div
            class="image-2 animated"
            :style="{backgroundImage:loadingImage2}"
          />
        </div>
      </transition>
      <router-view />
    </div>
  </div>
</template>

<script>
import Taskbar from './components/Taskbar.vue'
import { mapRepos } from '@vuex-orm/core'
import Config from './store/classes/Config'
const loadingImagesStringTemplate = "url('img/loadimages/loadimages-#.png')"
export default {
  name: 'App',
  components: {
    Taskbar
  },
  data() {
    return {
      appVersion: null,
      watchStatus: false,
      loading: false,
      loadingSignature: null,
      loadingImage1: "url('img/loadimages/loadimages-001.png')",
      loadingImage2: "url('img/loadimages/loadimages-002_2.png')"
    }
  },
  computed: {
    ...mapRepos({
        configRepo: Config
    })
  },
  mounted() {
    this.randomLoadingImages()

    if (!this.watchStatus) window.ipc.send('IS_APP_READY')
    window.ipc.on('SYNC_WATCH_STATUS', (response) => {
        console.log(response)
        if(response.watching === false) this.randomLoadingImages()
        this.watchStatus = response.watching
    })

    if (!this.appVersion) window.ipc.send('APP_VERSION');
    window.ipc.on('APP_VERSION', (response) => {
      console.log(response)
      this.appVersion = response.appVersion
    })
  },
  methods: {
    restartApp() {
      window.ipc.send('RESTART_APP')
    },
    randomLoadingImages() {
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
  @import "assets/styles/scss/default";
  @import "assets/styles/scss/small-portrait";
  @import "assets/styles/scss/overwrite/vuetimepicker";
  @import "assets/styles/scss/overwrite/vcalendar";
  @import "assets/styles/scss/overwrite/apexcharts";

  html {
    font-family: "BabyDollv2", sans-serif;
    text-align: center;
    color: $text-dark;
    background-color: $paper-white-dark;
    overflow: hidden;
    body {
      padding: 0;
      padding-top: 30px;
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
      // &::after {
      //   pointer-events: none;
      //   content: "";
      //   position: absolute;
      //   width: 800px;
      //   height: 800px;
      //   left: 0px;
      //   bottom: 0px;
      //   background-image: url("../../public/img/menushadow.png");
      //   background-repeat: no-repeat;
      //   background-size: contain;
      //   background-position: bottom;
      //   z-index: 100;
      // }
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
  }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
