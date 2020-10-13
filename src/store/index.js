import Vue from 'vue'
import Vuex from 'vuex'
//import getters from './getters'
//import actions from './mutations'
import 'es6-promise/auto'
import constants from "../constants"


Vue.use(Vuex)



export default new Vuex.Store({
  state: {
    constants: constants,
    pointX : 0,
    pointY : 0,
    websocketStatus: "disconnected",
    currentCalNumber : "",
    sendingCalState : "",
    spinnerState : false
  },
  getters:{
      CONSTANTS: state=>{
        return state.constants
      },
      getStatus(state){
        return state.websocketStatus;
      },

      getCalNumb(state){
        return state.currentCalNumber;
      },
      getSendingState(state){
        return state.sendingCalState;
      },
      getSpinnerState(state){
        return state.sendingCalState;
      },
    },
  mutations: {
    pointCalibration(x,y){
      pointX = x;
      pointY = y;
    },
    changeState(state,changer) {
      if(changer==0){
        state.websocketStatus="disconnected"
      }
      else if(changer==1){
        state.websocketStatus="connected"
      }
    },
    changeCalamity(state,changeArray) {
      state.sendingCalState=changeArray[0];
      state.currentCalNumber=changeArray[1];
    },
    changeSpinnerState(state,changerindex) {
      if(changerindex==0){
        state.spinnerState=true
      }
      else if(changerindex==1){
        state.spinnerState=false
      }
      
    },

  
  },
  actions: {
    changeStateAction(context,payload) {     //context로 store의 메서드와 속성 접근
      context.commit('changeState',payload);
    },
    changeCalStateAction(context,payload) {     //context로 store의 메서드와 속성 접근
      context.commit('changeCalamity',payload);
    },
    changeSpinnerAction(context,payload) {     //context로 store의 메서드와 속성 접근
      context.commit('changeSpinnerState',payload);
    },
    async login (store, {uid, password}) {
      /* 로그인은 백엔드를 다녀와야 하냐 비동기 처리를 한다 */
    },
  },
  modules: {
  },
  
})
