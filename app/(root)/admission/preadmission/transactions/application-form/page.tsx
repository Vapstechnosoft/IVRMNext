'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useActivePreadmissionDetails, useStudentApplicationList } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import { Plus, X } from 'lucide-react';
import { use, useState } from 'react';
import AddStudentApplicationForm from './_components/add-form';
import { studentApplicationColumns } from './_components/columns';
import ApplicationFormSuccessDialog from './_components/success-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentApplicationPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: response, isLoading, error } = useStudentApplicationList(activePreadmission?.data?.asmaY_Id ?? 0, searchParams);

    return (
        <FormProvider<IPreadmissionStudentApplicationList>>
            <StudentApplicationPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function StudentApplicationPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext();
    const tableProps = useDataTableProps(response);
    const [isSuccessOpen, setSuccessOpen] = useState(false);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Preadmission Application
                    </Button>
                </div>
                {isSuccessOpen && <ApplicationFormSuccessDialog isOpen={isSuccessOpen} onClose={() => setSuccessOpen(false)} />}
                {/* Forms */}
                <FormSections setSuccessOpen={() => setSuccessOpen(true)} />
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IPreadmissionStudentApplicationList>
                        {...tableProps}
                        columns={studentApplicationColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master caste...'
                        noDataTitle='No Master Caste Found'
                        noDataDescription='Get started by creating your first master caste'
                        errorTitle='Error Loading Master Caste'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}

function FormSections({ setSuccessOpen }: { setSuccessOpen: () => void }) {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Preadmission Application'
                        description='Fill in the details below to create a new preadmission application'
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
                            <AddStudentApplicationForm
                                onSuccess={() => {
                                    closeAddForm();
                                    setSuccessOpen();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
