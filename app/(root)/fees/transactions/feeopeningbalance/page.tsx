'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';

import { useFeeconfiguration } from '@/hooks/fees/useConfiguration';
import type { IFeeConfig } from '@/types/fees/configuration/feesconfiguration';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddFeeOpeningBalanceForm from './_components/add-form';
import { feesConfigColumns } from './_components/columns';
import ToggleMasterFeesConfigForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function fineSlabPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useFeeconfiguration(searchParams);

    return (
        <FormProvider<IFeeConfig>>
            <MasterFeeOpeningBalancePageContent response={response} isLoading={isLoading} error={error} />
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
}) {
    const { openAddForm } = useFormContext<IFeeConfig>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Fees Opening Balance' description='' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Fee Opening Balance
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IFeeConfig>
                        {...tableProps}
                        columns={feesConfigColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Master fee Configurations...'
                        noDataTitle='No Master Fee Configurations Found'
                        noDataDescription=' You have not added any master fee configurations yet.'
                        errorTitle='Failed to Load Master Fee Configurations'
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
                        title='Add Fee Opening Balance'
                        description='Add a new Fee Opening Balance'
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
                            <AddFeeOpeningBalanceForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterFeesConfigForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
