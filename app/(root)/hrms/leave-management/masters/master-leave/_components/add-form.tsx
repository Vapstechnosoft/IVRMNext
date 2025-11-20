'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterLeave, useMasterLeaveDropdowns, useSaveMasterLeave } from '@/hooks/hrms/leave-management/useMasters';
import { MASTER_LEAVE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Save, X } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { MasterLeave } from './columns';

interface AddMasterLeaveFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

export default function AddMasterLeaveForm({ onSuccess, onCancel, className = '' }: AddMasterLeaveFormProps) {
    const { refetchAll } = useMasterLeave();
    const { mutate: saveMasterLeave, isPending } = useSaveMasterLeave();
    const { data: dropdownData, isLoading: isLoadingDropdowns } = useMasterLeaveDropdowns();

    // Extract leave type options from API
    const leaveTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.leaveTypes || !Array.isArray(dropdownData.data.leaveTypes)) {
            return [];
        }
        return dropdownData.data.leaveTypes;
    }, [dropdownData]);

    const {
        register,
        handleSubmit,
        control,
        watch: _watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterLeave>({
        mode: 'onChange',
        defaultValues: {
            leaveName: '',
            leaveCode: '',
            leaveType: '',
            leaveDetails: '',
            leaveCredit: false,
            lateDeduct: false,
            leaveOrder: 0,
            isActive: true
        }
    });

    const onSubmit: SubmitHandler<MasterLeave> = async (data) => {
        saveMasterLeave(
            {
                ...data,
                leaveOrder: data.leaveOrder || 0
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
                            label='Leave Name'
                            required
                            id='leaveName'
                            {...register('leaveName', MASTER_LEAVE_VALIDATION.leaveName)}
                            error={errors.leaveName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Leave Code'
                            required
                            id='leaveCode'
                            {...register('leaveCode', MASTER_LEAVE_VALIDATION.leaveCode)}
                            error={errors.leaveCode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <Controller
                            name='leaveType'
                            control={control}
                            rules={MASTER_LEAVE_VALIDATION.leaveType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leaveType' className='mb-2 block font-medium text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                        disabled={isLoadingDropdowns}
                                    >
                                        <SelectTrigger id='leaveType' className={errors.leaveType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : 'Select Leave Type'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypeOptions.length > 0 ? (
                                                leaveTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveType && <FormError>{errors.leaveType.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-1'>
                        <InputTextarea
                            label='Leave Details'
                            required
                            id='leaveDetails'
                            {...register('leaveDetails', MASTER_LEAVE_VALIDATION.leaveDetails)}
                            error={errors.leaveDetails?.message}
                            rows={3}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='leaveCredit'
                                control={control}
                                render={({ field }) => <Checkbox id='leaveCredit' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <label htmlFor='leaveCredit' className='font-medium text-sm'>
                                Leave Credit
                            </label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='lateDeduct'
                                control={control}
                                render={({ field }) => <Checkbox id='lateDeduct' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <label htmlFor='lateDeduct' className='font-medium text-sm'>
                                Late Deduct
                            </label>
                        </div>

                        <InputText
                            label='Leave Order'
                            id='leaveOrder'
                            type='number'
                            {...register('leaveOrder', { valueAsNumber: true })}
                            error={errors.leaveOrder?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                <div className='flex justify-end gap-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
