'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useSalaryAdvanceList } from '@/hooks/hrms/useSalaryAdvance';
import type { SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import { Plus, X } from 'lucide-react';
import AddSalaryAdvanceForm from './_components/add-form';
import { salaryAdvanceColumns } from './_components/columns';
import UpdateSalaryAdvanceForm from './_components/update-form';

export default function SalaryAdvancePage() {
    const { data: response, isLoading, error } = useSalaryAdvanceList({ roleId: 2 });

    return (
        <FormProvider<SalaryAdvanceItem>>
            <SalaryAdvancePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function SalaryAdvancePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<SalaryAdvanceItem>();

    const tableData: SalaryAdvanceItem[] = response?.empadvaList ?? [];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Page Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-3xl tracking-tight'>Salary Advance</h1>
                        <p className='text-muted-foreground'>Manage employee salary advance requests</p>
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Salary Advance
                    </Button>
                </div>

                {/* Data Table */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<SalaryAdvanceItem>
                        data={tableData}
                        columns={salaryAdvanceColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading salary advances...'
                        noDataTitle='No Salary Advances Found'
                        noDataDescription='Get started by creating your first salary advance'
                        errorTitle='Error Loading Salary Advances'
                    />
                </CollapsibleSection>

                <FormSections response={response} />
            </div>
        </div>
    );
}

function FormSections({ response }: { response: any }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<SalaryAdvanceItem>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Salary Advance'
                        description='Fill in the details below to create a new salary advance'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddSalaryAdvanceForm onloadData={response} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Salary Advance'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateSalaryAdvanceForm selectedRow={selectedRow} onloadData={response} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
