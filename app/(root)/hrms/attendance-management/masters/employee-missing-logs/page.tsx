'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { createLocalCrud } from '@/lib/localdb';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddEmployeeMissingLogForm from './_components/add-form';
import { missingLogColumns, type MissingLog } from './_components/columns';
import UpdateEmployeeMissingLogForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeMissingLogsPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const db = createLocalCrud<MissingLog>('employeeMissingLogs');
    const { data: response, isLoading, error } = db.useQuery();

    return (
        <FormProvider<MissingLog>>
            <EmployeeMissingLogsPageContent response={response} isLoading={isLoading} error={error} refetch={db.refetch} />
        </FormProvider>
    );
}

function EmployeeMissingLogsPageContent({
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
    const { openAddForm } = useFormContext<MissingLog>();
    const rows = Array.isArray(response) ? response : [];
    const tableProps = useDataTableProps({
        data: rows,
        totalItems: rows.length
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Missing Logs' description='Record and track missing IN/OUT logs' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Employee Missing Log
                    </Button>
                </div>

                <CollapsibleSection
                    title='Employee Missing Logs Details'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable
                        {...tableProps}
                        isLoading={isLoading}
                        columns={missingLogColumns}
                        showViewOptions
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
        selectedRow,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<MissingLog>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Employee Missing Log'
                        description='Fill in the details below to create a new employee missing log'
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
                            <AddEmployeeMissingLogForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
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
                        title='Edit Employee Missing Log'
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
                            <UpdateEmployeeMissingLogForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}

