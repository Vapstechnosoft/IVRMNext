'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, Ban, X } from 'lucide-react';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';

interface DetailsViewProps {
    rowData: IClassWorkDetails;
    onClose: () => void;
}

export default function DetailsView({ rowData, onClose }: DetailsViewProps) {
    // Combine both arrays if they exist, otherwise use the single file/att from rowData
    const fileAttachments = rowData.icW_FilePath_Array || (rowData.icW_FilePath ? [{ icW_FilePath: rowData.icW_FilePath, fileName: rowData.icW_Attachment || 'File' }] : []);
    const urlAttachments = rowData.icW_Attachment_Array || (rowData.icW_Attachment?.startsWith('http') ? [{ icW_FilePath: rowData.icW_Attachment, fileName: rowData.icW_Attachment }] : []);

    const allAttachments = [...fileAttachments, ...urlAttachments];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none transition-all duration-200">
                {/* Header with custom blue background */}
                <DialogHeader className="bg-[#005596] p-4 flex flex-row items-center justify-between text-white space-y-0 relative">
                    <DialogTitle className="text-sm font-bold uppercase tracking-wider">
                        CLASSWORK ATTACHMENT DETAILS
                    </DialogTitle>
                    <button 
                        onClick={onClose} 
                        className="hover:bg-white/20 p-1 rounded transition-colors absolute right-4 top-4"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </DialogHeader>

                <div className="p-4 space-y-6 bg-white">
                    {/* Table Section */}
                    <div className="overflow-hidden border border-slate-200 rounded-sm shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#005596] text-white">
                                    <th className="border border-white/20 p-2.5 text-xs font-bold uppercase w-16 text-center">SLNO</th>
                                    <th className="border border-white/20 p-2.5 text-xs font-bold uppercase text-left">File Name/URL</th>
                                    <th className="border border-white/20 p-2.5 text-xs font-bold uppercase w-28 text-center">View/Click</th>
                                    <th className="border border-white/20 p-2.5 text-xs font-bold uppercase w-28 text-center">Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAttachments.length > 0 ? (
                                    allAttachments.map((item, index) => {
                                        const isUrl = item.icW_FilePath.startsWith('http');
                                        return (
                                            <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                <td className="border border-slate-200 p-2.5 text-center text-sm font-medium">{index + 1}</td>
                                                <td className="border border-slate-200 p-2.5 text-sm truncate max-w-md">
                                                    {item.fileName || item.icW_FilePath}
                                                </td>
                                                <td className="border border-slate-200 p-2.5 text-center">
                                                    {isUrl ? (
                                                        <a 
                                                            href={item.icW_FilePath} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-xs font-bold uppercase"
                                                        >
                                                            Click Here
                                                        </a>
                                                    ) : (
                                                        <button 
                                                            onClick={() => window.open(item.icW_FilePath, '_blank')}
                                                            className="text-blue-600 hover:text-blue-800 p-1 flex items-center justify-center w-full"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="border border-slate-200 p-2.5 text-center">
                                                    {!isUrl ? (
                                                        <a 
                                                            href={item.icW_FilePath} 
                                                            download={item.fileName}
                                                            className="text-blue-600 hover:text-blue-800 p-1 flex items-center justify-center w-full"
                                                            title="Download"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    ) : (
                                                        <div className="flex justify-center">
                                                            <Ban className="h-4 w-4 text-slate-300" />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400 italic text-sm">
                                            No attachments found for this classwork.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section */}
                    <div className="space-y-4 pt-2">
                         <p className="text-[#931d22] text-xs font-bold italic">
                            Note : Excel, ppt and Document Can't View. only Download
                        </p>

                        <div className="flex justify-end pt-2">
                            <Button 
                                onClick={onClose}
                                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-8 shadow-sm h-8 rounded-sm active:scale-95 transition-all"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
