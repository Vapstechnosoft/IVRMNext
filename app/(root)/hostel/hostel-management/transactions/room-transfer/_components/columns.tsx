'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const columns: ColumnDef<any>[] = [
    {
        id: 'slNo',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'studentname',
        header: 'Name',
        cell: ({ row }) => {
            const data = row.original;
            return data.studentname || data.staffname || data.HLHGSTALT_GuestName;
        }
    },
    {
        accessorKey: 'AMCO_CourseName',
        header: 'Course/Dept',
        cell: ({ row }) => {
            const data = row.original;
            return data.AMCO_CourseName || data.HRMD_DepartmentName || 'N/A';
        }
    },
    {
        accessorKey: 'HLMH_Name',
        header: 'Hostel',
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: 'Room',
    },
    {
        accessorKey: 'HLHSALTC_VacatedDate',
        header: 'Vacate Date',
        cell: ({ row }) => {
            const date = row.original.HLHSALTC_VacatedDate || row.original.HLHSTALT_VacatedDate || row.original.HLHGSTALT_VacatedDate;
            return date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
        }
    },
    {
        accessorKey: 'HLHSALTC_VacateRemarks',
        header: 'Remarks',
        cell: ({ row }) => {
            const remarks = row.original.HLHSALTC_VacateRemarks || row.original.HLHSTALT_VacateRemarks || row.original.HLHGSTALT_VacateRemarks;
            return remarks || 'N/A';
        }
    }
];
