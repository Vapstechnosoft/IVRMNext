
'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { useInvOpeningBalance } from '@/hooks/inventory/transactions/use-inv-opening-balance';
import type { IInvOpeningBalance } from '@/types/inventory/transactions/inv-opening-balance';
import AddOBForm from './_components/add-form';
import { invOpeningBalanceColumns } from './_components/columns';
import { ToggleOBModal } from './_components/toggle-modal';
import { Heading } from '@/components/layout/heading';
// import UpdateOBForm from './_components/update-form'; // To be implemented
// import ViewOBDetailsModal from './_components/view-details-modal'; // To be implemented

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvOpeningBalancePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useInvOpeningBalance(searchParams);

    return (
        <FormProvider<IInvOpeningBalance>>
            <InvOpeningBalancePageContent
                response={response}
                isLoading={isLoading}
                error={error}
            />
        </FormProvider>
    );
}

function InvOpeningBalancePageContent({
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
    } = useFormContext<IInvOpeningBalance>();

    const { toggleActiveMutation } = useInvOpeningBalance(); // Unused here, kept if logic needs restore

    const tableProps = useDataTableProps(response?.data, {
        dataKey: 'get_openingbalance',
        totalKey: 'total'
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading
                        title='Opening Balance'
                        description='Manage Inventory Opening Balances'
                    />
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add New OB
                    </Button>
                </div>

                <FormSections
                    storeList={response?.data?.get_Store || []}
                    itemList={response?.data?.get_item || []}
                />

                <CollapsibleSection
                    title='Opening Balance List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <GenericDataTable<IInvOpeningBalance>
                        {...tableProps}
                        data={response?.data?.get_openingbalance || []}
                        columns={invOpeningBalanceColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Opening Balance records...'
                        noDataTitle='No Records Found'
                        noDataDescription='Create a new Opening Balance to start'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* {isDetailsViewOpen && selectedRow && (
                    <ViewOBDetailsModal
                        rowData={selectedRow}
                        isOpen={isDetailsViewOpen}
                        onClose={closeDetailsView}
                    />
                )} */}

                {isToggleFormOpen && selectedRow && (
                    <ToggleOBModal rowData={selectedRow} onClose={closeToggleForm} />
                )}
            </div>
        </div>
    );
}

function FormSections({ storeList, itemList }: { storeList: any[], itemList: any[] }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<IInvOpeningBalance>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Opening Balance'
                        description='Enter the details'
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
                            <AddOBForm onSuccess={closeAddForm} storeList={storeList} itemList={itemList} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Opening Balance'
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
                            <AddOBForm
                                onSuccess={closeEditForm}
                                storeList={storeList}
                                itemList={itemList}
                                initialData={selectedRow}
                                isEdit={true}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
