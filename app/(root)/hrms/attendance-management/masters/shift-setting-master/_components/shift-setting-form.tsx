'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RefreshCw, Save } from 'lucide-react';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

export type ShiftSettingForm = {
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
};

interface ShiftSettingFormProps {
    editingShiftSetting: ShiftSettingForm | null;
    onSubmit: (data: ShiftSettingForm) => void;
    onCancel: () => void;
}

export function ShiftSettingForm({ editingShiftSetting, onSubmit, onCancel }: ShiftSettingFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ShiftSettingForm>({
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            shiftStartTime: '09:00',
            shiftEndTime: '18:00',
            lunchStartTime: '13:00',
            lunchEndTime: '14:00',
            totalWorkingHours: '08:00',
            halfDayWorkingHours: '04:00',
            lunchHours: '01:00',
            delayPerShift: '00:15',
            earlyPerShift: '00:15',
            shiftName: ''
        }
    });

    // Update form when editingShiftSetting changes
    React.useEffect(() => {
        if (editingShiftSetting) {
            reset(editingShiftSetting);
        } else {
            reset({
                isActive: true,
                shiftStartTime: '09:00',
                shiftEndTime: '18:00',
                lunchStartTime: '13:00',
                lunchEndTime: '14:00',
                totalWorkingHours: '08:00',
                halfDayWorkingHours: '04:00',
                lunchHours: '01:00',
                delayPerShift: '00:15',
                earlyPerShift: '00:15',
                shiftName: ''
            });
        }
    }, [editingShiftSetting, reset]);

    const handleFormSubmit: SubmitHandler<ShiftSettingForm> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='max-w-full space-y-6'>
            {/* Primary Information Section */}
            <div className='space-y-4'>
                {/* First Row */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <InputText
                        label='Shift Name'
                        required
                        id='shiftName'
                        placeholder='Enter Shift Name'
                        {...register('shiftName', { required: 'Shift Name is required' })}
                        error={errors.shiftName?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='shiftStartTime'>
                            Shift Start Time <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='shiftStartTime'
                            type='time'
                            {...register('shiftStartTime', { required: 'Shift Start Time is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.shiftStartTime ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.shiftStartTime && <FormError>{errors.shiftStartTime.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='totalWorkingHours'>
                            Total working hours per shift <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='totalWorkingHours'
                            type='time'
                            {...register('totalWorkingHours', { required: 'Total working hours is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.totalWorkingHours ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.totalWorkingHours && <FormError>{errors.totalWorkingHours.message}</FormError>}
                    </div>
                </div>

                {/* Second Row */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='shiftEndTime'>
                            Shift End Time <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='shiftEndTime'
                            type='time'
                            {...register('shiftEndTime', { required: 'Shift End Time is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.shiftEndTime ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.shiftEndTime && <FormError>{errors.shiftEndTime.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='halfDayWorkingHours'>
                            Half day working hours per shift <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='halfDayWorkingHours'
                            type='time'
                            {...register('halfDayWorkingHours', { required: 'Half day working hours is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.halfDayWorkingHours ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.halfDayWorkingHours && <FormError>{errors.halfDayWorkingHours.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='lunchHours'>
                            Lunch Hours <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='lunchHours'
                            type='time'
                            {...register('lunchHours', { required: 'Lunch Hours is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.lunchHours ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.lunchHours && <FormError>{errors.lunchHours.message}</FormError>}
                    </div>
                </div>

                {/* Third Row */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='lunchStartTime'>
                            Lunch start time <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='lunchStartTime'
                            type='time'
                            {...register('lunchStartTime', { required: 'Lunch start time is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.lunchStartTime ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.lunchStartTime && <FormError>{errors.lunchStartTime.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='delayPerShift'>
                            Delay per shift <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='delayPerShift'
                            type='time'
                            {...register('delayPerShift', { required: 'Delay per shift is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.delayPerShift ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.delayPerShift && <FormError>{errors.delayPerShift.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='earlyPerShift'>
                            Early per shift <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='earlyPerShift'
                            type='time'
                            {...register('earlyPerShift', { required: 'Early per shift is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.earlyPerShift ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.earlyPerShift && <FormError>{errors.earlyPerShift.message}</FormError>}
                    </div>
                </div>

                {/* Fourth Row */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='lunchEndTime'>
                            Lunch End time <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='lunchEndTime'
                            type='time'
                            {...register('lunchEndTime', { required: 'Lunch End time is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.lunchEndTime ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.lunchEndTime && <FormError>{errors.lunchEndTime.message}</FormError>}
                    </div>

                    <div className='flex items-center space-y-2 pt-6'>
                        <input
                            type='checkbox'
                            id='isActive'
                            {...register('isActive')}
                            className='mr-2 border-border text-primary focus:ring-primary'
                        />
                        <label htmlFor='isActive' className='font-medium text-foreground text-sm'>
                            Active
                        </label>
                    </div>
                </div>

                {/* Root Error */}
                {errors.root && <FormError>{errors.root.message}</FormError>}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting} className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                    {isSubmitting ? (
                        <div className='flex items-center'>
                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </div>
                    ) : (
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {editingShiftSetting ? 'Update Shift Setting' : 'Save Shift Setting'}
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
