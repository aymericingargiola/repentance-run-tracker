<template>
  <div id="app">
    <Taskbar
      :app-version="appVersion"
      :watch-status="watchStatus"
    />
    <!-- <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link> -->
    <div class="main">
      <transition name="fade">
        <div
          v-if="repoToLoad > repoLoaded"
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
import Run from './store/classes/Run'
import TrashRun from './store/classes/TrashRun'
import Tag from './store/classes/Tag'
import WinStreak from './store/classes/WinStreak'
import Entity from './store/classes/Entity'
import Floor from './store/classes/Floor'
import Character from './store/classes/Character'
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
      repoToLoad: 8,
      repoLoaded: 0,
      loadingSignature: null,
      loadingImage1: "url('img/loadimages/loadimages-001.png')",
      loadingImage2: "url('img/loadimages/loadimages-002_2.png')",
      errors: []
    }
  },
  computed: {
    ...mapRepos({
        configRepo: Config,
        runRepo: Run,
        trashRunRepo: TrashRun,
        tagRepo: Tag,
        winStreakRepo: WinStreak,
        entityRepo: Entity,
        floorRepo: Floor,
        characterRepo: Character
    })
  },
  mounted() {
    this.randomLoadingImages()

    window.ipc.send('IS_APP_READY')
    window.ipc.on('SYNC_WATCH_STATUS', (response) => {
      console.log(response)
      this.watchStatus = response.watching
    })

    window.ipc.send('APP_VERSION');
    window.ipc.on('APP_VERSION', (response) => {
      this.appVersion = response.appVersion
    })

    window.ipc.send('ASK_RUNS')
    window.ipc.on('SYNC_SEND_RUNS', (response) => {
        this.runRepo.fresh(response.runs)
        this.repoLoaded += 1
    })

    window.ipc.send('ASK_TRASH')
    window.ipc.on('SYNC_SEND_TRASH', (response) => {
        this.trashRunRepo.fresh(response.trash)
        this.repoLoaded += 1
    })

    window.ipc.send('ASK_CONFIG')
    window.ipc.on('SYNC_SEND_CONFIG', (response) => {
        this.configRepo.fresh(response.config.sort((a, b) => a.order - b.order))
        const currentLang = response.config.filter(cfg => cfg.id === 'languages')[0].value
        this.$i18n.locale = currentLang
        document.documentElement.setAttribute('lang', currentLang)
        this.repoLoaded += 1
    })

    window.ipc.send('ASK_TAGS')
    window.ipc.on('SYNC_SEND_TAGS', (response) => {
        this.tagRepo.fresh(response.tags)
        this.repoLoaded += 1
    })

    window.ipc.send('ASK_WINSTREAKS')
    window.ipc.on('SYNC_SEND_WINSTREAKS', (response) => {
        this.winStreakRepo.fresh(response.winStreaks)
        this.repoLoaded += 1
    })

    window.ipc.send('ASK_ENTITIES')
    window.ipc.on('SYNC_SEND_ENTITIES', (response) => {
        this.entityRepo.fresh(response.entities)
        this.repoLoaded += 1
    })

    window.ipc.send('ASK_FLOORS')
    window.ipc.on('SYNC_SEND_FLOORS', (response) => {
        this.floorRepo.fresh(response.floors)
        this.repoLoaded += 1
    })
    
    window.ipc.send('ASK_CHARACTERS')
    window.ipc.on('SYNC_SEND_CHARACTERS', (response) => {
        this.characterRepo.fresh(response.characters)
        this.repoLoaded += 1
    })

    window.ipc.on('SYNC_SEND_APP_ERROR', (response) => {
        console.log("new error", response)
        if(!this.errors.includes(response.error.stack)) this.errors.push(response.error.stack)
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
    // display: none;
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
