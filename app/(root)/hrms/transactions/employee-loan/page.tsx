'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useActivateDeactivateEmployeeLoan, useEmployeeLoanList } from '@/hooks/hrms/useTransactions';
import type { EmployeeDropdown, EmployeeLoanItem, MasterLoanDropdown } from '@/types/hrms/employee-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ActionsCell } from './_components/actions-cell';
import FormSections from './_components/form-sections';

export default function EmployeeLoanPage() {
    const roleId = 2;
    const { data: loanData, isLoading, refetch } = useEmployeeLoanList({ roleId });

    return (
        <FormProvider<EmployeeLoanItem>>
            <EmployeeLoanPageContent loanData={loanData} isLoading={isLoading} refetch={refetch} />
        </FormProvider>
    );
}

function EmployeeLoanPageContent({
    loanData,
    isLoading,
    refetch
}: {
    loanData: any;
    isLoading: boolean;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<EmployeeLoanItem>();
    const toggleMutation = useActivateDeactivateEmployeeLoan();

    const loans = loanData?.emploanList || [];
    const employees = loanData?.employeedropdown || [];
    const loanTypes = loanData?.masterloandropdown || [];
    const _paymentModes = loanData?.modeOfPaymentdropdown || [];

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        toggleMutation.mutate(
            {
                HREL_Id: id,
                HREL_ActiveFlag: !currentStatus,
                roleId: 2
            },
            {
                onSuccess: () => {
                    toast.success(`Employee loan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                }
            }
        );
    };

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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Forms Section */}
                <FormSections onloadData={loanData} onSuccess={refetch} />

                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Employee Loan
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <EmployeeLoanTable
                        loans={loans}
                        isLoading={isLoading}
                        onToggleActive={handleToggleActive}
                        getEmployeeName={getEmployeeName}
                        getEmployeeCode={getEmployeeCode}
                        getLoanTypeName={getLoanTypeName}
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}

interface EmployeeLoanTableProps {
    loans: EmployeeLoanItem[];
    isLoading: boolean;
    onToggleActive: (id: number, currentStatus: boolean) => void;
    getEmployeeName: (employeeId: number) => string;
    getEmployeeCode: (employeeId: number) => string;
    getLoanTypeName: (loanTypeId: number) => string;
}

function EmployeeLoanTable({
    loans,
    isLoading,
    onToggleActive,
    getEmployeeName,
    getEmployeeCode,
    getLoanTypeName
}: EmployeeLoanTableProps) {
    const columns: ColumnDef<EmployeeLoanItem>[] = [
        {
            id: 'serialNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='S.No.' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div>{continuousIndex}</div>;
            },
            enableSorting: false,
            enableHiding: false
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
            header: 'Actions',
            cell: ({ row }) => <ActionsCell row={row} onToggleActive={onToggleActive} />,
            enableSorting: false,
            enableHiding: false
        }
    ];

    return (
        <div className='overflow-hidden rounded-lg bg-card'>
            <DataTable
                isLoading={isLoading}
                columns={columns}
                data={loans}
                totalItems={loans.length}
                showViewOptions={true}
                columnPinning={{ right: ['actions'] }}
            />
        </div>
    );
}
