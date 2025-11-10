'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus, X } from 'lucide-react';
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
                // For editing, update the single entry
                const entry = data.entries[0];
                store.update(editing.id, {
                    ...editing,
                    employeeName: data.employeeName,
                    date: data.date,
                    time: entry.time,
                    inOut: entry.inOut,
                    remarks: entry.remarks,
                    file: entry.file
                });
                toast.success('Missing log updated');
            } else {
                // For new entries, create one record per entry
                data.entries.forEach((entry) => {
                    store.create({
                        employeeName: data.employeeName,
                        date: data.date,
                        time: entry.time,
                        inOut: entry.inOut,
                        remarks: entry.remarks,
                        file: entry.file,
                        reportedBy: 'VTSPD',
                        status: 'Approved' as const
                    });
                });
                toast.success(`Missing log${data.entries.length > 1 ? 's' : ''} added`);
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

    const columns = getMissingLogColumns();

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
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Employee Missing Log
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
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editing ? 'Edit Employee Missing Log' : 'Add New Employee Missing Log'}
                            description={editing ? 'Update missing log details below' : 'Fill in the details below to create a new missing log entry'}
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='shadow-lg'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={handleFormCancel}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <MissingLogForm editingMissingLog={editing} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
