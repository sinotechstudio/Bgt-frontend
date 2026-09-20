import { WebSocketEvent } from '../types';

type EventCallback = (data: any, fullEvent: { event: WebSocketEvent; timestamp: string; data: any }) => void;
type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string = '';
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectListeners: Set<() => void> = new Set();
  private reconnectAttempt: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private status: ConnectionStatus = 'disconnected';
  private processedEvents: Set<string> = new Set();
  private isExplicitlyClosed: boolean = false;

  constructor() {
    this.updateUrl();
  }

  private updateUrl() {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      this.url = `${protocol}//${host}/ws`;
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: ConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((cb) => cb(newStatus));
    }
  }

  public onStatusChange(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    cb(this.status);
    return () => this.statusListeners.delete(cb);
  }

  public onReconnect(cb: () => void): () => void {
    this.reconnectListeners.add(cb);
    return () => this.reconnectListeners.delete(cb);
  }

  public connect() {
    if (typeof window === 'undefined') return;
    this.isExplicitlyClosed = false;
    this.updateUrl();

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        const wasReconnecting = this.reconnectAttempt > 0;
        this.reconnectAttempt = 0;
        this.setStatus('connected');
        this.startHeartbeat();

        // If this was a reconnection after dropping, trigger all resync listeners!
        if (wasReconnecting) {
          this.reconnectListeners.forEach((cb) => {
            try {
              cb();
            } catch (err) {
              console.error('Error in onReconnect handler:', err);
            }
          });
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const eventType: string = parsed.event;
          const timestamp: string = parsed.timestamp || '';

          // Duplicate event deduplication
          const dedupeKey = `${eventType}-${JSON.stringify(parsed.data)}-${timestamp.slice(0, 19)}`;
          if (this.processedEvents.has(dedupeKey)) {
            return;
          }
          this.processedEvents.add(dedupeKey);
          if (this.processedEvents.size > 200) {
            const first = Array.from(this.processedEvents)[0];
            this.processedEvents.delete(first);
          }

          // Dispatch to specific event listeners
          const cbs = this.listeners.get(eventType);
          if (cbs) {
            cbs.forEach((cb) => cb(parsed.data, parsed));
          }

          // Dispatch to wildcard listeners
          const allCbs = this.listeners.get('*');
          if (allCbs) {
            allCbs.forEach((cb) => cb(parsed.data, parsed));
          }
        } catch {
          // non-json frame
        }
      };

      this.socket.onclose = () => {
        this.stopHeartbeat();
        this.socket = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      };

      this.socket.onerror = () => {
        // will trigger onclose and schedule reconnect
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed) return;
    this.setStatus('reconnecting');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, capped at 16s
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 16000);
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, backoff);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('disconnected');
  }

  public subscribe(event: WebSocketEvent | '*', cb: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(cb);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Trigger local dispatch (used by simulator or test actions)
  public dispatchLocal(event: WebSocketEvent, data: any) {
    const payload = { event, data, timestamp: new Date().toISOString() };
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.forEach((cb) => cb(data, payload));
    }
    const allCbs = this.listeners.get('*');
    if (allCbs) {
      allCbs.forEach((cb) => cb(data, payload));
    }
  }
}

export const wsClient = new WebSocketClient();
