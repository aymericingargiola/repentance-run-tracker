<template>
    <div class="win-streak-container">
        HELLO
        {{allWinSTreak}}
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
import WinStreak from '../../store/classes/WinStreak'
export default {
    name: "WinStreak",
    data() {
        return {
        }
    },
    computed: {
        ...mapRepos({
            runRepo: Run,
            winStreakRepo: WinStreak
        }),
        allRuns() {
            return this.runRepo.all()
        },
        allWinSTreak() {
            return this.winStreakRepo.all()
        }
    },
    methods: {
    },
    mounted() {
        window.ipc.send('ASK_WINSTREAK')
        window.ipc.on('SYNC_SEND_WINSTREAK', (response) => {
            console.log(response)
            this.winStreakRepo.fresh(response.winStreak)
        })
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";

</style>