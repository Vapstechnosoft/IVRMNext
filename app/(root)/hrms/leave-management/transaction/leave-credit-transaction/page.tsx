'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditTransactionColumns, type LeaveCreditTransaction } from './_components/columns';
import { LeaveCreditTransactionForm } from './_components/leave-credit-transaction-form';

const txDB = createLocalCrud<LeaveCreditTransaction>('leaveCreditTransaction');

export default function LeaveCreditTransactionPage() {
    const [data, setData] = useState<LeaveCreditTransaction[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditTransaction | null>(null);

    const loadData = () => {
        try {
            setData(txDB.list());
        } catch (_error) {
            toast.error('Failed to load records');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setTimeout(() => document.getElementById('leave-credit-transaction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
    };

    const handleFormSubmit = (formData: LeaveCreditTransaction) => {
        try {
            if (editingRow) txDB.update(editingRow.id, formData);
            else txDB.create(formData);
            loadData();
            handleFormClose();
            toast.success('Saved successfully');
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCreditTransaction) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setTimeout(() => document.getElementById('leave-credit-transaction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        txDB.remove(id);
        loadData();
    };

    const columns = useMemo(
        () => getLeaveCreditTransactionColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button onClick={handleAddClick} variant='default' className='w-fit'>
                        Add Leave Transaction
                    </Button>
                </div>

                <CollapsibleSection
                    title='Leave Transaction List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-credit-transaction-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Transaction' : 'Add Transaction'}
                            description=''
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
