// _components/columns.tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterStudentClassMappingList } from '@/types/fees/masters/masters';
import type { feeTransactionWaivedOffHead } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useCallback } from 'react';

export const FeeTransactionHeadList: ColumnDef<feeTransactionWaivedOffHead>[] = [
    {
        id: 'fmgM_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex || 0;
            const pageSize = table.getState().pagination.pageSize || 10;
            return <div className='pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'check',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
        ),
        cell: ({ row }) => {
            return <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />;
        },
        enableSorting: false,
        enableHiding: false
    },

    {
        accessorKey: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Name' />,
        cell: ({ row }) => <div>{row.getValue('fmH_FeeName')}</div>
    },

    {
        accessorKey: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => <div>{row.getValue('ftI_Name')}</div>
    },

    {
        accessorKey: 'tobepaid',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Balance' />,
        cell: ({ row }) => <div>{row.getValue('tobepaid')}</div>
    },

    {
        accessorKey: 'totalTobepaid',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Amount' />,
        cell: ({ row }) => <div>{row.getValue('totalTobepaid')}</div>
    },

    {
        accessorKey: 'text',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Waived Off Amount' />,
        cell: ({ row }) => {
            const value = row.getValue('tobepaid') as string | number;
            const [inputValue, setInputValue] = useState(value);

            const handleBlur = () => {
                row.original.tobepaid = typeof inputValue === 'string' ? Number(inputValue) : inputValue;
            };

            return (
                <input
                    type='text'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    className='w-full rounded border px-2 py-1 text-sm'
                />
            );
        }
    }
];

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterStudentClassMappingList;
}) {
    const { openOrderDetails } = useFormContext<IMasterStudentClassMappingList>();

    const handleView = useCallback((data: IMasterStudentClassMappingList) => openOrderDetails?.(data), [openOrderDetails]);

    return <ActionButtons rowData={rowData} buttons={{ delete: false, edit: true }} onEdit={handleView} />;
}
