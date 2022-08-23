<template>
  <div class="ennemies">
    <ul>
      <template v-for="ennemy in filteredEnnemies">
        <li :key="`${ennemy.name} ${ennemy.room}`">
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
            <span class="title">{{ t(`entities.${formatLocaleId(ennemy.id)}.name`, ennemy.name) }}{{ $isDev ? ` [id : ${ennemy.id}]` : '' }}</span>
          </div>
          <div class="image" :class="ennemy.category" :category="ennemy.category">
            <img :src="`img/entities/${ennemy.category ? `${ennemy.category}/${ennemy.name.replaceAll(' ', '').replaceAll('\'', '')}`: ennemy.id}.png`"
            @error="onImageLoadError($event, ennemy.category)">
            <span
              v-if="ennemy.number > 1"
              class="number"
            >x{{ ennemy.number }}</span>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import i18nMixin from '../../mixins/i18n'
export default {
  name: "Ennemies",
  mixins: [i18nMixin],
  props: {
      ennemies: Array,
      selectedRoom: Number
  },
  data() {
    return {
    }
  },
  computed: {
    filteredEnnemies() {
      return this.selectedRoom > -1 && this.ennemies ? this.ennemies.filter(ennemy => ennemy.room === this.selectedRoom) : this.ennemies ? this.groupedEnnemies : []
    },
    groupedEnnemies() {
      return this.ennemies.reduce((groups, itemObj) => {
          const ennemy = Object.assign({}, itemObj)
          const ennemyExist = groups.findIndex(i => i.id === ennemy.id)
          if (ennemyExist === -1) groups.push(ennemy)
          else groups[ennemyExist].number += ennemy.number
          return groups
      }, [])
    }
  },
  watch: { 
  },
  mounted() {
  },
  methods: {
    onImageLoadError(e, category) {
      e.target.src="img/entities/questionmark.png"
      e.target.parentNode.classList.add("not-loaded")
    }
  }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.ennemies {
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
      .image {
        > img {
          max-height: 130px;
          -webkit-filter: drop-shadow(0px 0px 1px rgba(0,0,0,1));
        }
        .number {
          pointer-events: none;
          font-family: "Up Heaval", sans-serif;
          color: $red-a2;
          position: absolute;
          //text-shadow: 0px 0px 2px black, 0px 0px 2px black, 0px 0px 2px black;
        }
        &:not(.not-loaded) {
          &.fiendfolio-reheated {
            > img {
              width: 30%;
            }
          }
        }
      }
    }
  }
}
</style>