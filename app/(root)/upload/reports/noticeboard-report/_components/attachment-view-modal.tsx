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
import type { INoticeBoardAttachment } from '@/types/upload/reports/noticeboard-report';
import { downloadFile } from '@/lib/utils';

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: INoticeBoardAttachment[];
}

export function AttachmentViewModal({ isOpen, onClose, attachments }: AttachmentViewModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const getFileType = (url: string) => {
        try {
            const path = url.split('?')[0];
            const extension = path.split('.').pop()?.toLowerCase() || '';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
            if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
            if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
            if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) return 'office';
            return extension;
        } catch (error) {
            return 'unknown';
        }
    };

    const handlePreview = (url: string, fileName: string) => {
        const type = getFileType(url);
        setPreviewUrl(url);
        setPreviewType(type);
        setPreviewName(fileName);
    };

    const closePreview = () => {
        setPreviewUrl(null);
        setPreviewType(null);
        setPreviewName(null);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight">Notice Board Attachments</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto py-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center">SL NO</TableHead>
                                        <TableHead>File Name/URL</TableHead>
                                        <TableHead className="text-center w-32">View/Click</TableHead>
                                        <TableHead className="text-center w-24">Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((attachment, index) => {
                                        const isHyperlink = attachment.intB_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell className="max-w-xs truncate font-medium" title={attachment.intbfL_FileName}>
                                                    {attachment.intbfL_FileName}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isHyperlink ? (
                                                        <a
                                                            href={attachment.intbfL_FilePath}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline text-xs font-bold"
                                                        >
                                                            Click Here
                                                        </a>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePreview(attachment.intbfL_FilePath, attachment.intbfL_FileName)}
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
                                                            onClick={() => downloadFile(attachment.intbfL_FilePath, attachment.intbfL_FileName)}
                                                            className="h-9 w-9 rounded-md text-primary hover:bg-accent hover:text-accent-foreground p-0"
                                                        >
                                                            <Download className="h-4 w-4 mx-auto" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {attachments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">
                                                No attachments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-bold text-primary mr-1 italic">Info:</span> Document preview (PDF, Word, Excel) is now enabled.
                        </p>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-none shadow-2xl">
                    <DialogHeader className="p-4 border-b bg-white flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="truncate pr-8 font-bold text-slate-800">{previewName}</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={closePreview} className="rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden bg-slate-900 flex items-center justify-center p-4">
                        {previewType === 'image' ? (
                            <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
                        ) : previewType === 'video' ? (
                            <video src={previewUrl!} controls className="max-w-full max-h-full shadow-2xl">
                                Your browser does not support the video tag.
                            </video>
                        ) : previewType === 'audio' ? (
                            <audio src={previewUrl!} controls className="w-full max-w-md bg-white rounded-full p-2">
                                Your browser does not support the audio element.
                            </audio>
                        ) : previewType === 'office' ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                                className="w-full h-full rounded shadow-2xl bg-white border-none"
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
