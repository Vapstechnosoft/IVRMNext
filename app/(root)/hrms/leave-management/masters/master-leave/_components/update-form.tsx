'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterLeave, useUpdateMasterLeave } from '@/hooks/hrms/leave-management/useMasters';
import { MASTER_LEAVE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { MasterLeave } from './columns';

interface UpdateMasterLeaveFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: MasterLeave;
}

export default function UpdateMasterLeaveForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterLeaveFormProps) {
    const { refetchAll } = useMasterLeave();
    const { mutate: updateMasterLeave, isPending } = useUpdateMasterLeave();

    const {
        register,
        handleSubmit,
        control,
        watch: _watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterLeave>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                leaveName: row.leaveName || '',
                leaveCode: row.leaveCode || '',
                leaveType: row.leaveType || '',
                leaveApplyCriteria: row.leaveApplyCriteria || '',
                daysForApplyCriteria: row.daysForApplyCriteria || '',
                maxDaysForApply: row.maxDaysForApply || '',
                leaveDetails: row.leaveDetails || '',
                leaveCredit: row.leaveCredit ?? false,
                lateDeduct: row.lateDeduct ?? false,
                probationNotApplicable: row.probationNotApplicable ?? false,
                leaveOrder: row.leaveOrder || 0,
                isActive: row.isActive ?? true
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<MasterLeave> = async (data) => {
        updateMasterLeave(
            {
                ...data,
                id: row.id,
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
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='leaveType' className={errors.leaveType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='Select Leave Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='On_Duty'>On Duty</SelectItem>
                                            <SelectItem value='Comp_Off'>Comp Off</SelectItem>
                                            <SelectItem value='LWP'>LWP</SelectItem>
                                            <SelectItem value='EL'>Emergency Leave</SelectItem>
                                            <SelectItem value='SL'>Sick Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveType && <FormError>{errors.leaveType.message}</FormError>}
                                </div>
                            )}
                        />

                        <Controller
                            name='leaveApplyCriteria'
                            control={control}
                            rules={MASTER_LEAVE_VALIDATION.leaveApplyCriteria}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leaveApplyCriteria' className='mb-2 block font-medium text-sm'>
                                        Leave Apply Criteria <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger
                                            id='leaveApplyCriteria'
                                            className={errors.leaveApplyCriteria ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='Select Apply Criteria' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Before'>Before</SelectItem>
                                            <SelectItem value='After'>After</SelectItem>
                                            <SelectItem value='Same Day'>Same Day</SelectItem>
                                            <SelectItem value='Month'>Month</SelectItem>
                                            <SelectItem value='Quarter'>Quarter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveApplyCriteria && <FormError>{errors.leaveApplyCriteria.message}</FormError>}
                                </div>
                            )}
                        />

                        <InputText
                            label='Days for Apply Criteria'
                            required
                            id='daysForApplyCriteria'
                            type='number'
                            {...register('daysForApplyCriteria', MASTER_LEAVE_VALIDATION.daysForApplyCriteria)}
                            error={errors.daysForApplyCriteria?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Max Days For Apply'
                            required
                            id='maxDaysForApply'
                            type='number'
                            {...register('maxDaysForApply', MASTER_LEAVE_VALIDATION.maxDaysForApply)}
                            error={errors.maxDaysForApply?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
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

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='probationNotApplicable'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='probationNotApplicable' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <label htmlFor='probationNotApplicable' className='font-medium text-sm'>
                                Probation NOT Applicable
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
