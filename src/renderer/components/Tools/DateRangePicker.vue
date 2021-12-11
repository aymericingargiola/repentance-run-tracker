<template>
    <v-date-picker :locale="getLanguage" v-model="rangeUpdate" :model-config="datePickerModelConfig" is-range>
        <template v-slot="{ inputEvents }">
            <div class="v-calendar date-picker">
                <div class="custom-input">
                    <input
                        :value="formatedRangeDates.start"
                        :placeholder="todayDate"
                        v-on="inputEvents.start"
                    />
                </div>
                <div class="separator" @click="reset">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01_noshadow.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                    <span class="icon"></span>
                </div>
                <div class="custom-input">
                    <input
                        :value="formatedRangeDates.end"
                        :placeholder="todayDate"
                        v-on="inputEvents.end"
                    />
                </div>
            </div>
        </template>
    </v-date-picker>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Config from '../../store/classes/Config'
export default {
    name: "DateRangePicker",
    props: {
    },
    data() {
        return {
            range: {
                start: null,
                end: null
            },
            datePickerModelConfig: {
                start: {
                    timeAdjust: '00:00:00',
                },
                end: {
                    timeAdjust: '23:59:59',
                },
            }
        }
    },
    computed: {
        ...mapRepos({
            configRepo: Config
        }),
        getLanguage() {
            return this.getConfig("languages") ? this.getConfig("languages").value : 'en-US'
        },
        dateFormat() {
            return this.getConfig("dateFormat") ? this.getConfig("dateFormat").value : 'MM/DD/YY'
        },
        formatedRangeDates() {
            return {start: this.$helpers.formatDate(this.range.start, this.dateFormat), end: this.$helpers.formatDate(this.range.end, this.dateFormat)}
        },
        todayDate() {
            return this.$helpers.formatDate(Math.floor(this.$DateTime.now().toSeconds()), this.getConfig("dateFormat") ? this.getConfig("dateFormat").value : 'MM/DD/YY')
        },
        rangeUpdate: {
            get() {
                return this.range;
            },
            set(newVal) {
                this.range = {
                    start: this.$DateTime.fromJSDate(newVal.start).toSeconds(),
                    end: this.$DateTime.fromJSDate(newVal.end).toSeconds()
                }
                this.$emit('updateDateRange', this.range)
            }
        }
    },
    methods: {
        getConfig(id) {
            return this.configRepo.query().where('id', id).get()[0]
        },
        reset() {
            this.range = {
                start: null,
                end: null
            }
            this.$emit('updateDateRange', this.range)
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.custom-input {
    position: relative;
    z-index: 1;
}
.separator {
    position: relative;
    padding: 0;
    z-index: 0;
    transform: translateY(4px) scaleX(1.8);
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
    .icon {
        position: relative;
        transform: scaleX(0.5);
        &::before, &::after {
            content: "->";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.5);
            transition: 0.2s ease;
            width: 100%;
            text-align: center;
        }
        &::after {
            content: "(X)";
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
        }
    }
    &:hover {
        cursor: pointer;
        .icon {
            &::before {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0);
            }
            &::after {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.5);
            }
        }
    }
}
</style>