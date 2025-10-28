// pages/master-fee-group-grouping/page.tsx
'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterFeeGroupDropdown, useMasterFeeGroupGrouping } from '@/hooks/fees/useMasters';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';
import { Plus, X } from 'lucide-react';
import AddMasterFeeGroupGrouping from './_components/add-form';
import { feegroupgroupingColoumn } from './_components/columns';
import DeleteMasterFeeGroupGroupingForm from './_components/delete-form';
import UpdateMasterFeeGroupGroupingForm from './_components/update-form';

export default function MasterFeeGroupGroupingPage() {
    const { data: apiResponse, isLoading, error, refetchAll } = useMasterFeeGroupGrouping();

    return (
        <FormProvider<IMasterGroupsGrouping>>
            <MasterFeeGroupGroupingClient
                response={apiResponse?.data ?? undefined}
                isLoading={isLoading}
                error={error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function MasterFeeGroupGroupingClient({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response?: IMasterGroupsGrouping[];
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterGroupsGrouping>();

    // Fetch dropdown fee groups once at the parent so we can pass them to update form
    const { data: dropdownResponse } = useMasterFeeGroupDropdown();

    // Normalize feeGroups array
    const feeGroups = Array.isArray(dropdownResponse?.data) ? dropdownResponse.data : [];

    const tableProps = useDataTableProps(response ?? []);

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

                {/* Data Table */}
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
                        loadingMessage='Loading fees group groupings...'
                        noDataTitle='No Fees Group Groupings Found'
                        noDataDescription='Get started by creating your first fees group grouping'
                        errorTitle='Error Loading Fees Group Groupings'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetchAll={refetchAll} feeGroups={feeGroups} />
            </div>
        </div>
    );
}

function FormSections({
    refetchAll,
    feeGroups
}: {
    refetchAll: () => void;
    feeGroups: any[];
}) {
    // cast to any because our form context exposes additional properties not included in the default TS type
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDeleteFormOpen,
        selectedRow,
        selectedRowForDelete,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterGroupsGrouping>() as any;

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Fees Group Grouping'
                        description='Fill in the details below to create a new fees group grouping'
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
                            <AddMasterFeeGroupGrouping
                                onSuccess={() => {
                                    closeAddForm();
                                    refetchAll();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Fees Group Grouping'
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
                            <UpdateMasterFeeGroupGroupingForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    refetchAll();
                                }}
                                feeGroups={feeGroups}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRowForDelete && (
                <DeleteMasterFeeGroupGroupingForm
                    rowData={selectedRowForDelete}
                    onClose={() => {
                        closeDeleteForm();
                        refetchAll();
                    }}
                />
            )}
        </>
    );
}
