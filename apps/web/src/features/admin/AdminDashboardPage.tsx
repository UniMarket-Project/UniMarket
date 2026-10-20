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
