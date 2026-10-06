'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
const formatDate = (date: unknown): string => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date as any);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return format(parsedDate, 'dd-MM-yyyy');
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
            accessorKey: 'FirstName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => {
                const firstName = row.original?.FirstName || '';
                const middleName = row.original?.MiddleName || '';
                const lastName = row.original?.LastName || '';
                const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
                return <div>{fullName || 'N/A'}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'EmailID',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Email-Id' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('EmailID') || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'Mobileno',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile Number' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('Mobileno') || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'RegDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='font-bold text-black' />,
            cell: ({ row }) => {
                const date = row.getValue('RegDate') as string;
                return <div>{date ? formatDate(date) : 'N/A'}</div>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];
};
