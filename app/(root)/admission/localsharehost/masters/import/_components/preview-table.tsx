'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableProperties } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface PreviewTableProps {
    data: any[];
    headers: string[];
    isLoading: boolean;
}

export default function PreviewTable({ data, headers, isLoading }: PreviewTableProps) {
    const columns = useMemo<ColumnDef<any>[]>(() => {
        const baseColumns: ColumnDef<any>[] = [
            {
                accessorKey: 'slno',
                header: 'SLNO',
                cell: ({ row }) => row.index + 1,
            },
        ];

        const dynamicColumns: ColumnDef<any>[] = headers.map((header) => ({
            accessorKey: header,
            header: header,
            cell: ({ row }) => row.getValue(header) ?? '-',
        }));

        return [...baseColumns, ...dynamicColumns];
    }, [headers]);

    return (
        <Card className='shadow-lg'>
            <CardHeader className='border-b bg-muted/50 py-4'>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                    <TableProperties className='h-5 w-5 text-primary' />
                    Imported Data From Excel
                </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
                <GenericDataTable
                    data={data}
                    columns={columns}
                    isLoading={isLoading}
                    isSearchRequired={true}
                    isPaginationRequired={true}
                    loadingMessage='Processing excel data...'
                    noDataTitle='No Data to Preview'
                    noDataDescription='Upload an excel sheet to see the data here'
                />
            </CardContent>
        </Card>
    );
}
