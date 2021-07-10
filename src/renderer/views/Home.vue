<template>
  <div class="home">
    <Runs/>
    <BrokenRuns/>
  </div>
</template>

<script>
//import moment from 'moment'
import Runs from '../components/Runs.vue'
import BrokenRuns from '../components/Pops/BrokenRuns.vue'
export default {
  components: {
    Runs,
    BrokenRuns
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
