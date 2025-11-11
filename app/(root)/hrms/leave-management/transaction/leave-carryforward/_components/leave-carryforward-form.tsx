'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCarryForward } from './columns';

interface LeaveCarryForwardFormProps {
    editingRow: LeaveCarryForward | null;
    onSubmit: (data: LeaveCarryForward) => void;
    onCancel: () => void;
}

export function LeaveCarryForwardForm({ editingRow, onSubmit, onCancel }: LeaveCarryForwardFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCarryForward>({
        defaultValues: editingRow || {
            fromYear: '2024',
            toYear: '2025',
            employeeName: '',
            department: '',
            designation: '',
            leaveName: '',
            carryDays: 0
        }
    });

    const handleFormSubmit: SubmitHandler<LeaveCarryForward> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
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
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
