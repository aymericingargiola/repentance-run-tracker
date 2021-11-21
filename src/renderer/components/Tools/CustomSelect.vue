<template>
    <div v-if="items && items.length > 0" class="select-wrapper">
        <div :class="['select', type === 'multi' ? 'multi' : '']">
            <div class="select-content">
                <span v-if="label != ''" class="label">{{label}} : </span>
                <ul class="selected">
                    <template v-for="(item, isdx) in selected">
                        <li class="item" :key="isdx"><span class="name">{{item.value}}</span></li>
                    </template>
                    <li v-if="selected.length === 0">{{emptyMessage != '' ? emptyMessage : 'Nothing selected'}}</li>
                </ul>
                <span v-if="selected.length > 0 && type === 'multi' && (!maxItems || maxItems > 1)">({{selected.length}}{{maxItems > 1 ? `/${maxItems}` : ''}})</span>
            </div>
            <ul class="items">
                <template v-for="(item, idx) in items">
                    <li :class="['item', selected.includes(item) ? 'selected' : '']" :key="idx" v-on:click="itemSelected({id:item.id,value:item.value})">
                        <span class="name">{{item.value}}</span>
                    </li>
                </template>
            </ul>
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
            selected: []
        }
    },
    methods: {
        itemSelected(item) {
            if (this.type === "multi") {
                this.selected.map((itemSelected) => itemSelected.id).includes(item.id) ? this.selected = this.selected.filter((itemSelected) => itemSelected.id !== item.id) : !this.maxItems || this.maxItems < this.selected.length ? this.selected.push(item) : null
            } else {
                this.selected = [item]
            }
            this.$emit('updateSelect', this.selected)
        },
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.select-wrapper {
    .select {

    }
}
</style>