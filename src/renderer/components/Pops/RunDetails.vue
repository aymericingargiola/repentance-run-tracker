<template>
  <transition name="open">
    <div v-if="isOpen && this.runRepo" class="config-popup edit-run-popup">
      <div class="overlay" v-on:click="openOrCloseRunDetails()"></div>
      <div class="config-items edit-run">
        <div
          class="mid"
          :style="{ backgroundImage: `url('img/cards/big-frame.png')` }"
        ></div>
        <div class="content">
          <div class="heading">Infos</div>
          <div class="chart">
            <apexchart
              width="800"
              type="bar"
              :options="chartOptions"
              :series="chartSeries"
              @click="clickHandler"
            ></apexchart>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from "@vuex-orm/core";
import Run from "../../store/classes/Run";
export default {
  name: "RunDetails",
  components: {},
  data() {
    return {
      isOpen: false,
      id: null,
    };
  },
  mounted() {
    this.$root.$on("OPEN_RUNDETAILS", (id) => {
      console.log(id)
      if (id) this.id = id;
      this.isOpen = !this.isOpen;
    });
  },
  watch: {},
  computed: {
    ...mapRepos({
      runRepo: Run,
    }),
    currentRun() {
      return this.runRepo.query().where("id", this.id).first();
    },
    floors() {
        return this.currentRun && this.currentRun.floors ? this.currentRun.floors : []
    },
    floorsNames() {
        return this.floors.map(floor => floor.name)
    },
    floorsItems() {
        return this.floors.map(floor => floor.itemsCollected ? floor.itemsCollected.length : 0)
    },
    floorsEnnemies() {
        return this.floors.map(floor => floor.entities ? floor.entities.reduce((acc, cur) => acc + cur.number, 0) : 0)
    },
    chartOptions() {
        return {
            chart: {
                id: "items",
            },
            xaxis: {
                categories: this.floorsNames,
            }
        }
    },
    chartSeries() {
        return [
            {
                name: 'Items',
                data: this.floorsItems
            },
            {
                name: 'Ennemies',
                data: this.floorsEnnemies
            }
        ]
    }
  },
  methods: {
    openOrCloseRunDetails() {
      this.$root.$emit("OPEN_RUNDETAILS")
    },
    clickHandler(event, chartContext, config) {
        console.log(event, chartContext, config)
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
</style>