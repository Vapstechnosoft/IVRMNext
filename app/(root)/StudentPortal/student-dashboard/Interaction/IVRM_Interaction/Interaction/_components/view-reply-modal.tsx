'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Loader2, Paperclip, Send, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { deleteInteraction, getInteractionDetails, replyInteraction } from '../actions';
import type { InteractionMessage, InteractionReply } from '../types';

interface ViewReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: InteractionMessage | null;
    currentUserId: number;
}

export function ViewReplyModal({ isOpen, onClose, message, currentUserId }: ViewReplyModalProps) {
    const [replies, setReplies] = useState<InteractionReply[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    // const { toast } = useToast();

    useEffect(() => {
        if (isOpen && message) {
            fetchReplies();
        }
    }, [isOpen, message]);

    const fetchReplies = async () => {
        if (!message) return;
        setIsLoading(true);
        try {
            // Reusing getdetails or a specific endpoint if needed.
            // Legacy uses `getdetails` sometimes or `viewmessage` scope variable populated by `reply` function.
            // The `reply` function in legacy: `apiService.create("IVRM_Interactions/getdetails", data)` with `ISMINT_Id`.

            const payload = {
                ISMINT_Id: message.ISMINT_Id,
                ISMINT_InteractionId: message.ISMINT_InteractionId
            };

            // Note: In legacy, getdetails returns the conversation history.
            // We need to verify if getInteractionDetails supports this or if we need a specific payload.
            // Assuming getInteractionDetails handles it based on payload.
            const response = await getInteractionDetails(payload);
            if (response?.viewmessage) {
                setReplies(response.viewmessage);
            }
        } catch (error) {
            console.error('Error fetching replies:', error);
            toast.error('Error', { description: 'Failed to load conversation history.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !message) return;
        setIsSending(true);
        try {
            const _payload = {
                ISMINT_Id: message.ISMINT_Id,
                ISTINT_Interaction: replyText,
                ISTINT_ToId: message.ISMINT_ComposedById === currentUserId ? 0 : message.ISMINT_ComposedById, // Logic check needed
                // Legacy `saveddata`/`savereply`: `"ISTINT_ToId": $scope.hrmE_Id` or similar.
                // For now, sending minimal required fields suitable for a reply.
                ISMINT_Interaction: replyText // Sometimes field naming is tricky

                // Actually, `savereply` in legacy sends:
                // "roleflg": $scope.roleflg, "userflag": ..., "ISMINT_Id": ..., "ISTINT_Interaction": $scope.istinT_Interaction
            };

            // Just sending basic structural required fields
            // The legacy `savereply` constructs a complex object.
            // We'll try to match the most critical ones.

            const data = {
                ISMINT_Id: message.ISMINT_Id,
                ISTINT_Interaction: replyText
                // Add any file attachments if we implement upload
            };

            const response = await replyInteraction(data);
            if (response && response.returnval === true) {
                toast.success('Success', { description: 'Reply sent successfully.' });
                setReplyText('');
                fetchReplies(); // Refresh list
            } else {
                toast.error('Error', { description: 'Failed to send reply.' });
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Error', { description: 'Failed to send reply.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (reply: InteractionReply) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            const payload = {
                ISTINT_Id: reply.ISTINT_Id
            };
            const response = await deleteInteraction(payload);
            if (response && response.returnval === true) {
                toast.success('Success', { description: 'Message deleted.' });
                fetchReplies();
            } else {
                toast.error('Error', { description: 'Failed to delete message.' });
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex h-[80vh] max-w-4xl flex-col'>
                <DialogHeader>
                    <DialogTitle>{message?.ISMINT_Subject}</DialogTitle>
                </DialogHeader>

                <div className='flex flex-1 flex-col gap-4 overflow-hidden'>
                    <ScrollArea className='flex-1 rounded-md border p-4'>
                        {isLoading ? (
                            <div className='flex justify-center p-4'>
                                <Loader2 className='animate-spin' />
                            </div>
                        ) : replies.length === 0 ? (
                            <div className='p-4 text-center text-muted-foreground'>No replies found.</div>
                        ) : (
                            <div className='space-y-4'>
                                {replies.map((reply, idx) => (
                                    <div key={idx} className='rounded-md border bg-muted/20 p-3'>
                                        <div className='mb-2 flex items-start justify-between'>
                                            <div className='font-semibold text-sm'>{reply.Sender}</div>
                                            <div className='text-muted-foreground text-xs'>
                                                {format(new Date(reply.ISTINT_DateTime), 'PP p')}
                                            </div>
                                        </div>
                                        <div className='whitespace-pre-wrap text-sm'>{reply.ISTINT_Interaction}</div>
                                        {reply.ISTINT_Attachment && (
                                            <div className='mt-2 text-xs'>
                                                <Link
                                                    href={reply.ISTINT_Attachment}
                                                    target='_blank'
                                                    className='flex items-center gap-1 text-blue-600 hover:underline'>
                                                    <Paperclip className='h-3 w-3' /> View Attachment
                                                </Link>
                                            </div>
                                        )}
                                        {currentUserId === reply.ISTINT_ComposedById && (
                                            <div className='mt-2 flex justify-end'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleDelete(reply)}
                                                    className='h-6 w-6 p-0 text-red-500'>
                                                    <Trash className='h-3 w-3' />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className='border-t pt-4'>
                        <h4 className='mb-2 font-semibold text-sm'>Reply</h4>
                        <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder='Type your reply here...'
                            className='mb-2 min-h-[100px]'
                        />
                        <div className='flex items-center justify-between'>
                            <Button variant='outline' size='sm'>
                                <Paperclip className='mr-2 h-4 w-4' /> Attach File
                            </Button>
                            <Button onClick={handleSendReply} disabled={isSending}>
                                {isSending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
                                Send Reply
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
