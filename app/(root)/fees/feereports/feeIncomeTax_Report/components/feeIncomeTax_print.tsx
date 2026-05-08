'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { numberToWords } from '@/lib/utils';
import { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import React from 'react';

interface FeeIncomeTaxPrintProps {
    data: IFeeIncomeTaxReportResult[];
    logoUrl?: string;
}

export const FeeIncomeTaxPrint = React.forwardRef<HTMLDivElement, FeeIncomeTaxPrintProps>(({ data, logoUrl }, ref) => {
    if (!data || data.length === 0) return null;

    const firstItem = data[0];
    const totalAmount = data.reduce((sum, item) => sum + (item.totalPaidAmount || 0), 0);
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div ref={ref} className='p-8 text-black bg-white printable-content'>
            <div className='space-y-8'>
                {/* Header Section with Logo */}
                <div className='text-center space-y-4 pb-6 border-b-2 border-gray-100'>
                    {logoUrl && (
                        <img src={logoUrl} alt="Institution Logo" className="mx-auto max-h-24 object-contain mb-4" />
                    )}
                    <h1 className='text-3xl font-black uppercase tracking-wider text-gray-900'>FEE RECEIPT</h1>
                    <div className='w-24 h-1 bg-blue-600 mx-auto rounded-full'></div>
                </div>

                {/* Top Info Bar */}
                <div className='flex justify-between items-end border-b border-gray-200 pb-4'>
                    <div className='space-y-1'>
                        <p className='text-sm text-gray-600 font-medium uppercase tracking-tight'>Admission Number</p>
                        <p className='text-lg font-bold border-b-2 border-blue-100 px-1 inline-block'>{firstItem.amsT_AdmNo}</p>
                    </div>
                    <div className='text-right space-y-1'>
                        <p className='text-sm text-gray-600 font-medium uppercase tracking-tight'>Date</p>
                        <p className='text-lg font-bold border-b-2 border-blue-100 px-1 inline-block'>{currentDate}</p>
                    </div>
                </div>

                {/* Purpose Notice */}
                <div className='text-center py-2 bg-blue-50/50 rounded-lg border border-blue-100'>
                    <p className='text-sm font-semibold text-blue-800 italic'>
                        "This Certificate is issued for Income Tax Purpose / Educational Concession only"
                    </p>
                </div>

                {/* Student Details Grid */}
                <div className='grid grid-cols-2 gap-x-12 gap-y-6 pt-4'>
                    <PrintDetailRow label="Name of Student" value={firstItem.studentName} />
                    <PrintDetailRow label="Father / Mother Name" value={firstItem.amsT_FatherName || firstItem.amsT_MotherName} />
                    <PrintDetailRow label="Class & Section" value={`${firstItem.className} - ${firstItem.sectionName}`} />
                    <PrintDetailRow label="Academic Year" value={firstItem.academicYear} />
                </div>

                {/* Fee Breakdown Table */}
                <div className='pt-6'>
                    <Table className='border-2 border-gray-900'>
                        <TableHeader>
                            <TableRow className='bg-gray-900 hover:bg-gray-900'>
                                <TableHead className='text-white font-bold h-12 px-6 border-r border-gray-700'>Sl No.</TableHead>
                                <TableHead className='text-white font-bold h-12 px-6 border-r border-gray-700'>Description of Fee</TableHead>
                                <TableHead className='text-white font-bold h-12 px-6 text-right'>Amount (₹)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index} className='border-b border-gray-900 hover:bg-transparent'>
                                    <TableCell className='font-medium text-center border-r border-gray-900 py-4'>{index + 1}</TableCell>
                                    <TableCell className='font-bold border-r border-gray-900 py-4 px-6 uppercase tracking-tight'>
                                        {item.fmH_HeadName || `Fee Paid for ${item.academicYear}`}
                                    </TableCell>
                                    <TableCell className='text-right font-black py-4 px-6 text-lg'>
                                        {item.totalPaidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        <p className='text-[10px] font-normal text-gray-500 lowercase mt-1 tracking-wider'>
                                            ({numberToWords(item.totalPaidAmount)} RUPEES ONLY)
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className='bg-gray-50 font-black hover:bg-gray-50 border-t-2 border-gray-900'>
                                <TableCell colSpan={2} className='text-right py-6 px-6 text-xl tracking-widest uppercase'>Total Amount Paid</TableCell>
                                <TableCell className='text-right py-6 px-6 text-2xl text-blue-700 border-l border-gray-900'>
                                    {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Total Words Section */}
                <div className='border-2 border-gray-900 p-6 bg-gray-50 rounded-md relative overflow-hidden'>
                    <div className='absolute top-0 left-0 w-2 h-full bg-gray-900'></div>
                    <div className='space-y-1'>
                        <p className='text-xs font-bold text-gray-500 uppercase tracking-widest'>Amount in Words</p>
                        <p className='text-lg font-black uppercase tracking-tight text-gray-900'>
                            {numberToWords(totalAmount)} RUPEES ONLY
                        </p>
                    </div>
                </div>

                {/* Signature Block */}
                <div className='flex justify-between pt-24 pb-8'>
                    <div className='text-center min-w-[220px]'>
                        <div className='w-full border-t-2 border-gray-900 mb-2'></div>
                        <p className='text-xs font-black uppercase tracking-widest text-gray-700'>Accountant Signature</p>
                    </div>
                    <div className='text-center min-w-[220px]'>
                        <div className='w-full border-t-2 border-gray-900 mb-2'></div>
                        <p className='text-xs font-black uppercase tracking-widest text-gray-700'>Principal / Headmaster Signature</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 15mm;
                        size: A4;
                    }
                    .printable-content {
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
});

FeeIncomeTaxPrint.displayName = 'FeeIncomeTaxPrint';

function PrintDetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex flex-col space-y-1'>
            <p className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>{label}</p>
            <p className='text-base font-bold border-b-2 border-gray-200 pb-1 text-gray-900'>
                {value || '---'}
            </p>
        </div>
    );
}
