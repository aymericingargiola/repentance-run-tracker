<template>
  <transition name="show">
    <div
      v-if="errors.length > 0"
      class="pop-up app-error"
    >
      <div class="content">
        <h1 class="title">
          {{ $t('appError.title') }}
        </h1>
        <img
          class="error-img"
          src="img/icons/error.png"
        >
        <p class="message">
          {{ $t('appError.messagePart1') }} <a
            href="https://github.com/aymericingargiola/repentance-run-tracker/issues/new?assignees=aymericingargiola&labels=bug&template=bug_report.md&title="
            target="_blank"
          >{{ $t('dictionary.here') }}</a> {{ $t('appError.messagePart2') }} <br><br>{{ $t('appError.messagePart3') }}
        </p>
        <ul class="error-area">
          <template v-for="(error, eridx) in errors">
            <li
              :key="eridx"
              class="error"
            >
              {{ error }}
            </li>
          </template>
        </ul>
        <div class="actions">
          <div class="btn generate">
            <button @click="generateZipDump()">
              {{ $t('appError.generateZip') }}
            </button>
          </div>
          <div class="btn restart">
            <button @click="restartApp()">
              {{ $t('strings.restartApp') }}
            </button>
          </div>
          <div class="btn close">
            <button @click="closeApp()">
              {{ $t('strings.closeApp') }}
            </button>
          </div>
        </div>
        <a
          ref="saveZip"
          href="#"
        />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
    name: "AppError",
    data() {
        return {
            errors: []
        }
    },
    computed: {
    },
    mounted() {
        window.ipc.on('SYNC_SEND_APP_ERROR', (response) => {
            console.log(response)
            if(!this.errors.includes(response.error.stack)) this.errors.push(response.error.stack)
        })
        window.ipc.on('ASK_ERROR_ZIP', (response) => {
            console.log(response)
            const file = new Blob([response.datas], {type: "application/zip"});
            this.$refs.saveZip.setAttribute('href', URL.createObjectURL(file))
            this.$refs.saveZip.download = response.fileName
            this.$refs.saveZip.click()
        })
        if (this.$isLinux) {
          window.ipc.send('CHECK_LINUX_PATHS')
        }
    },
    methods: {
        generateZipDump() {
            window.ipc.send('ASK_ERROR_ZIP')
        },
        restartApp() {
            window.ipc.send('RESTART_APP')
        },
        closeApp() {
            window.ipc.send('CLOSE_APP')
        }
    },
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.pop-up.app-error {
    position: fixed;
    z-index: 800;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(15px);
    width: 100vw;
    height: 100vh;
    .content {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        background-color: $paper-white-darker;
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .error-img {
            width: 28px;
            height: 33px;
            position: absolute;
            bottom: 0px;
            left: 0px;
            z-index: 0;
            transform: scale(3) translate(5px, -5px) rotate(40deg);
            pointer-events: none;
            animation-name: error-move;
            animation-timing-function: ease;
            animation-iteration-count: infinite;
            animation-duration: 5s;
            animation-direction: alternate-reverse;
            @keyframes error-move {
                0% {
                    transform: scale(3) translate(0px, 0px) rotate(40deg);
                }
                49% {
                    transform: scale(3) translate(5px, -5px) rotate(45deg);
                }
                50% {
                    transform: scale(3) translate(5px, -5px) rotate(45deg);
                }
                100% {
                    transform: scale(3) translate(0px, 0px) rotate(40deg);
                }
            }
        }
        .message {
            font-size: 20px;
        }
        .error-area {
            position: relative;
            z-index: 1;
            text-align: left;
            color: $red-a2;
            font-family: "Up Heaval", sans-serif;
            line-height: 28px;
            letter-spacing: 2px;
            font-size: 25px;
            text-shadow: rgba(0, 0, 0, 1);
            padding: 20px;
            height: 100%;
            overflow: auto;
            background: rgba(255, 255, 255, 0.10);
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
            border-radius: 10px;
            -webkit-text-stroke: 2px rgba(0, 0, 0, 0.20);
            .error {
                margin-top: 10px;
                &:first-child {
                    margin-top: 0px;
                }
            }
        }
        .actions {
            margin-top: 20px;
            margin-left: auto;
            margin-right: auto;
            display: flex;
            flex-direction: row;
            > div {
                margin: 0px 10px;
            }
        }
    }
    &.fade-enter-active, &.fade-leave-active {
        transition: opacity .5s;
    }
    &.fade-enter, .fade-leave-to {
        opacity: 0;
    }
}
</style>