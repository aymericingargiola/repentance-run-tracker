<template>
  <section class="section runs">
    <RunsFilters
      :filter-offset="filterOffset"
      :filter-limit-per-page="filterLimitPerPage"
      :filter-order="filterOrder"
      @filteredRunsTotal="onUpdateFilteredRunsTotal"
      @filteredRuns="onUpdateFilteredRuns"
      @resetPagination="resetPagination"
    />
    <transition-group
      name="run-group-transition"
      tag="ul"
      class="runs-container"
    >
      <template v-for="(run, ridx) in filteredRuns">
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
          <div
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
          />
          <div :class="['run-content', run.customName != '' ? 'has-custom-name' : '',
          run.runEnd && run.floors ? 'has-bosses' : '']">
            <RunInfos
              :id="run.id"
              :game-state="run.gameState"
              :seed="run.seed"
              :characters="run.characters"
              :floors="run.floors"
              :run-start="run.runStart"
              :run-end="run.runEnd"
              :run-duration="run.runDuration"
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
            tempUpdateRun: null,
            filteredRunsTotal: 0,
            filteredRuns: [],
            currentPage: 1,
            filterLimitPerPage: 6,
            filterOffset: 0,
            filterOrder: 'desc'
        }
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        allRuns() {
            return this.runRepo.all()
        },
        updateRun: {
            get: function (run) {
                return this.runRepo.query().where('id', run.id).first()
            },
            set: function (run) {
                this.runRepo.where('id', run.id).update(run)
            }
        }
    },
    mounted() {
        window.ipc.send('ASK_RUNS')
        window.ipc.on('SYNC_SEND_RUNS', (response) => {
            console.log(response)
            this.runRepo.fresh(response.runs)
        })
        window.ipc.on('SYNC_CREATE_RUN', (response) => {
            console.log(response)
            this.runRepo.insert(response.run)
            this.canUpdateRun = false
            setTimeout(() => {
                if(this.tempUpdateRun != null) {
                    this.updateRun = this.tempUpdateRun
                    this.tempUpdateRun = null
                }
                this.canUpdateRun = true
            }, 1500);
        })
        window.ipc.on('SYNC_UPDATE_RUN', (response) => {
            if(!this.canUpdateRun) {
                this.tempUpdateRun = response.run
            } else {
                if (this.validRunUpdate(response)) {
                    console.log(response)
                    this.updateRun = response.run
                }
            }
        })
        window.ipc.on('SYNC_REMOVE_RUN', (response) => {
            console.log(response)
            this.runRepo.destroy(response.run)
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
    padding: 0px 24px;
}
.run {
    position: relative;
    margin-bottom: 0px;
    box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
    transition: 1.5s ease;
    width: 100%;
    // cursor: pointer;
    &:not(:first-child) {
        margin-top: 12px;
    }
    &.run-group-transition-enter{
        opacity: 0;
        transform: translateY(100%);
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
        width: 15px;
        left: 0px;
        top: 0px;
        transform: translateX(-14.25px);
    }
    > .after {
        height: 100%;
        width: 15px;
        right: 0px;
        top: 0px;
        transform: translateX(14.25px);
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
    .run-content {
        z-index: 1;
        position: relative;
        display: flex;
        padding: 24px;
        padding-bottom: 56px;
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
            bottom: 30px;
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