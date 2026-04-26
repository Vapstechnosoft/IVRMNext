'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Inbox,
    RefreshCcw,
    User,
    Users,
    MessageSquare,
    Send,
    Search,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    Image as ImageIcon,
    FileMinus,
    Trash2,
    Eye,
    Mail
} from 'lucide-react';
import type { IInteractionsInitialData, IMessage } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { markMessageAsRead, deleteInteraction } from '@/server/staff-portal/interactions';
import { toast } from 'sonner';
import { ViewReplyModal } from './reply-modal';

/**
 * InboxTab component for managing the message list and thread view.
 */

interface InboxTabProps {
    data: IInteractionsInitialData;
    onRefresh: () => void;
    roleFlg: string;
}

export function InboxTab({ data, onRefresh, roleFlg }: InboxTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);

    const rawMessages = data.result || data.getinboxmsg || [];
    const readFlags = [...(data.result1 || []), ...(data.getinboxmsg_readflg || [])];

    // Group messages by ISMINT_Id to ensure only one item per thread is shown in the inbox
    const messages = rawMessages.reduce((acc: IMessage[], curr: IMessage) => {
        // Find existing interaction in our accumulator
        const existingIndex = acc.findIndex(m => m.ISMINT_Id === curr.ISMINT_Id);

        if (existingIndex === -1) {
            // New interaction, add it
            acc.push(curr);
        } else {
            // Duplicate ISMINT_Id found (likely a reply or multiple attachment record)
            // Replace existing if current ISTINT_Id is newer
            const existingId = acc[existingIndex].ISTINT_Id || 0;
            const currentId = curr.ISTINT_Id || 0;

            if (currentId > existingId) {
                acc[existingIndex] = curr;
            }
        }
        return acc;
    }, []);

    const isMessageRead = (msg: IMessage) => {
        const flag = readFlags.find(f => (f.ISMINT_Id === msg.ISMINT_Id) || ((f as any).ismint_Id === msg.ISMINT_Id));
        const readFlg = flag ? flag.ISTINT_ReadFlg : msg.ISTINT_ReadFlg;
        return Number(readFlg) === 1;
    };

    const filteredMessages = messages.filter(msg =>
        (msg.ISMINT_Subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (msg.Sender?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (msg.Receiver?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const toggleExpand = async (msg: IMessage) => {
        const id = msg.ISTINT_Id;
        const isRead = isMessageRead(msg);

        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(i => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
            // Mark as seen if unread
            try {
                const res = await markMessageAsRead(id);
                if (res.success) {
                    onRefresh(); // Refresh flags
                }
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    const handleDelete = async (msg: IMessage) => {
        if (!confirm('Are you sure you want to delete this interaction?')) return;

        try {
            const res = await deleteInteraction({ ISMINT_Id: msg.ISMINT_Id, ISTINT_Id: msg.ISTINT_Id });
            if (res.success) {
                toast.success(res.message || 'Interaction deleted successfully');
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to delete interaction');
            }
        } catch (error) {
            toast.error('An error occurred during deletion');
        }
    };

    const openReply = async (msg: IMessage) => {
        setSelectedMessage(msg);
        setShowReplyModal(true);
        try {
            const res = await markMessageAsRead(msg.ISTINT_Id);
            if (res.success) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Legacy Style Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e40af]/10 pb-3 pt-0">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1e40af]">
                            MESSAGE INBOX
                        </h2>
                        <div className="flex h-4 px-1.5 min-w-[20px] items-center justify-center rounded-sm bg-[#1e40af] text-[9px] font-black text-white">
                            {messages.length}
                        </div>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#3b82f6] opacity-80">
                        BLUE COLOUR ON INTERACTION SAYS UNREAD
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tight text-slate-400">
                        <RefreshCcw className="h-3 w-3 cursor-pointer hover:rotate-180 transition-all duration-500 text-slate-300" onClick={onRefresh} />
                        <span className="opacity-60">{format(new Date(), 'dd/MM/yyyy hh:mm a')}</span>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300 group-hover:text-[#1e40af] transition-colors" />
                        <input
                            className="h-8 w-[200px] rounded-none border border-slate-200 bg-slate-50/50 pl-8 pr-3 text-[10px] font-bold placeholder:text-slate-300 focus:bg-white focus:ring-1 focus:ring-[#1e40af]/10 transition-all outline-none"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Legacy Style List */}
            <div className="flex flex-col border border-muted/60 rounded-none overflow-hidden bg-white shadow-sm">
                {filteredMessages.length === 0 ? (
                    <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 bg-muted/5">
                        No messages found in your inbox
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => {
                        const isExpanded = expandedIds.includes(msg.ISTINT_Id);
                        const isRead = isMessageRead(msg);
                        const isComposedByMe = msg.ISMINT_ComposedById === data.userhrmE_Id;

                        return (
                            <div
                                key={`${msg.ISMINT_Id || 'msg'}-${index}`}
                                className={cn(
                                    "group flex flex-col border-b last:border-b-0 transition-colors cursor-pointer",
                                    isRead ? "bg-white" : "bg-blue-50/20"
                                )}
                            >
                                <div
                                    className="flex items-center p-2.5 gap-4 hover:bg-slate-50 relative"
                                    onClick={() => toggleExpand(msg)}
                                >
                                    {/* Left Status Icon - Green User in legacy */}
                                    <div className="flex shrink-0 items-center justify-center h-6 w-6 rounded-sm bg-[#22c55e]">
                                        <User className="h-4 w-4 text-white" />
                                    </div>

                                    {/* Middle Subject */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn(
                                            "text-[11px] truncate uppercase tracking-tight transition-colors",
                                            isRead ? "font-bold text-black" : "font-black text-[#1e40af]"
                                        )}>
                                            {msg.ISMINT_Subject}
                                        </h3>
                                    </div>

                                    {/* Sender/Receiver Info - Right Aligned in legacy */}
                                    <div className="hidden sm:flex items-center justify-end min-w-[180px] text-[10px] font-bold text-slate-500 uppercase pr-4 italic">
                                        {isComposedByMe ? `To:${msg.Receiver}` : `From:${msg.Sender}`}
                                    </div>

                                    {/* Right Message Icon - Blue icon in legacy */}
                                    <div className="flex shrink-0 items-center justify-center h-8 w-8">
                                        {isComposedByMe ? (
                                            <Send className="h-4 w-4 text-[#3b82f6]" />
                                        ) : (
                                            <Mail className={cn(
                                                "h-4 w-4 transition-colors",
                                                isRead ? "text-slate-200" : "text-[#1e40af]"
                                            )} />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content logic like screenshot */}
                                {isExpanded && (
                                    <div className="flex items-center justify-between px-14 py-3 bg-slate-50/50 border-t border-slate-50">
                                        <div className="text-[11px] font-bold text-slate-500 italic max-w-2xl px-2">
                                            {msg.ISTINT_Interaction || msg.ISMINT_Interaction}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openReply(msg);
                                                }}
                                                className="flex items-center gap-1.5 text-[10px] font-black text-[#1e40af] hover:underline uppercase tracking-tight"
                                            >
                                                <MessageSquare className="h-3 w-3" />
                                                View & Reply
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(msg);
                                                }}
                                                className="p-1 px-1.5 text-sky-500 hover:bg-sky-100 rounded-sm transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {showReplyModal && selectedMessage && (
                <ViewReplyModal
                    isOpen={showReplyModal}
                    onClose={() => {
                        setShowReplyModal(false);
                        setSelectedMessage(null);
                        onRefresh();
                    }}
                    message={selectedMessage}
                    roleFlg={roleFlg}
                    userhrmE_Id={data.userhrmE_Id || 0}
                />
            )}
        </div>
    );
}
