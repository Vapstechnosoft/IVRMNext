'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useLeaveCredit } from '@/hooks/hrms/leave-management/useTransactions';
import { Plus, X } from 'lucide-react';
import AddLeaveCreditForm from './_components/add-form';
import { leaveCreditColumns, type LeaveCredit } from './_components/columns';
import UpdateLeaveCreditForm from './_components/update-form';

export default function LeaveCreditPage() {
    const { data: response, isLoading, error } = useLeaveCredit();

    return (
        <FormProvider<LeaveCredit>>
            <LeaveCreditPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function LeaveCreditPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<LeaveCredit>();
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
                        <Heading title='Leave Management' description='Leave Credit Process' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit bg-blue-600 shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Leave Credit
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Leave Transfer Report'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-4'>
                        <p className='text-gray-600 text-sm'>Total grid records: {response?.data?.length || 0}</p>
                    </div>
                    <GenericDataTable<LeaveCredit>
                        {...tableProps}
                        columns={leaveCreditColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave credits...'
                        noDataTitle='No Leave Credit Found'
                        noDataDescription='Get started by creating your first leave credit'
                        errorTitle='Error Loading Leave Credit'
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
    } = useFormContext<LeaveCredit>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Leave Credit'
                        description='Fill in the details below to create a new leave credit'
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
                            <AddLeaveCreditForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Leave Credit'
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
                            <UpdateLeaveCreditForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
