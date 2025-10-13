'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupsGrouping } from '@/types/fees/masters';
import { Plus, X } from 'lucide-react';
import AddMasterFeeGroupGrouping from './_components/add-form';
import { feegroupgroupingColoumn } from './_components/columns';
import ToggleMasterFeeGroupGroupingForm from './_components/toggle-form';
import UpdateMasterFeeGroupGroupingForm from './_components/update-form';

interface MasterFeeGroupGroupingClientProps {
    response: IMasterGroupsGrouping[] | undefined;
    isLoading: boolean;
    error: any;
}

export default function MasterFeeGroupGroupingClient({ response, isLoading, error }: MasterFeeGroupGroupingClientProps) {
    return (
        <FormProvider<IMasterGroupsGrouping>>
            <MasterFeeGroupGroupingPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterFeeGroupGroupingPageContent({
    response,
    isLoading,
    error
}: {
    response: IMasterGroupsGrouping[] | undefined;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterGroupsGrouping>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Fee Group Groupings' description='Manage your fee group groupings' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Fee Group Grouping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterGroupsGrouping>
                        {...tableProps}
                        columns={feegroupgroupingColoumn}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading fee group groupings...'
                        noDataTitle='No Fee Group Groupings Found'
                        noDataDescription='Get started by creating your first fee group grouping'
                        errorTitle='Error Loading Fee Group Groupings'
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
    } = useFormContext<IMasterGroupsGrouping>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Fee Group Grouping'
                        description='Fill in the details below to create a new fee group grouping'
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
                            <AddMasterFeeGroupGrouping onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Fee Group Grouping'
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
                            <UpdateMasterFeeGroupGroupingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterFeeGroupGroupingForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
