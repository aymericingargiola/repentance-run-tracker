<template>
  <section class="run-floors-collection">
    <h2 class="floor-name">{{floorName}} <div v-if="floor.curse" class="curse-icon" :title="floor.curse" :style="{backgroundImage:`url('img/icons/curses/${floor.curse}.png')`}"></div></h2>
    <div class="rooms">
      <ul class="rooms-list">
        <template v-for="room in floorRoom">
          <li :class="['room', selectedRoom === -1 || room.id === selectedRoom ? 'selected' : '']" @click="changeSelectedRoom(room.id)" :key="`room ${room.id}`">
            <div class="background" :style="{backgroundImage:`url('img/icons/minimap/room default visited.png')`}"></div>
            <div class="icon" :style="{backgroundImage:`url('img/icons/minimap/${room.type}.png')`}"></div>
          </li>
        </template>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: "RunFloorsCollection",
  props: {
      floor: Object,
      index: Number,
      selectedFloor: Number
  },
  data() {
    return {
      selectedRoom: -1
    }
  },
  computed: {
    floorName() {
        return this.$t(`stages.${this.floor.name === 'Hush' ? 'Blue Womb' : this.floor.name.replace(/[0-9]/g, '').trim()}.name`)
    },
    floorItems() {
        return this.floor.itemsCollected
    },
    floorEnnemies() {
        return this.floor.entities
    },
    floorRoom() {
        return this.floor.rooms
    }
  },
  methods: {
    changeSelectedRoom(id) {
      this.selectedRoom = id === this.selectedRoom ? -1 : id
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.run-floors-collection {
  width: 100%;
  padding: 40px 0;
}
.floor-name {
  position: relative;
  .curse-icon {
    width: 30px;
    height: 30px;
    background-repeat: no-repeat;
    background-size: cover;
    display: inline-block;
    transform: translateY(5px);
  }
}
.rooms {
  width: 100%;
  margin: auto;
  overflow: visible;
  .rooms-list {
    display: flex;
    margin: -4px;
    justify-content: center;
    flex-wrap: wrap;
    .room {
      align-self: flex-start;
      position: relative;
      width: calc(18px*2);
      height: calc(16px*2);
      margin: 4px;
      cursor: pointer;
      transition: 0.5s ease;
      &:not(.selected) {
        opacity: 0.5;
        filter: brightness(0.5);
      }
      &:hover {
      }
      .background {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-size: cover;
      }
      .icon {
        position: absolute;
        width: calc(18px*2);
        height: calc(16px*2);
        z-index: 1;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}
</style>