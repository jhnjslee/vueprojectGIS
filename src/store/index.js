import Vue from 'vue'
import Vuex from 'vuex'
//import getters from './getters'
//import actions from './mutations'
import 'es6-promise/auto'
import loginAPI from '../service/loginAPI'
import actions from './actions'
import constants from "../constants"
import * as types from './mutation_types'


Vue.use(Vuex)

const state = {
  uid: '',
  errorState: '',
  isAuth: false
}


export default new Vuex.Store({
  actions,
  state: {
    constants: constants,
    pointX : 0,
    pointY : 0,
    websocketStatus: "disconnected",
  },
  getters:{
      CONSTANTS: state=>{
        return state.constants
      },
      getStatus(state){
        return state.websocketStatus;
      },
      getUid: state => state.uid,
      getErrorState: state => state.errorState,
      getIsAuth: state => state.isAuth
  },
  mutations: {
    pointCalibration(x,y){
      pointX = x;
      pointY =y;
    },
    changeState(state,changer) {
      if(changer==0){
        state.websocketStatus="disconnected"
      }
      else if(changer==1){
        state.websocketStatus="connected"
      }
    },
    [types.UID] (state, uid) {
      state.uid = uid
    },
    [types.ERROR_STATE] (state, errorState) {
      state.errorState = errorState
    },
    [types.IS_AUTH] (state, isAuth) {
      state.isAuth = isAuth
    }
  },
  actions: {
    changeStateAction(context,payload) {     //context로 store의 메서드와 속성 접근
      context.commit('changeState',payload);
    },
    async login (store, {uid, password}) {
      /* 로그인은 백엔드를 다녀와야 하냐 비동기 처리를 한다 */
    },
  },
  modules: {
  },
  async login (uid, password) {
    try {
      const loginResponse = await loginAPI.login(uid, password)
      return loginResponse
    } catch (err) {
      console.error(err)
    }
  }
})
