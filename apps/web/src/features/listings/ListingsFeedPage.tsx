import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../shared/api/api-client';
import { useAuthStore } from '../auth/auth.store';
import { ListingCard, ListingItem } from './ListingCard';
import { Button } from '../../shared/components/ui/Button';
import {
  Search,
  PlusCircle,
  BookOpen,
  Laptop,
  Home,
  PenTool,
  Wrench,
  Bus,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  Package,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: null },
  { id: 'Academic Books', label: 'Academic Books', icon: BookOpen },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Dorm Essentials', label: 'Dorm Essentials', icon: Home },
  { id: 'Stationery', label: 'Stationery', icon: PenTool },
  { id: 'Services', label: 'Services', icon: Wrench },
  { id: 'Transport', label: 'Transport', icon: Bus },
];

const TRANSACTION_TYPES = [
  { id: 'all', label: 'All Deals' },
  { id: 'sell', label: 'To Buy' },
  { id: 'rent', label: 'To Rent' },
  { id: 'lend', label: 'Borrow / Lend' },
  { id: 'service', label: 'Services' },
];

export function ListingsFeedPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  const userUni = user?.universityCode || 'AAU';
  const [selectedUni, setSelectedUni] = useState<string>(userUni);

  const isAdmin = user?.role === 'admin';
  const isProvider = user?.userType === 'provider' || user?.userType === 'business';

  // 1. Fetch Listings (20 per page)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', { search: queryParam, category: selectedCategory, type: selectedType, university: selectedUni, page }],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '20', page: String(page) };
      if (queryParam) params.q = queryParam;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.transactionType = selectedType;
      if (selectedUni && selectedUni !== 'ALL') params.universityCode = selectedUni;

      const res = await api.get('/listings', { params });
      return res.data.data;
    },
  });

  // 2. Fetch Admin Live Stats (only if admin)
  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
    enabled: isAdmin,
  });

  // 3. Fetch Service Demands (if provider)
  const { data: serviceDemands } = useQuery({
    queryKey: ['service-demands-preview'],
    queryFn: async () => {
      const res = await api.get('/requests?type=service&status=open&limit=4');
      return res.data.data.requests || [];
    },
    enabled: isProvider,
  });

  const listings: ListingItem[] = data?.listings || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.totalItems || listings.length) / 20) || 1;
  const ownListingsCount = user ? listings.filter((l) => l.createdBy?.userId === user.userId).length : 0;
  const displayListings = user ? listings.filter((l) => l.createdBy?.userId !== user.userId) : listings;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (search.trim()) {
      setSearchParams({ q: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ROLE-SPECIFIC HERO EXPERIENCE                                 */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. ADMIN HERO VIEW */}
      {isAdmin ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-purple-500/20">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-1 text-xs font-bold text-purple-200 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Campus Governance & Moderation Console</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                UniMarket Administration Hub
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
                Overseeing identity verifications, campus safety reports, and marketplace trust metrics across Addis Ababa University.
              </p>
            </div>

            {/* Admin Live Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                to="/admin"
                className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-400/20 hover:bg-purple-900/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-purple-200">
                  <span>Pending IDs</span>
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-300 mt-1">
                  {adminStats?.pendingVerifications ?? 0}
                </p>
              </Link>

              <Link
                to="/admin"
                className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-400/20 hover:bg-purple-900/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-purple-200">
                  <span>Open Reports</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                </div>
                <p className="text-2xl font-black text-red-300 mt-1">
                  {adminStats?.openReports ?? 0}
                </p>
              </Link>

              <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-400/20">
                <div className="text-xs text-purple-200">Active Listings</div>
                <p className="text-2xl font-black text-purple-100 mt-1">
                  {adminStats?.activeListings ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-400/20">
                <div className="text-xs text-purple-200">Deals Done</div>
                <p className="text-2xl font-black text-emerald-300 mt-1">
                  {adminStats?.completedDeals ?? 0}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/admin">
                <Button size="md" className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 shadow-md">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Open Verification & Reports Queue</span>
                </Button>
              </Link>
              <Link to="/requests">
                <Button size="md" variant="outline" className="border-purple-400/40 text-purple-200 hover:bg-purple-900/40 font-medium">
                  Inspect All Student Demands
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        </div>
      ) : isProvider ? (
        /* 2. CAMPUS SERVICE PROVIDER HERO VIEW */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-blue-500/20">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-200 backdrop-blur-md">
              <Briefcase className="h-4 w-4 text-blue-400" />
              <span>Campus Service Provider & Technician Portal</span>
            </div>

            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Reach Campus Students Needing Services
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/80 mt-1">
                Provide laptop repairs, formatting, phone screen maintenance, and academic tutoring directly to AAU students.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/create-listing">
                <Button size="md" className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  <span>List New Service Package</span>
                </Button>
              </Link>
              <Link to="/requests">
                <Button size="md" variant="outline" className="border-blue-400/40 text-blue-200 hover:bg-blue-900/40 font-medium gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  <span>Browse Student Demands</span>
                </Button>
              </Link>
              <Link to="/deals">
                <Button size="md" variant="ghost" className="text-blue-200 hover:bg-blue-900/40 font-medium">
                  Service Work Orders
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        </div>
      ) : (
        /* 3. STUDENT & PUBLIC MARKETPLACE HERO VIEW */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white p-6 sm:p-10 shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>Safe Campus Peer-to-Peer Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ethiopian University Marketplace
            </h1>
            <p className="text-sm sm:text-base text-emerald-100">
              Buy, sell, rent, and share textbooks, calculators, mini-stoves, and dorm essentials with verified students on campus.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/create-listing">
                <Button size="md" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-md">
                  <PlusCircle className="mr-1.5 h-4 w-4 text-emerald-700" />
                  Post an Item
                </Button>
              </Link>
              <Link to="/requests">
                <Button size="md" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium">
                  Browse Student Demands
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PROVIDER-SPECIFIC: Incoming Student Demands Widget            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isProvider && serviceDemands && serviceDemands.length > 0 && (
        <div className="rounded-3xl border border-blue-200/80 bg-blue-50/60 dark:bg-blue-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <h2 className="font-extrabold text-sm text-foreground">
                Active Student Requests Waiting for Assistance
              </h2>
            </div>
            <Link to="/requests" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
              <span>View all demands</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceDemands.map((req: any) => (
              <div
                key={req.requestId}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {req.category}
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      ETB {req.budgetMin} - {req.budgetMax}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs mt-1.5 text-foreground line-clamp-1">
                    {req.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {req.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted-foreground">
                    by {req.createdBy?.firstName}
                  </span>
                  <Link to={`/requests`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50">
                      Offer Service
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SEARCH AND FILTERS                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isProvider
                ? 'Search repair equipment, spare parts, campus services...'
                : 'Search textbooks, calculators, dorm items...'
            }
            className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <Button type="submit" variant="primary" className="h-11 px-5">
          Search
        </Button>
      </form>

      {/* Category Horizontal Pill Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.icon && <cat.icon className="h-3.5 w-3.5" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Deal Type Filter Tabs & Campus Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex gap-1 bg-muted/60 p-1 rounded-xl overflow-x-auto">
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedType(t.id); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedType === t.id
                  ? 'bg-card text-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Campus Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">📍 Campus:</span>
          <select
            value={selectedUni}
            onChange={(e) => { setSelectedUni(e.target.value); setPage(1); }}
            className="text-xs font-bold rounded-xl border border-input bg-card px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            <option value={userUni}>My Campus ({userUni})</option>
            <option value="AAU">AAU (Addis Ababa)</option>
            <option value="ASTU">ASTU (Adama)</option>
            <option value="AASTU">AASTU (Kilinto)</option>
            <option value="HU">HU (Hawassa)</option>
            <option value="JU">JU (Jimma)</option>
            <option value="BDU">BDU (Bahir Dar)</option>
            <option value="ALL">🌐 All Campuses</option>
          </select>
          <span className="text-xs text-muted-foreground hidden lg:inline pl-2 border-l border-border">
            {displayListings.length} {displayListings.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Own Listings Notice Banner */}
      {user && ownListingsCount > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
            <Package className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              You have <strong>{ownListingsCount}</strong> active {ownListingsCount === 1 ? 'item' : 'items'} in your inventory. Your items are hidden from your explore feed and organized in your dedicated <strong>My Items</strong> tab.
            </span>
          </div>
          <Link to="/my-listings" className="shrink-0">
            <Button size="sm" variant="outline" className="border-emerald-600/40 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs">
              Manage My Items &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl border border-border bg-card p-4 h-72 animate-pulse space-y-3">
              <div className="h-40 bg-muted rounded-xl" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-600 font-semibold">Failed to load marketplace listings.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
            Retry
          </Button>
        </div>
      ) : displayListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">No listings found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              We couldn't find anything matching your filters. You can be the first to list or post a student demand!
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button size="sm" onClick={() => { setSelectedCategory('all'); setSelectedType('all'); setSearchParams({}); setPage(1); }}>
              Reset Filters
            </Button>
            <Link to="/create-request">
              <Button size="sm" variant="outline">
                Request Item
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayListings.map((item) => (
              <ListingCard key={item.listingId} listing={item} />
            ))}
          </div>

          {/* Pagination Controls (20 per page) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
