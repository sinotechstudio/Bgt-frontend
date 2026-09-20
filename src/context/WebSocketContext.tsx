import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wsClient } from '../lib/websocket';
import { WebSocketEvent, NotificationItem } from '../types';
import { useToast } from './ToastContext';
import { api } from '../lib/api';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

interface WebSocketContextType {
  status: ConnectionStatus;
  reconnect: () => void;
  lastEvent: { event: string; data: any; timestamp: string } | null;
  unreadNotificationsCount: number;
  notifications: NotificationItem[];
  walletBalance: number | null;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  simulateEvent: (type: 'join_event' | 'live_score' | 'deposit_received' | 'new_tournament') => Promise<void>;
  onEvent: (event: WebSocketEvent, callback: (data: any) => void) => () => void;
  // Subscribers trigger for pages to auto-refresh data
  dataVersion: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<{ event: string; data: any; timestamp: string } | null>(null);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const { info, success } = useToast();

  const triggerInvalidation = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await api.notifications.list();
      setNotifications(res.data || []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch {
      // ignore
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await api.wallet.get();
      setWalletBalance(res.data.balance);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Initial fetch of wallet and notifications
    refreshNotifications();
    refreshWallet();

    // Setup WS client connection
    wsClient.connect();

    const unsubStatus = wsClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubReconnect = wsClient.onReconnect(() => {
      info('Reconnected to real-time game servers. Synchronizing data...', 'Real-Time Connected');
      triggerInvalidation();
      refreshNotifications();
      refreshWallet();
    });

    // Listen to all events
    const unsubEvents = wsClient.subscribe('*', (data, full) => {
      setLastEvent(full);

      switch (full.event) {
        case 'tournament.created':
          info(`New Tournament Added: ${data.title || 'Check it out!'}`, 'Tournament Alert');
          triggerInvalidation();
          break;
        case 'tournament.updated':
        case 'tournament.started':
        case 'tournament.completed':
          triggerInvalidation();
          break;
        case 'tournament.participant_joined':
          triggerInvalidation();
          break;
        case 'wallet.updated':
          setWalletBalance(data.balance);
          triggerInvalidation();
          break;
        case 'team.created':
        case 'team.updated':
        case 'team.member_added':
          triggerInvalidation();
          break;
        case 'notification.created':
          setNotifications((prev) => [data, ...prev]);
          setUnreadNotificationsCount((c) => c + 1);
          info(data.message, data.title);
          break;
      }
    });

    return () => {
      unsubStatus();
      unsubReconnect();
      unsubEvents();
    };
  }, [info, refreshNotifications, refreshWallet, triggerInvalidation]);

  const reconnect = useCallback(() => {
    wsClient.connect();
  }, []);

  const onEvent = useCallback((event: WebSocketEvent, callback: (data: any) => void) => {
    return wsClient.subscribe(event, callback);
  }, []);

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
      success('All notifications marked as read');
    } catch {
      // ignore
    }
  };

  const simulateEvent = async (type: 'join_event' | 'live_score' | 'deposit_received' | 'new_tournament') => {
    try {
      const res = await api.simulate(type);
      success(res.message, 'Event Broadcasted');
      triggerInvalidation();
      if (type === 'deposit_received') {
        refreshWallet();
      }
      refreshNotifications();
    } catch (err: any) {
      info('Simulated local event dispatched');
      // Fallback local dispatch
      if (type === 'join_event') {
        wsClient.dispatchLocal('tournament.participant_joined', { tournamentId: 1, participants: 85, maxPlayers: 100 });
      } else if (type === 'deposit_received') {
        wsClient.dispatchLocal('wallet.updated', { balance: (walletBalance || 1250) + 500, currency: '₹' });
      }
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        status,
        reconnect,
        lastEvent,
        unreadNotificationsCount,
        notifications,
        walletBalance,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        simulateEvent,
        onEvent,
        dataVersion,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
