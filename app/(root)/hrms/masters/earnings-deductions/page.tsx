'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import type { IMasterEarningsDeductionsList } from '@/types/hrms/hrms-config/master';
import { Plus, X } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import AddEarningsDeductionsForm from './_components/add-form';
import { columns } from './_components/columns';
import ReorderEarningsDeductionsForm from './_components/reorder-form';
import ToggleMasterEarningsDeductionsForm from './_components/toggle-form';
import UpdateEarningsDeductionsForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterEarningsDeductionsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterEarningsDeductions(searchParams);

    return (
        <FormProvider<IMasterEarningsDeductionsList>>
            <MasterEarningsDeductionsPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterEarningsDeductionsPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterEarningsDeductionsList>();
    // Memoize arrays to prevent unnecessary re-renders
    const rows: IMasterEarningsDeductionsList[] = useMemo(() => {
        const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        return data;
    }, [response]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const filteredRows = useMemo(() => {
        if (filterCategory === 'all') {
            return rows;
        }
        const filtered = rows.filter((row) => {
            const rowValue = String(row.hrmeD_EarnDedFlag || '').trim();
            const filterValue = filterCategory.trim();
            return rowValue === filterValue;
        });
        return filtered;
    }, [rows, filterCategory]);
    const tableProps = useDataTableProps(response);
    const filteredTableProps = useMemo(() => {
        if (filterCategory === 'all') {
            return tableProps;
        }
        return {
            ...tableProps,
            data: filteredRows,
            totalItems: filteredRows.length
        };
    }, [tableProps, filteredRows, filterCategory]);
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-between gap-2'>
                    {/* Filter Dropdown */}
                    <div className='flex items-center gap-2'>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className='flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'>
                            <option value='all'>All Items</option>
                            <option value='Earning'>Earnings</option>
                            <option value='Deduction'>Deductions</option>
                            <option value='Arrear'>Arrears</option>
                            <option value='Gross'>Gross</option>
                        </select>
                        {filterCategory !== 'all' && (
                            <span className='text-muted-foreground text-sm'>
                                Showing {filteredRows.length} of {rows.length} items
                            </span>
                        )}
                    </div>
                    {/* Action Buttons */}
                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add Earning/Deduction
                        </Button>
                    </div>
                </div>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='flex justify-end'>
                        <ReorderEarningsDeductionsForm />
                    </div>
                    <GenericDataTable<IMasterEarningsDeductionsList>
                        {...filteredTableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading earnings/deductions...'
                        noDataTitle='No Earnings/Deductions Found'
                        noDataDescription='Get started by creating your first earning/deduction'
                        errorTitle='Error Loading Earnings/Deductions'
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
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterEarningsDeductionsList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Earning/Deduction'
                        description='Fill in the details below to create a new earning/deduction'
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
                            <AddEarningsDeductionsForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Earning/Deduction'
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
                            <UpdateEarningsDeductionsForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterEarningsDeductionsForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
