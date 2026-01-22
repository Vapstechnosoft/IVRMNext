'use client';

import { ColumnHeader } from '@/components/ui/view-data-table/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

// STUDENT REPORT COLUMNS
export const studentReportColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'studentname',
        header: ({ column }) => <ColumnHeader column={column} title='Student Name' />
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: ({ column }) => <ColumnHeader column={column} title='Class' />
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: ({ column }) => <ColumnHeader column={column} title='Section' />
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: ({ column }) => <ColumnHeader column={column} title='Room' />
    },
    {
        accessorKey: 'HLHSALT_VacatedDate',
        header: ({ column }) => <ColumnHeader column={column} title='Vacate Date' />,
        cell: ({ row }) => row.original.HLHSALT_VacatedDate ? format(new Date(row.original.HLHSALT_VacatedDate), 'dd/MM/yyyy') : '-'
    },
    {
        accessorKey: 'HLHSALT_AllotmentDate',
        header: ({ column }) => <ColumnHeader column={column} title='Allot Date' />,
        cell: ({ row }) => row.original.HLHSALT_AllotmentDate ? format(new Date(row.original.HLHSALT_AllotmentDate), 'dd/MM/yyyy') : '-'
    },
    {
        accessorKey: 'HLHSALT_VacateRemarks',
        header: ({ column }) => <ColumnHeader column={column} title='Remarks' />
    }
];

// STAFF REPORT COLUMNS
export const staffReportColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'staffname',
        header: ({ column }) => <ColumnHeader column={column} title='Staff Name' />
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <ColumnHeader column={column} title='Department' />
    },
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <ColumnHeader column={column} title='Designation' />
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: ({ column }) => <ColumnHeader column={column} title='Room' />
    },
    {
        accessorKey: 'HLHSTALT_VacatedDate',
        header: ({ column }) => <ColumnHeader column={column} title='Vacate Date' />,
        cell: ({ row }) => row.original.HLHSTALT_VacatedDate ? format(new Date(row.original.HLHSTALT_VacatedDate), 'dd/MM/yyyy') : '-'
    },
    {
        accessorKey: 'HLHSTALT_AllotmentDate',
        header: ({ column }) => <ColumnHeader column={column} title='Allot Date' />,
        cell: ({ row }) => row.original.HLHSTALT_AllotmentDate ? format(new Date(row.original.HLHSTALT_AllotmentDate), 'dd/MM/yyyy') : '-'
    },
    {
        accessorKey: 'HLHSTALT_VacateRemarks',
        header: ({ column }) => <ColumnHeader column={column} title='Remarks' />
    }
];

// GUEST REPORT COLUMNS
export const guestReportColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'HLHGSTALT_GuestName',
        header: ({ column }) => <ColumnHeader column={column} title='Guest Name' />
    },
    {
        accessorKey: 'HLHGSTALT_GuestAddress',
        header: ({ column }) => <ColumnHeader column={column} title='Address' />
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: ({ column }) => <ColumnHeader column={column} title='Room' />
    },
    {
        accessorKey: 'HLHGSTALT_VacatedDate',
        header: ({ column }) => <ColumnHeader column={column} title='Vacate Date' />,
        cell: ({ row }) => row.original.HLHGSTALT_VacatedDate ? format(new Date(row.original.HLHGSTALT_VacatedDate), 'dd/MM/yyyy') : '-'
    },
    {
        accessorKey: 'HLHGSTALT_AllotmentDate',
        header: ({ column }) => <ColumnHeader column={column} title='Allot Date' />,
        cell: ({ row }) => row.original.HLHGSTALT_AllotmentDate ? format(new Date(row.original.HLHGSTALT_AllotmentDate), 'dd/MM/yyyy') : '-'
    },
    {
        accessorKey: 'HLHGSTALT_VacateRemarks',
        header: ({ column }) => <ColumnHeader column={column} title='Remarks' />
    }
];
