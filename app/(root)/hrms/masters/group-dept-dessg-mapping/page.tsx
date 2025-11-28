'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useGroupDeptDessgMapping } from '@/hooks/hrms/useMasters';
import type { ApiSearchparams } from '@/types';
import type { GroupDeptDessgMappingDetail } from '@/types/hrms/group-dept-dessg-mapping';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { groupDeptDessgMappingColumns } from './_components/columns';
import MappingForm from './_components/mapping-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function GroupDeptDessgMappingPage(props: { searchParams: SearchParams }) {
    const rawSearchParams = use(props.searchParams);

    // Convert Next.js searchParams (string | string[]) to ApiSearchparams format
    // This matches how preadmission handles it
    const searchParams: ApiSearchparams = {
        page:
            typeof rawSearchParams?.page === 'string'
                ? Number.parseInt(rawSearchParams.page, 10)
                : Array.isArray(rawSearchParams?.page)
                  ? Number.parseInt(rawSearchParams.page[0], 10)
                  : typeof rawSearchParams?.page === 'number'
                    ? rawSearchParams.page
                    : undefined,
        page_size:
            typeof rawSearchParams?.page_size === 'string'
                ? Number.parseInt(rawSearchParams.page_size, 10)
                : Array.isArray(rawSearchParams?.page_size)
                  ? Number.parseInt(rawSearchParams.page_size[0], 10)
                  : typeof rawSearchParams?.page_size === 'number'
                    ? rawSearchParams.page_size
                    : undefined,
        search_query:
            typeof rawSearchParams?.search_query === 'string'
                ? rawSearchParams.search_query
                : Array.isArray(rawSearchParams?.search_query)
                  ? rawSearchParams.search_query[0]
                  : undefined,
        search_column:
            typeof rawSearchParams?.search_column === 'string'
                ? rawSearchParams.search_column
                : Array.isArray(rawSearchParams?.search_column)
                  ? rawSearchParams.search_column[0]
                  : undefined,
        sort_column:
            typeof rawSearchParams?.sort_column === 'string'
                ? rawSearchParams.sort_column
                : Array.isArray(rawSearchParams?.sort_column)
                  ? rawSearchParams.sort_column[0]
                  : undefined,
        sort_direction:
            typeof rawSearchParams?.sort_direction === 'string'
                ? rawSearchParams.sort_direction
                : Array.isArray(rawSearchParams?.sort_direction)
                  ? rawSearchParams.sort_direction[0]
                  : undefined
    };

    const { data: response, isLoading, error, refetch } = useGroupDeptDessgMapping(searchParams);

    return (
        <FormProvider<GroupDeptDessgMappingDetail>>
            <GroupDeptDessgMappingPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function GroupDeptDessgMappingPageContent({
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
                        data={
                            Array.isArray(response?.data?.data?.gridviewdata)
                                ? response.data.data.gridviewdata
                                : Array.isArray(response?.data?.gridviewdata)
                                  ? response.data.gridviewdata
                                  : []
                        }
                        totalItems={
                            response?.data?.total ??
                            (Array.isArray(response?.data?.data?.gridviewdata)
                                ? response.data.data.gridviewdata.length
                                : Array.isArray(response?.data?.gridviewdata)
                                  ? response.data.gridviewdata.length
                                  : 0)
                        }
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
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
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
                            <MappingForm
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
                            <MappingForm
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
