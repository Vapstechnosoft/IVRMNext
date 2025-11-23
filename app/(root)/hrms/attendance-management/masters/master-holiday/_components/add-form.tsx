'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterHoliday, useSaveMasterHoliday } from '@/hooks/hrms/attendance-management/useMasters';
import { cn } from '@/lib/utils';
import { holidayMasterSchema } from '@/schemas/hrms/attendance-management-schemas';
import type { MasterHolidayGetDataResponseData } from '@/types/hrms/attendance-management/master-holiday';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import React, { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type MasterHolidayForm = z.infer<typeof holidayMasterSchema.addOrUpdate> & {
    selectDay: boolean;
    department: string;
    isActive: boolean;
};

interface AddMasterHolidayFormProps {
    onSuccess?: () => void;
    className?: string;
    dropdownData?: MasterHolidayGetDataResponseData;
}

export default function AddMasterHolidayForm({ onSuccess, className = '', dropdownData }: AddMasterHolidayFormProps) {
    const { refetchAll } = useMasterHoliday();
    const { mutate: saveMasterHoliday, isPending } = useSaveMasterHoliday();

    // Debug: Log dropdown data structure
    React.useEffect(() => {}, [dropdownData]);

    // Extract dropdown data from API response
    // API field names are uppercase: HRMLY_LeaveYear, HRMD_DepartmentName, FOHTWD_HolidayWDType, FOMD_DayCode, FOMD_DayName
    const calendarYears = useMemo(() => {
        if (!dropdownData?.yeardropdown) {
            console.warn('⚠️ [ADD FORM] No yeardropdown in dropdownData');
            return [];
        }
        const years = dropdownData.yeardropdown.map((year: any) => year.HRMLY_LeaveYear || year.hrmlY_LeaveYear || '').filter(Boolean);
        return years;
    }, [dropdownData?.yeardropdown]);

    const departments = useMemo(() => {
        if (!dropdownData?.departmentType) {
            console.warn('⚠️ [ADD FORM] No departmentType in dropdownData');
            return [];
        }
        const depts = dropdownData.departmentType
            .map((dept: any) => dept.HRMD_DepartmentName || dept.hrmD_DepartmentName || '')
            .filter(Boolean);
        return depts;
    }, [dropdownData?.departmentType]);

    const holidayTypes = useMemo(() => {
        if (!dropdownData?.holidayType) {
            console.warn('⚠️ [ADD FORM] No holidayType in dropdownData');
            return [];
        }
        const types = dropdownData.holidayType
            .map((type: any) => type.FOHTWD_HolidayWDType || type.fohtwD_HolidayWDType || '')
            .filter(Boolean);
        return types;
    }, [dropdownData?.holidayType]);

    const weekDays = useMemo(() => {
        if (!dropdownData?.dayslist) {
            console.warn('⚠️ [ADD FORM] No dayslist in dropdownData');
            return [];
        }
        const days = dropdownData.dayslist
            .map((day: any) => ({
                value: day.FOMD_DayCode || day.fomD_DayCode || '',
                label: day.FOMD_DayName || day.fomD_DayName || ''
            }))
            .filter((day: { value: string; label: string }) => day.value && day.label);
        return days;
    }, [dropdownData?.dayslist]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterHolidayForm>({
        resolver: zodResolver(holidayMasterSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            selectedDays: [],
            selectDay: false,
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0],
            calendarYear: '',
            holidayType: '',
            name: '',
            department: '',
            remarks: ''
        }
    });

    const calendarYear = watch('calendarYear');
    const department = watch('department');
    const holidayType = watch('holidayType');
    const selectDay = watch('selectDay');
    const selectedDays = watch('selectedDays');
    const fromDate = watch('fromDate');

    const handleDayToggle = (day: string) => {
        const currentDays = selectedDays || [];
        const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day];
        setValue('selectedDays', newDays);
    };

    const onSubmit: SubmitHandler<MasterHolidayForm> = async (data) => {
        try {
            // Date validation - only for PUBLIC HOLIDAY and WEEK END
            // WEEK DAY doesn't require dates, so skip validation for it
            const requiresDates = data.holidayType === 'PUBLIC HOLIDAY' || data.holidayType === 'WEEK END';
            const isWeekDay = data.holidayType === 'WEEK DAY';

            // For WEEK DAY, validate that at least one day is selected and department is provided
            if (isWeekDay) {
                if (!data.selectedDays || data.selectedDays.length === 0) {
                    console.error('❌ [CLIENT] Validation failed: No days selected for WEEK DAY');
                    toast.error('At least one day must be selected for WEEK DAY holiday type');
                    return;
                }

                if (!data.department || data.department.trim() === '') {
                    console.error('❌ [CLIENT] Validation failed: Department required for WEEK DAY');
                    toast.error('Department is required for WEEK DAY holiday type');
                    return;
                }
            }

            if (requiresDates && data.fromDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                today.setMinutes(0, 0, 0);

                // Parse date string with explicit time to avoid timezone issues
                const fromDateStr = data.fromDate.includes('T') ? data.fromDate : `${data.fromDate}T00:00:00`;
                const toDateStr = data.toDate?.includes('T') ? data.toDate : data.toDate ? `${data.toDate}T00:00:00` : null;

                const fromDateObj = new Date(fromDateStr);
                fromDateObj.setHours(0, 0, 0, 0);
                const toDateObj = toDateStr ? new Date(toDateStr) : null;
                if (toDateObj) {
                    toDateObj.setHours(0, 0, 0, 0);
                }
                const selectedYear = Number.parseInt(data.calendarYear);

                if (fromDateObj < today) {
                    console.error('❌ [CLIENT] Validation failed: Start date is in the past', {
                        fromDate: fromDateObj.toISOString(),
                        fromDateLocal: fromDateObj.toString(),
                        today: today.toISOString(),
                        todayLocal: today.toString(),
                        comparison: fromDateObj.getTime() < today.getTime(),
                        timeDifference: fromDateObj.getTime() - today.getTime()
                    });
                    toast.error('Start date cannot be in the past');
                    return;
                }

                if (toDateObj && toDateObj < fromDateObj) {
                    console.error('❌ [CLIENT] Validation failed: End date is before start date');
                    toast.error('End date must be after start date');
                    return;
                }

                if (fromDateObj.getFullYear() !== selectedYear || (toDateObj && toDateObj.getFullYear() !== selectedYear)) {
                    console.error('❌ [CLIENT] Validation failed: Dates not in selected year', {
                        fromDateYear: fromDateObj.getFullYear(),
                        toDateYear: toDateObj?.getFullYear(),
                        selectedYear
                    });
                    toast.error('Dates must be within the selected calendar year');
                    return;
                }
            } else if (requiresDates && !data.fromDate) {
                console.error('❌ [CLIENT] Validation failed: Date required for this holiday type');
                toast.error('Start date is required for this holiday type');
                return;
            }

            // Check if dropdown data is available
            if (!dropdownData) {
                console.error('❌ [CLIENT] Dropdown data not available');
                toast.error('Dropdown data not loaded. Please wait and try again.');
                return;
            }

            const submitData = {
                calendarYear: data.calendarYear,
                department: data.department,
                holidayType: data.holidayType,
                name: data.name || '',
                // Send selectedDays if they exist, regardless of selectDay checkbox state
                selectedDays: data.selectedDays && data.selectedDays.length > 0 ? data.selectedDays : [],
                fromDate: requiresDates ? data.fromDate || '' : '', // Only include dates if required
                toDate: requiresDates ? data.toDate || '' : '', // Only include dates if required
                isActive: data.isActive
            };

            saveMasterHoliday(
                {
                    data: submitData,
                    dropdownData: dropdownData
                },
                {
                    onSuccess: (response) => {
                        // Check if mutation hook already handled success/error
                        const isSuccess = response?.success === true;

                        if (isSuccess) {
                            reset();
                            refetchAll();
                            onSuccess?.();
                        } else {
                        }
                    },
                    onError: (error) => {
                        console.error('🔴 ========== FORM onError CALLBACK ==========');
                        console.error('❌ [CLIENT] Form onError callback called');
                        console.error('💥 [CLIENT] Error in form callback:', {
                            message: error?.message,
                            error: error,
                            errorType: typeof error,
                            errorKeys: error ? Object.keys(error) : []
                        });
                        console.error('💥 [CLIENT] Full error in form:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                        // Don't show toast here as mutation hook should handle it
                        console.error('🔴 ========== END FORM onError CALLBACK ==========');
                    }
                }
            );
        } catch (error: any) {
            console.error('Form submission error:', error);
            toast.error(error.message || 'An error occurred while submitting the form');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form
                onSubmit={handleSubmit(onSubmit, (errors) => {
                    console.error('Form validation errors:', errors);
                    const firstError = Object.values(errors)[0];
                    if (firstError?.message) {
                        toast.error(firstError.message);
                    } else {
                        toast.error('Please fix the form errors');
                    }
                })}
                className='max-w-full space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm' htmlFor='calendarYear'>
                                Calendar Year <span className='text-red-500'>*</span>
                            </label>
                            <Select value={calendarYear || ''} onValueChange={(value) => setValue('calendarYear', value)}>
                                <SelectTrigger id='calendarYear' className={errors.calendarYear ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={calendarYears.length === 0 ? 'Loading...' : '--Select--'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {calendarYears.length === 0 ? (
                                        <SelectItem value='' disabled>
                                            No years available
                                        </SelectItem>
                                    ) : (
                                        calendarYears.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))
                                    )}
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
                                    <SelectValue placeholder={departments.length === 0 ? 'Loading...' : '--Select--'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.length === 0 ? (
                                        <SelectItem value='' disabled>
                                            No departments available
                                        </SelectItem>
                                    ) : (
                                        departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))
                                    )}
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
                                    <SelectValue placeholder={holidayTypes.length === 0 ? 'Loading...' : '--Select--'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {holidayTypes.length === 0 ? (
                                        <SelectItem value='' disabled>
                                            No holiday types available
                                        </SelectItem>
                                    ) : (
                                        holidayTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))
                                    )}
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

                    <div className='flex items-center space-y-2'>
                        <Checkbox id='selectDay' checked={selectDay} onCheckedChange={(checked) => setValue('selectDay', !!checked)} />
                        <label htmlFor='selectDay' className='ml-2 font-medium text-foreground text-sm'>
                            Select Day
                        </label>
                    </div>

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

                    {(holidayType === 'PUBLIC HOLIDAY' || holidayType === 'WEEK END') && (
                        <>
                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                <div className='space-y-2'>
                                    <label className='font-medium text-sm' htmlFor='fromDate'>
                                        Start Date <span className='text-red-500'>*</span>
                                    </label>
                                    <Controller
                                        name='fromDate'
                                        control={control}
                                        render={({ field }) => {
                                            const selectedDate = field.value ? new Date(field.value) : undefined;
                                            const minDate = new Date();
                                            minDate.setHours(0, 0, 0, 0);

                                            return (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !selectedDate && 'text-muted-foreground',
                                                                errors.fromDate && 'border-red-500'
                                                            )}
                                                            type='button'>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Enter date'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <DatePickerWithYear
                                                            mode='single'
                                                            selected={selectedDate}
                                                            onDayClick={(day) => {
                                                                if (day) {
                                                                    const dateStr = format(day, 'yyyy-MM-dd');
                                                                    field.onChange(dateStr);
                                                                }
                                                            }}
                                                            fromDate={minDate}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            );
                                        }}
                                    />
                                    {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                </div>

                                <div className='space-y-2'>
                                    <label className='font-medium text-sm' htmlFor='toDate'>
                                        End Date <span className='text-red-500'>*</span>
                                    </label>
                                    <Controller
                                        name='toDate'
                                        control={control}
                                        render={({ field }) => {
                                            const selectedDate = field.value ? new Date(field.value) : undefined;
                                            const minDate = fromDate ? new Date(fromDate) : new Date();
                                            minDate.setHours(0, 0, 0, 0);

                                            return (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !selectedDate && 'text-muted-foreground',
                                                                errors.toDate && 'border-red-500'
                                                            )}
                                                            type='button'>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Enter date'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <DatePickerWithYear
                                                            mode='single'
                                                            selected={selectedDate}
                                                            onDayClick={(day) => {
                                                                if (day) {
                                                                    const dateStr = format(day, 'yyyy-MM-dd');
                                                                    field.onChange(dateStr);
                                                                }
                                                            }}
                                                            fromDate={minDate}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            );
                                        }}
                                    />
                                    {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-4'>
                                <InputText
                                    label='Holiday Name'
                                    required
                                    id='name'
                                    {...register('name')}
                                    error={errors.name?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    maxLength={100}
                                />
                            </div>

                            <div className='space-y-2'>
                                <label className='font-medium text-sm' htmlFor='remarks'>
                                    Remarks
                                </label>
                                <textarea
                                    id='remarks'
                                    {...register('remarks')}
                                    rows={3}
                                    maxLength={250}
                                    className={`w-full rounded-md border px-3 py-2 ${errors.remarks ? 'border-red-500' : 'border-input'}`}
                                    placeholder='Enter remarks...'
                                />
                                {errors.remarks && <FormError>{errors.remarks.message}</FormError>}
                            </div>
                        </>
                    )}

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
                            Save Master Holiday
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
