<template>
    <div class="minimap">
        <div class="wrapper" :ref="`minimap-${floor.name}`">
            <div type="row" first-row index="0">
                <div type="col" first-col index="0">
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
      wrapper: null
    }
  },
  computed: {
    floorsRoom() {
        return this.floor?.rooms ? this.floor.rooms : []
    },
  },
  mounted() {
    // Rooms shape doc : https://wofsauge.github.io/IsaacDocs/rep/enums/RoomShape.html?h=room
    // Doors slot doc : https://wofsauge.github.io/IsaacDocs/rep/enums/DoorSlot.html?h=door
    this.wrapper = this.$refs[`minimap-${this.floor.name}`]
    this.minimapBuilder(this.floorsRoom)
  },
  methods: {
    getRoom(id) {
        return this.floorsRoom.find(room => room.id === id)
    },
    addRow(referenceRowIndex, position) {
        const referenceRow = this.wrapper.querySelector(`[type="row"][index="${referenceRowIndex}"]`)
        const colsToCreate = [...this.wrapper.querySelectorAll(`[first-row] [type="col"]`)]
        const template = 
        `<div type="row" index="">
            ${colsToCreate.map((col, index) => (
                `<div type="col" index="${index}"></div>`
            )).join('')}
        </div>`
        referenceRow.insertAdjacentHTML(position, template) // beforebegin afterend

        // Reset indexes
        const allRows = [...this.wrapper.querySelectorAll(`[type="row"]`)]
        allRows.forEach((row, index) => row.setAttribute("index", index))
    },
    addCol(referenceColIndex, position) {
        const allRows = [...this.wrapper.querySelectorAll(`[type="row"]`)]
        const template = `<div type="col" index=""></div>`
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
    getPosition(roomDoor, roomCol, roomRow) {
        let position
        switch(roomDoor) {
            case 4:
            case 0: { // LEFT
                if (roomCol && !roomCol.previousSibling) this.addCol(roomCol.getAttribute("index"), "beforebegin")
                position = "LEFT"
                break
            }
            case 5:
            case 1: { // UP
                if(roomRow && !roomRow.previousSibling) this.addRow(roomRow.getAttribute("index"), "beforebegin")
                position = "UP"
                break
            }
            case 6:
            case 2: { // RIGHT
            if (roomCol && !roomCol.nextSibling) this.addCol(roomCol.getAttribute("index"), "afterend")
                position = "RIGHT"
                break
            }
            case 7:
            case 3: { // DOWN
                if(roomRow && !roomRow.nextSibling) this.addRow(roomRow.getAttribute("index"), "afterend")
                position = "DOWN"
                break
            }
        }
        return position
    },
    addRoom(id, index, shape, referenceRoomId, referenceRoomDoor) {
        if (this.wrapper.querySelector(`[room="${id}"]`)) return // Room already exists
        let template = `<div class="background" style="background-image:url('${minimapImgsPath}#')"></div>`
        let referenceRoomCol = this.wrapper.querySelector(`[room="${referenceRoomId}"][doors*="${referenceRoomDoor}"]`)
        let referenceRoomRow = referenceRoomCol?.closest('[type="row"]')
        let position = referenceRoomId ? this.getPosition(referenceRoomDoor, referenceRoomCol, referenceRoomRow) : null
        referenceRoomCol = this.wrapper.querySelector(`[room="${referenceRoomId}"][doors*="${referenceRoomDoor}"]`) // Update after new row/col added
        referenceRoomRow = referenceRoomCol?.closest('[type="row"]') // Update after new row/col added
        switch(shape) {
            case "1": { // ROOMSHAPE_1x1
                template = template.replace("#", "1_UP0-RIGHT0-DOWN0-LEFT0.png")
                let matchingCol
                const doors = [0, 1, 2, 3]
                if(index === 0 && !referenceRoomId) {
                    matchingCol = this.wrapper.querySelector(`[first-col]`)
                    matchingCol.setAttribute("room", id)
                    matchingCol.setAttribute("doors", doors)
                    return matchingCol.insertAdjacentHTML("afterbegin", template)
                }
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", template)
                break
            }
            case "2": // ROOMSHAPE_IH
            break
            case "3": // ROOMSHAPE_IV
            break
            case "4": // ROOMSHAPE_1x2
            break
            case "5": // ROOMSHAPE_IIV
            break
            case "6": // ROOMSHAPE_2x1
            break
            case "7": // ROOMSHAPE_IIH
            break
            case "8": // ROOMSHAPE_2x2
            break
            case "9": // ROOMSHAPE_LTL
            break
            case "10": // ROOMSHAPE_LTR
            break
            case "11": // ROOMSHAPE_LBL
            break
            case "12": // ROOMSHAPE_LBR
            break
        }
    },
    minimapBuilder(rooms) {
        rooms.forEach((room, index) => {
            const id = room.id
            const shape = room.shape
            if (index === 0) this.addRoom(id, index, shape)
            room.doorsSlots.forEach(door => {
                const linkedRoom = this.getRoom(door.linkedRoom)
                this.addRoom(linkedRoom.id, index, linkedRoom.shape, id, door.thisRoomEnter, door.previousRoomLeave)
            })
        })
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