'use client';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
interface EmployeeStrengthRecord {
    id?: string;
    departmentName: string;
    designationName: string;
    groupType: string;
    totalEmployees: number;
    activeEmployees?: number;
    leftEmployees?: number;
}
interface ReportTemplateProps {
    schoolName?: string;
    schoolAddress?: string;
    reportData: EmployeeStrengthRecord[];
    isLoading?: boolean;
    onPrint: () => void;
    onExport: () => void;
    onCancel: () => void;
}
export function EmployeeStrengthReportTemplate({
    schoolName = '',
    schoolAddress = '',
    reportData,
    isLoading = false,
    onPrint,
    onExport,
    onCancel
}: ReportTemplateProps) {
    // Calculate totals
    const totals = {
        totalEmployees: reportData.reduce((sum, record) => sum + (record.totalEmployees || 0), 0),
        totalWorkingEmployees: reportData.reduce((sum, record) => sum + (record.activeEmployees || 0), 0),
        totalLeftEmployees: reportData.reduce((sum, record) => sum + (record.leftEmployees || 0), 0)
    };
    return (
        <div className='mx-auto w-full max-w-[1600px] bg-white p-6 print:p-4'>
            {/* Report Header */}
            <div className='mb-6 text-center'>
                <h1 className='mb-2 font-bold text-2xl text-gray-900 uppercase'>EMPLOYEE STRENGTH REPORT</h1>
                {schoolName && <div className='mb-1 font-semibold text-gray-800 text-lg'>{schoolName}</div>}
                {schoolAddress && <div className='text-gray-600 text-sm'>{schoolAddress}</div>}
            </div>
            {/* Report Table */}
            <div className='mb-6 overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-sm'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='whitespace-nowrap border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                SL.No.
                            </th>
                            <th className='whitespace-nowrap border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Group Type
                            </th>
                            <th className='whitespace-nowrap border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Department
                            </th>
                            <th className='whitespace-nowrap border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Designation
                            </th>
                            <th className='whitespace-nowrap border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Total No. of Emp.
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className='border border-gray-300 px-4 py-8 text-center text-gray-500'>
                                    Loading employee strength report...
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                            </tr>
                        ) : (
                            reportData.map((record, index) => (
                                <tr key={record.id || index} className='hover:bg-gray-50'>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>{index + 1}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>{record.groupType || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>{record.departmentName || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>{record.designationName || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>{record.totalEmployees || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {/* Summary Row */}
                    <tfoot>
                        <tr className='bg-gray-100 font-semibold'>
                            <td colSpan={4} className='border border-gray-300 px-2 py-2 text-right'>
                                Total:
                            </td>
                            <td className='border border-gray-300 px-2 py-2 text-center'>{totals.totalEmployees}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {/* Summary Section */}
            <div className='mb-6 space-y-2'>
                <p className='font-medium text-gray-700 text-sm'>
                    Total No. of Working Employees: <span className='font-bold text-green-600'>{totals.totalWorkingEmployees}</span>
                </p>
                <p className='font-medium text-gray-700 text-sm'>
                    Total No. of Left Employees: <span className='font-bold text-red-600'>{totals.totalLeftEmployees}</span>
                </p>
                <p className='font-medium text-gray-700 text-sm'>
                    Total: <span className='font-bold text-gray-900'>{totals.totalEmployees}</span>
                </p>
            </div>
            {/* Action Buttons */}
            <div className='flex justify-end gap-3 print:hidden'>
                <Button variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                    CANCEL
                </Button>
                <Button variant='outline' onClick={onExport} prefix={<Download className='size-4' />}>
                    EXPORT TO EXCEL
                </Button>
                <Button variant='outline' onClick={onPrint} prefix={<Printer className='size-4' />}>
                    PRINT
                </Button>
            </div>
        </div>
    );
}
