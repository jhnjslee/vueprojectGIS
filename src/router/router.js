import Vue from 'vue'
import App from '../App.vue'
import VueRouter from 'vue-router';
import LoginT from '../components/LoginT' // 로그인 컴포넌트를 import 한다

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  
  routes: [
  
    {
      path: '/components/LoginT',
      name: 'login',
      component: LoginT
    },
   
  ],
});//로그인 맨 앞에다가