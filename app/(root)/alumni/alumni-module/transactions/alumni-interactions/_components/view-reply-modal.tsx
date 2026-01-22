'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { deleteInteractionMessage, getInteractionThread, saveInteractionReply } from '@/server/alumni/alumni-interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IAlumniInteraction, IAlumniInteractionReply } from '@/types/alumni/alumni-interactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Paperclip, Plus, Send, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type InteractionReplySchema, interactionReplySchema } from './schema';

interface ViewReplyModalProps {
    message: IAlumniInteraction;
    userHrmeId: number;
    asmaY_Id: number;
    ivrmrT_Id: number;
    almsT_Id: number;
    mI_Id: number;
    roleFlg: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ViewReplyModal({ message, userHrmeId, asmaY_Id, ivrmrT_Id, almsT_Id, roleFlg, onClose }: ViewReplyModalProps) {
    const [replies, setReplies] = useState<IAlumniInteractionReply[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const form = useForm<InteractionReplySchema>({
        resolver: zodResolver(interactionReplySchema),
        defaultValues: {
            istinT_Interaction: '',
            images_paths: []
        }
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = form;
    const images_paths = watch('images_paths') || [];

    const fetchThread = async () => {
        setIsLoading(true);
        try {
            const res = await getInteractionThread({
                ALSMINT_Id: message.ALSMINT_Id,
                ASMAY_Id: asmaY_Id,
                IVRMRT_Id: ivrmrT_Id,
                ALMST_Id: almsT_Id
            });
            if (res.success && res.data) {
                setReplies(res.data.viewmessage || []);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Failed to load message thread');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchThread();
    }, [message.ALSMINT_Id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [replies]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('File', file);
            formData.append('folder', 'Alumni_Interaction');

            try {
                const response = await uploadDocument(formData);
                const res: any = response;
                let path = '';
                if (Array.isArray(res) && res.length > 0) path = res[0].path || res[0];
                else if (res?.path) path = res.path;

                if (path) {
                    setValue('images_paths', [...images_paths, { path, name: file.name }]);
                    toast.success('File uploaded successfully');
                }
                // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            } catch (err) {
                toast.error('File upload failed');
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteReply = async (id: number) => {
        if (!confirm('Are you sure you want to delete this specific message?')) return;
        try {
            const res = await deleteInteractionMessage(id);
            if (res.success) {
                toast.success('Message deleted from thread');
                fetchThread();
            } else {
                toast.error(res.message || 'Failed to delete message');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred while deleting');
        }
    };

    const onSubmit = async (data: InteractionReplySchema) => {
        try {
            const payload: any = {
                ALSMINT_Id: message.ALSMINT_Id,
                IVRMRT_Id: ivrmrT_Id,
                ALSTINT_Interaction: data.istinT_Interaction
            };

            // As per user examples: Alumni sends ALMST_Id and images_paths, Staff does not.
            if (roleFlg === 'Alumni' || !roleFlg) {
                payload.ALMST_Id = almsT_Id;
                payload.images_paths = data.images_paths?.map((p: any) => p.path) || [];
            }

            const res = await saveInteractionReply(payload);
            const response = res as any;
            if (response.success || response === true || response?.data === true) {
                toast.success('Reply sent successfully');
                reset();
                fetchThread();
            } else {
                toast.error(response.message || 'Failed to send reply');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred while sending your reply');
        }
    };

    return (
        <AdaptiveDialog isOpen={true} onClose={onClose} title={message.ALSMINT_Subject} size='2xl'>
            <AdaptiveBody className='flex flex-col gap-4'>
                <div
                    className='max-h-[500px] min-h-[350px] flex-1 space-y-4 overflow-y-auto rounded-md bg-muted/5 p-2 px-1'
                    ref={scrollRef}>
                    {isLoading ? (
                        <div className='flex h-full min-h-[300px] items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    ) : replies.length === 0 ? (
                        <div className='flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-8 text-muted-foreground'>
                            <Plus className='mb-2 h-8 w-8 opacity-20' />
                            <p>No messages in this thread yet.</p>
                        </div>
                    ) : (
                        replies.map((reply, idx) => {
                            const isMe = reply.ALSTINT_ComposedById === userHrmeId;
                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`group relative max-w-[90%] rounded-2xl px-4 py-2 shadow-sm md:max-w-[75%] ${
                                            isMe
                                                ? 'rounded-tr-none bg-primary text-primary-foreground'
                                                : 'rounded-tl-none border border-border bg-card'
                                        }`}>
                                        <div className='mb-1 flex items-center justify-between gap-4'>
                                            <span
                                                className={`font-bold text-[10px] ${isMe ? 'text-primary-foreground/80' : 'text-primary'}`}>
                                                {isMe ? 'You' : reply.Sender}
                                            </span>
                                            {isMe && (
                                                // biome-ignore lint/a11y/useButtonType: <explanation>
                                                <button
                                                    onClick={() => handleDeleteReply(reply.ALSTINT_Id)}
                                                    className='text-primary-foreground/70 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-60'
                                                    title='Delete message'
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
                                            {reply.ALSTINT_Interaction}
                                        </p>

                                        {reply.ALSTINT_Attachment && (
                                            <div
                                                className={`mt-2 border-t pt-2 ${isMe ? 'border-primary-foreground/20' : 'border-border'}`}>
                                                <a
                                                    href={reply.ALSTINT_Attachment}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className={`flex items-center gap-2 font-medium text-[10px] hover:underline ${isMe ? 'text-primary-foreground' : 'text-blue-600'}`}>
                                                    <Paperclip size={10} /> View Attachment
                                                </a>
                                            </div>
                                        )}

                                        {/* biome-ignore lint/style/noUnusedTemplateLiteral: <explanation> */}
                                        <div className={`mt-2 text-right font-medium text-[9px] opacity-60`}>
                                            {format(new Date(reply.ALSTINT_DateTime), 'MMM dd, h:mm a')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-3 border-t pt-4'>
                    <div className='flex flex-col gap-2'>
                        <textarea
                            {...register('istinT_Interaction')}
                            placeholder='Type your message here...'
                            className='min-h-[90px] w-full resize-none rounded-lg border bg-card px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
                        />
                        {errors.istinT_Interaction && <FormError>{errors.istinT_Interaction.message}</FormError>}
                    </div>

                    <div className='flex items-center justify-between gap-4'>
                        <div className='flex flex-1 flex-col gap-2'>
                            <input type='file' ref={fileInputRef} onChange={handleFileUpload} className='hidden' />
                            <div className='flex items-center gap-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}>
                                    {uploading ? <Loader2 size={14} className='mr-2 animate-spin' /> : <Plus size={14} className='mr-2' />}
                                    Attach File
                                </Button>

                                <div className='invisible-scrollbar flex gap-1 overflow-x-auto pb-1'>
                                    {images_paths.map((f, i) => (
                                        <div
                                            key={i}
                                            className='flex items-center gap-1 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] text-primary'>
                                            <span className='max-w-[80px] truncate' title={f.name}>
                                                {f.name}
                                            </span>
                                            <X
                                                size={10}
                                                className='ml-1 cursor-pointer hover:scale-120'
                                                onClick={() => {
                                                    const updated = [...images_paths];
                                                    updated.splice(i, 1);
                                                    setValue('images_paths', updated);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            type='submit'
                            size='lg'
                            disabled={isSubmitting || uploading}
                            isLoading={isSubmitting}
                            className='min-w-[120px]'>
                            <Send size={16} className='mr-2' /> Send
                        </Button>
                    </div>
                </form>
            </AdaptiveBody>
            <AdaptiveFooter className='hidden'>
                <div />
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
