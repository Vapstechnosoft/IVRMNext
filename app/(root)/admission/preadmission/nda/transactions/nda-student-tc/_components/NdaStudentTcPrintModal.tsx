'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Loader2 } from 'lucide-react';
import { NdaTcPrint } from '../../../reports/nda-transfer-certificate/_components/NdaTcPrint';

interface NdaStudentTcPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  isLoading?: boolean;
}

export function NdaStudentTcPrintModal({
  isOpen,
  onClose,
  data,
  isLoading,
}: NdaStudentTcPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `NDA_TC_${data?.lblstdname || 'Student'}`,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-[1000px] h-[90vh] overflow-hidden flex flex-col p-4 md:p-8 rounded-[2rem] border-none shadow-2xl bg-slate-50">
        <DialogHeader className="flex flex-row justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                   <Printer className="w-6 h-6" />
               </div>
               <div>
                  <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">TRANSFER CERTIFICATE PREVIEW</DialogTitle>
                  <p className="text-slate-500 font-medium text-sm">Official documentation for {data?.lblstdname}</p>
               </div>
          </div>
          <div className="flex gap-3">
             <Button
                onClick={() => handlePrint()}
                disabled={isLoading || !data}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-full px-8 shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
              >
                <Printer className="mr-2 h-5 w-5" /> PRINT TC
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-full h-12 w-12 p-0 border-slate-200 hover:bg-white text-slate-500 shadow-sm"
              >
                <X className="h-5 w-5" />
              </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-200/50 rounded-[2rem] border-2 border-dashed border-slate-300 p-8 flex justify-center shadow-inner custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-500" />
              <p className="font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Preparing Document...</p>
            </div>
          ) : data ? (
            <div className="shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-500 origin-top bg-white">
              <NdaTcPrint ref={printRef} data={data} issuedDate={new Date()} />
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">
                No data available for preview.
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
