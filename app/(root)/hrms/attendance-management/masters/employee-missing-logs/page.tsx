'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type MissingLog, getMissingLogColumns } from './_components/columns';
import { MissingLogForm, type MissingLogFormData } from './_components/missing-log-form';

export default function EmployeeMissingLogsPage() {
    const store = createLocalCrud<MissingLog>('attendance:employee-missing-logs');
    const [rows, setRows] = useState<MissingLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<MissingLog | null>(null);
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

    const handleFormSubmit = (data: MissingLogFormData) => {
        try {
            if (editing) {
                store.update(editing.id, data);
                toast.success('Missing log updated');
            } else {
                store.create({ ...data, reportedBy: 'SYSTEM', status: 'Approved' });
                toast.success('Missing log added');
            }
            setIsFormOpen(false);
            setEditing(null);
            setRows(store.list());
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditing(null);
    };

    const handleEdit = (row: MissingLog) => {
        setEditing(row);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDelete = (row: MissingLog) => {
        store.remove(row.id);
        toast.success('Deleted');
        setRows(store.list());
    };

    const columns = getMissingLogColumns({
        onEdit: handleEdit,
        onDelete: handleDelete
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Missing Logs' description='Record and track missing IN/OUT logs' />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAdd}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Log
                    </Button>
                </div>

                <CollapsibleSection
                    title='Employee Missing Logs Details'
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
                            title={editing ? 'Edit Missing Log' : 'Employee Missing Log Entry'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <MissingLogForm editingMissingLog={editing} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
