'use client';
import { Button } from '@/components/ui/button';
import { useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useFeeTransactionList } from '@/hooks/fees/useTrasactions';
import type { Ifeetransaction } from '@/types/fees/transactions/transactions';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
// import { feeTransactionColumns } from './_components/columns';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeePreadmissionTransactionPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const asmaY_Id = 231;
    const { data: response, isLoading, error } = useFeeTransactionList(asmaY_Id, searchParams);

    return (
        <FormProvider<Ifeetransaction>>
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
    const { openAddForm } = useFormContext<Ifeetransaction>();
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
                        Add Fee Student Transaction
                    </Button>
                </div>

                {/* <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<Ifeetransaction>
                        {...tableProps}
                        feeTransactionColumns
                        columns={}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Fee Preadmission Transactions...'
                        noDataTitle='No Fee Preadmission Transactions Found'
                        noDataDescription='Get started by adding a new Fee Preadmission Transaction.'
                        errorTitle='Failed to Load Fee Preadmission Transactions'
                    />
                </CollapsibleSection> */}

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,

        closeAddForm,
        addFormRef
    } = useFormContext<Ifeetransaction>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Student Transaction'
                        description='Fill in the details below to create a new fee student transaction.'
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
                            {/* <AddFeePreAdmissionTransactionForm  /> */}
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
