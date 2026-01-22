'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generic Header function
const sortableHeader = (title: string) => ({ column }: { column: any }) => {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            {title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

export const studentColumns: ColumnDef<any>[] = [
    { accessorKey: 'ASMAY_Year', header: sortableHeader('Year') },
    { accessorKey: 'StudentName', header: sortableHeader('Student Name') },
    { accessorKey: 'AMST_AdmNo', header: sortableHeader('Adm No') },
    { accessorKey: 'ASMCL_ClassName', header: 'Class' },
    { accessorKey: 'ASMC_SectionName', header: 'Section' },
    { accessorKey: 'HLMRCA_RoomCategory', header: 'Category' },
    { accessorKey: 'HLMH_Name', header: 'Hostel' },
    { accessorKey: 'HRMRM_RoomNo', header: 'Room No' },
    { accessorKey: 'HLHSALT_AllotRemarks', header: 'Remarks' },
    {
        accessorKey: 'HLHSALT_AllotmentDate',
        header: 'Date',
        cell: ({ row }) => row.original.HLHSALT_AllotmentDate ? new Date(row.original.HLHSALT_AllotmentDate).toLocaleDateString('en-GB') : ''
    },
];

export const staffColumns: ColumnDef<any>[] = [
    { accessorKey: 'StaffName', header: sortableHeader('Staff Name') },
    { accessorKey: 'HRMD_DepartmentName', header: 'Dept' },
    { accessorKey: 'HRMDES_DesignationName', header: 'Designation' },
    { accessorKey: 'HRME_EmployeeCode', header: 'Code' },
    {
        accessorKey: 'HLHSTALT_AllotmentDate',
        header: 'Date',
        cell: ({ row }) => row.original.HLHSTALT_AllotmentDate ? new Date(row.original.HLHSTALT_AllotmentDate).toLocaleDateString('en-GB') : ''
    },
    { accessorKey: 'HLMH_Name', header: 'Hostel' },
    { accessorKey: 'HLMRCA_RoomCategory', header: 'Category' },
    { accessorKey: 'HRMRM_RoomNo', header: 'Room No' },
    { accessorKey: 'HLHSTALT_AllotRemarks', header: 'Remarks' },
];

export const guestColumns: ColumnDef<any>[] = [
    { accessorKey: 'HLHGSTALT_GuestName', header: sortableHeader('Guest Name') },
    {
        accessorKey: 'HLHGSTALT_AllotmentDate',
        header: 'Date',
        cell: ({ row }) => row.original.HLHGSTALT_AllotmentDate ? new Date(row.original.HLHGSTALT_AllotmentDate).toLocaleDateString('en-GB') : ''
    },
    { accessorKey: 'HLMH_Name', header: 'Hostel' },
    { accessorKey: 'HLMRCA_RoomCategory', header: 'Category' },
    { accessorKey: 'HRMRM_RoomNo', header: 'Room No' },
    { accessorKey: 'HLHGSTALT_GuestPhoneNo', header: 'Phone' },
    { accessorKey: 'HLHGSTALT_GuestEmailId', header: 'Email' },
    { accessorKey: 'HLHGSTALT_GuestAddress', header: 'Address' },
    { accessorKey: 'HLHGSTALT_AllotRemarks', header: 'Remarks' },
];
