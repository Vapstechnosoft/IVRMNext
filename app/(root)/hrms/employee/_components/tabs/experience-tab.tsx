'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HRMSDateField as DateField } from '@/app/(root)/hrms/_components/hrms-date-field';
import { Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';
export function ExperienceTab({ control, register, errors, isSubmitting, setValue, onClear, currentTab, onPreviousTab }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'experienceDetails'
    });
    // Watch all experience details to recalculate when dates change
    const experienceDetails = useWatch({
        control,
        name: 'experienceDetails'
    }) || [];
    // Helper function to calculate years and months between two dates
    const calculateYearsAndMonths = (startDate: string | Date, endDate: string | Date) => {
        if (!startDate || !endDate) {
            return { years: 0, months: 0 };
        }
        // Parse dates - normalize to Date objects and extract date parts to avoid timezone issues
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
            return { years: 0, months: 0 };
        }
        // Extract date components to avoid timezone issues
        const startYear = start.getFullYear();
        const startMonth = start.getMonth();
        const startDay = start.getDate();
        const endYear = end.getFullYear();
        const endMonth = end.getMonth();
        const endDay = end.getDate();
        // Calculate years difference
        let years = endYear - startYear;
        // Calculate months difference
        let months = endMonth - startMonth;
        // If months is negative, we haven't completed a full year yet
        if (months < 0) {
            years--;
            months += 12;
        }
        // Adjust for days - if end day is before start day, we haven't completed the current month
        if (endDay < startDay) {
            months--;
            // If months becomes negative, borrow from years
            if (months < 0) {
                years--;
                months += 12;
            }
        }
        // Ensure non-negative values and that months is between 0-11
        return { 
            years: Math.max(0, years), 
            months: Math.max(0, Math.min(11, months))
        };
    };
    // Recalculate years and months when dates change (for existing data or when dates are updated)
    useEffect(() => {
        if (!experienceDetails || experienceDetails.length === 0 || !setValue) return;
        experienceDetails.forEach((exp: any, index: number) => {
            const joinDate = exp?.joinDate;
            const exitDate = exp?.exitDate;
            if (joinDate && exitDate) {
                const { years, months } = calculateYearsAndMonths(joinDate, exitDate);
                // Only update if values are different to avoid infinite loops
                const currentYears = exp?.noOfYears?.toString() || '0';
                const currentMonths = exp?.noOfMonths?.toString() || '0';
                if (currentYears !== years.toString() || currentMonths !== months.toString()) {
                    setValue(`experienceDetails.${index}.noOfYears`, years.toString(), { shouldValidate: false, shouldDirty: false });
                    setValue(`experienceDetails.${index}.noOfMonths`, months.toString(), { shouldValidate: false, shouldDirty: false });
                }
            } else if (!joinDate || !exitDate) {
                // Clear if dates are not both present
                setValue(`experienceDetails.${index}.noOfYears`, '', { shouldValidate: false, shouldDirty: false });
                setValue(`experienceDetails.${index}.noOfMonths`, '', { shouldValidate: false, shouldDirty: false });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [experienceDetails?.map((exp: any) => `${exp?.joinDate}-${exp?.exitDate}`).join(',')]);
    const addEmptyRow = () => {
        append({} as any);
    };
    return (
        <div className='space-y-4'>
            <div className='rounded-md border'>
                <div className='flex items-center justify-between border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>PREVIOUS EMPLOYMENT DETAILS</h3>
                    <Button 
                        type='button' 
                        className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80'
                        onClick={addEmptyRow}>
                        <Plus className='mr-1 h-3.5 w-3.5' /> Add Experience
                    </Button>
                </div>
            </div>
            {fields.length === 0 && (
                <div className='rounded-md border p-6 text-muted-foreground text-sm'>
                    No experience added yet. Click "Add Experience" to start.
                </div>
            )}
            <div className='space-y-4'>
                {fields.map((field, index) => (
                    <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                        <div className='mb-3 flex items-center justify-between'>
                            <div className='font-semibold'>Experience #{index + 1}</div>
                            <div className='flex gap-2'>
                                <Badge variant='secondary'>Row {index + 1}</Badge>
                                <Button 
                                    type='button' 
                                    className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground'
                                    onClick={() => remove(index)}>
                                    <Trash2 className='mr-1 h-3.5 w-3.5' /> Remove
                                </Button>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                            <HRMSInputText
                                label='Organisation Name'
                                id={`experienceDetails.${index}.organisationName`}
                                maxLength={255}
                                {...register(`experienceDetails.${index}.organisationName`)}
                            />
                            <HRMSInputText
                                label='Department'
                                id={`experienceDetails.${index}.department`}
                                maxLength={100}
                                {...register(`experienceDetails.${index}.department`)}
                            />
                            <HRMSInputText
                                label='Designation *'
                                id={`experienceDetails.${index}.designation`}
                                maxLength={100}
                                {...register(`experienceDetails.${index}.designation`)}
                            />
                            <Controller
                                name={`experienceDetails.${index}.joinDate`}
                                control={control}
                                render={({ field, fieldState }) => {
                                    // Use the already-watched experienceDetails array instead of calling useWatch inside render
                                    const exitDate = experienceDetails[index]?.exitDate;
                                    return (
                                        <div className='flex flex-col gap-1.5 [&>div]:mt-0'>
                                            <DateField
                                                field={{
                                                    ...field,
                                                    onChange: (value: any) => {
                                                        field.onChange(value);
                                                        // Trigger recalculation when join date changes
                                                        if (value && exitDate) {
                                                            const { years, months } = calculateYearsAndMonths(value, exitDate);
                                                            setValue(`experienceDetails.${index}.noOfYears`, years.toString(), { shouldValidate: false, shouldDirty: false });
                                                            setValue(`experienceDetails.${index}.noOfMonths`, months.toString(), { shouldValidate: false, shouldDirty: false });
                                                        } else {
                                                            setValue(`experienceDetails.${index}.noOfYears`, '', { shouldValidate: false, shouldDirty: false });
                                                            setValue(`experienceDetails.${index}.noOfMonths`, '', { shouldValidate: false, shouldDirty: false });
                                                        }
                                                    }
                                                }}
                                                fieldState={fieldState}
                                                label='Join Date'
                                                placeholder='Pick join date'
                                            />
                                        </div>
                                    );
                                }}
                            />
                            <Controller
                                name={`experienceDetails.${index}.exitDate`}
                                control={control}
                                render={({ field, fieldState }) => {
                                    // Use the already-watched experienceDetails array instead of calling useWatch inside render
                                    const joinDate = experienceDetails[index]?.joinDate;
                                    return (
                                        <div className='flex flex-col gap-1.5 [&>div]:mt-0'>
                                            <DateField
                                                field={{
                                                    ...field,
                                                    onChange: (value: any) => {
                                                        field.onChange(value);
                                                        // Trigger recalculation when exit date changes
                                                        if (value && joinDate) {
                                                            const { years, months } = calculateYearsAndMonths(joinDate, value);
                                                            setValue(`experienceDetails.${index}.noOfYears`, years.toString(), { shouldValidate: false, shouldDirty: false });
                                                            setValue(`experienceDetails.${index}.noOfMonths`, months.toString(), { shouldValidate: false, shouldDirty: false });
                                                        } else {
                                                            setValue(`experienceDetails.${index}.noOfYears`, '', { shouldValidate: false, shouldDirty: false });
                                                            setValue(`experienceDetails.${index}.noOfMonths`, '', { shouldValidate: false, shouldDirty: false });
                                                        }
                                                    }
                                                }}
                                                fieldState={fieldState}
                                                label='Exit Date'
                                                placeholder='Pick exit date'
                                            />
                                        </div>
                                    );
                                }}
                            />
                            <HRMSInputText
                                label='No. Of Years'
                                id={`experienceDetails.${index}.noOfYears`}
                                {...register(`experienceDetails.${index}.noOfYears`)}
                                disabled
                                className='[&>input]:bg-muted [&>input]:cursor-not-allowed [&>input]:opacity-70'
                            />
                            <HRMSInputText
                                label='No. Of Months'
                                id={`experienceDetails.${index}.noOfMonths`}
                                {...register(`experienceDetails.${index}.noOfMonths`)}
                                disabled
                                className='[&>input]:bg-muted [&>input]:cursor-not-allowed [&>input]:opacity-70'
                            />
                            <HRMSInputText
                                label='Annual Salary'
                                id={`experienceDetails.${index}.annualSalary`}
                                maxLength={15}
                                {...register(`experienceDetails.${index}.annualSalary`)}
                            />
                            <div className='md:col-span-2 lg:col-span-3'>
                                <Label>Organisation Address</Label>
                                <textarea
                                    id={`experienceDetails.${index}.organisationAddress`}
                                    maxLength={500}
                                    {...register(`experienceDetails.${index}.organisationAddress`)}
                                    className={cn(
                                        'min-h-[60px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                        errors.experienceDetails?.[index]?.organisationAddress
                                            ? 'border-destructive focus-visible:ring-destructive'
                                            : 'border-input focus-visible:ring-ring'
                                    )}
                                    placeholder='Enter organisation address...'
                                />
                                {errors.experienceDetails?.[index]?.organisationAddress && (
                                    <div className='font-medium text-[0.8rem] text-destructive'>
                                        {errors.experienceDetails[index]?.organisationAddress?.message}
                                    </div>
                                )}
                            </div>
                            <div className='md:col-span-2 lg:col-span-3'>
                                <Label>Reason For Leaving</Label>
                                <textarea
                                    id={`experienceDetails.${index}.reasonForLeaving`}
                                    maxLength={500}
                                    {...register(`experienceDetails.${index}.reasonForLeaving`)}
                                    className={cn(
                                        'min-h-[60px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                        errors.experienceDetails?.[index]?.reasonForLeaving
                                            ? 'border-destructive focus-visible:ring-destructive'
                                            : 'border-input focus-visible:ring-ring'
                                    )}
                                    placeholder='Enter reason for leaving...'
                                />
                                {errors.experienceDetails?.[index]?.reasonForLeaving && (
                                    <div className='font-medium text-[0.8rem] text-destructive'>
                                        {errors.experienceDetails[index]?.reasonForLeaving?.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} currentTab={currentTab} onPreviousTab={onPreviousTab} />
        </div>
    );
}
// Medical Record Tab Component
