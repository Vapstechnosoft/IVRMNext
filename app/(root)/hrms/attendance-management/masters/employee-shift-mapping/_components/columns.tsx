'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Edit, MoreHorizontal, Trash2 } from 'lucide-react';

export interface EmployeeShiftMapping extends BaseEntity {
    employeeTypes?: string[];
    dayTypes?: string[];
    allEmployees?: boolean;
    searchEmployee?: string;
    type: string | string[];
    department: string | string[];
    designation: string | string[];
    dayType: string | string[];
    shiftName: string;
    applicableDate: string;
    employees: string[];
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
    // Timing fields
    shiftStartTime?: string;
    lunchStartTime?: string;
    shiftEndTime?: string;
    lunchEndTime?: string;
    totalWorkingHours?: string;
    delayPerShift?: string;
    halfDayWorkingHours?: string;
    earlyPerShift?: string;
    lunchHours?: string;
}

interface GetEmployeeShiftMappingColumnsProps {
    onEdit: (mapping: EmployeeShiftMapping) => void;
    onDelete: (id: number) => void;
}

export function getEmployeeShiftMappingColumns({
    onEdit,
    onDelete
}: GetEmployeeShiftMappingColumnsProps): ColumnDef<EmployeeShiftMapping>[] {
    return [
        {
            id: 'serialNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL. NO' />,
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
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Work Hour' />,
            cell: ({ row }) => <div>{row.getValue('totalWork')}</div>
        },
        {
            accessorKey: 'halfDayWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day Work Hour' />,
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
export const typeOptions = ['Teaching', 'Non Teaching', 'Administrative', 'test', 'assistant teacher', 'Principal', 'Owner of the company'];
export const departmentOptions = ['Teaching', 'JUNIOR SCHOOL', 'PRIMARY SCHOOL', 'SENIOR SCHOOL', 'Non Teaching', 'OFFICE STAFF'];
export const designationOptions = ['Assistant Teacher', 'Principal', 'Vice Principal', 'Office Assistant', 'System Manager', 'Teacher Helper', 'Electrician'];
export const shiftNames = ['Teaching Staff', 'Morning Shift', 'Evening Shift', 'Night Shift', 'General Shift'];

// Mock employee data - replace with actual data source
export const employeeOptions = [
    { label: 'abc a a', value: 'abc-a-a' },
    { label: 'arya a arya', value: 'arya-a-arya' },
    { label: 'asha a', value: 'asha-a' },
    { label: 'binod', value: 'binod' },
    { label: 'BinodA', value: 'binoda' },
    { label: 'MR ASIM KUMAR RAY', value: 'mr-asim-kumar-ray' },
    { label: 'MR AVIJIT MUKHERJEE', value: 'mr-avijit-mukherjee' },
    { label: 'MR DHRUBA GHOSH', value: 'mr-dhruba-ghosh' },
    { label: 'MR ELVIS MICHAEL JACKSON', value: 'mr-elvis-michael-jackson' },
    { label: 'MR GLEN EUSTACE NOEL DILLEN', value: 'mr-glen-eustace-noel-dillen' },
    { label: 'MR IGNASIUS LAL', value: 'mr-ignasius-lal' },
    { label: 'MR JACOB ABHINAV SARKAR', value: 'mr-jacob-abhinav-sarkar' },
    { label: 'MR JAY PRAKASH SHAW', value: 'mr-jay-prakash-shaw' },
    { label: 'MR JOHN JOYDEEP SHARMA', value: 'mr-john-joydeep-sharma' },
    { label: 'MR JOHN SHAH', value: 'mr-john-shah' }
];
