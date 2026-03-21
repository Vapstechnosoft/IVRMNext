'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    try {
        return format(new Date(date), 'dd-MM-yyyy');
    } catch (e) {
        return 'N/A';
    }
};

export interface EmployeeMonthReportRow {
    hrmE_Id?: number;
    hrmE_EmployeeCode?: string;
    hrmE_EmployeeFirstName?: string;
    hrmd_DepartmentName?: string;
    hrmdeS_DesignationName?: string;
    foepD_PunchDate?: string;
    foepD_PunchInTime?: string;
    foepD_PunchOutTime?: string;
    foepD_PunchStatus?: string;
    [key: string]: any;
}

export const employeeMonthReportColumns: ColumnDef<EmployeeMonthReportRow>[] = [
    {
        accessorKey: 'hrmE_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'hrmE_EmployeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_EmployeeCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_EmployeeFirstName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrmd_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('hrmd_DepartmentName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrmdeS_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('hrmdeS_DesignationName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foepD_PunchDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.getValue('foepD_PunchDate');
            return <div>{formatDate(date)}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foepD_PunchInTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Time In' />,
        cell: ({ row }) => <div>{row.getValue('foepD_PunchInTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foepD_PunchOutTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Time Out' />,
        cell: ({ row }) => <div>{row.getValue('foepD_PunchOutTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foepD_PunchStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => <div>{row.getValue('foepD_PunchStatus')}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
