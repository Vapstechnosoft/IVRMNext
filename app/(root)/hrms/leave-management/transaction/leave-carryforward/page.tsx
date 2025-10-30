// Refactored by automation script on 2025-10-28T15:40:35.791Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-carryforward-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveCarryForward extends BaseEntity {
    fromYear: string;
    toYear: string;
    employeeName: string;
    department: string;
    designation: string;
    leaveName: string;
    carryDays: number;
}

const carryDB = createLocalCrud<LeaveCarryForward>('leaveCarryForward');

export default function LeaveCarryForwardPage() {
    const [data, setData] = useState<LeaveCarryForward[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCarryForward | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCarryForward>({
        defaultValues: {
            fromYear: '2024',
            toYear: '2025',
            employeeName: '',
            department: '',
            designation: '',
            leaveName: '',
            carryDays: 0
        }
    });

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
        reset({ fromYear: '2024', toYear: '2025', employeeName: '', department: '', designation: '', leaveName: '', carryDays: 0 });
        setTimeout(() => document.getElementById('leave-carryforward-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
        reset({ fromYear: '2024', toYear: '2025', employeeName: '', department: '', designation: '', leaveName: '', carryDays: 0 });
    };

    const onSubmit = (formData: LeaveCarryForward) => {
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
        setValue('fromYear', row.fromYear);
        setValue('toYear', row.toYear);
        setValue('employeeName', row.employeeName);
        setValue('department', row.department);
        setValue('designation', row.designation);
        setValue('leaveName', row.leaveName);
        setValue('carryDays', row.carryDays);
        setTimeout(() => document.getElementById('leave-carryforward-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        carryDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => [
            { accessorKey: 'fromYear', header: 'From Year' },
            { accessorKey: 'toYear', header: 'To Year' },
            { accessorKey: 'employeeName', header: 'Employee Name' },
            { accessorKey: 'department', header: 'Department' },
            { accessorKey: 'designation', header: 'Designation' },
            { accessorKey: 'leaveName', header: 'Leave Name' },
            { accessorKey: 'carryDays', header: 'Carry Days' },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: { row: any }) => (
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleEdit(row.original)}>
                            Edit
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleDelete(row.original.id)}>
                            Delete
                        </Button>
                    </div>
                )
            }
        ],
        []
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
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                                    <div>
                                        <label htmlFor='from-year-select' className='font-medium text-sm'>
                                            From Year
                                        </label>
                                        <Select value={watch('fromYear')} onValueChange={(v) => setValue('fromYear', v)}>
                                            <SelectTrigger id='from-year-select'>
                                                <SelectValue placeholder='From' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label htmlFor='to-year-select' className='font-medium text-sm'>
                                            To Year
                                        </label>
                                        <Select value={watch('toYear')} onValueChange={(v) => setValue('toYear', v)}>
                                            <SelectTrigger id='to-year-select'>
                                                <SelectValue placeholder='To' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label htmlFor='department-input' className='font-medium text-sm'>
                                            Department
                                        </label>
                                        <InputText id='department-input' {...register('department')} placeholder='Department' />
                                    </div>
                                    <div>
                                        <label htmlFor='designation-input' className='font-medium text-sm'>
                                            Designation
                                        </label>
                                        <InputText id='designation-input' {...register('designation')} placeholder='Designation' />
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label htmlFor='employee-name-input' className='font-medium text-sm'>
                                            Employee Name
                                        </label>
                                        <InputText
                                            id='employee-name-input'
                                            {...register('employeeName', { required: 'Employee Name is required' })}
                                            placeholder='Employee name'
                                        />
                                        {errors.employeeName && <p className='mt-1 text-red-500 text-xs'>{errors.employeeName.message}</p>}
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label htmlFor='leave-name-input' className='font-medium text-sm'>
                                            Leave Name
                                        </label>
                                        <InputText id='leave-name-input' {...register('leaveName')} placeholder='Leave name' />
                                    </div>
                                    <div>
                                        <label htmlFor='carry-days-input' className='font-medium text-sm'>
                                            Carry Days
                                        </label>
                                        <InputText
                                            id='carry-days-input'
                                            type='number'
                                            step='0.5'
                                            {...register('carryDays', { valueAsNumber: true })}
                                            placeholder='0'
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <Button type='submit'>{editingRow ? 'Update' : 'Save'}</Button>
                                    <Button type='button' variant='outline' onClick={handleFormClose}>
                                        Cancel
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
