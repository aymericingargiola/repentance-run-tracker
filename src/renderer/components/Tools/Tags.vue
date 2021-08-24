<template>
    <div class="tags-wrapper">
        <ul class="list">
            <template v-for="(tag, idx) in getRunVideoHighlights">
                <li v-if="type === 'time'" class="tag" :key="`${tag.name} ${idx}`">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                    <a class="tag-name" :href="getVideoLink[idx]" target="_blank">{{tag.name}}</a>
                    <div class="action remove-tag" @click="removeItem(tag.value)">(x)</div>
                </li>
            </template>
            <template v-for="(tag, idx) in getRunTags">
                <li v-if="type === 'string'" class="tag" :key="`${tag.name} ${idx}`">
                    <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                    <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                    <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                    <div class="tag-name">{{tag.value}}</div>
                    <div class="action remove-tag" @click="removeItem(tag.value)">(x)</div>
                </li>
            </template>
            <li v-if="!addingItem && !disabled" class="tag new-tag">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"></div>
                <div class="action solo new-tag" @click="createNewTag" contenteditable="false">(+)</div>
            </li>
            <li v-if="!addingItem && disabled"> /!\ Under construction /!\ </li>
            <li v-if="addingItem" class="tag new-tag edit">
                <div class="before" :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"></div>
                <div class="mid" :style="{backgroundImage:`url('img/cards/bar-small-mid_01.png')`}"></div>
                <div class="after" :style="{backgroundImage:`url('img/cards/bar-small-right_01.png')`}"></div>
                <div v-if="type === 'string'" class="tag-name edit">
                    <input type="text" v-model="tempVal" placeholder="Tag name">
                    <div v-if="tempVal != '' && getMatchingTags && getMatchingTags.length > 0" class="tags-suggestions">
                        <ul>
                            <template v-for="tag in getMatchingTags">
                                <li class="tag" @click="addFromSuggestions(tag.value)" :key="`${tag.id}`">
                                    <div class="tag-name">{{tag.value}}</div>
                                </li>
                            </template>
                        </ul>
                    </div>
                </div>
                <vue-timepicker v-if="type === 'time'" v-model="tempVal" format="HH:mm:ss"></vue-timepicker>
                <div class="action add-tag" @click="addItem">(v)</div>
                <div class="action add-tag" @click="reset">(x)</div>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapRepos } from '@vuex-orm/core'
import Tag from '../../store/classes/Tag'
import Run from '../../store/classes/Run'
export default {
    name: "Tags",
    props: {
        disabled: Boolean,
        runId: String,
        type: String,
        videoLink: String
    },
    data() {
        return {
            addingItem: false,
            tempVal: this.type === 'time' ? { HH:"00", mm:"00", ss:"00" } : '',
            tempCurrentTag: ''
        }
    },
    mounted() {
    },
    computed: {
        ...mapRepos({
            tagRepo: Tag,
            runRepo: Run
        }),
        getRunVideoHighlights() {
            return this.runRepo.where('id', this.runId).first().videoHighlights
        },
        addRunVideoHighlights: {
            get: function() {
                return this.runRepo.query().where('id', this.runId).first().videoHighlights
            },
            set: function (value) {
                this.runRepo.where('id', this.runId).first().videoHighlights.push(value)
                return window?.ipc?.send('USER_UPDATE_RUN', { id: this.runId, property: 'videoHighlights', value: this.addRunVideoHighlights })
            }
        },
        removeVideoHighlights: {
            get: function() {
                return this.runRepo.query().where('id', this.runId).first().videoHighlights
            },
            set: function (value) {
                this.runRepo.where('id', this.runId).update({ videoHighlights: this.removeVideoHighlights.filter(tId => tId.value !== value)})
                return window?.ipc?.send('USER_UPDATE_RUN', { id: this.runId, property: 'videoHighlights', value: this.removeVideoHighlights })
            }
        },
        getRunTags() {
            return this.runRepo.with('tags').where('id', this.runId).first().tags
        },
        addRunTags: {
            get: function() {
                return this.runRepo.query().where('id', this.runId).first().tags_ids
            },
            set: function (value) {
                this.addRunTags.push(value)
                return window?.ipc?.send('USER_UPDATE_RUN', { id: this.runId, property: 'tags_ids', value: this.addRunTags })
            }
        },
        removeRunTags: {
            get: function() {
                return this.runRepo.query().where('id', this.runId).first().tags_ids
            },
            set: function (value) {
                this.runRepo.where('id', this.runId).update({ tags_ids: this.removeRunTags.filter(tId => tId !== value)})
                return window?.ipc?.send('USER_UPDATE_RUN', { id: this.runId, property: 'tags_ids', value: this.removeRunTags })
            }
        },
        getTags() {
            return this.tagRepo.all()
        },
        getMatchingTags() {
            return this.tagRepo.query().where('value', (value) => { return value.normalize('NFC').toLowerCase().startsWith(this.tempVal.normalize('NFC').toLowerCase()) }).orderBy('value', 'asc').get()
        },
        addTag: {
            get: function() {
                return this.tagRepo.query().where('value', this.tempCurrentTag).first()
            },
            set: function (value) {
                this.tagRepo.insert({value: value, runs_ids: [this.runId]})
                return window?.ipc?.send('USER_CREATE_TAGS', this.addTag)
            }
        },
        removeTag: {
            get: function() {
                return this.tagRepo.query().where('value', this.tempCurrentTag).first()
            },
            set: function (value) {
                this.tagRepo.where('value', value).delete()
                return window?.ipc?.send('USER_REMOVE_TAGS', this.tempCurrentTag)
            }
        },
        updateTagAddRun: {
            get: function() {
                return this.tagRepo.query().where('value', this.tempCurrentTag).first()
            },
            set: function (value) {
                this.updateTagAddRun.runs_ids.push(value)
                return window?.ipc?.send('USER_UPDATE_TAGS', { id: this.updateTagAddRun.id, property: 'runs_ids', value: this.updateTagAddRun.runs_ids })
            }
        },
        updateTagRemoveRun: {
            get: function() {
                return this.tagRepo.query().where('value', this.tempCurrentTag).first()
            },
            set: function (value) {
                this.tagRepo.where('value', this.tempCurrentTag).update({ runs_ids: this.updateTagRemoveRun.runs_ids.filter(tId => tId !== value)})
                return window?.ipc?.send('USER_UPDATE_TAGS', { id: this.updateTagRemoveRun.id, property: 'runs_ids', value: this.updateTagRemoveRun.runs_ids })
            }
        },
        getVideoLink() {
            const videoLink = this.videoLink
            return this.getRunVideoHighlights.map(function(tag) {
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
        addFromSuggestions(val) {
            this.tempVal = val
            this.addItem()
        },
        checkTagAdd() {
            const tag = this.tagRepo.query().where('value', this.tempCurrentTag).first()
            let tagRuns = tag?.runs_ids
            if (!tag) this.addTag = this.tempCurrentTag
            else if (!tagRuns.includes(this.runId)) this.updateTagAddRun = this.runId
            else return

            const currentTagId = this.tagRepo.query().where('value', this.tempCurrentTag).first()?.id
            this.addRunTags = currentTagId
        },
        checkTagRemove() {
            const currentTag = this.tagRepo.query().where('value', this.tempCurrentTag).first()
            this.removeRunTags = currentTag?.id

            if (currentTag.runs_ids.length > 1) this.updateTagRemoveRun = this.runId
            else if (currentTag.runs_ids.length <= 1) this.removeTag = this.tempCurrentTag
        },
        reset() {
            this.tempVal = this.type === 'time' ? { HH:"00", mm:"00", ss:"00" } : ''
            this.addingItem = !this.addingItem
        },
        createNewTag() {
            this.addingItem = !this.addingItem
        },
        addItem() {
            this.tempCurrentTag = this.tempVal
            if(this.type === 'string') this.checkTagAdd()
            else this.addRunVideoHighlights = {name:`${this.tempVal.HH}:${this.tempVal.mm}:${this.tempVal.ss}`, value:this.tempVal}
            this.reset()
        },
        removeItem(tagValue) {
            this.tempCurrentTag = tagValue
            if(this.type === 'string') this.checkTagRemove()
            else this.removeVideoHighlights = tagValue
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
                    border-radius: 0;
                    text-align: center;
                    box-shadow: none;
                    &:focus {
                        box-shadow: none;
                        transform: none;
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
                    border: none;
                    width: 100px;
                    box-shadow: none;
                    &:focus {
                        box-shadow: none;
                        transform: none;
                    }
                }
            }
            .tags-suggestions {
                position: absolute;
                left: 0;
                width: 100%;
                top: 90%;
                background: rgba(255,255,255,0.5);
                backdrop-filter: blur(3px);
                box-shadow: 0px 0px 10px rgba(0,0,0,0.3);
                max-height: 54px;
                overflow: auto;
                border-radius: 5px;
                ul {
                    li {
                        margin: 0px;
                        padding: 4px 8px;
                        transition: 0.25s ease;
                        border-top: 1px dashed transparent;
                        &:hover {
                            cursor: pointer;
                            background: rgba(0,0,0,0.07);
                        }
                        &:not(:first-child) {
                            border-color: rgba(0,0,0,0.5);
                        }
                    }
                }
            }
            &.new-tag {
                //transform: scale(1.2);
            }
        }
    }
}
</style>