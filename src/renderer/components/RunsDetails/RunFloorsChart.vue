<template>
  <div class="chart">
    <apexchart
      width="700"
      :height="height ? height : '380'"
      type="line"
      :options="floorChartOptions"
      :series="floorChartSeries"
      @click="floorChartClick"
    />
  </div>
</template>

<script>
export default {
  name: "RunFloorsChart",
  props: {
      startStates: Object,
      floorsProp: Array,
      height: String
  },
  computed: {
    floors() {
        return this.floorsProp ? this.floorsProp : []
    },
    floorsNames() {
        return ["Start", ...this.floors.map(floor => `${this.$t(`stages.${floor.name === 'Hush' ? 'Blue Womb' : floor.name.replace(/[0-9]/g, '').trim()}.name`)}${!isNaN(parseInt(floor.name.match(/\d/g))) ? ` ${parseInt(floor.name.match(/\d/g))}` : ''}`)]
    },
    floorsItems() {
        return [0, ...this.floors.map(floor => floor.itemsCollected ? floor.itemsCollected.reduce((acc, cur) => cur.number === 0 ? acc + 1 : acc + cur.number, 0) : 0)]
    },
    floorsEnnemies() {
        return [0, ...this.floors.map(floor => floor.entities ? floor.entities.reduce((acc, cur) => acc + cur.number, 0) : 0)]
    },
    floorsRoom() {
        return [0, ...this.floors.map(floor => floor.rooms ? floor.rooms.length : 0)]
    },
    floorsDamage() {
      return [this.startStates?.damage, ...this.floors.map(floor => floor.stats ? floor.stats.stats.damage : 0)]
    },
    floorsLuck() {
      return [this.startStates?.luck, ...this.floors.map(floor => floor.stats ? floor.stats.stats.luck : 0)]
    },
    floorsSpeed() {
      return [this.startStates?.moveSpeed, ...this.floors.map(floor => floor.stats ? floor.stats.stats.moveSpeed : 0)]
    },
    floorsTearRate() {
      return [this.startStates?.currentFireDelay, ...this.floors.map(floor => floor.stats ? floor.stats.stats.currentFireDelay : 0)]
    },
    floorChartOptions() {
        return {
            colors: ['#E29300', '#9E0C0C', '#32161F', '#57B301', '#775B59', '#74006E'],
            tooltip: {
              enabled: true,
              style: {
                fontSize: '16px'
              }
            },
            legend: {
              position: 'top',
            },
            chart: {
                id: "floors",
                fontFamily: 'BabyDollv2, sans-serif',
                type: 'line',
                zoom: {
                  enabled: false
                },
                toolbar: {
                  show: false
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
              curve: 'smooth',
              width: 5,
              dashArray: 0
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
                    show: false,
                    color: '#362F2D',
                    height: 1
                },
                axisTicks: {
                    show: false,
                    borderType: 'solid',
                    color: '#78909C',
                    width: 6
                },
            },
            yaxis: [
              {
                decimalsInFloat: false,
                opposite: false,
                labels: {
                  style: {
                    fontSize: '16px'
                  }
                },
                axisBorder: {
                    show: true,
                    color: '#E29300',
                    width: 4
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#362F2D',
                    width: 6,
                    offsetX: -2
                },
              },
              {
                decimalsInFloat: false,
                opposite: true,
                labels: {
                  style: {
                    fontSize: '16px'
                  }
                },
                axisBorder: {
                    show: true,
                    color: '#9E0C0C',
                    offsetX: 0,
                    offsetY: 0,
                    width: 4,
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#362F2D',
                    width: 6,
                    offsetX: 2,
                    offsetY: 0
                }
              },
              {
                decimalsInFloat: true,
                opposite: true,
                show: false,
                labels: {
                  style: {
                    fontSize: '16px'
                  }
                },
                axisBorder: {
                    show: true,
                    color: '#775B59',
                    offsetX: 0,
                    offsetY: 0,
                    width: 4
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#775B59',
                    width: 6,
                    offsetX: -2,
                    offsetY: 0
                }
              },
              {
                decimalsInFloat: true,
                opposite: true,
                show: false,
                labels: {
                  style: {
                    fontSize: '16px'
                  }
                },
                axisBorder: {
                    show: true,
                    color: '#57B301',
                    offsetX: 0,
                    offsetY: 0,
                    width: 4
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#57B301',
                    width: 6,
                    offsetX: -2,
                    offsetY: 0
                }
              },
            ]
        }
    },
    floorChartSeries() {
        return [
            {
                name: this.$tc('dictionary.item', 2),
                type: 'column',
                data: this.floorsItems
            },
            {
                name: this.$tc('dictionary.enemy', 2),
                type: 'column',
                data: this.floorsEnnemies
            },
            {
                name: this.$tc('dictionary.damage', 1),
                type: 'line',
                data: this.floorsDamage
            },
            {
                name: this.$tc('dictionary.luck', 1),
                type: 'line',
                data: this.floorsLuck
            },
            {
                name: this.$tc('dictionary.speed', 1),
                type: 'line',
                data: this.floorsSpeed
            },
            {
                name: this.$tc('dictionary.tearRate', 1),
                type: 'line',
                data: this.floorsTearRate
            },
        ]
    }
  },
  methods: {
    floorChartClick(event, chartContext, config) {
      this.$emit("selectedFloor", config.dataPointIndex)
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
</style>