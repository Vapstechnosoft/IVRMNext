'use client';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import type { ColumnDef } from '@tanstack/react-table';
export interface Employee extends EmployeeDropdown {
    calculationStatus: 'Not Calculated' | 'Calculated' | 'Recalculated';
    calculatedDate?: string;
    basicSalary?: number;
    allowances?: number;
    deductions?: number;
    netSalary?: number;
}
interface SalaryCalculationColumnsProps {
    employees: Employee[];
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
}
export function getSalaryCalculationColumns({
    employees,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll
}: SalaryCalculationColumnsProps): ColumnDef<Employee>[] {
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
            accessorKey: 'slNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No' />,
            cell: ({ row, table }) => {
                const index = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                return <div>{index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'HRME_EmployeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div>{row.getValue('HRME_EmployeeCode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRME_EmployeeFirstName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const employee = row.original;
                const fullName =
                    `${employee.HRME_EmployeeFirstName} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim();
                return <div>{fullName}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'basicSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Salary' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('basicSalary') || 0).toFixed(2)}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'allowances',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Allowances' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('allowances') || 0).toFixed(2)}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'deductions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Deductions' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('deductions') || 0).toFixed(2)}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'netSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('netSalary') || 0).toFixed(2)}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'calculationStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('calculationStatus') as string;
                const getStatusVariant = (status: string) => {
                    switch (status) {
                        case 'Not Calculated':
                            return 'secondary';
                        case 'Calculated':
                            return 'success';
                        case 'Recalculated':
                            return 'default';
                        default:
                            return 'secondary';
                    }
                };
                return <Badge variant={getStatusVariant(status) as any}>{status}</Badge>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];
}
