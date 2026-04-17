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
import { X, CheckCircle2, Clock, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NdaStudentTcStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusList: any[];
  isLoading?: boolean;
}

export function NdaStudentTcStatusModal({
  isOpen,
  onClose,
  statusList,
  isLoading,
}: NdaStudentTcStatusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] overflow-hidden rounded-[2.5rem] p-0 border-none shadow-2xl bg-white">
        <DialogHeader className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                 <ShieldCheck className="w-8 h-8" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-black tracking-tight">STAFF APPROVAL STATUS</DialogTitle>
                <p className="text-indigo-100 font-medium">Tracking application progress across departments</p>
             </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute top-6 right-6 h-10 w-10 p-0 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>

        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">Loading Status...</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-100 overflow-hidden bg-slate-50/30">
              <Table>
                <TableHeader className="bg-indigo-50/50">
                  <TableRow className="h-14 border-b border-indigo-100/50">
                    <TableHead className="font-black text-indigo-900 uppercase text-xs tracking-widest pl-8">Approval Name</TableHead>
                    <TableHead className="text-center font-black text-indigo-900 uppercase text-xs tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusList?.length > 0 ? (
                    statusList.map((item, idx) => {
                      const isApproved = item.ASCAP_Status === 'Approved';
                      return (
                        <TableRow key={idx} className="h-16 border-b border-white/50 hover:bg-white transition-colors">
                          <TableCell className="font-bold text-slate-700 pl-8">
                            {item.empname}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                                <span className={cn(
                                  "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-wide gap-2 shadow-sm",
                                  isApproved 
                                    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" 
                                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                )}>
                                  {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  {item.ASCAP_Status}
                                </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-32 text-center text-slate-400 font-medium italic">
                        No approval tracking data found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="px-8 pb-8 flex justify-end">
           <Button onClick={onClose} className="rounded-full px-10 h-11 font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
              CLOSE VIEW
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
