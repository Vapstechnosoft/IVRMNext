'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterYearlyCategory } from '@/hooks/fees/useMasters';
import type { IMasterClassYearlyCategoryList } from '@/types/fees/masters/masters';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import { use } from 'react';
import AddMasterClassForm from './_components/add-form';
import { masterClassCategoryYearlyColumns } from './_components/columns';
import ToggleMasterClassForm from './_components/toggle-form';
import UpdateMasterClassForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterYearlyCategory(searchParams);

    // Debug API response
    useEffect(() => {}, [response]);

    return (
        <FormProvider<IMasterClassYearlyCategoryList>>
            <MasterClassPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterClassPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterClassYearlyCategoryList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Master Fees Class Management' description='Manage and organize your master Fees classes' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Class
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterClassYearlyCategoryList>
                        {...tableProps}
                        columns={masterClassCategoryYearlyColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master classes...'
                        noDataTitle='No Master Classes Found'
                        noDataDescription='Get started by creating your first master class'
                        errorTitle='Error Loading Classes'
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
    } = useFormContext<IMasterClassYearlyCategoryList>();

    // Debug selectedRow
    useEffect(() => {
        if (isEditFormOpen && !selectedRow) {
            console.error('FormSections - Edit form open but selectedRow is undefined');
        }
    }, [isEditFormOpen, selectedRow]);

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Class'
                        description='Fill in the details below to create a new master class'
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
                            <AddMasterClassForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && selectedRow.asmcC_Id && selectedRow.amC_Name && selectedRow.asmcL_ClassName ? (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Class'
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
                            <UpdateMasterClassForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            ) : isEditFormOpen ? (
                <div className='p-4 text-red-500'>Error: Invalid or no class selected for editing.</div>
            ) : null}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && selectedRow.asmcC_Id && selectedRow.amC_Name && selectedRow.asmcL_ClassName && (
                <ToggleMasterClassForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
