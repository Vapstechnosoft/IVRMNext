// Force TS Server re-analysis
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Search, 
    Paperclip, 
    MessageSquare, 
    Calendar, 
    RefreshCw, 
    Trash2,
    ChevronRight,
    User,
    MailOpen,
    Mail,
    Send as SendIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { IInteractionsInitialData, IMessage } from '@/types/staff-portal/interactions';
import { ViewReplyModal } from './view-reply-modal-component';

import { deleteInteraction, markMessageAsRead } from '@/server/staff-portal/interactions';
import { toast } from 'sonner';

interface InboxTabProps {
    data: IInteractionsInitialData;
    onRefresh: () => void;
    roleFlg: string;
}

export function InboxTab({ data, onRefresh, roleFlg }: InboxTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [localReadMessages, setLocalReadMessages] = useState<Record<number, number>>({});

    // Merge read flags with messages as per legacy controller's message_listread logic
    const processedMessages = useMemo(() => {
        const msgs = data.getinboxmsg || [];
        const readFlags = data.getinboxmsg_readflg || [];

        return msgs.map(msg => {
            const flag = readFlags.find(f => f.ISMINT_Id === msg.ISMINT_Id);
            const localFlag = localReadMessages[msg.ISTINT_Id];
            return {
                ...msg,
                ISTINT_ReadFlg: localFlag !== undefined ? localFlag : (flag ? flag.ISTINT_ReadFlg : 0)
            };
        });
    }, [data, localReadMessages]);

    const filteredMessages = processedMessages.filter(msg => 
        msg.ISMINT_Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.ISMINT_Interaction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.Sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.Receiver?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewMessage = async (msg: IMessage) => {
        setSelectedMessage(msg);
        setIsViewModalOpen(true);
        
        // Mark as read if it's unread - matches legacy seen function
        if (msg.ISTINT_ReadFlg === 0) {
            // Update local state immediately for snappy UI
            setLocalReadMessages(prev => ({ ...prev, [msg.ISTINT_Id]: 1 }));
            try {
                await markMessageAsRead(msg.ISTINT_Id);
            } catch (error) {
                console.error('Failed to mark message as read:', error);
                // Rollback if needed or just let it be
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent, msg: IMessage) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this interaction?')) return;

        try {
            const res = await deleteInteraction({ ISMINT_Id: msg.ISMINT_Id, ISTINT_Id: msg.ISTINT_Id });
            if (res.success && res.data?.returnval) {
                toast.success('Interaction deleted successfully');
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to delete interaction');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('An error occurred during deletion');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Legacy Style Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black uppercase tracking-wider text-blue-800">
                            MESSAGE INBOX
                        </h2>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-white">
                            {filteredMessages.length}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-blue-600">
                        BLUE COLOUR ON INTERACTION SAYS UNREAD
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(), 'dd/MM/yyyy hh:mm a')}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                            <input 
                                className="h-8 w-[150px] lg:w-[200px] rounded-md border bg-background pl-8 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={onRefresh}
                            className="p-2 rounded-md hover:bg-muted transition-all border shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Legacy Style List */}
            <div className="flex flex-col border border-muted/60 rounded-sm overflow-hidden bg-white shadow-sm">
                {filteredMessages.length === 0 ? (
                    <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 bg-muted/5">
                        No messages found in your inbox
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div 
                            key={`${msg.ISMINT_Id}-${msg.ISTINT_Id}`}
                            onClick={() => handleViewMessage(msg)}
                            className={cn(
                                "group flex items-center p-3 gap-4 cursor-pointer border-b last:border-b-0 hover:bg-slate-50 transition-colors",
                                msg.ISTINT_ReadFlg === 0 ? "bg-blue-50/30" : "bg-white"
                            )}
                        >
                            {/* Left Status Icon */}
                            <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-green-500/10">
                                <User className="h-3.5 w-3.5 text-green-600" />
                            </div>
                            
                            {/* Middle Subject */}
                            <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                    "text-xs truncate transition-colors",
                                    msg.ISTINT_ReadFlg === 0 ? "font-black text-blue-700" : "font-bold text-slate-600"
                                )}>
                                    {msg.ISMINT_Subject}
                                </h3>
                            </div>

                            {/* Sender/Receiver Info */}
                            <div className="hidden sm:flex items-center justify-end min-w-[200px] text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                {msg.ISMINT_ComposedById === data.userhrmE_Id ? `To:${msg.Receiver}` : `From:${msg.Sender}`}
                            </div>

                            {/* Right Message Icon */}
                            <div className="flex shrink-0 items-center justify-center h-8 w-8">
                                {msg.ISMINT_ComposedById === data.userhrmE_Id ? (
                                    <div className="relative">
                                        <SendIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Mail className={cn(
                                            "h-4 w-4 transition-colors",
                                            msg.ISTINT_ReadFlg === 0 ? "text-blue-600" : "text-slate-300"
                                        )} />
                                        {msg.ISTINT_Attachment && (
                                            <Paperclip className="absolute -top-1 -right-2 h-2.5 w-2.5 text-orange-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isViewModalOpen && selectedMessage && (
                <ViewReplyModal 
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedMessage(null);
                        onRefresh(); 
                    }}
                    message={selectedMessage}
                    roleFlg={roleFlg}
                    interactionsData={data}
                />
            )}
        </div>
    );
}
