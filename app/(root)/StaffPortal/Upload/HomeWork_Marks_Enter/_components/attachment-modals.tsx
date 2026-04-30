'use client';

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
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, Info } from 'lucide-react';

interface StaffAttachmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: any[];
}

export function StaffAttachmentModal({ isOpen, onClose, attachments }: StaffAttachmentModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='text-xs font-black uppercase text-blue-800'>HomeWork Attachment Details</DialogTitle>
                </DialogHeader>
                <div className='bg-white rounded-md border overflow-hidden'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-slate-100 hover:bg-slate-100'>
                                <TableHead className='w-[50px] text-xs font-black text-slate-700 uppercase p-2 text-center'>SL</TableHead>
                                <TableHead className='text-xs font-black text-slate-700 uppercase p-2'>File Name / URL</TableHead>
                                <TableHead className='text-xs font-black text-slate-700 uppercase p-2 text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.length > 0 ? (
                                attachments.map((att, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center text-[11px] font-bold text-slate-500 p-2'>{index + 1}</TableCell>
                                        <TableCell className='text-[11px] font-medium text-slate-600 p-2'>{att.ihwatT_FileName || 'View Document'}</TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <div className='flex justify-center gap-2'>
                                                <Button size='sm' variant='ghost' className='h-7 px-2 text-blue-600 hover:bg-blue-50' asChild>
                                                    <a href={att.ihwatT_Attachment} target='_blank' rel='noopener noreferrer'>
                                                        <ExternalLink className='h-3.5 w-3.5 mr-1' />
                                                        VIEW
                                                    </a>
                                                </Button>
                                                {att.ihW_Attachment !== 'HyperLink' && (
                                                    <Button size='sm' variant='ghost' className='h-7 px-2 text-slate-600 hover:bg-slate-50' asChild>
                                                        <a href={att.ihwatT_Attachment} download={att.ihwatT_FileName}>
                                                            <Download className='h-3.5 w-3.5 mr-1' />
                                                            SAVE
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className='text-center p-4 text-[11px] font-bold text-slate-400 italic'>No attachments found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='bg-amber-50 border border-amber-200 p-2 rounded flex items-start gap-2 mt-2'>
                    <Info className='h-4 w-4 text-amber-600 mt-0.5' />
                    <p className='text-[10px] font-bold text-amber-700 uppercase italic'>Note: Documents (DOCX, XLSX, PPTX) may require downloading if your browser doesn't support direct preview.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface StudentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    uploads: any[];
}

export function StudentUploadModal({ isOpen, onClose, uploads }: StudentUploadModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle className='text-xs font-black uppercase text-green-800 font-black'>Student Upload Homework Details</DialogTitle>
                </DialogHeader>
                <div className='bg-white rounded-md border overflow-hidden'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-slate-100 hover:bg-slate-100'>
                                <TableHead className='w-[50px] text-xs font-black text-slate-700 uppercase p-2 text-center'>SL</TableHead>
                                <TableHead className='text-xs font-black text-slate-700 uppercase p-2'>Student File</TableHead>
                                <TableHead className='text-xs font-black text-slate-700 uppercase p-2 text-center'>Action</TableHead>
                                <TableHead className='text-xs font-black text-slate-700 uppercase p-2'>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploads.length > 0 ? (
                                uploads.map((up, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center text-[11px] font-bold text-slate-500 p-2'>{index + 1}</TableCell>
                                        <TableCell className='p-2'>
                                            <div className='flex flex-col'>
                                                <span className='text-[11px] font-bold text-slate-600 uppercase'>{up.ihwupL_FileName || 'Student-Work.pdf'}</span>
                                                <span className='text-[9px] font-medium text-slate-400'>{up.ihwupL_Date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <div className='flex justify-center gap-2'>
                                                <Button size='sm' variant='ghost' className='h-7 px-2 text-green-600 hover:bg-green-50' asChild>
                                                    <a href={up.ihwupL_Attachment} target='_blank' rel='noopener noreferrer'>
                                                        <ExternalLink className='h-3.5 w-3.5 mr-1' />
                                                        VIEW
                                                    </a>
                                                </Button>
                                                <Button size='sm' variant='ghost' className='h-7 px-2 text-slate-600 hover:bg-slate-50' asChild>
                                                    <a href={up.ihwupL_Attachment} download={up.ihwupL_FileName}>
                                                        <Download className='h-3.5 w-3.5 mr-1' />
                                                        SAVE
                                                    </a>
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-2 min-w-[150px]'>
                                            <p className='text-[11px] text-slate-600 italic'>{up.ihwuplatT_StaffRemarks || 'No remarks provided'}</p>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className='text-center p-4 text-[11px] font-bold text-slate-400 italic'>No student uploads found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
