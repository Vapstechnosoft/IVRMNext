'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus, X } from 'lucide-react';
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
        const shifts = store.list();
        
        // Add sample shifts if database is empty
        if (shifts.length === 0) {
            const sampleShifts: Omit<MasterShift, 'id' | 'createdAt'>[] = [
                {
                    shiftName: 'Office Staffs',
                    startTime: '08:00',
                    endTime: '16:00',
                    remarks: 'Standard office hours',
                    specificDay: false
                },
                {
                    shiftName: 'Teaching Staff',
                    startTime: '08:00',
                    endTime: '14:00',
                    remarks: 'Teaching staff shift',
                    specificDay: false
                },
                {
                    shiftName: 'Morning Shift',
                    startTime: '06:00',
                    endTime: '14:00',
                    remarks: 'Early morning shift',
                    specificDay: false
                },
                {
                    shiftName: 'Evening Shift',
                    startTime: '14:00',
                    endTime: '22:00',
                    remarks: 'Evening shift',
                    specificDay: false
                },
                {
                    shiftName: 'Night Shift',
                    startTime: '22:00',
                    endTime: '06:00',
                    remarks: 'Night shift',
                    specificDay: false
                }
            ];
            
            sampleShifts.forEach((shift) => {
                store.create(shift);
            });
            
            setRows(store.list());
        } else {
            setRows(shifts);
        }
        
        setIsLoading(false);
    }, []);

    const handleAdd = () => {
        setIsFormOpen(true);
        setEditing(null);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleFormSubmit = (data: MasterShiftFormData) => {
        try {
            const shiftData: Omit<MasterShift, 'id' | 'createdAt'> = {
                ...data,
                specificDay: data.specificDay ?? false
            };
            if (editing) {
                store.update(editing.id, data);
                toast.success('Master shift updated successfully');
            } else {
                store.create(shiftData);
                toast.success('Master shift added successfully');
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
        if (confirm('Are you sure you want to delete this shift?')) {
            store.remove(row.id);
            toast.success('Shift deleted successfully');
            setRows(store.list());
            if (editing?.id === row.id) {
                setEditing(null);
                setIsFormOpen(false);
            }
        }
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
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Shift
                    </Button>
                </div>

                {/* Table Section - Always visible */}
                <CollapsibleSection
                    title='MASTER SHIFT'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={isLoading} columns={columns} data={rows} totalItems={rows.length} showViewOptions />
                </CollapsibleSection>

                {/* Form Section - Only visible when Add/Edit */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editing ? 'Edit Master Shift' : 'Add New Master Shift'}
                            description={editing ? 'Update shift details below' : 'Fill in the details below to create a new shift'}
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
                                <ShiftForm editingShift={editing} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
