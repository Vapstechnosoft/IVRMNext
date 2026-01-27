'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { useInvTSales } from '@/hooks/inventory/transactions/use-inv-t-sales';
import type { IInvTSales } from '@/types/inventory/transactions/inv-t-sales';
import AddSalesForm from './_components/add-form';
import { invTSalesColumns } from './_components/columns';
// import UpdateSalesForm from './_components/update-form';
// import ViewSalesDetailsModal from './_components/view-details-modal';
import { ToggleSalesModal } from './_components/toggle-modal';
import { Heading } from '@/components/layout/heading';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvTSalesPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useInvTSales(searchParams);

    return (
        <FormProvider<IInvTSales>>
            <InvTSalesPageContent
                response={response}
                isLoading={isLoading}
                error={error}
            />
        </FormProvider>
    );
}

function InvTSalesPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const {
        openAddForm,
        openEditForm,
        openToggleForm,
        openDetailsView,
        selectedRow,
        isDetailsViewOpen,
        closeDetailsView,
        isToggleFormOpen,
        closeToggleForm
    } = useFormContext<IInvTSales>();

    // const { deleteMutation, toggleActiveMutation } = useInvTSales(); // Moved to columns component

    const tableProps = useDataTableProps(response?.data, {
        dataKey: 'get_Sale',
        totalKey: 'total'
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading
                        title='Sales Transaction'
                        description='Manage sales transactions'
                    />
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='h-4 w-4 mr-2' />
                        New Sale
                    </Button>
                </div>

                <FormSections />

                <CollapsibleSection
                    title='Sales List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <GenericDataTable<IInvTSales>
                        {...tableProps}
                        data={response?.data?.get_Sale || []}
                        columns={invTSalesColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Sales records...'
                        noDataTitle='No Sales Found'
                        noDataDescription='Create a new Sales record to start'
                        errorTitle='Error Loading Sales Data'
                    />
                </CollapsibleSection>

                {isToggleFormOpen && selectedRow && (
                    <ToggleSalesModal rowData={selectedRow} onClose={closeToggleForm} />
                )}

                {/* {isDetailsViewOpen && selectedRow && (
                    <ViewSalesDetailsModal
                        rowData={selectedRow}
                        isOpen={isDetailsViewOpen}
                        onClose={closeDetailsView}
                    />
                )} */}
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<IInvTSales>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Create New Sale'
                        description='Enter the sales details'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='animate-in slide-in-from-top-4 duration-300 shadow-md mb-6'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='absolute top-[-3.5rem] right-0 hover:bg-destructive/10 text-destructive'>
                                <X className='h-4 w-4 mr-1' /> Close
                            </Button>
                            <AddSalesForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={`Edit Sale: ${selectedRow.invmsL_SalesNo}`}
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='animate-in slide-in-from-top-4 duration-300 shadow-md mb-6 border-primary/20'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='absolute top-[-3.5rem] right-0 hover:bg-destructive/10 text-destructive'>
                                <X className='h-4 w-4 mr-1' /> Close
                            </Button>
                            {/* <UpdateSalesForm selectedRow={selectedRow} onSuccess={closeEditForm} /> */}
                            <div>Update Form Placeholder</div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
