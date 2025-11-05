'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEmployeeType } from '@/hooks/hrms/useMasters';
import type { EmployeeTypeDetail } from '@/types/hrms/master-employee-type';
import { Plus, X } from 'lucide-react';
import { columns } from '../../employee-type/_components/columns';
import EmployeeTypeForm from '../../employee-type/_components/employee-type-form';

export default function EmployeeTypeTab() {
    const roleId = HRMS_MI_ID;
    const { listQuery } = useMasterEmployeeType(roleId);

    return (
        <FormProvider<EmployeeTypeDetail>>
            <EmployeeTypeTabContent response={listQuery.data} isLoading={listQuery.isLoading} error={listQuery.error} />
        </FormProvider>
    );
}

function EmployeeTypeTabContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<EmployeeTypeDetail>();
    const rows: EmployeeTypeDetail[] = response?.employeeTypeList ?? [];

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
                    totalItems={rows.length}
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

            <FormSections />
        </div>
    );
}

function FormSections() {
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
                            <EmployeeTypeForm onSuccess={closeAddForm} />
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
                            <EmployeeTypeForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
