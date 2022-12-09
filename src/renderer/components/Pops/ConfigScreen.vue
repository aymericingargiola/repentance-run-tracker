<template>
  <transition name="open">
    <div
      v-if="isOpen"
      class="config-popup"
    >
      <div
        class="overlay"
        @click="openOrCloseSettings()"
      />
      <div class="config-items">
        <div
          class="mid"
          :style="{backgroundImage:`url('img/cards/big-frame.png')`}"
        />
        <div class="content">
          <div class="heading">
            {{ $t(`config.title`) }}
          </div>
          <template v-for="(config, cidx) in enabledConfigs">
            <div
              :key="`config-${cidx}`"
              :class="['config-item', config.type]"
            >
              <div class="title">
                {{ $t(`config.${config.id}.title`) }}
              </div>
              <div
                v-if="config.type === 'select'"
                class="selector"
              >
                <select
                  v-if="config.id === 'languages'"
                  :id="config.id"
                  v-model="$i18n.locale"
                  :name="config.name"
                  @change="onChange($event, config.id, config.type)"
                >
                  <template v-for="(select, sidx) in config.choices">
                    <option
                      :key="`option-${sidx}`"
                      :value="select.value"
                      :selected="select.value === config.value"
                    >
                      {{ $t(`config.${config.id}.choices.${select.value}`) }}
                    </option>
                  </template>
                </select>
                <select
                  v-else
                  :id="config.id"
                  :name="config.name"
                  @change="onChange($event, config.id, config.type)"
                >
                  <template v-for="(select, sidx) in config.choices">
                    <option
                      :key="`option-${sidx}`"
                      :value="select.value"
                      :selected="select.value === config.value"
                    >
                      {{ $t(`config.${config.id}.choices.${select.value}`) }}
                    </option>
                  </template>
                </select>
              </div>
              <div
                v-if="config.type === 'multiselect'"
                class="checkbox-list"
              >
                <ul
                >
                  <template v-for="(select, sidx) in config.choices">
                    <li
                      :key="`option-${sidx}`"
                    >
                      <label
                        :for="`${config.id}-${select.value}`">
                        {{ $t(`config.${config.id}.choices.${select.value}`) }}
                      </label>
                      <input
                        :id="`${config.id}-${select.value}`"
                        type="checkbox"
                        :name="select.name"
                        :checked="config.value.includes(parseInt(select.value))"
                        @change="onChange($event, config.id, config.type, config.value, select.value)"
                      >
                  </li>
                  </template>
                </ul>
              </div>
              <div
                v-if="config.type === 'text'"
                class="text"
              >
                <input
                  :id="config.id"
                  type="text"
                  :name="config.name"
                  :value="config.value"
                  @change="onChange($event, config.id, config.type)"
                >
              </div>
              <div
                v-if="config.type === 'checkbox'"
                class="checkbox"
              >
                <input
                  :id="config.id"
                  type="checkbox"
                  :name="config.name"
                  :checked="config.value"
                  @change="onChange($event, config.id, config.type)"
                >
              </div>
              <div class="hint">
                {{ $t(`config.${config.id}.hint`) }}
              </div>
            </div>
          </template>
        </div>
        <div
          v-if="$isDev"
          class="content debug"
        >
          <div class="heading">
            Debug
          </div>
          <div class="config-item">
            <div class="title">
              Debug game logs
            </div>
            <div class="text textarea">
              <textarea
                id="debuglogs"
                v-model="debuglogs"
                name="debuglogs"
                spellcheck="false"
              />
            </div>
            <button @click="sendLogs()">
              Debug
            </button>
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
    computed: {
        ...mapRepos({
            configRepo: Config
        }),
        enabledConfigs() {
            return this.configRepo.query().where('disabled', false).get()
        }
    },
    mounted() {
        this.$root.$on('OPEN_SETTINGS', () => {
            this.isOpen = !this.isOpen
        })
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
        onChange(e, id, type, cfgValue, itemValue) {
            if (cfgValue) {
              if (cfgValue.includes(parseInt(itemValue))) cfgValue.splice(cfgValue.indexOf(parseInt(itemValue)), 1)
              else cfgValue.push(parseInt(itemValue))
            }
            const config = {id: id, value: cfgValue ? cfgValue : type === "checkbox" ? e.target.checked : e.target.value}
            if (e.target.id === "languages") document.documentElement.setAttribute('lang', e.target.value)
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
    z-index: 801;
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
        flex-direction: column;
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
            margin-left: 0px;
            margin-right: 0px;
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
            .buttons-list {
              > button {
                &:not(:first-child) {
                  margin-left: 8px;
                }
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
            .textarea {
                margin: 0px 16px;
                &  > textarea {
                    border-radius: 10px;
                    border: none;
                    min-height: 200px;
                    min-width: 400px;
                    font-size: 9px;
                    padding: 16px;
                }
            }
        }
    }
}
</style>