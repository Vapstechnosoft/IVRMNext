'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { useBankCopyReportMutation, useBankCopyReportDetailsMutation } from '@/hooks/pettycash/report/useBankCopyReport';
import { summaryColumns, detailColumns } from './_components/columns';
import BankCopyReportForm, { BankCopyFormValues } from './_components/report-form';
import { useState } from 'react';
import { IBankCopyReportSummary, IBankCopyReportDetail } from '@/types/pettycash/report/BankCopyReport';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building2, Landmark, History, XCircle, ArrowLeft, FileDown, Printer } from 'lucide-react';
import xlsx, { IJsonSheet } from 'json-as-xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function BankCopyReportPage() {
    const [summaryData, setSummaryData] = useState<IBankCopyReportSummary[]>([]);
    const [detailData, setDetailData] = useState<IBankCopyReportDetail[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentParams, setCurrentParams] = useState<BankCopyFormValues | null>(null);

    const reportMutation = useBankCopyReportMutation();
    const detailMutation = useBankCopyReportDetailsMutation();

    const handleSearch = async (values: BankCopyFormValues) => {
        setIsSearching(true);
        setCurrentParams(values);
        try {
            const payload = {
                ASMAY_Id: Number(values.ASMAY_Id),
                IVRM_Month_Id: Number(values.IVRM_Month_Id),
                ASMAY_Year: values.ASMAY_Year
            };

            const response = await reportMutation.mutateAsync(payload);
            const reportData = response?.data || (response as any);
            const data = Array.isArray(reportData) ? reportData : (reportData?.bankreport || reportData?.$values || []);

            const mappedData = data.map((item: any) => ({
                Month: item.month || item.Month,
                TotalDebit: item.totalDebit || item.TotalDebit,
                TotalCredit: item.totalCredit || item.TotalCredit,
                IVRM_Month_Id: item.ivrm_Month_Id || item.IVRM_Month_Id || Number(values.IVRM_Month_Id),
                ASMAY_Year: item.asmay_Year || item.ASMAY_Year || values.ASMAY_Year
            }));

            setSummaryData(mappedData);
            setHasSearched(true);
        } catch (error) {
            console.error("Search Error:", error);
            alert("Failed to fetch report data.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleMonthClick = async (item: IBankCopyReportSummary) => {
        if (!currentParams) return;

        setSelectedMonth(item.Month);
        try {
            const payload = {
                ASMAY_Id: Number(currentParams.ASMAY_Id),
                IVRM_Month_Id: Number(item.IVRM_Month_Id || currentParams.IVRM_Month_Id),
                ASMAY_Year: currentParams.ASMAY_Year
            };

            const response = await detailMutation.mutateAsync(payload);
            const reportData = response?.data || (response as any);
            const data = Array.isArray(reportData) ? reportData : (reportData?.getdebitcreditdetails || reportData?.$values || []);

            const mappedDetailData = data.map((item: any) => ({
                PaymentDate: item.paymentDate || item.PaymentDate,
                Particular: item.particular || item.Particular,
                Voucher: item.voucher || item.Voucher,
                TotalDebit: item.totalDebit || item.TotalDebit,
                TotalCredit: item.totalCredit || item.TotalCredit
            }));

            setDetailData(mappedDetailData);
            setIsDetailOpen(true);
        } catch (error) {
            console.error("Detail Fetch Error:", error);
            alert("Failed to fetch monthly details.");
        }
    };

    const handlePrint = () => {
        if (!summaryData || summaryData.length === 0) return;
        const totalDebit = summaryData.reduce((acc, curr) => acc + (Number(curr.TotalDebit) || 0), 0);
        const totalCredit = summaryData.reduce((acc, curr) => acc + (Number(curr.TotalCredit) || 0), 0);

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        const tableRows = summaryData.map((item, idx) => `
            <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td style="text-align: center;">${item.Month}</td>
                <td style="text-align: right;">${(Number(item.TotalDebit) || 0).toFixed(2)}</td>
                <td style="text-align: right;">${(Number(item.TotalCredit) || 0).toFixed(2)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Summary Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                    th, td { border: 2px solid #333; padding: 8px; font-size: 14px; }
                    th { background: #f8fafc; text-align: center; font-weight: bold; }
                </style>
            </head>
            <body>
                <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="font-size: 18px; font-weight: bold; border: 2px solid #000; display: inline-block; padding: 8px 32px; text-transform: uppercase; margin: 0;">
                        Bank Credit And Debit Report Summary
                    </h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL.NO</th>
                            <th>MONTH</th>
                            <th>DEBIT</th>
                            <th>CREDIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f1f5f9; font-weight: bold;">
                            <td colspan="2" style="text-align: right;">TOTAL</td>
                            <td style="text-align: right;">₹ ${totalDebit.toFixed(2)}</td>
                            <td style="text-align: right;">₹ ${totalCredit.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top: 100px; display: flex; justify-content: space-between; padding: 0 50px;">
                    <div style="text-align: center; border-top: 2px solid #000; padding-top: 8px; font-weight: bold;">Verified By</div>
                    <div style="text-align: center; border-top: 2px solid #000; padding-top: 8px; font-weight: bold;">Authorized Signature</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    };

    const handleDetailPrint = () => {
        if (!detailData || detailData.length === 0) return;
        const totalDebit = detailData.reduce((acc, curr) => acc + (Number(curr.TotalDebit) || 0), 0);
        const totalCredit = detailData.reduce((acc, curr) => acc + (Number(curr.TotalCredit) || 0), 0);

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        const tableRows = detailData.map((item, idx) => `
            <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td style="text-align: center;">${new Date(item.PaymentDate).toLocaleDateString('en-GB')}</td>
                <td style="text-align: left; text-transform: uppercase;">${item.Particular}</td>
                <td style="text-align: center;">${item.Voucher}</td>
                <td style="text-align: right;">${(Number(item.TotalDebit) || 0).toFixed(2)}</td>
                <td style="text-align: right;">${(Number(item.TotalCredit) || 0).toFixed(2)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Detail Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                    th, td { border: 2px solid #333; padding: 8px; font-size: 14px; }
                    th { background: #f8fafc; text-align: center; font-weight: bold; }
                </style>
            </head>
            <body>
                <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0;">Vidya Vikasa Vidya Samsthe(R)</h1>
                    <h2 style="font-size: 20px; font-weight: 600; text-transform: uppercase; margin: 0 0 5px 0;">Vidya Vikasa English School</h2>
                    <p style="font-size: 16px; margin: 0;">Basaveshwar Talkies Road - ${currentParams?.ASMAY_Year || ''}</p>
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="font-size: 18px; font-weight: bold; border: 2px solid #000; display: inline-block; padding: 8px 32px; text-transform: uppercase; margin: 0;">
                        Bank Credit And Debit Report (${selectedMonth}, ${currentParams?.ASMAY_Year})
                    </h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL.NO</th>
                            <th>DATE</th>
                            <th>PARTICULAR</th>
                            <th>VOUCHER</th>
                            <th>DEBIT</th>
                            <th>CREDIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f1f5f9; font-weight: bold;">
                            <td colspan="4" style="text-align: right;">TOTAL</td>
                            <td style="text-align: right;">₹ ${totalDebit.toFixed(2)}</td>
                            <td style="text-align: right;">₹ ${totalCredit.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top: 100px; display: flex; justify-content: space-between; padding: 0 50px;">
                    <div style="text-align: center; border-top: 2px solid #000; padding-top: 8px; font-weight: bold;">Verified By</div>
                    <div style="text-align: center; border-top: 2px solid #000; padding-top: 8px; font-weight: bold;">Authorized Signature</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    };

    const handleExport = () => {
        if (summaryData.length === 0) return;

        const content = summaryData.map((item, index) => ({
            ...item,
            slNo: index + 1
        }));

        const data: IJsonSheet[] = [
            {
                sheet: 'Bank Credit Debit Summary',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Month', value: 'Month' },
                    { label: 'DEBIT', value: 'TotalDebit' },
                    { label: 'CREDIT', value: 'TotalCredit' },
                ],
                content: content as any[],
            }
        ];

        xlsx(data, { fileName: `Bank_Credit_Debit_Report_${format(new Date(), 'yyyyMMdd')}` });
    };

    const handleDetailExport = () => {
        if (detailData.length === 0) return;

        const content = detailData.map((item, index) => ({
            ...item,
            slNo: index + 1,
            formattedDate: new Date(item.PaymentDate).toLocaleDateString('en-GB')
        }));

        const data: IJsonSheet[] = [
            {
                sheet: `${selectedMonth} Details`,
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Date', value: 'formattedDate' },
                    { label: 'Particular', value: 'Particular' },
                    { label: 'Voucher', value: 'Voucher' },
                    { label: 'Debit', value: 'TotalDebit' },
                    { label: 'Credit', value: 'TotalCredit' },
                ],
                content: content as any[],
            }
        ];

        xlsx(data, { fileName: `Bank_Details_${selectedMonth}_${format(new Date(), 'yyyyMMdd')}` });
    };

    const handleCancel = () => {
        setSummaryData([]);
        setHasSearched(false);
        setCurrentParams(null);
    };

    const totalDebit = summaryData.reduce((acc, curr) => acc + (Number(curr.TotalDebit) || 0), 0);
    const totalCredit = summaryData.reduce((acc, curr) => acc + (Number(curr.TotalCredit) || 0), 0);

    return (
        <div className="container mx-auto p-4 space-y-8 bg-gray-50/50 min-h-screen">
<<<<<<< HEAD
            <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                </div>
            </div>
=======

>>>>>>> 5ca93d3ce8bbbf333408414cf90d4b2d3bdcad4f

            <BankCopyReportForm
                onSearch={handleSearch}
                onCancel={handleCancel}
                onExport={handleExport}
                onPrint={() => handlePrint()}
                showReportButtons={summaryData.length > 0}
            />

            <div className="relative">
                {isSearching && (
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs animate-pulse">Fetching Transaction Analytics...</p>
                    </div>
                )}

                {!isSearching && summaryData.length > 0 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-sm border-indigo-100 bg-white overflow-hidden">
                                <div className="h-1 bg-red-500" />
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <History className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Debit Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-indigo-100 bg-white overflow-hidden">
                                <div className="h-1 bg-green-500" />
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <Landmark className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Credit Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Table */}
                        <Card className='shadow-lg border-indigo-50 overflow-hidden bg-white'>
                            <CardHeader className='bg-slate-50/50 border-b py-4 px-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <FileText className='h-5 w-5 text-indigo-600' />
                                        <CardTitle className='text-lg font-bold text-gray-800'>Transaction Summary</CardTitle>
                                    </div>
                                    <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase">Monthly View</span>
                                </div>
                            </CardHeader>
                            <CardContent className='p-0'>
                                <GenericDataTable
                                    data={summaryData}
                                    columns={summaryColumns(handleMonthClick)}
                                    isLoading={isSearching}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!isSearching && hasSearched && summaryData.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <XCircle className="h-12 w-12 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No transaction records found for the selected period.</p>
                        <p className="text-gray-400 text-sm mt-1">Please verify the selected month and year.</p>
                    </div>
                )}
            </div>

            {/* Monthly Details Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <History className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold">Transaction Details: {selectedMonth}</DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">Showing all debit and credit entries for the selected month.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mr-6">
                                <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleDetailExport}>
                                    <FileDown className="h-3.5 w-3.5 mr-1.5" /> Export
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleDetailPrint}>
                                    <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <GenericDataTable
                            data={detailData}
                            columns={detailColumns}
                            isLoading={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
