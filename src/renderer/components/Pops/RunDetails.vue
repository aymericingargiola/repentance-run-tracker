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
              type="line"
              :options="floorChartOptions"
              :series="floorChartSeries"
              @click="floorChartClick"
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
    floorsRoom() {
        return this.floors.map(floor => floor.rooms ? floor.rooms.length : 0)
    },
    floorChartOptions() {
        return {
            colors: ['#E29300', '#362F2D', '#9E0C0C'],
            tooltip: {
              enabled: true
            },
            chart: {
                id: "items",
                height: 350,
                fontFamily: 'BabyDollv2, sans-serif',
                type: 'line',
                zoom: {
                  enabled: false
                },
                selection: {
                  enabled: false
                },
            },
            plotOptions: {
              bar: {
                borderRadius: 10,
              }
            },
            stroke: {
              lineCap: 'round',
              curve: 'smooth'
            },
            labels: this.floorsNames,
            xaxis: {
                tooltip: {
                  enabled: false
                },
                labels: {
                  rotate: -45,
                  rotateAlways: true,
                  trim: true,
                  minHeight: 120,
                },
                type: 'category',
                axisBorder: {
                    show: true,
                    color: '#78909C',
                    offsetX: 0,
                    offsetY: 0
                },
                axisTicks: {
                    show: false,
                    borderType: 'solid',
                    color: '#78909C',
                    width: 6,
                    offsetX: 0,
                    offsetY: 0
                },
            },
            yaxis: [
              {
                decimalsInFloat: false,
                opposite: true,
                axisBorder: {
                    show: true,
                    color: '#E29300',
                    offsetX: 0,
                    offsetY: 0
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#78909C',
                    width: 6,
                    offsetX: 0,
                    offsetY: 0
                }
              },
              {
                opposite: true,
                axisBorder: {
                    show: true,
                    color: '#362F2D',
                    offsetX: 0,
                    offsetY: 0
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#78909C',
                    width: 6,
                    offsetX: 0,
                    offsetY: 0
                }
              },
              {
                opposite: false,
                axisBorder: {
                    show: true,
                    color: '#9E0C0C',
                    offsetX: 0,
                    offsetY: 0
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#78909C',
                    width: 6,
                    offsetX: 0,
                    offsetY: 0
                }
              },
            ]
        }
    },
    floorChartSeries() {
        return [
            {
                name: 'Items',
                type: 'line',
                data: this.floorsItems
            },
            {
                name: 'Rooms',
                type: 'line',
                data: this.floorsRoom
            },
            {
                name: 'Ennemies',
                type: 'column',
                data: this.floorsEnnemies
            }
        ]
    }
  },
  methods: {
    openOrCloseRunDetails() {
      this.$root.$emit("OPEN_RUNDETAILS")
    },
    floorChartClick(event, chartContext, config) {
        console.log(event, chartContext, config)
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
</style>