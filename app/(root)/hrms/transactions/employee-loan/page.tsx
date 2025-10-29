'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { useEmployeeLoanList } from '@/hooks/hrms/useEmployeeLoan';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import AddEmployeeLoanForm from './_components/add-form';
import { employeeLoanColumns } from './_components/columns';
import UpdateEmployeeLoanForm from './_components/update-form';

export default function EmployeeLoanPage() {
    const { data: onloadData, isLoading, error } = useEmployeeLoanList({ roleId: 2 });

    if (error) {
        return (
            <div className='flex h-full items-center justify-center'>
                <CollapsibleSection title='Error' description='Failed to load employee loan data.' variant='destructive' defaultOpen={true}>
                    <p className='text-destructive-foreground'>{error.message}</p>
                </CollapsibleSection>
            </div>
        );
    }

    const loanList = onloadData?.emploanList || [];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <FormProvider<EmployeeLoanItem>
                    addFormTitle='Add Employee Loan'
                    addFormDescription='Create a new employee loan record.'
                    updateFormTitle='Update Employee Loan'
                    updateFormDescription='Modify the selected employee loan record.'
                    addForm={(onSuccess) => <AddEmployeeLoanForm onloadData={onloadData} onSuccess={onSuccess} />}
                    updateForm={(selectedRow, onSuccess) => (
                        <UpdateEmployeeLoanForm selectedRow={selectedRow} onloadData={onloadData} onSuccess={onSuccess} />
                    )}>
                    <GenericDataTable
                        data={loanList}
                        columns={employeeLoanColumns}
                        isLoading={isLoading}
                        dataKey='HREL_Id'
                        noDataTitle='No Employee Loans'
                        noDataDescription="Click 'Add Employee Loan' to create your first employee loan record."
                        errorTitle='Error Loading Employee Loans'
                    />
                </FormProvider>
            </div>
        </div>
    );
}
