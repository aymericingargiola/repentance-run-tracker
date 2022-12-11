<template>
  <transition name="show">
    <div
      v-if="allRunsToRemoveAlert && allRunsToRemoveAlert.length > 0"
      class="pop-up ask-remove-run"
    >
      <div class="title">
        Broken runs found ?
      </div>
      <transition-group
        name="broken-run-group-transition"
        tag="ul"
        class="broken-runs-container"
      >
        <template v-for="(run, ridx) in allRunsToRemoveAlert">
          <li
            :key="`broken${run.id}${ridx}`"
            class="broken-run-group-transition-item"
            :data-run-id="run.id"
          >
            <div class="run-id">
              {{ run.id }}
            </div>
            <button
              :data-run-id="run.id"
              class="warning"
              @click="onRemoveRunClick"
            >
              Delete run
            </button>
            <button
              :data-run-id="run.id"
              data-win="true"
              @click="onForceEndRunClick"
            >
              Run is win
            </button>
            <button
              :data-run-id="run.id"
              data-win="false"
              @click="onForceEndRunClick"
            >
              Run is lost
            </button>
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
    mounted() {
        window.ipc.on('SYNC_ASK_REMOVE_RUN', (response) => {
            console.log(response)
            this.updateRun = response.run
        })
        this.anyBrokenRun = this.allRunsToRemoveAlert
    },
    methods: {
        // onRunClick(e) {
        //     const runId = e.currentTarget.getAttribute('data-id')
        //     const run = this.runRepo.find(runId)
        //     console.log(run)
        // },
        onRemoveRunClick(e) {
            const runId = e.currentTarget.getAttribute('data-run-id')
            this.runRepo.destroy(runId)
            window?.ipc?.send('USER_REMOVE_RUN', runId)
        },
        onForceEndRunClick(e) {
            const win = e.currentTarget.getAttribute('data-win') === "true"
            const runId = e.currentTarget.getAttribute('data-run-id')
            const run = this.runRepo.where('id', runId)
            run.update({ toRemove: {status: false, checkedByUser: true} })
            run.update({ runEnd: {win: win} })
            window?.ipc?.send('USER_FORCE_END_RUN', {runId: runId, win: win})
        }
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.pop-up.ask-remove-run {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10;
    padding: 20px;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    background: rgba(255,255,255,0.5);
    box-shadow: 0px 0px 10px rgba(0,0,0,0.5);
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .broken-runs-container {
      max-height: 400px;
      overflow: auto;
      > li {
        max-width: 300px;
        padding: 8px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        &:not(:first-child) {
          margin-top: 10px;
        }
        .run-id {
          width: 100%;
          margin-bottom: 4px;
        }
        button {
          margin: 0px 4px;
        }
      }
    }
    &.fade-enter-active, &.fade-leave-active {
        transition: opacity .5s;
    }
    &.fade-enter, .fade-leave-to {
        opacity: 0;
    }
}
</style>