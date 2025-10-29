'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { useSalaryIncrementOnload } from '@/hooks/hrms/useSalaryIncrement';
import type { SalaryIncrementGridItem } from '@/types/hrms/salary-increment';
import AddSalaryIncrementForm from './_components/add-form';
import { salaryIncrementColumns } from './_components/columns';
import UpdateSalaryIncrementForm from './_components/update-form';

export default function SalaryIncrementPage() {
    const {
        data: onloadData,
        isLoading,
        error
    } = useSalaryIncrementOnload({
        MI_Id: 30,
        roleId: 2
    });

    if (error) {
        return (
            <div className='flex h-full items-center justify-center'>
                <CollapsibleSection
                    title='Error'
                    description='Failed to load salary increment data.'
                    variant='destructive'
                    defaultOpen={true}>
                    <p className='text-destructive-foreground'>{error.message}</p>
                </CollapsibleSection>
            </div>
        );
    }

    const gridData = onloadData?.griddata || [];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <FormProvider<SalaryIncrementGridItem>
                    addFormTitle='Add Salary Increment'
                    addFormDescription='Create a new salary increment record.'
                    updateFormTitle='Update Salary Increment'
                    updateFormDescription='Modify the selected salary increment record.'
                    addForm={(onSuccess) => <AddSalaryIncrementForm onloadData={onloadData} onSuccess={onSuccess} />}
                    updateForm={(selectedRow, onSuccess) => (
                        <UpdateSalaryIncrementForm selectedRow={selectedRow} onloadData={onloadData} onSuccess={onSuccess} />
                    )}>
                    <GenericDataTable
                        data={gridData}
                        columns={salaryIncrementColumns}
                        isLoading={isLoading}
                        dataKey='HREIC_Id'
                        noDataTitle='No Salary Increments'
                        noDataDescription="Click 'Add Salary Increment' to create your first salary increment record."
                        errorTitle='Error Loading Salary Increments'
                    />
                </FormProvider>
            </div>
        </div>
    );
}
