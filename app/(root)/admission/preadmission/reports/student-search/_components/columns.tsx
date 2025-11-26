'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface StudentData {
    amsT_RegistrationNo: string;
    AMST_Id: number;
    amsT_FirstName: string;
    amsT_Date: string;
    amsT_DOB: string;
    amsT_Sex: string;
    amsT_MotherName: string;
    amsT_FatherName: string;
    amsT_emailId: string;
    amsT_MobileNo: number;
    amsT_StuBankAccNo: string | null;
    amsT_AadharNo: string | null;
    amsT_AdmNo: string;
    amsT_BirthCertNO: string | null;
    amsT_BloodGroup: string | null;
    amsT_FatherAadharNo: string | null;
    amsT_FatherBankAccNo: string | null;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    AMST_Photoname: string;
    addressd1: string;
}

export const studentSearchColumns: ColumnDef<StudentData>[] = [
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
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'AMST_Photoname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Photo' />,
        cell: ({ row }) => (
            <img src={row.getValue('AMST_Photoname')} alt={row.original.amsT_FirstName} className='h-12 w-12 rounded-full object-cover' />
        ),
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reg. No' />,
        cell: ({ row }) => <div>{row.getValue('amsT_RegistrationNo')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('amsT_FirstName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_Sex',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />,
        cell: ({ row }) => <div>{row.getValue('amsT_Sex')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_DOB',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DOB' />,
        cell: ({ row }) => <div>{row.getValue('amsT_DOB')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_FatherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Father Name' />,
        cell: ({ row }) => <div>{row.getValue('amsT_FatherName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_MobileNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile' />,
        cell: ({ row }) => {
            const mobile = row.getValue('amsT_MobileNo');
            return <div>{mobile || 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_emailId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
        cell: ({ row }) => {
            const email = row.getValue('amsT_emailId');
            return <div>{email || 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    }
];
