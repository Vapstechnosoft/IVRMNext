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
    Eye,
    ChevronRight,
    User,
    Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { IInteractionsInitialData, IMessage } from '@/types/staff-portal/interactions';
import { ViewReplyModal } from './view-reply-modal';
import { deleteInteraction, markMessageAsRead } from '@/server/staff-portal/interactions';
import { toast } from 'sonner';

interface InboxTabProps {
    data: IInteractionsInitialData;
    onRefresh: () => void;
    roleFlg: string;
}
export const dynamic = 'force-dynamic';
export function InboxTab({ data, onRefresh, roleFlg }: InboxTabProps) {
    const [searchFrom, setSearchFrom] = useState('');
    const [searchClass, setSearchClass] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Apply read flags and metadata to all messages without grouping
    const processedMessages = useMemo(() => {
        const rawMsgs = data.result || data.getinboxmsg || [];
        const readFlags = data.result1 || data.getinboxmsg_readflg || [];

        return rawMsgs.map((curr: IMessage) => {
            const flag = readFlags.find(f => f.ISMINT_Id === curr.ISMINT_Id);
            const admNo = curr.AMST_AdmNo || (curr as any).AMST_AdmissionNo || (curr as any).amst_admno;

            return {
                ...curr,
                ISTINT_ReadFlg: flag ? flag.ISTINT_ReadFlg : 0,
                AMST_AdmNo: admNo
            };
        });
    }, [data]);

    const filteredMessages = processedMessages.filter(msg => {
        const matchFrom = (msg.Sender || '').toLowerCase().includes(searchFrom.toLowerCase());
        const matchClass = (msg.Classname || '').toLowerCase().includes(searchClass.toLowerCase());
        const matchSection = (msg.Sectionname || '').toLowerCase().includes(searchSection.toLowerCase());
        return matchFrom && matchClass && matchSection;
    });

    const handleViewMessage = async (msg: IMessage) => {
        setSelectedMessage(msg);
        setIsViewModalOpen(true);

        if (msg.ISTINT_ReadFlg === 0) {
            try {
                await markMessageAsRead(msg.ISTINT_Id);
            } catch (error) {
                console.error('Failed to mark message as read:', error);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Legacy Style Header with Count Badge and Yellow Border */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#fbbf24] pb-3">
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

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {format(new Date(), 'MM/dd/yyyy hh:mm a')}
                        <button
                            onClick={onRefresh}
                            className="p-1 px-1.5 ml-2 rounded-sm hover:bg-slate-100 transition-all border border-slate-200 bg-white"
                            title="Refresh"
                        >
                            <RefreshCw className="h-3 w-3 text-slate-600" />
                        </button>
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
                        const isUnread = msg.ISTINT_ReadFlg === 0;
                        const isComposedByMe = msg.ISMINT_ComposedById === (data as any).userhrmE_Id || msg.ISMINT_ComposedById === (data as any).userAMST_Id;

                        return (
                            <div
                                key={msg.ISTINT_Id}
                                onClick={() => handleViewMessage(msg)}
                                className={cn(
                                    "relative flex items-center p-4 bg-white border shadow-sm cursor-pointer hover:shadow-md transition-all",
                                    isUnread ? "border-l-4 border-l-blue-600" : "border-slate-200"
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
                                        isUnread ? "text-[#1e40af]" : "text-slate-600"
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
                                        <Mail className={cn(
                                            "h-5 w-5 hover:scale-110 transition-transform",
                                            isUnread ? "text-[#1e40af]" : "text-slate-300"
                                        )} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
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
