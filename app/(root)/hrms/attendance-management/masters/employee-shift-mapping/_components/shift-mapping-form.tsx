'use client';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeShiftMappingDropdowns } from '@/hooks/hrms/attendance-management/useMasters';
import { useFilterEmployeesBySelection } from '@/hooks/hrms/useReports';
import { createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import { employeeShiftMappingSchema } from '@/schemas/hrms/attendance-management-schemas';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Save } from 'lucide-react';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { MasterShift } from '../../master-shift/_components/columns';
import { TimePicker12Hour } from '../../master-shift/_components/time-picker-12hour';

export type EmployeeShiftMappingForm = z.infer<typeof employeeShiftMappingSchema.addOrUpdate> & {
    id?: number;
};

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

export function ShiftMappingForm({ editingMapping, onSubmit, onCancel: _onCancel }: ShiftMappingFormProps) {
    // Fetch dropdown data from API
    const { data: dropdownData, isLoading: isLoadingDropdowns } = useEmployeeShiftMappingDropdowns();

    // Fetch employee options
    const [employeeOptions, setEmployeeOptions] = useState<Array<{ label: string; value: string }>>([]);
    const filterEmployeesMutation = useFilterEmployeesBySelection();

    // Fetch all employees on mount
    useEffect(() => {
        const request = {
            MI_Id: HRMS_MI_ID,
            LogInUserId: 0,
            hrmgT_IdList: [0], // Empty filter to get all employees
            hrmD_IdList: [0],
            hrmdeS_IdList: [0]
        };

        filterEmployeesMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data?.employeedropdown) {
                    const employees = response.data.employeedropdown || [];
                    const options = employees
                        .map((emp: EmployeeDropdown) => {
                            const fullName =
                                `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim();
                            const displayName = fullName || emp.HRME_EmployeeCode || '';
                            // Use employee code as value for matching in add-form.tsx
                            const value = emp.HRME_EmployeeCode || String(emp.HRME_Id) || '';
                            return {
                                label: displayName,
                                value: value
                            };
                        })
                        .filter((opt: { label: string; value: string }) => opt.label && opt.value);
                    setEmployeeOptions(options);
                }
            },
            onError: (error) => {
                console.error('Error fetching employees:', error);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const shiftStore = createLocalCrud<MasterShift>('attendance:master-shift');
    const [availableShifts, setAvailableShifts] = React.useState<MasterShift[]>([]);

    // Generate unique IDs for form fields
    const typeId = useId();
    const departmentId = useId();
    const designationId = useId();
    const dayTypeId = useId();
    const shiftNameId = useId();
    const applicableDateId = useId();
    const employeesId = useId();
    const shiftStartTimeId = useId();
    const shiftEndTimeId = useId();
    const totalWorkingHoursId = useId();
    const lunchStartTimeId = useId();
    const lunchEndTimeId = useId();
    const lunchHoursId = useId();
    const earlyPerShiftId = useId();
    const delayPerShiftId = useId();
    const halfDayWorkingHoursId = useId();

    const {
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
                  dayType: Array.isArray(editingMapping.dayType)
                      ? editingMapping.dayType
                      : editingMapping.dayType
                        ? [editingMapping.dayType]
                        : [],
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

    // Load shifts from API dropdown data
    useEffect(() => {
        if (dropdownData?.data?.shifts) {
            // Convert API shift data to MasterShift format for compatibility
            const apiShifts: MasterShift[] = dropdownData.data.shifts.map((shift: any) => ({
                id: shift.id || 0,
                shiftName: shift.value || shift.label || '',
                startTime: '', // Will be populated from shift setting master if needed
                endTime: '', // Will be populated from shift setting master if needed
                remarks: '',
                specificDay: false,
                createdAt: new Date()
            }));
            setAvailableShifts(apiShifts);
        } else {
            // Fallback to local storage if API data not available
            try {
                const shifts = shiftStore.list();
                setAvailableShifts(shifts);
            } catch (error) {
                console.error('Error loading shifts from local storage:', error);
                setAvailableShifts([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropdownData]); // shiftStore is stable, no need to include it

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShiftName, availableShifts]); // setValue is stable from react-hook-form

    // Calculate total working hours when start/end times change
    useEffect(() => {
        if (shiftStartTime && shiftEndTime) {
            const totalHours = calculateTimeDifference(shiftStartTime, shiftEndTime);
            setValue('totalWorkingHours', totalHours);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftStartTime, shiftEndTime]); // setValue is stable from react-hook-form

    // Calculate lunch hours when lunch start/end times change
    useEffect(() => {
        if (lunchStartTime && lunchEndTime) {
            const lunchHours = calculateTimeDifference(lunchStartTime, lunchEndTime);
            setValue('lunchHours', lunchHours);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lunchStartTime, lunchEndTime]); // setValue is stable from react-hook-form

    // Track previous editingMapping ID to prevent unnecessary resets
    const prevEditingMappingIdRef = React.useRef<number | null>(null);

    // Update form when editingMapping changes
    React.useEffect(() => {
        const currentId = editingMapping?.id ?? null;

        // Only reset if the ID actually changed
        if (prevEditingMappingIdRef.current !== currentId) {
            prevEditingMappingIdRef.current = currentId;

            if (editingMapping) {
                reset({
                    type: editingMapping.type || [],
                    department: editingMapping.department || [],
                    designation: editingMapping.designation || [],
                    dayType: Array.isArray(editingMapping.dayType)
                        ? editingMapping.dayType
                        : editingMapping.dayType
                          ? [editingMapping.dayType]
                          : [],
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingMapping?.id]); // Only depend on the ID to avoid infinite loops when object reference changes

    const handleFormSubmit: SubmitHandler<EmployeeShiftMappingForm> = (data) => {
        onSubmit(data);
    };

    const handleReset = () => {
        if (editingMapping) {
            reset({
                type: editingMapping.type || [],
                department: editingMapping.department || [],
                designation: editingMapping.designation || [],
                dayType: Array.isArray(editingMapping.dayType)
                    ? editingMapping.dayType
                    : editingMapping.dayType
                      ? [editingMapping.dayType]
                      : [],
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
    };

    // Prepare options for MultiSelect from API data
    const typeMultiSelectOptions = React.useMemo(() => {
        return (dropdownData?.data?.employeeTypes || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
    }, [dropdownData]);

    const departmentMultiSelectOptions = React.useMemo(() => {
        return (dropdownData?.data?.departments || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
    }, [dropdownData]);

    const designationMultiSelectOptions = React.useMemo(() => {
        return (dropdownData?.data?.designations || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
    }, [dropdownData]);

    const dayTypeMultiSelectOptions = React.useMemo(() => {
        return (dropdownData?.data?.dayTypes || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
    }, [dropdownData]);

    // Get shift names from API dropdown data or available shifts
    const shiftNames = useMemo(() => {
        if (dropdownData?.data?.shifts && dropdownData.data.shifts.length > 0) {
            return dropdownData.data.shifts.map((shift: any) => shift.value || shift.label || '');
        }
        return availableShifts.map((shift) => shift.shiftName).filter(Boolean);
    }, [dropdownData, availableShifts]);

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            {/* Type, Department, Designation Row */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                    <label htmlFor={typeId} className='font-medium text-sm'>
                        Type <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id={typeId}
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
                    <label htmlFor={departmentId} className='font-medium text-sm'>
                        Department <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id={departmentId}
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
                    <label htmlFor={designationId} className='font-medium text-sm'>
                        Designation <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id={designationId}
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
                    <label htmlFor={dayTypeId} className='font-medium text-sm'>
                        Day Type <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='dayType'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id={dayTypeId}
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
                    <label htmlFor={shiftNameId} className='font-medium text-sm'>
                        Shift Name <span className='text-red-500'>*</span>
                    </label>
                    <Select
                        value={watch('shiftName')}
                        onValueChange={(value) => setValue('shiftName', value)}
                        disabled={shiftNames.length === 0}>
                        <SelectTrigger id={shiftNameId} className={errors.shiftName ? 'border-red-500' : ''}>
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
                    <label htmlFor={applicableDateId} className='font-medium text-sm'>
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
                <label htmlFor={employeesId} className='font-medium text-sm'>
                    Employee <span className='text-red-500'>*</span>
                </label>
                <Controller
                    name='employees'
                    control={control}
                    render={({ field }) => (
                        <MultiSelect
                            id={employeesId}
                            options={employeeOptions}
                            onValueChange={(values) => {
                                field.onChange(values);
                            }}
                            defaultValue={field.value || []}
                            placeholder={filterEmployeesMutation.isPending ? 'Loading employees...' : 'Select Employee'}
                            variant='inverted'
                            disabled={filterEmployeesMutation.isPending}
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
                            <label htmlFor={shiftStartTimeId} className='font-medium text-sm'>
                                Shift Start Time
                            </label>
                            <Controller
                                name='shiftStartTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='shiftStartTime' />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor={shiftEndTimeId} className='font-medium text-sm'>
                                Shift End Time
                            </label>
                            <Controller
                                name='shiftEndTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='shiftEndTime' />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor={totalWorkingHoursId} className='font-medium text-sm'>
                                Total working hours per shift
                            </label>
                            <Controller
                                name='totalWorkingHours'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='totalWorkingHours' disabled />
                                )}
                            />
                        </div>
                    </div>

                    {/* Second Row: Lunch start time, Lunch End time, Lunch Hours */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label htmlFor={lunchStartTimeId} className='font-medium text-sm'>
                                Lunch start time
                            </label>
                            <Controller
                                name='lunchStartTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='lunchStartTime' />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor={lunchEndTimeId} className='font-medium text-sm'>
                                Lunch End time
                            </label>
                            <Controller
                                name='lunchEndTime'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='lunchEndTime' />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor={lunchHoursId} className='font-medium text-sm'>
                                Lunch Hours
                            </label>
                            <Controller
                                name='lunchHours'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='lunchHours' disabled />
                                )}
                            />
                        </div>
                    </div>

                    {/* Third Row: Early per shift, Delay per shift, Half day working hours per shift */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label htmlFor={earlyPerShiftId} className='font-medium text-sm'>
                                Early per shift
                            </label>
                            <Controller
                                name='earlyPerShift'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='earlyPerShift' />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor={delayPerShiftId} className='font-medium text-sm'>
                                Delay per shift
                            </label>
                            <Controller
                                name='delayPerShift'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='delayPerShift' />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor={halfDayWorkingHoursId} className='font-medium text-sm'>
                                Half day working hours per shift
                            </label>
                            <Controller
                                name='halfDayWorkingHours'
                                control={control}
                                render={({ field }) => (
                                    <TimePicker12Hour value={field.value} onChange={field.onChange} name='halfDayWorkingHours' />
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className='flex justify-end gap-4 border-t pt-6'>
                <Button type='button' variant='outline' onClick={handleReset}>
                    <RefreshCw className='mr-2 h-4 w-4' /> RESET
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
