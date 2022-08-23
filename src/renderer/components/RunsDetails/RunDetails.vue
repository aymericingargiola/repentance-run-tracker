<template>
  <transition name="open">
    <div
      v-if="isOpen && runRepo"
      class="run-details"
    >
      <div class="overlay" />
      <div class="menu">
        <div class="title">
          <h1>{{ currentRun.characters[0].id === '19' ? `${$t(`players.19.name`)} & ${$t(`players.20.name`)}` : `${t(`players.${currentRun.characters[0].id}.name`), currentRun.characters[0].name}` }}, {{ getRunStartDate }}</h1>
          <span class="run-title">{{ currentRun.customName }}</span>
        </div>
        <div
          class="close"
          @click="closeRunDetails()"
        >
          X
        </div>
      </div>
      <div class="wrapper">
        <div class="content chart">
          <RunFloorsChart
            height="380"
            :start-states="getRunStartStats"
            :floors-prop="floors"
            @selectedFloor="onSelectedFloor"
          />
        </div>
        <div class="content collection">
          <transition-group
            name="run-floors-collections"
            tag="div"
          >
            <template v-for="(floor, fdx) in selectedFloors">
              <RunFloorsCollection
                :key="`floor ${fdx}`"
                :floor="floor"
                :characters="characters"
                :index="fdx"
                :selected-floor="selectedFloor"
              />
            </template>
          </transition-group>
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
import RunFloorsCollection from "../RunsDetails/RunFloorsCollection.vue"
import i18nMixin from "../../mixins/i18n"
export default {
  name: "RunDetails",
  mixins: [i18nMixin],
  components: {
    RunFloorsChart,
    RunFloorsCollection
  },
  data() {
    return {
      isOpen: false,
      id: null,
      selectedFloor: -1
    }
  },
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
    getRunStartStats() {
      return this.characters?.length > 0 ? this.characters[0]?.startStats?.stats : {}
    },
    characters() {
      return this.currentRun && this.currentRun.characters ? this.currentRun.characters : []
    },
    floors() {
      return this.currentRun && this.currentRun.floors ? this.currentRun.floors : []
    },
    selectedFloors() {
      return this.selectedFloor === -1 ? this.floors : [this.floors[this.selectedFloor]]
    }
  },
  mounted() {
    this.$root.$on("OPEN_RUNDETAILS", (id) => {
      if (id) this.id = id;
      this.isOpen = !this.isOpen;
    });
  },
  methods: {
    getConfig(id) {
      return this.configRepo.query().where('id', id).get()[0]
    },
    closeRunDetails() {
      this.selectedFloor = -1
      this.$root.$emit("OPEN_RUNDETAILS")
    },
    onSelectedFloor(floorIndex) {
      this.selectedFloor = floorIndex === this.selectedFloor ? -1 : floorIndex
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.run-floors-collections-item {
  transition: all 1s;
  display: inline-block;
}
.run-floors-collections-enter, .run-floors-collections-leave-to
{
  opacity: 0;
  transform: translateY(30px);
}
.run-floors-collections-leave-active {
  position: absolute;
}
.run-details {
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: calc(100vh - 30px);
    z-index: 2;
    box-shadow: 0px -10px 10px rgba(0, 0, 0, 0.2);
    transition: 0.5s ease;
    background-color: rgba($color: $paper-white-dark, $alpha: 1);
    padding: 20px;
    padding-top: 0;
    //backdrop-filter: blur(5px);
    &.open-enter-active, &.open-leave-active {
    }
    &.open-enter, &.open-leave-to {
        transform: translate(0px, 100%);
    }
    .menu {
      padding: 10px 60px;
      width: 100vw;
      transform: translateX(-20px);
      display: flex;
      position: relative;
      z-index: 2;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
      .title {
        margin: auto;
        h1 {
          margin-top: 0px;
          margin-bottom: 0px;
        }
      }
      .close {
        position: absolute;
        right: 20px;
        top: calc(50% - 5px);
        transform: translate(0, -50%);
        margin-left: auto;
        font-size: 60px;
        line-height: 40px;
        cursor: pointer;
      }
    }
    > .wrapper {
      height: calc(100% - 30px);
      display: flex;
      padding-bottom: 20px;
      flex-direction: column;
      overflow: auto;
      overflow-x: hidden;
      .content {
        &.chart {
          padding-top: 20px;
        }
        &.collection {
          position: relative;
        }
      }
    }
}
</style>