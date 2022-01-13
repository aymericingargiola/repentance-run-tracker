<template>
    <div v-if="floor && floor.rooms && floor.rooms.length > 0" class="minimap">
        <div :class="['wrapper', selectedRoom > -1 ? 'room-selected' : '']" :ref="`minimap-${floor.name}`">
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
      selectedRoom: Number
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
    minimapReset() {
        const template = `
        <div type="row" first-row index="0">
            <div type="col" first-col index="0">
            </div>
        </div>
        `
        this.wrapper.innerHTML = template
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
                if (roomCol && !roomCol.previousElementSibling) this.addCol(roomCol.getAttribute("index"), "beforebegin")
                break
            }
            case "UP": {
                if(roomRow && !roomRow.previousElementSibling) this.addRow(roomRow.getAttribute("index"), "beforebegin")
                break
            }
            case "RIGHT": {
            if (roomCol && !roomCol.nextElementSibling) this.addCol(roomCol.getAttribute("index"), "afterend")
                break
            }
            case "DOWN": {
                if(roomRow && !roomRow.nextElementSibling) this.addRow(roomRow.getAttribute("index"), "afterend")
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
        const roomParts = [
        {
            shape: "8",
            roomPart: "ROOMTOPLEFT",
            file: "8_UP0-LEFT0.png",
            doors: [0, 1],
            done: false
        },
        {
            shape: "8",
            roomPart: "ROOMTOPRIGHT",
            file: "8_UP1-RIGHT0.png",
            doors: [5, 2],
            done: false
        },
        {
            shape: "8",
            roomPart: "ROOMBOTRIGHT",
            file: "8_RIGHT1-DOWN1.png",
            doors: [6, 7],
            done: false
        },
        {
            shape: "8",
            roomPart: "ROOMBOTLEFT",
            file: "8_DOWN0-LEFT1.png",
            doors: [3, 4],
            done: false
        },
        {
            shape: "9",
            roomPart: "ROOMTOPRIGHT",
            file: "9_UP1-RIGHT0-LEFT0.png",
            doors: [0, 2, 5],
            done: false
        },
        {
            shape: "9",
            roomPart: "ROOMBOTRIGHT",
            file: "9_RIGHT1-DOWN1.png",
            doors: [6, 7],
            done: false
        },
        {
            shape: "9",
            roomPart: "ROOMBOTLEFT",
            file: "9_UP0-DOWN0-LEFT1.png",
            doors: [1, 3, 4],
            done: false
        },
        {
            shape: "10",
            roomPart: "ROOMTOPLEFT",
            file: "10_UP0-RIGHT0-LEFT0.png",
            doors: [0, 1, 2],
            done: false
        },
        {
            shape: "10",
            roomPart: "ROOMBOTLEFT",
            file: "10_DOWN0-LEFT1.png",
            doors: [3, 4],
            done: false
        },
        {
            shape: "10",
            roomPart: "ROOMBOTRIGHT",
            file: "10_UP1-RIGHT1-DOWN1.png",
            doors: [5, 6, 7],
            done: false
        },
        {
            shape: "11",
            roomPart: "ROOMTOPLEFT",
            file: "11_UP0-DOWN0-LEFT0.png",
            doors: [0, 1, 3],
            done: false
        },
        {
            shape: "11",
            roomPart: "ROOMTOPRIGHT",
            file: "11_UP1-RIGHT0.png",
            doors: [2, 5],
            done: false
        },
        {
            shape: "11",
            roomPart: "ROOMBOTRIGHT",
            file: "11_RIGHT1-DOWN1-LEFT1.png",
            doors: [4, 6, 7],
            done: false
        },
        {
            shape: "12",
            roomPart: "ROOMTOPLEFT",
            file: "12_UP0-LEFT0.png",
            doors: [0, 1],
            done: false
        },
        {
            shape: "12",
            roomPart: "ROOMTOPRIGHT",
            file: "12_UP1-RIGHT0-DOWN1.png",
            doors: [2, 5, 7],
            done: false
        },
        {
            shape: "12",
            roomPart: "ROOMBOTLEFT",
            file: "12_RIGHT1-DOWN0-LEFT1.png",
            doors: [3, 4, 6],
            done: false
        }]
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
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousElementSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextElementSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
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
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousElementSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextElementSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
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
                    matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                } else if (roomPart === "ROOMBOT") {
                    this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                    roomImage = shape === "4" ? "4_UP0-LEFT0-RIGHT0.png" : "5_UP0.png"
                    roomDiv = template.replace("#", roomImage)
                    doors = shape === "4" ? [0, 1, 2] : [1]
                    matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
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
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousElementSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextElementSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
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
                    matchingCol = referenceRoomCol?.nextElementSibling
                } else if (roomPart === "ROOMRIGHT") {
                    this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                    roomImage = shape === "6" ? "6_UP0-DOWN0-LEFT0.png" : "7_LEFT0.png"
                    roomDiv = template.replace("#", roomImage)
                    doors = shape === "6" ? [0, 1, 3] : [0]
                    matchingCol = referenceRoomCol?.previousElementSibling
                }
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
            }
            break
            case "8":
            case "9":
            case "10":
            case "11":
            case "12": { // ROOMSHAPE_2x2 ROOMSHAPE_LTR ROOMSHAPE_LTR ROOMSHAPE_LBL ROOMSHAPE_LBR
                let matchingCol
                let currentRoomPart = roomParts.filter(part => part.shape === shape).find(part => part.doors.includes(roomDoor))
                let roomPart = currentRoomPart?.roomPart
                let doors = currentRoomPart?.doors
                let roomImage = currentRoomPart?.file
                let roomDiv = template.replace("#", roomImage)
                if (position === "LEFT") matchingCol = referenceRoomCol?.previousElementSibling
                if (position === "RIGHT") matchingCol = referenceRoomCol?.nextElementSibling
                if (position === "UP") matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                if (position === "DOWN") matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                matchingCol?.setAttribute("room", id)
                matchingCol?.setAttribute("doors", doors)
                matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
                currentRoomPart.done = true

                // Add missing room part
                while (roomParts.filter(part => part.shape === shape && !part.done).length > 0) {
                    const referenceRoomPart = roomPart
                    referenceRoomCol = this.wrapper.querySelector(`[room="${id}"][doors="${doors}"]`)
                    referenceRoomRow = referenceRoomCol?.closest('[type="row"]')
                    currentRoomPart = roomParts.filter(part => part.shape === shape).find(part => !part.done)
                    doors = currentRoomPart?.doors
                    roomPart = currentRoomPart?.roomPart
                    roomImage = currentRoomPart?.file
                    roomDiv = template.replace("#", roomImage)
                    if (referenceRoomPart === "ROOMTOPLEFT" && roomPart === "ROOMTOPRIGHT" || referenceRoomPart === "ROOMBOTLEFT" && roomPart === "ROOMBOTRIGHT") {
                        this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomCol?.nextElementSibling
                    } 
                    if (referenceRoomPart === "ROOMTOPRIGHT" && roomPart === "ROOMTOPLEFT" || referenceRoomPart === "ROOMBOTRIGHT" && roomPart === "ROOMBOTLEFT") {
                        this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomCol?.previousElementSibling
                    }
                    if (referenceRoomPart === "ROOMBOTLEFT" && roomPart === "ROOMTOPLEFT" || referenceRoomPart === "ROOMBOTRIGHT" && roomPart === "ROOMTOPRIGHT") {
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                    }
                    if (referenceRoomPart === "ROOMTOPLEFT" && roomPart === "ROOMBOTLEFT" || referenceRoomPart === "ROOMTOPRIGHT" && roomPart === "ROOMBOTRIGHT") {
                        this.checkMinimapStructure("DOWN", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${referenceRoomCol.getAttribute("index")}"]`)
                    }
                    if (referenceRoomPart === "ROOMBOTLEFT" && roomPart === "ROOMTOPRIGHT") {
                        this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) + 1}"]`)
                    }
                    if (referenceRoomPart === "ROOMTOPLEFT" && roomPart === "ROOMBOTRIGHT") {
                        this.checkMinimapStructure("RIGHT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("DOWN", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) + 1}"]`)
                    }
                    if (referenceRoomPart === "ROOMBOTRIGHT" && roomPart === "ROOMTOPLEFT") {
                        this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("UP", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.previousElementSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) - 1}"]`)
                    }
                    if (referenceRoomPart === "ROOMTOPRIGHT" && roomPart === "ROOMBOTLEFT") {
                        this.checkMinimapStructure("LEFT", referenceRoomCol, referenceRoomRow)
                        this.checkMinimapStructure("DOWN", referenceRoomCol, referenceRoomRow)
                        matchingCol = referenceRoomRow?.nextElementSibling?.querySelector(`[index="${parseInt(referenceRoomCol.getAttribute("index")) - 1}"]`)
                    }
                    matchingCol?.setAttribute("room", id)
                    matchingCol?.setAttribute("doors", doors)
                    matchingCol?.insertAdjacentHTML("afterbegin", roomDiv)
                    currentRoomPart.done = true
                }
            }
            break
        }
    },
    minimapBuilder(rooms) {
        rooms.forEach((room, index) => {
            const id = room.id
            const shape = room.shape
            const type = room.type
            if (index === 0) this.addRoom(id, index, shape, type)
            if (room.doorsSlots && room.doorsSlots.length > 0) room.doorsSlots.forEach(door => {
                const linkedRoom = this.getRoom(door.linkedRoom)
                this.addRoom(linkedRoom.id, index, linkedRoom.shape, linkedRoom.type, id, door.thisRoomEnter, door.previousRoomLeave, door.thisRoomEnter)
            })
        })
    }
  },
    watch: { 
        floor: function(newVal) {
            if (newVal?.rooms && newVal.rooms.length > 0) {
                if (!this.wrapper) this.wrapper = this.$refs[`minimap-${this.floor.name}`]
                if (this.wrapper) {
                    this.minimapReset()
                    this.minimapBuilder(newVal.rooms)
                }
            }
        },
        selectedRoom: function(newVal, oldVal) {
            const newSelected = newVal > -1 ? [...this.wrapper.querySelectorAll(`[room="${newVal}"]`)] : []
            const oldSelected = oldVal > -1 ? [...this.wrapper.querySelectorAll(`[room="${oldVal}"]`)] : []
            if (newSelected.length > 0) newSelected.forEach(roomPart => roomPart.classList.add('selected'))
            if (oldSelected.length > 0) oldSelected.forEach(roomPart => roomPart.classList.remove('selected'))
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.minimap {
    align-self: baseline;
    margin: auto;
    margin-bottom: 20px;
    padding: 20px;
    background: rgba($color: black, $alpha: 0.8);
    border-radius: 10px;
    > .wrapper {
        width: auto;
        height: auto;
        display: flex;
        flex-direction: column;
        [type="row"] {
            display: block;
            height: 16px;
            [type="col"] {           
                width: 18px;
                height: 16px;
                display: inline-block;
                transition: 0.5s ease;
                > div {
                    width: 100%;
                    height: 100%;
                    background-repeat: no-repeat;
                    background-size: cover;
                    position: relative;
                }
                &[doors*="0"], &[doors="1,3"] {
                    > div {
                        position: relative;
                        &::after {
                            content: "";
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-size: contain;
                        }
                        &[roomtype="secret"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/secret.png");
                            }
                        }
                        &[roomtype="treasure"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/treasure.png");
                            }
                        }
                        &[roomtype="angel"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/angel.png");
                            }
                        }
                        &[roomtype="arcade"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/arcade.png");
                            }
                        }
                        &[roomtype="black_market"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/black_market.png");
                            }
                        }
                        &[roomtype="boss"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/boss.png");
                            }
                        }
                        &[roomtype="boss_challenge"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/boss_challenge.png");
                            }
                        }
                        &[roomtype="challenge"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/challenge.png");
                            }
                        }
                        &[roomtype="chest"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/chest.png");
                            }
                        }
                        &[roomtype="curse"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/curse.png");
                            }
                        }
                        &[roomtype="devil"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/devil.png");
                            }
                        }
                        &[roomtype="dice"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/dice.png");
                            }
                        }
                        &[roomtype="isaacs"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/isaacs.png");
                            }
                        }
                        &[roomtype="library"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/library.png");
                            }
                        }
                        &[roomtype="mini_boss"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/mini_boss.png");
                            }
                        }
                        &[roomtype="planetarium"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/planetarium.png");
                            }
                        }
                        &[roomtype="sacrifice"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/sacrifice.png");
                            }
                        }
                        &[roomtype="shop"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/shop.png");
                            }
                        }
                        &[roomtype="start_room"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/start_room.png");
                            }
                        }
                        &[roomtype="super_secret"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/super_secret.png");
                            }
                        }
                        &[roomtype="ultra_secret"] {
                            &::after {
                                background-image: url("../../../../public/img/icons/minimap/ultra_secret.png");
                            }
                        }
                    }
                }
            }
        }
        &.room-selected {
            [type="col"] {
                &:not(.selected) {
                    opacity: 0.5;
                    filter: brightness(0.5);
                }
            }
        }
    }
}
</style>