'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEventsSponsor } from '@/hooks/sports/useEventsSponsor';
import type { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddEventSponsorMappingForm from './_components/add-form';
import { eventSponsorColumns } from './_components/columns';
import UpdateEventSponsorMappingForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EventsSponsorMappingPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useEventsSponsor(searchParams);

    return (
        <FormProvider<IEventSponsorMapping>>
            <EventsSponsorMappingPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function EventsSponsorMappingPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm, isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IEventSponsorMapping>();
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
                        <Plus className='h-4 w-4' />
                        Add Mapping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Events Sponsor Mapping List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IEventSponsorMapping>
                        {...tableProps}
                        columns={eventSponsorColumns}
                        isLoading={isLoading}
                        error={error}
                        //manualPagination={false}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading mapping details...'
                        noDataTitle='No Mapping Found'
                        noDataDescription='Get started by creating your first event-sponsor mapping'
                        errorTitle='Error Loading Mapping'
                    />
                </CollapsibleSection>

                {/* Add Form */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Add Events Sponsor Mapping'
                            defaultOpen={true}
                            variant='default'
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
                                <AddEventSponsorMappingForm onSuccess={closeAddForm} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* Edit Form */}
                {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef}>
                        <CollapsibleSection
                            title='Edit Events Sponsor Mapping'
                            defaultOpen={true}
                            variant='default'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeEditForm}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <UpdateEventSponsorMappingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
