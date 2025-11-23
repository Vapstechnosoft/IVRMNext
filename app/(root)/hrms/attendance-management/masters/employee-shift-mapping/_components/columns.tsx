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
}

export const employeeShiftMappingColumns: ColumnDef<EmployeeShiftMapping>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false,
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
    const { openEditForm, openDeleteForm } = useFormContext<EmployeeShiftMapping>();

    const handleEdit = useCallback(
        (data: EmployeeShiftMapping) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: EmployeeShiftMapping) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}

// Dropdown options are now fetched from API via useEmployeeShiftMappingDropdowns hook
// These exports are kept for backward compatibility but should be replaced with API data
export const employeeTypeOptions: string[] = [];
export const dayTypeOptions: string[] = [];
export const typeOptions: string[] = [];
export const departmentOptions: string[] = [];
export const designationOptions: string[] = [];
export const shiftNames: string[] = [];
export const employeeOptions: Array<{ label: string; value: string }> = [];
