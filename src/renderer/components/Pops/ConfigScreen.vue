<template>
    <transition name="open">
        <div v-if="isOpen" class="config-popup">
            <div class="overlay" v-on:click="openOrCloseSettings()"></div>
            <div class="config-items">
                <div class="mid" :style="{backgroundImage:`url('img/cards/big-frame.png')`}"></div>
                <div class="content">
                    <div class="heading">Settings</div>
                    <template v-for="(config, cidx) in enabledConfigs">
                        <div :class="['config-item', config.type]" :key="`config-${cidx}`">
                            <div class="title">{{config.name}}</div>
                            <div class="selector" v-if="config.type === 'select'">
                                <select :name="config.name" :id="config.id" @change="onChange($event, config.id, config.type)">
                                    <template v-for="(select, sidx) in config.choices">
                                        <option :value="select.value" :key="`option-${sidx}`" :selected="select.value === config.value">{{select.name}}</option>
                                    </template>
                                </select>
                            </div>
                            <div class="text" v-if="config.type === 'text'">
                                <input type="text" :id="config.id" :name="config.name" @change="onChange($event, config.id, config.type)" :value="config.value">
                            </div>
                            <div class="checkbox" v-if="config.type === 'checkbox'">
                                <input type="checkbox" :id="config.id" :name="config.name" @change="onChange($event, config.id, config.type)" :checked="config.value">
                            </div>
                            <div class="hint">{{config.hint}}</div>
                        </div>
                    </template>
                    <div class="heading">Debug Tools</div>
                    <div class="config-item">
                        <div class="title">Debug Logs</div>
                        <div class="text">
                            <textarea v-model="debuglogs" id="debuglogs" name="debuglogs"></textarea>
                            <button @click="sendLogs()">Debug</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Config from '../../store/classes/Config'
export default {
    name: "ConfigScreen",
    data() {
        return {
            isOpen: false,
            debuglogs: ''
        }
    },
    mounted() {
        window.ipc.send('ASK_CONFIG')
        window.ipc.on('SYNC_SEND_CONFIG', (response) => {
            console.log(response)
            this.configRepo.fresh(response.config)
        })
        this.$root.$on('OPEN_SETTINGS', () => {
            this.isOpen = !this.isOpen
        })
    },
    watch: {
    },
    computed: {
        ...mapRepos({
            configRepo: Config
        }),
        enabledConfigs() {
            return this.configRepo.query().where('disabled', false).get()
        }
    },
    methods: {
        openOrCloseSettings() {
            this.$root.$emit('OPEN_SETTINGS')
        },
        saveConfig(config) {
            window?.ipc?.send('USER_UPDATE_CONFIG', config)
        },
        updateConfig(config) {
            this.configRepo.where('id', config.id).update({value: config.value})
        },
        onChange(e, id, type) {
            const config = {id: id, value: type === "checkbox" ? e.target.checked : e.target.value}
            this.updateConfig(config)
            this.saveConfig(config)
        },
        sendLogs() {
           window?.ipc?.send('DEBUG_LOGS', this.debuglogs) 
        }
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.config-popup {
    position: fixed;
    top: 30px;
    left: 0px;
    width: 100%;
    height: calc(100% - 30px);
    z-index: 3;
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
    .config-items {
        position: relative;
        z-index: 1;
        height: 100%;
        padding: 36px 36px 56px 28px;
        display: flex;
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
            margin-top: auto;
            margin-bottom: auto;
            margin-left: 16px;
            margin-right: 16px;
            width: 100%;
            max-height: 100%;
            overflow: auto;
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
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
            align-items: center;
            width: 100%;
            .title {
                margin-right: 12px;
                pointer-events: none;
                &::after {
                    content: " :";
                }
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
            &:last-child {
                padding-bottom: 16px;
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