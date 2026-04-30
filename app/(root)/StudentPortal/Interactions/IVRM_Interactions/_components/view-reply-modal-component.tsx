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
    Download,
    Trash2
} from 'lucide-react';
import { fetchThread, saveInteractionReply, deleteInteractionReply } from '@/server/staff-portal/interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IMessage } from '@/types/staff-portal/interactions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
// mammoth will be imported dynamically to avoid build-time resolution issues

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

    // Advanced preview state
    const [previewFileObj, setPreviewFileObj] = useState<{ url: string; name: string; type: string } | null>(null);
    const [xlsxPreviewData, setXlsxPreviewData] = useState<any[][] | null>(null);
    const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

    const loggedInHrmeId = userhrmE_Id;

    const loadThread = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchThread(message.ISMINT_Id);
            if (res.success && res.data) {
                // Handle different backend response structures (viewmessage vs replylist)
                const threadData = res.data.viewmessage?.length ? res.data.viewmessage : (res.data.replylist || []);
                setThread(threadData);

                // Parity logic: if data was loaded successfully, reply should be visible 
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
            // Upload files (supporting single file for consistency with compose)
            let uploadedFilePath = '';
            if (files.length > 0 && files[0].file) {
                const formData = new FormData();
                formData.append('file', files[0].file);
                const uploadRes = await uploadDocument(formData);
                if (uploadRes.success && uploadRes.data) {
                    uploadedFilePath = uploadRes.data;
                }
            }

            const payload: any = {
                isminT_Id: message.ISMINT_Id,
                istinT_Interaction: replyText,
                images_paths: uploadedFilePath ? [uploadedFilePath] : [],
                isminT_MACAddress: '00-14-22-01-23-45', // As per user requirement
                isminT_ISPIPAddress: '192.168.1.1'      // As per user requirement
            };

            const res = await saveInteractionReply(payload);
            if (res.success) {
                toast.success(res.message || 'Reply sent successfully');
                setReplyText('');
                setFiles([]); // Clear files
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

    const handleDeleteReply = async (id: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        try {
            const res = await deleteInteractionReply(id);
            if (res.success) {
                toast.success('Reply deleted');
                loadThread();
            } else {
                toast.error(res.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting reply');
        }
    };

    const handleViewFile = async (fileObj: { name: string; file: File | null } | string) => {
        let url = '';
        let name = '';
        let type = '';
        let blob: File | Blob | null = null;

        if (typeof fileObj === 'string') {
            url = fileObj;
            name = fileObj.split('/').pop() || 'Attachment';
            // Determine type from extension if needed, iframe usually handles it
            const ext = name.split('.').pop()?.toLowerCase();
            if (ext === 'pdf') type = 'application/pdf';
            else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) type = `image/${ext}`;
            else if (ext === 'mp4') type = 'video/mp4';
            else if (ext === 'mp3') type = 'audio/mpeg';
            else if (ext === 'xlsx' || ext === 'xls') type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            else if (ext === 'docx') type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            if (ext === 'xlsx' || ext === 'xls' || ext === 'docx') {
                try {
                    const response = await fetch(url);
                    blob = await response.blob();
                } catch (err) {
                    toast.error('Failed to fetch file for preview');
                }
            }
        } else {
            if (!fileObj.file) return;
            url = URL.createObjectURL(fileObj.file);
            name = fileObj.name;
            type = fileObj.file.type || '';
            blob = fileObj.file;
        }

        setPreviewFileObj({ url, name, type });

        // Handle Advanced Formats (XLSX, DOCX)
        if (blob && (name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls'))) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setXlsxPreviewData(jsonData as any[][]);
            };
            reader.readAsArrayBuffer(blob);
        } else if (blob && name.toLowerCase().endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                try {

                    const mammothModule = await import('mammoth');
                    const mammoth = mammothModule.default || mammothModule;
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setDocxPreviewHtml(result.value);
                } catch (err) {
                    setDocxPreviewHtml('<p class="text-red-500 font-bold">Failed to load Word document.</p>');
                }
            };
            reader.readAsArrayBuffer(blob);
        } else {
            setXlsxPreviewData(null);
            setDocxPreviewHtml(null);
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
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFiles([{ name: selectedFile.name, file: selectedFile }]);
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
                                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider border-r border-blue-400/30 text-center w-[60px]">SL NO</th>
                                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider border-r border-blue-400/30 text-center">Interaction</th>
                                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider border-r border-blue-400/30 text-center w-[120px]">Attachment</th>
                                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider border-r border-blue-400/30 text-center w-[150px]">Reply By</th>
                                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider border-r border-blue-400/30 text-center w-[180px]">Date</th>
                                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center w-[80px]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[12px] font-bold text-slate-600">
                                        {/* Dynamic Thread Records from Backend */}
                                        {thread.map((item: any, idx: number) => {
                                            const isMyReply = item.ISTINT_ComposedById === loggedInHrmeId;
                                            return (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-4 py-4 text-center border-r border-slate-100 italic text-slate-400 bg-slate-50/30 font-black tracking-widest">{idx + 1}</td>
                                                    <td className="px-4 py-4 border-r border-slate-100 leading-relaxed font-medium">
                                                        {item.ISTINT_Interaction || item.ISMINT_Interaction}
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-100 text-center">
                                                        {(item.ISTINT_Attachment || item.ISMINT_Attachment) && (
                                                            <button
                                                                onClick={() => {
                                                                    const url = item.ISTINT_Attachment || item.ISMINT_Attachment;
                                                                    handleViewFile(url);
                                                                }}
                                                                className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm"
                                                            >
                                                                {getFileIcon(item.ISTINT_Attachment || item.ISMINT_Attachment || '')}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-100 text-center text-[10px] uppercase tracking-tighter font-black text-slate-500">
                                                        {item.Sender || (isMyReply ? 'You' : 'Staff')}
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-100 text-center text-[11px] text-slate-400">
                                                        {(item.ISTINT_DateTime || item.ISMINT_DateTime) ? format(new Date(item.ISTINT_DateTime || item.ISMINT_DateTime), 'dd/MM/yyyy hh:mm a') : ''}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {isMyReply && (
                                                            <button
                                                                onClick={() => handleDeleteReply(item.ISTINT_Id)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete Reply"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                                            <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200">
                                                <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">{f.name}</span>
                                                <div className="flex items-center gap-1 border-l border-slate-300 pl-2 ml-1">
                                                    <button
                                                        onClick={() => {
                                                            if (f.file) {
                                                                handleViewFile(f);
                                                            }
                                                        }}
                                                        className="text-[10px] font-black uppercase text-[#1e40af] hover:underline"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (f.file) {
                                                                const url = URL.createObjectURL(f.file);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = f.name;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                document.body.removeChild(a);
                                                                URL.revokeObjectURL(url);
                                                            }
                                                        }}
                                                        className="text-[10px] font-black uppercase text-[#1e40af] hover:underline"
                                                    >
                                                        Download
                                                    </button>
                                                    <X
                                                        className="h-3 w-3 cursor-pointer text-red-500 hover:text-red-700 ml-1"
                                                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                    />
                                                </div>
                                            </div>
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
            {/* Advanced File Preview Modal */}
            <Dialog open={!!previewFileObj} onOpenChange={(open) => {
                if (!open) {
                    setPreviewFileObj(null);
                    setXlsxPreviewData(null);
                    setDocxPreviewHtml(null);
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-none border-2 border-[#1e40af] shadow-2xl">
                    <DialogHeader className="p-4 bg-[#1e40af] text-white flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-sm font-bold truncate pr-pr-8 uppercase tracking-wider">{previewFileObj?.name}</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-none"
                            onClick={() => setPreviewFileObj(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-slate-50 p-6 flex items-center justify-center min-h-[400px]">
                        {previewFileObj && (
                            previewFileObj.type?.startsWith('video/') ? (
                                <video
                                    src={previewFileObj.url}
                                    controls
                                    className="max-w-full max-h-full shadow-lg"
                                    autoPlay
                                />
                            ) : previewFileObj.type?.startsWith('audio/') ? (
                                <div className="flex flex-col items-center gap-6 w-full max-w-md bg-white p-10 shadow-xl border border-slate-200">
                                    <div className="h-20 w-20 bg-slate-100 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-[#1e40af]" />
                                    </div>
                                    <audio src={previewFileObj.url} controls className="w-full" autoPlay />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{previewFileObj.name}</p>
                                </div>
                            ) : (previewFileObj.type === 'application/pdf' || previewFileObj.type?.startsWith('image/')) ? (
                                <iframe
                                    src={previewFileObj.url}
                                    className="w-full h-full min-h-[600px] border-none"
                                    title={previewFileObj.name}
                                />
                            ) : (xlsxPreviewData && (previewFileObj.name.toLowerCase().endsWith('.xlsx') || previewFileObj.name.toLowerCase().endsWith('.xls'))) ? (
                                <div className="w-full h-full min-h-[500px] bg-white border border-slate-200 overflow-hidden flex flex-col shadow-inner">
                                    <div className="bg-slate-100 px-4 py-2 border-b flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Excel Preview (First 50 Rows)</span>
                                        <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200 rounded-none">XLSX DATA</Badge>
                                    </div>
                                    <ScrollArea className="flex-1 w-full overflow-auto">
                                        <div className="p-4">
                                            <table className="w-full border-collapse text-[11px] font-medium">
                                                <tbody>
                                                    {xlsxPreviewData.slice(0, 50).map((row, rIdx) => (
                                                        <tr key={rIdx} className={cn("hover:bg-slate-50 transition-colors", rIdx === 0 && "bg-slate-100 font-bold border-b-2")}>
                                                            {row.map((cell: any, cIdx: number) => (
                                                                <td key={cIdx} className="border p-2 min-w-[120px] whitespace-nowrap">
                                                                    {cell?.toString() || ''}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {xlsxPreviewData.length > 50 && (
                                                <div className="p-4 text-center text-slate-400 text-xs font-bold bg-slate-50 mt-2 border-t border-dashed uppercase">
                                                    Showing first 50 rows. Download to see all {xlsxPreviewData.length} rows.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : docxPreviewHtml ? (
                                <div className="w-full h-full min-h-[500px] bg-white border border-slate-200 overflow-hidden flex flex-col shadow-inner">
                                    <div className="bg-slate-100 px-4 py-2 border-b flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Word Document Preview</span>
                                        <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 rounded-none">DOCX CONTENT</Badge>
                                    </div>
                                    <ScrollArea className="flex-1 w-full overflow-auto bg-white p-8">
                                        <div dangerouslySetInnerHTML={{ __html: docxPreviewHtml || '' }} className="prose prose-sm max-w-none text-slate-700" />
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className="text-center p-12 bg-white border border-dashed border-slate-300">
                                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Preview not available for this file type</p>
                                    <Button variant="link" onClick={() => handleDownload(previewFileObj.url)} className="mt-2 text-[#1e40af] font-bold">Download anyway</Button>
                                </div>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
