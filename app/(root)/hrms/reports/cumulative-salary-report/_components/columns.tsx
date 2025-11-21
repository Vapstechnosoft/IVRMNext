'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { SalaryReportRecord } from '@/types/hrms/reports/cumulative-salary-report';
import type { ColumnDef } from '@tanstack/react-table';

// Use API types directly
export type CumulativeSalaryRecord = SalaryReportRecord;

// Table columns - Matching the exact structure from the image
export const cumulativeSalaryColumns: ColumnDef<CumulativeSalaryRecord>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 60
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => {
            const record = row.original;
            const fullName = `${record.HRME_EmployeeFirstName || ''} ${record.HRME_EmployeeMiddleName || ''} ${
                record.HRME_EmployeeLastName || ''
            }`.trim();
            return <div className='font-medium'>{fullName}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designation')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    // Earnings Section
    {
        accessorKey: 'basic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='BASIC' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('basic') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'da',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DA' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('da') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hra',
        header: ({ column }) => <DataTableColumnHeader column={column} title='HRA' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('hra') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'conveyance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Conveyance' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('conveyance') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'medical',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Medical' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('medical') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'splAllowance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Spl Allowance' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('splAllowance') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'grossEarning',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Earning' />,
        cell: ({ row }) => <div className='text-right font-semibold'>₹{(row.getValue('grossEarning') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    // Deductions Section
    {
        accessorKey: 'pf',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PF' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('pf') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'esi',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ESI' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('esi') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'others',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Others (C.D)' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('others') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PT' />,
        cell: ({ row }) => <div className='text-right'>₹{(row.getValue('pt') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'grossDeduction',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Deduction' />,
        cell: ({ row }) => <div className='text-right font-semibold'>₹{(row.getValue('grossDeduction') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'leaveDedDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Ded.No.of days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveDedDays') || 0}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'leaveDedPrevDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Ded.days of previous' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveDedPrevDays') || 0}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'netSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
        cell: ({ row }) => (
            <div className='text-right font-semibold text-green-600'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'signature',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Signature' />,
        cell: () => <div className='text-center text-muted-foreground'>-</div>,
        enableSorting: false,
        enableHiding: true
    }
];
