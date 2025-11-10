'use client';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createLocalCrud } from '@/lib/localdb';
import { employeeShiftMappingSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Save, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
    dayTypeOptions,
    departmentOptions,
    designationOptions,
    employeeOptions,
    typeOptions
} from './columns';
import { TimePicker12Hour } from '../../master-shift/_components/time-picker-12hour';
import type { MasterShift } from '../../master-shift/_components/columns';

export type EmployeeShiftMappingForm = z.infer<typeof employeeShiftMappingSchema.addOrUpdate>;

interface ShiftMappingFormProps {
    editingMapping: EmployeeShiftMappingForm | null;
    onSubmit: (data: EmployeeShiftMappingForm) => void;
    onCancel: () => void;
}

// Helper function to calculate time difference in HH:mm format
function calculateTimeDifference(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '00:00';
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    let diffMinutes = endTotalMinutes - startTotalMinutes;
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Handle next day
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function ShiftMappingForm({ editingMapping, onSubmit, onCancel }: ShiftMappingFormProps) {
    const shiftStore = createLocalCrud<MasterShift>('attendance:master-shift');
    const [availableShifts, setAvailableShifts] = React.useState<MasterShift[]>([]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeShiftMappingForm>({
        resolver: zodResolver(employeeShiftMappingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: editingMapping
            ? {
                  type: editingMapping.type || [],
                  department: editingMapping.department || [],
                  designation: editingMapping.designation || [],
                  dayType: Array.isArray(editingMapping.dayType) ? editingMapping.dayType : editingMapping.dayType ? [editingMapping.dayType] : [],
                  shiftName: editingMapping.shiftName || '',
                  applicableDate: editingMapping.applicableDate || '',
                  employees: editingMapping.employees || [],
                  shiftStartTime: editingMapping.shiftStartTime || '',
                  lunchStartTime: editingMapping.lunchStartTime || '',
                  shiftEndTime: editingMapping.shiftEndTime || '',
                  lunchEndTime: editingMapping.lunchEndTime || '',
                  totalWorkingHours: editingMapping.totalWorkingHours || '',
                  delayPerShift: editingMapping.delayPerShift || '',
                  halfDayWorkingHours: editingMapping.halfDayWorkingHours || '',
                  earlyPerShift: editingMapping.earlyPerShift || '',
                  lunchHours: editingMapping.lunchHours || ''
              }
            : {
                  type: [],
                  department: [],
                  designation: [],
                  dayType: [],
                  shiftName: '',
                  applicableDate: '',
                  employees: [],
                  shiftStartTime: '',
                  lunchStartTime: '',
                  shiftEndTime: '',
                  lunchEndTime: '',
                  totalWorkingHours: '',
                  delayPerShift: '',
                  halfDayWorkingHours: '',
                  earlyPerShift: '',
                  lunchHours: ''
              }
    });

    // Load shifts on mount and auto-select first shift for testing
    useEffect(() => {
        const loadShifts = () => {
            try {
                let shifts = shiftStore.list();
                
                // Create sample shifts if database is empty
                if (shifts.length === 0) {
                    const sampleShifts: Omit<MasterShift, 'id' | 'createdAt'>[] = [
                        {
                            shiftName: 'Office Staffs',
                            startTime: '08:00',
                            endTime: '16:00',
                            remarks: 'Standard office hours',
                            specificDay: false
                        },
                        {
                            shiftName: 'Teaching Staff',
                            startTime: '08:00',
                            endTime: '14:00',
                            remarks: 'Teaching staff shift',
                            specificDay: false
                        },
                        {
                            shiftName: 'Morning Shift',
                            startTime: '06:00',
                            endTime: '14:00',
                            remarks: 'Early morning shift',
                            specificDay: false
                        },
                        {
                            shiftName: 'Evening Shift',
                            startTime: '14:00',
                            endTime: '22:00',
                            remarks: 'Evening shift',
                            specificDay: false
                        },
                        {
                            shiftName: 'Night Shift',
                            startTime: '22:00',
                            endTime: '06:00',
                            remarks: 'Night shift',
                            specificDay: false
                        }
                    ];
                    
                    sampleShifts.forEach((shift) => {
                        shiftStore.create(shift);
                    });
                    
                    shifts = shiftStore.list();
                }
                
                setAvailableShifts(shifts);
                
                // Auto-select first shift for testing timing fields if no shift is selected and not editing
                if (shifts.length > 0 && !editingMapping?.shiftName && !watch('shiftName')) {
                    const firstShift = shifts[0];
                    // Use setTimeout to ensure form is initialized
                    setTimeout(() => {
                        setValue('shiftName', firstShift.shiftName);
                        setValue('shiftStartTime', firstShift.startTime);
                        setValue('shiftEndTime', firstShift.endTime);
                        const totalHours = calculateTimeDifference(firstShift.startTime, firstShift.endTime);
                        setValue('totalWorkingHours', totalHours);
                    }, 200);
                }
            } catch (error) {
                console.error('Error loading shifts:', error);
            }
        };
        
        // Load immediately
        loadShifts();
        
        // Also try after a short delay in case of timing issues
        const timeoutId = setTimeout(loadShifts, 500);
        
        return () => clearTimeout(timeoutId);
    }, [setValue, editingMapping, watch]);

    const selectedShiftName = watch('shiftName');
    const shiftStartTime = watch('shiftStartTime');
    const shiftEndTime = watch('shiftEndTime');
    const lunchStartTime = watch('lunchStartTime');
    const lunchEndTime = watch('lunchEndTime');

    // When shift is selected, populate timing fields
    useEffect(() => {
        if (selectedShiftName) {
            const selectedShift = availableShifts.find((shift) => shift.shiftName === selectedShiftName);
            if (selectedShift) {
                setValue('shiftStartTime', selectedShift.startTime);
                setValue('shiftEndTime', selectedShift.endTime);
                // Calculate total working hours
                const totalHours = calculateTimeDifference(selectedShift.startTime, selectedShift.endTime);
                setValue('totalWorkingHours', totalHours);
            }
        }
    }, [selectedShiftName, availableShifts, setValue]);

    // Calculate total working hours when start/end times change
    useEffect(() => {
        if (shiftStartTime && shiftEndTime) {
            const totalHours = calculateTimeDifference(shiftStartTime, shiftEndTime);
            setValue('totalWorkingHours', totalHours);
        }
    }, [shiftStartTime, shiftEndTime, setValue]);

    // Calculate lunch hours when lunch start/end times change
    useEffect(() => {
        if (lunchStartTime && lunchEndTime) {
            const lunchHours = calculateTimeDifference(lunchStartTime, lunchEndTime);
            setValue('lunchHours', lunchHours);
        }
    }, [lunchStartTime, lunchEndTime, setValue]);

    // Update form when editingMapping changes
    React.useEffect(() => {
        if (editingMapping) {
            reset({
                type: editingMapping.type || [],
                department: editingMapping.department || [],
                designation: editingMapping.designation || [],
                dayType: Array.isArray(editingMapping.dayType) ? editingMapping.dayType : editingMapping.dayType ? [editingMapping.dayType] : [],
                shiftName: editingMapping.shiftName || '',
                applicableDate: editingMapping.applicableDate || '',
                employees: editingMapping.employees || [],
                shiftStartTime: editingMapping.shiftStartTime || '',
                lunchStartTime: editingMapping.lunchStartTime || '',
                shiftEndTime: editingMapping.shiftEndTime || '',
                lunchEndTime: editingMapping.lunchEndTime || '',
                totalWorkingHours: editingMapping.totalWorkingHours || '',
                delayPerShift: editingMapping.delayPerShift || '',
                halfDayWorkingHours: editingMapping.halfDayWorkingHours || '',
                earlyPerShift: editingMapping.earlyPerShift || '',
                lunchHours: editingMapping.lunchHours || ''
            });
        } else {
            reset({
                type: [],
                department: [],
                designation: [],
                dayType: [],
                shiftName: '',
                applicableDate: '',
                employees: [],
                shiftStartTime: '',
                lunchStartTime: '',
                shiftEndTime: '',
                lunchEndTime: '',
                totalWorkingHours: '',
                delayPerShift: '',
                halfDayWorkingHours: '',
                earlyPerShift: '',
                lunchHours: ''
            });
        }
    }, [editingMapping, reset]);

    const handleFormSubmit: SubmitHandler<EmployeeShiftMappingForm> = (data) => {
        onSubmit(data);
    };

    // Prepare options for MultiSelect
    const typeMultiSelectOptions = typeOptions.map((opt) => ({ label: opt, value: opt }));
    const departmentMultiSelectOptions = departmentOptions.map((opt) => ({ label: opt, value: opt }));
    const designationMultiSelectOptions = designationOptions.map((opt) => ({ label: opt, value: opt }));
    const dayTypeMultiSelectOptions = dayTypeOptions.map((opt) => ({ label: opt, value: opt }));

    // Get shift names from available shifts
    const shiftNames = useMemo(() => {
        return availableShifts.map((shift) => shift.shiftName);
    }, [availableShifts]);

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            {/* Type, Department, Designation Row */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Type <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={typeMultiSelectOptions}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                }}
                                defaultValue={field.value || []}
                                placeholder='Select Type'
                                variant='inverted'
                            />
                        )}
                    />
                    {errors.type && <FormError>{errors.type.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Department <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={departmentMultiSelectOptions}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                }}
                                defaultValue={field.value || []}
                                placeholder='Select Department'
                                variant='inverted'
                            />
                        )}
                    />
                    {errors.department && <FormError>{errors.department.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Designation <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={designationMultiSelectOptions}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                }}
                                defaultValue={field.value || []}
                                placeholder='Select Designation'
                                variant='inverted'
                            />
                        )}
                    />
                    {errors.designation && <FormError>{errors.designation.message}</FormError>}
                </div>
            </div>

            {/* Day Type, Shift Name, Applicable Date Row */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Day Type <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='dayType'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={dayTypeMultiSelectOptions}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                }}
                                defaultValue={field.value || []}
                                placeholder='Select Day Type'
                                variant='inverted'
                            />
                        )}
                    />
                    {errors.dayType && <FormError>{errors.dayType.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm' htmlFor='shiftName'>
                        Shift Name <span className='text-red-500'>*</span>
                    </label>
                    <Select value={watch('shiftName')} onValueChange={(value) => setValue('shiftName', value)} disabled={shiftNames.length === 0}>
                        <SelectTrigger id='shiftName' className={errors.shiftName ? 'border-red-500' : ''}>
                            <SelectValue placeholder={shiftNames.length === 0 ? 'No shifts available' : '--Select--'} />
                        </SelectTrigger>
                        <SelectContent>
                            {shiftNames.map((shift) => (
                                <SelectItem key={shift} value={shift}>
                                    {shift}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.shiftName && <FormError>{errors.shiftName.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm' htmlFor='applicableDate'>
                        Applicable Date <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='applicableDate'
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
                                                errors.applicableDate && 'border-red-500'
                                            )}
                                            type='button'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Pick a date'}
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
                    {errors.applicableDate && <FormError>{errors.applicableDate.message}</FormError>}
                </div>
            </div>

            {/* Employee Selection */}
            <div className='space-y-2 md:w-1/3'>
                <label className='font-medium text-sm'>
                    Employee <span className='text-red-500'>*</span>
                </label>
                <Controller
                    name='employees'
                    control={control}
                    render={({ field }) => (
                        <MultiSelect
                            options={employeeOptions}
                            onValueChange={(values) => {
                                field.onChange(values);
                            }}
                            defaultValue={field.value || []}
                            placeholder='Select Employee'
                            variant='inverted'
                        />
                    )}
                />
                {errors.employees && <FormError>{errors.employees.message}</FormError>}
            </div>

            {/* Timing Fields - Rendered dynamically when shift is selected */}
            {selectedShiftName && (
                <div className='space-y-4 rounded-md border border-input bg-background p-4'>
                    <h3 className='font-semibold text-sm'>Timing Details</h3>
                    
                    {/* First Row: Shift Start Time, Shift End Time, Total working hours per shift */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Shift Start Time
                            </label>
                            <Controller
                                name='shiftStartTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='shiftStartTime'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Shift End Time
                            </label>
                            <Controller
                                name='shiftEndTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='shiftEndTime'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Total working hours per shift
                            </label>
                            <Controller
                                name='totalWorkingHours'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='totalWorkingHours'
                                        disabled
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Second Row: Lunch start time, Lunch End time, Lunch Hours */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Lunch start time
                            </label>
                            <Controller
                                name='lunchStartTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='lunchStartTime'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Lunch End time
                            </label>
                            <Controller
                                name='lunchEndTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='lunchEndTime'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Lunch Hours
                            </label>
                            <Controller
                                name='lunchHours'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='lunchHours'
                                        disabled
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Third Row: Early per shift, Delay per shift, Half day working hours per shift */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Early per shift
                            </label>
                            <Controller
                                name='earlyPerShift'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='earlyPerShift'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Delay per shift
                            </label>
                            <Controller
                                name='delayPerShift'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='delayPerShift'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Half day working hours per shift
                            </label>
                            <Controller
                                name='halfDayWorkingHours'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour
                                        value={field.value}
                                        onChange={field.onChange}
                                        name='halfDayWorkingHours'
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className='flex justify-end gap-4 border-t pt-6'>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' /> CANCEL
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' /> SAVE
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
