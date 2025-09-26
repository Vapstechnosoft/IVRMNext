'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { IMasterCategoryList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit } from 'lucide-react';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { useState } from 'react';

// Create a function that returns columns with edit handler
export const createMasterCategoryColumns = (onEditClick?: (row: IMasterCategoryList) => void): ColumnDef<IMasterCategoryList>[] => [
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
        accessorKey: 'amC_Type',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Type' />,
        cell: ({ row }) => <div>{row.getValue('amC_Type')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amC_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Name' />,
        cell: ({ row }) => <div>{row.getValue('amC_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amC_Address',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Address' />,
        cell: ({ row }) => (
            <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>
                {row.getValue('amC_Address') === ',,,' ? 'N.A' : row.getValue('amC_Address')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amC_PAApplicationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application Name' />,
        cell: ({ row }) => <div>{row.getValue('amC_PAApplicationName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amC_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Status' />,
        cell: ({ row }) => <div>{getStatusBadge((row.getValue('amC_ActiveFlag') as number) === 1 ? 'active' : 'inactive')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorFn: (row: IMasterCategoryList) => row,
        enableSorting: false,
        enableHiding: false,
        cell: ({ getValue }) => {
            const [open, setOpen] = useState(false);
            const row = getValue();

            const handleEditClick = () => {
                setOpen(false);
                setTimeout(() => {
                    onEditClick?.(row as IMasterCategoryList);
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
                        {/* <ToggleMasterCategoryForm cell={{ getValue: () => row }} /> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];

// Keep the original export for backward compatibility
export const masterCategoryColumns = createMasterCategoryColumns();
