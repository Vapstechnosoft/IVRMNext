'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import type { VisitorTransactionData } from '@/types/visitors-management/transactions';
import { format } from 'date-fns';

export const visitorColumns: ColumnDef<VisitorTransactionData>[] = [
    {
        accessorKey: 'vmmV_Id',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    SLNO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'vmmV_VisitorName',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Visitor Name
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
    },
    {
        accessorKey: 'vmmV_VisitorContactNo',
        header: 'Mobile No',
    },
    {
        accessorKey: 'vmmV_VisitorEmailid',
        header: 'Email',
    },
    {
        accessorKey: 'vmmV_MeetingDateTime',
        header: 'Meeting Date',
        cell: ({ row }) => {
            const date = row.getValue('vmmV_MeetingDateTime') as string;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
        }
    },
    {
        accessorKey: 'vmmV_EntryDateTime',
        header: 'Time',
    },
    {
        accessorKey: 'empname',
        header: 'To Meet',
    },
    {
        accessorKey: 'vmmV_MeetingPurpose',
        header: 'Purpose',
    },
    {
        accessorKey: 'vmmV_MeetingLocation',
        header: 'Location',
    }
];
