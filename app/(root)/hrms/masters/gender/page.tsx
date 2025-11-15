'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGender } from '@/hooks/hrms/useMasters';
import type { GenderItem } from '@/types/hrms/master-gender';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import { columns } from './_components/columns';
import GenderForm from './_components/gender-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterGenderPage(props: { searchParams: SearchParams }) {
    const _rawSearchParams = use(props.searchParams);
    const roleId = HRMS_MI_ID;
    const { listQuery, refetchAll } = useMasterGender(roleId);

    return (
        <FormProvider<GenderItem>>
            <MasterGenderPageContent
                response={listQuery.data}
                isLoading={listQuery.isLoading}
                error={listQuery.error}
                refetch={refetchAll}
            />
        </FormProvider>
    );
}

function MasterGenderPageContent({
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
    const { openAddForm } = useFormContext<GenderItem>();
    // Memoize array to prevent unnecessary re-renders
    const rows: GenderItem[] = useMemo(() => response?.genderList ?? [], [response?.genderList]);

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Gender
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<GenderItem>
                        data={rows}
                        totalItems={rows.length}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading genders...'
                        noDataTitle='No Genders Found'
                        noDataDescription='Get started by creating your first gender'
                        errorTitle='Error Loading Genders'
                    />
                </CollapsibleSection>

                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<GenderItem>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Gender'
                        description='Fill in the details below to create a new gender'
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
                            <GenderForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Gender'
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
                            <GenderForm
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
