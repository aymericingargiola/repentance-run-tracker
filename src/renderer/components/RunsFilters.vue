<template>
        <div v-if="allRuns && allRuns.length > 0 && filteredRuns" class="filters">
            <div class="search">
                <input v-model="filterText" @input="resetPaginationFromInput()" placeholder="Search runs">
            </div>
            <CustomSelect v-if="allTags && tagsWithRuns.length > 0" type="multi" :items="tagsWithRuns" label="Tags" emptyMessage="No tags selected" @updateSelect="onUpdateTagsMultiSelect"/>
        </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Run from '../store/classes/Run'
import Tag from '../store/classes/Tag'
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
            filterCharacter: [],
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
            runRepo: Run,
            tagRepo: Tag
        }),
        allTags() {
            return this.tagRepo.all()
        },
        tagsWithRuns() {
            return this.tagRepo.where((tag) => { return this.checkTags(tag) }).orderBy('value', 'desc').get()
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
        resetPaginationFromInput() {
            if (this.filterText.length > 3 || this.filterText.length === 0) this.$emit('resetPagination')
        },
        checkTags(tag) {
            if (tag.runs_ids.filter(runId => !!this.runRepo.where('id', runId).first()).length < 1) return
            return tag
        },
        filterRuns(run) {
            // tags filter
            if (this.filterTags.length > 0 && !this.filterTags.some(tag => run.tags_ids.includes(tag.id))) return
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