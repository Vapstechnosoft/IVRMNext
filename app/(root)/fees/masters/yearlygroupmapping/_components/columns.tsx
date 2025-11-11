'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

interface IFeeGroupMapping {
    fyghM_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    fmG_Id: number;
    fmH_Id: number;
    fmI_Id: number;
    fyghM_FineApplicableFlag: boolean | null;
    fyghM_Common_AmountFlag: boolean | null;
    fyghM_ActiveFlag: boolean | null;
    fmG_GroupName: string;
    fmH_FeeName: string;
    fmI_Name: string;
    returnval: boolean;
    userid: number;
    deleteId: number;
}

export const yearlyGroupMappingColumns: ColumnDef<IFeeGroupMapping>[] = [
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
        accessorKey: 'fyghM_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('fmG_GroupName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Head Name' />,
        cell: ({ row }) => <div>{row.getValue('fmH_FeeName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => <div>{row.getValue('fmI_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyghM_FineApplicableFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fine Applicable' />,
        cell: ({ row }) => {
            const value = row.getValue('fyghM_FineApplicableFlag');
            return <div className='text-center'>{value ? '✅' : '❌'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyghM_Common_AmountFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Common Amount' />,
        cell: ({ row }) => {
            const value = row.getValue('fyghM_Common_AmountFlag');
            return <div className='text-center'>{value ? '✅' : '❌'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyghM_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const value = row.getValue('fyghM_ActiveFlag');
            return (
                <div className='flex items-center justify-center'>
                    <span
                        className={`rounded-full px-2 py-1 font-semibold text-xs ${
                            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {value ? 'Active' : 'Inactive'}
                    </span>
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IFeeGroupMapping }) {
    const { openEditForm, openToggleForm } = useFormContext<IFeeGroupMapping>();

    const handleEdit = useCallback(
        (data: IFeeGroupMapping) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IFeeGroupMapping) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fyghM_ActiveFlag'
        />
    );
}
