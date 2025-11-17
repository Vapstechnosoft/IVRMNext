'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useFeePreadmissionTransactionList } from '@/hooks/fees/useTrasactions';
import type { IFeePreAdmissionTransactionDetails } from '@/types/fees/transactions/transactions';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddFeePreAdmissionTransactionForm from './_components/add-form';
import { feePreAdmissionTransactionEntryColumns } from './_components/columns';
import ReceiptViewPage from './_components/receiptview';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeePreadmissionTransactionPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetch } = useFeePreadmissionTransactionList(searchParams);

    return (
        <FormProvider<IFeePreAdmissionTransactionDetails>>
            <PreadmissionTransactionContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function PreadmissionTransactionContent({
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
    const { openAddForm } = useFormContext<IFeePreAdmissionTransactionDetails>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>{/* <h1 className='font-bold text-2xl'>Fee Preadmission Transactions</h1> */}</div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Pre Admission Transaction
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IFeePreAdmissionTransactionDetails>
                        {...tableProps}
                        columns={feePreAdmissionTransactionEntryColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Fee Preadmission Transactions...'
                        noDataTitle='No Fee Preadmission Transactions Found'
                        noDataDescription='Get started by adding a new Fee Preadmission Transaction.'
                        errorTitle='Failed to Load Fee Preadmission Transactions'
                    />
                </CollapsibleSection>

                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, closeAddForm, isDetailsViewOpen, closeDetailsView, selectedRow } =
        useFormContext<IFeePreAdmissionTransactionDetails>();

    return (
        <>
            {isAddFormOpen && (
                <div>
                    <CollapsibleSection
                        title='Add New Fee Preadmission Transaction'
                        description='Fill in the details below to create a new fee preadmission transaction.'
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
                            <AddFeePreAdmissionTransactionForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch(); // Refetch grid after save
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDetailsViewOpen && selectedRow && <ReceiptViewPage rowData={selectedRow} onClose={closeDetailsView} />}
        </>
    );
}
