'use client';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeDetail } from '@/types/hrms/hrms-config/transaction';
import type { ColumnDef } from '@tanstack/react-table';
interface SalaryApprovalColumnsProps {
    employees: EmployeeDetail[];
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
}
export function getSalaryApprovalColumns({
    employees,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll
}: SalaryApprovalColumnsProps): ColumnDef<EmployeeDetail>[] {
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
            accessorKey: 'HRME_Id',
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
            accessorKey: 'HRES_WorkingDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Working Days' />,
            cell: ({ row }) => <div className='text-right'>{row.getValue('HRES_WorkingDays') || 0}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRES_LOPDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='LOP Days' />,
            cell: ({ row }) => <div className='text-right'>{row.getValue('HRES_LOPDays') || 0}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'GrossSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Salary' />,
            cell: ({ row }) => {
                const value = row.getValue('GrossSalary') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'DA',
            header: ({ column }) => <DataTableColumnHeader column={column} title='DA' />,
            cell: ({ row }) => {
                const value = row.getValue('DA') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'HRA',
            header: ({ column }) => <DataTableColumnHeader column={column} title='HRA' />,
            cell: ({ row }) => {
                const value = row.getValue('HRA') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'Conveyance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Conveyance' />,
            cell: ({ row }) => {
                const value = row.getValue('Conveyance') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'Medical',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Medical' />,
            cell: ({ row }) => {
                const value = row.getValue('Medical') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'SplAllowance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Spl Allowance' />,
            cell: ({ row }) => {
                const value = row.getValue('SplAllowance') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'TotalEarning',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Earning' />,
            cell: ({ row }) => {
                const employee = row.original;
                // Auto-calculate: sum of all earnings
                const totalEarning = Number(employee.DA || 0) + 
                    Number(employee.HRA || 0) + 
                    Number(employee.Conveyance || 0) + 
                    Number(employee.Medical || 0) + 
                    Number(employee.SplAllowance || 0);
                return <div className='text-right font-semibold'>₹{totalEarning.toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'PF',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PF' />,
            cell: ({ row }) => {
                const value = row.getValue('PF') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'ESI',
            header: ({ column }) => <DataTableColumnHeader column={column} title='ESI' />,
            cell: ({ row }) => {
                const value = row.getValue('ESI') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'OthersCD',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Others (C.D)' />,
            cell: ({ row }) => {
                const value = row.getValue('OthersCD') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'PT',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PT' />,
            cell: ({ row }) => {
                const value = row.getValue('PT') as number;
                return <div className='text-right'>₹{Number(value || 0).toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'TotalDeduction',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Deduction' />,
            cell: ({ row }) => {
                const employee = row.original;
                // Auto-calculate: sum of all deductions
                const totalDeduction = Number(employee.PF || 0) + 
                    Number(employee.ESI || 0) + 
                    Number(employee.OthersCD || 0) + 
                    Number(employee.PT || 0);
                return <div className='text-right font-semibold'>₹{totalDeduction.toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'NetSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Salary' />,
            cell: ({ row }) => {
                const employee = row.original;
                // Auto-calculate: Net Salary = Total Earning - Total Deduction
                const totalEarning = Number(employee.DA || 0) + 
                    Number(employee.HRA || 0) + 
                    Number(employee.Conveyance || 0) + 
                    Number(employee.Medical || 0) + 
                    Number(employee.SplAllowance || 0);
                const totalDeduction = Number(employee.PF || 0) + 
                    Number(employee.ESI || 0) + 
                    Number(employee.OthersCD || 0) + 
                    Number(employee.PT || 0);
                const netSalary = totalEarning - totalDeduction;
                return (
                    <div className='text-right'>
                        <Badge variant='default' className='font-semibold'>
                            ₹{netSalary.toFixed(2)}
                        </Badge>
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: true
        }
    ];
}
