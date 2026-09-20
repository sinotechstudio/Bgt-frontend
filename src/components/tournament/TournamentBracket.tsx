import React from 'react';
import { Trophy, Swords, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { BracketRound } from '../../types';

interface TournamentBracketProps {
  bracket?: {
    rounds: BracketRound[];
  };
  schedule?: Array<{
    time: string;
    title: string;
    status: 'scheduled' | 'live' | 'completed';
  }>;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ bracket, schedule }) => {
  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#0E1528] border border-slate-800 text-slate-400">
        <Swords className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm">Tournament bracket will be generated once registrations close.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Visual Bracket Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-8 min-w-[700px]">
          {bracket.rounds.map((round, rIndex) => (
            <div key={round.title} className="flex-1 space-y-4">
              {/* Round Title */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {round.title}
                </h4>
              </div>

              {/* Match Cards in this Round */}
              <div className="space-y-4">
                {round.matches.map((match) => {
                  const isLive = match.status === 'live';
                  const isDone = match.status === 'completed';

                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isLive
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-500/50'
                          : isDone
                          ? 'bg-[#0E1526] border-slate-800'
                          : 'bg-[#0A0F1D] border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 font-mono">
                        <span>Match {match.id}</span>
                        {isLive && (
                          <span className="flex items-center gap-1 text-rose-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            LIVE
                          </span>
                        )}
                      </div>

                      {/* Team A */}
                      <div
                        className={`flex items-center justify-between p-1.5 rounded-lg mb-1 ${
                          match.winner === match.teamA ? 'bg-emerald-950/30 text-emerald-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">{match.teamA}</span>
                        <span className="font-mono font-bold">{match.scoreA}</span>
                      </div>

                      {/* Team B */}
                      <div
                        className={`flex items-center justify-between p-1.5 rounded-lg ${
                          match.winner === match.teamB ? 'bg-emerald-950/30 text-emerald-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">{match.teamB}</span>
                        <span className="font-mono font-bold">{match.scoreB}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Schedule */}
      {schedule && schedule.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0E1528] border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Official Match Schedule
          </h4>

          <div className="divide-y divide-slate-800/80">
            {schedule.map((slot, index) => (
              <div key={index} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{slot.time}</span>
                  </div>
                  <span className="font-medium text-white">{slot.title}</span>
                </div>
                <div>
                  {slot.status === 'completed' && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                  {slot.status === 'live' && (
                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE NOW
                    </span>
                  )}
                  {slot.status === 'scheduled' && (
                    <span className="text-[10px] text-slate-500">Upcoming</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
