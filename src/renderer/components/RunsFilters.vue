<template>
  <div
    v-if="allRuns && allRuns.length > 0 && filteredRuns"
    class="filters"
  >
    <div
      v-if="filteredRunsTotal"
      class="total"
    >
      <div class="content">
        <div
          class="before"
          :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
        />
        <div
          class="mid"
          :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"
        />
        <div
          class="after"
          :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"
        />
        <div class="text">
          Total : <span class="number">{{ filteredRunsTotal.length }}</span>
        </div>
      </div>
    </div>
    <div class="search">
      <input
        v-model="filterText"
        :placeholder="$t('strings.searchRuns')"
        @input="resetPaginationFromInput()"
      >
    </div>
    <CustomSelect
      type="single"
      :items="sortOptions"
      :label="$t('select.sort')"
      :empty-message="$t('select.sortByDate')"
      order="desc"
      :selectable-order="order"
      @updateSelect="onUpdateSortMultiSelect"
      @updateOrder="onUpdateOrder"
    />
    <DateRangePicker @updateDateRange="onUpdateDateRange" />
    <CustomSelect
      v-if="allTags && tmpTagsWithRuns.length > 0"
      type="multi"
      :items="tmpTagsWithRuns"
      :label="$tc('dictionary.tag', 2)"
      :empty-message="$t('select.allTags')"
      @updateSelect="onUpdateTagsMultiSelect"
    />
    <CustomSelect
      v-if="allCharacters && tmpCharactersWithRuns.length > 0"
      type="multi"
      custom-value="name"
      :items="tmpCharactersWithRuns"
      :label="$tc('dictionary.character', 2)"
      :empty-message="$t('select.allCharacters')"
      @updateSelect="onUpdateCharactersMultiSelect"
    />
    <CustomSelect
      type="multi"
      :items="tmpGameStateWithRuns"
      :label="$tc('dictionary.save', 2)"
      :empty-message="$t('select.allSaves')"
      @updateSelect="onUpdateGameStateMultiSelect"
    />
    <CustomSelect
      type="single"
      :items="tmpWinConditionWithRuns"
      :label="$t('select.winCondition')"
      :empty-message="$t('select.allCondition')"
      order="desc"
      @updateSelect="onUpdateWinConditionMultiSelect"
    />
  </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Tag from '../store/classes/Tag'
import Character from '../store/classes/Character'
import Run from '../store/classes/Run'
import Winstreak from '../store/classes/WinStreak'
import CustomSelect from './Tools/CustomSelect.vue'
import DateRangePicker from './Tools/DateRangePicker.vue'
import format from '../helpers/format'
import i18nMixin from '../mixins/i18n'
export default {
    name: "RunsFilters",
    components: {
        CustomSelect,
        DateRangePicker
    },
    mixins: [i18nMixin],
    props: {
        filterOffset: Number,
        filterLimitPerPage: Number
    },
    data() {
        return {
            filterText: '',
            filterCharacters: [],
            filterTags: [],
            gameStateOptions: [1,2,3],
            filterGameStates: [],
            winConditionOptions: [
                {id: 0, value: "Win", name: this.$t('dictionary.win')},
                {id: 1, value: "Lose", name: this.$t('dictionary.lose')},
                {id: 2, value: "Ongoing", name: this.$t('dictionary.ongoing')},
                {id: 3, value: "CurrentWinStreak", name: this.$t('strings.currentWinStreak', 1)},
                {id: 4, value: "BestWinStreak", name: this.$t('strings.bestWinStreak', 1)}
            ],
            sortOptions: [
                {id: 0, value: "Date", name: this.$t('select.sortByDate')},
                {id: 1, value: "RunDuration", name: this.$t('select.sortByRunDuration')}
            ],
            order: "desc",
            filterWinCondition: undefined,
            filterSort: null,
            filterDateStart: null,
            filterDateEnd: null,
            tmpCharactersWithRuns: [],
            tmpWinConditionWithRuns: [],
            tmpGameStateWithRuns: [],
            tmpTagsWithRuns: []
        }
    },
    computed: {
        ...mapRepos({
            tagRepo: Tag,
            characterRepo: Character,
            runRepo: Run,
            winStreakRepo: Winstreak
        }),
        allTags() {
            return this.tagRepo.all()
        },
        allCharacters() {
            return this.characterRepo.where().all()
        },
        allRuns() {
            if (this.$isDev) console.time(`filtered get all runs`)
            const allRunsRepo = this.runRepo.all()
            if (this.$isDev) console.timeEnd(`filtered get all runs`)
            return allRunsRepo
        },
        filteredRunsTotal() {
            if (this.$isDev) console.time(`filtered runs total`)
            let filteredRunsTotal = this.runRepo.where((run) => { return this.filterRuns(run) }).orderBy((run) => {
                if (this.filterSort === "RunDuration") return format.formatDuration(run.runDuration)
                return run.runUpdate
            }, this.order).get()
            if (typeof this.filterWinCondition === "string") filteredRunsTotal = this.filterStreak(filteredRunsTotal)
            this.$emit('filteredRunsTotal', filteredRunsTotal)
            if (this.$isDev) console.timeEnd(`filtered runs total`)
            return filteredRunsTotal
        },
        filteredRuns() {
            if (this.$isDev) console.time(`filtered runs`)
            const filteredRuns = this.filteredRunsTotal.slice(this.filterOffset, this.filterLimitPerPage + this.filterOffset)
            this.$emit('filteredRuns', filteredRuns)
            if (this.$isDev) console.timeEnd(`filtered runs`)
            return filteredRuns
        },
        bestWinStreak() {
            return this.winStreakRepo?.orderBy(winStreak => winStreak.runs_ids.length, 'desc')?.first()
        }
    },
    watch: {
        allRuns(newVal, oldVal) {
            const canUpdate = this.filtersCanUpdate(newVal, oldVal)
            if (canUpdate || this.tmpCharactersWithRuns.length === 0) this.charactersWithRuns()
            if (canUpdate || this.tmpWinConditionWithRuns.length === 0) this.winConditionWithRuns()
            if (canUpdate || this.tmpGameStateWithRuns.length === 0) this.gameStateWithRuns()
            if (canUpdate || this.tmpTagsWithRuns.length === 0) this.tagsWithRuns()
        },
        allCharacters(newVal, oldVal) {
            if (newVal.length !== oldVal.length || this.tmpCharactersWithRuns.length === 0) this.charactersWithRuns()
        },
        allTags(newVal, oldVal) {
            if (newVal.length !== oldVal.length || this.tmpTagsWithRuns.length === 0) this.tagsWithRuns()
        }
    },
    mounted() {
        this.charactersWithRuns()
        this.winConditionWithRuns()
        this.gameStateWithRuns()
        this.tagsWithRuns()
    },
    methods: {
        filtersCanUpdate(newVal, oldVal) {
            if(newVal.length === 0) return false
            if(newVal.length !== oldVal.length) return true
            if(newVal[newVal.length - 1]?.runEnd?.win !== oldVal[oldVal.length - 1]?.runEnd?.win || newVal[newVal.length - 1]?.runEnd?.date !== oldVal[oldVal.length - 1]?.runEnd?.date) return true
            return false
        },
        charactersWithRuns() {
            if (this.$isDev) console.time(`filtered characters with runs`)
            const characters = this.characterRepo.where((character) => { return this.checkCharacters(character) }).orderBy('trueName', 'asc').get()
            this.tmpCharactersWithRuns = characters
            this.resetFilters(characters, "characters")
            if (this.$isDev) console.timeEnd(`filtered characters with runs`)
        },
        winConditionWithRuns() {
            if (this.$isDev) console.time(`filtered win condition with runs`)
            const conditions = this.winConditionOptions.filter(condition => this.checkWinCondition(condition))
            this.tmpWinConditionWithRuns = conditions
            this.resetFilters(conditions, "winCondition")
            if (this.$isDev) console.timeEnd(`filtered win condition with runs`)
        },
        gameStateWithRuns() {
            if (this.$isDev) console.time(`filtered gamestate with runs`)
            const gameStates = this.gameStateOptions.filter(gameState => this.checkGameState(gameState))
            this.tmpGameStateWithRuns = gameStates
            this.resetFilters(gameStates, "gameStates")
            if (this.$isDev) console.timeEnd(`filtered gamestate with runs`)
        },
        tagsWithRuns() {
            if (this.$isDev) console.time(`filtered tags with runs`)
            const tags = this.tagRepo.where((tag) => { return this.checkTags(tag) }).orderBy('value', 'asc').get()
            console.log("tags", tags)
            this.tmpTagsWithRuns = tags
            this.resetFilters(tags, "tags")
            if (this.$isDev) console.timeEnd(`filtered tags with runs`)
        },
        onUpdateOrder(selected) {
            this.order = selected
            this.$emit('resetPagination')
        },
        onUpdateDateRange(range) {
            this.filterDateStart = range.start
            this.filterDateEnd = range.end
            this.$emit('resetPagination')
        },
        onUpdateWinConditionMultiSelect(selected) {
            this.filterWinCondition = selected.length === 0 ? undefined
            : selected[0].value === 'Win' ? true
            : selected[0].value === 'Lose' ? false
            : selected[0].value === 'Ongoing' ? null
            : selected[0].value
            this.$emit('resetPagination')
        },
        onUpdateSortMultiSelect(selected) {
            this.filterSort = selected[0]?.value
            this.$emit('resetPagination')
        },
        onUpdateGameStateMultiSelect(selected) {
            this.filterGameStates = selected
            this.$emit('resetPagination')
        },
        onUpdateTagsMultiSelect(selected) {
            this.filterTags = selected
            this.$emit('resetPagination')
        },
        onUpdateCharactersMultiSelect(selected) {
            this.filterCharacters = selected
            this.$emit('resetPagination')
        },
        resetPaginationFromInput() {
            if (this.filterText.length > 3 || this.filterText.length === 0) this.$emit('resetPagination')
        },
        resetFilters(availableFilters, context) {
            // Reset filter in case no filter available but at least one is selected
            switch (context) {
                case "winCondition":
                    if (availableFilters.length === 0 && this.filterWinCondition !== null) this.filterWinCondition = null
                    break
                case "gameState":
                    if (availableFilters.length === 0 && this.filterGameStates.length > 0) this.filterGameStates = []
                    break
                case "tags":
                    if (availableFilters.length === 0 && this.filterTags.length > 0) this.filterTags = []
                    break
                case "characters":
                    if (availableFilters.length === 0 && this.filterCharacters.length > 0) this.filterCharacters = []
                    break
            }
        },
        checkFilters(runsToCheck, from) {
            // Check all filters based on other filters
            let runs = runsToCheck
            // Check if runs are on date range
            if (this.filterDateStart && this.filterDateEnd) {
                runs = runs.where((run) => run.runStart > this.filterDateStart).where((run) => run.runStart < this.filterDateEnd)
                if (runs.get().length < 1) return runs.get()
            }

            // Check if runs are selected win condition
            if ((this.filterWinCondition === true || this.filterWinCondition === false || this.filterWinCondition === null) && from !== "winCondition") {
                runs = runs.where((run) => run.runEnd.win === this.filterWinCondition)
                if (runs.get().length < 1) return runs.get()
            }

            // Check if runs has gamestate
            if (this.filterGameStates.length > 0 && from !== "gameStates") {
                runs = runs.where((run) => this.filterGameStates.includes(run.gameState))
                if (runs.get().length < 1) return runs.get()
            }

            // Check if runs has filtered tags
            if (this.filterTags.length > 0 && from !== "tags") {
                runs = runs.where((run) => run.tags_ids.some(tag => this.filterTags.map(filterTag => filterTag.id).includes(tag)))
                if (runs.get().length < 1) return runs.get()
            }

            // Check if runs has filtered characters
            if (this.filterCharacters.length > 0 && from !== "characters") {
                runs = runs.where((run) => this.filterCharacters.map(filterCharacter => filterCharacter.id).includes(run.characters[0].id))
                if (runs.get().length < 1) return runs.get()
            }

            return runs.get()
        },
        checkWinCondition(condition) {
            let runs
            const thisCondition = condition.value === "Win" ? true : condition.value === "Lose" ? false : condition.value === "Ongoing" ? null : undefined 

            // Init Check if runs has save
            if (thisCondition === undefined) return condition

            runs = this.runRepo.where((run) => run.runEnd.win === thisCondition)
            if (runs.get().length < 1) return

            if (this.checkFilters(runs, "winCondition").length < 1) return
            return condition
        },
        checkGameState(gameState) {
            let runs

            // Init Check if runs has save
            runs = this.runRepo.where((run) => run.gameState === gameState)
            if (runs.get().length < 1) return

            if(this.checkFilters(runs, "gameStates").length < 1) return

            return gameState
        },
        checkTags(tag) {
            let runs

            // Init Check if runs has tag
            runs = this.runRepo.where((run) => run.tags_ids.includes(tag.id))
            if (runs.get().length < 1) return

            if(this.checkFilters(runs, "tags").length < 1) return

            return tag
        },
        checkCharacters(character) {
            let runs

            // Check if it's ignore character
            if (character.ignore) return
            
            // Check if runs has character
            runs = this.runRepo.where((run) => run.characters[0]?.name === character?.name && run.characters[0].version === character.version)
            if (runs.get().length < 1) return

            if(this.checkFilters(runs, "characters").length < 1) return

            character.name = character.id === "19" ? `${this.$t("players.19.name")} & ${this.$t("players.20.name")}` : `${this.t(`players.${character.id}.name`, character.name)}${character.version === 'Alternate' ? ` (${this.$t('dictionary.tainted')})` : ''}`
            return character
        },
        filterRuns(run) {
            // Date filter
            if (this.filterDateStart && run.runStart < this.filterDateStart) return
            if (this.filterDateEnd && run.runStart > this.filterDateEnd) return

            // Win condition filter
            if ((this.filterWinCondition === true || this.filterWinCondition === false || this.filterWinCondition === null) && run.runEnd.win !== this.filterWinCondition) return

            // Save filter
            if (this.filterGameStates.length > 0 && !this.filterGameStates.includes(run.gameState)) return

            // Tags filter
            if (this.filterTags.length > 0 && !this.filterTags.some(tag => run.tags_ids.includes(tag.id))) return

            // Characters filter
            if (this.filterCharacters.length > 0 && !this.filterCharacters.map(filterCharacter => filterCharacter.id).includes(run.characters[0].id)) return

            // Text filter
            if(this.filterText.length > 3) {
                if (this.filterText[0] !== ":") {
                    const textSearchValue = this.filterText.normalize('NFC').toLowerCase()
                    const characterName = run.characters[0].trueName.normalize('NFC').toLowerCase()
                    const customRunName = run.customName.normalize('NFC').toLowerCase()
                    const id = run.id.normalize('NFC').toLowerCase()
                    if (
                        !characterName.includes(textSearchValue) &&
                        !customRunName.includes(textSearchValue) &&
                        !id.includes(textSearchValue)
                        ) return
                } else {
                    const customQuery = this.filterText.split(":")
                    switch (customQuery[1]) {
                        case "item":
                        if (!isNaN(parseInt(customQuery[2]))) {
                            if (isNaN(parseInt(customQuery[3])) || parseInt(customQuery[3]) === 0) {
                                if (run.floors[0]?.itemsCollected?.find(item => item.id === parseInt(customQuery[2])  && item.type === "item")) return run
                                return
                            }
                            if (run.floors[parseInt(customQuery[3]) - 1]?.itemsCollected?.find(item => item.id === parseInt(customQuery[2]) && item.type === "item")) return run
                            return
                        }
                    }
                }
            }
            return run
        },
        filterStreak(runs) {
            let checkRuns = runs
            if (this.filterWinCondition === "CurrentWinStreak") {
                const deathIndex = checkRuns.findIndex(run => run.runEnd.win === false)
                checkRuns = deathIndex > -1 ? checkRuns.slice(0,deathIndex) : checkRuns
                return checkRuns
            }
            if (this.filterWinCondition === "BestWinStreak") {
                if (this.bestWinStreak) {
                    if (this.$isDev) console.log(this.bestWinStreak);
                    return checkRuns.filter(run => this.bestWinStreak.runs_ids.includes(run.id))
                }
            }
            return checkRuns
        }
    }
};
</script>

<style lang="scss">
.filters {
    margin-bottom: 16px;
    text-align: left;
    padding: 0px 12px;
    display: flex;
    flex-wrap: wrap;
    margin-left: -8px;
    margin-right: -8px;
    > div, > span {
        margin: 8px;
    }
    .total {
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        position: relative;
        z-index: 2;
        .content {
            position: relative;
            transform-origin: top left;
            transform: translate(4px, 21px) rotate(-1deg);
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
                transform: translateX(-7px);
            }
            > .after {
                height: 100%;
                width: 12px;
                right: 0px;
                top: 0px;
                transform: translateX(11px);
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
            .text {
                position: relative;
                padding: 4px 8px 8px 8px;
            }
        }
    }
}
</style>