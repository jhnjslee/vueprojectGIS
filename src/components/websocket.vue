<!--웹소켓을 위한 컴포넌트!-->

<template>
        <div id="app">
		  <button @click="disconnect" v-if="status === 'connected'">연결끊기</button>
		  <button @click="connect" v-if="status === 'disconnected'">연결</button> {{ status }}
		  <br /><br />
		  <div v-if="status === 'connected'">
			<form @submit.prevent="sendMessage" action="#">
			  <input v-model="message"><button type="submit">메세지 전송</button>
			</form>
			<ul id="logs">
			  <li v-for="log in logs" class="log" v-bind:key = "log">
                  <!--
                      In 2.2.0+, when using v-for with a component, a key is now required.
                  -->
				{{ log.event }}: {{ log.data }}
			  </li>
			</ul>
		  </div>
		</div>
</template>
    
    	<script language="javascript" type="text/javascript">
			const app = new Vue({
			  el: "#app",
			  data: {
				message: "",
				logs: [],
				status: "disconnected"
			  },
			  methods: {
				connect() {
				  this.socket = new WebSocket("wss://echo.websocket.org");
				  this.socket.onopen = () => {
					this.status = "connected";
					this.logs.push({ event: "연결 완료: ", data: 'wss://echo.websocket.org'})
					

					this.socket.onmessage = ({data}) => {
					  this.logs.push({ event: "메세지 수신", data });
					};
				  };
				},
				disconnect() {
				  this.socket.close();
				  this.status = "disconnected";
				  this.logs = [];
				},
				sendMessage(e) {
				  this.socket.send(this.message);
				  this.logs.push({ event: "메시지 전송", data: this.message });
				  this.message = "";
				}
			  }
			});
		</script>
    