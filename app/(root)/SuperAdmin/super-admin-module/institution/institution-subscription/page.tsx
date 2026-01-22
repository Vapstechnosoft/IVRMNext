'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IInstitutionSubscription } from '@/types/super-admin/super-admin-module/institution/institution-subscription';
import { Plus, X } from 'lucide-react';
import AddInstitutionSubscriptionForm from './_components/add-form';
import { InstitutionSubscriptionColumns } from './_components/columns';

// Static Data
const staticData: IInstitutionSubscription[] = [
    {
        misV_Id: 1,
        mI_Id: 1,
        institution: {
            mI_Name: 'Vaps Institution'
        },
        misV_SubscriptionType: 'Annual Plan',
        misV_FromDate: '2025-01-01',
        misV_ToDate: '2025-12-31',
        misV_ActiveFlag: true,
        misV_ApprovalFlag: 'A',
        createdDate: '2025-01-01',
        updatedDate: '2025-01-01'
    }
];

export default function InstitutionSubscriptionPage() {
    return (
        <FormProvider<IInstitutionSubscription>>
            <InstitutionSubscriptionPageContent />
        </FormProvider>
    );
}

function InstitutionSubscriptionPageContent() {
    const { openAddForm } = useFormContext<IInstitutionSubscription>();

    // Simulate API loading state
    const isLoading = false;
    const error = null;

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
                        Add Subscription
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='List of Subscriptions'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                    <GenericDataTable<IInstitutionSubscription>
                        data={staticData}
                        columns={InstitutionSubscriptionColumns}
                        isLoading={isLoading}
                        error={error}
                        totalItems={staticData.length}
                        loadingMessage='Loading subscription details...'
                        noDataTitle='No Subscription Details Found'
                        noDataDescription='No subscription details available currently.'
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
    } = useFormContext<IInstitutionSubscription>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Subscription'
                        description='Fill in the details below to create a new subscription'
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
                            <AddInstitutionSubscriptionForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
