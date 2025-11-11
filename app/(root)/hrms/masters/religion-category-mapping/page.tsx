'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useReligionCategoryMapping } from '@/hooks/hrms/useMasters';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import { Plus, X } from 'lucide-react';
import { useMemo } from 'react';
import { religionCategoryMappingColumns } from './_components/columns';
import ReligionCategoryMappingForm from './_components/religion-category-mapping-form';

export default function ReligionCategoryMappingPage() {
    const { data: response, isLoading, error } = useReligionCategoryMapping();

    console.log('📊 [RELIGION-CATEGORY PAGE] Component render');
    console.log('📊 [PAGE] isLoading:', isLoading);
    console.log('📊 [PAGE] error:', error);
    console.log('📊 [PAGE] response:', response);
    console.log('📊 [PAGE] response?.data:', response?.data);
    console.log('📊 [PAGE] response?.data?.get_masterlist:', response?.data?.get_masterlist);

    return (
        <FormProvider<ReligionCategoryMappingDetail>>
            <ReligionCategoryMappingPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ReligionCategoryMappingPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ReligionCategoryMappingDetail>();
    
    // Memoize array to prevent unnecessary re-renders
    const tableData = useMemo(() => response?.data?.get_masterlist ?? [], [response?.data?.get_masterlist]);
    console.log('📊 [PAGE CONTENT] Table data extraction');
    console.log('📊 [PAGE] response?.data?.get_masterlist:', tableData);
    console.log('📊 [PAGE] Table data length:', tableData.length);
    console.log('📊 [PAGE] Table data (first 3 items):', JSON.stringify(tableData.slice(0, 3), null, 2));

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
                        Add Religion-Category Mapping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ReligionCategoryMappingDetail>
                        data={tableData}
                        columns={religionCategoryMappingColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading religion-category mappings...'
                        noDataTitle='No Religion-Category Mappings Found'
                        noDataDescription='Get started by creating your first religion-category mapping'
                        errorTitle='Error Loading Religion-Category Mappings'
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
        useFormContext<ReligionCategoryMappingDetail>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Religion-Category Mapping'
                        description='Fill in the details below to create a new religion-category mapping'
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
                            <ReligionCategoryMappingForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Religion-Category Mapping'
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
                            <ReligionCategoryMappingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
