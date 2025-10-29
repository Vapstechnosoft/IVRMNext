// Refactored by automation script on 2025-10-28T15:40:35.612Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/driver-shift-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface DriverShift extends BaseEntity {
    shift: string;
    driver: string;
    fromDate: string;
    toDate: string;
    remarks?: string;
    saturdayOff: boolean;
    sundayWorking: boolean;
}

type DriverShiftForm = {
    shift: string;
    driver: string;
    fromDate: string;
    toDate: string;
    remarks?: string;
    saturdayOff: boolean;
    sundayWorking: boolean;
};

export default function MasterDriverShiftPage() {
    const store = createLocalCrud<DriverShift>('attendance:master-driver-shift');
    const [rows, setRows] = useState<DriverShift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<DriverShift | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<DriverShiftForm>({
        mode: 'onChange',
        defaultValues: { saturdayOff: false, sundayWorking: false }
    });

    useEffect(() => {
        setRows(store.list());
        setIsLoading(false);
    }, []);

    const handleAdd = () => {
        setIsFormOpen(true);
        setEditing(null);
        reset({ saturdayOff: false, sundayWorking: false } as any);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const onSubmit: SubmitHandler<DriverShiftForm> = async (data) => {
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
            setRows(store.list());
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const handleEdit = (row: DriverShift) => {
        setEditing(row);
        reset(row as any);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };
    const handleDelete = (row: DriverShift) => {
        store.remove(row.id);
        toast.success('Deleted');
        setRows(store.list());
    };

    const columns: ColumnDef<DriverShift>[] = [
        {
            id: 'sl',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        { accessorKey: 'driver', header: ({ column }) => <DataTableColumnHeader column={column} title='Driver Name' /> },
        { accessorKey: 'shift', header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' /> },
        { accessorKey: 'fromDate', header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' /> },
        { accessorKey: 'toDate', header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' /> },
        { accessorKey: 'remarks', header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' /> },
        {
            accessorKey: 'sundayWorking',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sunday Working Flag' />,
            cell: ({ row }) => <div>{row.getValue('sundayWorking') ? '✔' : '✖'}</div>
        },
        {
            accessorKey: 'saturdayOff',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Saturday Off Flag' />,
            cell: ({ row }) => <div>{row.getValue('saturdayOff') ? '✔' : '✖'}</div>
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const r = row.original as DriverShift;
                return (
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleEdit(r)}>
                            <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm' className='text-red-600' onClick={() => handleDelete(r)}>
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    </div>
                );
            }
        }
    ];

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
                    <GenericDataTable isLoading={isLoading} columns={columns} data={rows} totalItems={rows.length} showViewOptions />
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
                            <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <label className='font-medium text-sm'>
                                        Shift <span className='text-red-500'>*</span>
                                    </label>
                                    <Select onValueChange={(v) => setValue('shift', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Shift' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Morning Shift'>Morning Shift</SelectItem>
                                            <SelectItem value='Afternoon Shift'>Afternoon Shift</SelectItem>
                                            <SelectItem value='Evening Shift'>Evening Shift</SelectItem>
                                            <SelectItem value='Night Shift'>Night Shift</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <label className='font-medium text-sm'>
                                        Driver <span className='text-red-500'>*</span>
                                    </label>
                                    <Select onValueChange={(v) => setValue('driver', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Driver' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Arun A'>Arun A</SelectItem>
                                            <SelectItem value='Arun R'>Arun R</SelectItem>
                                            <SelectItem value='Ashok R'>Ashok R</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <label className='font-medium text-sm'>
                                        From Date <span className='text-red-500'>*</span>
                                    </label>
                                    <InputText
                                        type='date'
                                        {...register('fromDate', { required: 'Required' })}
                                        error={errors.fromDate?.message}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label className='font-medium text-sm'>
                                        To Date <span className='text-red-500'>*</span>
                                    </label>
                                    <InputText
                                        type='date'
                                        {...register('toDate', { required: 'Required' })}
                                        error={errors.toDate?.message}
                                    />
                                </div>
                                <div className='space-y-2 md:col-span-2'>
                                    <label className='font-medium text-sm'>Remarks</label>
                                    <InputText placeholder='Enter Remarks' {...register('remarks')} />
                                </div>
                                <div className='flex items-center gap-8'>
                                    <label className='flex items-center gap-2 text-sm'>
                                        <Checkbox
                                            checked={watch('saturdayOff')}
                                            onCheckedChange={(v) => setValue('saturdayOff', Boolean(v))}
                                        />{' '}
                                        Saturday Off Flag
                                    </label>
                                    <label className='flex items-center gap-2 text-sm'>
                                        <Checkbox
                                            checked={watch('sundayWorking')}
                                            onCheckedChange={(v) => setValue('sundayWorking', Boolean(v))}
                                        />{' '}
                                        Sunday Working Flag
                                    </label>
                                </div>

                                <div className='flex justify-center gap-4 border-t pt-6 md:col-span-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            setIsFormOpen(false);
                                            setEditing(null);
                                        }}>
                                        <X className='mr-2 h-4 w-4' />
                                        Cancel
                                    </Button>
                                    <Button type='submit' disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <div className='flex items-center'>
                                                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                Saving...
                                            </div>
                                        ) : (
                                            <div className='flex items-center'>
                                                <Save className='mr-2 h-4 w-4' />
                                                Save
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
