<template>
    <div class="tags-wrapper">
        <ul class="list">
            <template v-for="(tag, idx) in tags">
                <li class="tag" :key="`${tag.name} ${idx}`">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                    <a v-if="type === 'time'" class="tag-name" :href="getVideoLink[idx]" target="_blank">{{tag.name}}</a>
                    <div v-if="type != 'time'" class="tag-name">{{tag.name}}</div>
                    <div class="action remove-tag" @click="removeItem(idx)">(x)</div>
                </li>
            </template>
            <li v-if="!addingItem" class="tag new-tag">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="action solo new-tag" @click="createNewTag" contenteditable="false">(+)</div>
            </li>
            <li v-if="addingItem" class="tag new-tag edit">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div v-if="type === 'string'" class="tag-name edit"><input type="text" v-model="tempVal" placeholder="Tag name"></div>
                <vue-timepicker v-if="type === 'time'" v-model="tempVal" format="HH:mm:ss"></vue-timepicker>
                <div class="action add-tag" @click="addItem">(v)</div>
                <div class="action add-tag" @click="reset">(x)</div>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "Tags",
    props: {
        tags: Array,
        type: String,
        videoLink: String
    },
    data() {
        return {
            addingItem: false,
            tempVal: this.type === 'time' ? { HH:"00", mm:"00", ss:"00" } : '',
            localTags: this.tags
        }
    },
    mounted() {
    },
    computed: {
        getVideoLink() {
            const videoLink = this.videoLink
            return this.tags.map(function(tag) {
                let link
                if (videoLink.includes('youtube')) {
                    link = `${videoLink}&t=${(parseInt(tag.value.HH)*60*60)+(parseInt(tag.value.mm)*60)+(parseInt(tag.value.ss))}`
                } else if (videoLink.includes('twitch')) {
                    link = `${videoLink}?t=${(parseInt(tag.value.HH))}h${(parseInt(tag.value.mm))}m${(parseInt(tag.value.ss))}s`
                }
                return link
            })
        }
    },
    methods: {
        reset() {
            this.tempVal = this.type === 'time' ? { HH:"00", mm:"00", ss:"00" } : ''
            this.addingItem = !this.addingItem
        },
        createNewTag() {
            this.addingItem = !this.addingItem
        },
        // enterInput() {
        //     this.initTagName = ''
        // },
        // onInput(e) {
        //     this.tempVal = e.target.innerText
        // },
        addItem() {
            const name = this.type === 'time' ? `${this.tempVal.HH}:${this.tempVal.mm}:${this.tempVal.ss}` : this.tempVal
            const value = {name:name,value:this.tempVal}
            if(this.localTags) this.localTags.push(value)
            else {this.localTags = [value]}
            this.$emit('addItem', this.localTags)
            this.reset()
        },
        removeItem(idx) {
            this.localTags.splice(idx, 1)
            this.$emit('removeItem', this.localTags)
        }
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.tags-wrapper {
    margin: 8px;
    border: 4px dashed rgba($color: #000000, $alpha: 0.2);
    border-radius: 8px;
    padding: 8px;
    .list {
        padding: 12px 16px;
        width: 425px;
        display: flex;
        flex-wrap: wrap;
        margin: -6px -12px;
        .tag {
            padding: 8px;
            margin: 6px 12px;
            position: relative;
            padding: 5px 10px 10px 10px;
            z-index: 2;
            display: flex;
            align-items: center;
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
                transform: translateX(-8px);
            }
            > .after {
                height: 100%;
                width: 12px;
                right: 0px;
                top: 0px;
                transform: translateX(12px);
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
            .action, .tag-name, .time-picker {
                z-index: 1;
            }
            .hide {
                display: none;
            }
            .action {
                &:not(.solo) {
                    margin-left: 8px;
                }
                cursor: pointer;
            }
            a.tag-name {
                transition: 0.5s ease;
                text-decoration: none;
                color: $text-dark;
                font-weight: bold;
                &:hover {
                    opacity: 0.5;
                    transform: scale(1.1);
                }
            }
            .time-picker {
                border-radius: 0px;
                height: auto;
                input {
                    padding: 0px;
                    height: auto;
                    background: transparent;
                    border: none;
                    text-align: center;
                    &:focus {
                        box-shadow: none;
                    }
                }
                .controls {
                    .clear-btn {
                        color: rgba($color: #000000, $alpha: 0.5);
                        .char {
                            transform: translateY(1.5px);
                        }
                    }
                }
                .dropdown {
                    height: 4em;
                    top: 1.2em;
                    .select-list {
                        height: 4em;
                    }
                } 
            }
            .tag-name {
                input {
                    background-color: transparent;
                    padding: 0;
                    border-radius: 0px;
                    width: 100px;
                    &:focus {
                        box-shadow: none;
                    }
                }
            }
            &.new-tag {
                transform: scale(1.2);
            }
        }
    }
}
</style>