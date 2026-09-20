import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { WalletPage } from './pages/WalletPage';
import { TeamPage } from './pages/TeamPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

const AppContent: React.FC = () => {
  const { path } = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password';

  const renderCurrentPage = () => {
    if (path === '/') return <HomePage />;
    if (path === '/tournaments') return <TournamentsPage />;
    if (path.startsWith('/tournaments/')) return <TournamentDetailPage />;
    if (path === '/wallet') return <WalletPage />;
    if (path === '/team') return <TeamPage />;
    if (path === '/profile') return <ProfilePage />;
    if (path === '/login') return <LoginPage />;
    if (path === '/register') return <RegisterPage />;
    if (path === '/forgot-password') return <ForgotPasswordPage />;

    // Fallback default
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentPage()}
      </main>

      {/* Mobile Bottom Fixed Nav Bar (hidden on auth pages) */}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider>
        <AuthProvider>
          <WebSocketProvider>
            <AppContent />
          </WebSocketProvider>
        </AuthProvider>
      </RouterProvider>
    </ToastProvider>
  );
}
