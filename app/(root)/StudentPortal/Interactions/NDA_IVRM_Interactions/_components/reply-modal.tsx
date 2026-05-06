'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    MessageSquare,
    Send,
    X,
    Paperclip,
    Plus,
    Loader2,
    Trash2,
    Calendar,
    User,
    ChevronDown,
    FileText,
    Image as ImageIcon,
    FileMinus,
    Download,
    Eye
} from 'lucide-react';
import {
    fetchThread,
    saveInteractionReplyData,
    deleteInteractionReply
} from '@/server/staff-portal/interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IMessage, ISaveReplyDataRequest, IFILESLISTdata } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface ViewReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: IMessage;
    roleFlg: string;
    userhrmE_Id: number;
}

export function ViewReplyModal({ isOpen, onClose, message, roleFlg, userhrmE_Id }: ViewReplyModalProps) {
    const [thread, setThread] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [files, setFiles] = useState<{ name: string; file: File | null }[]>([{ name: '', file: null }]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const [xlsxPreviewData, setXlsxPreviewData] = useState<any[][] | null>(null);
    const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

    const loadThread = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchThread(message.ISMINT_Id);
            if (res.success && res.data) {
                const rawThread = res.data.replylist || res.data.viewmessage || [];

                // Group records by Interaction + DateTime + ID to consolidate multiple attachments
                const grouped = rawThread.reduce((acc: any[], current: any) => {
                    const interaction = current.ISTINT_Interaction || current.ISMINT_Interaction;
                    const dateTime = current.ISTINT_DateTime || current.ISMINT_DateTime;
                    const istintId = current.ISTINT_Id;

                    // Find if this record belongs to an already added transaction
                    // We check ID first (precise), then fallback to content+time if ID is missing (robust)
                    const existing = acc.find(item =>
                        (istintId && item.ISTINT_Id === istintId) ||
                        (!istintId && item.ISTINT_Interaction === interaction && item.ISTINT_DateTime === dateTime)
                    );

                    // Extract attachment from current record
                    const currentUrl = current.ISTINT_Attachment || current.ISMID_FilePath || current.ISMID_Filepath;
                    const currentName = current.ISMID_Filename || (currentUrl ? currentUrl.split('/').pop() : 'Attachment');

                    if (existing) {
                        // If it's the same transaction, merge the attachment
                        if (currentUrl && !existing.attachments.some((a: any) => a.url === currentUrl)) {
                            existing.attachments.push({ url: currentUrl, name: currentName });
                        }
                        return acc;
                    } else {
                        // New transaction - initialize attachments
                        const attachments: any[] = [];

                        // Check for nested attachment arrays (common in some formats)
                        const nestedFiles = current.FILESLISTdata || current.attachmentlist || current.images_paths || [];
                        if (Array.isArray(nestedFiles)) {
                            for (const f of nestedFiles) {
                                const url = typeof f === 'string' ? f : (f.ISMID_Filepath || f.ISMID_FilePath || f.url);
                                const name = typeof f === 'string' ? url.split('/').pop() : (f.ISMID_Filename || f.name || url.split('/').pop());
                                if (url) attachments.push({ url, name });
                            }
                        }

                        // Add top-level attachment if not redundant
                        if (currentUrl && !attachments.some(a => a.url === currentUrl)) {
                            attachments.push({ url: currentUrl, name: currentName });
                        }

                        return [...acc, { ...current, attachments }];
                    }
                }, []);

                setThread(grouped);
            }
        } catch (error) {
            toast.error('Failed to load message thread');
        } finally {
            setIsLoading(false);
        }
    }, [message.ISMINT_Id]);

    useEffect(() => {
        if (isOpen) {
            loadThread();
        }
    }, [isOpen, loadThread]);

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const newFiles = [...files];
            newFiles[index] = { name: file.name, file: file };
            setFiles(newFiles);
        }
    };

    const addNewFile = () => setFiles([...files, { name: '', file: null }]);
    const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

    const handleReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply message');
            return;
        }

        setIsSubmitting(true);
        try {
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

            const payload: ISaveReplyDataRequest = {
                ISMINT_Id: message.ISMINT_Id,
                ISTINT_Interaction: replyText,
                ISTINT_MACAddress: '00-00-00-00-00-00',
                ISMINT_ISPIPAddress: '127.0.0.1',
                FILESLISTdata: uploadedFiles,
                images_paths: uploadedFiles.map(f => f.ISMID_Filepath)
            };

            const res = await saveInteractionReplyData(payload);
            if (res.success) {
                toast.success(res.message || 'Reply sent successfully');
                setReplyText('');
                setFiles([{ name: '', file: null }]);
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

    const handleDeleteReply = async (ISTINT_Id: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        try {
            const res = await deleteInteractionReply(ISTINT_Id);
            if (res.success) {
                toast.success(res.message || 'Reply deleted');
                loadThread();
            } else {
                toast.error(res.message || 'Failed to delete reply');
            }
        } catch (error) {
            toast.error('Failed to delete reply');
        }
    };
    const handleDownload = () => {
        if (previewFile) {
            saveAs(previewFile.url, previewFile.name);
        }
    };

    const handleViewFile = async (url: string, fileName: string) => {
        if (!url) return;

        setIsLoading(true);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);
            const fileType = blob.type;

            setPreviewFile({ url: fileUrl, name: fileName, type: fileType });

            const isExcel = fileName.toLowerCase().endsWith('.xlsx') ||
                fileName.toLowerCase().endsWith('.xls') ||
                fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                fileType === 'application/vnd.ms-excel';

            const isWord = fileName.toLowerCase().endsWith('.docx') ||
                fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                fileType === 'application/msword';

            if (isExcel) {
                const arrayBuffer = await blob.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setXlsxPreviewData(jsonData as any[][]);
            } else {
                setXlsxPreviewData(null);
                setDocxPreviewHtml(null);
            }
        } catch (error) {
            toast.error('Failed to load file preview');
            window.open(url, '_blank');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl h-[90vh] flex flex-col">
                <DialogHeader className="bg-[#1e40af] p-6 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black tracking-tight">{message.ISMINT_Subject}</DialogTitle>
                                <div className="flex items-center gap-3 mt-1 opacity-80 text-xs font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {message.Sender}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(message.ISMINT_DateTime), 'dd MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    <ScrollArea className="flex-1 p-8">
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
                                                <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider border-r border-[#3b82f6]/30 text-center w-[180px]">Date</th>
                                                <th className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-center w-[80px]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[12px] font-bold text-slate-600">
                                            {/* Replies */}
                                            {thread.map((msg, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-4 text-center border-r border-slate-100 italic text-slate-400">{idx + 1}</td>
                                                    <td className="px-4 py-4 border-r border-slate-100 leading-relaxed font-medium">
                                                        {msg.ISTINT_Interaction || msg.ISMINT_Interaction}
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-100 text-center">
                                                        <div className="flex flex-wrap justify-center gap-2">
                                                            {msg.attachments?.map((at: any, i: number) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleViewFile(at.url, at.name)}
                                                                    className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
                                                                    title={at.name}
                                                                >
                                                                    <Paperclip className="h-4 w-4" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-100 text-center text-[11px] uppercase tracking-tighter">
                                                        {msg.Sender}
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-[11px] text-slate-500 border-r border-slate-100">
                                                        {format(new Date(msg.ISTINT_DateTime || msg.ISMINT_DateTime), 'dd/MM/yyyy hh:mm a')}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {(msg.ISTINT_ComposedById === userhrmE_Id || msg.ISMINT_ComposedById === userhrmE_Id) && (
                                                            <button
                                                                onClick={() => handleDeleteReply(msg.ISTINT_Id)}
                                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all shadow-sm border border-blue-100"
                                                                title="Delete Reply"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Reply Section */}
                    <div className="shrink-0 bg-white border-t-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] p-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="relative group">
                                        <Textarea
                                            placeholder="Type your reply..."
                                            className="min-h-[100px] bg-accent/5 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 transition-all rounded-2xl p-4 text-sm font-medium resize-none"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground/40">Press Shift+Enter for new line</span>
                                        </div>
                                    </div>

                                    {/* File Attachments in Reply - Legacy Table Style */}
                                    <div className="overflow-hidden border rounded-none mt-2">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-[#1a5f7a] text-white text-[10px] font-bold uppercase">
                                                <tr>
                                                    <th className="px-4 py-1.5 text-center border-r border-white/10 w-12">SL NO</th>
                                                    <th className="px-4 py-1.5 border-r border-white/10 w-28">Upload File</th>
                                                    <th className="px-4 py-1.5 border-r border-white/10">File Name</th>
                                                    <th className="px-4 py-1.5 border-r border-white/10 w-16 text-center">View</th>
                                                    <th className="px-4 py-1.5 text-center w-16">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {files.map((file, idx) => (
                                                    <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-1.5 text-center border-r font-bold text-xs">{idx + 1}</td>
                                                        <td className="px-4 py-1.5 border-r relative">
                                                            <Button size="sm" variant="outline" className="h-6 w-full text-[9px] font-bold bg-[#1e40af] text-white border-none shadow-sm cursor-pointer relative overflow-hidden">
                                                                Browse
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                    onChange={(e) => handleFileChange(idx, e)}
                                                                />
                                                            </Button>
                                                        </td>
                                                        <td className="px-4 py-1.5 border-r">
                                                            <div className="h-6 border rounded-none bg-background flex items-center px-2">
                                                                <span className="text-[10px] font-medium truncate max-w-[200px]">
                                                                    {file.name || ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-1.5 text-center border-r">
                                                            {file.name && file.file ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 text-primary hover:bg-primary/10"
                                                                    onClick={() => {
                                                                        const url = URL.createObjectURL(file.file!);
                                                                        handleViewFile(url, file.name);
                                                                    }}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </Button>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-4 py-1.5 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 text-primary hover:bg-primary/10 rounded-none border"
                                                                    onClick={addNewFile}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                                {files.length > 1 && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-5 w-5 text-red-500 hover:bg-red-50 rounded-none border"
                                                                        onClick={() => removeFile(idx)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <Button
                                    className="h-10 px-6 rounded-md bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-black text-xs uppercase tracking-widest shadow-md transition-all self-end"
                                    onClick={handleReply}
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
                </div>
            </DialogContent>
            {/* Unified Preview Modal */}
            <Dialog open={!!previewFile} onOpenChange={(open) => {
                if (!open) {
                    setPreviewFile(null);
                    setXlsxPreviewData(null);
                    setDocxPreviewHtml(null);
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-primary text-white flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-lg font-bold truncate pr-8">{previewFile?.name}</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setPreviewFile(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-muted/20 p-8 flex items-center justify-center min-h-[300px]">
                        {previewFile?.url && (
                            previewFile.type?.startsWith('video/') ? (
                                <video
                                    src={previewFile.url}
                                    controls
                                    className="max-w-full max-h-full rounded-lg shadow-xl"
                                    autoPlay
                                />
                            ) : previewFile.type?.startsWith('audio/') ? (
                                <div className="flex flex-col items-center gap-6 w-full max-w-md bg-background p-10 rounded-2xl shadow-xl border">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-primary" />
                                    </div>
                                    <audio
                                        src={previewFile.url}
                                        controls
                                        className="w-full"
                                        autoPlay
                                    />
                                    <p className="text-sm font-bold text-muted-foreground">{previewFile.name}</p>
                                </div>
                            ) : (previewFile.type === 'application/pdf' || previewFile.name.toLowerCase().endsWith('.docx') || previewFile.name.toLowerCase().endsWith('.doc')) ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-full min-h-[600px] border-none rounded-lg"
                                    title={previewFile.name}
                                />
                            ) : xlsxPreviewData ? (
                                <div className="w-full h-full min-h-[500px] bg-background rounded-lg border overflow-hidden flex flex-col shadow-inner">
                                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Excel Preview (First 50 Rows)</span>
                                        <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">XLSX DATA</Badge>
                                    </div>
                                    <ScrollArea className="flex-1 w-full overflow-auto">
                                        <div className="p-4">
                                            <table className="w-full border-collapse text-[11px] font-medium">
                                                <tbody>
                                                    {xlsxPreviewData.slice(0, 50).map((row, rIdx) => (
                                                        <tr key={rIdx} className={cn("hover:bg-muted/30 transition-colors", rIdx === 0 && "bg-muted/80 font-bold border-b-2")}>
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
                                                <div className="p-4 text-center text-muted-foreground text-xs font-bold bg-muted/10 mt-2 border-t border-dashed">
                                                    Showing first 50 rows. Download to see all {xlsxPreviewData.length} rows.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : previewFile.type?.startsWith('image/') ? (
                                <img
                                    src={previewFile.url}
                                    alt={previewFile.name}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-6 w-full max-w-md bg-background p-10 rounded-2xl shadow-xl border">
                                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="font-bold">Document Preview Unavailable</h4>
                                        <p className="text-xs text-muted-foreground">This file type ({previewFile.name.split('.').pop()?.toUpperCase()}) cannot be viewed directly in the browser.</p>
                                    </div>
                                    <Button
                                        className="w-full h-12 bg-primary hover:bg-primary/90 font-bold gap-2"
                                        onClick={handleDownload}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download to View
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                    <DialogFooter className="p-6 bg-muted/30 border-t flex items-center justify-between sm:justify-between px-8">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
                            {previewFile?.name}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setPreviewFile(null)}
                                className="rounded-full px-8 font-bold border-2 hover:bg-slate-50 uppercase tracking-widest text-xs"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleDownload}
                                className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full font-bold uppercase tracking-widest text-xs gap-3 shadow-lg hover:shadow-primary/20 transition-all border-none"
                            >
                                <Download className="h-4 w-4" />
                                {previewFile?.type?.startsWith('video/') ? 'Download Video' :
                                    previewFile?.type?.startsWith('audio/') ? 'Download Audio' :
                                        previewFile?.type?.startsWith('image/') ? 'Download Image' :
                                            previewFile?.type === 'application/pdf' ? 'Download PDF' : 'Download File'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

// Exporting the component as a named export is preferred for this pattern
