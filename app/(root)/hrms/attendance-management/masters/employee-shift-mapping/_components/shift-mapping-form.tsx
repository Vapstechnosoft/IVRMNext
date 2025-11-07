'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Save } from 'lucide-react';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import {
    dayTypeOptions,
    departmentOptions,
    designationOptions,
    employeeTypeOptions,
    shiftNames,
    typeOptions
} from './columns';

export type EmployeeShiftMappingForm = {
    employeeTypes: string[];
    dayTypes: string[];
    allEmployees: boolean;
    searchEmployee: string;
    type: string;
    department: string;
    designation: string;
    dayType: string;
    shiftName: string;
    applicableDate: string;
    isActive: boolean;
};

interface ShiftMappingFormProps {
    editingMapping: EmployeeShiftMappingForm | null;
    onSubmit: (data: EmployeeShiftMappingForm) => void;
    onCancel: () => void;
}

export function ShiftMappingForm({ editingMapping, onSubmit, onCancel }: ShiftMappingFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeShiftMappingForm>({
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            employeeTypes: [],
            dayTypes: [],
            allEmployees: true,
            type: 'All',
            department: 'All',
            designation: 'All',
            applicableDate: new Date().toISOString().split('T')[0]
        }
    });

    const employeeTypes = watch('employeeTypes');
    const dayTypes = watch('dayTypes');
    const allEmployees = watch('allEmployees');
    const type = watch('type');
    const department = watch('department');
    const designation = watch('designation');
    const dayType = watch('dayType');
    const shiftName = watch('shiftName');

    // Update form when editingMapping changes
    React.useEffect(() => {
        if (editingMapping) {
            reset(editingMapping);
        } else {
            reset({
                isActive: true,
                employeeTypes: [],
                dayTypes: [],
                allEmployees: true,
                type: 'All',
                department: 'All',
                designation: 'All',
                applicableDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [editingMapping, reset]);

    const handleEmployeeTypeToggle = (empType: string) => {
        const currentTypes = employeeTypes || [];
        const newTypes = currentTypes.includes(empType) ? currentTypes.filter((t) => t !== empType) : [...currentTypes, empType];
        setValue('employeeTypes', newTypes);
    };

    const handleDayTypeToggle = (dayTypeOption: string) => {
        const currentDayTypes = dayTypes || [];
        const newDayTypes = currentDayTypes.includes(dayTypeOption)
            ? currentDayTypes.filter((t) => t !== dayTypeOption)
            : [...currentDayTypes, dayTypeOption];
        setValue('dayTypes', newDayTypes);
    };

    const handleFormSubmit: SubmitHandler<EmployeeShiftMappingForm> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='max-w-full space-y-6'>
            {/* Primary Information Section */}
            <div className='space-y-4'>
                {/* Employee Type Selection */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
                    <div className='space-y-2'>
                        <span className='font-medium text-sm'>Employee Types:</span>
                        <div className='max-h-40 overflow-y-auto rounded-md border bg-background p-3'>
                            <div className='space-y-2'>
                                {employeeTypeOptions.map((empType) => (
                                    <div key={empType} className='flex cursor-pointer items-center gap-2 text-sm'>
                                        <Checkbox
                                            checked={employeeTypes?.includes(empType) || false}
                                            onCheckedChange={() => handleEmployeeTypeToggle(empType)}
                                        />
                                        <span>{empType}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='type'>
                            Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={type || ''} onValueChange={(value) => setValue('type', value)}>
                            <SelectTrigger id='type'>
                                <SelectValue placeholder='All' />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((typeOption) => (
                                    <SelectItem key={typeOption} value={typeOption}>
                                        {typeOption}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='department'>
                            Department <span className='text-red-500'>*</span>
                        </label>
                        <Select value={department || ''} onValueChange={(value) => setValue('department', value)}>
                            <SelectTrigger id='department'>
                                <SelectValue placeholder='All' />
                            </SelectTrigger>
                            <SelectContent>
                                {departmentOptions.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='designation'>
                            Designation <span className='text-red-500'>*</span>
                        </label>
                        <Select value={designation || ''} onValueChange={(value) => setValue('designation', value)}>
                            <SelectTrigger id='designation'>
                                <SelectValue placeholder='All' />
                            </SelectTrigger>
                            <SelectContent>
                                {designationOptions.map((desig) => (
                                    <SelectItem key={desig} value={desig}>
                                        {desig}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Day Types and Employee Selection */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <div className='space-y-2'>
                        <span className='font-medium text-sm'>Day Types:</span>
                        <div className='rounded-md border bg-background p-3'>
                            <div className='space-y-2'>
                                {dayTypeOptions.map((dayTypeOption) => (
                                    <div key={dayTypeOption} className='flex cursor-pointer items-center gap-2 text-sm'>
                                        <Checkbox
                                            checked={dayTypes?.includes(dayTypeOption) || false}
                                            onCheckedChange={() => handleDayTypeToggle(dayTypeOption)}
                                        />
                                        <span>{dayTypeOption}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                checked={allEmployees}
                                onCheckedChange={(checked) => setValue('allEmployees', !!checked)}
                            />
                            <span className='font-medium text-sm'>Employee: All</span>
                        </div>
                        <InputText
                            placeholder='Search here...'
                            {...register('searchEmployee')}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* Required Fields */}
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='dayType'>
                            Day Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={dayType || ''} onValueChange={(value) => setValue('dayType', value)}>
                            <SelectTrigger id='dayType' className={errors.dayType ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {dayTypeOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!dayType && (
                            <input
                                type='hidden'
                                {...register('dayType', {
                                    required: 'Day Type is required'
                                })}
                            />
                        )}
                        {errors.dayType && <FormError>{errors.dayType.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='shiftName'>
                            Shift Name <span className='text-red-500'>*</span>
                        </label>
                        <Select value={shiftName || ''} onValueChange={(value) => setValue('shiftName', value)}>
                            <SelectTrigger id='shiftName' className={errors.shiftName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {shiftNames.map((shift) => (
                                    <SelectItem key={shift} value={shift}>
                                        {shift}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!shiftName && (
                            <input
                                type='hidden'
                                {...register('shiftName', {
                                    required: 'Shift Name is required'
                                })}
                            />
                        )}
                        {errors.shiftName && <FormError>{errors.shiftName.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <label className='font-medium text-sm' htmlFor='applicableDate'>
                            Applicable Date <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='applicableDate'
                            type='date'
                            {...register('applicableDate', { required: 'Applicable Date is required' })}
                            className={`w-full rounded-md border px-3 py-2 ${errors.applicableDate ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.applicableDate && <FormError>{errors.applicableDate.message}</FormError>}
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
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
                            {editingMapping ? 'Update Shift Mapping' : 'Save Shift Mapping'}
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
