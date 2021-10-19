import Vue from 'vue'
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'

Vue.use(Vuex)

const database = new VuexORM.Database()

const store = new Vuex.Store({
    plugins: [VuexORM.install(database)]
})

export default store