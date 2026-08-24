'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

export const BookIssueColumns: ColumnDef<any>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'memberName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student / Member Name' />,
        cell: ({ row }) => {
            const original = row.original;
            const fullName = [original.amsT_FirstName, original.amsT_MiddleName, original.amsT_LastName].filter(Boolean).join(' ');
            return (
                <div>
                    {fullName || original.memberName || original.hrmE_EmployeeFirstName || original.hrmD_DepartmentName || original.lbtR_GuestName || '-'}
                </div>
            );
        },
        enableSorting: true
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No / Accession No' />,
        cell: ({ row }) => {
            const original = row.original;
            return <div>{original.amsT_AdmNo || original.lmbanO_AccessionNo || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div>{row.getValue('lmB_BookTitle') || row.original.bookTitle || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'issue_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Issue Date' />,
        cell: ({ row }) => {
            const date = (row.getValue('issue_Date') || row.original.createdDate) as string;
            if (!date || date.startsWith('0001')) return <div>-</div>;
            try {
                return <div>{format(new Date(date), 'dd/MM/yyyy')}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'due_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
        cell: ({ row }) => {
            const date = (row.getValue('due_Date') || row.original.return_Date) as string;
            if (!date || date.startsWith('0001')) return <div>-</div>;
            try {
                return <div>{format(new Date(date), 'dd/MM/yyyy')}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'book_Trans_Status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => <div>{row.getValue('book_Trans_Status') || 'Active'}</div>,
        enableSorting: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        cell: () => {
            return (
                <div className='flex justify-center gap-2'>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-500'>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-red-500'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: false
    }
];

