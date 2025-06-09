const WebSocket = require('ws');

class Client {
    constructor(ws) {
        this.token = null; // Use null for unauthenticated state
        this.ws = ws;
    }

    set_token(token) {
        this.token = token;
        console.log("Client authenticated with token:", this.token);
    }

    send(json) {
        // Check if the socket is open and the token is set.
        if (this.ws.readyState === WebSocket.OPEN && this.token) {
            console.log("Sending message:", json, "to client with token:", this.token);
            this.ws.send(JSON.stringify(json));
            return true;
        } else {
            console.log("Client with token:", this.token, "is not connected.");
            return false;
        }
    }
}

module.exports = Client;
