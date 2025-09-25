'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit } from 'lucide-react';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { useState } from 'react';
import ToggleMasterClassForm from './toggle-form';

// Create a function that returns columns with edit handler
export const createMasterClassColumns = (onEditClick?: (row: IMasterClassList) => void): ColumnDef<IMasterClassList>[] => [
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
        accessorKey: 'asmcL_Id',
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
        accessorKey: 'asmcL_ClassCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Code' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_Order')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MinAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Age (Years)' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MinAgeYear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MinAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Age (Months)' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MinAgeMonth')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MinAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Age (Days)' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MinAgeDays')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Age (Years)' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxAgeYear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Age (Months)' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxAgeMonth')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Age (Days)' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxAgeDays')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxCapacity',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Capacity' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxCapacity')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_PreadmFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pre-Admission Flag' />,
        cell: ({ row }) => <div>{getStatusBadge((row.getValue('asmcL_PreadmFlag') as number) === 1 ? 'yes' : 'no')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Status' />,
        cell: ({ row }) => <div>{getStatusBadge((row.getValue('asmcL_ActiveFlag') as boolean) === true ? 'active' : 'inactive')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorFn: (row: IMasterClassList) => row,
        enableSorting: false,
        enableHiding: false,
        cell: ({ getValue }) => {
            const [open, setOpen] = useState(false);
            const row = getValue();

            const handleEditClick = () => {
                setOpen(false);
                setTimeout(() => {
                    onEditClick?.(row as IMasterClassList);
                }, 150);
            };

            return (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button type='button' variant='ghost' className='h-8 w-8 p-0' onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {onEditClick && (
                            <DropdownMenuItem onClick={handleEditClick} className='cursor-pointer'>
                                <Edit className='h-4 w-4 mr-2' />
                                Edit
                            </DropdownMenuItem>
                        )}
                        {/* <ToggleMasterClassForm cell={{ getValue: () => row }} /> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];

// Keep the original export for backward compatibility
export const masterClassColumns = createMasterClassColumns();
