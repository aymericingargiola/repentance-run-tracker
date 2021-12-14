<template>
  <transition name="open">
    <div v-if="isOpen && this.runRepo" class="run-details">
      <div class="overlay"></div>
      <div class="menu">
        <div class="title">
          <h1>{{currentRun.characters[0].id === '19' ? `${$t(`players.19.name`)} & ${$t(`players.20.name`)}` : `${$t(`players.${currentRun.characters[0].id}.name`)}` }}, {{getRunStartDate}}</h1>
          <span class="run-title">{{currentRun.customName}}</span>
        </div>
        <div class="close" v-on:click="openOrCloseRunDetails()">X</div>
      </div>
      <div class="wrapper">
        <div class="content">
          <RunFloorsChart :floors-prop="floors" @selectedFloor="onSelectedFloor"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from "@vuex-orm/core"
import Run from "../../store/classes/Run"
import Config from "../../store/classes/Config"
import RunFloorsChart from "../RunsDetails/RunFloorsChart.vue"
export default {
  name: "RunDetails",
  components: {
    RunFloorsChart
  },
  data() {
    return {
      isOpen: false,
      id: null,
      selectedFloor: -1
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
      configRepo: Config
    }),
    currentRun() {
      return this.runRepo.query().where("id", this.id).first();
    },
    getRunStartDate() {
      return this.$helpers.formatDate(this.currentRun.runStart, `dd LLLL yyyy - ${this.getConfig("hourFormat").value}`, this.$i18n.locale)
    },
    floors() {
        return this.currentRun && this.currentRun.floors ? this.currentRun.floors : []
    }
  },
  methods: {
    getConfig(id) {
      return this.configRepo.query().where('id', id).get()[0]
    },
    openOrCloseRunDetails() {
      this.$root.$emit("OPEN_RUNDETAILS")
    },
    onSelectedFloor(floorIndex) {
      console.log(floorIndex)
      this.selectedFloor = floorIndex
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.run-details {
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: calc(100vh - 30px);
    z-index: 2;
    box-shadow: 0px -10px 10px rgba(0, 0, 0, 0.2);
    transition: 0.5s ease;
    background-color: rgba($color: $paper-white-dark, $alpha: 0.98);
    padding: 20px;
    //backdrop-filter: blur(5px);
    &.open-enter-active, &.open-leave-active {
    }
    &.open-enter, &.open-leave-to {
        transform: translate(0px, 100%);
    }
    .menu {
      padding: 10px 60px;
      width: 100%;
      display: flex;
      position: relative;
      margin-bottom: 28px;
      .title {
        margin: auto;
        h1 {
          margin-top: 0px;
          margin-bottom: 0px;
        }
      }
      .close {
        position: absolute;
        right: 0px;
        top: 0px;
        margin-left: auto;
        font-size: 60px;
        cursor: pointer;
      }
    }
}
</style>