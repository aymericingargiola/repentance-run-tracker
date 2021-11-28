<template>
    <v-date-picker locale="en" v-model="rangeUpdate" :model-config="datePickerModelConfig" is-range>
        <template v-slot="{ inputEvents }">
            <div class="v-calendar date-picker">
                <div class="custom-input">
                    <input
                        :value="formatedRangeDates.start"
                        :placeholder="todayDate"
                        v-on="inputEvents.start"
                    />
                </div>
                <span class="separator" @click="reset">
                    ->
                </span>
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
import moment from 'moment'
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
                type: 'number',
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
        dateFormat() {
            return this.getConfig("dateFormat") ? this.getConfig("dateFormat").value : 'MM/DD/YY'
        },
        formatedRangeDates() {
            return {start: this.$helpers.formatDate(this.range.start, this.dateFormat), end: this.$helpers.formatDate(this.range.end, this.dateFormat)}
        },
        todayDate() {
            return this.$helpers.formatDate(Date.now(), this.getConfig("dateFormat") ? this.getConfig("dateFormat").value : 'MM/DD/YY')
        },
        rangeUpdate: {
            get() {
                this.$emit('updateDateRange', this.range)
                return this.range;
            },
            set(newVal) {
                this.range = {
                    start: moment(newVal.start).unix(),
                    end: moment(newVal.end).unix()
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
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
</style>