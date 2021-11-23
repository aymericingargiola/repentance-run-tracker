<template>
    <div v-if="items && items.length > 0" class="select-wrapper">
        <div  @click="showList" v-click-outside="hideList" :class="['select', type === 'multi' ? 'multi' : '']">
            <div class="select-content">
                <span v-if="label != ''" class="label">{{label}} :</span>
                <ul class="selected">
                    <template v-for="(item, isdx) in selected">
                        <li :title="item.value" class="item" :key="isdx"><span class="name">{{item.value}}{{selected.length > 1 && isdx != selected.length - 1 ? "," : ""}}</span></li>
                    </template>
                    <li class="item" v-if="selected.length === 0">{{emptyMessage != '' ? emptyMessage : 'Nothing selected'}}</li>
                </ul>
                <span @click="reset" class="selected-number" v-if="selected.length > 0 && type === 'multi' && (!maxItems || maxItems > 1)"><span>({{selected.length}}{{maxItems > 1 ? `/${maxItems}` : ''}})</span></span>
            </div>
            <transition name="list-overflow">
                <div v-if="show" class="list-overflow big">
                    <ul class="items">
                        <template v-for="(item, idx) in items">
                            <li :title="item.value" :class="['item', selectedIds.includes(item.id) ? 'selected' : '']" :key="idx" v-on:click="itemSelected({id:item.id,value:item.value})">
                                <span class="name">{{item.value}}</span>
                            </li>
                        </template>
                    </ul>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
    name: "CustomSelect",
    props: {
        type: String,
        items: Array,
        maxItems: Number,
        label: String,
        emptyMessage: String
    },
    data() {
        return {
            selected: [],
            show: false
        }
    },
    computed: {
        selectedIds() {
            return this.selected.length > 0 ? this.selected.map((itemSelected) => itemSelected.id) : this.selected
        }
    },
    methods: {
        itemSelected(item) {
            if (this.type === "multi") {
                this.selectedIds.includes(item.id) ? this.selected = this.selected.filter((itemSelected) => itemSelected.id !== item.id) : !this.maxItems || this.maxItems < this.selected.length ? this.selected.push(item) : null
            } else {
                this.selectedIds.includes(item.id) ? this.selected = [] : this.selected = [item]
            }
            this.$emit('updateSelect', this.selected)
        },
        showList() {
            this.show = true
        },
        hideList() {
            this.show = false
        },
        reset() {
            this.selected = []
            this.$emit('updateSelect', this.selected)
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.select-wrapper {
    display: flex;
    .select {
        position: relative;
        display: flex;
        .select-content {
            display: flex;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            .label {
                text-overflow: ellipsis;
                font-weight: bold;
                &::after {
                    content: "\00a0";
                }
            }
            .selected {
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                > li {
                    overflow: hidden;
                    flex-shrink: 0;
                    &:last-child {
                        text-overflow: ellipsis;
                    }
                }
                .item {
                    &::after {
                        content: "\00a0";
                    }
                }
            }
            .selected-number {
                position: absolute;
                right: 8px;
                z-index: 1;
                top: 50%;
                transform: translateY(-50%);
                background-color: $paper-white-accent;
                font-weight: bold;
                > span {
                    transition: 0.2s ease;
                    display: inline-block;
                    opacity: 1;
                    transform: scale(1);
                }
                &::before {
                    content: "";
                    position: absolute;
                    height: 100%;
                    width: calc(100% + 20px);
                    background: linear-gradient(to left, $paper-white-accent 50%, transparent 100%);
                    right: 0px;
                    z-index: -1;
                }
                &::after {
                    opacity: 0;
                    content: "X";
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    right: calc(50% + -4px);
                    transform: translateX(50%) scale(0);
                    z-index: 1;
                    transition: 0.2s ease;
                }
                &:hover {
                    > span {
                        opacity: 0;
                        transform: scale(0);
                    }
                    &::after {
                        opacity: 1;
                        transform: translateX(50%) scale(1.2);
                    }
                }
            }
        }
    }
}
</style>