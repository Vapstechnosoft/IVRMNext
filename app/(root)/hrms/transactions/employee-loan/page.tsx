'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeLoanList } from '@/hooks/hrms/useTransactions';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import { Plus } from 'lucide-react';
import { use } from 'react';
import AddEmployeeLoanForm from './_components/add-form';
import { getEmployeeLoanColumns } from './_components/columns';
import ToggleEmployeeLoanForm from './_components/toggle-form';
import UpdateEmployeeLoanForm from './_components/update-form';
import { X } from 'lucide-react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeLoanPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useEmployeeLoanList(searchParams);
    return (
        <FormProvider<EmployeeLoanItem>>
            <EmployeeLoanPageContent response={response} isLoading={isLoading} error={error} refetch={refetchAll} />
        </FormProvider>
    );
}
function EmployeeLoanPageContent({
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
    const {
        openAddForm,
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow
    } = useFormContext<EmployeeLoanItem>();
    const loanData = response?.data || response;
    const loans = loanData?.emploanList || [];
    const employees = loanData?.employeedropdown || [];
    const loanTypes = loanData?.masterloandropdown || [];
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Employee Loan
                    </Button>
                </div>
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<EmployeeLoanItem>
                        {...tableProps}
                        columns={getEmployeeLoanColumns({ employees, loanTypes })}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={true}
                        loadingMessage='Loading employee loans...'
                        noDataTitle='No Employee Loans Found'
                        noDataDescription='Get started by creating your first employee loan'
                        errorTitle='Error Loading Employee Loans'
                    />
                </CollapsibleSection>
                {/* Forms */}
                <FormSections response={response} onSuccess={refetch} />
            </div>
        </div>
    );
}
function FormSections({ response, onSuccess }: { response: any; onSuccess: () => void }) {
    const {
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow
    } = useFormContext<EmployeeLoanItem>();
    const onloadData = response?.data || response;

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Employee Loan'
                        description='Fill in the details below to add a new employee loan'
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
                            <AddEmployeeLoanForm
                                onloadData={onloadData}
                                onSuccess={() => {
                                    closeAddForm();
                                    onSuccess();
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
                        title='Edit Employee Loan'
                        description='Update the details below to edit the employee loan'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateEmployeeLoanForm
                                selectedRow={selectedRow}
                                onloadData={onloadData}
                                onSuccess={() => {
                                    closeEditForm();
                                    onSuccess();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleEmployeeLoanForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
