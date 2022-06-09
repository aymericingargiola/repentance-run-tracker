<template>
  <div class="items-list">
    <ul>
      <template v-for="item in filteredItems">
        <li :key="`${item.title} ${item.room}`">
          <div class="name">
            <div
              class="before"
              :style="{backgroundImage:`url('img/cards/bar-small-left_01.png')`}"
            />
            <div
              class="mid"
              :style="{backgroundImage:`url('img/cards/bar-small-mid_01_noshadow.png')`}"
            />
            <div
              class="after"
              :style="{backgroundImage:`url('img/cards/bar-small-right_01_noshadow.png')`}"
            />
            <span>{{ item.golden ? 'Golden ' : '' }}{{ item.type === 'trinket' ? t(`items.trinkets.${item.id}.name`, item.title) : t(`items.items.${item.id}.name`, item.title) }}</span>
          </div>
          <a
            v-if="item.id >= 0"
            class="item-image"
            :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`"
            target="_blank"
          >
            <div
              v-if="validCharacters && (validCharacters.length > 1 || validCharacters[0].id === '19')"
              class="player-icon"
            >
              <img :src="`img/characters/small portraits/${characters[0].id === '19' && item.player === '1' ? '20' : characters[parseInt(item.player)].id}.png`">
            </div>
            <img
              v-if="item.type === 'trinket'"
              :src="`img/icons/trinkets/${item.golden ? item.id : (`00${item.id}`).slice(-3)}.png`"
              onerror="this.src='img/icons/collectibles/questionmark.png'"
            >
            <img
              v-else-if="item.custom"
              :src="`img/icons/collectibles/${item.gfx ? `${item.category}/${item.gfx}` : (`00${item.originalItemID}`).slice(-3)}.png`"
              onerror="this.src='img/icons/collectibles/questionmark.png'"
            >
            <img
              v-else
              :src="`img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`"
              onerror="this.src='img/icons/collectibles/questionmark.png'"
            >
            <span
              v-if="item.number > 1"
              class="item-number"
            >x{{ item.number }}</span>
            <span
              v-if="item.number < 1"
              class="item-number removed"
            >X</span>
          </a>
          <a
            v-else
            class="item-image glitched"
          >
            <div
              v-if="validCharacters && (validCharacters.length > 1 || validCharacters[0].id === '19')"
              class="player-icon"
            >
              <img :src="`img/characters/small portraits/${characters[0].id === '19' && item.player === '1' ? '20' : characters[parseInt(item.player)].id}.png`">
            </div>
            <div class="glitched-image">
              <template v-for="index in 3">
                <div
                  :key="`glitched ${index}`"
                  class="contain"
                >
                  <img
                    class="glitched"
                    :src="`img/icons/collectibles/${randomItemId()}.png`"
                    onerror="this.src='img/icons/collectibles/023.png'"
                  >
                </div>
              </template>
            </div>
            <span
              v-if="item.number > 1"
              class="item-number"
            >x{{ item.number }}</span>
            <span
              v-if="item.number < 1"
              class="item-number"
            >X</span>
          </a>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import i18nMixin from '../../mixins/i18n'
export default {
  name: "Items",
  mixins: [i18nMixin],
  props: {
      items: Array,
      selectedRoom: Number,
      characters: Array
  },
  data() {
    return {
    }
  },
  computed: {
    filteredItems() {
      return this.selectedRoom > -1 && this.items ? this.items.filter(item => item.room === this.selectedRoom) : this.items ? this.groupedItems : []
    },
    groupedItems() {
      return this.items.reduce((groups, itemObj) => {
          const item = Object.assign({}, itemObj)
          const itemExist = groups.findIndex(i => i.id === item.id)
          if (itemExist === -1) groups.push(item)
          else groups[itemExist].number += item.number
          return groups
      }, [])
    },
    validCharacters() {
        return this.characters ? this.characters.filter(character => character.bypass !== true) : []
    }
  },
    watch: { 
    },
  mounted() {
  },
  methods: {
  }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.items-list {
  padding: 20px;
  > ul {
    display: flex;
    height: 100%;
    border-radius: 10px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    background: rgba($color: #000000, $alpha: 0.15);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    > li {
      padding: 15px;
      .name {
        position: relative;
        padding: 5px 0px 10px 0px;
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
        > span {
            position: relative;
            z-index: 3;
        }
      }
      .item-image {
        position: relative;
        display: inline-block;
        opacity: 1;
        img {
          -webkit-filter: drop-shadow(0px 0px 1px rgba(0,0,0,1));
          width: 50px;
          height: 50px;
        }
        .player-icon {
          position: absolute;
          z-index: 1;
          transform: scale(0.5) translate(20px, -20px);
        }
        .item-number {
          pointer-events: none;
          color: $red-a2;
          position: absolute;
          &.removed {
            font-size: 90px;
            mix-blend-mode: darken;
            right: 50%;
            bottom: 50%;
            transform: translate(50%, 50%);
          }
          &:not(.removed) {
            font-family: "Up Heaval", sans-serif;
          }
        }
      }
    }
  }
}
</style>