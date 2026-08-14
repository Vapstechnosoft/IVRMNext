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
import type { IHomeWorkAttachment } from '@/types/upload/reports/homework-upload-report';
import { downloadFile } from '@/lib/utils';

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: IHomeWorkAttachment[];
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            HOMEWORK ATTACHMENT DETAILS
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto py-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-16 text-center">SLNO</TableHead>
                                        <TableHead>File Name/URL</TableHead>
                                        <TableHead className="text-center w-32">Attachment View</TableHead>
                                        <TableHead className="text-center w-24">Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((attachment, index) => {
                                        const isHyperlink = attachment.ihW_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell className="font-medium truncate max-w-xs" title={attachment.ihwatT_FileName}>
                                                    {attachment.ihwatT_FileName}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isHyperlink ? (
                                                        <span className="text-muted-foreground text-xs">---</span>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePreview(attachment.ihwatT_Attachment)}
                                                            className="text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-1 mx-auto"
                                                        >
                                                            <Eye className="h-4 w-4" /> View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isHyperlink ? (
                                                        <Ban className="h-4 w-4 mx-auto text-muted-foreground" />
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => downloadFile(attachment.ihwatT_Attachment, attachment.ihwatT_FileName)}
                                                            className="text-primary hover:bg-primary/5 h-8 w-8 rounded-full p-0"
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

                    <div className="pt-4 border-t flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-primary">Info :</span>
                            <span className="text-muted-foreground italic">Document preview (PDF, Word, Excel) is now enabled. For other files, use download.</span>
                        </div>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Media Preview Dialog */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
                <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                        <DialogTitle>Media Preview</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 bg-slate-900 flex items-center justify-center p-4">
                        {previewType === 'image' ? (
                            <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
                        ) : previewType === 'video' ? (
                            <video src={previewUrl!} controls className="max-w-full max-h-full shadow-2xl">
                                Your browser does not support the video tag.
                            </video>
                        ) : previewType === 'audio' ? (
                            <audio src={previewUrl!} controls className="w-full max-w-md">
                                Your browser does not support the audio tag.
                            </audio>
                        ) : previewType === 'office' ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                                className="w-full h-full rounded shadow-2xl bg-white border-none"
                                title="Document Preview"
                            />
                        ) : (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
                                <Ban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="font-semibold text-lg mb-2">Preview Not Available</h3>
                                <p className="text-muted-foreground mb-4">This file type ({previewType}) cannot be previewed online.</p>
                                <Button asChild>
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
