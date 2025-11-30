'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useSaveShiftSettingMaster, useShiftSettingMaster } from '@/hooks/hrms/attendance-management/useMasters';
import { shiftSettingMasterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { ShiftSetting } from './columns';
type FormFields = z.infer<typeof shiftSettingMasterSchema.addOrUpdate>;
interface UpdateShiftSettingMasterFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: ShiftSetting;
}
export default function UpdateShiftSettingMasterForm({ onSuccess, className = '', selectedRow: row }: UpdateShiftSettingMasterFormProps) {
    const { refetchAll } = useShiftSettingMaster();
    const { mutate: saveShiftSetting, isPending } = useSaveShiftSettingMaster();
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(shiftSettingMasterSchema.addOrUpdate),
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                shiftName: row.shiftName || '',
                shiftStartTime: row.shiftStartTime || '09:00',
                shiftEndTime: row.shiftEndTime || '18:00',
                lunchStartTime: row.lunchStartTime || '',
                lunchEndTime: row.lunchEndTime || '',
                totalWorkingHours: row.totalWorkingHours || '08:00',
                halfDayWorkingHours: row.halfDayWorkingHours || '04:00',
                lunchHours: row.lunchHours || '',
                delayPerShift: row.delayPerShift || '',
                earlyPerShift: row.earlyPerShift || '',
                isActive: row.isActive ?? true
            });
        }
    }, [row, reset]);
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        saveShiftSetting(
            {
                id: row.id,
                shiftName: data.shiftName,
                shiftStartTime: data.shiftStartTime,
                shiftEndTime: data.shiftEndTime,
                lunchStartTime: data.lunchStartTime || '',
                lunchEndTime: data.lunchEndTime || '',
                totalWorkingHours: data.totalWorkingHours,
                halfDayWorkingHours: data.halfDayWorkingHours,
                lunchHours: data.lunchHours || '',
                delayPerShift: data.delayPerShift || '',
                earlyPerShift: data.earlyPerShift || '',
                isActive: data.isActive ?? true
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
            <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4'>
                        <InputText
                            label='Shift Name'
                            required
                            id='shiftName'
                            placeholder='Enter Shift Name'
                            {...register('shiftName')}
                            error={errors.shiftName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='shiftStartTime'>
                                Shift Start Time <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='shiftStartTime'
                                type='time'
                                {...register('shiftStartTime')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.shiftStartTime ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.shiftStartTime && <FormError>{errors.shiftStartTime.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='shiftEndTime'>
                                Shift End Time <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='shiftEndTime'
                                type='time'
                                {...register('shiftEndTime')}
                                min={watch('shiftStartTime') || undefined}
                                className={`w-full rounded-md border px-3 py-2 ${errors.shiftEndTime ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.shiftEndTime && <FormError>{errors.shiftEndTime.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='totalWorkingHours'>
                                Total working hours per shift <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='totalWorkingHours'
                                type='time'
                                {...register('totalWorkingHours')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.totalWorkingHours ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.totalWorkingHours && <FormError>{errors.totalWorkingHours.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='lunchStartTime'>
                                Lunch start time
                            </label>
                            <input
                                id='lunchStartTime'
                                type='time'
                                {...register('lunchStartTime')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.lunchStartTime ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.lunchStartTime && <FormError>{errors.lunchStartTime.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='lunchEndTime'>
                                Lunch End time
                            </label>
                            <input
                                id='lunchEndTime'
                                type='time'
                                {...register('lunchEndTime')}
                                min={watch('lunchStartTime') || undefined}
                                className={`w-full rounded-md border px-3 py-2 ${errors.lunchEndTime ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.lunchEndTime && <FormError>{errors.lunchEndTime.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='lunchHours'>
                                Lunch Hours
                            </label>
                            <input
                                id='lunchHours'
                                type='time'
                                {...register('lunchHours')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.lunchHours ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.lunchHours && <FormError>{errors.lunchHours.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='earlyPerShift'>
                                Early per shift
                            </label>
                            <input
                                id='earlyPerShift'
                                type='time'
                                {...register('earlyPerShift')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.earlyPerShift ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.earlyPerShift && <FormError>{errors.earlyPerShift.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='delayPerShift'>
                                Delay per shift
                            </label>
                            <input
                                id='delayPerShift'
                                type='time'
                                {...register('delayPerShift')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.delayPerShift ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.delayPerShift && <FormError>{errors.delayPerShift.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='halfDayWorkingHours'>
                                Half day working hours per shift <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='halfDayWorkingHours'
                                type='time'
                                {...register('halfDayWorkingHours')}
                                className={`w-full rounded-md border px-3 py-2 ${errors.halfDayWorkingHours ? 'border-red-500' : 'border-input'}`}
                            />
                            {errors.halfDayWorkingHours && <FormError>{errors.halfDayWorkingHours.message}</FormError>}
                        </div>
                    </div>
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Shift Setting
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
