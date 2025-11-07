'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type DriverShift, getDriverShiftColumns } from './_components/columns';
import { type DriverShiftForm, DriverShiftForm as DriverShiftFormComponent } from './_components/driver-shift-form';

export default function MasterDriverShiftPage() {
    const store = createLocalCrud<DriverShift>('attendance:master-driver-shift');
    const [rows, setRows] = useState<DriverShift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<DriverShift | null>(null);
    const [editingShift, setEditingShift] = useState<DriverShiftForm | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRows(store.list());
        setIsLoading(false);
    }, []);

    const handleAdd = () => {
        setIsFormOpen(true);
        setEditing(null);
        setEditingShift(null);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleFormSubmit = (data: DriverShiftForm) => {
        try {
            if (editing) {
                store.update(editing.id, data);
                toast.success('Driver shift updated');
            } else {
                store.create({ ...data });
                toast.success('Driver shift added');
            }
            setIsFormOpen(false);
            setEditing(null);
            setEditingShift(null);
            setRows(store.list());
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const handleEdit = (row: DriverShift) => {
        setEditing(row);
        setEditingShift({
            shift: row.shift,
            driver: row.driver,
            fromDate: row.fromDate,
            toDate: row.toDate,
            remarks: row.remarks,
            saturdayOff: row.saturdayOff,
            sundayWorking: row.sundayWorking
        });
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };
    const handleDelete = (row: DriverShift) => {
        store.remove(row.id);
        toast.success('Deleted');
        setRows(store.list());
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditing(null);
        setEditingShift(null);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Master Driver Shift' description='Define driver shift schedules and flags' />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAdd}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Driver Shift
                    </Button>
                </div>

                <CollapsibleSection
                    title='Total Grid Records'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable
                        isLoading={isLoading}
                        columns={getDriverShiftColumns({ onEdit: handleEdit, onDelete: handleDelete })}
                        data={rows}
                        totalItems={rows.length}
                        showViewOptions
                    />
                </CollapsibleSection>

                {isFormOpen && (
                    <div ref={formRef}>
                        <CollapsibleSection
                            title={editing ? 'Edit Driver Shift' : 'Master Driver Shift'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <DriverShiftFormComponent editingShift={editingShift} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
