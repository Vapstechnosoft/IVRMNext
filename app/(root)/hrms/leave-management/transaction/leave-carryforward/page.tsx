'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCarryForwardColumns, type LeaveCarryForward } from './_components/columns';
import { LeaveCarryForwardForm } from './_components/leave-carryforward-form';

const carryDB = createLocalCrud<LeaveCarryForward>('leaveCarryForward');

export default function LeaveCarryForwardPage() {
    const [data, setData] = useState<LeaveCarryForward[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCarryForward | null>(null);

    const loadData = () => {
        try {
            const result = carryDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading records:', error);
            toast.error('Failed to load records');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setTimeout(() => document.getElementById('leave-carryforward-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
    };

    const handleFormSubmit = (formData: LeaveCarryForward) => {
        try {
            if (editingRow) {
                carryDB.update(editingRow.id, formData);
                toast.success('Record updated');
            } else {
                carryDB.create(formData);
                toast.success('Record added');
            }
            loadData();
            handleFormClose();
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCarryForward) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setTimeout(() => document.getElementById('leave-carryforward-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        carryDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => getLeaveCarryForwardColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Carry Forward' />
                    </div>
                    <Button onClick={handleAddClick}>Add Leave Carry Forward</Button>
                </div>

                <CollapsibleSection
                    title='Leave Carry Forward List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-carryforward-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Carry Forward' : 'Add Carry Forward'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCarryForwardForm editingRow={editingRow} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
