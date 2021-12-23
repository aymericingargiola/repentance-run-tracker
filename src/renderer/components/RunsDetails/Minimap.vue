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
    checkMinimapStructure(position, roomCol, roomRow) {
        switch(position) {
            case "LEFT": {
                if (roomCol && !roomCol.previousSibling) this.addCol(roomCol.getAttribute("index"), "beforebegin")
                break
            }
            case "UP": {
                if(roomRow && !roomRow.previousSibling) this.addRow(roomRow.getAttribute("index"), "beforebegin")
                break
            }
            case "RIGHT": {
            if (roomCol && !roomCol.nextSibling) this.addCol(roomCol.getAttribute("index"), "afterend")
                break
            }
            case "DOWN": {
                if(roomRow && !roomRow.nextSibling) this.addRow(roomRow.getAttribute("index"), "afterend")
                position = "DOWN"
                break
            }
        }
    },
    getPosition(roomDoor) {
        let position
        switch(roomDoor) {
            case 4:
            case 0: { // LEFT
                position = "LEFT"
                break
            }
            case 5:
            case 1: { // UP
                position = "UP"
                break
            }
            case 6:
            case 2: { // RIGHT
                position = "RIGHT"
                break
            }
            case 7:
            case 3: { // DOWN
                position = "DOWN"
                break
            }
        }
        return position
    },
    addRoom(id, index, shape, type, referenceRoomId, referenceRoomDoor, roomDoor) {
        if (this.wrapper.querySelector(`[room="${id}"]`)) return // Room already exists
        const template = `<div class="background" type="room" roomtype="${type}" style="background-image:url('${minimapImgsPath}#')"></div>`
        let referenceRoomCol = this.wrapper.querySelector(`[room="${referenceRoomId}"][doors*="${referenceRoomDoor}"]`)
        let referenceRoomRow = referenceRoomCol?.closest('[type="row"]')
        let position = referenceRoomId ? this.getPosition(referenceRoomDoor) : null
        this.checkMinimapStructure(position, referenceRoomCol, referenceRoomRow)
        switch(shape) {
            case "1":
            case "2":
            case "3": { // ROOMSHAPE_1x1 ROOMSHAPE_IH ROOMSHAPE_IV
                let matchingCol
                const roomImage = shape === "2" ? "2_RIGHT0_LEFT0.png" : shape === "3" ? "3_UP0_DOWN0.png" : "1_UP0-RIGHT0-DOWN0-LEFT0.png"
                const roomDiv = template.replace("#", roomImage)
                const doors = shape === "2" ? [0, 2] : shape === "3" ? [1, 3] : [0, 1, 2, 3]
                if(index === 0 && !referenceRoomId) { // Init first floor's room then return
                    matchingCol = this.wrapper.querySelector(`[first-col]`)
                    matchingCol.setAttribute("room", id)
                    matchingCol.setAttribute("doors", doors)
                    matchingCol.insertAdjacentHTML("afterbegin", roomDiv)
                    return
                }
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
                break
            }
            case "4":
            case "5": { // ROOMSHAPE_1x2 ROOMSHAPE_IIV
                let matchingCol
                const roomPart = [0, 1, 2].includes(roomDoor) ? "ROOMTOP" : "ROOMBOT"
                let roomImage = roomPart === "ROOMTOP" ? "4_UP0-LEFT0-RIGHT0.png" : "4_RIGHT1-DOWN0-LEFT1.png"
                if (shape === "5") roomImage = roomPart === "ROOMTOP" ? "5_UP0.png" : "5_DOWN0.png"
                let roomDiv = template.replace("#", roomImage)
                let doors = roomPart === "ROOMTOP" ? [0, 1, 2] : [3, 4, 6]
                if (shape === "5") doors =  roomPart === "ROOMTOP" ? [1] : [3]
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)

                // Add missing room part (top or bottom)
                referenceRoomCol = this.wrapper.querySelector(`[room="${id}"][doors="${doors}"]`)
                referenceRoomRow = referenceRoomCol?.closest('[type="row"]')
                if (roomPart === "ROOMTOP") {
                    this.checkMinimapStructure("DOWN", referenceRoomCol, referenceRoomRow)
                    roomImage = shape === "4" ? "4_RIGHT1-DOWN0-LEFT1.png" : "5_DOWN0.png"
                    roomDiv = template.replace("#", roomImage)
                    doors = shape === "4" ? [3, 4, 6] : [3]
                    matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                } else if (roomPart === "ROOMBOT") {
                    this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                    roomImage = shape === "4" ? "4_UP0-LEFT0-RIGHT0.png" : "5_UP0.png"
                    roomDiv = template.replace("#", roomImage)
                    doors = shape === "4" ? [0, 1, 2] : [1]
                    matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                }
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
            }
            break
            case "6":
            case "7": { // ROOMSHAPE_2x1 ROOMSHAPE_IIH
                let matchingCol
                const roomPart = [0, 1, 3].includes(roomDoor) ? "ROOMLEFT" : "ROOMRIGHT"
                let roomImage = roomPart === "ROOMLEFT" ? "6_UP0-DOWN0-LEFT0.png" : "6_UP1-RIGHT0-DOWN1.png"
                if (shape === "7") roomImage = roomPart === "ROOMLEFT" ? "7_LEFT0.png" : "7_RIGHT0.png"
                let roomDiv = template.replace("#", roomImage)
                let doors = roomPart === "ROOMLEFT" ? [0, 1, 3] : [2, 5, 7]
                if (shape === "7") doors =  roomPart === "ROOMLEFT" ? [0] : [2]
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)

                // Add missing room part (top or bottom)
                referenceRoomCol = this.wrapper.querySelector(`[room="${id}"][doors="${doors}"]`)
                referenceRoomRow = referenceRoomCol?.closest('[type="row"]')
                if (roomPart === "ROOMLEFT") {
                    this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                    roomImage = shape === "6" ? "6_UP1-RIGHT0-DOWN1.png" : "7_RIGHT0.png"
                    roomDiv = template.replace("#", roomImage)
                    doors = shape === "6" ? [2, 5, 7] : [2]
                    matchingCol = referenceRoomCol?.nextSibling
                } else if (roomPart === "ROOMRIGHT") {
                    this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                    roomImage = shape === "6" ? "6_UP0-DOWN0-LEFT0.png" : "7_LEFT0.png"
                    roomDiv = template.replace("#", roomImage)
                    doors = shape === "6" ? [0, 1, 3] : [0]
                    matchingCol = referenceRoomCol?.previousSibling
                }
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
            }
            break
            case "8": { // ROOMSHAPE_2x2
                let matchingCol
                const roomParts = [
                {
                    roomPart: "ROOMTOPLEFT",
                    file: "8_UP0-LEFT0.png",
                    doors: [0, 1],
                    done: false
                },
                {
                    roomPart: "ROOMTOPRIGHT",
                    file: "8_UP1-RIGHT0.png",
                    doors: [5, 2],
                    done: false
                },
                {
                    roomPart: "ROOMBOTRIGHT",
                    file: "8_RIGHT1-DOWN1.png",
                    doors: [6, 7],
                    done: false
                },
                {
                    roomPart: "ROOMBOTLEFT",
                    file: "8_DOWN0-LEFT1.png",
                    doors: [3, 4],
                    done: false
                }]
                let roomPart = roomParts.find(part => part.doors.includes(roomDoor))?.roomPart
                let doors = roomParts.find(part => part.roomPart === roomPart)?.doors
                let roomImage = roomParts.find(part => part.roomPart === roomPart)?.file
                let roomDiv = template.replace("#", roomImage)
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
                roomParts.find(part => part.roomPart === roomPart)?.done = true

                // Add missing room part (top or bottom)
                while (roomParts.filter(part => !part.done).length > 0) {
                    const referenceRoomPart = roomPart
                    referenceRoomCol = this.wrapper.querySelector(`[room="${id}"][doors="${doors}"]`)
                    referenceRoomRow = referenceRoomCol?.closest('[type="row"]')
                    roomPart = roomParts.find(part => !part.done)?.roomPart
                    roomImage = roomParts.find(part => part.roomPart === roomPart)?.file
                    roomDiv = template.replace("#", roomImage)
                    console.log(referenceRoomPart, roomPart)
                    if (referenceRoomPart === "ROOMTOPLEFT" && roomPart === "ROOMTOPRIGHT" || referenceRoomPart === "ROOMBOTLEFT" && roomPart === "ROOMBOTRIGHT") {
                        this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomCol?.nextSibling
                    } 
                    if (referenceRoomPart === "ROOMTOPRIGHT" && roomPart === "ROOMTOPLEFT" || referenceRoomPart === "ROOMBOTRIGHT" && roomPart === "ROOMBOTLEFT") {
                        this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomCol?.previousSibling
                    }
                    if (referenceRoomPart === "ROOMBOTLEFT" && roomPart === "ROOMTOPLEFT" || referenceRoomPart === "ROOMBOTRIGHT" && roomPart === "ROOMTOPRIGHT") {
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                    }
                    if (referenceRoomPart === "ROOMTOPLEFT" && roomPart === "ROOMBOTLEFT" || referenceRoomPart === "ROOMTOPRIGHT" && roomPart === "ROOMBOTRIGHT") {
                        this.checkMinimapStructure("DOWN", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                    }
                    if (referenceRoomPart === "ROOMBOTLEFT" && roomPart === "ROOMTOPRIGHT") {
                        this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) + 1}"]`)
                    }
                    if (referenceRoomPart === "ROOMTOPLEFT" && roomPart === "ROOMBOTRIGHT") {
                        this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("DOWN", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) + 1}"]`)
                    }
                    if (referenceRoomPart === "ROOMBOTRIGHT" && roomPart === "ROOMTOPLEFT") {
                        this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.previousSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) - 1}"]`)
                    }
                    if (referenceRoomPart === "ROOMTOPRIGHT" && roomPart === "ROOMBOTLEFT") {
                        this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.nextSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) - 1}"]`)
                    }
                    matchingCol?.setAttribute("room", id)
                    matchingCol?.setAttribute("doors", doors)
                    matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
                    roomParts.find(part => part.roomPart === roomPart)?.done = true
                }
            }
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
            const type = room.type
            if (index === 0) this.addRoom(id, index, shape, type)
            room.doorsSlots.forEach(door => {
                const linkedRoom = this.getRoom(door.linkedRoom)
                this.addRoom(linkedRoom.id, index, linkedRoom.shape, linkedRoom.type, id, door.thisRoomEnter, door.previousRoomLeave, door.thisRoomEnter)
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