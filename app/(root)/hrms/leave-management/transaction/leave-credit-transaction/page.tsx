'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLeaveCreditTransaction, useSaveLeaveCreditTransaction, useDeleteLeaveCreditTransaction } from '@/hooks/hrms/leave-management/useTransactions';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditTransactionColumns, type LeaveCreditTransaction } from './_components/columns';
import { LeaveCreditTransactionForm } from './_components/leave-credit-transaction-form';

export default function LeaveCreditTransactionPage() {
    const { data: response, isLoading, refetchAll } = useLeaveCreditTransaction();
    const { mutate: saveTransaction, isPending: isSaving } = useSaveLeaveCreditTransaction();
    const { mutate: deleteTransaction } = useDeleteLeaveCreditTransaction();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditTransaction | null>(null);

    const data = useMemo(() => response?.data || [], [response?.data]);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-transaction-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
    };

    const handleFormSubmit = (formData: LeaveCreditTransaction) => {
        saveTransaction(formData, {
            onSuccess: () => {
                toast.success(editingRow ? 'Leave transaction updated successfully' : 'Leave transaction saved successfully');
                refetchAll();
                handleFormClose();
            }
        });
    };

    const handleEdit = (row: LeaveCreditTransaction) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-transaction-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave transaction record?')) {
            deleteTransaction(id, {
                onSuccess: () => {
                    toast.success('Leave transaction deleted successfully');
                    refetchAll();
                }
            });
        }
    };

    const columns = useMemo(
        () => getLeaveCreditTransactionColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        []
    );

    const tableProps = useDataTableProps({
        data: data,
        columns: columns,
        totalItems: data.length,
        searchParams: {},
        onSearchParamsChange: () => {}
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header with Add Button */}
                <div className='flex justify-end'>
                    <Button onClick={handleAddClick} variant='default' className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Leave Transaction
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable {...tableProps} columns={columns} isLoading={isLoading} />
                </CollapsibleSection>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='leave-credit-transaction-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Leave Transaction' : 'LEAVE TRANSACTION'}
                            description={editingRow ? 'Update leave transaction information' : 'Fill in the details to process leave transaction'}
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCreditTransactionForm editingRow={editingRow} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
