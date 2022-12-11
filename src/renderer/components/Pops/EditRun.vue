<template>
  <transition name="open">
    <div
      v-if="isOpen && runRepo"
      class="config-popup edit-run-popup"
    >
      <div
        class="overlay"
        @click="openOrCloseEditRun()"
      />
      <div class="config-items edit-run">
        <div
          class="mid"
          :style="{backgroundImage:`url('img/cards/big-frame.png')`}"
        />
        <div class="content">
          <div class="heading">
            {{ $t('editRun.title') }}
          </div>
          <div class="config-item" v-if="currentRun.runEnd.win === null">
            <div class="title">
              {{ $t('editRun.runEndStatus') }}
            </div>
            <div class="buttons-list">
              <button
                :data-run-id="currentRun.id"
                data-win="true"
                @click="onForceEndRunClick"
              >
                {{$t('dictionary.win')}}
              </button>
              <button
                :data-run-id="currentRun.id"
                data-win="false"
                @click="onForceEndRunClick"
              >
                {{$t('dictionary.lose')}}
              </button>
            </div>
          </div>
          <div class="config-item">
            <div class="title">
              {{ $t('editRun.runTitle') }}
            </div>
            <input
              v-model="customName"
              type="text"
              @change="updateCustomName"
            >
          </div>
          <div class="config-item">
            <div class="title">
              {{ $t('editRun.runDuration') }}
            </div>
            <vue-timepicker
              lazy
              v-model="runDuration"
              format="HH:mm:ss"
              @change="updateRunDuration"
            />
          </div>
          <div class="config-item">
            <div class="title">
              {{ $t('editRun.videoLink') }}
            </div>
            <input
              v-model="videoLink"
              type="texte"
              @change="updateVideoLink"
            >
          </div>
          <div class="config-item">
            <div class="title">
              {{ $t('editRun.videoHighlights') }}
            </div>
            <Tags
              :run-id="currentRun.id"
              :type="'time'"
              :video-link="videoLink"
            />
          </div>
          <div class="config-item">
            <div class="title">
              {{ $tc('dictionary.tag', 2) }}
            </div>
            <Tags
              :run-id="currentRun.id"
              :type="'string'"
            />
          </div>
          <div class="config-item">
            <button
              class="warning"
              @click="removeRun()"
            >
              {{ $t('strings.removeRun') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
import Tags from '../Tools/Tags.vue'
export default {
    name: "EditRun",
    components: {
        Tags
    },
    data() {
        return {
            isOpen: false,
            id: null,
            timer: null
        }
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        currentRunItem() {
            console.time(`Get run to edit ${this.id}`)
            const runToEditItem = this.runRepo.query().where('id', this.id)
            console.timeEnd(`Get run to edit ${this.id}`)
            return runToEditItem
        },
        currentRun() {
            console.time(`Get run to edit currentRun ${this.id}`)
            const runToEditCurrentRun = this.currentRunItem?.first()
            console.timeEnd(`Get run to edit currentRun ${this.id}`)
            return runToEditCurrentRun
        },
        customName: {
            get: function() {
                return this.currentRun.customName
            },
            set: function (value) {
                if (this.timer) clearTimeout(this.timer);
                this.timer = setTimeout(()=>{
                  this.currentRunItem.update({ customName: value })
                }, 1000);
            }
        },
        runDuration: {
            get: function() {
                return this.currentRun.runDuration
            },
            set: function (value) {
              this.currentRunItem.update({ runDuration: value })
            }
        },
        videoLink: {
            get: function() {
                return this.currentRun.videoLink
            },
            set: function (value) {
                this.currentRunItem.update({ videoLink: value })
            }
        }
    },
    mounted() {
        this.$root.$on('OPEN_EDITRUN', (id) => {
            if(id) this.id = id
            this.isOpen = !this.isOpen
        })
    },
    methods: {
        openOrCloseEditRun() {
            this.$root.$emit('OPEN_EDITRUN')
        },
        updateCustomName(e) {
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(()=>{
              console.log("updateCustomName")
              window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'customName', value: e.target.value })
            }, 1000);
        },
        updateRunDuration(e) {
            console.log("updateRunDuration")
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'runDuration', value: e.displayTime })
        },
        updateVideoLink(e) {
            console.log("updateVideoLink")
            window?.ipc?.send('USER_UPDATE_RUN', { id: this.id, property: 'videoLink', value: e.target.value })
        },
        removeRun() {
            window?.ipc?.send('USER_REMOVE_RUN', this.id)
            this.openOrCloseEditRun()
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
}
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
// .edit-run-popup {
//     position: fixed;
//     top: 30px;
//     width: 100%;
//     height: calc(100% - 30px);
//     z-index: 2;
//     padding: 48px;
//     > .overlay {
//         content: "";
//         position: absolute;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: transparent;
//         z-index: 0;
//     }
//     &.open-enter-active, &.open-leave-active {
//         transition: .2s;
//     }
//     &.open-enter, &.open-leave-to {
//         opacity: 0;
//         transform: scale(0.95) translateY(100%) scaleX(0.20);
//     }
//     .edit-run {
//         position: relative;
//         z-index: 1;
//         height: 100%;
//         > .mid {
//             z-index: 0;
//             position: absolute;
//             background-repeat: no-repeat;
//             background-size: 100% 100%;
//             pointer-events: none;
//         }
//         > .mid {
//             height: 100%;
//             width: 100%;
//             left: 0px;
//             top: 0px;
//             background-repeat: no-repeat;
//         }
//         .content {
//             height: 100%;
//             overflow: auto;
//             position: relative;
//             z-index: 1;
//             padding: 36px 36px 56px 28px;
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//         }
//         .heading {
//             font-size: 80px;
//             font-weight: bold;
//             margin-bottom: 28px;
//         }
//         .config-item {
//             display: flex;
//             flex-wrap: wrap;
//             justify-content: center;
//             width: 100%;
//             .title {
//                 margin-right: 12px;
//                 pointer-events: none;
//             }
//             .hint {
//                 width: 100%;
//                 font-size: 12px;
//                 transition: 0.25s ease;
//                 transform: scale(0.8);
//                 opacity: 0;
//                 pointer-events: none;
//                 min-height: 12px;
//             }
//             &:not(:first-child) {
//                 margin-top: 16px;
//             }
//             &:hover {
//                 .hint {
//                     opacity: 0.8;
//                     transform: scale(1);
//                 }
//             }
//         }
//     }
// }
</style>