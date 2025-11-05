'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useGroupDeptDessgMapping } from '@/hooks/hrms/useMasters';
import type { GroupDeptDessgMappingDetail } from '@/types/hrms/group-dept-dessg-mapping';
import { Plus, X } from 'lucide-react';
import { groupDeptDessgMappingColumns } from './_components/columns';
import MappingForm from './_components/mapping-form';

export default function GroupDeptDessgMappingPage() {
    const { data: response, isLoading, error } = useGroupDeptDessgMapping();

    return (
        <FormProvider<GroupDeptDessgMappingDetail>>
            <GroupDeptDessgMappingPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function GroupDeptDessgMappingPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<GroupDeptDessgMappingDetail>();

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Group-Dept-Dessg Mapping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<GroupDeptDessgMappingDetail>
                        data={response?.data?.gridviewdata ?? []}
                        columns={groupDeptDessgMappingColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading group-dept-dessg mappings...'
                        noDataTitle='No Group-Dept-Dessg Mappings Found'
                        noDataDescription='Get started by creating your first group-dept-dessg mapping'
                        errorTitle='Error Loading Group-Dept-Dessg Mappings'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<GroupDeptDessgMappingDetail>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Group-Dept-Dessg Mapping'
                        description='Fill in the details below to create a new group-dept-dessg mapping'
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
                            <MappingForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Group-Dept-Dessg Mapping'
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
                            <MappingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
