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
