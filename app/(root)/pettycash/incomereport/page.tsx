'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { usePDAReportMutation } from '@/hooks/pettycash/usePDAReport';
import { incomeColumns, expenseColumns } from './_components/columns';
import PDAReportForm, { PDAFormValues } from './_components/report-form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { IPDAReportIncome, IPDAReportExpense } from '@/types/pettycash/PDAReport';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingDown, TrendingUp, XCircle, FileSpreadsheet, Printer as PrinterIcon, FileDown } from 'lucide-react';
import xlsx, { IJsonSheet } from 'json-as-xlsx';


export default function PDAReportPage() {
    const [incomeData, setIncomeData] = useState<IPDAReportIncome[]>([]);
    const [expenseData, setExpenseData] = useState<IPDAReportExpense[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const reportMutation = usePDAReportMutation();
    console.log("incomeData", reportMutation.data);
    console.log("expenseData", expenseData);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const handleSearch = async (values: PDAFormValues) => {
        setIsSearching(true);
        setHasSearched(true);
        try {
            const payload = {
                ASMAY_Id: Number(values.ASMAY_Id),
                From_Date: format(values.From_Date, 'yyyy-MM-dd'),
            };
            const response = await reportMutation.mutateAsync(payload);
            if (response && !response.success) {
                alert(response.message || "Failed to load report");
                setIncomeData([]);
                setExpenseData([]);
                return;
            }

            // Handle different potential response structures
            const reportData = response?.data || (response as any);

            // Extract income and expense, handling potential $values wrapper
            const incomeRaw = reportData?.income;
            const income = Array.isArray(incomeRaw) ? incomeRaw : (incomeRaw?.$values || []);

            const expenseRaw = reportData?.expense;
            const expense = Array.isArray(expenseRaw) ? expenseRaw : (expenseRaw?.$values || []);

            console.log("Extracted Income:", income);
            console.log("Extracted Expense:", expense);

            setIncomeData(income);
            setExpenseData(expense);

            if (income.length === 0 && expense.length === 0) {
                alert("No data found for the selected criteria.");
            }

        } catch (error) {
            console.error('Error fetching report:', error);
            setIncomeData([]);
            setExpenseData([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCancel = () => {
        setIncomeData([]);
        setExpenseData([]);
        setHasSearched(false);
    };

    const handleExport = () => {
        if (incomeData.length === 0 && expenseData.length === 0) return;

        const incomeContent = incomeData.map((item, index) => ({
            ...item,
            slNo: index + 1
        }));

        const expenseContent = expenseData.map((item, index) => ({
            ...item,
            slNo: index + 1
        }));

        const data: IJsonSheet[] = [
            {
                sheet: 'Income Details',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Particulars', value: 'payment_Mode' },
                    { label: 'Cash Amount', value: 'cashAmount' },
                    { label: 'Bank Amount', value: 'bankAmount' },
                    { label: 'Total Amount', value: 'fyP_Tot_Amount' },
                ],
                content: incomeContent as any[],
            },
            {
                sheet: 'Expense Details',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Particulars', value: 'particular' },
                    { label: 'Amount', value: 'pcreqtndeT_Amount' },
                ],
                content: expenseContent as any[],
            }
        ];

        const settings = {
            fileName: `Daily_Income_Expense_Report_${format(new Date(), 'yyyyMMdd')}`,
            extraLength: 3,
            writeMode: 'writeFile',
        };

        xlsx(data, settings);
    };

    const totalIncome = incomeData.reduce((acc, curr) => acc + (Number(curr.fyP_Tot_Amount) || 0), 0);
    const totalExpense = expenseData.reduce((acc, curr) => acc + (Number(curr.pcreqtndeT_Amount) || 0), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="container space-y-6 p-6">
                {/* Report Form */}
                <CollapsibleSection title="Daily Income & Expense Report Parameters" defaultOpen>
                    <PDAReportForm
                        onSearch={handleSearch}
                        onCancel={handleCancel}
                        onExport={handleExport}
                        onPrint={() => handlePrint()}
                        showReportButtons={incomeData.length > 0 || expenseData.length > 0}
                    />
                </CollapsibleSection>

                {isSearching && (
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
                        <p className="text-orange-600 font-bold uppercase tracking-widest text-[10px] animate-pulse">Generating Income/Expense Analytics...</p>
                    </div>
                )}

                {!isSearching && (incomeData.length > 0 || expenseData.length > 0) && (
                    <div className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="shadow-sm border-green-100 bg-white">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Total Income</p>
                                        <p className="text-xl font-bold text-slate-800">
                                            ₹ {totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-red-100 bg-white">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <TrendingDown className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Total Expense</p>
                                        <p className="text-xl font-bold text-slate-800">
                                            ₹ {totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`shadow-sm bg-white ${balance >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                        <FileText className={`h-6 w-6 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Balance</p>
                                        <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                            <Card className='shadow-md border-purple-50 overflow-hidden bg-white'>
                                <CardHeader className='bg-slate-50/50 border-b py-3 px-4'>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-sm font-bold flex items-center gap-2 text-slate-700'>
                                            <TrendingUp className='h-4 w-4 text-green-600' />
                                            Income Details
                                        </CardTitle>
                                        <div className='text-[10px] font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200'>
                                            {incomeData.length} records
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    <GenericDataTable
                                        data={incomeData}
                                        columns={incomeColumns}
                                        isLoading={isSearching}
                                    />
                                </CardContent>
                            </Card>


                            <Card className='shadow-md border-purple-50 overflow-hidden bg-white'>
                                <CardHeader className='bg-slate-50/50 border-b py-3 px-4'>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-sm font-bold flex items-center gap-2 text-slate-700'>
                                            <TrendingDown className='h-4 w-4 text-red-600' />
                                            Expense Details
                                        </CardTitle>
                                        <div className='text-[10px] font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200'>
                                            {expenseData.length} records
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    <GenericDataTable
                                        data={expenseData}
                                        columns={expenseColumns}
                                        isLoading={isSearching}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {!isSearching && hasSearched && incomeData.length === 0 && expenseData.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <XCircle className="h-12 w-12 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No records found for the selected period.</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or date range.</p>
                    </div>
                )}
            </div>

            {/* Hidden Print Section */}
            <div className='hidden'>
                <div ref={printRef} className='p-8 space-y-6 bg-white text-black'>
                    <div className='text-center border-b-2 border-slate-900 pb-4'>
                        <h1 className='text-2xl font-bold uppercase'>Daily Income & Expense Report</h1>
                        <p className='text-sm'>Report Date: {incomeData.length > 0 ? format(new Date(), 'dd/MM/yyyy') : ''}</p>
                    </div>

                    <div className='space-y-4'>
                        <h2 className='text-lg font-bold border-b text-green-700'>Income</h2>
                        <table className='w-full border-collapse border border-slate-400 text-xs'>
                            <thead>
                                <tr className='bg-slate-100'>
                                    <th className='border border-slate-400 p-1 text-center'>SL.NO</th>
                                    <th className='border border-slate-400 p-1 text-left'>Particulars</th>
                                    <th className='border border-slate-400 p-1 text-right'>Cash</th>
                                    <th className='border border-slate-400 p-1 text-right'>Bank</th>
                                    <th className='border border-slate-400 p-1 text-right'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomeData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className='border border-slate-400 p-1 text-center'>{idx + 1}</td>
                                        <td className='border border-slate-400 p-1'>{item.payment_Mode}</td>
                                        <td className='border border-slate-400 p-1 text-right'>{(Number(item.cashAmount) || 0).toFixed(2)}</td>
                                        <td className='border border-slate-400 p-1 text-right'>{(Number(item.bankAmount) || 0).toFixed(2)}</td>
                                        <td className='border border-slate-400 p-1 text-right font-bold'>{(Number(item.fyP_Tot_Amount) || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className='bg-green-50 font-bold'>
                                    <td colSpan={4} className='border border-slate-400 p-1 text-right'>Total Income</td>
                                    <td className='border border-slate-400 p-1 text-right'>₹ {totalIncome.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <h2 className='text-lg font-bold border-b text-red-700 pt-4'>Expense</h2>
                        <table className='w-full border-collapse border border-slate-400 text-xs'>
                            <thead>
                                <tr className='bg-slate-100'>
                                    <th className='border border-slate-400 p-1 text-center'>SL.NO</th>
                                    <th className='border border-slate-400 p-1 text-left'>Particulars</th>
                                    <th className='border border-slate-400 p-1 text-right'>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenseData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className='border border-slate-400 p-1 text-center'>{idx + 1}</td>
                                        <td className='border border-slate-400 p-1'>{item.particular}</td>
                                        <td className='border border-slate-400 p-1 text-right font-bold'>{(Number(item.pcreqtndeT_Amount) || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className='bg-red-50 font-bold'>
                                    <td colSpan={2} className='border border-slate-400 p-1 text-right'>Total Expense</td>
                                    <td className='border border-slate-400 p-1 text-right'>₹ {totalExpense.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className='pt-6 flex justify-end gap-10'>
                            <div className='text-right'>
                                <p className='text-sm font-bold uppercase'>Net Balance: ₹ {balance.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className='pt-12 flex justify-between text-[10px] font-bold uppercase'>
                        <div className='border-t border-black pt-1 px-4'>Generated By</div>
                        <div className='border-t border-black pt-1 px-4'>Authorized Signature</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
