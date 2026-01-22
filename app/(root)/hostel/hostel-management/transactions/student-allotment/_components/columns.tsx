'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
// import { StudentAllotmentSchema } from '@/schemas/hostel/transactions/student-allotment.schema'; // Use generic or any if type issues arise initially

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'studentName',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Student Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class',
    },
    {
        accessorKey: 'AMST_RegistrationNo',
        header: 'Reg No',
    },
    {
        accessorKey: 'HLMH_Name',
        header: 'Hostel',
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: 'Room Category',
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: 'Room No',
    },
    {
        accessorKey: 'HLHSALT_AllotmentDate',
        header: 'Allot Date',
        cell: ({ row }) => {
            const date = row.getValue('HLHSALT_AllotmentDate');
            if (!date) return '';
            return new Date(String(date)).toLocaleDateString('en-GB');
        }
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="flex items-center gap-2">
                    {/* Placeholder for actions - usually passed via props or context if needed, 
               but for now just showing structure */}
                    {/* Logic for Edit/Deactivate would go here or in the List component */}
                </div>
            );
        },
    },
];
