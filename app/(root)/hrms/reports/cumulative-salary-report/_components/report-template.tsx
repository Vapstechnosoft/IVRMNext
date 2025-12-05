'use client';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import type { CumulativeSalaryRecord } from './columns';
interface ReportTemplateProps {
    schoolName?: string;
    schoolAddress?: string;
    month: string;
    year: string;
    reportData: CumulativeSalaryRecord[];
    totals: {
        basic: number;
        da: number;
        hra: number;
        conveyance: number;
        medical: number;
        splAllowance: number;
        grossEarning: number;
        pf: number;
        esi: number;
        others: number;
        pt: number;
        grossDeduction: number;
        netSalary: number;
    };
    isLoading?: boolean;
    onPrint: () => void;
    onExport: () => void;
    onCancel: () => void;
}
export function CumulativeSalaryReportTemplate({
    schoolName = '',
    schoolAddress = '',
    month,
    year,
    reportData,
    totals,
    isLoading = false,
    onPrint,
    onExport,
    onCancel
}: ReportTemplateProps) {
    // Format currency
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };
    // Get month name in uppercase
    const monthName = month ? month.toUpperCase() : '';
    const yearValue = year || '';
    return (
        <div className='mx-auto w-full max-w-[1400px] bg-white p-6 print:p-4'>
            {/* Report Header */}
            <div className='mb-6 text-center'>
                <h1 className='mb-2 font-bold text-2xl text-gray-900 uppercase'>HRMS CUMULATIVE SALARY REPORT</h1>
                {schoolName && <div className='mb-1 font-semibold text-gray-800 text-lg'>{schoolName}</div>}
                {schoolAddress && <div className='text-gray-600 text-sm'>{schoolAddress}</div>}
                <div className='mt-4 font-semibold text-base text-gray-800'>
                    CUMULATIVE SALARY REPORT FOR THE MONTH OF {monthName} - {yearValue}
                </div>
            </div>
            {/* Report Table */}
            <div className='mb-6 overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-sm'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Sl.No</th>
                            <th className='border border-gray-300 px-2 py-2 text-left font-semibold'>Employee Name</th>
                            <th className='border border-gray-300 px-2 py-2 text-left font-semibold'>Designation</th>
                            {/* Earnings Section */}
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>BASIC</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>DA</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>HRA</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Conveyance</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Medical</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Spl Allowance</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Gross Earning</th>
                            {/* Deductions Section */}
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>PF</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>ESI</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Others (C.D)</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>PT</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Gross Deduction</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Leave Ded.No.of days</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Leave Ded.days of previous</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Net Salary</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold'>Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={19} className='border border-gray-300 px-4 py-8 text-center text-gray-500'>
                                    Loading salary report data...
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            // Show empty row with dashes to maintain table structure
                            <tr>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-left'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-left'>-</td>
                                {/* Earnings */}
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                {/* Deductions */}
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-right'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                            </tr>
                        ) : (
                            reportData.map((record, index) => {
                                const employeeName = `${record.HRME_EmployeeFirstName || ''} ${
                                    record.HRME_EmployeeMiddleName || ''
                                } ${record.HRME_EmployeeLastName || ''}`.trim();
                                const designation = record.HRMDES_DesignationName || record.designation || '';
                                return (
                                    <tr key={record.HRME_Id || index} className='hover:bg-gray-50'>
                                        <td className='border border-gray-300 px-2 py-2 text-center'>{index + 1}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-left'>{employeeName || '-'}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-left'>{designation || '-'}</td>
                                        {/* Earnings */}
                                        <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(record.basic || 0)}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(record.da || 0)}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(record.hra || 0)}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>
                                            {formatCurrency(record.conveyance || 0)}
                                        </td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>
                                            {formatCurrency(record.medical || 0)}
                                        </td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>
                                            {formatCurrency(record.splAllowance || 0)}
                                        </td>
                                        <td className='border border-gray-300 px-2 py-2 text-right font-semibold'>
                                            {formatCurrency(record.grossEarning || 0)}
                                        </td>
                                        {/* Deductions */}
                                        <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(record.pf || 0)}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(record.esi || 0)}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>
                                            {formatCurrency(record.others || 0)}
                                        </td>
                                        <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(record.pt || 0)}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right font-semibold'>
                                            {formatCurrency(record.grossDeduction || 0)}
                                        </td>
                                        <td className='border border-gray-300 px-2 py-2 text-center'>{record.leaveDedDays || 0}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-center'>{record.leaveDedPrevDays || 0}</td>
                                        <td className='border border-gray-300 px-2 py-2 text-right font-semibold text-green-600'>
                                            {formatCurrency(record.netSalary || 0)}
                                        </td>
                                        <td className='border border-gray-300 px-2 py-2 text-center text-gray-400'>-</td>
                                    </tr>
                                );
                            })
                        )}
                        {/* Totals Row */}
                        <tr className='bg-gray-50 font-semibold'>
                            <td colSpan={3} className='border border-gray-300 px-2 py-2 text-right'>
                                Total:
                            </td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.basic)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.da)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.hra)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.conveyance)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.medical)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.splAllowance)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.grossEarning)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.pf)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.esi)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.others)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.pt)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(totals.grossDeduction)}</td>
                            <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                            <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                            <td className='border border-gray-300 px-2 py-2 text-right text-green-600'>
                                {formatCurrency(totals.netSalary)}
                            </td>
                            <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* Action Buttons */}
            <div className='flex justify-end gap-3 print:hidden'>
                <Button variant='outline' onClick={onPrint} prefix={<Printer className='size-4' />}>
                    PRINT
                </Button>
                <Button variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                    CANCEL
                </Button>
                <Button variant='outline' onClick={onExport} prefix={<Download className='size-4' />}>
                    EXPORT TO EXCEL
                </Button>
            </div>
        </div>
    );
}
