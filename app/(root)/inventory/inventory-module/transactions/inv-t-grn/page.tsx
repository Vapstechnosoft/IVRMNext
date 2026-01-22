'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { useInvTGRN } from '@/hooks/inventory/transactions/use-inv-t-grn';
import type { IInvTGRN } from '@/types/inventory/transactions/inv-t-grn';
import AddGRNForm from './_components/add-form';
import { getColumns } from './_components/columns';
import UpdateGRNForm from './_components/update-form';
import ViewGRNDetailsModal from './_components/view-details-modal';
import { Heading } from '@/components/layout/heading';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvTGRNPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useInvTGRN(searchParams);

    return (
        <FormProvider<IInvTGRN>>
            <InvTGRNPageContent
                response={response}
                isLoading={isLoading}
                error={error}
            />
        </FormProvider>
    );
}

function InvTGRNPageContent({
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
        openDeleteForm,
        openToggleForm,
        openDetailsView,
        selectedRow,
        isDetailsViewOpen,
        closeDetailsView
    } = useFormContext<IInvTGRN>();

    const { deleteMutation, toggleActiveMutation } = useInvTGRN();

    const columns = getColumns({
        onEdit: openEditForm,
        onDelete: (item) => {
            if (confirm('Are you sure you want to delete this GRN?')) {
                deleteMutation.mutate(item);
            }
        },
        onToggleActive: (item) => {
            if (confirm(`Are you sure you want to ${item.invmgrN_ActiveFlg ? 'deactivate' : 'activate'} this GRN?`)) {
                toggleActiveMutation.mutate(item);
            }
        },
        onView: openDetailsView
    });

    const tableProps = useDataTableProps(response?.data, {
        dataKey: 'get_GRN',
        totalKey: 'total'
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading
                        title='GRN (Goods Receipt Note)'
                        description='Manage inventory receipts and stock entry'
                    />
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='h-4 w-4 mr-2' />
                        New GRN
                    </Button>
                </div>

                <FormSections />

                <CollapsibleSection
                    title='GRN List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <GenericDataTable<IInvTGRN>
                        {...tableProps}
                        data={response?.data?.get_GRN || []}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading GRN records...'
                        noDataTitle='No GRN Found'
                        noDataDescription='Create a new GRN to start receiving inventory'
                        errorTitle='Error Loading GRN Data'
                    />
                </CollapsibleSection>

                {isDetailsViewOpen && selectedRow && (
                    <ViewGRNDetailsModal
                        rowData={selectedRow}
                        isOpen={isDetailsViewOpen}
                        onClose={closeDetailsView}
                    />
                )}
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
    } = useFormContext<IInvTGRN>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Create New GRN'
                        description='Enter the details of the goods received'
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
                            <AddGRNForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={`Edit GRN: ${selectedRow.invmgrN_GRNNo}`}
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
                            <UpdateGRNForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
