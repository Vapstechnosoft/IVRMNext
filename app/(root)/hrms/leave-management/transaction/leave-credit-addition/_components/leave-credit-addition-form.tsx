'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditAddition } from './columns';

interface LeaveCreditAdditionFormProps {
    editingRow: LeaveCreditAddition | null;
    onSubmit: (data: LeaveCreditAddition) => void;
    onCancel: () => void;
}

export function LeaveCreditAdditionForm({ editingRow, onSubmit, onCancel }: LeaveCreditAdditionFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCreditAddition>({
        defaultValues: editingRow || {
            leaveYear: '2025',
            employeeName: '',
            designation: '',
            department: '',
            leaveName: '',
            addDays: 0,
            remarks: ''
        }
    });

    const handleFormSubmit: SubmitHandler<LeaveCreditAddition> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='md:col-span-1'>
                    <label htmlFor='leave-year-select' className='font-medium text-sm'>
                        Leave Year
                    </label>
                    <Select value={watch('leaveYear')} onValueChange={(v) => setValue('leaveYear', v)}>
                        <SelectTrigger id='leave-year-select'>
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
                    <label htmlFor='department-input' className='font-medium text-sm'>
                        Department
                    </label>
                    <InputText id='department-input' {...register('department')} placeholder='Department' />
                </div>
                <div className='md:col-span-1'>
                    <label htmlFor='designation-input' className='font-medium text-sm'>
                        Designation
                    </label>
                    <InputText id='designation-input' {...register('designation')} placeholder='Designation' />
                </div>
                <div className='md:col-span-1'>
                    <label htmlFor='employee-name-input' className='font-medium text-sm'>
                        Employee Name
                    </label>
                    <InputText
                        id='employee-name-input'
                        {...register('employeeName', { required: 'Employee Name is required' })}
                        placeholder='Employee name'
                        className={errors.employeeName ? 'border-red-500' : ''}
                    />
                    {errors.employeeName && <p className='mt-1 text-red-500 text-xs'>{errors.employeeName.message}</p>}
                </div>
                <div className='md:col-span-2'>
                    <label htmlFor='leave-name-input' className='font-medium text-sm'>
                        Leave Name
                    </label>
                    <InputText id='leave-name-input' {...register('leaveName')} placeholder='Leave name' />
                </div>
                <div className='md:col-span-1'>
                    <label htmlFor='add-days-input' className='font-medium text-sm'>
                        Add Days
                    </label>
                    <InputText
                        id='add-days-input'
                        type='number'
                        step='0.5'
                        {...register('addDays', { valueAsNumber: true })}
                        placeholder='0'
                    />
                </div>
                <div className='md:col-span-4'>
                    <label htmlFor='remarks-input' className='font-medium text-sm'>
                        Remarks
                    </label>
                    <InputText id='remarks-input' {...register('remarks')} placeholder='Remarks' />
                </div>
            </div>
            <div className='flex gap-2'>
                <Button type='submit'>{editingRow ? 'Update' : 'Save'}</Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
