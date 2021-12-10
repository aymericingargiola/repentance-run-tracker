import Vue from 'vue'
import App from './App.vue'
import store from './store/store'
import router from './router/router'
import { DateTime } from 'luxon'
import vuescroll from 'vuescroll'
import VCalendar from 'v-calendar'
import VueTimepicker from 'vue2-timepicker'
import 'vue2-timepicker/dist/VueTimepicker.css'
import { ColorPicker } from 'vue-color-gradient-picker'
import VueI18n from 'vue-i18n'
import { languages, defaultLocale } from './i18n/index'
import 'vue-color-gradient-picker/dist/index.css'
import helpers from './helpers/format'

const plugins = {
  install () {
    Vue.helpers = helpers
    Vue.prototype.$helpers = helpers
  }
}

Vue.use(plugins)

Vue.use(vuescroll)

Vue.use(VCalendar)

Vue.component("vue-timepicker", VueTimepicker)

Vue.component("ColorPicker", ColorPicker)

Vue.use(VueI18n)
const messages = Object.assign(languages)
const i18n = new VueI18n({ locale: defaultLocale, fallbackLocale: 'en', messages })

Vue.prototype.$DateTime = DateTime
Vue.prototype.$isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
Vue.prototype.$isDev = process.env.NODE_ENV === "development"

// store.$repo(Context).insert({
//   id: 1
// });

Vue.config.productionTip = false

Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      if (!(el == event.target || el.contains(event.target))) {
        vnode.context[binding.expression](event)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
})

new Vue({
  store,
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')
