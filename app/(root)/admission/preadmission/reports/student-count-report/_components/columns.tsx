'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    return format(new Date(date), 'dd-MM-yyyy');
};
export const getStudentCountReportColumns = (): ColumnDef<IMasterStudentCountReportList>[] => {
    return [
        {
            accessorKey: 'user_id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='w-full pl-6 font-bold text-black' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='w-full pl-6'>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'user_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('user_name')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Email-Id' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'phone_number',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile Number' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('phone_number')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'entry_date',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='font-bold text-black' />,
            cell: ({ row }) => {
                const date = row.getValue('entry_date') as string;
                return <div>{date ? formatDate(date) : 'N/A'}</div>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];
};
