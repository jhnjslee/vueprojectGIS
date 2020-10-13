import Vue from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify';
import router from './router/router.js'
import VModal from 'vue-js-modal'
import VueSession from 'vue-session'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import Spinner from 'vue-simple-spinner'
import Notifications from 'vue-notification'

Vue.use(Notifications)
Vue.use(Spinner)
Vue.use(VueRouter)
Vue.use(VueResource);

Vue.config.productionTip = false
Vue.use(VModal, { dynamic: true })

var sessionOptions = {
  persist: true
} 
Vue.use(VueSession,sessionOptions)

new Vue({
  App,
  store,
  vuetify,  
  router,
  VueResource,
  Spinner,
  render: h => h(App),


}).$mount('#app')
