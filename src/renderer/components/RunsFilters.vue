<template>
        <div v-if="allRuns && allRuns.length > 0 && filteredRuns" class="filters">
            <div class="search">
                <input v-model="filterText" @input="resetPaginationFromInput()" placeholder="Search runs">
            </div>
            <CustomSelect v-if="allTags && tagsWithRuns.length > 0" type="multi" :items="tagsWithRuns" label="Tags" emptyMessage="No tag selected" @updateSelect="onUpdateTagsMultiSelect"/>
            <CustomSelect v-if="allCharacters && charactersWithRuns.length > 0" type="multi" custom-value="trueName" :items="charactersWithRuns" label="Characters" emptyMessage="No character selected" @updateSelect="onUpdateCharactersMultiSelect"/>
        </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Tag from '../store/classes/Tag'
import Character from '../store/classes/Character'
import Run from '../store/classes/Run'
import CustomSelect from './Tools/CustomSelect.vue'
export default {
    name: "RunsFilters",
    components: {
        CustomSelect
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
            filterCharacterVersion: '',
            filterGameState: 0,
            filterWiNOrDeath: '',
            filterDateFrom: 0,
            filterDateTo: 0,
            localFilteredRuns: this.filteredRuns
        }
    },
    mounted() {
        window.ipc.send('ASK_TAGS')
        window.ipc.on('SYNC_SEND_TAGS', (response) => {
            console.log(response)
            this.tagRepo.fresh(response.tags)
        })
    },
    computed: {
        ...mapRepos({
            tagRepo: Tag,
            characterRepo: Character,
            runRepo: Run
        }),
        allTags() {
            return this.tagRepo.all()
        },
        tagsWithRuns() {
            return this.tagRepo.where((tag) => { return this.checkTags(tag) }).orderBy('value', 'asc').get()
        },
        allCharacters() {
            return this.characterRepo.where().all()
        },
        charactersWithRuns() {
            return this.characterRepo.where((character) => { return this.checkCharacters(character) }).orderBy('trueName', 'asc').get()
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
            this.$emit('filteredRuns', filteredRuns)
            return filteredRuns
        },
    },
    methods: {
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
        checkTags(tag) {
            let runs

            // Check if runs has tag
            runs = this.runRepo.where((run) => run.tags_ids.includes(tag.id))
            if (runs.get().length < 1) return

            // Check if runs has filtered characters
            if (this.filterCharacters.length > 0) {
                runs = runs.where((run) => this.filterCharacters.map(filterCharacter => filterCharacter.id).includes(run.characters[0].id))
                if (runs.get().length < 1) return
            }

            return tag
        },
        checkCharacters(character) {
            let runs

            // Check if it's ignore character
            if (character.ignore) return
            
            // Check if runs has character
            runs = this.runRepo.where((run) => run.characters[0].name === character.trueName && run.characters[0].version === character.version)
            if (runs.get().length < 1) return

            // Check if runs has filtered tags
            if (this.filterTags.length > 0 && runs.where((run) => run.tags_ids.some(tag => this.filterTags.map(filterTag => filterTag.id).includes(tag))).get().length < 1) return
            
            character.trueName = `${character.trueName}${character.version === 'Alternate' ? ' (tainted)' : ''}`
            return character
        },
        filterRuns(run) {
            // tags filter
            if (this.filterTags.length > 0 && !this.filterTags.some(tag => run.tags_ids.includes(tag.id))) return

            // characters filter
            if (this.filterCharacters.length > 0 && !this.filterCharacters.map(filterCharacter => filterCharacter.id).includes(run.characters[0].id)) return

            // text filter
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
    }
};
</script>

<style lang="scss">
.filters {
    margin-bottom: 16px;
    text-align: left;
    padding: 0px 12px;
    display: flex;
    margin-left: -8px;
    margin-right: -8px;
    > div {
        margin-left: 8px;
        margin-right: 8px;
    }
}
</style>