import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { api } from '../../shared/api/api-client';
import { useAuthStore } from '../auth/auth.store';
import { Avatar } from '../../shared/components/ui/Avatar';
import { Button } from '../../shared/components/ui/Button';
import { Send, MessageSquare, ShieldCheck, ArrowLeft } from 'lucide-react';

export function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const state = (location.state as any) || {};
  const initialPartnerId = state.partnerId || null;
  const initialListingId = state.listingId || null;
  const initialRequestId = state.requestId || null;
  const initialPartner = state.partner || null;
  const initialContextTitle = state.contextTitle || null;

  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId);
  const [activeListingId, setActiveListingId] = useState<string | null>(initialListingId);
  const [activeRequestId] = useState<string | null>(initialRequestId);
  const [activePartnerFallback] = useState<any>(initialPartner);
  const [contextTitleFallback] = useState<string | null>(initialContextTitle);
  const [content, setContent] = useState('');
 // 1. Fetch Conversations
  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data.data.conversations || [];
    },
    refetchInterval: 5000, // Poll every 5s for new messages
  });

  const conversations = convData || [];

  // Default to first conversation or route partner
  useEffect(() => {
    if (!activePartnerId && conversations.length > 0) {
      const first = conversations[0];
      const partner = first.user || first.participant;
      if (partner?.userId) {
        setActivePartnerId(partner.userId);
        setActiveListingId(first.context?.listingId || null);
      }
    }
  }, [conversations, activePartnerId]);

  // 2. Fetch Thread Messages for Active Partner
  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ['thread', activePartnerId],
    queryFn: async () => {
      if (!activePartnerId) return [];
      const res = await api.get(`/messages/conversations/${activePartnerId}`);
      return res.data.data.messages || [];
    },
    enabled: !!activePartnerId,
    refetchInterval: 3000,
  });

  const messages = threadData || [];

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const payload: any = {
        recipientId: activePartnerId,
        content: text,
      };
      if (activeListingId) payload.listingId = activeListingId;
      if (activeRequestId) payload.requestId = activeRequestId;
      const res = await api.post('/messages', payload);
      return res.data.data.message;
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['thread', activePartnerId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activePartnerId) return;
    sendMutation.mutate(content.trim());
  };

  const activeConv = conversations.find((c: any) => {
    const partner = c.user || c.participant;
    return partner?.userId === activePartnerId;
  });

  const activePartner = activeConv ? (activeConv.user || activeConv.participant) : activePartnerFallback;
  const currentContextTitle = activeConv?.context?.title || contextTitleFallback;

