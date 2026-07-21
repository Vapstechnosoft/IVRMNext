'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetStudentDocsOnly } from '@/hooks/admission/preadmission/transactions/use-pre-meeting-schedule';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, X } from 'lucide-react';
import { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import Image from 'next/image';

interface StudentDocumentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    record: IPreMeetingSchedule | null;
}

export default function StudentDocumentViewer({ isOpen, onClose, record }: StudentDocumentViewerProps) {
    const { mutate: getDocs, isPending } = useGetStudentDocsOnly();
    const [documents, setDocuments] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
        if (isOpen && record) {
            getDocs(
                { pasR_Id: record.pasr_id },
                {
                    onSuccess: (res: any) => {
                        if (res?.ddoc && res.ddoc.length > 0) {
                            const formattedDocs = res.ddoc.map((doc: any) => {
                                const ext = doc.document_Path.split('.').pop()?.toLowerCase();
                                return {
                                    ...doc,
                                    filetype: ext,
                                    isOfficeDoc: ['xlsx', 'xls', 'xlsm', 'docx', 'doc'].includes(ext || ''),
                                    isPdf: ext === 'pdf',
                                    isImage: ['jpg', 'jpeg', 'png', 'gif'].includes(ext || ''),
                                    viewPath: ['xlsx', 'xls', 'xlsm', 'docx', 'doc'].includes(ext || '')
                                        ? `https://view.officeapps.live.com/op/view.aspx?src=${doc.document_Path}`
                                        : doc.document_Path
                                };
                            });
                            setDocuments(formattedDocs);
                            setCurrentIndex(0);
                            setZoom(100);
                        } else {
                            setDocuments([]);
                        }
                    }
                }
            );
        } else {
            setDocuments([]);
        }
    }, [isOpen, record, getDocs]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % documents.length);
        setZoom(100);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + documents.length) % documents.length);
        setZoom(100);
    };

    const currentDoc = documents[currentIndex];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-800 flex justify-between items-center pr-8">
                        <span>Documents for {record?.studentname}</span>
                        {documents.length > 0 && (
                            <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-3 py-1 rounded-full">
                                {currentIndex + 1} of {documents.length}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {currentDoc ? currentDoc.amsmD_DocumentName : 'No documents available'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 relative bg-slate-100/50 rounded-lg border overflow-hidden flex flex-col">
                    {isPending ? (
                        <div className="flex-1 flex items-center justify-center">
                            <span className="animate-pulse font-medium text-slate-500">Loading documents...</span>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <span className="text-slate-500">No documents found for this student.</span>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="h-12 bg-white border-b flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    {currentDoc.isImage && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                                                <ZoomOut className="w-4 h-4" />
                                            </Button>
                                            <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
                                            <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                                                <ZoomIn className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={currentDoc.document_Path} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 relative overflow-auto bg-slate-50 flex items-center justify-center p-4">
                                {currentDoc.isImage && (
                                    <div 
                                        className="relative transition-transform duration-200 ease-in-out"
                                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={currentDoc.viewPath} 
                                            alt={currentDoc.amsmD_DocumentName}
                                            className="max-w-full max-h-[70vh] object-contain shadow-sm border rounded bg-white"
                                        />
                                    </div>
                                )}
                                
                                {currentDoc.isPdf && (
                                    <iframe 
                                        src={currentDoc.viewPath} 
                                        className="w-full h-full rounded shadow-sm border bg-white"
                                        title={currentDoc.amsmD_DocumentName}
                                    />
                                )}

                                {currentDoc.isOfficeDoc && (
                                    <iframe 
                                        src={currentDoc.viewPath} 
                                        className="w-full h-full rounded shadow-sm border bg-white"
                                        title={currentDoc.amsmD_DocumentName}
                                    />
                                )}

                                {!currentDoc.isImage && !currentDoc.isPdf && !currentDoc.isOfficeDoc && (
                                    <div className="text-center p-8 bg-white rounded shadow-sm border">
                                        <p className="text-slate-500 mb-4">Preview not available for this file type ({currentDoc.filetype})</p>
                                        <Button asChild>
                                            <a href={currentDoc.document_Path} target="_blank" rel="noopener noreferrer">
                                                Download File
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Overlays */}
                            {documents.length > 1 && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10 opacity-70 hover:opacity-100"
                                        onClick={handlePrev}
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10 opacity-70 hover:opacity-100"
                                        onClick={handleNext}
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
