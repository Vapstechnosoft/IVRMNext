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
    const [searchFrom, setSearchFrom] = useState('');
    const [searchClass, setSearchClass] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);

    const rawMessages = data.result || data.getinboxmsg || [];
    const readFlags = data.result1 || data.getinboxmsg_readflg || [];

    // Group messages by ISMINT_Id to ensure only one item per thread is shown in the inbox
    const messages = rawMessages.reduce((acc: IMessage[], curr: IMessage) => {
        // Find existing interaction in our accumulator
        const existingIndex = acc.findIndex(m => m.ISMINT_Id === curr.ISMINT_Id);
        const flag = readFlags.find(f => f.ISMINT_Id === curr.ISMINT_Id);
        
        // Extract Admission No from various possible field variants
        const admNo = curr.AMST_AdmNo || (curr as any).AMST_AdmissionNo || (curr as any).amst_admno;

        const msgWithFlag = { 
            ...curr, 
            ISTINT_ReadFlg: flag ? flag.ISTINT_ReadFlg : 0,
            AMST_AdmNo: admNo
        };

        if (existingIndex === -1) {
            // New interaction, add it
            acc.push(msgWithFlag);
        } else {
            // Duplicate ISMINT_Id found (likely a reply or multiple attachment record)
            // Replace existing if current ISTINT_Id is newer
            const existingId = acc[existingIndex].ISTINT_Id || 0;
            const currentId = curr.ISTINT_Id || 0;
            
            if (currentId > existingId) {
                acc[existingIndex] = msgWithFlag;
            }
        }
        return acc;
    }, []);

    const isMessageRead = (msg: IMessage) => {
        return msg.ISTINT_ReadFlg === 1;
    };

    const filteredMessages = messages.filter(msg => {
        const matchFrom = (msg.Sender || '').toLowerCase().includes(searchFrom.toLowerCase());
        const matchClass = (msg.Classname || '').toLowerCase().includes(searchClass.toLowerCase());
        const matchSection = (msg.Sectionname || '').toLowerCase().includes(searchSection.toLowerCase());
        return matchFrom && matchClass && matchSection;
    });

    const openReply = async (msg: IMessage) => {
        const isRead = isMessageRead(msg);
        if (!isRead) {
            try {
                await markMessageAsRead(msg.ISTINT_Id);
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
        setSelectedMessage(msg);
        setShowReplyModal(true);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Legacy Style Header with Count Badge and Yellow Border */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#fbbf24] pb-3 pt-2">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-black uppercase tracking-wider text-[#1e40af]">
                            MESSAGE INBOX 
                        </h2>
                        <span className="flex h-6 px-1.5 min-w-[24px] items-center justify-center rounded-sm bg-[#1e40af] text-[10px] font-black text-white shadow-sm">
                            {filteredMessages.length}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-tight text-[#2563eb] mt-0.5">
                        BLUE COLOUR ON INTERACTION SAYS UNREAD
                    </p>
                </div>

                <div className="flex flex-col md:items-end gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500/80">
                        <RefreshCcw className="h-3 w-3 cursor-pointer hover:rotate-180 transition-all duration-500 text-slate-400" onClick={onRefresh} />
                        {format(new Date(), 'MM/dd/yyyy hh:mm a')}
                    </div>
                </div>
            </div>

            {/* Triple Search Filters - Matches Legacy Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <input 
                        className="h-10 w-full rounded-none border border-slate-300 bg-white px-3 text-[11px] font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Search by From Username..."
                        value={searchFrom}
                        onChange={(e) => setSearchFrom(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <input 
                        className="h-10 w-full rounded-none border border-slate-300 bg-white px-3 text-[11px] font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Search by Classname..."
                        value={searchClass}
                        onChange={(e) => setSearchClass(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <input 
                        className="h-10 w-full rounded-none border border-slate-300 bg-white px-3 text-[11px] font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Search by Sectionname..."
                        value={searchSection}
                        onChange={(e) => setSearchSection(e.target.value)}
                    />
                </div>
            </div>

            {/* Legacy List Items */}
            <div className="flex flex-col gap-3">
                {filteredMessages.length === 0 ? (
                    <div className="p-20 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 bg-slate-50/50 border border-dashed border-slate-200">
                        NO MESSAGES FOUND IN YOUR INBOX
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => {
                        const isRead = isMessageRead(msg);
                        const isComposedByMe = msg.ISMINT_ComposedById === data.userhrmE_Id;

                        return (
                            <div 
                                key={`${msg.ISMINT_Id}`}
                                onClick={() => openReply(msg)}
                                className={cn(
                                    "relative flex items-center p-4 bg-white border shadow-sm cursor-pointer hover:shadow-md transition-all",
                                    !isRead ? "border-l-4 border-l-blue-600" : "border-slate-200"
                                )}
                            >
                                {/* Sl No */}
                                <div className="w-10 shrink-0 text-[11px] font-bold text-slate-400">
                                    {index + 1}
                                </div>

                                {/* User Icon */}
                                <div className="shrink-0 mx-4">
                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                        <User className="h-4 w-4 text-green-600" />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className={cn(
                                        "text-[12px] font-black truncate",
                                        !isRead ? "text-[#1e40af]" : "text-slate-600"
                                    )}>
                                        {msg.ISMINT_Subject}
                                    </h3>
                                </div>

                                {/* Metadata and Status Icon */}
                                <div className="flex items-center gap-12">
                                    <div className="hidden lg:flex items-center text-[10px] font-black text-slate-600 gap-2 uppercase tracking-tighter">
                                        <span>{isComposedByMe ? `To:${msg.Receiver}` : `From:${msg.Sender}`}</span>
                                        {msg.Classname && <span>Class: <span className="text-slate-900">{msg.Classname}</span></span>}
                                        {msg.Sectionname && <span>Section: <span className="text-slate-900">{msg.Sectionname}</span></span>}
                                        {msg.AMST_AdmNo && <span>ADM NO: <span className="text-slate-900">{msg.AMST_AdmNo}</span></span>}
                                    </div>

                                    <div className="shrink-0 p-2">
                                        {isComposedByMe ? (
                                            <Send className="h-5 w-5 text-blue-400" />
                                        ) : (
                                            <Mail className={cn(
                                                "h-5 w-5 hover:scale-110 transition-transform",
                                                !isRead ? "text-[#1e40af]" : "text-slate-300"
                                            )} />
                                        )}
                                    </div>
                                </div>
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
