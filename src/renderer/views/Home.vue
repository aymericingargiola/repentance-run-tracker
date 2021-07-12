<template>
  <div class="home">
    <Runs/>
    <BrokenRuns/>
    <EditRun/>
    <ConfigScreen/>
  </div>
</template>

<script>
//import moment from 'moment'
import Runs from '../components/Runs.vue'
import BrokenRuns from '../components/Pops/BrokenRuns.vue'
import EditRun from '../components/Pops/EditRun.vue'
import ConfigScreen from '../components/Pops/ConfigScreen.vue'
export default {
  components: {
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
