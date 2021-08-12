<template>
    <div class="win-streak-container">
        HELLO
        {{allWinStreaks}}
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
import WinStreak from '../../store/classes/WinStreak'
import Entity from '../../store/classes/Entity'
import Character from '../../store/classes/Character'
export default {
    name: "winStreaks",
    data() {
        return {
        }
    },
    computed: {
        ...mapRepos({
            runRepo: Run,
            winStreakRepo: WinStreak,
            entityRepo: Entity,
            characterRepo: Character
        }),
        allRuns() {
            return this.runRepo.all()
        },
        allWinStreaks() {
            return this.winStreakRepo.all()
        }
    },
    methods: {
    },
    mounted() {
        window.ipc.send('ASK_WINSTREAKS')
        window.ipc.send('ASK_ENTITIES')
        window.ipc.send('ASK_CHARACTERS')
        window.ipc.on('SYNC_SEND_WINSTREAKS', (response) => {
            console.log(response)
            this.winStreakRepo.fresh(response.winStreaks)
        })
        window.ipc.on('SYNC_SEND_ENTITIES', (response) => {
            console.log(response)
            this.entityRepo.fresh(response.entities)
        })
        window.ipc.on('SYNC_SEND_CHARACTERS', (response) => {
            console.log(response)
            this.characterRepo.fresh(response.characters)
        })
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";

</style>