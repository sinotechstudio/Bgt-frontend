import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trophy, Wallet, Users, Sparkles, X } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useRouter } from '../../context/RouterContext';
import { formatTimeAgo } from '../../lib/utils';
import { NotificationItem } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsRead } =
    useWebSocket();
  const { navigate } = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'tournament':
        return <Trophy className="w-4 h-4 text-indigo-400" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'team':
        return <Users className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleClickItem = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    if (item.type === 'tournament') {
      navigate('/tournaments');
    } else if (item.type === 'wallet') {
      navigate('/wallet');
    } else if (item.type === 'team') {
      navigate('/team');
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl shadow-black/90 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#141E33]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Live Notifications</h3>
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
              {unreadNotificationsCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="Close notifications">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
            <p className="text-sm font-medium text-slate-300">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">Real-time alerts will show up here</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClickItem(item)}
              className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start hover:bg-slate-800/50 ${
                !item.read ? 'bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-800/80 shrink-0 mt-0.5 border border-slate-700/60">
                {getNotificationIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1 mb-0.5">
                  <h4 className={`text-xs font-semibold ${!item.read ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0">{formatTimeAgo(item.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.message}</p>
              </div>
              {!item.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></span>}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#090D16] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          WebSocket Live Feed Active
        </span>
        <button
          onClick={() => {
            navigate('/profile');
            onClose();
          }}
          className="text-indigo-400 hover:underline"
        >
          Preferences
        </button>
      </div>
    </div>
  );
};
