<template>
  <div
    v-if="allRuns && entities && charactersRep && entities.all().length > 0 && charactersRep.all().length > 0 && allRuns.length > 0"
    class="section win-streaks"
  >
    <div
      class="win-streaks-container"
    >
      <ul>
        <template v-for="winStreak in currentWinStreak">
          <WinStreakItem
            v-if="allWinStreak && allWinStreak.length > 0"
            :key="winStreak.id"
            :win-streak="winStreak"
          />
        </template>
        <WinStreakAdd v-if="currentWinStreak && currentWinStreak.length < 3" />
      </ul>
    </div>
  </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import WinStreakAdd from './WinStreakAdd.vue'
import WinStreakItem from './WinStreakItem.vue'
import Run from '../../store/classes/Run'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Floor from '../../store/classes/Floor'
import Character from '../../store/classes/Character'
export default {
    name: "WinStreaks",
    components: {
        WinStreakAdd,
        WinStreakItem
    },
    computed: {
        ...mapRepos({
            runRepo: Run,
            winStreakRepo: WinStreak,
            entityRepo: Entity,
            floorRepo: Floor,
            characterRepo: Character
        }),
        allRuns() {
            return this.runRepo.all()
        },
        allWinStreak() {
            return this.winStreakRepo.all()
        },
        currentWinStreak() {
            return this.winStreakRepo.where("archived", false).get()
        },
        entities() {
            return this.entityRepo
        },
        charactersRep() {
            return this.characterRepo
        }
    },
    mounted() {
    },
    methods: {
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.win-streaks {
    padding: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .head {
        width: 100%;
    }
    .win-streaks-container {
        position: relative;
        padding: 0px 24px;
        width: 100%;
        > ul {
            align-items: flex-start;
            display: flex;
            margin-left: -25px;
            margin-right: -25px;
        }
    }
}
</style>