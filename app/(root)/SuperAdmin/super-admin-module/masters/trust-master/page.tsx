'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { ITrustMaster } from '@/types/super-admin/super-admin-module/trust-masters';
import { Plus, X } from 'lucide-react';
import AddTrustMasterForm from './_components/add-form';
import { TrustMasterColumns } from './_components/columns';

import { useTrustMasterData } from '@/hooks/super-admin/super-admin-module/use-trust-masters';

// Removed staticData

export default function TrustMasterPage() {
    return (
        <FormProvider<ITrustMaster>>
            <TrustMasterPageContent />
        </FormProvider>
    );
}

function TrustMasterPageContent() {
    const { openAddForm } = useFormContext<ITrustMaster>();

    // Using hardcoded values 0 and 1 as requested for initial load
    const { data: apiResponse, isLoading, error } = useTrustMasterData(0, 1);
    const trustMasters = apiResponse?.data?.organisations || [];


    return (
        <div>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Master Trust
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Trust Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                    <GenericDataTable<ITrustMaster>
                        data={trustMasters}
                        columns={TrustMasterColumns}
                        isLoading={isLoading}
                        error={error}
                        totalItems={trustMasters.length}
                        loadingMessage='Loading trust details...'
                        noDataTitle='No Trust Details Found'
                        noDataDescription='No trust details available currently.'
                        isSearchRequired={true}
                        isPaginationRequired={true}
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
        closeAddForm,
        addFormRef
    } = useFormContext<ITrustMaster>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Trust'
                        description='Fill in the details below to create a new trust'
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
                            <AddTrustMasterForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
