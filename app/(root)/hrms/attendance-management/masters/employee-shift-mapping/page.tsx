'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { HRMSCollapsibleSection } from '../_components/hrms-collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeShiftMapping } from '@/hooks/hrms/attendance-management/useMasters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddEmployeeShiftMappingForm from './_components/add-form';
import { type EmployeeShiftMapping, employeeShiftMappingColumns } from './_components/columns';
import DeleteEmployeeShiftMappingForm from './_components/delete-form';
import UpdateEmployeeShiftMappingForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeShiftMappingPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useEmployeeShiftMapping();

    return (
        <FormProvider<EmployeeShiftMapping>>
            <EmployeeShiftMappingPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function EmployeeShiftMappingPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<EmployeeShiftMapping>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Shift Mapping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable<EmployeeShiftMapping>
                        {...tableProps}
                        columns={employeeShiftMappingColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading employee shift mappings...'
                        noDataTitle='No Employee Shift Mappings Found'
                        noDataDescription='Get started by creating your first employee shift mapping'
                        errorTitle='Error Loading Shift Mappings'
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
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<EmployeeShiftMapping>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <HRMSCollapsibleSection
                        title='Add Employee Shift Mapping'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        closeButton={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <AddEmployeeShiftMappingForm onSuccess={closeAddForm} />
                    </HRMSCollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <HRMSCollapsibleSection
                        title='Update Employee Shift Mapping'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'
                        closeButton={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <UpdateEmployeeShiftMappingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                    </HRMSCollapsibleSection>
                </div>
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && <DeleteEmployeeShiftMappingForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
