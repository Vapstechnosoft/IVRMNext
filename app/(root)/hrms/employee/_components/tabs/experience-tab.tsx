'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HRMSDateField as DateField } from '@/app/(root)/hrms/_components/hrms-date-field';
import { Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

export function ExperienceTab({ control, register, errors, isSubmitting, onClear }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'experienceDetails'
    });

    const addEmptyRow = () => {
        append({} as any);
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                <h3 className='font-semibold'>PREVIOUS EMPLOYMENT DETAILS</h3>
                <Button type='button' size='sm' variant='secondary' onClick={addEmptyRow}>
                    <Plus className='mr-1 h-4 w-4' /> Add Experience
                </Button>
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
                                <Button type='button' variant='ghost' size='sm' onClick={() => remove(index)}>
                                    <Trash2 className='mr-1 h-4 w-4' /> Remove
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
                                label='Designation'
                                id={`experienceDetails.${index}.designation`}
                                maxLength={100}
                                {...register(`experienceDetails.${index}.designation`)}
                            />

                            <Controller
                                name={`experienceDetails.${index}.joinDate`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Join Date'
                                        placeholder='Pick join date'
                                    />
                                )}
                            />

                            <Controller
                                name={`experienceDetails.${index}.exitDate`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Exit Date'
                                        placeholder='Pick exit date'
                                    />
                                )}
                            />

                            <HRMSInputText
                                label='No. Of Years'
                                id={`experienceDetails.${index}.noOfYears`}
                                {...register(`experienceDetails.${index}.noOfYears`)}
                            />

                            <HRMSInputText
                                label='No. Of Months'
                                id={`experienceDetails.${index}.noOfMonths`}
                                {...register(`experienceDetails.${index}.noOfMonths`)}
                            />

                            <HRMSInputText
                                label='Annual Salary'
                                id={`experienceDetails.${index}.annualSalary`}
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

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}

// Medical Record Tab Component
