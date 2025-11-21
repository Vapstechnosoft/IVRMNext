'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEmployeeType } from '@/hooks/hrms/useMasters';
import type { ApiSearchparams } from '@/types';
import type { EmployeeTypeDetail } from '@/types/hrms/master-employee-type';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Plus, X } from 'lucide-react';
import { useMemo } from 'react';
import { columns } from '../../employee-type/_components/columns';
import EmployeeTypeForm from '../../employee-type/_components/employee-type-form';

export default function EmployeeTypeTab() {
    const roleId = HRMS_MI_ID;
    
    // Read pagination and search params from URL
    const [page] = useQueryState('page', parseAsInteger.withDefault(1));
    const [page_size] = useQueryState('page_size', parseAsInteger.withDefault(10));
    const [search_query] = useQueryState('search_query', parseAsString.withDefault(''));
    const [search_column] = useQueryState('search_column', parseAsString.withDefault(''));
    const [sort_column] = useQueryState('sort_column', parseAsString.withDefault(''));
    const [sort_direction] = useQueryState('sort_direction', parseAsString.withDefault(''));
    
    const searchParams: ApiSearchparams = {
        page,
        page_size,
        search_query: search_query || undefined,
        search_column: search_column || undefined,
        sort_column: sort_column || undefined,
        sort_direction: sort_direction || undefined
    };
    
    const { listQuery, refetchAll } = useMasterEmployeeType(roleId, searchParams);

    return (
        <FormProvider<EmployeeTypeDetail>>
            <EmployeeTypeTabContent
                response={listQuery.data}
                isLoading={listQuery.isLoading}
                error={listQuery.error}
                refetch={refetchAll}
            />
        </FormProvider>
    );
}

function EmployeeTypeTabContent({
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
    const { openAddForm } = useFormContext<EmployeeTypeDetail>();
    // Memoize array to prevent unnecessary re-renders
    // API now returns data as an array directly, or in employeeTypeList for backward compatibility
    const rows: EmployeeTypeDetail[] = useMemo(() => {
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        return response?.employeeTypeList ?? [];
    }, [response?.data, response?.employeeTypeList]);

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='font-semibold text-lg'>Employee Type Data</h3>
                    <p className='text-muted-foreground text-sm'>View, search, and manage all employee types in the system</p>
                </div>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4' />
                    Add Employee Type
                </Button>
            </div>

            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<EmployeeTypeDetail>
                    data={rows}
                    totalItems={response?.total ?? rows.length}
                    columns={columns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading employee types...'
                    noDataTitle='No Employee Types Found'
                    noDataDescription='Get started by creating your first employee type'
                    errorTitle='Error Loading Employee Types'
                />
            </CollapsibleSection>

            <FormSections refetch={refetch} />
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<EmployeeTypeDetail>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Employee Type'
                        description='Fill in the details below to create a new employee type'
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
                            <EmployeeTypeForm
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
                        title='Edit Employee Type'
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
                            <EmployeeTypeForm
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
