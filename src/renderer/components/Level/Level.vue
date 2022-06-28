<template>
  <div
    v-if="runs.all().length > 0 && entities.all().length > 0"
    class="level"
  >
    {{ totalXp }}
  </div>
</template>

<script>
import { mapRepos } from "@vuex-orm/core";
import format from "../../helpers/format";
import Run from "../../store/classes/Run";
import Entity from '../../store/classes/Entity';
export default {
  name: "Level",
  components: {
  },
  data() {
    return {
      xp: 0
    };
  },
  computed: {
    ...mapRepos({
      runRepo: Run,
      entityRepo: Entity
    }),
    runs() {
      return this.runRepo;
    },
    entities() {
        return this.entityRepo;
    },
    runsWin() {
      return this.runRepo?.where((run) => {
        return run.runEnd.win 
      }).get();
    },
    totalXp() {
      let xp = 0
      let lvl = 0
      this.runsWin?.forEach(run => {
        const time = format.durationToMinutes(run.runDuration)
        let ixp = 100
        run.floors?.forEach(floor => {
          floor.entities?.filter(entity => entity.lastBoss)?.forEach(lastBoss => {
            ixp += this.entityRepo?.where(entity => entity.id === lastBoss.id)?.first()?.xp
          })
        })
        xp += ixp / time
      });
      return Math.round(xp)
    },
  },
  methods: {
  },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
</style>