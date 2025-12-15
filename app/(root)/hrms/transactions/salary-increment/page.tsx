'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteSalaryIncrement, useSalaryIncrementList } from '@/hooks/hrms/useTransactions';
import type { SalaryIncrementGridItem } from '@/types/hrms/salary-increment';
import { TrendingUp, X } from 'lucide-react';
import { use } from 'react';
import AddSalaryIncrementForm from './_components/add-form';
import { salaryIncrementColumns } from './_components/columns';
import DeleteSalaryIncrementForm from './_components/delete-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SalaryIncrementProcessPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useSalaryIncrementList(searchParams);

    return (
        <FormProvider<SalaryIncrementGridItem>>
            <SalaryIncrementProcessPageContent response={response} isLoading={isLoading} error={error} refetch={refetchAll} />
        </FormProvider>
    );
}
function SalaryIncrementProcessPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const {
        openAddForm,
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isDeleteFormOpen,
        closeDeleteForm,
        selectedRow
    } = useFormContext<SalaryIncrementGridItem>();
    const deleteMutation = useDeleteSalaryIncrement();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <TrendingUp className='h-4 w-4' />
                        Add Increment
                    </Button>
                </div>
                {/* Add Form */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Add Salary Increment'
                            description='Fill in the details below to add a new salary increment'
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
                                <AddSalaryIncrementForm
                                    response={response}
                                    onSuccess={() => {
                                        closeAddForm();
                                        refetch();
                                    }}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
                {/* Delete Form */}
                {isDeleteFormOpen && selectedRow && <DeleteSalaryIncrementForm rowData={selectedRow} onClose={closeDeleteForm} />}
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<SalaryIncrementGridItem>
                        {...tableProps}
                        columns={salaryIncrementColumns}
                        isLoading={isLoading || deleteMutation.isPending}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading salary increments...'
                        noDataTitle='No Salary Increments Found'
                        noDataDescription='Get started by creating your first salary increment'
                        errorTitle='Error Loading Salary Increments'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
