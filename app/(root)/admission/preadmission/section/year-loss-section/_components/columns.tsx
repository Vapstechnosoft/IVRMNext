'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

interface Student {
    studentId: number;
    siNo: number;
    studentName: string;
    className: string;
    section: string;
    admNo: string;
    addCode: string;
}

export const masterYearLossSectionColumns: ColumnDef<Student>[] = [
    {
        accessorKey: 'siNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SI. No' className='w-full pl-6' />,
        cell: ({ row }) => {
            return <div className='w-full pl-6'>{row.original.siNo}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('studentName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'className',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('className')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'section',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Name' />,
        cell: ({ row }) => <div>{row.getValue('section')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'admNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm. No' />,
        cell: ({ row }) => <div>{row.getValue('admNo')}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
