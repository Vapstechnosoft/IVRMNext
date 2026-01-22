'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClassWork } from '@/hooks/upload/transactions/useClassWork';
import type { IClassWork } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { Loader2, Plus, X } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AddClassWorkForm from './_components/add-form';
import { classWorkColumns } from './_components/columns';
import ToggleClassWorkForm from './_components/toggle-form';
import UpdateClassWorkForm from './_components/update-form';

export default function ClassWorkPage() {
    return (
        <Suspense fallback={<div className='flex h-full items-center justify-center'><Loader2 className='h-8 w-8 animate-spin' /></div>}>
            <ClassWorkContent />
        </Suspense>
    );
}

function ClassWorkContent() {
    const searchParams = useSearchParams();
    const params = {
        year: searchParams.get('year') || undefined,
        class: searchParams.get('class') || undefined,
        section: searchParams.get('section') || undefined,
        subject: searchParams.get('subject') || undefined
    };

    const { data, isLoading, error, refetchAll } = useClassWork(params);

    return (
        <FormProvider<IClassWork>>
            <ClassWorkManager
                data={data}
                isLoading={isLoading}
                error={error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function ClassWorkManager({
    data,
    isLoading,
    error,
    refetchAll
}: {
    data: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const { openAddForm } = useFormContext<IClassWork>();

    const tableProps = {
        data: data?.classwork || [],
        isLoading,
        error
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add ClassWork
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Class work Upload'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClassWork>
                        {...tableProps}
                        columns={classWorkColumns as any}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading classwork...'
                        noDataTitle='No ClassWork Found'
                        noDataDescription='Get started by creating your first classwork entry'
                        errorTitle='Error Loading ClassWork'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections
                    onSuccess={refetchAll}
                    yearList={data?.yearlist || []}
                    classList={data?.classlist || []}
                />
            </div>
        </div>
    );
}

function FormSections({
    onSuccess,
    yearList,
    classList
}: {
    onSuccess: () => void;
    yearList: any[];
    classList: any[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDetailsViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IClassWork>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New ClassWork'
                        description='Fill in the details below to create a new classwork entry'
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
                            <AddClassWorkForm
                                onSuccess={() => { closeAddForm(); onSuccess(); }}
                                yearList={yearList}
                                classList={classList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit ClassWork'
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
                            <UpdateClassWorkForm
                                selectedRow={selectedRow}
                                onSuccess={() => { closeEditForm(); onSuccess(); }}
                                yearList={yearList}
                                classList={classList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleClassWorkForm
                    rowData={selectedRow}
                    onClose={() => { closeToggleForm(); onSuccess(); }}
                />
            )}
        </>
    );
}
