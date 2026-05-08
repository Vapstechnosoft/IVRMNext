'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";

interface RequisitionReportGridProps {
   reportData: any[];
   institutionInfo?: any;
   onPrint: () => void;
   initialSize?: string;
   reportParams?: {
      fromDate?: string;
      toDate?: string;
      reportType?: string;
   };
   onParticularClick?: (id: number) => Promise<any[]>;
}

export default function RequisitionReportGrid({
   reportData = [],
   institutionInfo,
   onPrint,
   initialSize = '10',
   reportParams,
   onParticularClick
}: RequisitionReportGridProps) {
   const [size, setSize] = useState(initialSize);
   const [modalOpen, setModalOpen] = useState(false);
   const [modalData, setModalData] = useState<any[]>([]);
   const [modalLoading, setModalLoading] = useState(false);
   const [selectedParticularName, setSelectedParticularName] = useState('');

   const fontSizeClass = {
      '8': 'text-[8px]',
      '9': 'text-[9px]',
      '10': 'text-xs',
      '11': 'text-sm',
      '12': 'text-base',
      '14': 'text-lg',
      '16': 'text-xl',
      '18': 'text-2xl',
      '20': 'text-3xl'
   }[size] || 'text-xs';

   const institution = institutionInfo || {};
   const isParticular = reportParams?.reportType === 'Particular';

   const totalAmount = reportData?.reduce((sum, item) => {
      const amt = isParticular ? (item.TOTALAMOUNT || item.totalamount) : (item.REQUESTEDAMOUNT || item.requestedamount || 0);
      return sum + Number(amt);
   }, 0);

   const handleParticularClick = async (id: number, name: string) => {
      if (onParticularClick) {
         setModalLoading(true);
         setSelectedParticularName(name);
         setModalOpen(true);
         try {
            const details = await onParticularClick(id);
            setModalData(details || []);
         } catch (error) {
            console.error("Error fetching particular details:", error);
         } finally {
            setModalLoading(false);
         }
      }
   };

   const exportToExcel = () => {
      if (!reportData.length) {
         alert('No data to export!');
         return;
      }

      const worksheetData: any[] = [];
      worksheetData.push([`PETTY CASH REQUISITION ${reportParams?.reportType?.toUpperCase()} REPORT`]);
      if (reportParams?.fromDate && reportParams?.toDate) {
         worksheetData.push([`From: ${reportParams.fromDate} To: ${reportParams.toDate}`]);
      }
      worksheetData.push([]);

      if (isParticular) {
         worksheetData.push(['SL No.', 'Particular Name', 'Amount']);
         reportData.forEach((item, idx) => {
            worksheetData.push([
               idx + 1,
               item.PCMPART_ParticularName || item.particularname || '',
               item.TOTALAMOUNT || item.totalamount || 0
            ]);
         });
         worksheetData.push(['', 'Total Amount:', totalAmount]);
      } else {
         worksheetData.push(['SL No.', 'Requisition Details', 'Particular', 'Requested Amount', 'Remarks']);
         reportData.forEach((item, idx) => {
            const details = `Requisition No: ${item.PCREQTN_RequisitionNo || ''}\nRequested By: ${item.EMPLOYEENAME || ''} (${item.EMPCODE || ''})\nDate: ${item.REQDATE ? format(new Date(item.REQDATE), 'dd/MM/yyyy') : ''}\nTotal: ${item.TOTALAMOUNT || ''}`;
            worksheetData.push([
               idx + 1,
               details,
               item.PCMPART_ParticularName || item.particularname || '',
               item.REQUESTEDAMOUNT || item.requestedamount || 0,
               item.PCREQTNDET_Remarks || item.remarks || ''
            ]);
         });
         worksheetData.push(['', '', 'Total Amount:', totalAmount, '']);
      }

      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `Petty_Cash_${reportParams?.reportType}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
   };

    return (
      <div className={`w-full bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden ${fontSizeClass}`}>
         <style jsx global>{`
            @media print {
               @page {
                  size: auto;
                  margin: 15mm;
               }
               body {
                  background: white !important;
                  margin: 0 !important;
                  padding: 0 !important;
               }
               .no-print {
                  display: none !important;
               }
               #printable-report, #printable-report * {
                  visibility: visible !important;
                  opacity: 1 !important;
               }
               #printable-report {
                  display: block !important;
                  width: 100% !important;
               }
               * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
               }
               table {
                  border-collapse: collapse !important;
                  width: 100% !important;
               }
               th, td {
                  border: 1px solid #e2e8f0 !important;
               }
               .bg-purple-700 {
                  background-color: #7e22ce !important;
                  color: white !important;
               }
            }
         `}</style>
         {/* Action Bar */}
         <div className='no-print flex items-center justify-between bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-6'>
               <div className='flex items-center gap-3'>
                  <span className='text-gray-500 font-semibold text-[10px] uppercase tracking-wider'>Text Size:</span>
                  <select
                     className='bg-white border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs shadow-sm transition-all'
                     value={size}
                     onChange={(e) => setSize(e.target.value)}
                  >
                     {[8, 9, 10, 11, 12, 14, 16].map(v => (
                        <option key={v} value={v}>{v}px</option>
                     ))}
                  </select>
               </div>
            </div>
            <div className='flex items-center gap-3'>
               <Button onClick={onPrint} size='sm' className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 h-9 px-5 rounded-lg transition-all active:scale-95'>
                  <Printer className='mr-2 h-4 w-4' /> Print Report
               </Button>

               <Button
                  onClick={exportToExcel}
                  size='sm'
                  variant='outline'
                  className='gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm h-9 px-5 rounded-lg transition-all'>
                  <Download className='h-4 w-4' /> Export Excel
               </Button>
            </div>
         </div>

         {/* Report Layout */}
         <div className='p-10 bg-white' id="printable-report">
            {/* Institution Header */}
            {/* Institution Header */}
            {/* <div className='flex flex-col items-center mb-10 border-b-2 border-gray-100 pb-8 text-center'>
               {institution.mI_Logo && (
                  <img src={institution.mI_Logo} alt="Logo" className='h-28 w-28 object-contain mb-4 filter drop-shadow-md' />
               )}
            </div> */}

            {/* Report Title */}
            <div className='mb-10 text-center space-y-2'>
               {/* <h2 className='text-2xl font-purple text-gray-800 tracking-tight'>
                  REQUISITION {reportParams?.reportType?.toUpperCase()} REPORT
               </h2>
               {reportParams?.fromDate && (
                  <p className='text-sm text-gray-400 font-medium'>
                     Requisition details from <span className="text-gray-900 font-bold">{format(new Date(reportParams.fromDate), 'dd MMM yyyy')}</span> to <span className="text-gray-900 font-bold">{format(new Date(reportParams.toDate || ''), 'dd MMM yyyy')}</span>
                  </p> */}
               {/* )} */}
            </div>

            {/* Data Table */}
            <div className='overflow-x-auto rounded-xl border border-purple-200 shadow-sm'>
               <table className='w-full border-collapse'>
                  <thead>
                     <tr className='bg-purple-700 text-white'>
                        <th className='px-4 py-4 text-left w-12 font-bold uppercase tracking-wider border-r border-purple-800'>SL.No</th>
                        {isParticular ? (
                           <>
                              <th className='px-4 py-4 text-left font-bold uppercase tracking-wider border-r border-purple-800'>Particular Name</th>
                              <th className='px-4 py-4 text-right font-bold uppercase tracking-wider'>Amount</th>
                           </>
                        ) : (
                           <>
                              {/* <th className='px-4 py-4 text-left font-bold uppercase tracking-wider border-r border-purple-800'>Requisition Details</th> */}
                              <th className='px-4 py-4 text-left font-bold uppercase tracking-wider border-r border-purple-800'>Particular</th>
                              <th className='px-4 py-4 text-right font-bold uppercase tracking-wider border-r border-purple-800 w-32'>Req. Amount</th>
                              <th className='px-4 py-4 text-left font-bold uppercase tracking-wider w-48'>Remarks</th>
                           </>
                        )}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                     {reportData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                           <td className='px-4 py-4 text-center font-bold text-gray-400 border-r border-gray-100'>{idx + 1}</td>
                           {isParticular ? (
                              <>
                                 <td className='px-4 py-4 border-r border-purple-800 leading-relaxed'>
                                    <button
                                       onClick={() => handleParticularClick(item.PCMPART_Id || item.pcmpart_id, item.PCMPART_ParticularName || item.particularname)}
                                       className="text-indigo-600 font-bold hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4 transition-all text-left"
                                    >
                                       {item.PCMPART_ParticularName || item.particularname}
                                    </button>
                                 </td>
                                 <td className='px-4 py-4 text-right font-black text-gray-900 bg-gray-50/30'>
                                    {(item.TOTALAMOUNT || item.totalamount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                 </td>
                              </>
                           ) : (
                              <>
                                 {/* <td className='px-4 py-4 border-r border-gray-100 leading-relaxed'>
                                    <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase">No:</span>
                                          <span className="font-bold text-gray-900">{item.PCREQTN_RequisitionNo || '-'}</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase">By:</span>
                                          <span className="font-medium text-gray-700">{item.EMPLOYEENAME || '-'}</span>
                                          <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">{item.EMPCODE}</span>
                                       </div>
                                       <div className="flex items-center gap-4 text-[11px]">
                                          <div className="text-gray-500"><span className="font-bold text-gray-400">Date:</span> {item.REQDATE ? format(new Date(item.REQDATE), 'dd/MM/yyyy') : '-'}</div>
                                          <div className="text-gray-900 font-bold"><span className="font-bold text-gray-400">Total:</span> ₹{(item.TOTALAMOUNT || 0).toLocaleString('en-IN')}</div>
                                       </div>
                                    </div>
                                 </td> */}
                                 <td className='px-4 py-4 border-r border-gray-100 font-bold text-gray-700'>{item.PCMPART_ParticularName || item.particularname}</td>
                                 <td className='px-4 py-4 text-right font-black text-indigo-600 bg-indigo-50/20 border-r border-gray-100'>
                                    {(item.REQUESTEDAMOUNT || item.requestedamount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                 </td>
                                 <td className='px-4 py-4 text-gray-500 italic text-[11px] leading-tight max-w-xs'>
                                    {item.PCREQTNDET_Remarks || item.remarks || '-'}
                                 </td>
                              </>
                           )}
                        </tr>
                     ))}
                     {/* Empty State */}
                     {reportData.length === 0 && (
                        <tr>
                           <td colSpan={isParticular ? 3 : 5} className='p-20 text-center'>
                              <div className="flex flex-col items-center gap-3">
                                 <Search className="h-10 w-10 text-gray-200" />
                                 <p className="text-gray-400 font-medium italic">No records found for the selected criteria.</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
                  {/* Footer / Summary */}
                  {reportData.length > 0 && (
                     <tfoot>
                        <tr className='bg-purple-700 text-white font-black'>
                           <td colSpan={isParticular ? 2 : 3} className='px-6 py-5 text-right uppercase tracking-widest text-xs opacity-70'>
                              Total Expenses
                           </td>
                           <td className={`px-6 py-5 text-right text-lg font-black ${isParticular ? '' : 'border-r border-purple-800'}`}>
                              ₹{totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                           </td>
                           {!isParticular && <td className='px-6 py-5'></td>}
                        </tr>
                     </tfoot>
                  )}
               </table>
            </div>

            {/* Footer info */}
            <div className='mt-20 flex justify-between items-end'>
               <div className='text-[10px] text-gray-400 font-medium'>
                  REPORT GENERATED: {format(new Date(), 'dd MMMM yyyy HH:mm')}
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <div className='w-48 h-px bg-gray-200'></div>
                  <div className='text-[10px] font-black uppercase tracking-widest text-gray-900'>
                     Authorized Signature
                  </div>
               </div>
            </div>
         </div>

         {/* Particular Details Modal */}
         <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-2xl">
               <DialogHeader className="p-6 bg-gray-900 text-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                     <div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Particular Details</DialogTitle>
                        <p className="text-gray-400 text-xs mt-1 font-medium">Detailed transactions for <span className="text-white">{selectedParticularName}</span></p>
                     </div>
                     <div className="flex items-center gap-2">
                        <Button
                           variant="outline"
                           className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8"
                           onClick={() => {
                              const ws = XLSX.utils.json_to_sheet(modalData);
                              const wb = XLSX.utils.book_new();
                              XLSX.utils.book_append_sheet(wb, ws, 'Details');
                              XLSX.writeFile(wb, `Details_${selectedParticularName}.xlsx`);
                           }}
                        >
                           <Download className="h-4 w-4 mr-2" /> Excel
                        </Button>
                     </div>
                  </div>
               </DialogHeader>

               <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {modalLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fetching Transaction Data...</p>
                     </div>
                  ) : (
                     <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="bg-gray-100 border-b border-gray-200">
                                 <th className="px-4 py-3 text-left font-bold uppercase text-[10px] text-gray-500 w-12 text-center">SL</th>
                                 <th className="px-4 py-3 text-left font-bold uppercase text-[10px] text-gray-500">Date</th>
                                 <th className="px-4 py-3 text-left font-bold uppercase text-[10px] text-gray-500">Expense Head</th>
                                 <th className="px-4 py-3 text-left font-bold uppercase text-[10px] text-gray-500">Particular/Remarks</th>
                                 <th className="px-4 py-3 text-right font-bold uppercase text-[10px] text-gray-500">Amount</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {modalData.map((row, i) => (
                                 <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-4 py-3 text-center text-gray-400 font-bold">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                       {row.PCREQTN_Date ? format(new Date(row.PCREQTN_Date), 'dd/MM/yyyy') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-bold">{row.PCMPART_ParticularName}</td>
                                    <td className="px-4 py-3 text-gray-400 italic text-xs">{row.PCREQTNDET_Remarks || '-'}</td>
                                    <td className="px-4 py-3 text-right font-black text-gray-900">
                                       ₹{(row.TOTALAMOUNT || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                 </tr>
                              ))}
                              {modalData.length === 0 && (
                                 <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 italic">No details found.</td>
                                 </tr>
                              )}
                           </tbody>
                           {modalData.length > 0 && (
                              <tfoot className="bg-indigo-600 text-white font-black">
                                 <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-widest text-[10px] opacity-70">Category Total</td>
                                    <td className="px-4 py-3 text-right text-lg">
                                       ₹{modalData.reduce((s, r) => s + (r.TOTALAMOUNT || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                 </tr>
                              </tfoot>
                           )}
                        </table>
                     </div>
                  )}
               </div>
               <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                  <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px]">
                     Close Viewer
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}

