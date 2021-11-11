<template>
    <transition name="show">
        <div v-if="allRunsToRemoveAlert && allRunsToRemoveAlert.length > 0" class="pop-up ask-remove-run">
            <div class="title">Broken runs found ?</div>
            <transition-group name="broken-run-group-transition" tag="ul" class="broken-runs-container">
                <template v-for="(run, ridx) in allRunsToRemoveAlert">
                    <li class="broken-run-group-transition-item" :data-run-id="run.id" :key="`broken${run.id}${ridx}`">
                        {{run.id}}
                        <div @click="onRemoveRunClick" :data-run-id="run.id" class="remove">Remove</div>
                    </li>
                </template>
            </transition-group>
        </div>
    </transition>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
export default {
    name: "BrokenRuns",
    data() {
        return {
            anyBrokenRun: []
        }
    },
    mounted() {
        window.ipc.on('SYNC_ASK_REMOVE_RUN', (response) => {
            console.log(response)
            this.updateRun = response.run
        })
        this.anyBrokenRun = this.allRunsToRemoveAlert
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        allRunsToRemoveAlert() {
            return this.runRepo.where((run) => {return run.toRemove.status === true && run.toRemove.checkedByUser === false}).get()
        },
        updateRun: {
            get: function(run) {
                return this.runRepo.query().where('id', run.id).get()
            },
            set: function (run) {
                this.runRepo.where('id', run.id).update(run)
            }
        },
    },
    methods: {
        // onRunClick(e) {
        //     const runId = e.currentTarget.getAttribute('data-id')
        //     const run = this.runRepo.find(runId)
        //     console.log(run)
        // },
        onRemoveRunClick(e) {
            const runId = e.currentTarget.getAttribute('data-run-id')
            const run = this.runRepo.find(runId)
            window?.ipc?.send('USER_REMOVE_RUN', run.id)
        },
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.pop-up.ask-remove-run {
    position: fixed;
    bottom: 0px;
    right: 0px;
    z-index: 10;
    &.fade-enter-active, &.fade-leave-active {
        transition: opacity .5s;
    }
    &.fade-enter, .fade-leave-to {
        opacity: 0;
    }
}
</style>