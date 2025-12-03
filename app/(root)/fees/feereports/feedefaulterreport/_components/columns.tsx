'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface IFeeDefaulterReportRow {
    feeGroup: string;
    totalDue: number;
}

export const feeDefaulterReportColumns: ColumnDef<IFeeDefaulterReportRow>[] = [
    // 1. Select All / Individual Checkbox
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all rows'
                className='translate-y-[2px]'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40
    },

    // 2. Serial Number (Safe: uses only table state)
    {
        id: 'serial',
        header: () => <div className='text-center'>Sl.No.</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='text-center font-medium'>{index}</div>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 80
    },

    // 3. Fee Group Name
    {
        accessorKey: 'feeGroup',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('feeGroup')}</div>,
        enableSorting: true
    },

    // 4. Balance Amount - HYDRATION-SAFE VERSION
    // 4. Balance Amount - HYDRATION-SAFE + SAME ALIGNMENT AS FEE GROUP
    {
        accessorKey: 'totalDue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Balance Amount (₹)' />,
        cell: ({ row }) => {
            const amount = Number(row.getValue('totalDue'));
            // Safe Indian comma formatting (no hydration error)
            const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            return <div className='font-bold text-red-600'>₹{formatted}</div>;
        },
        enableSorting: true,
        sortingFn: 'basic',
        // Optional: if you want header text also left-aligned like Fee Group
        meta: {
            className: 'text-left'
        }
    }
];
