import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '../../../features/auth/auth.store';
import { AlertCircle } from 'lucide-react';

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-background text-foreground pb-16 sm:pb-0">
      {/* Verification Notice Banner for unverified logged-in users */}
      {isAuthenticated && user && user.verificationStatus === 'unverified' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Your campus ID is not yet verified. You can browse, but verifying enables you to create listings and complete deals safely.
          </span>
          <Link to="/verify" className="font-bold underline ml-1 hover:text-amber-900">
            Verify Now &rarr;
          </Link>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        {children ?? <Outlet />}
      </main>

      {/* Bottom Nav for mobile */}
      <BottomNav />
    </div>
  );
}
