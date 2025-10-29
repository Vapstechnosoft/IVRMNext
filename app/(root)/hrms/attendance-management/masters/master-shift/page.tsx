'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type MasterShift, getMasterShiftColumns } from './_components/columns';
import { type MasterShiftFormData, ShiftForm } from './_components/shift-form';

export default function MasterShiftPage() {
    const store = createLocalCrud<MasterShift>('attendance:master-shift');
    const [rows, setRows] = useState<MasterShift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<MasterShift | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRows(store.list());
        setIsLoading(false);
    }, []);

    const handleAdd = () => {
        setIsFormOpen(true);
        setEditing(null);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleFormSubmit = (data: MasterShiftFormData) => {
        try {
            if (editing) {
                store.update(editing.id, data);
                toast.success('Master shift updated');
            } else {
                store.create({ ...data });
                toast.success('Master shift added');
            }
            setIsFormOpen(false);
            setEditing(null);
            setRows(store.list());
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const handleEdit = (row: MasterShift) => {
        setEditing(row);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDelete = (row: MasterShift) => {
        store.remove(row.id);
        toast.success('Deleted');
        setRows(store.list());
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditing(null);
    };

    const columns = getMasterShiftColumns({
        onEdit: handleEdit,
        onDelete: handleDelete
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Master Shift' description='Manage standard shift definitions' />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAdd}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Shift
                    </Button>
                </div>

                <CollapsibleSection
                    title='Master Shift'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable isLoading={isLoading} columns={columns} data={rows} totalItems={rows.length} showViewOptions />
                </CollapsibleSection>

                {isFormOpen && (
                    <div ref={formRef}>
                        <CollapsibleSection
                            title={editing ? 'Edit Master Shift' : 'Add Master Shift'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <ShiftForm editingShift={editing} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
