import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Radio, Sparkles, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { wsClient } from '../../lib/websocket';

export const RealtimeStatusBadge: React.FC = () => {
  const { status, reconnect, simulateEvent } = useWebSocket();
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);

  const getStatusDisplay = () => {
    switch (status) {
      case 'connected':
        return {
          text: 'WS Connected',
          dot: 'bg-emerald-400',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          icon: <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />,
        };
      case 'reconnecting':
        return {
          text: 'Reconnecting...',
          dot: 'bg-amber-400',
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
        };
      default:
        return {
          text: 'WS Disconnected',
          dot: 'bg-rose-400',
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/10 border-rose-500/20',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />,
        };
    }
  };

  const handleSimulate = async (type: 'join_event' | 'live_score' | 'deposit_received' | 'new_tournament') => {
    setSimulating(type);
    try {
      await simulateEvent(type);
    } finally {
      setTimeout(() => setSimulating(null), 600);
    }
  };

  const handleTestDisconnect = () => {
    wsClient.disconnect();
    setTimeout(() => {
      wsClient.connect();
    }, 2000);
  };

  const current = getStatusDisplay();

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all hover:brightness-110 cursor-pointer ${current.bgColor} ${current.textColor}`}
          title="Click to open Real-Time Event Simulator"
        >
          {current.icon}
          <span>{current.text}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {status === 'disconnected' && (
          <button
            onClick={reconnect}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
          >
            Retry
          </button>
        )}
      </div>

      {/* Interactive Simulator Drawer / Dropdown */}
      {showSimulator && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[#0F172A] border border-slate-700/90 shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                WebSocket Live Tester
              </span>
            </div>
            <button
              onClick={() => setShowSimulator(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Test instant real-time events that propagate across the frontend without page reload:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleSimulate('join_event')}
              disabled={simulating !== null}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-[#141E33] hover:bg-[#1C2A48] border border-slate-700/60 text-slate-200 transition-colors flex items-center justify-between"
            >
              <span>Simulate Player Joining Tournament</span>
              {simulating === 'join_event' ? (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              ) : (
                <span className="text-[10px] text-indigo-400 font-mono">+1 slot</span>
              )}
            </button>

            <button
              onClick={() => handleSimulate('live_score')}
              disabled={simulating !== null}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-[#141E33] hover:bg-[#1C2A48] border border-slate-700/60 text-slate-200 transition-colors flex items-center justify-between"
            >
              <span>Simulate Live Match Score Update</span>
              {simulating === 'live_score' ? (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              ) : (
                <span className="text-[10px] text-cyan-400 font-mono">live round</span>
              )}
            </button>

            <button
              onClick={() => handleSimulate('deposit_received')}
              disabled={simulating !== null}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-[#141E33] hover:bg-[#1C2A48] border border-slate-700/60 text-slate-200 transition-colors flex items-center justify-between"
            >
              <span>Simulate ₹500 Instant Deposit</span>
              {simulating === 'deposit_received' ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">+₹500</span>
              )}
            </button>

            <button
              onClick={() => handleSimulate('new_tournament')}
              disabled={simulating !== null}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-[#141E33] hover:bg-[#1C2A48] border border-slate-700/60 text-slate-200 transition-colors flex items-center justify-between"
            >
              <span>Simulate New Tournament Announcement</span>
              {simulating === 'new_tournament' ? (
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              ) : (
                <span className="text-[10px] text-purple-400 font-mono">new cup</span>
              )}
            </button>

            <button
              onClick={handleTestDisconnect}
              className="w-full text-left text-xs p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-center border border-dashed border-slate-700/60"
            >
              Simulate Network Drop & Auto-Reconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
