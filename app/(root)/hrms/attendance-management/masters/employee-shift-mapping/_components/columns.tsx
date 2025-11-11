'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface EmployeeShiftMapping {
    id: number;
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
    createdAt: Date;
}

export const employeeShiftMappingColumns: ColumnDef<EmployeeShiftMapping>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
        {
            accessorKey: 'shiftName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('shiftName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employee',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
            cell: ({ row }) => <div>{row.getValue('employee') || 'All Employees'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'holidayType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Type' />,
            cell: ({ row }) => <div>{row.getValue('holidayType')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'applicableDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Applicable Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('applicableDate')).toLocaleDateString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Work Hour' />,
            cell: ({ row }) => <div>{row.getValue('totalWork')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'halfDayWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day Work Hour' />,
            cell: ({ row }) => <div>{row.getValue('halfDayWork')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'morningLogin',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Login' />,
            cell: ({ row }) => <div>{row.getValue('morningLogin')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'morningLogout',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Logout' />,
            cell: ({ row }) => <div>{row.getValue('morningLogout')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'afternoonLogin',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Login' />,
            cell: ({ row }) => <div>{row.getValue('afternoonLogin')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'afternoonLogout',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Logout' />,
            cell: ({ row }) => <div>{row.getValue('afternoonLogout')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'delayShift',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Delay Shift' />,
            cell: ({ row }) => <div>{row.getValue('delayShift')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'earlyShift',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Early Shift' />,
            cell: ({ row }) => <div>{row.getValue('earlyShift')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'lunchHour',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Lunch Hour' />,
            cell: ({ row }) => <div>{row.getValue('lunchHour')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
            accessorFn: (row: any) => row,
            enableSorting: false,
            cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
        }
    ];

function ActionButtonsCell({ rowData }: { rowData: EmployeeShiftMapping }) {
    const { openEditForm } = useFormContext<EmployeeShiftMapping>();

    const handleEdit = useCallback(
        (data: EmployeeShiftMapping) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: false }}
            onEdit={handleEdit}
        />
    );
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
