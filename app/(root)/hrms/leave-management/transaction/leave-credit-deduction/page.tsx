'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditDeductionColumns, type LeaveCreditDeduction } from './_components/columns';
import { LeaveCreditDeductionForm } from './_components/leave-credit-deduction-form';

const deductionDB = createLocalCrud<LeaveCreditDeduction>('leaveCreditDeduction');

export default function LeaveCreditDeductionPage() {
    const [data, setData] = useState<LeaveCreditDeduction[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditDeduction | null>(null);

    const loadData = () => {
        try {
            const result = deductionDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading deductions:', error);
            toast.error('Failed to load records');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setTimeout(() => document.getElementById('leave-credit-deduction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
    };

    const handleFormSubmit = (formData: LeaveCreditDeduction) => {
        try {
            if (editingRow) {
                deductionDB.update(editingRow.id, formData);
                toast.success('Record updated');
            } else {
                deductionDB.create(formData);
                toast.success('Record added');
            }
            loadData();
            handleFormClose();
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCreditDeduction) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setTimeout(() => document.getElementById('leave-credit-deduction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        deductionDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => getLeaveCreditDeductionColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Credit Deduction' />
                    </div>
                    <Button onClick={handleAddClick}>Add Leave Credit Deduction</Button>
                </div>

                <CollapsibleSection
                    title='Leave Credit Deduction List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-credit-deduction-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Deduction' : 'Add Deduction'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCreditDeductionForm editingRow={editingRow} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
