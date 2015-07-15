/*global $, SockJS, Stomp, conf, utils */

class StompConnection {
  constructor() {
    let qp = utils.getQueryParams();

    this.isConnected = false;
    if (qp && qp.username && qp.password && qp.game) this.connect(qp.username, qp.password, qp.game);
  }

  connect(username, password, game) {
    let headers = {
          "x-username": username,
          "x-password": password
        },
        onConnect = (frame) => {
          this.isConnected = true;
          this.client.subscribe("/topic/zombietime_" + game, this.onMessage, {});
        },
        onError = (error) => {
          this.isConnected = false;
          console.log('======================================');
          console.log('= ERROR IN STOMP CONNECTION');
          console.log(error);
          console.log('======================================');
        };

    this.game = game;
    this.socket = new SockJS(conf.websocketsUrl + '/message');
    this.client = Stomp.over(this.socket);
    this.client.connect(headers, onConnect, onError);
  }

  getWebsocketClient() {
    this.client = Stomp.over(this.socket);
  }

  onMessage(message) {
    $(window).trigger("message.stomp.zt", JSON.parse(message.body));
  }

  sendMessage(type, data) {
    let message = {
          "game": this.game,
          "type": type,
          "data": data
        },
        jsonMessage = JSON.stringify(message);

    this.client.send("/app/message", {}, jsonMessage);
  }
}
