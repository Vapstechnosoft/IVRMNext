'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCreditDeduction, useUpdateLeaveCreditDeduction } from '@/hooks/hrms/leave-management/useTransactions';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditDeduction } from './columns';

interface UpdateLeaveCreditDeductionFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveCreditDeduction;
}

export default function UpdateLeaveCreditDeductionForm({
    onSuccess,
    className = '',
    selectedRow: row
}: UpdateLeaveCreditDeductionFormProps) {
    const { refetchAll } = useLeaveCreditDeduction();
    const { mutate: updateDeduction, isPending } = useUpdateLeaveCreditDeduction();

    const {
        register,
        handleSubmit,
        control,
        watch: _watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCreditDeduction>({
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
                deductDays: row.deductDays || 0,
                remarks: row.remarks || ''
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveCreditDeduction> = async (data) => {
        updateDeduction(
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
                        label='Deduct Days'
                        id='deduct-days-input'
                        type='number'
                        step='0.5'
                        {...register('deductDays', { valueAsNumber: true })}
                        error={errors.deductDays?.message}
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
