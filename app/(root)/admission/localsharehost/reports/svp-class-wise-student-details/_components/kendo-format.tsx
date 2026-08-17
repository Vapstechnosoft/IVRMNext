'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { ColumnValue } from './columnvalue';
import { cn } from '@/lib/utils';

interface KendoFormatProps {
    data: any[];
    selectedFields: string[];
    onExportExcel: () => void;
    onExportPdf: () => void;
    isLoading?: boolean;
}

export function KendoFormat({
    data,
    selectedFields,
    onExportExcel,
    onExportPdf,
    isLoading
}: KendoFormatProps) {
    const activeFields = ColumnValue.filter((field) => selectedFields.includes(field.columnID));

    if (isLoading) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-white shadow-sm'>
                <p className='text-gray-500'>Loading report details...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-white shadow-sm'>
                <p className='text-gray-500'>No records found for the selected criteria.</p>
            </div>
        );
    }

    return (
        <div className='w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-md'>
            {/* Blue Header Bar - Using a deeper blue to match typical Kendo/Legacy styles */}
            <div className='flex items-center gap-3 bg-[#4267B2] p-2'>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={onExportExcel}
                    className='h-8 bg-transparent text-white hover:bg-white/10 border-white/30 text-[10px] font-bold tracking-tight'
                >
                    <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                    EXPORT TO EXCEL
                </Button>
                {/* <Button
                    variant='outline'
                    size='sm'
                    onClick={onExportPdf}
                    className='h-8 bg-transparent text-white hover:bg-white/10 border-white/30 text-[10px] font-bold tracking-tight'
                >
                    <FileText className='mr-1.5 h-3.5 w-3.5' />
                    EXPORT TO PDF
                </Button> */}
            </div>

            {/* Kendo Style Grid */}
            <div className='max-h-[600px] overflow-auto'>
                <table className='w-full text-left text-[11px] border-collapse'>
                    <thead className='sticky top-0 z-10'>
                        <tr className='bg-[#f4f7f9] border-b border-gray-200'>
                            {activeFields.map((field) => (
                                <th
                                    key={field.columnID}
                                    className='px-3 py-2.5 font-bold text-[#1e293b] border-r border-gray-200 last:border-r-0 whitespace-nowrap uppercase tracking-wider'
                                >
                                    {field.columnName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr
                                key={index}
                                className={cn(
                                    'border-b border-gray-100 transition-colors hover:bg-blue-50/30',
                                    index % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
                                )}
                            >
                                {activeFields.map((field) => (
                                    <td
                                        key={field.columnID}
                                        className='px-3 py-2 text-[#475569] border-r border-gray-100 last:border-r-0 font-medium'
                                    >
                                        {row[field.columnID] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
