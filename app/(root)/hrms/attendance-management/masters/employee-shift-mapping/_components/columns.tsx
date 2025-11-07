'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Edit, MoreHorizontal, Trash2 } from 'lucide-react';

export interface EmployeeShiftMapping extends BaseEntity {
    employeeTypes: string[];
    dayTypes: string[];
    allEmployees: boolean;
    searchEmployee: string;
    type: string;
    department: string;
    designation: string;
    dayType: string;
    shiftName: string;
    applicableDate: string;
    employee: string;
    holidayType: string;
    totalWork: string;
    halfDayWork: string;
    morningLogin: string;
    morningLogout: string;
    afternoonLogin: string;
    afternoonLogout: string;
    delayShift: string;
    earlyShift: string;
    lunchHour: string;
    isActive: boolean;
}

interface GetEmployeeShiftMappingColumnsProps {
    onEdit: (mapping: EmployeeShiftMapping) => void;
    onDelete: (id: number) => void;
    onExport: () => void;
}

export function getEmployeeShiftMappingColumns({
    onEdit,
    onDelete,
    onExport
}: GetEmployeeShiftMappingColumnsProps): ColumnDef<EmployeeShiftMapping>[] {
    return [
        {
            id: 'serialNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        {
            accessorKey: 'shiftName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('shiftName')}</div>
        },
        {
            accessorKey: 'employee',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
            cell: ({ row }) => <div>{row.getValue('employee') || 'All Employees'}</div>
        },
        {
            accessorKey: 'holidayType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Type' />,
            cell: ({ row }) => <div>{row.getValue('holidayType')}</div>
        },
        {
            accessorKey: 'applicableDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Applicable Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('applicableDate')).toLocaleDateString()}</div>
        },
        {
            accessorKey: 'totalWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Work' />,
            cell: ({ row }) => <div>{row.getValue('totalWork')}</div>
        },
        {
            accessorKey: 'halfDayWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day Work' />,
            cell: ({ row }) => <div>{row.getValue('halfDayWork')}</div>
        },
        {
            accessorKey: 'morningLogin',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Login' />,
            cell: ({ row }) => <div>{row.getValue('morningLogin')}</div>
        },
        {
            accessorKey: 'morningLogout',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Logout' />,
            cell: ({ row }) => <div>{row.getValue('morningLogout')}</div>
        },
        {
            accessorKey: 'afternoonLogin',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Login' />,
            cell: ({ row }) => <div>{row.getValue('afternoonLogin')}</div>
        },
        {
            accessorKey: 'afternoonLogout',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Logout' />,
            cell: ({ row }) => <div>{row.getValue('afternoonLogout')}</div>
        },
        {
            accessorKey: 'delayShift',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Delay Shift' />,
            cell: ({ row }) => <div>{row.getValue('delayShift')}</div>
        },
        {
            accessorKey: 'earlyShift',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Early Shift' />,
            cell: ({ row }) => <div>{row.getValue('earlyShift')}</div>
        },
        {
            accessorKey: 'lunchHour',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Lunch Hour' />,
            cell: ({ row }) => <div>{row.getValue('lunchHour')}</div>
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const mapping = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Button variant='ghost' size='sm' onClick={() => onEdit(mapping)} className='w-full justify-start'>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onDelete(mapping.id)}
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

export const employeeTypeOptions = [
    'Teaching',
    'Non Teaching',
    'Administrative',
    'test',
    'assistant teacher',
    'Principal',
    'Owner of the company'
];

export const dayTypeOptions = ['PUBLIC HOLIDAY', 'WEEK END', 'WEEK DAY', 'VACATION'];
export const typeOptions = ['All'];
export const departmentOptions = ['All'];
export const designationOptions = ['All'];
export const shiftNames = ['Morning Shift', 'Evening Shift', 'Night Shift', 'General Shift'];
