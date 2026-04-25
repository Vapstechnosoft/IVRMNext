// Force TS Server re-analysis
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
    Send, 
    Paperclip, 
    Loader2, 
    User, 
    FileText,
    FileImage,
    Video,
    Music,
    ExternalLink,
    MessageSquare,
    ChevronDown,
    Calendar,
    Target,
    X,
    Download
} from 'lucide-react';
import { fetchThread, saveInteractionReply } from '@/server/staff-portal/interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IMessage, ISaveReplyRequest, IFILESLISTdata } from '@/types/staff-portal/interactions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ViewReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: IMessage;
    roleFlg: string;
    userhrmE_Id: number;
}

export function ViewReplyModal({ isOpen, onClose, message, roleFlg, userhrmE_Id }: ViewReplyModalProps) {
    const [thread, setThread] = useState<any[]>([]);
    const [replyVisible, setReplyVisible] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [files, setFiles] = useState<{ name: string; file: File | null }[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loggedInHrmeId = userhrmE_Id;

    const loadThread = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchThread(message.ISMINT_Id);
            if (res.success && res.data) {
                setThread(res.data.viewmessage || []);
                
                // Parity logic: if data was loaded successfully, reply should be visible 
                // based on permissions checked in legacy reply function
                setReplyVisible(true); 
            }
        } catch (error) {
            console.error('Failed to load thread:', error);
            toast.error('Failed to load conversation history');
        } finally {
            setIsLoading(false);
        }
    }, [message.ISMINT_Id]);

    useEffect(() => {
        if (isOpen) {
            loadThread();
        }
    }, [isOpen, loadThread]);

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload files
            const uploadedFiles: IFILESLISTdata[] = [];
            for (const fileObj of files) {
                if (fileObj.file) {
                    const formData = new FormData();
                    formData.append('file', fileObj.file);
                    const uploadRes = await uploadDocument(formData);
                    if (uploadRes.success && uploadRes.data) {
                        uploadedFiles.push({
                            ISMID_Filename: fileObj.name,
                            ISMID_Filepath: uploadRes.data
                        });
                    }
                }
            }

            const payload: ISaveReplyRequest = {
                ismint_Id: message.ISMINT_Id,
                istint_Interaction: replyText,
                roleflg: roleFlg,
                istint_ComposedByFlg: roleFlg,
                istint_Id: 0,
                images_paths: uploadedFiles.map(f => f.ISMID_Filepath)
            };

            const res = await saveInteractionReply(payload);
            if (res.success && res.data?.returnval) {
                toast.success('Reply sent successfully');
                setReplyText('');
                loadThread();
            } else {
                toast.error(res.message || 'Failed to send reply');
            }
        } catch (error) {
            toast.error('An error occurred while replying');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileView = (url: string) => {
        if (!url) return;
        const ext = url.split('.').pop()?.toLowerCase();
        
        if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) {
            window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`, '_blank');
        } else {
            window.open(url, '_blank');
        }
    };

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = url.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    const getFileIcon = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return <FileImage className="h-4 w-4" />;
        if (['mp4', 'mkv', 'avi'].includes(ext || '')) return <Video className="h-4 w-4" />;
        if (['mp3', 'wav'].includes(ext || '')) return <Music className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFiles(prev => [...prev, { name: file.name, file: file }]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl backdrop-blur-xl bg-background/90 ring-1 ring-white/10">
                <DialogHeader className="p-8 border-b bg-primary/[0.03] space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                             <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <MessageSquare className="h-6 w-6" />
                             </div>
                             <DialogTitle className="text-2xl font-black tracking-tight leading-none">
                                {message.ISMINT_Subject}
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap ml-12">
                             <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-background/50 border-primary/20 text-primary">
                                ID: {message.ISMINT_InteractionId}
                            </Badge>
                            {message.Classname && (
                                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-blue-500/10 border-blue-500/20 text-blue-600">
                                    {message.Classname} {message.Sectionname && `- ${message.Sectionname}`}
                                </Badge>
                            )}
                            <span className="text-muted-foreground opacity-30">•</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span>{message.Sender} to {message.Receiver}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-8 bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Loading interaction history...</p>
                        </div>
                    ) : (
                        <div className="max-w-[95%] mx-auto pb-10">
                            {/* Table View */}
                            <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#1e40af] text-white">
                                        <tr>
                                            <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider border-r border-[#3b82f6]/30 text-center w-[60px]">SL NO</th>
                                            <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider border-r border-[#3b82f6]/30 text-center">Interaction</th>
                                            <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider border-r border-[#3b82f6]/30 text-center w-[120px]">Image</th>
                                            <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider border-r border-[#3b82f6]/30 text-center w-[150px]">Reply By</th>
                                            <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-center w-[180px]">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[12px] font-bold text-slate-600">
                                        {/* Original Message First */}
                                        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 text-center border-r border-slate-100 italic text-slate-400">1</td>
                                            <td className="px-4 py-4 border-r border-slate-100 leading-relaxed font-medium">
                                                {message.ISMINT_Interaction}
                                            </td>
                                            <td className="px-4 py-4 border-r border-slate-100 text-center">
                                                {message.ISMINT_Attachment && (
                                                    <button 
                                                        onClick={() => setPreviewUrl(message.ISMINT_Attachment!)}
                                                        className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Paperclip className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 border-r border-slate-100 text-center text-[11px] uppercase tracking-tighter">
                                                {message.Sender}
                                            </td>
                                            <td className="px-4 py-4 text-center text-[11px] text-slate-500">
                                                {format(new Date(message.ISMINT_DateTime), 'dd/MM/yyyy hh:mm a')}
                                            </td>
                                        </tr>

                                        {/* Replies */}
                                        {thread.map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-4 text-center border-r border-slate-100 italic text-slate-400">{idx + 2}</td>
                                                <td className="px-4 py-4 border-r border-slate-100 leading-relaxed font-medium">
                                                    {item.ISTINT_Interaction}
                                                </td>
                                                <td className="px-4 py-4 border-r border-slate-100 text-center">
                                                    {item.ISTINT_Attachment && (
                                                        <button 
                                                            onClick={() => setPreviewUrl(item.ISTINT_Attachment)}
                                                            className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                        >
                                                            {getFileIcon(item.ISTINT_Attachment)}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 border-r border-slate-100 text-center text-[11px] uppercase tracking-tighter">
                                                    {item.Sender || (item.ISTINT_ComposedById === loggedInHrmeId ? 'You' : 'Staff')}
                                                </td>
                                                <td className="px-4 py-4 text-center text-[11px] text-slate-500">
                                                    {format(new Date(item.ISTINT_DateTime), 'dd/MM/yyyy hh:mm a')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {replyVisible && (
                    <div className="p-8 border-t bg-muted/20 relative shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                     <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary leading-none">Draft Reply</Label>
                                     <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
                                </div>
                                <Textarea 
                                    placeholder="Type your message here..."
                                    className="min-h-[120px] resize-none bg-background border-2 rounded-2xl p-4 font-medium focus-visible:ring-primary/20 placeholder:opacity-50"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex grow flex-col gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        {files.map((f, i) => (
                                            <Badge key={i} variant="secondary" className="gap-2 px-3 py-1">
                                                {f.name}
                                                <X className="h-3 w-3 cursor-pointer" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} />
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-10 text-[10px] font-black uppercase tracking-widest gap-3 rounded-full hover:bg-primary/5 hover:text-primary transition-colors relative w-fit">
                                        <Paperclip className="h-4 w-4" />
                                        Attach File
                                        <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                    </Button>
                                </div>
                                <Button 
                                    className="min-w-[120px] h-10 px-6 rounded-md bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-black text-xs uppercase tracking-widest shadow-md transition-all" 
                                    onClick={handleSendReply}
                                    disabled={isSubmitting || !replyText.trim()}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "REPLY"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
            {/* Image Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none flex flex-col items-center">
                    <div className="relative group w-full flex flex-col items-center gap-6">
                        <div className="relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md p-1 shadow-2xl">
                             {previewUrl && (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="max-h-[70vh] w-auto rounded-xl object-contain shadow-inner"
                                />
                             )}
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => previewUrl && handleDownload(previewUrl)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-8 rounded-full font-black uppercase tracking-widest gap-3 h-12 shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Download Image
                            </Button>
                            <Button 
                                onClick={() => setPreviewUrl(null)}
                                className="bg-red-500/80 hover:bg-red-500 text-white px-8 rounded-full font-black uppercase tracking-widest h-12 shadow-xl"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
