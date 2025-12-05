'use client';
import { Checkbox } from '@/components/ui/checkbox';
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
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false
    },
    { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
    { accessorKey: 'clientName', header: ({ column }) => <DataTableColumnHeader column={column} title='Client Name' /> },
    { accessorKey: 'leadName', header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Name' /> },
    { accessorKey: 'gpsDate', header: ({ column }) => <DataTableColumnHeader column={column} title='GPSL Date' /> },
    { accessorKey: 'address', header: ({ column }) => <DataTableColumnHeader column={column} title='Address' /> },
    { accessorKey: 'remarks', header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' /> }
];
