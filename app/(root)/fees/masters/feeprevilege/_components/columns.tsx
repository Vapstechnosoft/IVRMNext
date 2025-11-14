'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IFeePrivilegeList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit } from 'lucide-react';
import { useCallback } from 'react';

// Define the Fee Privilege type based on your schema

interface ActionButtonsCellProps {
    rowData: IFeePrivilegeList;
    openEditForm: (data: IFeePrivilegeList) => void;
}

function ActionButtonsCell({ rowData, openEditForm }: ActionButtonsCellProps) {
    const handleEdit = useCallback(() => {
        openEditForm(rowData);
    }, [openEditForm, rowData]);

    return (
        <div className='flex items-center gap-2'>
            <Button
                variant='outline'
                size='sm'
                onClick={handleEdit}
                className='w-fit transition-all duration-200 hover:scale-105'
                aria-label='Edit fee privilege'>
                <Edit className='h-4 w-4' />
            </Button>
        </div>
    );
}

export const feePrivilegeColumns: ColumnDef<IFeePrivilegeList>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label='Select all'
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //     size: 24
    // },
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'normalizedUserName',
        header: ({ column }) => <DataTableColumnHeader column={column} title=' User Name' />,
        cell: ({ row }) => <div>{row.getValue('normalizedUserName') || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => <div>{row.getValue('fmG_GroupName') || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Name' />,
        cell: ({ row }) => <div>{row.getValue('fmH_FeeName') || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'ivrmrT_Role',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Roles' />,
        cell: ({ row }) => <div>{row.getValue('ivrmrT_Role') || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row, table }) => {
            const openEditForm = (table.options.meta as { openEditForm?: (data: IFeePrivilegeList) => void })?.openEditForm;
            return <ActionButtonsCell rowData={row.original} openEditForm={openEditForm ?? (() => {})} />;
        },
        enableSorting: false,
        enableHiding: false
    }
];
