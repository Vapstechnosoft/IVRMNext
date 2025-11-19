'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterFeeInstallmentDueDate } from '@/hooks/fees/useMasters';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddMasterInstallmentDueDateForm from './_components/add-form';
import { masterInstallmentDueDateColumns } from './_components/columns';
import ToggleMasterInstallmentDueDateForm from './_components/toggle-form';
import UpdateMasterFeeInstallmentDueDateForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterFeeDueDate(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterFeeInstallmentDueDate(searchParams);

    return (
        <FormProvider<IMasterFeesInstallmentDueDateList>>
            <MasterFeeDueDateContent response={response as any} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterFeeDueDateContent({
    response,
    isLoading,
    error
}: {
    response: IMasterFeesInstallmentDueDateList[];
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterFeesInstallmentDueDateList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading title='' description='' />
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Fee Installment Due Date
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterFeesInstallmentDueDateList>
                        {...tableProps}
                        columns={masterInstallmentDueDateColumns}
                        isLoading={isLoading}
                        error={error}
                        loadingMessage='Loading master Fees Installment Due Date...'
                        noDataTitle='No Master Fees Installment Due Date Found'
                        noDataDescription='Get started by creating your first master Fees Installment Due Date'
                        errorTitle='Error Loading Fees Installment Due Date'
                        columnPinning={{ right: ['actions'] }}
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterFeesInstallmentDueDateList>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Fees Installment Due Date'
                        description='Fill in the details below to create a new Fees Installment Due Date'
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
                            <AddMasterInstallmentDueDateForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Fees Installment Due Date'
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
                            <UpdateMasterFeeInstallmentDueDateForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && <ToggleMasterInstallmentDueDateForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
