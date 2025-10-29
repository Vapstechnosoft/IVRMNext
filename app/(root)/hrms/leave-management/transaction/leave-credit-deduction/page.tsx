// Refactored by automation script on 2025-10-28T15:40:35.807Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-credit-deduction-form.tsx
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

interface LeaveCreditDeduction extends BaseEntity {
    leaveYear: string;
    employeeName: string;
    designation: string;
    department: string;
    leaveName: string;
    deductDays: number;
    remarks?: string;
}

const deductionDB = createLocalCrud<LeaveCreditDeduction>('leaveCreditDeduction');

export default function LeaveCreditDeductionPage() {
    const [data, setData] = useState<LeaveCreditDeduction[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditDeduction | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCreditDeduction>({
        defaultValues: {
            leaveYear: '2025',
            employeeName: '',
            designation: '',
            department: '',
            leaveName: '',
            deductDays: 0,
            remarks: ''
        }
    });

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
        reset({ leaveYear: '2025', employeeName: '', designation: '', department: '', leaveName: '', deductDays: 0, remarks: '' });
        setTimeout(() => document.getElementById('leave-credit-deduction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
        reset({ leaveYear: '2025', employeeName: '', designation: '', department: '', leaveName: '', deductDays: 0, remarks: '' });
    };

    const onSubmit = (formData: LeaveCreditDeduction) => {
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
        setValue('leaveYear', row.leaveYear);
        setValue('employeeName', row.employeeName);
        setValue('designation', row.designation);
        setValue('department', row.department);
        setValue('leaveName', row.leaveName);
        setValue('deductDays', row.deductDays);
        setValue('remarks', row.remarks || '');
        setTimeout(() => document.getElementById('leave-credit-deduction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        deductionDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => [
            { accessorKey: 'leaveYear', header: 'Leave Year' },
            { accessorKey: 'employeeName', header: 'Employee Name' },
            { accessorKey: 'designation', header: 'Designation' },
            { accessorKey: 'department', header: 'Department' },
            { accessorKey: 'leaveName', header: 'Leave Name' },
            { accessorKey: 'deductDays', header: 'Deduct Days' },
            { accessorKey: 'remarks', header: 'Remarks' },
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
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} />
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
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                                    <div className='md:col-span-1'>
                                        <label className='font-medium text-sm'>Leave Year</label>
                                        <Select value={watch('leaveYear')} onValueChange={(v) => setValue('leaveYear', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select year' />
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
                                    <div className='md:col-span-1'>
                                        <label className='font-medium text-sm'>Department</label>
                                        <InputText {...register('department')} placeholder='Department' />
                                    </div>
                                    <div className='md:col-span-1'>
                                        <label className='font-medium text-sm'>Designation</label>
                                        <InputText {...register('designation')} placeholder='Designation' />
                                    </div>
                                    <div className='md:col-span-1'>
                                        <label className='font-medium text-sm'>Employee Name</label>
                                        <InputText
                                            {...register('employeeName', { required: 'Employee Name is required' })}
                                            placeholder='Employee name'
                                        />
                                        {errors.employeeName && <p className='mt-1 text-red-500 text-xs'>{errors.employeeName.message}</p>}
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label className='font-medium text-sm'>Leave Name</label>
                                        <InputText {...register('leaveName')} placeholder='Leave name' />
                                    </div>
                                    <div className='md:col-span-1'>
                                        <label className='font-medium text-sm'>Deduct Days</label>
                                        <InputText
                                            type='number'
                                            step='0.5'
                                            {...register('deductDays', { valueAsNumber: true })}
                                            placeholder='0'
                                        />
                                    </div>
                                    <div className='md:col-span-4'>
                                        <label className='font-medium text-sm'>Remarks</label>
                                        <InputText {...register('remarks')} placeholder='Remarks' />
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
