// 'use client';

// import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
// import { useBankCopyReportMutation, useBankCopyReportDetailsMutation } from '@/hooks/pettycash/useBankCopyReport';
// import { summaryColumns, detailColumns } from './_components/columns';
// import BankCopyReportForm, { BankCopyFormValues } from './_components/report-form';
// import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
// import { useState, useRef } from 'react';
// import { useReactToPrint } from 'react-to-print';
// import { IBankCopyReportSummary, IBankCopyReportDetail } from '@/types/pettycash/BankCopyReport';
// import { format } from 'date-fns';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { FileText, Building2, Landmark, History, XCircle, ArrowLeft, FileDown, Printer } from 'lucide-react';
// import xlsx, { IJsonSheet } from 'json-as-xlsx';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';

// export default function BankCopyReportPage() {
//     const [summaryData, setSummaryData] = useState<IBankCopyReportSummary[]>([]);
//     const [detailData, setDetailData] = useState<IBankCopyReportDetail[]>([]);
//     const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//     const [isDetailOpen, setIsDetailOpen] = useState(false);
//     const [isSearching, setIsSearching] = useState(false);
//     const [hasSearched, setHasSearched] = useState(false);
//     const [currentParams, setCurrentParams] = useState<BankCopyFormValues | null>(null);

//     const reportMutation = useBankCopyReportMutation();
//     const detailMutation = useBankCopyReportDetailsMutation();
//     const printRef = useRef<HTMLDivElement>(null);
//     const detailPrintRef = useRef<HTMLDivElement>(null);

//     const handleSearch = async (values: BankCopyFormValues) => {
//         setIsSearching(true);
//         setCurrentParams(values);
//         try {
//             const yearValue = values.ASMAY_Year.split('-')[0];
//             const payload = {
//                 ASMAY_Id: Number(values.ASMAY_Id),
//                 IVRM_Month_Id: Number(values.IVRM_Month_Id),
//                 ASMAY_Year: yearValue
//             };

//             const response = await reportMutation.mutateAsync(payload);
//             const reportData = response?.data || (response as any);
//             const data = Array.isArray(reportData) ? reportData : (reportData?.bankreport || reportData?.$values || []);
//             setSummaryData(data);
//             setHasSearched(true);
//         } catch (error) {
//             console.error("Search Error:", error);
//             alert("Failed to fetch report data.");
//         } finally {
//             setIsSearching(false);
//         }
//     };
// k
//     const handleMonthClick = async (item: IBankCopyReportSummary) => {
//         if (!currentParams) return;
        
//         setSelectedMonth(item.month);
//         try {
//             const payload = {
//                 ASMAY_Id: Number(currentParams.ASMAY_Id),
//                 IVRM_Month_Id: Number(item.ivrM_Month_Id || currentParams.IVRM_Month_Id),
//                 ASMAY_Year: currentParams.ASMAY_Year
//             };

//             const response = await detailMutation.mutateAsync(payload);
//             const reportData = response?.data || (response as any);
//             const data = reportData?.getdebitcreditdetails || reportData?.$values || [];
//             setDetailData(data);
//             setIsDetailOpen(true);
//         } catch (error) {
//             console.error("Detail Fetch Error:", error);
//             alert("Failed to fetch monthly details.");
//         }
//     };

//     const handlePrint = useReactToPrint({
//         contentRef: printRef,
//     });

//     const handleDetailPrint = useReactToPrint({
//         contentRef: detailPrintRef,
//     });

//     const handleExport = () => {
//         if (summaryData.length === 0) return;

//         const content = summaryData.map((item, index) => ({
//             ...item,
//             slNo: index + 1
//         }));

//         const data: IJsonSheet[] = [
//             {
//                 sheet: 'Bank Credit Debit Summary',
//                 columns: [
//                     { label: 'SL.NO', value: 'slNo' },
//                     { label: 'Month', value: 'month' },
//                     { label: 'DEBIT', value: 'totalDebit' },
//                     { label: 'CREDIT', value: 'totalCredit' },
//                 ],
//                 content: content as any[],
//             }
//         ];

//         xlsx(data, { fileName: `Bank_Credit_Debit_Report_${format(new Date(), 'yyyyMMdd')}` });
//     };

//     const handleDetailExport = () => {
//         if (detailData.length === 0) return;

//         const content = detailData.map((item, index) => ({
//             ...item,
//             slNo: index + 1,
//             formattedDate: new Date(item.PaymentDate).toLocaleDateString('en-GB')
//         }));

//         const data: IJsonSheet[] = [
//             {
//                 sheet: `${selectedMonth} Details`,
//                 columns: [
//                     { label: 'SL.NO', value: 'slNo' },
//                     { label: 'Date', value: 'formattedDate' },
//                     { label: 'Particular', value: 'Particular' },
//                     { label: 'Voucher', value: 'Voucher' },
//                     { label: 'Debit', value: 'TotalDebit' },
//                     { label: 'Credit', value: 'TotalCredit' },
//                 ],
//                 content: content as any[],
//             }
//         ];

//         xlsx(data, { fileName: `Bank_Details_${selectedMonth}_${format(new Date(), 'yyyyMMdd')}` });
//     };

//     const handleCancel = () => {
//         setSummaryData([]);
//         setHasSearched(false);
//         setCurrentParams(null);
//     };

//     const totalDebit = summaryData.reduce((acc, curr) => acc + (Number(curr.totalDebit) || 0), 0);
//     const totalCredit = summaryData.reduce((acc, curr) => acc + (Number(curr.totalCredit) || 0), 0);

//     return (
//         <div className="container mx-auto p-4 space-y-8 bg-gray-50/50 min-h-screen">
//             <div className="flex flex-col space-y-1">
//                 <div className="flex items-center gap-2">
//                     <Landmark className="h-6 w-6 text-indigo-600" />
//                     <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bank Credit And Debit Report</h1>
//                 </div>
//                 <p className="text-sm text-muted-foreground ml-8">Monitor monthly bank transactions and detailed credit/debit histories.</p>
//             </div>

//             <BankCopyReportForm
//                 onSearch={handleSearch}
//                 onCancel={handleCancel}
//                 onExport={handleExport}
//                 onPrint={() => handlePrint()}
//                 showReportButtons={summaryData.length > 0}
//             />

//             <div className="relative">
//                 {isSearching && (
//                     <div className="flex flex-col items-center justify-center p-20">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//                         <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs animate-pulse">Fetching Transaction Analytics...</p>
//                     </div>
//                 )}

//                 {!isSearching && summaryData.length > 0 && (
//                     <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
//                         {/* Summary Stats */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <Card className="shadow-sm border-indigo-100 bg-white overflow-hidden">
//                                 <div className="h-1 bg-red-500" />
//                                 <CardContent className="p-6 flex items-center gap-4">
//                                     <div className="p-3 bg-red-50 rounded-lg">
//                                         <History className="h-6 w-6 text-red-600" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-500">Total Debit Amount</p>
//                                         <p className="text-2xl font-bold text-gray-900">₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
//                                     </div>
//                                 </CardContent>
//                             </Card>

//                             <Card className="shadow-sm border-indigo-100 bg-white overflow-hidden">
//                                 <div className="h-1 bg-green-500" />
//                                 <CardContent className="p-6 flex items-center gap-4">
//                                     <div className="p-3 bg-green-50 rounded-lg">
//                                         <Landmark className="h-6 w-6 text-green-600" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-500">Total Credit Amount</p>
//                                         <p className="text-2xl font-bold text-gray-900">₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </div>

//                         {/* Summary Table */}
//                         <Card className='shadow-lg border-indigo-50 overflow-hidden bg-white'>
//                             <CardHeader className='bg-slate-50/50 border-b py-4 px-6'>
//                                 <div className='flex items-center justify-between'>
//                                     <div className='flex items-center gap-3'>
//                                         <FileText className='h-5 w-5 text-indigo-600' />
//                                         <CardTitle className='text-lg font-bold text-gray-800'>Transaction Summary</CardTitle>
//                                     </div>
//                                     <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase">Monthly View</span>
//                                 </div>
//                             </CardHeader>
//                             <CardContent className='p-0'>
//                                 <GenericDataTable
//                                     data={summaryData}
//                                     columns={summaryColumns(handleMonthClick)}
//                                     isLoading={isSearching}
//                                 />
//                             </CardContent>
//                         </Card>
//                     </div>
//                 )}

//                 {!isSearching && hasSearched && summaryData.length === 0 && (
//                     <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-dashed border-gray-300">
//                         <XCircle className="h-12 w-12 text-gray-200 mb-4" />
//                         <p className="text-gray-500 font-medium">No transaction records found for the selected period.</p>
//                         <p className="text-gray-400 text-sm mt-1">Please verify the selected month and year.</p>
//                     </div>
//                 )}
//             </div>

//             {/* Monthly Details Modal */}
//             <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
//                 <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader className="border-b pb-4">
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-indigo-50 rounded-lg">
//                                     <History className="h-5 w-5 text-indigo-600" />
//                                 </div>
//                                 <div>
//                                     <DialogTitle className="text-xl font-bold">Transaction Details: {selectedMonth}</DialogTitle>
//                                     <p className="text-xs text-muted-foreground mt-0.5">Showing all debit and credit entries for the selected month.</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center gap-2 mr-6">
//                                 <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleDetailExport}>
//                                     <FileDown className="h-3.5 w-3.5 mr-1.5" /> Export
//                                 </Button>
//                                 <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleDetailPrint}>
//                                     <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
//                                 </Button>
//                             </div>
//                         </div>
//                     </DialogHeader>

//                     <div className="py-4">
//                         <GenericDataTable
//                             data={detailData}
//                             columns={detailColumns}
//                             isLoading={false}
//                         />
//                     </div>
//                 </DialogContent>
//             </Dialog>

//             {/* Hidden Print Section for Summary */}
//             <div className='hidden'>
//                 <div ref={printRef} className='p-12 space-y-8 bg-white text-black'>
//                     <div className='text-center border-b-2 border-slate-900 pb-6'>
//                         <h1 className='text-3xl font-bold uppercase tracking-tight'>Vidya Vikasa Vidya Samsthe(R)</h1>
//                         <h2 className='text-2xl font-semibold uppercase mt-1'>Vidya Vikasa English School</h2>
//                         <p className='text-lg font-medium mt-2'>Basaveshwar Talkies Road - {currentParams?.ASMAY_Year || ''}</p>
//                     </div>
                    
//                     <div className='text-center'>
//                         <h3 className='text-xl font-bold border-2 border-black inline-block px-8 py-2 uppercase'>
//                             Bank Credit And Debit Report Summary
//                         </h3>
//                     </div>

//                     <table className='w-full border-collapse border-2 border-slate-900 mt-6'>
//                         <thead>
//                             <tr className='bg-slate-50'>
//                                 <th className='border-2 border-slate-900 p-3 text-center font-bold'>SL.NO</th>
//                                 <th className='border-2 border-slate-900 p-3 text-center font-bold'>MONTH</th>
//                                 <th className='border-2 border-slate-900 p-3 text-center font-bold'>DEBIT</th>
//                                 <th className='border-2 border-slate-900 p-3 text-center font-bold'>CREDIT</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {summaryData.map((item, idx) => (
//                                 <tr key={idx}>
//                                     <td className='border-2 border-slate-900 p-3 text-center'>{idx + 1}</td>
//                                     <td className='border-2 border-slate-900 p-3 text-center font-medium'>{item.month}</td>
//                                     <td className='border-2 border-slate-900 p-3 text-right font-medium'>{(Number(item.totalDebit) || 0).toFixed(2)}</td>
//                                     <td className='border-2 border-slate-900 p-3 text-right font-medium'>{(Number(item.totalCredit) || 0).toFixed(2)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                         <tfoot>
//                             <tr className='bg-slate-100 font-bold'>
//                                 <td colSpan={2} className='border-2 border-slate-900 p-3 text-right text-lg'>TOTAL</td>
//                                 <td className='border-2 border-slate-900 p-3 text-right text-lg'>₹ {totalDebit.toFixed(2)}</td>
//                                 <td className='border-2 border-slate-900 p-3 text-right text-lg'>₹ {totalCredit.toFixed(2)}</td>
//                             </tr>
//                         </tfoot>
//                     </table>

//                     <div className='mt-24 grid grid-cols-2 gap-20 pt-10'>
//                         <div className='text-center border-t-2 border-black pt-2 font-bold'>Verified By</div>
//                         <div className='text-center border-t-2 border-black pt-2 font-bold'>Authorized Signature</div>
//                     </div>
//                 </div>
//             </div>

//             {/* Hidden Print Section for Details */}
//             <div className='hidden'>
//                 <div ref={detailPrintRef} className='p-12 space-y-8 bg-white text-black'>
//                     <div className='text-center border-b-2 border-slate-900 pb-6'>
//                         <h1 className='text-3xl font-bold uppercase tracking-tight'>Vidya Vikasa Vidya Samsthe(R)</h1>
//                         <h2 className='text-2xl font-semibold uppercase mt-1'>Vidya Vikasa English School</h2>
//                         <p className='text-lg font-medium mt-2'>Basaveshwar Talkies Road - {currentParams?.ASMAY_Year || ''}</p>
//                     </div>
                    
//                     <div className='text-center'>
//                         <h3 className='text-xl font-bold border-2 border-black inline-block px-8 py-2 uppercase'>
//                             Bank Credit And Debit Report ({selectedMonth}, {currentParams?.ASMAY_Year})
//                         </h3>
//                     </div>

//                     <table className='w-full border-collapse border-2 border-slate-900 mt-6'>
//                         <thead>
//                             <tr className='bg-slate-50'>
//                                 <th className='border-2 border-slate-900 p-2 text-center font-bold text-sm'>SL.NO</th>
//                                 <th className='border-2 border-slate-900 p-2 text-center font-bold text-sm'>DATE</th>
//                                 <th className='border-2 border-slate-900 p-2 text-center font-bold text-sm'>PARTICULAR</th>
//                                 <th className='border-2 border-slate-900 p-2 text-center font-bold text-sm'>VOUCHER</th>
//                                 <th className='border-2 border-slate-900 p-2 text-center font-bold text-sm'>DEBIT</th>
//                                 <th className='border-2 border-slate-900 p-2 text-center font-bold text-sm'>CREDIT</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {detailData.map((item, idx) => (
//                                 <tr key={idx}>
//                                     <td className='border-2 border-slate-900 p-2 text-center text-xs'>{idx + 1}</td>
//                                     <td className='border-2 border-slate-900 p-2 text-center text-xs'>{new Date(item.PaymentDate).toLocaleDateString('en-GB')}</td>
//                                     <td className='border-2 border-slate-900 p-2 text-left text-xs uppercase'>{item.Particular}</td>
//                                     <td className='border-2 border-slate-900 p-2 text-center text-xs'>{item.Voucher}</td>
//                                     <td className='border-2 border-slate-900 p-2 text-right text-xs font-medium'>{(Number(item.TotalDebit) || 0).toFixed(2)}</td>
//                                     <td className='border-2 border-slate-900 p-2 text-right text-xs font-medium'>{(Number(item.TotalCredit) || 0).toFixed(2)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                         <tfoot>
//                             <tr className='bg-slate-100 font-bold'>
//                                 <td colSpan={4} className='border-2 border-slate-900 p-3 text-right font-bold'>TOTAL</td>
//                                 <td className='border-2 border-slate-900 p-3 text-right font-bold'>₹ {detailData.reduce((acc, curr) => acc + (Number(curr.TotalDebit) || 0), 0).toFixed(2)}</td>
//                                 <td className='border-2 border-slate-900 p-3 text-right font-bold'>₹ {detailData.reduce((acc, curr) => acc + (Number(curr.TotalCredit) || 0), 0).toFixed(2)}</td>
//                             </tr>
//                         </tfoot>
//                     </table>

//                     <div className='mt-24 grid grid-cols-2 gap-20 pt-10'>
//                         <div className='text-center border-t-2 border-black pt-2 font-bold'>Verified By</div>
//                         <div className='text-center border-t-2 border-black pt-2 font-bold'>Authorized Signature</div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
