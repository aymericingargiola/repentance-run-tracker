<template>
  <div v-if="allRuns && entities && charactersRep && entities.all().length > 0 && charactersRep.all().length > 0 && allRuns.length > 0" class="section win-streaks">
    <div
      class="win-streaks-container"
    >
      <ul>
        <template v-for="winStreak in currentWinStreak">
          <WinStreakItem v-if="allWinStreak && allWinStreak.length > 0" :winStreak="winStreak" :key="winStreak.id"/>
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
        window.ipc.send('ASK_WINSTREAKS')
        window.ipc.send('ASK_ENTITIES')
        window.ipc.send('ASK_FLOORS')
        window.ipc.send('ASK_CHARACTERS')
        window.ipc.on('SYNC_SEND_WINSTREAKS', (response) => {
            console.log(response)
            this.winStreakRepo.fresh(response.winStreaks)
        })
        window.ipc.on('SYNC_SEND_ENTITIES', (response) => {
            console.log(response)
            this.entityRepo.fresh(response.entities)
        })
        window.ipc.on('SYNC_SEND_FLOORS', (response) => {
            console.log(response)
            this.floorRepo.fresh(response.floors)
        })
        window.ipc.on('SYNC_SEND_CHARACTERS', (response) => {
            console.log(response)
            this.characterRepo.fresh(response.characters)
        })
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