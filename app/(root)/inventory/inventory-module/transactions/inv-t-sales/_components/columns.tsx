'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2, Eye, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { IInvTSales } from '@/types/inventory/transactions/inv-t-sales';
import { format } from 'date-fns';

interface ColumnsProps {
    onEdit: (item: IInvTSales) => void;
    onDelete: (item: IInvTSales) => void;
    onToggleActive: (item: IInvTSales) => void;
    onView: (item: IInvTSales) => void;
}

export const getColumns = ({
    onEdit,
    onDelete,
    onToggleActive,
    onView
}: ColumnsProps): ColumnDef<IInvTSales>[] => [
        {
            accessorKey: 'sno',
            header: 'SL.No.',
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'invmsL_SalesNo',
            header: 'Sale No.'
        },
        {
            accessorKey: 'invmsL_StuOtherFlg',
            header: 'Type'
        },
        {
            accessorKey: 'invmsL_SalesDate',
            header: 'Sale Date',
            cell: ({ row }) => {
                const date = row.original.invmsL_SalesDate;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
            }
        },
        {
            accessorKey: 'invmsL_SalesValue',
            header: 'Sale Value',
            cell: ({ row }) => Number(row.original.invmsL_SalesValue).toFixed(2)
        },
        {
            accessorKey: 'invmsL_TotDiscount',
            header: 'Total Discount',
            cell: ({ row }) => Number(row.original.invmsL_TotDiscount).toFixed(2)
        },
        {
            accessorKey: 'invmsL_TotTaxAmt',
            header: 'Total Tax',
            cell: ({ row }) => Number(row.original.invmsL_TotTaxAmt).toFixed(2)
        },
        {
            accessorKey: 'invmsL_TotalAmount',
            header: 'Total Amount',
            cell: ({ row }) => Number(row.original.invmsL_TotalAmount).toFixed(2)
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const item = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                <SquarePen className='mr-2 h-4 w-4' />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onView(item)}>
                                <Eye className='mr-2 h-4 w-4' />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleActive(item)}>
                                <Power className='mr-2 h-4 w-4' />
                                {item.invmsL_ActiveFlg ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className='text-destructive focus:text-destructive'
                            >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];
