'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentFeeGroupMapping } from '@/hooks/fees/useMasters';
import type { IFeeConfig } from '@/types/fees/configuration/feesconfiguration';
import type { IMasterStudentFeeGroupMappingList } from '@/types/fees/masters/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddFeeTransactionWaiveOffForm from './_components/add-form';
import { FeeTransactionWaivedOff } from './_components/columns';
import ToggleMasterFeesConfigForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function fineSlabPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useStudentFeeGroupMapping(searchParams);

    return (
        <FormProvider<IFeeConfig>>
            <MasterFeeOpeningBalancePageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}
function MasterFeeOpeningBalancePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const { openAddForm } = useFormContext<IFeeConfig>();

    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>{/* <Heading title='Waived Off' description='' /> */}</div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Fee Waived Off
                    </Button>
                </div>
                {/* Table */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterStudentFeeGroupMappingList>
                        {...tableProps}
                        columns={FeeTransactionWaivedOff}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Fee Transaction Waived Off...'
                        noDataTitle='No Fee Transaction Waived Off Found'
                        noDataDescription='Get started by creating your first Fee Transaction Waived Off'
                        errorTitle='Error While Loading Fee Transaction Waived Off'
                    />
                </CollapsibleSection>
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeToggleForm, addFormRef } = useFormContext<IFeeConfig>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Transaction Waived Off'
                        description='Add a new Fee Transaction Waived Off record'
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
                            <AddFeeTransactionWaiveOffForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterFeesConfigForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
