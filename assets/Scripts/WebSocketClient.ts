import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WebSocketClient')
export class WebSocketClient extends Component {
    private ws: WebSocket | null = null;

    onLoad() {
        // Connect to your server (replace with your server address)
        this.ws = new WebSocket('wss://echo.websocket.events'); // free echo test server

        // Called when connection is open
        this.ws.onopen = () => {
            console.log('WebSocket connected ✅');
            // send test message
            this.sendMessage('Hello Server!');
        };

        // Called when a message is received
        this.ws.onmessage = (event) => {
            console.log('Received from server:', event.data);
        };

        // Called on error
        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        // Called when closed
        this.ws.onclose = () => {
            console.log('WebSocket closed');
        };
    }

    /** Send message to server */
    public sendMessage(msg: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
        } else {
            console.warn('WebSocket not ready yet');
        }
    }

    /** Clean up on destroy */
    onDestroy() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
