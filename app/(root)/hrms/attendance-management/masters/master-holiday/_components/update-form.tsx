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
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { MasterHoliday } from './columns';
type MasterHolidayForm = z.infer<typeof holidayMasterSchema.addOrUpdate> & {
    selectDay: boolean;
    department: string;
    isActive: boolean;
};
interface UpdateMasterHolidayFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: MasterHoliday;
    dropdownData?: MasterHolidayGetDataResponseData;
}
export default function UpdateMasterHolidayForm({
    onSuccess,
    className = '',
    selectedRow: row,
    dropdownData
}: UpdateMasterHolidayFormProps) {
    const { refetchAll } = useMasterHoliday();
    const { mutate: saveMasterHoliday, isPending } = useSaveMasterHoliday();
    // Extract dropdown data from API response
    // API field names are uppercase: HRMLY_LeaveYear, HRMD_DepartmentName, FOHTWD_HolidayWDType, FOMD_DayCode, FOMD_DayName
    const calendarYears = useMemo(() => {
        if (!dropdownData?.yeardropdown) return [];
        return dropdownData.yeardropdown.map((year: any) => year.HRMLY_LeaveYear || year.hrmlY_LeaveYear || '').filter(Boolean);
    }, [dropdownData?.yeardropdown]);
    const departments = useMemo(() => {
        if (!dropdownData?.departmentType) return [];
        return dropdownData.departmentType.map((dept: any) => dept.HRMD_DepartmentName || dept.hrmD_DepartmentName || '').filter(Boolean);
    }, [dropdownData?.departmentType]);
    const holidayTypes = useMemo(() => {
        if (!dropdownData?.holidayType) return [];
        return dropdownData.holidayType.map((type: any) => type.FOHTWD_HolidayWDType || type.fohtwD_HolidayWDType || '').filter(Boolean);
    }, [dropdownData?.holidayType]);
    const weekDays = useMemo(() => {
        if (!dropdownData?.dayslist) return [];
        return dropdownData.dayslist
            .map((day: any) => ({
                value: day.FOMD_DayCode || day.fomD_DayCode || '',
                label: day.FOMD_DayName || day.fomD_DayName || ''
            }))
            .filter((day: { value: string; label: string }) => day.value && day.label);
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
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                calendarYear: row.calendarYear || '',
                department: row.department || '',
                holidayType: row.holidayType || '',
                name: row.name || '',
                selectedDays: row.selectedDays || [],
                selectDay: (row.selectedDays || []).length > 0,
                fromDate: row.fromDate || new Date().toISOString().split('T')[0],
                toDate: row.toDate || new Date().toISOString().split('T')[0],
                isActive: row.isActive ?? true,
                remarks: ''
            });
        }
    }, [row, reset]);
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
        saveMasterHoliday(
            {
                data: {
                    id: row.id,
                    calendarYear: data.calendarYear,
                    department: data.department,
                    holidayType: data.holidayType,
                    name: data.name || '',
                    selectedDays: data.selectDay ? data.selectedDays || [] : [],
                    fromDate: data.fromDate || '',
                    toDate: data.toDate || '',
                    isActive: data.isActive
                },
                dropdownData: dropdownData
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
