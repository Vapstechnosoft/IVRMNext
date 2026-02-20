'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ConsolidatedReportGridProps {
    reportData: any[];
    onPrint: () => void;
    reportType: string;
}

export default function ConsolidatedReportGrid({ reportData, onPrint, reportType }: ConsolidatedReportGridProps) {
    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const wb = XLSX.utils.book_new();
        const wsData = [];

        // Header
        const headers = [
            'SL. NO.',
            'STAFF NAME',
            'STAFF ABBREVIATION',
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'TOTAL ALLOTTED PERIODS'
        ];
        wsData.push(headers);

        // Data
        reportData.forEach((row, index) => {
            wsData.push([
                index + 1,
                row.name,
                row.abbr,
                row.mon,
                row.tue,
                row.wed,
                row.thu,
                row.fri,
                row.total
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Consolidated Report');

        const fileName = `Consolidated_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className='space-y-6'>
            {/* Header Bar */}
            <div className='no-print flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-purple-600'></span>
                    <h2 className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                        {reportType.replace(/_/g, ' ')} Report View
                    </h2>
                </div>
                <div className='flex items-center gap-3'>
                    <Button onClick={onPrint} size='sm' className='bg-purple-600 hover:bg-purple-700 shadow-md transition-all active:scale-95'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>

                    <Button
                        onClick={exportToExcel}
                        size='sm'
                        variant='outline'
                        className='gap-2 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm transition-all'>
                        <Download className='h-4 w-4' />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Report Content */}
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider text-left'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider text-left'>STAFF ABBREVIATION</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider'>MONDAY</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider'>TUESDAY</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider'>WEDNESDAY</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider'>THURSDAY</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider'>FRIDAY</th>
                            <th className='border border-purple-800 px-4 py-4 text-xs font-bold uppercase tracking-wider bg-purple-800'>TOTAL ALLOTTED PERIODS</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                        {reportData.map((row, idx) => (
                            <tr key={idx} className='hover:bg-purple-50/50 transition-colors group'>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-500 bg-gray-50 group-hover:bg-purple-50'>{idx + 1}</td>
                                <td className='border border-gray-200 px-4 py-3 text-sm font-semibold text-purple-900'>{row.name}</td>
                                <td className='border border-gray-200 px-4 py-3 text-sm text-gray-600 italic'>{row.abbr}</td>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700'>{row.mon || 0}</td>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700'>{row.tue || 0}</td>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700'>{row.wed || 0}</td>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700'>{row.thu || 0}</td>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700'>{row.fri || 0}</td>
                                <td className='border border-gray-200 px-4 py-3 text-center text-sm font-black text-purple-700 bg-purple-50 group-hover:bg-purple-100'>{row.total || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-between items-center px-2 text-xs text-gray-500 font-medium italic'>
                <p>* This is a generated consolidated report summary.</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
