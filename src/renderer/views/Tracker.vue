<template>
  <div class="tracker">
      <ColorPicker
      v-if="showPicker && getLiveTrackerBackground"
      :color="color"
      :onStartChange="color => onChange(color, 'start')"
      :onChange="color => onChange(color, 'change')"
      :onEndChange="color => onChange(color, 'end')"
      :style="{top:`${this.top}px`,left:`${this.left}px`}"
      />
      <div v-if="getLiveTrackerBackground" :class="['background', showPicker ? 'on-top' : '']" :style="{backgroundColor:`rgba(${showPicker ? color.red : getLiveTrackerBackground.value.red},${showPicker ? color.green : getLiveTrackerBackground.value.green},${showPicker ? color.blue : getLiveTrackerBackground.value.blue},${showPicker ? color.alpha : getLiveTrackerBackground.value.alpha})`}" @click="changeShowPickerState($event)"></div>
      TEST
      {{getLiveTrackerBackground}}
  </div>
</template>

<script>
//import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Config from '../store/classes/Config'
export default {
  components: {
  },
  name: "Tracker",
  data() {
    return {
      showPicker: false,
      color: {red: 0,green: 255,blue: 0,alpha: 1},
      top: 0,
      left: 0
    }
  },
  async created() {
  },
  mounted() {
    window.ipc.send('ASK_CONFIG', ({window:"liveTracker"}))
    window.ipc.on('SYNC_SEND_CONFIG', (response) => {
        console.log(response)
        this.configRepo.fresh(response.config)
    })
  },
  computed: {
    ...mapRepos({
        configRepo: Config
    }),
    getLiveTrackerBackground() {
        return this.configRepo.find('liveTrackerBackgroundColor')
    }
  },
  methods: {
    saveConfig(config) {
        window?.ipc?.send('USER_UPDATE_CONFIG', config)
    },
    updateLiveTrackerBackground(config) {
        this.configRepo.update({id: config.id, value: config.value})
    },
    onChange(attrs, name) {
      this.color = { ...attrs }
      if (name === 'end') {
        const config = {id: 'liveTrackerBackgroundColor', value: this.color}
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
.taskbar {
    display: none;
}
.tracker {
  width: 100%;
  height: 100%;
  position: relative;
  .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
}

// Color picker
.ui-color-picker {
  position: absolute;
  z-index: 1;
  border-radius: 10px;
  .picker-area {
    padding-top: 16px;
  }
  .input {
    font-family: inherit;
  }
}
</style>
