<template>
  <div class="example-modal-window">
    <!-- 컴포넌트 MyModal -->
    <loginForm @close="closeModal" v-if="modal">
      <!-- default 슬롯 콘텐츠 -->
      <p>Login plz</p>
      <div><input v-model="id">ID</div>
      <div><input v-model="pass">PASSWORD</div>
      <!-- /default -->
      <!-- footer 슬롯 콘텐츠 -->
      <template slot="footer">
        <button @click="doSend">제출</button>
      </template>
      <!-- /footer -->
    </loginForm>
  </div>
</template>

<script>
import loginForm from './LoginForm.vue'

export default {
  components: { loginForm },
  data() {
    return {
      modal: false,
      id: '',
      pass: ''
    }
  },
  methods: {
    openModal() {
      this.modal = true
    },
    closeModal() {
      this.modal = false
    },
    doSend() {
      if (this.id.length > 0) {
        alert(this.id+' 님이 로그인 하셨습니다.'+'비밀번호는 '+pass+'입니다.')
        this.id = ''
        this.pass = ''
        this.closeModal()
      } else {
        alert('메시지를 입력해주세요.')
      }
    }
  }
}
</script>