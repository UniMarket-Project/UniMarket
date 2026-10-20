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
   return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Sidebar: Conversations List */}
      <div
        className={`w-full md:w-80 border-r border-border flex flex-col bg-muted/20 ${
          activePartnerId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-extrabold text-base text-foreground">Messages</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Campus deal inquiries and coordination
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {convsLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p>No conversations yet. Inquire about any listing to start chatting.</p>
            </div>
          ) : (
            conversations.map((c: any) => {
              const partner = c.user || c.participant || {};
              const partnerId = partner.userId || partner.id;
              const isSelected = partnerId === activePartnerId;
              const lastMsg = c.lastMessage || {};

              return (
                <button
                  key={partnerId || Math.random()}
                  onClick={() => {
                    setActivePartnerId(partnerId);
                    setActiveListingId(c.context?.listingId || null);
                  }}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                    isSelected ? 'bg-emerald-500/10 dark:bg-emerald-950/40' : 'hover:bg-muted/60'
                  }`}
                >
                  <Avatar
                    src={partner.avatarUrl}
                    name={`${partner.firstName || 'User'} ${partner.lastName || ''}`}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs truncate">
                        {partner.firstName} {partner.lastName}
                      </p>
                      {lastMsg.createdAt && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-1">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {lastMsg.content || 'Started a conversation'}
                    </p>

                    {c.unreadCount > 0 && (
                      <span className="inline-block mt-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {c.unreadCount} new
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Thread */}
      <div className={`flex-1 flex flex-col bg-card ${!activePartnerId ? 'hidden md:flex' : 'flex'}`}>
        {activePartnerId ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 border-b border-border flex items-center justify-between bg-card/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePartnerId(null)}
                  className="md:hidden p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <Avatar
                  src={activePartner?.avatarUrl}
                  name={`${activePartner?.firstName || 'User'} ${activePartner?.lastName || ''}`}
                  size="sm"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-foreground">
                      {activePartner?.firstName || 'Campus User'} {activePartner?.lastName || ''}
                    </h3>
                    {activePartner?.verificationStatus === 'verified' && (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  {activePartner?.userType && (
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {activePartner.userType}
                    </p>
                  )}
                </div>
              </div>

              {/* Pinned Context Banner (if listing/request attached) */}
              {currentContextTitle && (
                <div className="hidden sm:block text-right max-w-xs">
                  <p className="text-[10px] text-muted-foreground">Inquiring about:</p>
                  <p className="text-xs font-semibold text-emerald-600 truncate">
                    {currentContextTitle}
                  </p>
                </div>
              )}
            </div>
             {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-background/40">
              {threadLoading ? (
                <div className="text-center text-xs text-muted-foreground py-8">Loading chat...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-12">
                  No messages in this conversation yet. Send a message to coordinate.
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.senderId === user?.userId;
                  const msgId = msg.messageId || msg.id || Math.random();
                  return (
                    <div
                      key={msgId}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-card border border-border text-foreground rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2 bg-card">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message (meetup spot, availability)..."
                className="flex-1 h-11 rounded-xl border border-input bg-muted/30 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button type="submit" size="icon" disabled={!content.trim()} isLoading={sendMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="font-bold text-base text-foreground">Your Messages</h3>
            <p className="text-xs max-w-xs">
              Select a conversation from the left to arrange campus meetups, inspect items, and finalize deals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



