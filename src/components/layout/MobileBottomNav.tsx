import React from 'react';
import { Home, Trophy, Wallet, Users, User } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export const MobileBottomNav: React.FC = () => {
  const { path, navigate } = useRouter();

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

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2 safe-area-bottom"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              id={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-w-[56px] ${
                active
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-400 stroke-[2.5]' : 'stroke-2'}`} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"></span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
