'use client';

import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface PFChallanSummary {
    totalEmployeeShare: number;
    totalEmployerShare: number;
    totalAccount1: number;
    account2: number;
    account10: number;
    account21: number;
    account22: number;
    grandTotal: number;
}

interface PFChallanTemplateProps {
    establishmentName?: string;
    establishmentAddress?: string;
    pincode?: string;
    month?: string;
    year?: string;
    summary: PFChallanSummary;
    isLoading?: boolean;
    onPrint: () => void;
    onCancel: () => void;
}

export function PFChallanTemplate({
    establishmentName = '',
    establishmentAddress = '',
    pincode = '',
    month = '',
    year = '',
    summary,
    isLoading = false,
    onPrint,
    onCancel
}: PFChallanTemplateProps) {
    // Format currency
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Format month number (e.g., "March" -> "03")
    const getMonthNumber = () => {
        if (!month) return '';
        const monthMap: { [key: string]: string } = {
            January: '01',
            February: '02',
            March: '03',
            April: '04',
            May: '05',
            June: '06',
            July: '07',
            August: '08',
            September: '09',
            October: '10',
            November: '11',
            December: '12'
        };
        return monthMap[month] || '';
    };

    const monthNumber = getMonthNumber();
    const yearValue = year || '';

    return (
        <div className='mx-auto w-full max-w-[1200px] bg-white p-6 print:p-4'>
            {/* EPFO Header */}
            <div className='mb-6 text-center'>
                <h1 className='mb-2 font-bold text-gray-900 text-xl uppercase'>EMPLOYEE'S PROVIDENT FUND ORGANISATION</h1>
                <p className='font-semibold text-gray-700 text-sm'>(COMBINED CHALLAN FOR A/C NO.1, 2, 10, 21 & 22)</p>
            </div>

            {/* Business Details Section */}
            <div className='mb-6 grid grid-cols-3 gap-4 text-sm'>
                <div>
                    <label className='mb-1 block font-medium text-gray-700'>Business No:</label>
                    <div className='flex gap-1'>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                        ))}
                    </div>
                </div>
                <div>
                    <label className='mb-1 block font-medium text-gray-700'>For the Month of:</label>
                    <div className='flex gap-1'>
                        <div className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>{monthNumber[0] || ''}</div>
                        <div className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>{monthNumber[1] || ''}</div>
                        <div className='h-8 w-8 border border-gray-300 bg-white' />
                        <div className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>{yearValue[0] || ''}</div>
                        <div className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>{yearValue[1] || ''}</div>
                        <div className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>{yearValue[2] || ''}</div>
                        <div className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>{yearValue[3] || ''}</div>
                    </div>
                </div>
                <div>
                    <label className='mb-1 block font-medium text-gray-700'>VDR NO:</label>
                    <div className='h-8 border border-gray-300 bg-white' />
                </div>
            </div>

            {/* Amount Table */}
            <div className='mb-6 overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-xs'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                SLNO
                            </th>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Particulars
                            </th>
                            <th colSpan={3} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                A/C NO.1
                            </th>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                A/C NO.2
                            </th>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                A/C NO.10
                            </th>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                A/C NO.21
                            </th>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                A/C NO.22
                            </th>
                            <th rowSpan={2} className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Total
                            </th>
                        </tr>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 px-2 py-1 text-center font-semibold text-gray-900 text-xs'>
                                Employees' Share
                            </th>
                            <th className='border border-gray-300 px-2 py-1 text-center font-semibold text-gray-900 text-xs'>
                                Employer's Share
                            </th>
                            <th className='border border-gray-300 px-2 py-1 text-center font-semibold text-gray-900 text-xs'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className='border border-gray-300 px-4 py-8 text-center text-gray-500'>
                                    Loading PF challan...
                                </td>
                            </tr>
                        ) : (
                            <>
                                {/* Row 1: Contribution, Administrative / Inspection Charges */}
                                <tr>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>1</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>
                                        Contribution, Administrative / Inspection Charges
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>
                                        {formatCurrency(summary.totalEmployeeShare)}
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>
                                        {formatCurrency(summary.totalEmployerShare)}
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.totalAccount1)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account2)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account10)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account21)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account22)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.grandTotal)}</td>
                                </tr>
                                {/* Row 2(a): Interest Under Section 7Q */}
                                <tr>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>2(a)</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>Interest Under Section 7Q</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                </tr>
                                {/* Row 2(b): Damages Under Section 14B */}
                                <tr>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>2(b)</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>Damages Under Section 14B</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                </tr>
                                {/* Row 3: Miscellaneous payments */}
                                <tr>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>3</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>Miscellaneous payments</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>0.00</td>
                                </tr>
                                {/* Total Row */}
                                <tr className='bg-gray-100 font-semibold'>
                                    <td colSpan={2} className='border border-gray-300 px-2 py-2 text-right'>
                                        Total:
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>
                                        {formatCurrency(summary.totalEmployeeShare)}
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>
                                        {formatCurrency(summary.totalEmployerShare)}
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.totalAccount1)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account2)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account10)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account21)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.account22)}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-right'>{formatCurrency(summary.grandTotal)}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mode of Payment Section */}
            <div className='mb-6 grid grid-cols-2 gap-6'>
                <div>
                    <label className='mb-2 block font-medium text-gray-700 text-sm'>MODE OF PAYMENT(TICK)</label>
                    <div className='space-y-2'>
                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                            <input type='checkbox' className='h-4 w-4' />
                            Cheque
                        </label>
                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                            <input type='checkbox' className='h-4 w-4' />
                            Cash
                        </label>
                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                            <input type='checkbox' className='h-4 w-4' />
                            DD
                        </label>
                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                            <input type='checkbox' className='h-4 w-4' />
                            Transfer
                        </label>
                    </div>
                </div>
                <div className='space-y-3 text-sm'>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Date of the Deposit</label>
                        <div className='flex gap-1'>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Cheque/DD No.</label>
                        <div className='flex gap-1'>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Cheque DD/ Date</label>
                        <div className='flex gap-1'>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Amount Received(Rs.)</label>
                        <div className='h-8 border border-gray-300 bg-white' />
                    </div>
                </div>
            </div>

            {/* Establishment and Depositor Details */}
            <div className='mb-6 space-y-3 text-sm'>
                <div>
                    <label className='mb-1 block font-medium text-gray-700'>Name of the Establishment</label>
                    <div className='h-8 border border-gray-300 bg-white px-2 leading-8'>{establishmentName || '-'}</div>
                </div>
                <div>
                    <label className='mb-1 block font-medium text-gray-700'>Address</label>
                    <div className='h-8 border border-gray-300 bg-white px-2 leading-8'>{establishmentAddress || '-'}</div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Pincode</label>
                        <div className='flex gap-1'>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className='h-8 w-8 border border-gray-300 bg-white text-center leading-8'>
                                    {pincode[i] || ''}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Name of the Depositor</label>
                        <div className='h-8 border border-gray-300 bg-white' />
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Signature of the Depositor</label>
                        <div className='h-16 border border-gray-300 bg-white' />
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Deposit Bank Code:</label>
                        <div className='h-8 border border-gray-300 bg-white' />
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Deposit Branch Name:</label>
                        <div className='h-8 border border-gray-300 bg-white' />
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Bank Name (on which Cheque/DD drawn):</label>
                        <div className='h-16 border border-gray-300 bg-white' />
                    </div>
                </div>
            </div>

            {/* Instructions Section */}
            <div className='mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm'>
                <h3 className='mb-2 font-semibold text-gray-900'>INSTRUCTIONS TO THE EMPLOYER</h3>
                <ul className='list-disc space-y-1 pl-5 text-gray-700'>
                    <li>Use separate challan for each month.</li>
                    <li>Write legibly without any overwriting / correction / erasures.</li>
                    <li>Include Interest U/S 7Q for all belated remittances.</li>
                    <li>Pay the dues through local cheque only.</li>
                </ul>
            </div>

            {/* To Be Filled By The Bank Section */}
            <div className='mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm'>
                <h3 className='mb-3 font-semibold text-gray-900'>(TO BE FILLED BY THE BANK)</h3>
                <div className='grid grid-cols-3 gap-4'>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Challan Reference No.</label>
                        <div className='flex gap-1'>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Date of Presentation</label>
                        <div className='flex gap-1'>
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                            <div className='h-8 w-8 border border-gray-300 bg-white' />
                        </div>
                    </div>
                    <div>
                        <label className='mb-1 block font-medium text-gray-700'>Date of Realisation</label>
                        <div className='flex gap-1'>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                            ))}
                        </div>
                    </div>
                </div>
                <div className='mt-4'>
                    <label className='mb-1 block font-medium text-gray-700'>Date of Credit</label>
                    <div className='flex gap-1'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='h-8 w-8 border border-gray-300 bg-white' />
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 print:hidden'>
                <Button variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                    CANCEL
                </Button>
                <Button variant='outline' onClick={onPrint} prefix={<Printer className='size-4' />}>
                    PRINT
                </Button>
            </div>
        </div>
    );
}
