'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCarryForward, useUpdateLeaveCarryForward } from '@/hooks/hrms/leave-management/useTransactions';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCarryForward } from './columns';

interface UpdateLeaveCarryForwardFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveCarryForward;
}

export default function UpdateLeaveCarryForwardForm({ onSuccess, className = '', selectedRow: row }: UpdateLeaveCarryForwardFormProps) {
    const { refetchAll } = useLeaveCarryForward();
    const { mutate: updateCarryForward, isPending } = useUpdateLeaveCarryForward();

    const {
        register,
        handleSubmit,
        control,
        watch: _watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCarryForward>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                fromYear: row.fromYear || '2024',
                toYear: row.toYear || '2025',
                employeeName: row.employeeName || '',
                department: row.department || '',
                designation: row.designation || '',
                leaveName: row.leaveName || '',
                carryDays: row.carryDays || 0
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveCarryForward> = async (data) => {
        updateCarryForward(
            {
                ...data,
                id: row.id
            },
            {
                onSuccess: () => {
                    reset();
                    refetchAll();
                    onSuccess?.();
                }
            }
        );
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                    <Controller
                        name='fromYear'
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='from-year-select' className='font-medium text-sm'>
                                    From Year
                                </label>
                                <Select value={field.value} onValueChange={field.onChange}>
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
                        )}
                    />
                    <Controller
                        name='toYear'
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='to-year-select' className='font-medium text-sm'>
                                    To Year
                                </label>
                                <Select value={field.value} onValueChange={field.onChange}>
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
                        )}
                    />
                    <InputText
                        label='Department'
                        id='department-input'
                        {...register('department')}
                        error={errors.department?.message}
                        placeholder='Department'
                    />
                    <InputText
                        label='Designation'
                        id='designation-input'
                        {...register('designation')}
                        error={errors.designation?.message}
                        placeholder='Designation'
                    />
                    <InputText
                        label='Employee Name'
                        required
                        id='employee-name-input'
                        {...register('employeeName', { required: 'Employee Name is required' })}
                        error={errors.employeeName?.message}
                        placeholder='Employee name'
                        className='md:col-span-2'
                    />
                    <InputText
                        label='Leave Name'
                        id='leave-name-input'
                        {...register('leaveName')}
                        error={errors.leaveName?.message}
                        placeholder='Leave name'
                        className='md:col-span-2'
                    />
                    <InputText
                        label='Carry Days'
                        id='carry-days-input'
                        type='number'
                        step='0.5'
                        {...register('carryDays', { valueAsNumber: true })}
                        error={errors.carryDays?.message}
                        placeholder='0'
                    />
                </div>

                <div className='flex justify-end gap-2'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
