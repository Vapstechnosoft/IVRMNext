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
    const { data: response, isLoading, error } = useFeePreadmissionTransactionList(searchParams);

    console.log(response);

    return (
        <FormProvider<IFeePreAdmissionTransactionDetails>>
            <PreadmissionTransactionContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function PreadmissionTransactionContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IFeePreAdmissionTransactionDetails>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>{/* <Heading title='Fee Amount Entries' description='' /> */}</div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
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
        isDeleteFormOpen,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef,
        isDetailsViewOpen,
        closeDetailsView
    } = useFormContext<IFeePreAdmissionTransactionDetails>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Fee preadmission Transaction'
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
                            <AddFeePreAdmissionTransactionForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Fees Head'
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
                            <UpdateMasterFeeheadForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )} */}

            {/* {isDeleteFormOpen && selectedRow && <ToggleMasterAmountEntryForm rowData={selectedRow} onClose={closeToggleForm} />} */}

            {isDetailsViewOpen && selectedRow && <ReceiptViewPage rowData={selectedRow} onClose={closeDetailsView} />}
        </>
    );
}
