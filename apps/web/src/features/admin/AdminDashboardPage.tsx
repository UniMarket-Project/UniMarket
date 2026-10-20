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