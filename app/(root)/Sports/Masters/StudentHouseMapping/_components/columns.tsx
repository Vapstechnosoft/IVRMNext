'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StudentHouseMappingDTO } from '@/types/sports/masters/student-house-mapping';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';

// Define the columns
export const columns = (
    onEdit: (data: StudentHouseMappingDTO) => void,
    onDelete: (id: number, activeFlag: boolean) => void
): ColumnDef<StudentHouseMappingDTO>[] => [
        {
            accessorKey: 'spccsH_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='pl-6'>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'asmaY_Year',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Year
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'spccmH_HouseName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        House Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'studentname',
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
            accessorKey: 'amsT_AdmNo',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Adm No.
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'asmcL_ClassName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Class
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'asmC_SectionName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Section
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'spccsH_Remarks',
            header: 'Remark',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <ActionButtons
                    rowData={row.original}
                    buttons={{
                        edit: true,
                        toggle: true,
                        delete: false
                    }}
                    onEdit={() => onEdit(row.original)}
                    onToggle={() => onDelete(row.original.spccsH_Id!, row.original.spccmH_ActiveFlag!)}
                    toggleConditionKey='spccmH_ActiveFlag'
                />
            )
        },
    ];
