'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useFeePrevilegeList } from '@/hooks/fees/useMasters';
import type { IFeePrivilegeList } from '@/types/fees/masters/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddFeePrivilegeForm from './_components/add-form';
import { feePrivilegeColumns } from './_components/columns';
import UpdateFeePrivilegeForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeePrivilegePage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useFeePrevilegeList();

    return (
        <FormProvider<IFeePrivilegeList>>
            <FeePrivilegePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function FeePrivilegePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IFeePrivilegeList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button type='button' onClick={openAddForm} className='w-fit transition-all duration-200 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Fee Privilege
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='transition-shadow duration-300'>
                    <GenericDataTable<IFeePrivilegeList>
                        {...tableProps}
                        columns={feePrivilegeColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading fee privileges...'
                        noDataTitle='No Fee Privileges Found'
                        noDataDescription='Get started by creating your first fee privilege'
                        errorTitle='Error Loading Fee Privileges'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IFeePrivilegeList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Fee Privilege'
                        description='Fill in the details below to create a new fee privilege'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='transition-all duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='outline'
                                size='sm'
                                className='-top-8 absolute right-4 w-fit transition-all duration-200 hover:scale-105'>
                                <X className='h-4 w-4' />
                                Close
                            </Button>
                            <AddFeePrivilegeForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Fee Privilege'
                        description='Update the details below to modify the fee privilege'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='transition-all duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='outline'
                                size='sm'
                                className='-top-8 absolute right-4 w-fit transition-all duration-200 hover:scale-105'>
                                <X className='h-4 w-4' />
                                Close
                            </Button>
                            <UpdateFeePrivilegeForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
