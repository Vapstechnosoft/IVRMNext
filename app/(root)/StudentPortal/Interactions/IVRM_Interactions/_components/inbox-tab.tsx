'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ViewReplyModal } from './view-reply-modal-component';

/**
 * InboxTab component for managing the message list and thread view.
 */

interface InboxTabProps {
    data: IInteractionsInitialData;
    onRefresh: () => void;
    roleFlg: string;
}
export const dynamic = 'force-dynamic';
export function InboxTab({ data, onRefresh, roleFlg }: InboxTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const rawMessages = data.result || data.getinboxmsg || [];
    const readFlags = data.result1 || data.getinboxmsg_readflg || [];

    // Deduplicate messages by ISMINT_Id to ensure parity with backend's logical record count
    const messages = useMemo(() => {
        const unique: any[] = [];
        const seenIds = new Set();
        (rawMessages as any[]).forEach(m => {
            if (m.ISMINT_Id && !seenIds.has(m.ISMINT_Id)) {
                seenIds.add(m.ISMINT_Id);
                unique.push(m);
            } else if (!m.ISMINT_Id) {
                unique.push(m);
            }
        });
        return unique;
    }, [rawMessages]);

    const isMessageRead = (msg: IMessage) => {
        const flag = readFlags.find(f => f.ISMINT_Id === msg.ISMINT_Id);
        return flag ? flag.ISTINT_ReadFlg === 1 : msg.ISTINT_ReadFlg === 1;
    };

    const filteredMessages = messages.filter((msg: IMessage) => {
        const matchesSearch = (msg.ISMINT_Subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (msg.Sender?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (msg.Receiver?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const toggleExpand = async (msg: IMessage) => {
        const id = msg.ISTINT_Id;
        const isRead = isMessageRead(msg);

        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(i => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
            // Mark as seen if unread
            if (!isRead) {
                try {
                    const res = await markMessageAsRead(id);
                    if (res.success) {
                        onRefresh(); // Refresh flags
                    }
                } catch (error) {
                    console.error('Error marking as read:', error);
                }
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

        // Mark as read when opening reply if not already read
        if (!isMessageRead(msg)) {
            try {
                const res = await markMessageAsRead(msg.ISTINT_Id);
                if (res.success) {
                    onRefresh();
                }
            } catch (error) {
                console.error('Error marking as read from reply:', error);
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Legacy Style Header with Filters */}
            <div className="flex flex-col gap-2 border-b pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[12px] font-black uppercase tracking-wider text-[#1e40af]">
                                MESSAGE INBOX
                            </h2>
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1e40af] px-1.5 text-[9px] font-black text-white">
                                {messages.length}
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-tight text-[#3b82f6]">
                            BLUE COLOUR ON INTERACTION SAYS UNREAD
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                            <RefreshCcw
                                className="h-4 w-4 cursor-pointer text-[#1e40af] hover:rotate-180 transition-all duration-700"
                                onClick={onRefresh}
                            />
                            {isMounted ? format(new Date(), 'dd/MM/yyyy hh:mm a') : '   /  /     :   '}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                className="h-9 w-[180px] rounded-none border-b bg-transparent pl-9 pr-3 text-[11px] font-bold outline-none focus:border-[#1e40af] transition-all"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                    filteredMessages.map((msg: IMessage, index: number) => {
                        const isExpanded = expandedIds.includes(msg.ISTINT_Id);
                        const isRead = isMessageRead(msg);
                        const isComposedByMe = msg.ISMINT_ComposedById === data.userhrmE_Id;

                        return (
                            <div
                                key={`${msg.ISMINT_Id || 'msg'}-${index}`}
                                className={cn(
                                    "group flex flex-col border-b last:border-b-0 transition-all cursor-pointer",
                                    isRead ? "bg-white" : "bg-blue-50/10"
                                )}
                            >
                                <div
                                    className="flex items-center px-4 py-2 gap-4 hover:bg-slate-50 transition-all relative"
                                    onClick={() => toggleExpand(msg)}
                                >
                                    {/* SL NO */}
                                    <div className="flex shrink-0 items-center justify-center w-8 text-[10px] font-black text-slate-400 border-r border-slate-100 pr-2">
                                        {index + 1}
                                    </div>

                                    {/* Left Status Icon - Smaller */}
                                    <div className="flex shrink-0 items-center justify-center h-6 w-6">
                                        {msg.ISMINT_GroupOrIndFlg === 'Group' ? (
                                            <Users className="h-3 w-3 text-blue-600" />
                                        ) : (
                                            <User className="h-3 w-3 text-[#16a34a]" />
                                        )}
                                    </div>

                                    {/* Middle Subject - Larger Text, Bold if Unread */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn(
                                            "text-[11px] truncate uppercase tracking-normal",
                                            isRead ? "font-bold text-black" : "font-black text-[#1e40af]"
                                        )}>
                                            {msg.ISMINT_Subject}
                                        </h3>
                                    </div>

                                    {/* Sender Info - Compact */}
                                    <div className="hidden sm:flex items-center justify-end min-w-[250px] gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            {isComposedByMe ? (
                                                <>To:<span className={cn("ml-1", isRead ? "text-black" : "text-slate-700")}>
                                                    {msg.Receiver}
                                                    {(msg.Classname || (msg as any).ASMCL_ClassName) && ` (${(msg.Classname || (msg as any).ASMCL_ClassName)}${(msg.Sectionname || (msg as any).ASMC_SectionName) ? ` - ${(msg.Sectionname || (msg as any).ASMC_SectionName)}` : ''})`}
                                                </span></>
                                            ) : (
                                                <>From:<span className={cn("ml-1", isRead ? "text-black" : "text-slate-700")}>
                                                    {msg.Sender}
                                                    {(msg.Classname || (msg as any).ASMCL_ClassName) && ` (${(msg.Classname || (msg as any).ASMCL_ClassName)}${(msg.Sectionname || (msg as any).ASMC_SectionName) ? ` - ${(msg.Sectionname || (msg as any).ASMC_SectionName)}` : ''})`}
                                                </span></>
                                            )}
                                        </span>
                                    </div>

                                    {/* Right Message Icon - Simple Envelope */}
                                    <div className="flex shrink-0 items-center justify-center w-8">
                                        <Mail className={cn(
                                            "h-3.5 w-3.5 transition-all",
                                            isRead ? "text-slate-300" : "text-[#1e40af]"
                                        )} />
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
