'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { EmployeeDropdown, LeaveYearDropdown, MonthDropdown, SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface SalaryAdvance extends SalaryAdvanceItem {
    selected?: boolean;
}

interface SalaryAdvanceColumnsProps {
    selectedAdvances: number[];
    onSelectAll: (selected: boolean) => void;
    onAdvanceSelect: (advanceId: number, selected: boolean) => void;
    employees: EmployeeDropdown[];
    leaveYears: LeaveYearDropdown[];
    months: MonthDropdown[];
    advances: SalaryAdvance[];
}

/**
 * Generate columns for salary advance table
 */
export function getSalaryAdvanceColumns({
    selectedAdvances,
    onSelectAll,
    onAdvanceSelect,
    employees,
    leaveYears,
    months,
    advances
}: SalaryAdvanceColumnsProps): ColumnDef<SalaryAdvance>[] {
    const getEmployeeCode = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp.HRME_Id === employeeId);
        return employee?.HRME_EmployeeCode || `EMP${employeeId}`;
    };

    const getEmployeeName = (employee: EmployeeDropdown | null | undefined) => {
        if (!employee) return 'N/A';
        return (
            `${employee.HRME_EmployeeFirstName || ''} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim() ||
            'N/A'
        );
    };

    const getEmployeeNameById = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp.HRME_Id === employeeId);
        return getEmployeeName(employee || null);
    };

    const getLeaveYearName = (yearId: number) => {
        const year = leaveYears.find((y: LeaveYearDropdown) => y.HRMLY_Id === yearId);
        return year?.HRMLY_LeaveYear || `Year ${yearId}`;
    };

    const getMonthName = (monthId: number) => {
        const month = months.find((m: MonthDropdown) => m.IVRM_Month_Id === monthId);
        return month?.IVRM_Month_Name || `Month ${monthId}`;
    };

    return [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={advances.length > 0 && selectedAdvances.length === advances.length}
                    onCheckedChange={(value) => onSelectAll(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedAdvances.includes(row.original.HRESA_Id)}
                    onCheckedChange={(value) => onAdvanceSelect(row.original.HRESA_Id, !!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'HRESA_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No.' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                return <div>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'HRME_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div>{getEmployeeCode(row.getValue('HRME_Id'))}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRME_Id',
            id: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                // Try to get employee name from MasterEmployee first, then fallback to lookup
                const masterEmployee = (row.original as any).MasterEmployee as EmployeeDropdown | undefined;
                const employeeId = row.original.HRME_Id;
                if (masterEmployee) {
                    return <div>{getEmployeeName(masterEmployee)}</div>;
                }
                // Fallback to lookup from employeedropdown
                return <div>{getEmployeeNameById(employeeId)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRESA_AdvYear',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Year' />,
            cell: ({ row }) => <div>{getLeaveYearName(row.getValue('HRESA_AdvYear'))}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRESA_AdvMonth',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Month' />,
            cell: ({ row }) => <div>{getMonthName(Number(row.getValue('HRESA_AdvMonth')))}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRESA_AppliedAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Amount' />,
            cell: ({ row }) => <div>₹{row.getValue('HRESA_AppliedAmount')?.toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRESA_AdvStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('HRESA_AdvStatus') as string;
                return (
                    <span
                        className={cn(
                            'rounded-full px-2 py-1 font-medium text-xs',
                            status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                        )}>
                        {status}
                    </span>
                );
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
            accessorFn: (row: any) => row,
            enableSorting: false,
            cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
        }
    ];
}

function ActionButtonsCell({ rowData }: { rowData: SalaryAdvanceItem }) {
    const { openEditForm, openToggleForm } = useFormContext<SalaryAdvanceItem>();

    const handleEdit = useCallback(
        (data: SalaryAdvanceItem) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: SalaryAdvanceItem) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='HRESA_ActiveFlag'
        />
    );
}

