<template>
    <div class="win-streak-container add">
        ADD WINSTREAK Component
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Character from '../../store/classes/Character'
export default {
    name: "winStreaksAdd",
    data() {
        return {
        }
    },
    computed: {
        ...mapRepos({
            winStreakRepo: WinStreak,
            entityRepo: Entity,
            characterRepo: Character
        }),
        lastBosses() {
            return this.entityRepo.where('lastBoss', true).all()
        }
    },
    methods: {
    },
    mounted() {
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";

</style>