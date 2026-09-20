import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  Home,
  Trophy,
  Wallet,
  Users,
  User,
  Bell,
  LogOut,
  ChevronDown,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { NotificationDropdown } from './NotificationDropdown';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';
import { formatCurrency } from '../../lib/utils';

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadNotificationsCount, walletBalance } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Tournament', path: '/tournaments', icon: Trophy },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'My Team', path: '/team', icon: Users },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return path === '/';
    return path.startsWith(itemPath);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const balanceToDisplay = walletBalance !== null ? walletBalance : 1250;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button
            id="header-logo-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-wider text-white flex items-center gap-1">
                NEXUS<span className="text-cyan-400">ARENA</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-1">
                Esports Hub
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  id={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'text-white bg-indigo-600/15 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Real-time WS Status Badge & Simulator Drawer */}
          <RealtimeStatusBadge />

          {/* Wallet Balance Shortcut */}
          <button
            id="header-wallet-shortcut"
            onClick={() => navigate('/wallet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E1526] hover:bg-[#141F36] border border-slate-700/80 transition-all hover:border-indigo-500/50 group"
            title="View Tournament Wallet"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none">
                Wallet
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {formatCurrency(balanceToDisplay)}
              </span>
            </div>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-[#0E1526] hover:bg-[#141F36] border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-[#090D16]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* User Profile / Avatar Menu */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="header-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl bg-[#0E1526] hover:bg-[#141F36] border border-slate-700/80 transition-all group"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/40"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 group-hover:text-white max-w-[100px] truncate">
                  {user.gamerTag || user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                        {user.accountStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>My Profile & Stats</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/team');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>My Squad & Team</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/wallet');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Wallet & Payouts</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    id="header-logout-action-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
