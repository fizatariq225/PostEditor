import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      // In a real application, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      console.log('WebSocket connection simulated');
      
      this.reconnectAttempts = 0;
      return Promise.resolve();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
      return Promise.reject(error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.log('WebSocket not connected, queuing message:', { event, data });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }
}

export const wsService = new WebSocketService();