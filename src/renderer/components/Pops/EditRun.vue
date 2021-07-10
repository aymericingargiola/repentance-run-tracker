<template>
    <transition name="open">
        <div v-if="isOpen" class="edit-run-popup">
            <div class="overlay" v-on:click="openOrCloseEditRun()"></div>
            <div class="edit-run">
                <div class="mid" :style="{backgroundImage:`url('img/cards/big-frame.png')`}"></div>
                <div class="content">
                    <div class="heading">Edit Run</div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
// import moment from 'moment'
import { mapRepos } from '@vuex-orm/core'
import Run from '../../store/classes/Run'
export default {
    name: "EditRun",
    data() {
        return {
            isOpen: false,
            id: null
        }
    },
    mounted() {
        this.$root.$on('OPEN_EDITRUN', (id) => {
            if(id) this.id = id
            this.isOpen = !this.isOpen
        })
    },
    watch: {
    },
    computed: {
        ...mapRepos({
            runRepo: Run
        }),
        currentRun() {
            return this.runRepo.query().where('id', this.id).get()
        }
    },
    methods: {
        openOrCloseEditRun() {
            this.$root.$emit('OPEN_EDITRUN')
        }
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.edit-run-popup {
    position: fixed;
    top: 30px;
    width: 100%;
    height: calc(100% - 30px);
    z-index: 2;
    padding: 48px;
    > .overlay {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        z-index: 0;
    }
    &.open-enter-active, &.open-leave-active {
        transition: .2s;
    }
    &.open-enter, &.open-leave-to {
        opacity: 0;
        transform: scale(0.95) translateY(100%) scaleX(0.20);
    }
    .edit-run {
        position: relative;
        z-index: 1;
        height: 100%;
        > .mid {
            z-index: 0;
            position: absolute;
            background-repeat: no-repeat;
            background-size: 100% 100%;
            pointer-events: none;
        }
        > .mid {
            height: 100%;
            width: 100%;
            left: 0px;
            top: 0px;
            background-repeat: no-repeat;
        }
        .content {
            height: 100%;
            overflow: auto;
            position: relative;
            z-index: 1;
            padding: 36px 36px 56px 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .heading {
            font-size: 80px;
            font-weight: bold;
            margin-bottom: 28px;
        }
        .config-item {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
            .title {
                margin-right: 12px;
                pointer-events: none;
            }
            .hint {
                width: 100%;
                font-size: 12px;
                transition: 0.25s ease;
                transform: scale(0.8);
                opacity: 0;
                pointer-events: none;
                min-height: 12px;
            }
            &:not(:first-child) {
                margin-top: 16px;
            }
            &:hover {
                .hint {
                    opacity: 0.8;
                    transform: scale(1);
                }
            }
        }
    }
}
</style>