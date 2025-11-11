'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplyLeave, useLeaveHistory } from '@/hooks/hrms/leave-management/useApplyLeave';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { ApplyLeave } from './columns';

interface AddApplyLeaveFormProps {
    onSuccess?: () => void;
    className?: string;
    defaultEmployee: {
        name: string;
        designation: string;
        doj: string;
    };
}

export default function AddApplyLeaveForm({ onSuccess, className = '', defaultEmployee }: AddApplyLeaveFormProps) {
    const { refetchAll } = useLeaveHistory();
    const { mutate: applyLeave, isPending } = useApplyLeave();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ApplyLeave>({
        mode: 'onChange',
        defaultValues: {
            employeeName: defaultEmployee.name,
            designation: defaultEmployee.designation,
            doj: defaultEmployee.doj,
            leaveType: '',
            fromDate: '',
            toDate: '',
            numDays: 0,
            reason: ''
        }
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    const todayISO = new Date().toISOString().slice(0, 10);

    // Auto-calculate number of days and validate date sequence
    useEffect(() => {
        if (!fromDate || !toDate) {
            setValue('numDays', 0);
            return;
        }
        const start = new Date(fromDate);
        const end = new Date(toDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setValue('numDays', 0);
            return;
        }
        if (end < start) {
            setValue('numDays', 0);
            return;
        }
        const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setValue('numDays', diff);
    }, [fromDate, toDate, setValue]);

    const onSubmit: SubmitHandler<ApplyLeave> = async (data) => {
        // Validate dates are not in the past
        if (data.fromDate < todayISO || data.toDate < todayISO) {
            return;
        }
        if (new Date(data.toDate) < new Date(data.fromDate)) {
            return;
        }
        if (!data.leaveType) {
            return;
        }
        if (!data.reason.trim()) {
            return;
        }

        applyLeave(data, {
            onSuccess: () => {
                reset();
                refetchAll();
                onSuccess?.();
            }
        });
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                {/* Read-only employee details */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <InputText
                        label='Employee Name'
                        id='employee-name-input'
                        readOnly
                        {...register('employeeName')}
                        error={errors.employeeName?.message}
                    />
                    <InputText
                        label='Designation'
                        id='designation-input'
                        readOnly
                        {...register('designation')}
                        error={errors.designation?.message}
                    />
                    <InputText
                        label='DOJ'
                        id='doj-input'
                        type='date'
                        readOnly
                        {...register('doj')}
                        error={errors.doj?.message}
                    />
                </div>

                {/* Leave inputs */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <Controller
                        name='leaveType'
                        control={control}
                        rules={{ required: 'Leave Type is required' }}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='leave-type-select' className='font-medium text-sm'>
                                    Leave Type <span className='text-red-500'>*</span>
                                </label>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id='leave-type-select' className={errors.leaveType ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='Select Leave Type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                        <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                        <SelectItem value='Earned Leave'>Earned Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.leaveType && <FormError>{errors.leaveType.message}</FormError>}
                            </div>
                        )}
                    />
                    <InputText
                        label='From Date'
                        required
                        id='from-date-input'
                        type='date'
                        {...register('fromDate', { required: 'From Date is required' })}
                        error={errors.fromDate?.message}
                        min={todayISO}
                    />
                    <InputText
                        label='To Date'
                        required
                        id='to-date-input'
                        type='date'
                        {...register('toDate', { required: 'To Date is required' })}
                        error={errors.toDate?.message}
                        min={todayISO}
                    />
                    <InputText
                        label='No. of Days'
                        id='num-days-input'
                        readOnly
                        {...register('numDays', { valueAsNumber: true })}
                        error={errors.numDays?.message}
                    />
                    <div className='md:col-span-3'>
                        <InputTextarea
                            label='Reason'
                            required
                            id='reason-textarea'
                            {...register('reason', { required: 'Reason is required', maxLength: 255 })}
                            error={errors.reason?.message}
                            placeholder='Enter reason (max 255 chars)'
                            maxLength={255}
                            rows={3}
                        />
                    </div>
                </div>

                <div className='flex justify-end gap-2'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

