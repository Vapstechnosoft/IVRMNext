'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export const birthCertificateColumns: ColumnDef<any>[] = [
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
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('amsT_FirstName') ?? row.original.studentName ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No.' />,
        cell: ({ row }) => <div>{row.getValue('amsT_AdmNo') ?? row.original.admNo ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No.' />,
        cell: ({ row }) => <div>{row.getValue('amsT_RegistrationNo') ?? row.original.regNo ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName') ?? row.original.className ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Name' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName') ?? row.original.sectionName ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_DOB',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Birth' />,
        cell: ({ row }) => {
            const dob = row.getValue('amsT_DOB') ?? row.original.dob;
            if (!dob) return <div>N/A</div>;
            try {
                return <div>{new Date(dob as string).toLocaleDateString()}</div>;
            } catch {
                return <div>{String(dob)}</div>;
            }
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_FatherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Father Name' />,
        cell: ({ row }) => <div>{row.getValue('amsT_FatherName') ?? row.original.fatherName ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsT_MotherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mother Name' />,
        cell: ({ row }) => <div>{row.getValue('amsT_MotherName') ?? row.original.motherName ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
