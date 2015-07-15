/*global SockJS, Stomp, conf */

class StompConnection {
  constructor() {
    this.isConnected = false;
  }

  connect(username, password, game) {
    let headers = {
          "x-username": username,
          "x-password": password
        },
        onConnect = (frame) => {
<<<<<<< HEAD
          debugger;
=======
>>>>>>> 0f3f0acd2bd61be51dbadb4d2b661e0697c29bba
          this.isConnected = true;
          this.client.subscribe("/topic/zombietime_" + game, this.onMessage.bind(this), {});
        },
        onError = (error) => {
          this.isConnected = false;
          console.log('======================================');
          console.log('= ERROR IN STOMP CONNECTION');
          console.log(error);
          console.log('======================================');
        };

    this.socket = new SockJS(conf.websocketsUrl + '/message');
    this.client = Stomp.over(this.socket);
    this.client.connect(headers, onConnect, onError);
  }

  getWebsocketClient() {
    this.client = Stomp.over(this.socket);
  }

  onMessage(message) {
    console.log(message);
  }
}
