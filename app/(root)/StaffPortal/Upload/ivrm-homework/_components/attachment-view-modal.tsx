'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Download, ExternalLink, FileText, Music, Video, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Attachment {
    ihwatT_FileName: string;
    ihwatT_Attachment: string;
    ihW_Attachment?: string;
    ihW_Id?: number;
}

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: Attachment[];
    title?: string;
}

export default function AttachmentViewModal({
    isOpen,
    onClose,
    attachments,
    title = 'Homework Attachment Details'
}: AttachmentViewModalProps) {
    const [previewItem, setPreviewItem] = useState<Attachment | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
        if (['mp4', 'wmv', 'mov', 'avi'].includes(ext || '')) return 'video';
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
        if (ext === 'pdf') return 'pdf';
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) return 'doc';
        return 'other';
    };

    const handlePreview = (item: Attachment) => {
        const type = getFileType(item.ihwatT_Attachment);
        if (type === 'doc') {
            window.open(item.ihwatT_Attachment, '_blank');
            return;
        }
        setPreviewItem(item);
        setIsPreviewOpen(true);
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='text-blue-700 font-bold'>{title}</DialogTitle>
                    </DialogHeader>

                    <div className='mt-4'>
                        <Table>
                            <TableHeader className='bg-blue-50'>
                                <TableRow>
                                    <TableHead className='w-12 text-center'>SL NO</TableHead>
                                    <TableHead>File Name / URL</TableHead>
                                    <TableHead className='text-center'>View / Click</TableHead>
                                    <TableHead className='text-center'>Download</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attachments.length > 0 ? (
                                    attachments.map((item, index) => {
                                        const isLink = item.ihW_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className='text-center'>{index + 1}</TableCell>
                                                <TableCell className='max-w-xs truncate'>
                                                    {item.ihwatT_FileName}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isLink ? (
                                                        <a
                                                            href={item.ihwatT_Attachment}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            className='text-blue-600 hover:underline flex items-center justify-center gap-1'
                                                        >
                                                            Click Here <ExternalLink className='h-3 w-3' />
                                                        </a>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handlePreview(item)}
                                                            className='text-blue-600 hover:text-blue-800'
                                                        >
                                                            <Eye className='h-4 w-4 mr-1' /> View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isLink ? (
                                                        <span className='text-gray-400'>---</span>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handleDownload(item.ihwatT_Attachment, item.ihwatT_FileName)}
                                                            className='text-blue-600 hover:text-blue-800'
                                                        >
                                                            <Download className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className='text-center py-8 text-gray-500'>
                                            No attachments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='mt-6 border-t pt-4 text-xs italic text-gray-600'>
                        <span className='font-bold text-red-500'>Note:</span> Excel, PPT, and Word documents cannot be viewed online. They will be downloaded or opened in a new tab.
                    </div>
                </DialogContent>
            </Dialog>

            {/* In-browser Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className='max-w-5xl h-[85vh] flex flex-col p-2 bg-slate-900 border-none'>
                    <DialogHeader className='p-4 flex flex-row items-center justify-between border-b border-white/10'>
                        <DialogTitle className='text-white truncate pr-8'>
                            {previewItem?.ihwatT_FileName}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className='flex-1 relative overflow-hidden flex items-center justify-center'>
                        {previewItem && (
                            <>
                                {getFileType(previewItem.ihwatT_Attachment) === 'image' && (
                                    <div className='w-full h-full p-4 flex items-center justify-center bg-checkered'>
                                        <img 
                                            src={previewItem.ihwatT_Attachment} 
                                            alt={previewItem.ihwatT_FileName} 
                                            className='max-h-full max-w-full object-contain shadow-2xl rounded-sm'
                                        />
                                    </div>
                                )}
                                
                                {getFileType(previewItem.ihwatT_Attachment) === 'video' && (
                                    <div className='w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden'>
                                        <video 
                                            controls 
                                            autoPlay 
                                            className='w-full h-full'
                                            key={previewItem.ihwatT_Attachment}
                                        >
                                            <source src={previewItem.ihwatT_Attachment} type='video/mp4' />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}
                                
                                {getFileType(previewItem.ihwatT_Attachment) === 'audio' && (
                                    <div className='bg-white/10 p-12 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center gap-6'>
                                        <div className='w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center animate-pulse'>
                                            <Music className='h-12 w-12 text-white' />
                                        </div>
                                        <audio 
                                            controls 
                                            autoPlay 
                                            className='w-80 shadow-lg'
                                            key={previewItem.ihwatT_Attachment}
                                        >
                                            <source src={previewItem.ihwatT_Attachment} type='audio/mpeg' />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                                
                                {getFileType(previewItem.ihwatT_Attachment) === 'pdf' && (
                                    <iframe 
                                        src={`${previewItem.ihwatT_Attachment}#toolbar=0`}
                                        className='w-full h-full rounded-sm'
                                        title='PDF Preview'
                                    />
                                )}

                                {getFileType(previewItem.ihwatT_Attachment) === 'other' && (
                                    <div className='text-white flex flex-col items-center gap-4'>
                                        <FileText className='h-20 w-20 text-blue-400' />
                                        <p className='text-lg'>Preview not supported for this file type.</p>
                                        <Button asChild>
                                            <a href={previewItem.ihwatT_Attachment} download>
                                                <Download className='h-4 w-4 mr-2' /> Download to View
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className='p-4 border-t border-white/10 flex justify-end gap-2'>
                        <Button 
                            variant='outline' 
                            size='sm' 
                            onClick={() => setIsPreviewOpen(false)}
                            className='bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white'
                        >
                            Close Preview
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
