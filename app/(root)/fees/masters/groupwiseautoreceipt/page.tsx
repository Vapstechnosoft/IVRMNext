'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterYearlyCategory } from '@/hooks/fees/useMasters';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';
import { Plus, X } from 'lucide-react';
import { use, useEffect } from 'react';
import AddMasterClassForm from './_components/add-form';
import { masterGroupWiseAutoReciptColumns } from './_components/columns';
import ToggleMasterClassForm from './_components/toggle-form';
import UpdateMasterClassForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetch } = useMasterYearlyCategory(searchParams);

    useEffect(() => {}, [response]);

    return (
        <FormProvider<IMasterGroupWiseAutoReciptList>>
            <MasterClassPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function MasterClassPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterGroupWiseAutoReciptList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading
                            title='Master Group Wise Auto Receipt'
                            description='Manage group-wise auto receipt settings by academic year'
                        />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Group Receipt
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterGroupWiseAutoReciptList>
                        {...tableProps}
                        columns={masterGroupWiseAutoReciptColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading group receipt settings...'
                        noDataTitle='No Records Found'
                        noDataDescription='Start by adding a new group receipt configuration'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
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
    } = useFormContext<IMasterGroupWiseAutoReciptList>();

    useEffect(() => {
        if (isEditFormOpen && !selectedRow) {
            console.error('FormSections: Edit form open but selectedRow is undefined');
        }
    }, [isEditFormOpen, selectedRow]);

    // Success handler that refetches data
    const handleSuccess = () => {
        refetch();
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Group Receipt Configuration'
                        description='Fill in the details below to create a new group receipt setting'
                        defaultOpen
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
                            <AddMasterClassForm
                                onSuccess={() => {
                                    handleSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow ? (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Group Receipt Configuration'
                        description={`Editing: ${selectedRow.fmcC_ClassCategoryName} (${selectedRow.asmaY_Year})`}
                        defaultOpen
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
                            <UpdateMasterClassForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    handleSuccess();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            ) : isEditFormOpen ? (
                <div className='rounded-md border border-red-200 bg-red-50 p-4'>
                    <p className='font-medium text-red-600'>Error: Invalid or no group selected for editing.</p>
                </div>
            ) : null}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterClassForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        handleSuccess();
                        closeToggleForm();
                    }}
                />
            )}
        </>
    );
}
