<template>
  <div
    v-if="allRuns && allRuns.length > 0 && filteredRuns"
    class="filters"
  >
    <div class="search">
      <input
        v-model="filterText"
        :placeholder="$t('strings.searchRuns')"
        @input="resetPaginationFromInput()"
      >
    </div>
    <DateRangePicker @updateDateRange="onUpdateDateRange" />
    <CustomSelect
      v-if="allTags && tagsWithRuns.length > 0"
      type="multi"
      :items="tagsWithRuns"
      :label="$tc('dictionary.tag', 2)"
      :empty-message="$t('select.allTags')"
      @updateSelect="onUpdateTagsMultiSelect"
    />
    <CustomSelect
      v-if="allCharacters && charactersWithRuns.length > 0"
      type="multi"
      custom-value="name"
      :items="charactersWithRuns"
      :label="$tc('dictionary.character', 2)"
      :empty-message="$t('select.allCharacters')"
      @updateSelect="onUpdateCharactersMultiSelect"
    />
    <CustomSelect
      type="multi"
      :items="gameStateWithRuns"
      :label="$tc('dictionary.save', 2)"
      :empty-message="$t('select.allSaves')"
      @updateSelect="onUpdateGameStateMultiSelect"
    />
    <CustomSelect
      type="single"
      :items="winConditionWithRuns"
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
import CustomSelect from './Tools/CustomSelect.vue'
import DateRangePicker from './Tools/DateRangePicker.vue'
export default {
    name: "RunsFilters",
    components: {
        CustomSelect,
        DateRangePicker
    },
    props: {
        filterOffset: Number,
        filterLimitPerPage: Number,
        filterOrder: String
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
                {id: 2, value: "CurrentWinStreak", name: this.$t('strings.currentWinStreak', 1)},
                {id: 3, value: "BestWinStreak", name: this.$t('strings.bestWinStreak', 1)}
            ],
            filterWinCondition: null,
            filterDateStart: null,
            filterDateEnd: null
        }
    },
    computed: {
        ...mapRepos({
            tagRepo: Tag,
            characterRepo: Character,
            runRepo: Run
        }),
        winConditionWithRuns() {
            const conditions = this.winConditionOptions.filter(condition => this.checkWinCondition(condition))
            this.resetFilters(conditions, "winCondition")
            return conditions
        },
        gameStateWithRuns() {
            const gameStates = this.gameStateOptions.filter(gameState => this.checkGameState(gameState))
            this.resetFilters(gameStates, "gameStates")
            return gameStates
        },
        allTags() {
            return this.tagRepo.all()
        },
        tagsWithRuns() {
            const tags = this.tagRepo.where((tag) => { return this.checkTags(tag) }).orderBy('value', 'asc').get()
            this.resetFilters(tags, "tags")
            return tags
        },
        allCharacters() {
            return this.characterRepo.where().all()
        },
        charactersWithRuns() {
            const characters = this.characterRepo.where((character) => { return this.checkCharacters(character) }).orderBy('trueName', 'asc').get()
            this.resetFilters(characters, "characters")
            return characters
        },
        allRuns() {
            return this.runRepo.all()
        },
        filteredRunsTotal() {
            const filteredRunsTotal = this.runRepo.where((run) => { return this.filterRuns(run) }).orderBy('runUpdate', this.filterOrder).get()
            this.$emit('filteredRunsTotal', filteredRunsTotal)
            return filteredRunsTotal
        },
        filteredRuns() {
            const filteredRuns = this.filteredRunsTotal.slice(this.filterOffset, this.filterLimitPerPage + this.filterOffset)
            console.log(typeof this.filterWinCondition);
            if (typeof this.filterWinCondition === "string") {
                // Process winstreak checking
                console.log(this.filterWinCondition)
            }
            this.$emit('filteredRuns', filteredRuns)
            return filteredRuns
        }
    },
    mounted() {
        window.ipc.send('ASK_TAGS')
        window.ipc.on('SYNC_SEND_TAGS', (response) => {
            console.log(response)
            this.tagRepo.fresh(response.tags)
        })
    },
    methods: {
        onUpdateDateRange(range) {
            this.filterDateStart = range.start
            this.filterDateEnd = range.end
            this.$emit('resetPagination')
        },
        onUpdateWinConditionMultiSelect(selected) {
            this.filterWinCondition = selected.length === 0 ? null
            : selected[0].value === 'Win' ? true
            : selected[0].value === 'Lose' ? false
            : selected[0].value
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
            if (this.filterWinCondition === true || this.filterWinCondition === false && from !== "winCondition") {
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
            const thisCondition = condition.value === "Win" ? true : condition.value === "Lose" ? false : null 

            // Init Check if runs has save
            if (thisCondition === null) return condition

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
            runs = this.runRepo.where((run) => run.characters[0].name === character.name && run.characters[0].version === character.version)
            if (runs.get().length < 1) return

            if(this.checkFilters(runs, "characters").length < 1) return

            character.name = character.id === "19" ? `${this.$t("players.19.name")} & ${this.$t("players.20.name")}` : `${this.$t(`players.${character.id}.name`)}${character.version === 'Alternate' ? ` (${this.$t('dictionary.tainted')})` : ''}`
            return character
        },
        filterRuns(run) {
            // Date filter
            if (this.filterDateStart && run.runStart < this.filterDateStart) return
            if (this.filterDateEnd && run.runStart > this.filterDateEnd) return

            // Win condition filter
            if ((this.filterWinCondition === true || this.filterWinCondition === false) && run.runEnd.win !== this.filterWinCondition) return

            // Save filter
            if (this.filterGameStates.length > 0 && !this.filterGameStates.includes(run.gameState)) return

            // Tags filter
            if (this.filterTags.length > 0 && !this.filterTags.some(tag => run.tags_ids.includes(tag.id))) return

            // Characters filter
            if (this.filterCharacters.length > 0 && !this.filterCharacters.map(filterCharacter => filterCharacter.id).includes(run.characters[0].id)) return

            // Text filter
            if(this.filterText.length > 3) {
                const textSearchValue = this.filterText.normalize('NFC').toLowerCase()
                const characterName = run.characters[0].trueName.normalize('NFC').toLowerCase()
                const customRunName = run.customName.normalize('NFC').toLowerCase()
                const id = run.id.normalize('NFC').toLowerCase()
                if (
                    !characterName.includes(textSearchValue) &&
                    !customRunName.includes(textSearchValue) &&
                    !id.includes(textSearchValue)
                    ) return
            }
            return run
        }
        //filterStreak()
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
}
</style>