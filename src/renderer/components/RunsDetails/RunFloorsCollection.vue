<template>
  <section v-if="!selectedFloor || selectedFloor === index" class="run-floors-collection">
    <h2>{{floorName}}</h2>
    <div class="rooms">
      <ul class="rooms-list">
        <template v-for="room in floorRoom">
          <li :class="['room', !selectedRoom || room.id === selectedRoom ? 'selected' : '']" @click="changeSelectedRoom(room.id)" :key="`room ${room.id}`">
            <!-- <div class="background" :style="{backgroundImage:`url('img/icons/minimap/room default visited.png')`}"></div> -->
            {{room.id}}
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
.rooms {
  width: 100%;
  overflow: visible;
  .rooms-list {
    display: flex;
    margin-left: -4px;
    margin-right: -4px;
    .room {
      position: relative;
      width: calc(18px*2);
      height: calc(16px*2);
      margin: 0px 4px;
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
    }
  }
}
</style>