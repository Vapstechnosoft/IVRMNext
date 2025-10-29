'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { useSalaryUpdationList } from '@/hooks/hrms/useSalaryUpdation';
import type { SalaryUpdationItem } from '@/types/hrms/salary-updation';
import AddSalaryUpdationForm from './_components/add-form';
import { salaryUpdationColumns } from './_components/columns';
import UpdateSalaryUpdationForm from './_components/update-form';

export default function SalaryUpdationPage() {
    const { data: onloadData, isLoading, error } = useSalaryUpdationList({ roleId: 2 });

    if (error) {
        return (
            <div className='flex h-full items-center justify-center'>
                <CollapsibleSection
                    title='Error'
                    description='Failed to load salary updation data.'
                    variant='destructive'
                    defaultOpen={true}>
                    <p className='text-destructive-foreground'>{error.message}</p>
                </CollapsibleSection>
            </div>
        );
    }

    const updationList = onloadData?.salaryUpdationList || [];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <FormProvider<SalaryUpdationItem>
                    addFormTitle='Add Salary Updation'
                    addFormDescription='Create a new salary updation record.'
                    updateFormTitle='Update Salary Updation'
                    updateFormDescription='Modify the selected salary updation record.'
                    addForm={(onSuccess) => <AddSalaryUpdationForm onloadData={onloadData} onSuccess={onSuccess} />}
                    updateForm={(selectedRow, onSuccess) => (
                        <UpdateSalaryUpdationForm selectedRow={selectedRow} onloadData={onloadData} onSuccess={onSuccess} />
                    )}>
                    <GenericDataTable
                        data={updationList}
                        columns={salaryUpdationColumns}
                        isLoading={isLoading}
                        dataKey='HRESU_Id'
                        noDataTitle='No Salary Updations'
                        noDataDescription="Click 'Add Salary Updation' to create your first salary updation record."
                        errorTitle='Error Loading Salary Updations'
                    />
                </FormProvider>
            </div>
        </div>
    );
}
