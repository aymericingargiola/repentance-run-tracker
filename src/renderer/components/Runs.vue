<template>
  <section class="section runs">
    <RunsFilters
      :filter-offset="filterOffset"
      :filter-limit-per-page="filterLimitPerPage"
      @filteredRunsTotal="onUpdateFilteredRunsTotal"
      @filteredRuns="onUpdateFilteredRuns"
      @resetPagination="resetPagination"
    />
    <transition-group
      name="run-group-transition"
      tag="ul"
      class="runs-container"
    >
      <template v-for="(run, ridx) in runsToShow">
        <li
          :key="run.id"
          :class="
            [
              'run', 'run-group-transition-item',
              run.runEnd.win === true ? 'run-win' : run.runEnd.win === false ? 'run-death' : 'run-unfinished',
              run.toRemove.status === true && run.toRemove.checkedByUser === false ? 'run-to-remove-unchecked' : run.toRemove.status === true && run.toRemove.checkedByUser === true ?'run-to-remove-checked' : ''
            ]"
          :data-id="run.id + ridx"
        >
          <!-- <div
            class="before"
            :style="{backgroundImage:`url('img/cards/bar-big-left_01.png')`}"
          />
          <div
            class="mid"
            :style="{backgroundImage:`url('img/cards/bar-big-mid_01.png')`}"
          />
          <div
            class="after"
            :style="{backgroundImage:`url('img/cards/bar-big-right_01.png')`}"
          /> -->
          <div
            :class="['run-content', run.customName != '' ? 'has-custom-name' : '',
                     run.runEnd && run.floors ? 'has-bosses' : '']"
          >
            <RunInfos
              :id="run.id"
              :game-state="parseInt(run.gameState)"
              :seed="run.seed"
              :characters="run.characters"
              :floors="run.floors"
              :run-start="run.runStart"
              :run-end="run.runEnd"
              :run-duration="run.runDuration"
              :run-killer="run.runKiller"
            />
            <RunCharacter
              :characters="run.characters"
              :floors="run.floors"
              :run-end="run.runEnd"
            />
            <RunFloorsSlider
              :id="run.id"
              :index="ridx"
              :floors="run.floors"
              :game-mode="run.gameMode"
              :characters="run.characters"
            />
            <RunBosses
              v-if="run.runEnd && run.floors"
              :floors="run.floors"
            />
            <div
              v-if="run.customName != ''"
              class="run-custom-name"
            >
              <div
                class="before"
                :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
              />
              <div
                class="mid"
                :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"
              />
              <div
                class="after"
                :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"
              />
              <div
                class="content"
                :title="run.customName"
              >
                {{ run.customName }}
              </div>
            </div>
          </div>
        </li>
      </template>
    </transition-group>
    <Pagination
      v-if="!$inRun.status"
      :current-page="currentPage"
      :items-total="filteredRunsTotal"
      :items-per-page="filterLimitPerPage"
      :max-pages-visible="3"
      :offset="filterOffset"
      @updatePagination="onUpdatePagination"
    />
    <div
      v-if="filteredRuns && filteredRuns.length === 0"
      class="empty-runs"
    >
      <div
        class="image-1 animated"
        style="background-image:url('img/loadimages/loadimages-001.png')"
      />
      <div
        class="image-2 animated"
        style="background-image:url('img/loadimages/loadimages-001_2.png')"
      />
      <div class="message">
        <span v-if="allRuns && allRuns.length === 0">{{ $t('strings.startFirstRun') }}</span>
        <span v-if="filteredRuns && filteredRuns.length === 0 && allRuns && allRuns.length > 0">{{ $t('strings.noRunsFound') }}</span>
      </div>
    </div>
  </section>
</template>

<script>
// import moment from 'moment'
import runsMixin from '../mixins/runs'
import { mapRepos } from '@vuex-orm/core'
import Run from '../store/classes/Run'
import RunInfos from '../components/RunsElements/Infos.vue'
import RunCharacter from '../components/RunsElements/Character.vue'
import RunBosses from '../components/RunsElements/Bosses.vue'
import RunFloorsSlider from '../components/RunsElements/FloorsSlider.vue'
import RunsFilters from './RunsFilters.vue'
import Pagination from './Tools/Pagination.vue'
export default {
    name: "Runs",
    components: {
        RunInfos,
        RunCharacter,
        RunBosses,
        RunFloorsSlider,
        RunsFilters,
        Pagination,
    },
    mixins: [runsMixin],
    data() {
        return {
            canUpdateRun: true,
            tempCurrentRunToRemove: [],
            tempCurrentRun: [],
            filteredRunsTotal: 0,
            filteredRuns: [],
            currentPage: 1,
            filterLimitPerPage: 6,
            filterOffset: 0,
        }
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        allRuns() {
            console.time(`get all runs`)
            const allRuns = this.runRepo?.all()
            console.timeEnd(`get all runs`)
            return allRuns
        },
        runsToShow() {
          console.time(`get runs to show`)
          const runs = this.$inRun.status ? this.tempCurrentRun : this.filteredRuns
          console.timeEnd(`get runs to show`)
          return runs
        }
    },
    mounted() {
        window.ipc.on('SYNC_CREATE_RUN', (response) => {
            console.log(response)
            if (!this.$inRun.status) return
            const runIndex = this.tempCurrentRun.findIndex((run) => run.id === response.run.id)
            if (runIndex === -1) this.tempCurrentRun.unshift(response.run)
        })
        window.ipc.on('SYNC_UPDATE_RUN', (response) => {
            console.log(response)
            if (!this.$inRun.status && response.channel === 'run end') this.runRepo.where('id', response.run.id).update(response.run)
            if (!this.$inRun.status) return
            const runIndex = this.tempCurrentRun.findIndex((run) => run.id === response.run.id)
            if (runIndex === -1) this.tempCurrentRun.unshift(response.run)
            if (this.validRunUpdate(response, this.tempCurrentRun[runIndex])) {
                this.tempCurrentRun.splice(runIndex, 1, response.run)
            }
        })
        window.ipc.on('SYNC_REMOVE_RUN', (response) => {
            console.log(response)
            if (this.$inRun.status) {
              const removeIndex = this.tempCurrentRun.findIndex((run) => run.id === response.run)
              console.log(this.tempCurrentRun, response.run.id, removeIndex)
              if (removeIndex > -1) this.tempCurrentRun.splice(removeIndex, 1)
            }
            else if (!this.$inRun.status) this.runRepo.destroy(response.run)
        })
        window.ipc.on('SYNC_INRUN_STATUS', (response) => {
          if (!response.inRun && this.tempCurrentRun.length > 0) {
            this.runRepo.insert(this.tempCurrentRun)
            this.tempCurrentRun = []
          }
        })
    },
    methods: {
        onUpdatePagination(pagination) {
            this.currentPage = pagination.currentPage
            this.filterOffset = pagination.offset
        },
        resetPagination() {
            this.currentPage = this.currentPage === 1 ? this.currentPage : 1
            this.filterOffset = this.filterOffset === 0 ? this.filterOffset : 0
        },
        onUpdateFilteredRunsTotal(total) {
            this.filteredRunsTotal = total.length
        },
        onUpdateFilteredRuns(total) {
            this.filteredRuns = total
        }
    },
};
</script>

<style lang="scss">
@import "../assets/styles/scss/vars/_colors";
.section.runs {
    padding: 20px;
    position: relative;
}
.runs-container {
    position: relative;
    padding: 0px 12px;
}
.run {
    position: relative;
    margin-bottom: 0px;
    transition: 1.5s ease;
    width: 100%;
    border: transparent 12px solid;
    border-image: url('../../../public/img/cards/bar-big-border-frame2.png') 15 fill;
    border-image-width: 32px;
    filter: drop-shadow(6px 6px 0px rgba(0,0,0,0.25));
    margin-top: 24px;
    &.run-group-transition-enter{
        opacity: 0;
        transform: translateY(calc(100% + 24px));
    }
    &.run-group-transition-leave-to {
        opacity: 0;
        transform: translateY(50px);
    }
    &.run-group-transition-leave-active {
        position: absolute;
        width: calc(100% - 48px);
    }
    &.run-group-transition-move {
        transition: transform 1s ease;
    }
    &.run-group-transition-item {
        transition: transform 1s ease, opacity 1s ease;
        //display: block;
    }
    .run-content {
        z-index: 1;
        position: relative;
        display: flex;
        padding: 24px;
        padding-bottom: 28px;
        padding-top: 72px;
        overflow: hidden;
        width: 100%;
        z-index: 1;
        &.has-custom-name {
            padding-bottom: 82px;
        }
        &::before {
            content: "";
            position: absolute;
            height: 85%;
            width: 140px;
            background: linear-gradient(to right, $paper-white-darker 70%, transparent 100%);
            //background: black;
            left: 0px;
            top: calc(50% - 6px);
            opacity: 1;
            transform: translateX(0px) translateY(-50%);
            z-index: 2;
        }
        &::after {
            content: "";
            position: absolute;
            height: 85%;
            width: 50px;
            background: linear-gradient(to left, $paper-white-darker 20%, transparent 100%);
            right: 0px;
            top: calc(50% - 6px);
            opacity: 1;
            transform: translateX(0px) translateY(-50%);
            z-index: 2;
        }
        &.has-bosses {
            &::after {
                width: 140px;
                background: linear-gradient(to left, $paper-white-darker 70%, transparent 100%);
                z-index: 1;
            }
        }
        .run-custom-name {
            display: block;
            position: absolute;
            bottom: 20px;
            left: 15px;
            z-index: 3;
            padding: 5px 10px 10px 10px;
            max-width: 95%;
            > .before, .after, .mid {
                z-index: 0;
                position: absolute;
                background-repeat: no-repeat;
                background-size: 100% 100%;
                pointer-events: none;
            }
            > .before {
                content: "";
                height: 100%;
                width: 8px;
                left: 0px;
                top: 0px;
                transform: translateX(-8px);
            }
            > .after {
                height: 100%;
                width: 12px;
                right: 0px;
                top: 0px;
                transform: translateX(12px);
                z-index: 2;
            }
            > .mid {
                height: 100%;
                width: 100%;
                left: 0px;
                top: 0px;
                background-size: contain;
                background-repeat: repeat-x;
            }
            .content {
                position: relative;
                z-index: 2;
                min-height: 18px;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &:hover {
                    cursor: default;
                }
            }
        }
    }
    &.run-unfinished {
        &:first-child {
            .run-content {
                .swiper-wrapper {
                    .floor {
                        &:last-child {
                            .floor-content {
                                outline: 5px dashed rgba(0,0,0,0.1);
                                outline-offset: 0px;
                                animation-name: outline-zooming;
                                animation-iteration-count: infinite;
                                animation-duration: 1s;
                                @keyframes outline-zooming {
                                    0% {
                                        outline-offset: 0px;
                                        outline: 5px dashed rgba(0,0,0,0.1);
                                    }
                                    25% {
                                        outline-offset: 3px;
                                        outline: 5px dashed rgba(0,0,0,0.3);
                                    }
                                    50% {
                                        outline-offset: 3px;
                                        outline: 5px dashed rgba(0,0,0,0.3);
                                    }
                                    100% {
                                        outline-offset: 0px;
                                        outline: 5px dashed rgba(0,0,0,0.1);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    &.run-death {
        .run-content {
            .character {
                .hearts {
                    filter: grayscale(1);
                    opacity: 0.5;
                }
            }
        }
    }
}
.empty-runs {
    position: relative;
    height: calc(100vh - 70px);
    overflow: hidden;
    .image-1, .image-2 {
      position: absolute;
      left: 0px;
      top: 0px;
      height: 100%;
      width: 100%;
      background-repeat: no-repeat;
      background-position: center;
      transform: scale(2);
      &.animated {
        animation-name: alternate;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-duration: 0.20s;
        animation-direction: alternate;
      }
    }
    .image-2 {
      animation-delay: 0.20s;
    }
}
</style>