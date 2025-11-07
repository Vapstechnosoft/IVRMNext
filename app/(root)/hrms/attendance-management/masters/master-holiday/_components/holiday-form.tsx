'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Save } from 'lucide-react';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

export type MasterHolidayForm = {
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectDay: boolean;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
};

const departments = ['All', 'Teaching', 'Non Teaching', 'Administrative', 'JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF'];
const holidayTypes = ['WEEK DAY', 'WEEK END', 'NATIONAL HOLIDAY', 'FESTIVAL', 'OPTIONAL HOLIDAY'];
const weekDays = [
    { value: 'SUN', label: 'SUN' },
    { value: 'MON', label: 'MON' },
    { value: 'TUE', label: 'TUE' },
    { value: 'WED', label: 'WED' },
    { value: 'THU', label: 'THU' },
    { value: 'FRI', label: 'FRI' },
    { value: 'SAT', label: 'SAT' }
];

interface HolidayFormProps {
    editingHoliday: MasterHolidayForm | null;
    calendarYears: string[];
    onSubmit: (data: MasterHolidayForm) => void;
    onCancel: () => void;
}

export function HolidayForm({ editingHoliday, calendarYears, onSubmit, onCancel }: HolidayFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterHolidayForm>({
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            selectedDays: [],
            selectDay: false,
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0]
        }
    });

    const calendarYear = watch('calendarYear');
    const department = watch('department');
    const holidayType = watch('holidayType');
    const selectDay = watch('selectDay');
    const selectedDays = watch('selectedDays');
    const fromDate = watch('fromDate');

    // Update form when editingHoliday changes
    React.useEffect(() => {
        if (editingHoliday) {
            reset(editingHoliday);
        } else {
            reset({
                isActive: true,
                selectedDays: [],
                selectDay: false,
                fromDate: new Date().toISOString().split('T')[0],
                toDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [editingHoliday, reset]);

    const handleDayToggle = (day: string) => {
        const currentDays = selectedDays || [];
        const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day];
        setValue('selectedDays', newDays);
    };

    const handleFormSubmit: SubmitHandler<MasterHolidayForm> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='max-w-full space-y-6'>
            {/* Primary Information Section */}
            <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='calendarYear'>
                            Calendar Year <span className='text-red-500'>*</span>
                        </label>
                        <Select value={calendarYear || ''} onValueChange={(value) => setValue('calendarYear', value)}>
                            <SelectTrigger id='calendarYear' className={errors.calendarYear ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {calendarYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!calendarYear && (
                            <input
                                type='hidden'
                                {...register('calendarYear', {
                                    required: 'Calendar Year is required'
                                })}
                            />
                        )}
                        {errors.calendarYear && <FormError>{errors.calendarYear.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='department'>
                            Department <span className='text-red-500'>*</span>
                        </label>
                        <Select value={department || ''} onValueChange={(value) => setValue('department', value)}>
                            <SelectTrigger id='department' className={errors.department ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!department && (
                            <input
                                type='hidden'
                                {...register('department', {
                                    required: 'Department is required'
                                })}
                            />
                        )}
                        {errors.department && <FormError>{errors.department.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='holidayType'>
                            Holiday Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={holidayType || ''} onValueChange={(value) => setValue('holidayType', value)}>
                            <SelectTrigger id='holidayType' className={errors.holidayType ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {holidayTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!holidayType && (
                            <input
                                type='hidden'
                                {...register('holidayType', {
                                    required: 'Holiday Type is required'
                                })}
                            />
                        )}
                        {errors.holidayType && <FormError>{errors.holidayType.message}</FormError>}
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <InputText
                        label='Holiday Name'
                        required
                        id='name'
                        {...register('name', {
                            required: 'Holiday Name is required'
                        })}
                        error={errors.name?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />

                    <div className='flex items-center space-y-2 pt-6'>
                        <Checkbox
                            id='selectDay'
                            checked={selectDay}
                            onCheckedChange={(checked) => setValue('selectDay', !!checked)}
                        />
                        <label htmlFor='selectDay' className='ml-2 font-medium text-foreground text-sm'>
                            Select Day
                        </label>
                    </div>
                </div>

                {/* Day Selection */}
                {selectDay && (
                    <div className='space-y-2'>
                        <span className='font-medium text-sm'>Select Days:</span>
                        <div className='max-h-32 overflow-y-auto rounded-md border bg-background p-3'>
                            <div className='grid grid-cols-4 gap-2'>
                                {weekDays.map((day) => (
                                    <div key={day.value} className='flex cursor-pointer items-center gap-2 text-sm'>
                                        <Checkbox
                                            checked={selectedDays?.includes(day.value) || false}
                                            onCheckedChange={() => handleDayToggle(day.value)}
                                        />
                                        <span>{day.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='fromDate'>
                            From Date <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='fromDate'
                            type='date'
                            {...register('fromDate', {
                                required: 'From Date is required'
                            })}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full rounded-md border px-3 py-2 ${errors.fromDate ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='toDate'>
                            To Date <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='toDate'
                            type='date'
                            {...register('toDate', {
                                required: 'To Date is required'
                            })}
                            min={fromDate || new Date().toISOString().split('T')[0]}
                            className={`w-full rounded-md border px-3 py-2 ${errors.toDate ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
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
                            {editingHoliday ? 'Update Master Holiday' : 'Save Master Holiday'}
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
