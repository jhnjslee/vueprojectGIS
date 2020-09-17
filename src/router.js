import Vue from 'vue';
import Router from 'vue-router';
import Login from './component/Login.vue';
import LoginPro from './compo/LoginPro.vue';
import LoginForm from './compo/LoginForm.vue';
import LoginT from './components/LoginT' // 로그인 컴포넌트를 import 한다


Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'LoginT',
      component: LoginT
    },
  ],
});//로그인 맨 앞에다가