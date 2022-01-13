<template>
  <div class="home">
    <!-- <div>available : {{updateAvailable}}</div>
    <div>downloaded : {{updateDownloaded}}</div>
    <div>status : {{updateStatus}}</div> -->
    <UpdateApp/>
    <WinStreak/>
    <Trash/>
    <Runs/>
    <BrokenRuns/>
    <EditRun/>
    <RunDetails/>
    <ConfigScreen/>
    <AppError/>
  </div>
</template>

<script>
//import moment from 'moment'
import UpdateApp from '../components/Pops/UpdateApp.vue'
import WinStreak from '../components/WinStreak/WinStreak.vue'
import Runs from '../components/Runs.vue'
import BrokenRuns from '../components/Pops/BrokenRuns.vue'
import EditRun from '../components/Pops/EditRun.vue'
import RunDetails from '../components/RunsDetails/RunDetails.vue'
import ConfigScreen from '../components/Pops/ConfigScreen.vue'
import Trash from '../components/Trash/Trash.vue'
import AppError from '../components/Pops/AppError.vue'
export default {
  components: {
    UpdateApp,
    WinStreak,
    Runs,
    BrokenRuns,
    EditRun,
    RunDetails,
    ConfigScreen,
    Trash,
    AppError
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
