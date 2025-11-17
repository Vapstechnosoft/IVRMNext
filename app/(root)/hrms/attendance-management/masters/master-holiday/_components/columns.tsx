'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

export interface MasterHoliday extends BaseEntity {
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

interface GetMasterHolidayColumnsProps {
    onEdit: (holiday: MasterHoliday) => void;
    onDelete: (id: number) => void;
}

export function getMasterHolidayColumns({ onEdit, onDelete }: GetMasterHolidayColumnsProps): ColumnDef<MasterHoliday>[] {
    return [
        {
            id: 'serialNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL. NO.' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>
        },
        {
            accessorKey: 'holidayType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
            cell: ({ row }) => <div>{row.getValue('holidayType')}</div>
        },
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div>{row.getValue('department')}</div>
        },
        {
            accessorKey: 'fromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('fromDate')).toLocaleDateString()}</div>
        },
        {
            accessorKey: 'toDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('toDate')).toLocaleDateString()}</div>
        },
        {
            accessorKey: 'isActive',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean;
                return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
            }
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const holiday = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Button variant='ghost' size='sm' onClick={() => onEdit(holiday)} className='w-full justify-start'>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onDelete(holiday.id)}
                                className='w-full justify-start text-red-600 hover:text-red-900'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];
}
