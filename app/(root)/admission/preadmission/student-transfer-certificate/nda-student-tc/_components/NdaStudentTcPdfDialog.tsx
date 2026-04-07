'use client';

import { forwardRef, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NdaStudentTcPdfDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfData: any[]; // Legacy uses an array 'studenttcpdf'
    isLoading?: boolean;
}

export function NdaStudentTcPdfDialog({ open, onOpenChange, pdfData, isLoading }: NdaStudentTcPdfDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `TC_Report_${pdfData?.[0]?.studentname || 'Student'}`,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
                <DialogHeader className="p-8 bg-gradient-to-r from-indigo-600 to-violet-700 text-white relative">
                    <div className="flex justify-between items-center z-10 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight leading-none mb-1 uppercase">Transfer Certificate Preview</DialogTitle>
                                <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-widest leading-none">Official Document System | NDA Format</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handlePrint()}
                                disabled={isLoading || !pdfData?.length}
                                className="bg-white hover:bg-white/90 text-indigo-600 rounded-full font-black shadow-lg hover:shadow-white/20 px-6 h-10 transition-all"
                            >
                                <Printer className="mr-2 h-4 w-4" /> PRINT PDF
                            </Button>
                            <DialogClose asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                    <X className="h-6 w-6" />
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-100/50 p-6 md:p-12 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                            <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Synchronizing Records...</p>
                        </div>
                    ) : pdfData?.length > 0 ? (
                        <div className="flex justify-center">
                            <div className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all bg-white overflow-hidden ring-1 ring-slate-200 rounded-sm">
                                <div ref={printRef} className="print-area bg-white p-[25.4mm] text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
                                    <style jsx global>{`
                                        @media print {
                                            .print-area {
                                                padding: 0 !important;
                                                margin: 0 !important;
                                            }
                                            @page {
                                                size: A4;
                                                margin: 0;
                                            }
                                        }
                                    `}</style>

                                    {pdfData.map((report, idx) => (
                                        <div key={idx} className={idx > 0 ? "page-break-before-always" : ""}>
                                            <div className="mt-32">
                                                <h1 className="text-center text-3xl font-black tracking-widest uppercase mb-12">
                                                    <span className="border-b-2 border-black pb-1">Transfer Certificate</span>
                                                </h1>

                                                <div className="flex justify-between items-center px-6 mb-2 border-b border-black/10 pb-4">
                                                    <p className="text-xl font-bold">Admission Number: <span className="font-black text-2xl">{report.amsT_AdmNo}</span></p>
                                                    <p className="text-xl font-bold">Sl. No: <span className="font-black text-2xl">{report.astC_TCNO || '—'}</span></p>
                                                </div>

                                                <div className="space-y-6 pt-6 text-[18px]">
                                                    <GridRow index={1} label="Name of Pupil" value={report.studentname} />
                                                    <GridRow index={2} label="Father's Name" value={report.amsT_FatherName} />
                                                    <GridRow index={3} label="Mother's Name" value={report.amsT_MotherName} />
                                                    <GridRow index={4} label="Religion/Caste" value={`${report.religion} / ${report.caste}`} />
                                                    <GridRow index={5} label="Nationality" value={report.nationality} />
                                                    <GridRow index={6} label="Date of Birth" value={report.amsT_DOB ? format(new Date(report.amsT_DOB), 'dd-MMM-yyyy') : ''} />
                                                    <GridRow index={7} label="School Last Attended" value={report.last_school || 'N/A'} />
                                                    <GridRow index={8} label="Date Of Admission" value={report.amsT_Date ? format(new Date(report.amsT_Date), 'dd-MMM-yyyy') : ''} />
                                                    <GridRow index={9} label="Conduct" value={report.conduct || 'Good'} />
                                                    <GridRow index={10} label="Date Of Leaving" value={report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : ''} />
                                                    <GridRow index={11} label="Studying In" value={`${report.Last_Class_Studied} ${report.asmC_SectionName}`} />
                                                    {report.astC_Remarks && (
                                                        <GridRow index={12} label="Remarks" value={report.astC_Remarks} className="italic" />
                                                    )}
                                                </div>

                                                <div className="mt-16 px-6 py-8 border-y border-black/5 space-y-8">
                                                    <div className="flex justify-between items-center text-xl">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold opacity-60">PEN No. :</span>
                                                            <span className="font-black border-b border-black pb-1 px-4">{report.AMST_PENNo || '—'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold opacity-60">SATS No. :</span>
                                                            <span className="font-black border-b border-black pb-1 px-4 text-2xl tracking-widest">{report.govtno || '—'}</span>
                                                        </div>
                                                    </div>

                                                    <p className="mt-12 text-center text-xl italic font-serif opacity-80 pt-6">
                                                        "Certified that the above-mentioned information is in accordance with the school register."
                                                    </p>

                                                    <div className="mt-20 pt-16 flex justify-between items-end px-4">
                                                        <div className="text-xl">
                                                            <p className="font-bold opacity-60 mb-1 uppercase tracking-widest text-[11px]">Generation Date</p>
                                                            <p className="font-black text-2xl border-b-2 border-black/20 pb-1">{format(new Date(), 'dd-MMM-yyyy')}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="w-48 border-b-2 border-black mb-2" />
                                                            <p className="font-black text-2xl tracking-widest">PRINCIPAL</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                            <FileText className="h-16 w-16" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-sm text-center">Data mismatch detected.<br />Could not compile official certificate.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function GridRow({ index, label, value, className }: { index: number, label: string, value: string, className?: string }) {
    return (
        <div className="grid grid-cols-[36px_22px_220px_1fr] items-baseline">
            <div />
            <div className="font-bold text-slate-400">{index}</div>
            <div className="font-medium text-slate-600 italic">{label}</div>
            <div className={cn("font-black border-b border-dashed border-black/40 pb-0.5", className)}> :&nbsp;&nbsp;&nbsp;&nbsp;{value || '—'}</div>
        </div>
    );
}
