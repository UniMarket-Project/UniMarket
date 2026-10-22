import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../shared/api/api-client';
import { useAuthStore } from '../auth/auth.store';
import { formatETB } from '../../shared/utils/cn';
import { Badge } from '../../shared/components/ui/Badge';
import { Button } from '../../shared/components/ui/Button';
import { Avatar } from '../../shared/components/ui/Avatar';
import {
  HelpCircle,
  PlusCircle,
  MapPin,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Filter,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Academic Books',
  'Electronics',
  'Dorm Essentials',
  'Stationery',
  'Services',
  'Transport',
  'Other',
];

export function RequestsFeedPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'product' | 'service' | 'exchange'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'matched' | 'closed'>('all');
  const [onlyMine, setOnlyMine] = useState(false);

  // Fetch Requests with query filters
  const { data, isLoading } = useQuery({
    queryKey: ['requests', search, selectedCategory, selectedType, selectedStatus, onlyMine],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (search.trim()) params.q = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory.toLowerCase();
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (onlyMine) params.mine = 'true';

      const res = await api.get('/requests', { params });
      return res.data.data;
    },
  });

  // Status update mutation for owner
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: 'open' | 'matched' | 'closed';
    }) => {
      await api.patch(`/requests/${requestId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const rawRequests = data?.requests || [];

  // Client-side fallback filter if backend optional filter params behave strictly
  const requests = rawRequests.filter((req: any) => {
    if (onlyMine && user?.userId && req.createdBy?.userId !== user.userId) {
      return false;
    }
    if (selectedStatus !== 'all' && req.status && req.status !== selectedStatus) {
      return false;
    }
    if (selectedType !== 'all' && req.type && req.type !== selectedType) {
      return false;
    }
    if (
      selectedCategory !== 'All' &&
      req.category &&
      req.category.toLowerCase() !== selectedCategory.toLowerCase()
    ) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = req.title?.toLowerCase().includes(q);
      const matchDesc = req.description?.toLowerCase().includes(q);
      const matchHave = req.exchangeHave?.toLowerCase().includes(q);
      const matchWant = req.exchangeWant?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchHave && !matchWant) return false;
    }
    return true;
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedType !== 'all' ||
    selectedStatus !== 'all' ||
    onlyMine;

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedType('all');
    setSelectedStatus('all');
    setOnlyMine(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-semibold mb-1">
            <span>📢 Student Demand Board</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">What Students Need</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Can you help a fellow student? Fulfill requests or post what you are looking for.
          </p>
        </div>

        <Link to="/create-request">
          <Button className="gap-1.5 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Post a Demand</span>
          </Button>
        </Link>
      </div>

      {/* Board Filters (FE-13: Board with filters) */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5 shadow-xs">
        {/* Search Input & My Demands Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search demands (e.g. Calculus book, desk lamp, tutor)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {user && (
            <button
              onClick={() => setOnlyMine(!onlyMine)}
              className={`h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
                onlyMine
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-background hover:bg-muted border-input text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>My Demands</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-10 px-3 rounded-xl border border-dashed border-border hover:bg-muted text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Pills: Categories & Types */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground mr-1">
            <Filter className="h-3 w-3 text-emerald-600" />
            <span>Type:</span>
          </div>
          {(['all', 'product', 'service', 'exchange'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors capitalize ${
                selectedType === t
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold shadow-2xs'
                  : 'bg-background hover:bg-muted text-muted-foreground border-input'
              }`}
            >
              {t === 'all' ? 'All Types' : t === 'product' ? 'Items' : t}
            </button>
          ))}

          <span className="h-3.5 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground mr-1">
            <span>Status:</span>
          </div>
          {(['all', 'open', 'matched', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors capitalize ${
                selectedStatus === s
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-2xs'
                  : 'bg-background hover:bg-muted text-muted-foreground border-input'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-muted-foreground shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Feed Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-card p-5 h-44 animate-pulse space-y-3"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base">No demands found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No requests match your current filters. Try resetting the filters or clearing your search.'
              : 'Looking for a specific book, room share, or exam prep tutor? Post what you need and campus peers will see it.'}
          </p>
          {hasActiveFilters ? (
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
          ) : (
            <Link to="/create-request">
              <Button size="sm">Post the First Demand</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((req: any) => {
            const isOwner = user?.userId === req.createdBy?.userId;
            const status = req.status || 'open';

            return (
              <div
                key={req.requestId}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category & Status & Type Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="category">{req.category}</Badge>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {req.type || 'demand'}
                      </span>

                      {/* Status Badge */}
                      {status === 'open' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          Open
                        </span>
                      ) : status === 'matched' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                          Matched
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
                          Closed
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {req.budgetMin || req.budgetMax ? (
                        <>
                          {req.budgetMin && req.budgetMax
                            ? `${formatETB(req.budgetMin)} - ${formatETB(req.budgetMax)}`
                            : req.budgetMax
                            ? `Up to ${formatETB(req.budgetMax)}`
                            : `From ${formatETB(req.budgetMin)}`}
                        </>
                      ) : (
                        'Negotiable'
                      )}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground line-clamp-2">{req.title}</h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {req.description}
                  </p>

                  {/* Exchange Details Box (if demand type is exchange) */}
                  {req.type === 'exchange' && (req.exchangeHave || req.exchangeWant) && (
                    <div className="rounded-xl bg-purple-50/60 dark:bg-purple-950/20 p-2.5 text-xs space-y-1 border border-purple-200/50 dark:border-purple-900/40">
                      {req.exchangeHave && (
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold text-purple-800 dark:text-purple-300 shrink-0">
                            Has:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                            {req.exchangeHave}
                          </span>
                        </div>
                      )}
                      {req.exchangeWant && (
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            Wants:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                            {req.exchangeWant}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {req.location?.address && (
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>{req.location.address}</span>
                    </p>
                  )}
                </div>

                {/* Requester Profile & Actions */}
                <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Link
                    to={`/users/${req.createdBy?.userId}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Avatar
                      src={req.createdBy?.avatarUrl}
                      name={`${req.createdBy?.firstName || 'Campus'} ${req.createdBy?.lastName || 'Student'}`}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold leading-tight hover:underline">
                        {req.createdBy?.firstName} {req.createdBy?.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {req.createdBy?.userType || 'Student'}
                      </p>
                    </div>
                  </Link>

                  {/* Actions: Owner Mark Matched/Closed vs Non-owner 'I Can Help' */}
                  <div className="flex items-center gap-1.5">
                    {isOwner ? (
                      <div className="flex items-center gap-1.5">
                        {status === 'open' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2.5 gap-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-950"
                              isLoading={updateStatusMutation.isPending}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  requestId: req.requestId,
                                  status: 'matched',
                                })
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              <span>Mark Matched</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-8 px-2 text-muted-foreground hover:text-red-600"
                              isLoading={updateStatusMutation.isPending}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  requestId: req.requestId,
                                  status: 'closed',
                                })
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Close</span>
                            </Button>
                          </>
                        )}

                        {status === 'matched' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2.5 gap-1"
                              isLoading={updateStatusMutation.isPending}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  requestId: req.requestId,
                                  status: 'open',
                                })
                              }
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Reopen</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-8 px-2 text-muted-foreground hover:text-red-600"
                              isLoading={updateStatusMutation.isPending}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  requestId: req.requestId,
                                  status: 'closed',
                                })
                              }
                            >
                              <span>Close</span>
                            </Button>
                          </>
                        )}

                        {status === 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 px-2.5 gap-1"
                            isLoading={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                requestId: req.requestId,
                                status: 'open',
                              })
                            }
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Reopen Demand</span>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={status === 'closed'}
                        className={`gap-1.5 text-xs h-8 ${
                          status === 'closed'
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950'
                        }`}
                        onClick={() => {
                          navigate('/messages', {
                            state: {
                              partnerId: req.createdBy?.userId,
                              partner: req.createdBy,
                              requestId: req.requestId,
                              contextTitle: req.title,
                            },
                          });
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        <span>I Can Help</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RequestsFeedPage;
