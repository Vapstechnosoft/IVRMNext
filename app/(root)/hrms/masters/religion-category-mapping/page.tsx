'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useReligionCategoryMapping } from '@/hooks/hrms/useMasters';
import type { ApiSearchparams } from '@/types';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { religionCategoryMappingColumns } from './_components/columns';
import ReligionCategoryMappingForm from './_components/religion-category-mapping-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ReligionCategoryMappingPage(props: { searchParams: SearchParams }) {
    const rawSearchParams = use(props.searchParams);
    
    // Convert Next.js searchParams (string | string[]) to ApiSearchparams format
    // This matches how preadmission and other master modules handle it
    const searchParams: ApiSearchparams = {
        page: typeof rawSearchParams?.page === 'string' ? parseInt(rawSearchParams.page, 10) : Array.isArray(rawSearchParams?.page) ? parseInt(rawSearchParams.page[0], 10) : typeof rawSearchParams?.page === 'number' ? rawSearchParams.page : undefined,
        page_size: typeof rawSearchParams?.page_size === 'string' ? parseInt(rawSearchParams.page_size, 10) : Array.isArray(rawSearchParams?.page_size) ? parseInt(rawSearchParams.page_size[0], 10) : typeof rawSearchParams?.page_size === 'number' ? rawSearchParams.page_size : undefined,
        search_query: typeof rawSearchParams?.search_query === 'string' ? rawSearchParams.search_query : Array.isArray(rawSearchParams?.search_query) ? rawSearchParams.search_query[0] : undefined,
        search_column: typeof rawSearchParams?.search_column === 'string' ? rawSearchParams.search_column : Array.isArray(rawSearchParams?.search_column) ? rawSearchParams.search_column[0] : undefined,
        sort_column: typeof rawSearchParams?.sort_column === 'string' ? rawSearchParams.sort_column : Array.isArray(rawSearchParams?.sort_column) ? rawSearchParams.sort_column[0] : undefined,
        sort_direction: typeof rawSearchParams?.sort_direction === 'string' ? rawSearchParams.sort_direction : Array.isArray(rawSearchParams?.sort_direction) ? rawSearchParams.sort_direction[0] : undefined
    };
    
    const { data: response, isLoading, error, refetch } = useReligionCategoryMapping(searchParams);

    return (
        <FormProvider<ReligionCategoryMappingDetail>>
            <ReligionCategoryMappingPageContent 
                response={response} 
                isLoading={isLoading} 
                error={error}
                refetch={refetch}
            />
        </FormProvider>
    );
}

function ReligionCategoryMappingPageContent({
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
    const { openAddForm } = useFormContext<ReligionCategoryMappingDetail>();
    
    // Extract data from response - the API returns:
    // { success, message, data: { data: [...], total, page, page_size, ... } }
    // Where data.data is the mapping array (extracted from data.mapping or data.get_masterlist)
    const responseData = response?.data;
    const transformedResponse = {
        data: Array.isArray(responseData?.data) 
            ? responseData.data 
            : [],
        total: responseData?.total ?? 0,
        page: responseData?.page ?? 1,
        page_size: responseData?.page_size ?? 10
    };
    const tableProps = useDataTableProps(transformedResponse, { dataKey: 'data' });

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
                        {...tableProps}
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
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
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
                            <ReligionCategoryMappingForm 
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
                            <ReligionCategoryMappingForm 
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
