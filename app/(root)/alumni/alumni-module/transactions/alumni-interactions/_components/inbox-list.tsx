'use client';

import ViewReplyModal from '@/app/(root)/alumni/alumni-module/transactions/alumni-interactions/_components/view-reply-modal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteInboxMessage } from '@/server/alumni/alumni-interactions';
import type { IAlumniInteraction } from '@/types/alumni/alumni-interactions';
import { format } from 'date-fns';
import { Loader2, MessageCircle, MessageSquare, Paperclip, Trash2, User, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InboxListProps {
    messages: IAlumniInteraction[];
    userHrmeId: number;
    asmaY_Id: number;
    ivrmrT_Id: number;
    almsT_Id: number;
    mI_Id: number;
    roleFlg: string;
    onRefresh: () => void;
}

export default function InboxList({ messages, userHrmeId, asmaY_Id, ivrmrT_Id, almsT_Id, mI_Id, roleFlg, onRefresh }: InboxListProps) {
    const [selectedMessage, setSelectedMessage] = useState<IAlumniInteraction | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this interaction?')) return;
        setIsDeleting(id);
        try {
            const res = await deleteInboxMessage(id);
            if (res.success) {
                toast.success('Interaction deleted');
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to delete');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred while deleting');
        } finally {
            setIsDeleting(null);
        }
    };

    if (messages.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12 text-center'>
                <MessageCircle className='mb-4 h-12 w-12 text-muted-foreground/50' />
                <h3 className='font-semibold text-lg'>No Messages Found</h3>
                <p className='max-w-xs text-muted-foreground text-sm'>
                    Your inbox is empty. Start a conversation in the Group or Individual tabs.
                </p>
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <Accordion type='single' collapsible className='w-full'>
                {messages.map((msg) => (
                    <AccordionItem
                        key={msg.ALSMINT_Id}
                        value={String(msg.ALSMINT_Id)}
                        className='mb-2 overflow-hidden rounded-lg border bg-card px-4 shadow-sm'>
                        <AccordionTrigger className='py-4 hover:no-underline'>
                            <div className='flex w-full items-center gap-4 text-left'>
                                <div
                                    className={`rounded-full p-2 ${msg.ALSMINT_GroupOrIndFlg === 'Group' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    {msg.ALSMINT_GroupOrIndFlg === 'Group' ? <Users size={18} /> : <User size={18} />}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <div className='mb-1 flex items-center justify-between gap-2'>
                                        <h4 className='truncate font-semibold text-sm md:text-base'>{msg.ALSMINT_Subject}</h4>
                                        <span className='whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground'>
                                            {(() => {
                                                const date = new Date(msg.ALSMINT_DateTime);
                                                return !Number.isNaN(date.getTime()) ? format(date, 'MMM dd, h:mm a') : '';
                                            })()}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                                        {msg.ALSMINT_ComposedById === userHrmeId ? (
                                            <span className='flex items-center gap-1 italic'>
                                                To: <span className='font-medium text-foreground/80'>{msg.Receiver}</span>
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-1 italic'>
                                                From: <span className='font-medium text-foreground/80'>{msg.Sender}</span>
                                            </span>
                                        )}
                                        {msg.ALSTINT_Attachment && (
                                            <Badge variant='outline' className='h-4 gap-1 px-1 py-0 text-[10px]'>
                                                <Paperclip size={10} /> Attachment
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='border-t pt-4 pb-4'>
                            <div className='mb-4 whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-foreground/90 text-sm leading-relaxed'>
                                {msg.ALSMINT_Interaction}
                            </div>
                            <div className='flex items-center justify-between border-t pt-4'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setSelectedMessage(msg)}
                                    className='gap-2 border-primary/30 shadow-sm transition-all hover:bg-primary hover:text-primary-foreground'>
                                    <MessageSquare size={14} /> View & Reply
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    disabled={isDeleting === msg.ALSMINT_Id}
                                    onClick={() => handleDelete(msg.ALSMINT_Id)}
                                    className='text-destructive hover:bg-destructive/10'>
                                    {isDeleting === msg.ALSMINT_Id ? <Loader2 size={14} className='animate-spin' /> : <Trash2 size={14} />}
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {selectedMessage && (
                <ViewReplyModal
                    message={selectedMessage}
                    userHrmeId={userHrmeId}
                    asmaY_Id={asmaY_Id}
                    ivrmrT_Id={ivrmrT_Id}
                    almsT_Id={almsT_Id}
                    mI_Id={mI_Id}
                    roleFlg={roleFlg}
                    onClose={() => setSelectedMessage(null)}
                    onSuccess={() => {
                        setSelectedMessage(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}
