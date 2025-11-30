'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useDeleteLeaveCreditTransaction,
    useLeaveCreditTransaction,
    useSaveLeaveCreditTransaction
} from '@/hooks/hrms/leave-management/useTransactions';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { toast } from 'sonner';
import { type LeaveCreditTransaction, getLeaveCreditTransactionColumns } from './_components/columns';
import { LeaveCreditTransactionForm } from './_components/leave-credit-transaction-form';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function LeaveCreditTransactionPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useLeaveCreditTransaction();
    return (
        <FormProvider<LeaveCreditTransaction>>
            <LeaveCreditTransactionPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}
function LeaveCreditTransactionPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<LeaveCreditTransaction>();
    const { openEditForm, openDeleteForm } = useFormContext<LeaveCreditTransaction>();
    const tableProps = useDataTableProps(response);
    const columns = getLeaveCreditTransactionColumns({
        onEdit: openEditForm,
        onDelete: (id: number) => {
            const row = response?.data?.find((r: LeaveCreditTransaction) => r.id === id);
            if (row) {
                openDeleteForm(row);
            }
        }
    });
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Leave Transaction
                    </Button>
                </div>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveCreditTransaction>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave transactions...'
                        noDataTitle='No Leave Transactions Found'
                        noDataDescription='Get started by creating your first leave transaction'
                        errorTitle='Error Loading Leave Transactions'
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
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<LeaveCreditTransaction>();
    const { refetchAll } = useLeaveCreditTransaction();
    const { mutate: saveTransaction } = useSaveLeaveCreditTransaction();
    const { mutate: deleteTransaction } = useDeleteLeaveCreditTransaction();
    const handleFormSubmit = (formData: LeaveCreditTransaction) => {
        saveTransaction(formData, {
            onSuccess: () => {
                toast.success(selectedRow ? 'Leave transaction updated successfully' : 'Leave transaction saved successfully');
                refetchAll();
                closeEditForm();
                closeAddForm();
            }
        });
    };
    const handleDelete = () => {
        if (selectedRow) {
            deleteTransaction(selectedRow.id, {
                onSuccess: () => {
                    toast.success('Leave transaction deleted successfully');
                    refetchAll();
                    closeDeleteForm();
                }
            });
        }
    };
    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='LEAVE TRANSACTION'
                        description='Fill in the details to process leave transaction'
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
                            <LeaveCreditTransactionForm editingRow={null} onSubmit={handleFormSubmit} onCancel={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Leave Transaction'
                        description='Update leave transaction information'
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
                            <LeaveCreditTransactionForm editingRow={selectedRow} onSubmit={handleFormSubmit} onCancel={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg'>
                        <h2 className='mb-4 font-semibold text-lg'>Delete Leave Transaction</h2>
                        <p className='mb-6'>Are you sure you want to delete this leave transaction? This action cannot be undone.</p>
                        <div className='flex justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={closeDeleteForm}>
                                Cancel
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
