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
import type { IInvTGRN } from '@/types/inventory/transactions/inv-t-grn';
import { format } from 'date-fns';

interface ColumnsProps {
    onEdit: (item: IInvTGRN) => void;
    onDelete: (item: IInvTGRN) => void;
    onToggleActive: (item: IInvTGRN) => void;
    onView: (item: IInvTGRN) => void;
}

export const getColumns = ({
    onEdit,
    onDelete,
    onToggleActive,
    onView
}: ColumnsProps): ColumnDef<IInvTGRN>[] => [
        {
            accessorKey: 'sno',
            header: 'SL.No.',
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'invmS_StoreName',
            header: 'Store Name'
        },
        {
            accessorKey: 'invmS_SupplierName',
            header: 'Supplier Name'
        },
        {
            accessorKey: 'invmgrN_GRNNo',
            header: 'GRN No.'
        },
        {
            accessorKey: 'invmgrN_KitNo',
            header: 'Kit No.'
        },
        {
            accessorKey: 'invmgrN_InvoiceNo',
            header: 'Invoice No.'
        },
        {
            accessorKey: 'invmgrN_PurchaseDate',
            header: 'Purchase Date',
            cell: ({ row }) => {
                const date = row.original.invmgrN_PurchaseDate;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
            }
        },
        {
            accessorKey: 'invmgrN_PurchaseValue',
            header: 'Purchase Value',
            cell: ({ row }) => Number(row.original.invmgrN_PurchaseValue).toFixed(2)
        },
        {
            accessorKey: 'invmgrN_TotDiscount',
            header: 'Total Discount',
            cell: ({ row }) => Number(row.original.invmgrN_TotDiscount).toFixed(2)
        },
        {
            accessorKey: 'invmgrN_TotTaxAmt',
            header: 'Total Tax',
            cell: ({ row }) => Number(row.original.invmgrN_TotTaxAmt).toFixed(2)
        },
        {
            accessorKey: 'invmgrN_TotalAmount',
            header: 'Total Amount',
            cell: ({ row }) => Number(row.original.invmgrN_TotalAmount).toFixed(2)
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
                                {item.invmgrN_ActiveFlg ? 'Deactivate' : 'Activate'}
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
