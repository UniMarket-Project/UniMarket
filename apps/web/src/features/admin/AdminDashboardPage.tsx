import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api/api-client';
import { Button } from '../../shared/components/ui/Button';
import {
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'verifications' | 'reports'>('verifications');
   // 1. Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
  });
   // 2. Fetch Verifications
  const { data: verificationsData, isLoading: verLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const res = await api.get('/admin/verifications?status=pending');
      return res.data.data.verifications;
    },
  });

  // 3. Fetch Reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports?status=submitted');
      return res.data.data.reports;
    },
  });
   // Verification Review Mutation
  const reviewVerMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: 'verified' | 'unverified'; rejectionReason?: string }) => {
      await api.patch(`/admin/verifications/${id}`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
 // Report Resolve Mutation
  const resolveReportMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await api.patch(`/admin/reports/${id}`, {
        status: 'resolved',
        action,
        adminNotes: 'Resolved from admin dashboard',
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      const summary = data?.moderationSummary?.autoActionTaken || 'Moderation action executed.';
      alert(`Moderation Escalation Outcome:\n\n${summary}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Failed to apply moderation action.');
    },
  });

   const stats = statsData || {
    pendingVerifications: 0,
    openReports: 0,
    totalUsers: 0,
    activeListings: 0,
    completedDeals: 0,
  };

  const verifications = verificationsData || [];
  const reports = reportsData || [];
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-0.5 text-xs font-semibold mb-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Campus Administration & Trust Oversight</span>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Admin Portal</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review student ID verifications, moderate reports, and inspect campus metrics.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60">
          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Pending IDs</p>
          <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
            {stats.pendingVerifications}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/60">
          <p className="text-[11px] font-semibold text-red-800 dark:text-red-300">Open Reports</p>
          <p className="text-2xl font-extrabold text-red-900 dark:text-red-200 mt-1">
            {stats.openReports}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-[11px] font-semibold text-muted-foreground">Total Users</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{stats.totalUsers}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-[11px] font-semibold text-muted-foreground">Active Listings</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{stats.activeListings}</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60">
          <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Deals Done</p>
          <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
            {stats.completedDeals}
          </p>
        </div>
      </div>

 {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'verifications'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          Pending Verifications ({verifications.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          Open Reports ({reports.length})
        </button>
      </div>
       {/* Tab 1: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading queue...</div>
          ) : verifications.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-card">
              <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold">Queue is Clear</p>
              <p className="text-xs text-muted-foreground mt-1">
                All submitted student IDs have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((v: any) => (
                <div
                  key={v.verificationId}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">
                        {v.user.firstName} {v.user.lastName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                        {v.universityCode || 'AAU'}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Student ID (Decrypted): <strong className="text-foreground">{v.studentId || v.nationalId}</strong>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Submitted on {new Date(v.createdAt).toLocaleDateString()}
                    </p>

                    {v.documentUrl && (
                      <a
                        href={v.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline pt-1"
                      >
                        <span>View Uploaded ID Photo</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        reviewVerMutation.mutate({
                          id: v.verificationId,
                          status: 'unverified',
                          rejectionReason: 'ID card blurry or invalid',
                        })
                      }
                      isLoading={reviewVerMutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() =>
                        reviewVerMutation.mutate({
                          id: v.verificationId,
                          status: 'verified',
                        })
                      }
                      isLoading={reviewVerMutation.isPending}
                    >
                      Approve & Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
 {/* Tab 2: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportsLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-card">
              <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold">No Open Reports</p>
              <p className="text-xs text-muted-foreground mt-1">
                Zero active reports requiring moderation action.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r: any) => {
                const targetUserReports = r.targetUser?.totalReports ?? r.reportCountOnTarget ?? 1;
                const listingReports = r.targetListing?.reportCount ?? (r.reportType === 'listing' ? r.reportCountOnTarget : 0);

                return (
                  <div
                    key={r.reportId}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-border/80 transition-all"
                  >
                    {/* Top Row: Category & Created Date */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs uppercase px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                          {r.category}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          Report Type: {r.reportType}
                        </span>
                      </div>

                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Reported Target Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Reported Account Info */}
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Reported Account:</p>
                        {r.targetUser ? (
                          <div>
                            <p className="font-bold text-sm text-foreground">
                              {r.targetUser.firstName} {r.targetUser.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{r.targetUser.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Total User Reports: {targetUserReports}
                              </span>
                              {targetUserReports >= 9 && (
                                <span className="text-[10px] text-red-600 font-extrabold">
                                  ⚠️ Critical (Ban at 10)
                                </span>
                              )}
                              {targetUserReports % 3 === 2 && targetUserReports < 9 && (
                                <span className="text-[10px] text-amber-600 font-bold">
                                  ⚠️ Next report triggers 2-week suspension
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">User ID: {r.targetId}</p>
                        )}
                      </div>

                      {/* Reported Listing Info (if listing) */}
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Reported Listing:</p>
                        {r.targetListing ? (
                          <div>
                            <p className="font-bold text-sm text-foreground truncate">
                              {r.targetListing.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground capitalize">
                              Listing Status: {r.targetListing.status}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                Listing Reports: {listingReports}
                              </span>
                              {listingReports >= 2 && (
                                <span className="text-[10px] text-red-600 font-extrabold">
                                  ⚠️ 3rd report auto-removes item
                                </span>
                              )}
                            </div>
                          </div>
                        ) : r.reportType === 'listing' ? (
                          <p className="text-muted-foreground italic">Listing ID: {r.targetId}</p>
                        ) : (
                          <p className="text-muted-foreground italic">Direct user report (No listing involved)</p>
                        )}
                      </div>
                    </div>

                    {/* Report Content & Reporter Info */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50">
                        <p className="text-[10px] font-semibold text-red-800 dark:text-red-300 uppercase mb-0.5">
                          Report Description / Allegation:
                        </p>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                          "{r.description}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
                        <p>
                          Filed by Reporter:{' '}
                          <strong className="text-foreground">
                            {r.reporter.firstName} {r.reporter.lastName}
                          </strong>
                        </p>
                        <span className="text-[10px]">
                          Rule policy: 3 reports = 14-day suspension • 10 reports = permanent ban
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/60">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={resolveReportMutation.isPending}
                        onClick={() =>
                          resolveReportMutation.mutate({ id: r.reportId, action: 'none' })
                        }
                      >
                        Dismiss Report
                      </Button>

                      {r.reportType === 'listing' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={resolveReportMutation.isPending}
                          onClick={() =>
                            resolveReportMutation.mutate({
                              id: r.reportId,
                              action: 'remove_listing',
                            })
                          }
                        >
                          Remove Listing & Escalate
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
                        disabled={resolveReportMutation.isPending}
                        onClick={() =>
                          resolveReportMutation.mutate({
                            id: r.reportId,
                            action: 'warn_user',
                          })
                        }
                      >
                        Warn Account
                      </Button>

                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={resolveReportMutation.isPending}
                        onClick={() =>
                          resolveReportMutation.mutate({
                            id: r.reportId,
                            action: 'suspend_user',
                          })
                        }
                      >
                        Suspend User (14 Days)
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
