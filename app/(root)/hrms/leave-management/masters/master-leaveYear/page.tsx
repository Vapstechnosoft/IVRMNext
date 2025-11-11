'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterLeaveYear } from '@/hooks/hrms/leave-management/useMasters';
import { Plus, X } from 'lucide-react';
import AddMasterLeaveYearForm from './_components/add-form';
import { leaveYearColumns, type LeaveYear } from './_components/columns';
import UpdateMasterLeaveYearForm from './_components/update-form';

export default function MasterLeaveYearPage() {
    const { data: response, isLoading, error } = useMasterLeaveYear();

    return (
        <FormProvider<LeaveYear>>
            <MasterLeaveYearPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterLeaveYearPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<LeaveYear>();
    const tableProps = useDataTableProps({
        data: response?.data || [],
        totalItems: response?.data?.length || 0
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Master Leave Year Management' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Leave Year
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Master Leave Year Details'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveYear>
                        {...tableProps}
                        columns={leaveYearColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave year...'
                        noDataTitle='No Leave Year Found'
                        noDataDescription='Get started by creating your first leave year'
                        errorTitle='Error Loading Leave Year'
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
        selectedRow,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<LeaveYear>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Leave Year'
                        description='Fill in the details below to create a new leave year'
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
                            <AddMasterLeaveYearForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Leave Year'
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
                            <UpdateMasterLeaveYearForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
