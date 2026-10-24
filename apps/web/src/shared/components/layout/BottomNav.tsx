import { NavLink } from 'react-router-dom';
import { Home, HelpCircle, PlusCircle, Handshake, MessageSquare, User, ShieldCheck, Package } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../../features/auth/auth.store';
import { useNavBadges } from '../../hooks/useNavBadges';

export function BottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isProvider = user?.userType === 'provider' || user?.userType === 'business';

  const {
    hasUnreadMessages,
    unreadMessagesCount,
    hasPendingDeals,
    pendingDealsCount,
    hasActiveDemands,
  } = useNavBadges();

  const navItems = [
    { to: '/', label: 'Explore', icon: Home, badge: null },
    {
      to: '/requests',
      label: 'Demands',
      icon: HelpCircle,
      badge: hasActiveDemands ? 'dot' : null,
    },
    {
      to: '/create-listing',
      label: isProvider ? 'Post Service' : 'List Item',
      icon: PlusCircle,
      isHighlight: true,
      badge: null,
    },
    {
      to: '/deals',
      label: 'Deals',
      icon: Handshake,
      badge: hasPendingDeals ? (pendingDealsCount > 9 ? '9+' : String(pendingDealsCount)) : null,
    },
    {
      to: '/messages',
      label: 'Chat',
      icon: MessageSquare,
      badge: hasUnreadMessages ? (unreadMessagesCount > 9 ? '9+' : String(unreadMessagesCount)) : null,
    },
    ...(isAuthenticated ? [{ to: '/my-listings', label: 'My Items', icon: Package, badge: null }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, badge: null }] : []),
    { to: '/profile', label: 'Profile', icon: User, badge: null },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center p-1.5 text-xs font-medium rounded-xl transition-colors',
                  isActive ? 'text-emerald-600 font-bold' : 'text-muted-foreground hover:text-foreground',
                  item.isHighlight && 'text-emerald-700'
                )
              }
            >
              {item.isHighlight ? (
                <div className="flex h-9 w-9 -mt-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge === 'dot' && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  {item.badge && item.badge !== 'dot' && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] px-1 items-center justify-center rounded-full bg-red-600 text-[8px] font-extrabold text-white shadow-xs animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
