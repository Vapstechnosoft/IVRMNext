'use client';

import { use } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterActivityDetails } from '@/hooks/admission/preadmission/useMasterActivity';
import type { IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';
import ActivityForm from './_components/activity-form';
import { masterActivityColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterActivityPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterActivityDetails(searchParams);

    return (
        <FormProvider<IMasterActivityList>>
            <MasterActivityPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterActivityPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterActivityList>();
    const tableProps = useDataTableProps(response, { dataKey: 'masterActivityname' });

    return (
        <div className='min-h-screen p-1'>
            <div className='container space-y-4'>
                {/* Fixed Action Button */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Activity
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection title='Master Activities List' defaultOpen={true}>
                    <GenericDataTable<IMasterActivityList>
                        {...tableProps}
                        columns={masterActivityColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master activities...'
                        noDataTitle='No Master Activities Found'
                    />
                </CollapsibleSection>

                {/* Forms Section */}
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
    } = useFormContext<IMasterActivityList>();

    return (
        <>
            {/* Add Activity Form */}
            {isAddFormOpen && (
                <div ref={addFormRef} className='mt-6'>
                    <CollapsibleSection
                        title='Add New Master Activity'
                        defaultOpen={true}
                        variant='outline'
                        className='slide-in-from-top-4 animate-in shadow-lg'>
                        <div className='relative p-4 pt-10'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='absolute top-4 right-4 border shadow-sm hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' />
                            </Button>
                            <ActivityForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Activity Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef} className='mt-6'>
                    <CollapsibleSection
                        title='Edit Master Activity'
                        defaultOpen={true}
                        variant='outline'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg'>
                        <div className='relative p-4 pt-10'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='absolute top-4 right-4 border shadow-sm hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' />
                            </Button>
                            <ActivityForm initialData={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
