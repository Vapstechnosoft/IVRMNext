'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { YearlyRebateSettingsSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterYearlyRebateSettings } from '@/server/fees/masters/yearly_rebate_settings';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar, Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof YearlyRebateSettingsSchema.addOrUpdate>;

export default function AddMasterYearlyRebateSetting({ onSuccess }: { onSuccess?: () => void } = {}) {
    const { data: academicYearOptions } = useAcademicYearDropdown();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        mode: 'onChange',
        resolver: zodResolver(YearlyRebateSettingsSchema.addOrUpdate),
        defaultValues: {
            academicYear: '',
            rebateApplicable: true,
            rebateType: undefined,
            rebateValue: 0,
            rebateDate: '',
            feeGroupIds: undefined
        }
    });

    const rebateType = watch('rebateType');

    const onSubmit = async (data: FormFields) => {
        try {
            const selectedAcademicYear = academicYearOptions?.data?.find((year) => year.asmaY_Id.toString() === data.academicYear);

            if (!selectedAcademicYear) {
                toast.error('Please select a valid Academic Year');
                return;
            }

            const asmaY_Id = Number(selectedAcademicYear.asmaY_Id);
            if (Number.isNaN(asmaY_Id)) {
                toast.error('Invalid Academic Year value');
                return;
            }

            const payload = {
                mI_Id: 30,
                fyG_Id: 0,
                user_id: 21602,
                asmaY_Id,
                fyG_RebateTypeFlg: data.rebateType ? data.rebateType : '',
                fyG_RebateApplicableFlg: true,
                fyG_PartialRebateAmtOrPercentageValue: data.rebateValue ? Number(data.rebateValue) : 0,
                fyG_RebateDate: data.rebateDate || undefined
            } as any;

            const response = await addOrUpdateMasterYearlyRebateSettings(payload);

            if (response?.success) {
                toast.success(response.message || 'Rebate settings saved successfully!');
                reset();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save rebate settings');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong while saving.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Academic Year & Rebate Type */}
            <div className='grid grid-cols-1 gap-6 border-b pb-4 sm:grid-cols-2'>
                <Controller
                    name='academicYear'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col'>
                            <label htmlFor='academicYear' className='mb-1 font-medium text-gray-700 text-sm'>
                                Academic Year <span className='text-red-500'>*</span>
                            </label>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id='academicYear' className={cn(errors.academicYear ? 'border-red-500' : '')}>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearOptions?.data?.length ? (
                                        academicYearOptions.data.map((year) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className='px-2 py-1 text-gray-500 text-sm'>No academic years available</div>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    name='rebateType'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col'>
                            <label htmlFor='rebateType' className='mb-1 font-medium text-gray-700 text-sm'>
                                Rebate Type <span className='text-red-500'>*</span>
                            </label>
                            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                <SelectTrigger id='rebateType' className={cn(errors.rebateType ? 'border-red-500' : '')}>
                                    <SelectValue placeholder='Select Type' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Percentage'>Percentage</SelectItem>
                                    <SelectItem value='Amount'>Amount</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.rebateType && <FormError>{errors.rebateType.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            {/* Rebate Value & Rebate Date */}
            <div className='grid grid-cols-1 gap-6 border-b pb-4 sm:grid-cols-2'>
                <Controller
                    name='rebateValue'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col'>
                            <label htmlFor='rebateValue' className='mb-1 font-medium text-gray-700 text-sm'>
                                {rebateType === 'Percentage' ? 'Percentage (%)' : 'Amount'} <span className='text-red-500'>*</span>
                            </label>
                            <Input
                                id='rebateValue'
                                type='text'
                                {...field}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        field.onChange(value);
                                    }
                                }}
                                placeholder={rebateType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
                                disabled={!rebateType}
                                className={cn(
                                    errors.rebateValue ? 'border-red-500' : '',
                                    !rebateType ? 'cursor-not-allowed opacity-50' : ''
                                )}
                            />
                            {errors.rebateValue && <FormError>{errors.rebateValue.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    name='rebateDate'
                    control={control}
                    render={({ field }) => {
                        const selectedDate = field.value ? new Date(field.value) : undefined;
                        return (
                            <div className='flex flex-col'>
                                <label htmlFor='rebateDate' className='mb-1 font-medium text-gray-700 text-sm'>
                                    Rebate Date <span className='text-red-500'>*</span>
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            className={cn(
                                                'justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground',
                                                errors.rebateDate ? 'border-red-500' : ''
                                            )}>
                                            <Calendar className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <CalendarPicker
                                            mode='single'
                                            selected={selectedDate}
                                            onSelect={(d) => field.onChange(d ? format(d as Date, 'yyyy-MM-dd') : '')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.rebateDate && <FormError>{errors.rebateDate.message}</FormError>}
                            </div>
                        );
                    }}
                />
            </div>

            {/* Buttons */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => reset()}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
