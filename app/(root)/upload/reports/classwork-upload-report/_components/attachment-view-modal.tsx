'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Download, Eye, Ban, X } from 'lucide-react';
import { useState } from 'react';
import type { IClassWorkAttachment } from '@/types/upload/reports/classwork-upload-report';
import { downloadFile } from '@/lib/utils';

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: IClassWorkAttachment[];
}

export function AttachmentViewModal({ isOpen, onClose, attachments }: AttachmentViewModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);

    const getFileType = (url: string) => {
        try {
            const path = url.split('?')[0];
            const extension = path.split('.').pop()?.toLowerCase() || '';
            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
            if (['mp4', 'webm'].includes(extension)) return 'video';
            if (['mp3', 'wav'].includes(extension)) return 'audio';
            if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) return 'office';
            return extension;
        } catch (error) {
            return 'unknown';
        }
    };

    const handlePreview = (url: string) => {
        let type = getFileType(url);
        // Fail-safe: Force office viewer for any URL that looks like a PDF
        if (url.split('?')[0].toLowerCase().endsWith('.pdf')) {
            type = 'office';
        }
        setPreviewUrl(url);
        setPreviewType(type || 'unknown');
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                            CLASSWORK ATTACHMENT DETAILS
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto py-4">
                        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-900">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-16 text-center text-white font-bold uppercase text-[10px] tracking-widest">SLNO</TableHead>
                                        <TableHead className="text-white font-bold uppercase text-[10px] tracking-widest">File Name/URL</TableHead>
                                        <TableHead className="text-center w-32 text-white font-bold uppercase text-[10px] tracking-widest">View</TableHead>
                                        <TableHead className="text-center w-24 text-white font-bold uppercase text-[10px] tracking-widest">Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((attachment, index) => {
                                        const isHyperlink = attachment.icW_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                                                <TableCell className="font-semibold text-slate-700 truncate max-w-xs" title={attachment.icwatT_FileName}>
                                                    {attachment.icwatT_FileName}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isHyperlink ? (
                                                        <span className="text-muted-foreground text-[10px] font-bold opacity-30 tracking-widest uppercase">---</span>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePreview(attachment.icwatT_Attachment)}
                                                            className="text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-1 mx-auto transition-all"
                                                        >
                                                            <Eye className="h-4 w-4" /> View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isHyperlink ? (
                                                        <Ban className="h-4 w-4 mx-auto text-slate-300" />
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => downloadFile(attachment.icwatT_Attachment, attachment.icwatT_FileName)}
                                                            className="text-primary hover:scale-110 transition-transform h-8 w-8 rounded-full hover:bg-primary/5 p-0"
                                                        >
                                                            <Download className="h-4 w-4 mx-auto" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-black text-primary uppercase text-[10px] tracking-wider px-2 py-0.5 bg-primary/5 rounded">Info :</span>
                            <span className="text-muted-foreground italic text-xs font-medium">Document preview (PDF, Word, Excel) is now enabled. For other files, use download.</span>
                        </div>
                        <Button variant="outline" onClick={onClose} className="rounded-full px-6 font-bold uppercase text-[11px] tracking-widest h-9 border-slate-200 hover:bg-slate-50">Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Media Preview Dialog */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
                <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <DialogHeader className="p-4 border-b bg-white flex flex-row items-center justify-between">
                        <DialogTitle className="font-black text-slate-800 uppercase tracking-tight">Media Preview</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)} className="rounded-full hover:bg-slate-100">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 bg-slate-900 flex items-center justify-center p-4">
                        {previewType === 'image' ? (
                            <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in duration-300" />
                        ) : previewType === 'video' ? (
                            <video src={previewUrl!} controls className="max-w-full max-h-full shadow-2xl rounded-lg">
                                Your browser does not support the video tag.
                            </video>
                        ) : previewType === 'audio' ? (
                            <audio src={previewUrl!} controls className="w-full max-w-md">
                                Your browser does not support the audio tag.
                            </audio>
                        ) : previewType === 'office' ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                                className="w-full h-full rounded-lg shadow-2xl bg-white border-none"
                                title="Document Preview"
                            />
                        ) : (
                            <div className="text-center p-12 bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md animate-in slide-in-from-bottom duration-500">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Ban className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="font-black text-slate-800 text-xl mb-3 uppercase tracking-tight">Preview Not Available</h3>
                                <p className="text-muted-foreground mb-8 text-sm font-medium">This file type ({previewType}) cannot be previewed online. Please download to view.</p>
                                <Button asChild className="rounded-full h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    <a href={previewUrl!} download className="flex items-center gap-2">
                                        <Download className="h-4 w-4" /> Download File
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
