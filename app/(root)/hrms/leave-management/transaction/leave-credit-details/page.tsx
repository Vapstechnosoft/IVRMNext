'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditDetailColumns, type LeaveCreditDetail } from './_components/columns';
import { LeaveCreditDetailsForm } from './_components/leave-credit-details-form';

const detailDB = createLocalCrud<LeaveCreditDetail>('leaveCreditDetails');

export default function LeaveCreditDetailsPage() {
    const [data, setData] = useState<LeaveCreditDetail[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditDetail | null>(null);

    const loadData = () => {
        try {
            const result = detailDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading details:', error);
            toast.error('Failed to load records');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setTimeout(() => document.getElementById('leave-credit-details-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
    };

    const handleFormSubmit = (formData: LeaveCreditDetail) => {
        try {
            if (editingRow) {
                detailDB.update(editingRow.id, formData);
                toast.success('Record updated');
            } else {
                detailDB.create(formData);
                toast.success('Record added');
            }
            loadData();
            handleFormClose();
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCreditDetail) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setTimeout(() => document.getElementById('leave-credit-details-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        detailDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => getLeaveCreditDetailColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button onClick={handleAddClick} variant='default' className='w-fit'>
                        Add Leave Credit Details
                    </Button>
                </div>

                <CollapsibleSection
                    title='Leave Credit Details'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-credit-details-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Credit Details' : 'Add Credit Details'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCreditDetailsForm editingRow={editingRow} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
