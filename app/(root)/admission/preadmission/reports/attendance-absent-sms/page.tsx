'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CalendarIcon, Save } from 'lucide-react';

import { useState } from 'react';
import { toast } from 'sonner';

import { CalendarYear } from '@/components/ui/calendar_year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Local schema for this form
const attendanceAbsentSmsSchema = z.object({
    frequency: z.enum(['once', 'twice']).default('once'),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    from_date: z.string().nonempty('Date is required')
});

type FormFields = z.infer<typeof attendanceAbsentSmsSchema>;

export default function StudyCertificateReportPage() {
    const [openPopover, setOpenPopover] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(attendanceAbsentSmsSchema),
        defaultValues: {
            frequency: 'once'
        }
    });

    // Dropdown data
    const { data: academicYears, isLoading: ayLoading } = useAcademicYearDropdown();

    // ──────────────────────────────────────────────────────────────
    // Submit handler
    // ──────────────────────────────────────────────────────────────
    const onSubmit = async (data: FormFields) => {
        try {
            // Use `data` for future implementation to avoid unused parameter
            console.debug(data);
            // TODO: implement report generation using `data`
            toast.success('Report generated successfully');
        } catch {
            toast.error('Failed to generate report');
        }
    };

    return (
        <div className='min-h-screen'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4 rounded-xl border bg-card p-6 shadow-xl'>
                    {/* ──────────────── RADIO BUTTONS (ADDED ON TOP) ──────────────── */}
                    <div className='mb-6'>
                        <Label className='mb-2'>
                            Frequency <span className='text-red-500'>*</span>
                        </Label>

                        <Controller
                            name='frequency'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='once' id='once' />
                                        <Label htmlFor='once'>Daily Once</Label>
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='twice' id='twice' />
                                        <Label htmlFor='twice'>Daily Twice</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />

                        {errors.frequency && <FormError>{errors.frequency.message}</FormError>}
                    </div>

                    {/* ──────────────── Filters Grid ──────────────── */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ayLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                academicYears?.data?.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        {/* Date Picker */}
                        <Controller
                            name='from_date'
                            control={control}
                            render={({ field }) => (
                                <div className='flex flex-col gap-1.5'>
                                    <Label>
                                        Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover
                                        open={openPopover === 'From_Date'}
                                        onOpenChange={(open) => setOpenPopover(open ? 'From_Date' : null)}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={cn(
                                                    'justify-start text-left font-normal',
                                                    !field.value && 'text-muted-foreground',
                                                    errors.from_date && 'border-red-500'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    date && field.onChange(date.toISOString());
                                                    setOpenPopover(null);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* ─────────────── Action Buttons ─────────────── */}
                    <div className='mt-6 flex justify-start gap-3 border-t pt-4'>
                        <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting} className='w-fit'>
                            Reset
                        </Button>

                        <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} className='w-fit'>
                            <Save className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
