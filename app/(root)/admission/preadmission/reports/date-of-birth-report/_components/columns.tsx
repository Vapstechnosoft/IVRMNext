'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';

export const birthCertificateColumns: ColumnDef<IStudentYearlyAttendenceReportList>[] = [
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
        accessorKey: 'user_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('user_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No.' />,
        cell: ({ row }) => <div>{row.getValue('email')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'phone_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No.' />,
        cell: ({ row }) => <div>{row.getValue('phone_number')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='\tClass Name' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'section_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Name' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'working_days',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Working days' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'present_days',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Present days' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'present',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Present' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
