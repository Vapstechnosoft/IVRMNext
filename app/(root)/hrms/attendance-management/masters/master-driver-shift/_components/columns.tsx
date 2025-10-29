'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface DriverShift {
    id: number;
    shift: string;
    driver: string;
    fromDate: string;
    toDate: string;
    remarks?: string;
    saturdayOff: boolean;
    sundayWorking: boolean;
    createdAt: string;
}

interface DriverShiftColumnsProps {
    onEdit: (row: DriverShift) => void;
    onDelete: (row: DriverShift) => void;
}

export const getDriverShiftColumns = ({ onEdit, onDelete }: DriverShiftColumnsProps): ColumnDef<DriverShift>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'driver',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Driver Name' />
    },
    {
        accessorKey: 'shift',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />
    },
    {
        accessorKey: 'sundayWorking',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sunday Working Flag' />,
        cell: ({ row }) => <div>{row.getValue('sundayWorking') ? '✔' : '✖'}</div>
    },
    {
        accessorKey: 'saturdayOff',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Saturday Off Flag' />,
        cell: ({ row }) => <div>{row.getValue('saturdayOff') ? '✔' : '✖'}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const driverShift = row.original;
            return (
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={() => onEdit(driverShift)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm' className='text-red-600' onClick={() => onDelete(driverShift)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
