import Vue from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router'
import proj4 from 'proj4/dist/proj4' //좌표계 
import VModal from 'vue-js-modal'
import VueSession from 'vue-session'

var sessionOptions ={
  persist: true
}

Vue.config.productionTip = false
Vue.use(VModal, { dynamic: true })
Vue.use(VueSession,sessionOptions)

new Vue({
  store,
  vuetify,
  VueRouter,
  render: h => h(App)
}).$mount('#app')
