'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCreditAddition, useUpdateLeaveCreditAddition } from '@/hooks/hrms/leave-management/useTransactions';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import type { LeaveCreditAddition } from './columns';

interface UpdateLeaveCreditAdditionFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveCreditAddition;
}

export default function UpdateLeaveCreditAdditionForm({ onSuccess, className = '', selectedRow: row }: UpdateLeaveCreditAdditionFormProps) {
    const { refetchAll } = useLeaveCreditAddition();
    const { mutate: updateAddition, isPending } = useUpdateLeaveCreditAddition();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCreditAddition>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                leaveYear: row.leaveYear || '2025',
                employeeName: row.employeeName || '',
                designation: row.designation || '',
                department: row.department || '',
                leaveName: row.leaveName || '',
                addDays: row.addDays || 0,
                remarks: row.remarks || ''
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveCreditAddition> = async (data) => {
        updateAddition(
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
                        name='leaveYear'
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='leave-year-select' className='font-medium text-sm'>
                                    Leave Year
                                </label>
                                <Select value={field.value} onValueChange={field.onChange}>
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
                        label='Add Days'
                        id='add-days-input'
                        type='number'
                        step='0.5'
                        {...register('addDays', { valueAsNumber: true })}
                        error={errors.addDays?.message}
                        placeholder='0'
                    />
                    <InputText
                        label='Remarks'
                        id='remarks-input'
                        {...register('remarks')}
                        error={errors.remarks?.message}
                        placeholder='Remarks'
                        className='md:col-span-4'
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

