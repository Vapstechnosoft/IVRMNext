'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface GPSLog extends BaseEntity {
    employeeName: string;
    clientName: string;
    leadName: string;
    gpsDate: string; // date-time
    address: string;
    remarks?: string;
}

export const gpsLocationReportColumns: ColumnDef<GPSLog>[] = [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
    { accessorKey: 'clientName', header: ({ column }) => <DataTableColumnHeader column={column} title='Client Name' /> },
    { accessorKey: 'leadName', header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Name' /> },
    { accessorKey: 'gpsDate', header: ({ column }) => <DataTableColumnHeader column={column} title='GPSL Date' /> },
    { accessorKey: 'address', header: ({ column }) => <DataTableColumnHeader column={column} title='Address' /> },
    { accessorKey: 'remarks', header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' /> }
];
