'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useFeeChequeBounceInitialData } from '@/hooks/fees/useTrasactions';
import type { IFeeChequeBounceGrid } from '@/types/fees/transactions/feeChequeBounce';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddFeeChequeBounceForm from './components/add-form';
import { feeChequeBounceColumns } from './components/columns';
import DeleteFeeChequeBounceForm from './components/delete-form';
import SearchFeeChequeBounceForm from './components/search-form';

export default function FeeChequeBouncePage() {
    const { data: response, isLoading, error } = useFeeChequeBounceInitialData();

    return (
        <FormProvider<IFeeChequeBounceGrid>>
            <FeeChequeBouncePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function FeeChequeBouncePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IFeeChequeBounceGrid>();
    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        // Feed the year array from API response to the grid
        const yearData = response?.data?.year || response?.year || [];
        if (Array.isArray(yearData)) {
            setTableData(yearData);
        }
    }, [response]);

    const handleSearchResults = (results: any[]) => {
        setTableData(results);
    };

    const tableProps = useDataTableProps(tableData);

    // Extract asmayId from the year array in the API response
    const asmayId = response?.data?.year?.[0]?.asmaY_Id || response?.data?.fillyear?.[0]?.asmaY_Id || 0;

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <h2 className='font-bold text-2xl tracking-tight'>Fee Cheque Bounce</h2>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Cheque Bounce
                    </Button>
                </div>

                <CollapsibleSection title='Search Records' defaultOpen={false}>
                    <SearchFeeChequeBounceForm asmayId={asmayId} onSearchResults={handleSearchResults} />
                </CollapsibleSection>

                <CollapsibleSection
                    title='Cheque Bounce List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<any>
                        {...tableProps}
                        columns={feeChequeBounceColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Cheque Bounce Records...'
                        noDataTitle='No Records Found'
                        noDataDescription='Get started by adding a new record.'
                        errorTitle='Error Loading Records'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, selectedRow, isDeleteFormOpen, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<IFeeChequeBounceGrid>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Cheque Bounce'
                        description='Fill in the details below to record a cheque bounce.'
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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddFeeChequeBounceForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDeleteFormOpen && selectedRow && <DeleteFeeChequeBounceForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
