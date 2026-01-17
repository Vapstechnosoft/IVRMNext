
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Eye, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { IInvOpeningBalance } from '@/types/inventory/transactions/inv-opening-balance';
import { format } from 'date-fns';

interface ColumnsProps {
    onEdit: (item: IInvOpeningBalance) => void;
    onToggleActive: (item: IInvOpeningBalance) => void;
    onView: (item: IInvOpeningBalance) => void;
}

export const getColumns = ({
    onEdit,
    onToggleActive,
    onView
}: ColumnsProps): ColumnDef<IInvOpeningBalance>[] => [
        {
            accessorKey: 'sno',
            header: 'SL.No.',
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'invmS_StoreName',
            header: 'Store'
        },
        {
            accessorKey: 'invmI_ItemName',
            header: 'Item'
        },
        {
            accessorKey: 'invmuoM_UOMName',
            header: 'UOM'
        },
        {
            accessorKey: 'invoB_BatchNo',
            header: 'Batch No'
        },
        {
            accessorKey: 'invoB_Qty',
            header: 'Quantity',
            cell: ({ row }) => Number(row.original.invoB_Qty).toFixed(2)
        },
        {
            accessorKey: 'invoB_PurchaseDate',
            header: 'Purchase Date',
            cell: ({ row }) => {
                const date = row.original.invoB_PurchaseDate;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
            }
        },
        {
            accessorKey: 'invoB_PurchaseRate',
            header: 'Purchase Rate',
            cell: ({ row }) => Number(row.original.invoB_PurchaseRate).toFixed(2)
        },
        {
            accessorKey: 'invoB_TAmount',
            header: 'Total Amount',
            cell: ({ row }) => Number(row.original.invoB_TAmount).toFixed(2)
        },
        {
            accessorKey: 'invoB_SaleRate',
            header: 'Sale Rate',
            cell: ({ row }) => Number(row.original.invoB_SaleRate).toFixed(2)
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
                                {item.invoB_ActiveFlg ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];
