'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeDropdown } from '@/types/hrms/mass-updation';
import type { ColumnDef } from '@tanstack/react-table';

interface Employee extends EmployeeDropdown {
    selected?: boolean;
}

interface MassUpdationColumnsProps {
    selectedEmployees: number[];
    onSelectAll: (selected: boolean) => void;
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    employees: Employee[];
}

/**
 * Generate columns for mass updation employee table
 * Includes checkbox for selection, Employee Code, and Employee Name
 */
export function getMassUpdationColumns({
    selectedEmployees,
    onSelectAll,
    onEmployeeSelect,
    employees
}: MassUpdationColumnsProps): ColumnDef<Employee>[] {
    return [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={employees.length > 0 && selectedEmployees.length === employees.length}
                    onCheckedChange={(value) => onSelectAll(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedEmployees.includes(row.original.HRME_Id)}
                    onCheckedChange={(value) => onEmployeeSelect(row.original.HRME_Id, !!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'HRME_EmployeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('HRME_EmployeeCode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const emp = row.original;
                const fullName = [
                    emp.HRME_EmployeeFirstName,
                    emp.HRME_EmployeeMiddleName,
                    emp.HRME_EmployeeLastName
                ]
                    .filter(Boolean)
                    .join(' ');
                return <div className='font-medium'>{fullName}</div>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];
}

