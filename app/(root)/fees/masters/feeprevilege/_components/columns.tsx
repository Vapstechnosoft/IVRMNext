'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
        accessorKey: 'id',
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
        accessorKey: 'academicYearName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('academicYearName') || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'groupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
        cell: ({ row }) => <div>{row.getValue('groupName') || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'feeGroupNames',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Groups' />,
        cell: ({ row }) => {
            const feeGroupNames = row.getValue('feeGroupNames') as string[] | undefined;
            return (
                <div className='max-w-[250px] overflow-hidden truncate text-ellipsis'>
                    {feeGroupNames && feeGroupNames.length > 0 ? feeGroupNames.join(', ') : 'N.A'}
                </div>
            );
        },
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'roleNames',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Roles' />,
        cell: ({ row }) => {
            const roleNames = row.getValue('roleNames') as string[] | undefined;
            return (
                <div className='max-w-[250px] overflow-hidden truncate text-ellipsis'>
                    {roleNames && roleNames.length > 0 ? roleNames.join(', ') : 'N.A'}
                </div>
            );
        },
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'demoNames',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Demo Items' />,
        cell: ({ row }) => {
            const demoNames = row.getValue('demoNames') as string[] | undefined;
            return (
                <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>
                    {demoNames && demoNames.length > 0 ? demoNames.join(', ') : 'N.A'}
                </div>
            );
        },
        enableSorting: false,
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
