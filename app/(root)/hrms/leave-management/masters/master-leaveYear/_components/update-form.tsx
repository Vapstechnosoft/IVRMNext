'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterLeaveYear, useUpdateMasterLeaveYear } from '@/hooks/hrms/leave-management/useMasters';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import type { LeaveYear } from './columns';

interface UpdateMasterLeaveYearFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveYear;
}

export default function UpdateMasterLeaveYearForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterLeaveYearFormProps) {
    const { refetchAll } = useMasterLeaveYear();
    const { mutate: updateMasterLeaveYear, isPending } = useUpdateMasterLeaveYear();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveYear>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                leaveYear: row.leaveYear || '',
                fromDate: row.fromDate || '',
                toDate: row.toDate || '',
                isActive: row.isActive ?? true
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveYear> = async (data) => {
        updateMasterLeaveYear(
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
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Leave Year'
                            required
                            id='leaveYear'
                            {...register('leaveYear', { required: 'Leave year is required' })}
                            error={errors.leaveYear?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='From Date'
                            required
                            id='fromDate'
                            type='date'
                            {...register('fromDate', { required: 'From date is required' })}
                            error={errors.fromDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='To Date'
                            required
                            id='toDate'
                            type='date'
                            {...register('toDate', { required: 'To date is required' })}
                            error={errors.toDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <div className='flex items-center space-x-2'>
                        <Controller
                            name='isActive'
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id='isActive'
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <label htmlFor='isActive' className='font-medium text-sm'>
                            Active
                        </label>
                    </div>
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

