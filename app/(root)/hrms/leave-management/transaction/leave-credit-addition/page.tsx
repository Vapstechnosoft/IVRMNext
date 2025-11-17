'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditAdditionColumns, type LeaveCreditAddition } from './_components/columns';
import { LeaveCreditAdditionForm } from './_components/leave-credit-addition-form';

const additionDB = createLocalCrud<LeaveCreditAddition>('leaveCreditAddition');

export default function LeaveCreditAdditionPage() {
    const [data, setData] = useState<LeaveCreditAddition[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditAddition | null>(null);

    const loadData = () => {
        try {
            const result = additionDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading additions:', error);
            toast.error('Failed to load records');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setTimeout(() => document.getElementById('leave-credit-addition-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
    };

    const handleFormSubmit = (formData: LeaveCreditAddition) => {
        try {
            if (editingRow) {
                additionDB.update(editingRow.id, formData);
                toast.success('Record updated');
            } else {
                additionDB.create(formData);
                toast.success('Record added');
            }
            loadData();
            handleFormClose();
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCreditAddition) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setTimeout(() => document.getElementById('leave-credit-addition-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        additionDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => getLeaveCreditAdditionColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Credit Addition' />
                    </div>
                    <Button onClick={handleAddClick}>Add Leave Credit Addition</Button>
                </div>

                <CollapsibleSection
                    title='Leave Credit Addition List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-credit-addition-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Addition' : 'Add Addition'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCreditAdditionForm editingRow={editingRow} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
