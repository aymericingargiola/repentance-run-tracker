import Vue from 'vue'
import App from './App.vue'
import store from './store/store'
import router from './router/router'
import vuescroll from 'vuescroll'
import { ColorPicker } from 'vue-color-gradient-picker'
import 'vue-color-gradient-picker/dist/index.css'

Vue.use(vuescroll, {
  ops: {
    // The global config
  },
})

Vue.component("ColorPicker", ColorPicker)

Vue.prototype.$isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1

// store.$repo(Context).insert({
//   id: 1
// });

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
