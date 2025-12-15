'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { EmployeeDropdown, EmployeeLoanItem, MasterLoanDropdown } from '@/types/hrms/employee-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

interface GetEmployeeLoanColumnsProps {
    employees: EmployeeDropdown[];
    loanTypes: MasterLoanDropdown[];
}

export function getEmployeeLoanColumns({ employees, loanTypes }: GetEmployeeLoanColumnsProps): ColumnDef<EmployeeLoanItem>[] {
    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp?.HRME_Id === employeeId);
        if (!employee) return 'Unknown Employee';
        const firstName = employee.HRME_EmployeeFirstName || '';
        const middleName = employee.HRME_EmployeeMiddleName || '';
        const lastName = employee.HRME_EmployeeLastName || '';
        return `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown Employee';
    };

    const getEmployeeCode = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp?.HRME_Id === employeeId);
        return employee?.HRME_EmployeeCode || 'Unknown';
    };

    const getLoanTypeName = (loanTypeId: number) => {
        const loanType = loanTypes.find((type: MasterLoanDropdown) => type?.HRMLN_Id === loanTypeId);
        return loanType?.HRML_LoanType || 'Unknown Loan Type';
    };

    return [
        {
            id: 'serialNo',
            header: () => <div className='text-center font-medium'>S.No.</div>,
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
            id: 'employee',
            accessorKey: 'HRME_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
            cell: ({ row }) => {
                const employeeId = row.getValue('employee') as number;
                return (
                    <div>
                        <div className='font-medium'>{getEmployeeName(employeeId)}</div>
                        <div className='text-muted-foreground text-sm'>{getEmployeeCode(employeeId)}</div>
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'loanType',
            accessorKey: 'HRMLN_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' />,
            cell: ({ row }) => <div>{getLoanTypeName(row.getValue('loanType'))}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'amount',
            accessorKey: 'HREL_LoanAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('amount')).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'installments',
            accessorKey: 'HREL_LoanInsallments',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Installments' />,
            cell: ({ row }) => <div>{row.getValue('installments')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'emi',
            accessorKey: 'HREL_LaonEMI',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Loan EMI' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('emi') || 0).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'appliedDate',
            accessorKey: 'HREL_AppliedDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Date' />,
            cell: ({ row }) => {
                const date = row.getValue('appliedDate') as string;
                return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : '-'}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'status',
            accessorKey: 'HREL_LoanStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const loan = row.original;
                const isActive = loan.HREL_ActiveFlag === true;
                return (
                    <Badge variant={isActive ? 'success' : 'destructive'} className='text-xs'>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'totalPending',
            accessorKey: 'HREL_TotalPending',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Pending' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('totalPending') || 0).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
            cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
            enableSorting: false,
            enableHiding: false
        }
    ];
}

function ActionButtonsCell({ rowData }: { rowData: EmployeeLoanItem }) {
    const { openEditForm, openToggleForm } = useFormContext<EmployeeLoanItem>();

    const handleEdit = useCallback(
        (data: EmployeeLoanItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: EmployeeLoanItem) => {
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
            toggleConditionKey='HREL_ActiveFlag'
        />
    );
}

