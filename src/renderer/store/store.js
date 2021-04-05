import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import VuexORM from '@vuex-orm/core'

Vue.use(Vuex)

const database = new VuexORM.Database()

const store = new Vuex.Store({
    plugins: [VuexORM.install(database), createPersistedState()]
})

export default store