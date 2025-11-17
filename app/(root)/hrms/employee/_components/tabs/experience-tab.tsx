'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

export function ExperienceTab({ control, register, errors, isSubmitting }: any) {
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
                            <InputText
                                label='Organisation Name'
                                id={`experienceDetails.${index}.organisationName`}
                                {...register(`experienceDetails.${index}.organisationName`)}
                            />

                            <InputText
                                label='Department'
                                id={`experienceDetails.${index}.department`}
                                {...register(`experienceDetails.${index}.department`)}
                            />

                            <InputText
                                label='Designation'
                                id={`experienceDetails.${index}.designation`}
                                {...register(`experienceDetails.${index}.designation`)}
                            />

                            <Controller
                                name={`experienceDetails.${index}.joinDate`}
                                control={control}
                                render={({ field }) => {
                                    const [open, setOpen] = useState(false);
                                    return (
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Join Date</Label>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='h-9 w-full justify-start text-left font-normal' type='button'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                field.onChange(format(date, 'yyyy-MM-dd'));
                                                                setOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    );
                                }}
                            />

                            <Controller
                                name={`experienceDetails.${index}.exitDate`}
                                control={control}
                                render={({ field }) => {
                                    const [open, setOpen] = useState(false);
                                    return (
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Exit Date</Label>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='h-9 w-full justify-start text-left font-normal' type='button'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                field.onChange(format(date, 'yyyy-MM-dd'));
                                                                setOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    );
                                }}
                            />

                            <InputText
                                label='No. Of Years'
                                id={`experienceDetails.${index}.noOfYears`}
                                {...register(`experienceDetails.${index}.noOfYears`)}
                            />

                            <InputText
                                label='No. Of Months'
                                id={`experienceDetails.${index}.noOfMonths`}
                                {...register(`experienceDetails.${index}.noOfMonths`)}
                            />

                            <InputText
                                label='Annual Salary'
                                id={`experienceDetails.${index}.annualSalary`}
                                {...register(`experienceDetails.${index}.annualSalary`)}
                            />

                            <div className='md:col-span-2 lg:col-span-3'>
                                <Label>Organisation Address</Label>
                                <textarea
                                    id={`experienceDetails.${index}.organisationAddress`}
                                    {...register(`experienceDetails.${index}.organisationAddress`)}
                                    className='min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                    placeholder='Enter organisation address...'
                                />
                            </div>

                            <div className='md:col-span-2 lg:col-span-3'>
                                <Label>Reason For Leaving</Label>
                                <textarea
                                    id={`experienceDetails.${index}.reasonForLeaving`}
                                    {...register(`experienceDetails.${index}.reasonForLeaving`)}
                                    className='min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                    placeholder='Enter reason for leaving...'
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
        </div>
    );
}

// Medical Record Tab Component
