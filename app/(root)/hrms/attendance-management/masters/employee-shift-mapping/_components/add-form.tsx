'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShiftTimingFields } from '../../_components/shift-timing-fields';
import {
    useEmployeeShiftMapping,
    useEmployeeShiftMappingDropdowns,
    useEmployeeShiftMappingShiftNames,
    useShiftSettingMaster
} from '@/hooks/hrms/attendance-management/useMasters';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateEmployeeShiftMapping } from '@/server/hrms/attendance-management/masters/employee-shift-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import React, { useEffect, useId, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hrmsMasterSchemas.employeeShiftMapping.add>;

interface AddEmployeeShiftMappingFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddEmployeeShiftMappingForm({ onSuccess, className = '' }: AddEmployeeShiftMappingFormProps) {
    const { refetchAll } = useEmployeeShiftMapping();

    // Fetch dropdown data from API
    // Sample request body following project architecture
    const dropdownRequestBody = {
        // Sample structure - update when API is ready
    };
    const { data: dropdownData } = useEmployeeShiftMappingDropdowns(dropdownRequestBody);

    // Fetch shift master data from API to get fomS_Id
    const { data: shiftMasterData } = useShiftSettingMaster();
    const shiftMasterList = useMemo(() => {
        // Handle both array response and object with report_list
        if (!shiftMasterData?.data) return [];
        if (Array.isArray(shiftMasterData.data)) {
            return shiftMasterData.data;
        }
        // Type assertion for object with report_list property
        const dataWithReportList = shiftMasterData.data as { report_list?: any[] };
        return dataWithReportList?.report_list || [];
    }, [shiftMasterData]);

    // Generate unique IDs for form fields
    const typeId = useId();
    const departmentId = useId();
    const designationId = useId();
    const dayTypeId = useId();
    const shiftNameId = useId();
    const applicableDateId = useId();
    const employeesId = useId();

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.employeeShiftMapping.add),
        mode: 'onChange',
        defaultValues: {
            foest_ShiftName: '',
            foest_Employee: '',
            foest_HolidayType: '',
            foest_ApplicableDate: '',
            foest_TotalWork: '',
            foest_HalfDayWork: '',
            foest_MorningLogin: '',
            foest_MorningLogout: '',
            foest_AfternoonLogin: '',
            foest_AfternoonLogout: '',
            foest_DelayShift: '',
            foest_EarlyShift: '',
            foest_LunchHour: ''
        }
    });

    const selectedShiftName = watch('foest_ShiftName');

    // Get shift names and IDs from API dropdown data
    const shiftOptions = useMemo(() => {
        if (dropdownData?.data?.shifts && dropdownData.data.shifts.length > 0) {
            return dropdownData.data.shifts.map((shift: any) => ({
                label: shift.label || shift.value || '',
                value: shift.value || shift.label || '',
                id: shift.id || 0
            }));
        }
        return [];
    }, [dropdownData]);

    // Get the selected shift's ID
    const selectedShiftId = useMemo(() => {
        if (selectedShiftName) {
            const selectedShift = shiftOptions.find((shift: { value: string; id?: number }) => shift.value === selectedShiftName);
            return selectedShift?.id || 0;
        }
        return 0;
    }, [selectedShiftName, shiftOptions]);

    // Fetch shift details when a shift is selected
    const shiftNamesRequestBody = selectedShiftId > 0
        ? {
              foms_Id: selectedShiftId
          }
        : undefined;
    const { data: shiftDetailsData, isLoading: isLoadingShiftDetails } = useEmployeeShiftMappingShiftNames(shiftNamesRequestBody);

    // When shift is selected, populate timing fields from API response
    useEffect(() => {
        if (selectedShiftId > 0 && shiftDetailsData?.data) {
            const shiftDetailsArray = Array.isArray(shiftDetailsData.data) ? shiftDetailsData.data : [shiftDetailsData.data];
            if (shiftDetailsArray.length > 0) {
                const shiftDetails = shiftDetailsArray[0];
                const shiftStartTime =
                    shiftDetails.FOMST_IHalfLoginTime ||
                    shiftDetails.IHalfLoginTime ||
                    shiftDetails.shiftStartTime ||
                    shiftDetails.startTime ||
                    '';
                const shiftEndTime =
                    shiftDetails.FOMST_IIHalfLogoutTime ||
                    shiftDetails.IIHalfLogoutTime ||
                    shiftDetails.shiftEndTime ||
                    shiftDetails.endTime ||
                    '';
                const lunchStartTime =
                    shiftDetails.FOMST_IHalfLogoutTime || shiftDetails.IHalfLogoutTime || shiftDetails.lunchStartTime || '';
                const lunchEndTime = shiftDetails.FOMST_IIHalfLoginTime || shiftDetails.IIHalfLoginTime || shiftDetails.lunchEndTime || '';
                const totalWorkingHours = shiftDetails.FOMST_FDWHrMin || shiftDetails.FDWHrMin || shiftDetails.totalWorkingHours || '';
                const halfDayWorkingHours = shiftDetails.FOMST_HDWHrMin || shiftDetails.HDWHrMin || shiftDetails.halfDayWorkingHours || '';
                const delayPerShift =
                    shiftDetails.FOMST_DelayPerShiftHrMin || shiftDetails.DelayPerShiftHrMin || shiftDetails.delayPerShift || '';
                const earlyPerShift =
                    shiftDetails.FOMST_EarlyPerShiftHrMin || shiftDetails.EarlyPerShiftHrMin || shiftDetails.earlyPerShift || '';
                const lunchHours =
                    shiftDetails.FOMST_LunchHoursDuration || shiftDetails.LunchHoursDuration || shiftDetails.lunchHours || '';
                const cleanTime = (time: string) => (time ? String(time).trim() : '');
                if (shiftStartTime) setValue('foest_MorningLogin', cleanTime(shiftStartTime));
                if (shiftEndTime) setValue('foest_AfternoonLogout', cleanTime(shiftEndTime));
                if (lunchStartTime) setValue('foest_MorningLogout', cleanTime(lunchStartTime));
                if (lunchEndTime) setValue('foest_AfternoonLogin', cleanTime(lunchEndTime));
                if (totalWorkingHours) setValue('foest_TotalWork', cleanTime(totalWorkingHours));
                if (halfDayWorkingHours) setValue('foest_HalfDayWork', cleanTime(halfDayWorkingHours));
                if (delayPerShift) setValue('foest_DelayShift', cleanTime(delayPerShift));
                if (earlyPerShift) setValue('foest_EarlyShift', cleanTime(earlyPerShift));
                if (lunchHours) setValue('foest_LunchHour', cleanTime(lunchHours));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShiftId, shiftDetailsData, isLoadingShiftDetails]);

    // Helper function to remove duplicates by value
    const removeDuplicateOptions = (options: Array<{ label: string; value: string }>) => {
        const seen = new Set<string>();
        return options.filter((option) => {
            if (seen.has(option.value)) {
                return false;
            }
            seen.add(option.value);
            return true;
        });
    };

    // Prepare options for MultiSelect from API data
    const typeMultiSelectOptions = React.useMemo(() => {
        const options = (dropdownData?.data?.employeeTypes || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
        return removeDuplicateOptions(options);
    }, [dropdownData]);

    const departmentMultiSelectOptions = React.useMemo(() => {
        const options = (dropdownData?.data?.departments || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
        return removeDuplicateOptions(options);
    }, [dropdownData]);

    const designationMultiSelectOptions = React.useMemo(() => {
        const options = (dropdownData?.data?.designations || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
        return removeDuplicateOptions(options);
    }, [dropdownData]);

    const dayTypeMultiSelectOptions = React.useMemo(() => {
        const options = (dropdownData?.data?.dayTypes || []).map((item: any) => ({
            label: item.label || item.name || '',
            value: item.value || String(item.id || '')
        }));
        return removeDuplicateOptions(options);
    }, [dropdownData]);

    // Get employee options from API dropdown data
    const employeeOptions = React.useMemo(() => {
        const options = (dropdownData?.data?.employees || []).map((emp: any) => ({
            label: emp.label || '',
            value: emp.value || ''
        }));
        return removeDuplicateOptions(options);
    }, [dropdownData]);

    // Extract shift names for the dropdown
    const shiftNames = useMemo(() => {
        return shiftOptions.map((shift: { value: string; id?: number }) => shift.value).filter(Boolean);
    }, [shiftOptions]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
        // Find shift master ID from shift name
        let fomS_Id = 0;
        const apiShift = shiftMasterList.find((shift: any) => {
            const shiftNameMatch =
                    shift.fomS_ShiftName?.toLowerCase() === data.foest_ShiftName.toLowerCase() ||
                    shift.shiftName?.toLowerCase() === data.foest_ShiftName.toLowerCase() ||
                    shift.name?.toLowerCase() === data.foest_ShiftName.toLowerCase();
            return shiftNameMatch;
        });
        if (apiShift) {
            fomS_Id = apiShift.fomS_Id || apiShift.id || 0;
            }

            // Convert employee strings to IDs from dropdown data
            const employeeIds = (data.foest_Employee?.split(', ') || [])
            .map((empString) => {
                const parsed = Number.parseInt(empString, 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    return parsed;
                    }
                    // Find in dropdown data
                    const found = dropdownData?.data?.employees?.find((emp: any) => {
                        const empValue = String(emp.value || '');
                        const empLabel = String(emp.label || '').toLowerCase();
                        const searchValue = empString.toLowerCase().trim();
                        return empValue === empString || empLabel === searchValue;
                    });
                    return found?.id || 0;
            })
            .filter((id) => id > 0);

            // Convert dayType to IDs from dropdown data
            const dayTypeIds = (data.foest_HolidayType ? [data.foest_HolidayType] : [])
            .map((dayTypeValue) => {
                const parsed = Number.parseInt(String(dayTypeValue), 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    return parsed;
                }
                const dayTypeItem = dropdownData?.data?.dayTypes?.find((item: any) => {
                    const itemValue = String(item.value || '');
                    const itemLabel = String(item.label || '').toUpperCase();
                    const searchValue = String(dayTypeValue).toUpperCase();
                    return itemValue === String(dayTypeValue) || itemLabel === searchValue;
                });
                    return dayTypeItem?.id || 0;
            })
            .filter((id) => id > 0);

            // Validate required fields
        if (fomS_Id === 0) {
            toast.error('Shift Master ID is required. Please ensure the selected shift exists.');
            return;
        }
        if (employeeIds.length === 0) {
            toast.error('Employee IDs are required. Please ensure employees are selected correctly.');
            return;
        }
        if (dayTypeIds.length === 0) {
            toast.error('Day Type IDs are required. Please ensure day types are selected correctly.');
            return;
        }

            // Sample payload structure following project architecture
            // Note: mI_Id is handled by JWT, not included in request body
            const payload = {
                foest_Id: 0, // 0 for add operation
                foest_ShiftName: data.foest_ShiftName || '',
                foest_Employee: data.foest_Employee || '',
                foest_HolidayType: data.foest_HolidayType || '',
                foest_ApplicableDate: data.foest_ApplicableDate || '',
                foest_TotalWork: data.foest_TotalWork || '00:00',
                foest_HalfDayWork: data.foest_HalfDayWork || '00:00',
                foest_MorningLogin: data.foest_MorningLogin || '00:00',
                foest_MorningLogout: data.foest_MorningLogout || '00:00',
                foest_AfternoonLogin: data.foest_AfternoonLogin || '00:00',
                foest_AfternoonLogout: data.foest_AfternoonLogout || '00:00',
                foest_DelayShift: data.foest_DelayShift || '00:00',
                foest_EarlyShift: data.foest_EarlyShift || '00:00',
                foest_LunchHour: data.foest_LunchHour || '00:00',
                foest_ActiveFlag: true,
                // Additional fields for API processing
                fomS_Id: fomS_Id,
                employeeIds: employeeIds,
                dayTypeIds: dayTypeIds
            };

            const response = await addOrUpdateEmployeeShiftMapping(payload);

            if (response?.success) {
                toast.success(response?.message || 'Employee shift mapping saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save employee shift mapping');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save employee shift mapping');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* Type, Department, Designation Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label htmlFor={typeId}>
                                Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_HolidayType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={typeId}
                                        options={typeMultiSelectOptions}
                                        onValueChange={(values) => {
                                            field.onChange(values.length > 0 ? values[0] : '');
                                        }}
                                        defaultValue={field.value ? [field.value] : []}
                                        placeholder='Select Type'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_HolidayType && <FormError>{errors.foest_HolidayType.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor={departmentId}>
                                Department <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_Employee'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={departmentId}
                                        options={departmentMultiSelectOptions}
                                        onValueChange={(values) => {
                                            field.onChange(values.join(', '));
                                        }}
                                        defaultValue={field.value ? field.value.split(', ') : []}
                                        placeholder='Select Department'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_Employee && <FormError>{errors.foest_Employee.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor={designationId}>
                                Designation <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_Employee'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={designationId}
                                        options={designationMultiSelectOptions}
                                        onValueChange={(values) => {
                                            field.onChange(values.join(', '));
                                        }}
                                        defaultValue={field.value ? field.value.split(', ') : []}
                                        placeholder='Select Designation'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_Employee && <FormError>{errors.foest_Employee.message}</FormError>}
                        </div>
                    </div>

                    {/* Day Type, Shift Name, Applicable Date Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label htmlFor={dayTypeId}>
                                Day Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_HolidayType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={dayTypeId}
                                        options={dayTypeMultiSelectOptions}
                                        onValueChange={(values) => {
                                            field.onChange(values.length > 0 ? values[0] : '');
                                        }}
                                        defaultValue={field.value ? [field.value] : []}
                                        placeholder='Select Day Type'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_HolidayType && <FormError>{errors.foest_HolidayType.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor={shiftNameId}>
                                Shift Name <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                value={watch('foest_ShiftName')}
                                onValueChange={(value) => setValue('foest_ShiftName', value)}
                                disabled={shiftNames.length === 0}>
                                <SelectTrigger id={shiftNameId} className={errors.foest_ShiftName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={shiftNames.length === 0 ? 'No shifts available' : '--Select--'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {shiftNames.map((shift: string) => (
                                        <SelectItem key={shift} value={shift}>
                                            {shift}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.foest_ShiftName && <FormError>{errors.foest_ShiftName.message}</FormError>}
                        </div>
                        <Controller
                            name='foest_ApplicableDate'
                            control={control}
                            render={({ field, fieldState }) => (
                                <DateField
                                    field={field}
                                    fieldState={fieldState}
                                    label='Applicable Date'
                                    fromDate={new Date()}
                                />
                            )}
                        />
                    </div>

                    {/* Employee Selection */}
                    <div className='space-y-2 md:w-1/3'>
                        <Label htmlFor={employeesId}>
                            Employee <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='foest_Employee'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    id={employeesId}
                                    options={employeeOptions}
                                    onValueChange={(values) => {
                                        field.onChange(values.join(', '));
                                    }}
                                    defaultValue={field.value ? field.value.split(', ') : []}
                                    placeholder='Select Employee'
                                    variant='inverted'
                                />
                            )}
                        />
                        {errors.foest_Employee && <FormError>{errors.foest_Employee.message}</FormError>}
                    </div>

                    {/* Timing Fields - Rendered dynamically when shift is selected */}
                    {selectedShiftName && (
                        <ShiftTimingFields
                            control={control}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            fieldNames={{
                                shiftStartTime: 'foest_MorningLogin',
                                shiftEndTime: 'foest_AfternoonLogout',
                                totalWorkingHours: 'foest_TotalWork',
                                lunchStartTime: 'foest_MorningLogout',
                                lunchEndTime: 'foest_AfternoonLogin',
                                lunchHours: 'foest_LunchHour',
                                earlyPerShift: 'foest_EarlyShift',
                                delayPerShift: 'foest_DelayShift',
                                halfDayWorkingHours: 'foest_HalfDayWork'
                            }}
                        />
                    )}

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        <RefreshCw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Employee Shift Mapping
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
