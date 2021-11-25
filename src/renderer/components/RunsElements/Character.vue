<template>
    <div v-if="characters && floors && runEnd" class="run-el character" :style="{backgroundImage:`url('img/cards/characters-small.png')`}">
        <div class="before" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
        <div class="after" :style="{backgroundImage:`url('img/icons/pin.png')`}"></div>
        <div v-if="characters[0].stats && parseInt(characters[0].id) != 10 && parseInt(characters[0].id) != 14 && (floors[floors.length - 1] && floors[floors.length - 1].curse != 'Curse of the Unknown' || runEnd.date != null)" class="hearts">
            <template v-for="rhidx in characters[0].stats.life.maxHearts / 2">
                <div class="heart-container red-heart" :key="`red-heart-${rhidx}`">
                    <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/red-heart-${characters[0].stats.life.hearts > characters[0].stats.life.maxHearts ? `full` : characters[0].stats.life.hearts - (rhidx - 1) * 2 > 1 ? `full` : characters[0].stats.life.hearts - (rhidx - 1) * 2 > 0 ? `half` : `empty`}.png')`}"></div>
                </div>
            </template>
            <template v-for="bhidx in characters[0].stats.life.boneHearts">
                <div class="heart-container bone-heart" :key="`bone-heart-${bhidx}`">
                    <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/bone-heart-${(characters[0].stats.life.hearts - characters[0].stats.life.maxHearts) - (bhidx - 1) * 2 > 1 ? `full` : (characters[0].stats.life.hearts - characters[0].stats.life.maxHearts) - (bhidx - 1) * 2 > 0 ? `half` : `empty`}.png')`}"></div>
                </div>
            </template>
            <template v-for="shidx in Math.ceil(characters[0].stats.life.soulHearts / 2)">
                <div class="heart-container soul-heart" :key="`soul-heart-${shidx}`">
                    <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/soul-heart-${characters[0].stats.life.soulHearts - (shidx - 1) * 2 > 1 ? `full` : `half`}.png')`}"></div>
                </div>
            </template>
            <!-- There is an issue to calculate black heart, if you have blue hearts between black hearts it will count as black heart so i only show blue hearts for the moment (it includes black heart also) -->
            <!-- <template v-for="blhidx in calcBlackHeart(characters[0].stats.life.blackHearts)">
                {{calcBlackHeart(characters[0].stats.life.blackHearts)}}
                <div class="heart-container black-heart" :key="`black-heart-${blhidx}`">
                    <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/black-heart-${calcBlackHeart(characters[0].stats.life.blackHearts)*2 - (blhidx - 1) * 2 > 1 ? `full` : `half`}.png')`}"></div>
                </div>
            </template> -->
        </div>
        <div v-if="characters[0].stats && parseInt(characters[0].id) === 14 && (floors[floors.length - 1] && floors[floors.length - 1].curse != 'Curse of the Unknown' || runEnd.date != null)" class="hearts">
            <template v-for="chidx in characters[0].stats.life.maxHearts / 2">
                <div class="heart-container coin-heart" :key="`red-heart-${chidx}`">
                    <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/coin-heart-${characters[0].stats.life.hearts - (chidx - 1) * 2 > 1 ? `full` : `empty`}.png')`}"></div>
                </div>
            </template>
        </div>
        <div v-if="characters[0].stats && floors[floors.length - 1] && floors[floors.length - 1].curse === 'Curse of the Unknown'" class="hearts">
            <div class="heart-container unknow-heart">
                <div class="heart" :style="{backgroundImage:`url('img/icons/hearts/unknow-heart.png')`}"></div>
            </div>
        </div>
        <div v-if="characters[0].stats" class="usables">
            <ul>
                <li class="coins">
                    <div class="image" :style="{backgroundImage:`url('img/icons/hud/coin.png')`}"></div>
                    <span class="value">
                        {{(`0${characters[0].stats.usables.coins}`).slice(-2)}}
                    </span>
                </li>
                <li class="bombs">
                    <div class="image" :style="{backgroundImage:`url('img/icons/hud/bomb.png')`}"></div>
                    <span class="value">
                        {{(`0${characters[0].stats.usables.bombs}`).slice(-2)}}
                    </span>
                </li>
                <li class="keys">
                    <div class="image" :style="{backgroundImage:`url('img/icons/hud/key.png')`}"></div>
                    <span class="value">
                        {{(`0${characters[0].stats.usables.keys}`).slice(-2)}}
                    </span>
                </li>
            </ul>
        </div>
        <ul class="active-items">
            <template v-for="(item, ctidx) in characters[0].activables">
                <li class="item" :key="item.title + ctidx">
                    <div class="name">
                        {{item.title}}
                    </div>
                    <a class="item-image" :href="`https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g,'_'))}`" target="_blank">
                        <img :src="`img/icons/collectibles/${(`00${item.id}`).slice(-3)}.png`">
                    </a>
                </li>
            </template>
        </ul>
        <div class="image" :style="{backgroundImage:`url('img/characters/${characters[0].trueName}${parseInt(characters[0].id) > 20 ? ` Alt` : ``}.png')`}"></div>
        <div v-if="characters[0].stats" class="stats">
            <ul>
                <li class="speed">
                    <div class="image" :style="{backgroundImage:`url('img/icons/stats/speed.png')`}"></div>
                    <span class="value">
                        {{(Math.round(characters[0].stats.stats.moveSpeed * 100) / 100).toFixed(2)}}
                    </span>
                    <span class="value-small">
                        {{(Math.round(characters[0].stats.stats.moveSpeed * 100) / 100).toFixed(1)}}
                    </span>
                </li>
                <li class="tear-rate">
                    <div class="image" :style="{backgroundImage:`url('img/icons/stats/tearrate.png')`}"></div>
                    <span class="value">
                        {{(Math.round(characters[0].stats.stats.currentFireDelay * 100) / 100).toFixed(2)}}
                    </span>
                    <span class="value-small">
                        {{(Math.round(characters[0].stats.stats.currentFireDelay * 100) / 100).toFixed(1)}}
                    </span>
                </li>
                <li class="damage">
                    <div class="image" :style="{backgroundImage:`url('img/icons/stats/damage.png')`}"></div>
                    <span class="value">
                        {{(Math.round(characters[0].stats.stats.damage * 100) / 100).toFixed(2)}}
                    </span>
                    <span class="value-small">
                        {{(Math.round(characters[0].stats.stats.damage * 100) / 100).toFixed(1)}}
                    </span>
                </li>
                <li class="luck">
                    <div class="image" :style="{backgroundImage:`url('img/icons/stats/luck.png')`}"></div>
                    <span class="value">
                        {{(Math.round(characters[0].stats.stats.luck * 100) / 100).toFixed(2)}}
                    </span>
                    <span class="value-small">
                        {{(Math.round(characters[0].stats.stats.luck * 100) / 100).toFixed(1)}}
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: "RunCharacter",
    props: {
        characters: Array,
        floors: Array,
        runEnd: Object
    },
    components: {
    },
    data() {
        return {
        }
    },
    computed: {
    },
    methods: {
    },
    mounted() {
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.run-el.character {
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
    transform: translateY(-2px) scale(1.25);
    .before, .after {
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
    .name {
        margin-bottom: 2px;
        font-size: 16px;
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
        width: calc(12*6px);
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
                .value, .value-small {
                    transition: 0.25s ease;
                    font-size: 12px;
                    pointer-events: none;
                    cursor: default;
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
        right: 20px;
        top: 24px;
        .item {
            .name {
                display: none;
            }
            .item-image {
                opacity: 1;
            }
        }
    }
}
</style>