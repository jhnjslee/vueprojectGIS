// src/sercice/loginAPI.js
import axios from 'axios'

const getUserInfo = (uid, passwordT) => {
  return axios.get('/endpoint-for-get-user-info', {
    params: {
      'uid': uid,
      'passwordT': passwordT
    }
  })
}

const isFinished = uid => {
  return axios.get('/endpoint-for-is-finished', {
    params: {
      'uid': uid
    }
  })
}

export default {
  async login (uid, passwordT) {
    try {
      const getUserInfoPromise = await getUserInfo(uid, passwordT)
      const isFinishedPromise = await isFinished(uid) // Promise.all의 예시를 위해 집어넣음
      const [userInfoResponse, isFinishedResponse] = await Promise.all([getUserInfoPromise, isFinishedPromise])
      if (userInfoResponse.data.length === 0) return 'noAuth' // 로그인 결과에 따른 분기 처리를 해준다
      if (isFinishedResponse.data[0].CNT > 0) return 'done'
      return userInfoResponse
    } catch (err) {
      console.error(err)
    }
  }
}