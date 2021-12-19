<template>
    <div class="chart">
      <apexchart
        width="700"
        :height="height ? height : '330'"
        type="line"
        :options="floorChartOptions"
        :series="floorChartSeries"
        @click="floorChartClick"
      ></apexchart>
    </div>
</template>

<script>
export default {
  name: "RunFloorsChart",
  props: {
      floorsProp: Array,
      height: String
  },
  computed: {
    floors() {
        return this.floorsProp ? this.floorsProp : []
    },
    floorsNames() {
        return this.floors.map(floor => `${this.$t(`stages.${floor.name === 'Hush' ? 'Blue Womb' : floor.name.replace(/[0-9]/g, '').trim()}.name`)}${!isNaN(parseInt(floor.name.match(/\d/g))) ? ` ${parseInt(floor.name.match(/\d/g))}` : ''}`)
    },
    floorsItems() {
        return this.floors.map(floor => floor.itemsCollected ? floor.itemsCollected.reduce((acc, cur) => cur.number === 0 ? acc + 1 : acc + cur.number, 0) : 0)
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
                opposite: false,
                labels: {
                  style: {
                    fontSize: '16px'
                  }
                },
                axisBorder: {
                    show: true,
                    color: '#362F2D',
                    offsetX: 0,
                    offsetY: 0,
                    width: 4
                },
                axisTicks: {
                    show: true,
                    borderType: 'solid',
                    color: '#362F2D',
                    width: 6,
                    offsetX: -2,
                    offsetY: 0
                }
              },
              {
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
            ]
        }
    },
    floorChartSeries() {
        return [
            {
                name: this.$tc('dictionary.item', 2),
                type: 'line',
                data: this.floorsItems
            },
            {
                name: this.$tc('dictionary.room', 2),
                type: 'line',
                data: this.floorsRoom
            },
            {
                name: this.$tc('dictionary.enemy', 2),
                type: 'column',
                data: this.floorsEnnemies
            }
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