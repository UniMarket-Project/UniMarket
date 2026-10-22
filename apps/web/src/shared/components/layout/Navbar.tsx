import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/auth.store';
import { useNavBadges } from '../../hooks/useNavBadges';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import {
  GraduationCap,
  PlusCircle,
  MessageSquare,
  Handshake,
  ShieldCheck,
  LogOut,
  Search,
  Package,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    hasUnreadMessages,
    unreadMessagesCount,
    hasPendingDeals,
    pendingDealsCount,
    hasActiveDemands,
  } = useNavBadges();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              UniMarket
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">
              AAU CAMPUS
            </span>
          </div>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books, calculators, mini-stoves, tutoring..."
              className="h-10 w-full rounded-xl border border-input bg-muted/40 pl-9 pr-4 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  navigate(`/?q=${encodeURIComponent(target.value)}`);
                }
              }}
            />
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Role-tailored action button */}
              {user.role === 'admin' ? (
                <Link to="/admin">
                  <Button size="sm" className="gap-1.5 bg-purple-700 hover:bg-purple-800 text-white shadow-sm font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Console</span>
                  </Button>
                </Link>
              ) : user.userType === 'provider' || user.userType === 'business' ? (
                <Link to="/create-listing" className="hidden sm:block">
                  <Button size="sm" className="gap-1.5 shadow-sm bg-blue-700 hover:bg-blue-800 text-white font-bold">
                    <PlusCircle className="h-4 w-4" />
                    <span>Post Service</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/create-listing" className="hidden sm:block">
                  <Button size="sm" className="gap-1.5 shadow-sm">
                    <PlusCircle className="h-4 w-4" />
                    <span>List Item</span>
                  </Button>
                </Link>
              )}

              {/* My Items Link */}
              <Link
                to="/my-listings"
                className="hidden sm:flex items-center gap-1.5 p-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-lg hover:bg-muted transition-colors"
                title="My Inventory & Listings"
              >
                <Package className="h-4 w-4 text-emerald-600" />
                <span>My Items</span>
              </Link>

              {/* Student Demands / Requests */}
              <Link
                to="/requests"
                className="hidden sm:flex items-center gap-1.5 p-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-lg hover:bg-muted transition-colors relative"
                title="Student Requests & Demands"
              >
                <span>Demands</span>
                {hasActiveDemands && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>

              {/* Deals Link */}
              <Link
                to="/deals"
                className="hidden sm:flex items-center gap-1.5 p-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-lg hover:bg-muted transition-colors relative"
                title="My Deals"
              >
                <div className="relative">
                  <Handshake className="h-4 w-4 text-emerald-600" />
                  {hasPendingDeals && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-[14px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
                      {pendingDealsCount}
                    </span>
                  )}
                </div>
                <span>Deals</span>
              </Link>

              {/* Messages Link */}
              <Link
                to="/messages"
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-lg hover:bg-muted transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="h-5 w-5" />
                {hasUnreadMessages && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white shadow-xs animate-pulse">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </Link>

              {/* User Avatar & Menu */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                  <Avatar
                    src={user.avatarUrl}
                    name={`${user.firstName} ${user.lastName}`}
                    size="sm"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold leading-tight">{user.firstName}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user.userType}</p>
                  </div>
                </Link>

                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
