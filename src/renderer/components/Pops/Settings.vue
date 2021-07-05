<template>
    <transition name="show">
        <div v-if="isOpen">HELLO</div>
    </transition>
</template>

<script>
// import moment from 'moment'
export default {
    name: "Settings",
    data() {
        return {
            isOpen: false
        }
    },
    mounted() {
        this.$root.$on('OPEN_SETTINGS', () => {
            this.isOpen = !this.isOpen
        })
    },
    watch: {
    },
    computed: {
    },
    methods: {
        onSaveSettingsClick() {
            // const runId = e.currentTarget.getAttribute('data-run-id')
            // const run = this.runRepo.find(runId)
            // window?.ipc?.send('USER_REMOVE_RUN', run.id)
        },
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.pop-up.settings {

}
</style>