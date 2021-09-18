<template>
  <div class="home">
    <!-- <div>available : {{updateAvailable}}</div>
    <div>downloaded : {{updateDownloaded}}</div>
    <div>status : {{updateStatus}}</div> -->
    <UpdateApp/>
    <WinStreak/>
    <Runs/>
    <BrokenRuns/>
    <EditRun/>
    <ConfigScreen/>
  </div>
</template>

<script>
//import moment from 'moment'
import UpdateApp from '../components/Pops/UpdateApp.vue'
import WinStreak from '../components/WinStreak/WinStreak.vue'
import Runs from '../components/Runs.vue'
import BrokenRuns from '../components/Pops/BrokenRuns.vue'
import EditRun from '../components/Pops/EditRun.vue'
import ConfigScreen from '../components/Pops/ConfigScreen.vue'
export default {
  components: {
    UpdateApp,
    WinStreak,
    Runs,
    BrokenRuns,
    EditRun,
    ConfigScreen
  },
  name: "Home",
  data() {
    return {
    }
  },
  async created() {
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  }
};
</script>
<style lang="scss">
  .home {
    max-width: 1600px;
    margin: auto;
  }
</style>
