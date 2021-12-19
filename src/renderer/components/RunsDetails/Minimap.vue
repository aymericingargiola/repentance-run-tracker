<template>
    <div class="minimap">
        <div class="wrapper" :ref="`minimap-${floor.name}`">
            <div type="row" first-row index="0">
                <div type="col" first-col index="0" room="" door-up="" door-down="" door-left="" door-right="">
                    <div class="background" :style="{backgroundImage:`url('${minimapImgsPath}1_UP0-RIGHT0-DOWN0-LEFT0.png')`}"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const minimapImgsPath = "img/icons/minimap/room parts/"
export default {
  name: "Minimap",
  props: {
      floor: Object,
  },
  data() {
    return {
      minimapImgsPath: minimapImgsPath,
    }
  },
  computed: {
    floorsRoom() {
        return this.floor?.rooms ? this.floor.rooms : []
    },
  },
  mounted() {
      this.minimapBuilder(this.floorsRoom)
  },
  methods: {
    getRoom(id) {
        return this.floorsRoom.find(room => room.id === id)
    },
    addRow(wrapper, referenceRowIndex, position) {
        const referenceRow = wrapper.querySelector(`[type="row"][index="${referenceRowIndex}"]`)
        const colsToCreate = [...wrapper.querySelectorAll(`[first-row] [type="col"]`)]
        const template = 
        `<div type="row" index="">
            ${colsToCreate.map((col, index) => (
                `<div type="col" index="${index}" room="" door-up="" door-down="" door-left="" door-right=""></div>`
            )).join('')}
        </div>`
        referenceRow.insertAdjacentHTML(position, template) // beforebegin afterend

        // Reset indexes
        const allRows = [...wrapper.querySelectorAll(`[type="row"]`)]
        allRows.forEach((row, index) => row.setAttribute("index", index))
    },
    addCol(wrapper, referenceColIndex, position) {
        const allRows = [...wrapper.querySelectorAll(`[type="row"]`)]
        const template = `<div type="col" index="" room="" door-up="" door-down="" door-left="" door-right=""></div>`
        allRows.forEach((row) => {
            const referenceCol = row.querySelector(`[type="col"][index="${referenceColIndex}"]`)
            referenceCol.insertAdjacentHTML(position, template) // beforebegin afterend
        })
        
        // Reset indexes
        allRows.forEach((row) => {
            const allCols = [...row.querySelectorAll(`[type="col"]`)]
            allCols.forEach((col, index) => col.setAttribute("index", index))
        })
    },
    // addRoom(rowIndex, colIndex, shape, door) {
    //     const referenceRow = wrapper.querySelector(`[type="row"][index="${rowIndex}"]`)
    //     const referenceCol = referenceRow.querySelector(`[type="col"][index="${colIndex}"]`)
    // },
    minimapBuilder(rooms) {
        const wrapper = this.$refs[`minimap-${this.floor.name}`]
        console.log(wrapper, rooms)
        //this.addRow(wrapper, "0", "beforebegin")
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.minimap {
    .wrapper {
        width: auto;
        height: auto;
        display: flex;
        [type="row"] {
            display: block;
            height: 16px;
            [type="col"] {                    
                width: 18px;
                height: 16px;
                display: inline-block;
                > div {
                    width: 100%;
                    height: 100%;
                    background-repeat: no-repeat;
                    background-size: cover;
                }
            }
        }
    }
}
</style>