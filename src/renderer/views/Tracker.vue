<template>
  <div class="tracker" @contextmenu="handler($event)">
      <ColorPicker
      v-if="showPicker && getLiveTrackerBackground"
      :color="color"
      :onStartChange="color => onChange(color, 'start')"
      :onChange="color => onChange(color, 'change')"
      :onEndChange="color => onChange(color, 'end')"
      :style="{top:`${this.top}px`,left:`${this.left}px`}"
      />
      <div v-if="getLiveTrackerBackground" :class="['background', showPicker ? 'on-top' : '']" :style="{backgroundColor:`rgba(${showPicker ? color.red : getLiveTrackerBackground.value.red},${showPicker ? color.green : getLiveTrackerBackground.value.green},${showPicker ? color.blue : getLiveTrackerBackground.value.blue},${showPicker ? color.alpha : getLiveTrackerBackground.value.alpha})`}"></div>
      <ul v-if="currentRun" class="current-run">
        <template v-for="(floor, fidx) in currentRun.floors">
          <li class="floor" :key="floor.id + fidx">
            <div class="top-info">
                <div class="icon floor" :style="{backgroundImage:`url('img/icons/floors/${floor.group}.png')`}"></div>
                <div v-if="floor.curse" class="icon curse" :style="{backgroundImage:`url('img/icons/curses/${floor.curse}.png')`}"></div>
            </div>
          </li>
          <template v-for="(item, itdx) in floor.itemsCollected">
            <li v-if="!hideActiveItems || !hideActiveItems.value || (hideActiveItems.value && item.itemType != 'Active')" class="item" :key="item.id + itdx">
              <a class="item-image" :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`" target="_blank">
                  <img :src="`img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`">
              </a>
            </li>
          </template>
        </template>
      </ul>
  </div>
</template>

<script>
//import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Config from '../store/classes/Config'
import Run from '../store/classes/Run'
export default {
  components: {
  },
  name: "Tracker",
  data() {
    return {
      filterOrder: 'desc',
      showPicker: false,
      color: {red: 0,green: 255,blue: 0,alpha: 1},
      top: 0,
      left: 0
    }
  },
  async created() {
  },
  mounted() {
    window.ipc.send('ASK_CONFIG', ({window:"itemTracker"}))
    window.ipc.on('SYNC_SEND_CONFIG', (response) => {
        console.log(response)
        this.configRepo.fresh(response.config)
    }),
    window.ipc.send('ASK_RUNS', ({window:"itemTracker"}))
    window.ipc.on('SYNC_SEND_RUNS', (response) => {
        console.log(response)
        this.runRepo.fresh(response.runs)
    }),
    window.ipc.on('SYNC_CREATE_RUN', (response) => {
        console.log(response)
        this.runRepo.insert(response.run)
    }),
    window.ipc.on('SYNC_UPDATE_RUN', (response) => {
        console.log(response)
        this.updateRun = response.run
    })
    window.ipc.on('SYNC_REMOVE_RUN', (response) => {
        console.log(response)
        this.runRepo.destroy(response.run)
    })
  },
  computed: {
    ...mapRepos({
        configRepo: Config,
        runRepo: Run
    }),
    getLiveTrackerBackground() {
        return this.configRepo.find('itemTrackerBackgroundColor')
    },
    currentRun() {
        return this.runRepo.orderBy('runUpdate', this.filterOrder).first()
    },
    hideActiveItems() {
        return this.configRepo.find('hideActiveItems')
    },
    updateRun: {
        get: function(run) {
            return this.runRepo.query().where('id', run.id).get()
        },
        set: function (run) {
            this.runRepo.update(run)
        }
    }
  },
  methods: {
    handler(e) {
        e.preventDefault()
        this.changeShowPickerState(e)
    },
    saveConfig(config) {
        window?.ipc?.send('USER_UPDATE_CONFIG', config)
    },
    updateLiveTrackerBackground(config) {
        this.configRepo.update({id: config.id, value: config.value})
    },
    onChange(attrs, name) {
      this.color = { ...attrs }
      if (name === 'end') {
        const config = {id: 'itemTrackerBackgroundColor', value: this.color}
        this.updateLiveTrackerBackground(config)
        this.saveConfig(config)
      }
    },
    changeShowPickerState(e) {
      console.log(e)
      this.left = !this.showPicker ? e.clientX : this.left
      this.top = !this.showPicker ? e.clientY : this.top
      this.color = this.getLiveTrackerBackground && !this.showPicker ? this.getLiveTrackerBackground.value : this.color
      this.showPicker = !this.showPicker
    }
  }
};
</script>

<style lang="scss">
html {
  body {
    padding-top: 0px;
    background-image: unset;
    &::before, &::after {
      display: none;
    }
  }
}
.main {
  overflow: auto !important;
}
.taskbar {
    display: none;
}
.tracker {
  width: 100%;
  height: 100%;
  position: relative;
  outline: 5px dashed;
  .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
}

.current-run {
  position: relative;
  width: 100%;
}

// Color picker
.ui-color-picker {
  position: absolute;
  z-index: 1;
  border-radius: 10px;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(3px);
  box-shadow: 0px 0px 10px rgba(0,0,0,0.3);

  .picker-area {
    padding-top: 16px;
  }
  .input {
    font-family: inherit;
  }
}
</style>
