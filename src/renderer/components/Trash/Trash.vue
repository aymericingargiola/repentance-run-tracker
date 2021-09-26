<template>
    <div class="trash">
        <div class="trash-container" v-if="trashRuns.all().length > 0">
            <div class="buttons">
                <div class="restore">
                    <button :disabled="selected.length === 0" @click="restoreSelected()">Restore Selected</button>
                </div>
                <div class="delete">
                    <button class="warning" :disabled="selected.length === 0" @click="deleteSelected()">Delete Selected</button>
                </div>
                <div class="empty">
                    <button class="warning" @click="emptyTrash()">Empty Trash</button>
                </div>
            </div>
            <ul>
                <template v-for="run in allTrashRuns">
                    <li v-if="allTrashRuns.length > 0" :class="['trash-item-run', selected.includes(run.id) ? 'selected' : '']" :key="run.id" @click="runSelected(run.id)">
                        {{ run.id }} {{ selected.includes(run.id) ? 'selected' : '' }}
                    </li>
                </template>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import TrashRun from '../../store/classes/TrashRun'
export default {
    name: "Trash",
    components: {
    },
    data() {
        return {
            selected: []
        }
    },
    computed: {
        ...mapRepos({
            trashRunRepo: TrashRun,
        }),
        trashRuns() {
            return this.trashRunRepo
        },
        allTrashRuns() {
            return this.trashRunRepo.all()
        }
    },
    methods: {
        runSelected(id) {
            this.selected.includes(id) ? this.selected = this.selected.filter((runId) => runId !== id) : this.selected.push(id)
        },
        restoreSelected() {
            window.ipc.send('USER_RESTORE_RUNS_FROM_TRASH', this.selected)
            this.selected = []
        },
        deleteSelected() {
            window.ipc.send('USER_REMOVE_RUNS_FROM_TRASH', this.selected)
            this.selected = []
        },
        emptyTrash() {
            window.ipc.send('USER_EMPTY_TRASH')
            this.selected = []
        }
    },
    mounted() {
        window.ipc.send('ASK_TRASH')
        window.ipc.on('SYNC_SEND_TRASH', (response) => {
            console.log(response)
            this.trashRunRepo.fresh(response.trash)
        })
        window.ipc.on('SYNC_ADD_RUN_TO_TRASH', (response) => {
            console.log(response)
            this.trashRunRepo.save(response.run)
        })
        window.ipc.on('SYNC_REMOVE_RUNS_FROM_TRASH', (response) => {
            console.log(response)
            this.trashRunRepo.destroy(response.runs)
        })
        window.ipc.on('SYNC_EMPTY_TRASH', () => {
            console.log("Empty trash")
            this.trashRunRepo.flush()
        })
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
</style>