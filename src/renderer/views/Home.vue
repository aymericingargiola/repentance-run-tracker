<template>
  <div class="home">
    <AskRemoveRuns/>
    <Runs/>
  </div>
</template>

<script>
//import moment from 'moment'
import Runs from '../components/Runs.vue'
import AskRemoveRuns from '../components/Pops/AskRemoveRuns.vue'
export default {
  components: {
    Runs,
    AskRemoveRuns
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
