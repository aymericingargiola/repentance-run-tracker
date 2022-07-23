<template>
  <div
    class="run-el boss"
    :style="{ backgroundImage: `url('img/cards/characters-small-2-bloody.png')` }"
  >
    <div
      class="before"
      :style="{ backgroundImage: `url('img/icons/pin.png')` }"
    />
    <div
      class="after"
      :style="{ backgroundImage: `url('img/icons/pin.png')` }"
    />
    <div
      v-if="lastBosses && lastBosses.length > 1"
      class="characters-selection"
    >
      <template v-for="(boss, bidx) in lastBosses">
        <div
          :key="`${boss.bossId} ${bidx} select`"
          :class="['character', bidx === selected ? 'selected' : '']"
          @click="selected = bidx"
        >
          <div class="icon">
            <img :src="`img/entities/small portraits/${boss.bossId}.png`">
          </div>
        </div>
      </template>
    </div>
    <template v-for="(boss, bidx) in lastBosses">
      <div
        :key="`${boss.id} ${bidx}`"
        :class="['character-infos', bidx === selected ? 'selected' : '']"
      >
        <div class="name">{{boss.name}}</div>
        <div
          class="image"
          :style="{backgroundImage:`url('img/entities/${boss.id} Draw.png')`}"
        />
      </div>
    </template>
  </div>
</template>

<script>
import {getRunLastBosses} from "../../helpers/runsDetails"

export default {
  name: "RunBosses",
  components: {},
  props: {
    floors: Array,
  },
  data() {
    return {
      selected: 0,
    };
  },
  computed: {
    lastBosses() {
      return getRunLastBosses(this.floors)
    }
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
@import "../../assets/styles/scss/vars/_animations";
.run-el.boss {
  z-index: 2;
  margin-right: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 137px;
  flex-shrink: 0;
  //flex-grow: 1;
  padding: 16px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  //transform: translateY(-2px) scale(1.25);
  transform: translateY(-2px) scale(1.25) scaleX(-100%);
  .before,
  .after {
    position: absolute;
    left: 0px;
    top: 0px;
    height: 20px;
    width: 20px;
    transform: translate(4px, 13px);
    background-repeat: no-repeat;
  }
  .after {
    right: 0px;
    left: unset;
    top: 0px;
    transform: translate(-9px, 6px);
    z-index: 2;
  }
  > * {
    transform: rotate(-3deg);
  }
  .characters-selection {
    position: absolute;
    display: flex;
    transform: scale(0.6) rotate(-3deg) scaleX(-100%);
    bottom: 25px;
    z-index: 2;
    .character {
      width: 25px;
      height: 25px;
      transform: scale(1.2);
      transition: 0.5s ease;
      .icon {
        position: relative;
        img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      &:hover {
        cursor: pointer;
      }
      &:not(.selected) {
        opacity: 0.3;
        transform: scale(1);
      }
    }
  }
  .character-infos {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: 0.5s ease;
    transform: scale(1) scaleX(-100%);
    > .image {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    &:not(.selected) {
      opacity: 0;
      pointer-events: none;
      transform: scale(0) scaleX(-100%);
    }
  }
  .name {
    margin-bottom: 2px;
    font-size: 16px;
    transform: translate(0px, 10px) rotate(3deg);
    padding: 0px 32px;
  }
  .image {
    height: 50px;
    width: 50px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  .hearts {
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    width: calc(12 * 6px);
    top: 10px;
    left: 30px;
    .heart-container {
      width: 12px;
      height: 9px;
      .heart {
        width: 17px;
        height: 16px;
      }
    }
    &.secondary {
      transform: scale(0.7) rotate(-4deg);
      width: calc(6 * 6px);
      left: 8px;
      top: 65px;
    }
  }
  .stats {
    position: absolute;
    width: 100%;
    bottom: 16px;
    left: 0px;
    transform: scale(0.8) rotate(-3deg);
    ul {
      display: flex;
      justify-content: space-between;
      &:hover {
        li {
          opacity: 0.1;
        }
      }
      li {
        transition: 0.25s ease;
        display: flex;
        align-items: center;
        position: relative;
        .image {
          width: 16px;
          height: 16px;
        }
        .value,
        .value-small {
          transition: 0.25s ease;
          font-size: 12px;
          pointer-events: none;
          cursor: default;
          display: flex;
          flex-direction: column;
          > span {
            line-height: 8px;
            &:nth-child(2) {
              transform: translateX(3px);
              color: $red-a4;
            }
          }
        }
        .value {
          opacity: 0;
          position: absolute;
          left: 16px;
        }
        &:not(:first-child) {
          margin-left: 3px;
        }
        &:hover {
          transform: scale(1.5);
          opacity: 1;
          .value {
            opacity: 1;
          }
          .value-small {
            opacity: 0;
          }
          &:last-child {
            transform: scale(1.5) translateX(-10px);
          }
        }
      }
    }
  }
  .usables {
    transition: 0.25s ease;
    position: absolute;
    top: 24px;
    left: 4px;
    transform: scale(0.7) rotate(-3deg);
    ul {
      li {
        display: flex;
        align-items: center;
        height: 16px;
        pointer-events: none;
        .image {
          width: 18px;
          height: 18px;
        }
        .value {
        }
      }
    }
    &:hover {
      transform: scale(1) rotate(-3deg) translate(5px, 10px);
    }
  }
  .active-items {
    position: absolute;
    right: 10px;
    top: 24px;
    transform: scale(0.8);
    .item {
      max-height: 25px;
      .name {
        display: none;
      }
      .item-image {
        opacity: 1;
        position: relative;
        .player-icon {
          position: absolute;
          z-index: 2;
          pointer-events: none;
          bottom: 5px;
          transform-origin: left;
          transform: scale(0.6);
        }
      }
    }
  }
}
</style>