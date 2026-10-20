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
}