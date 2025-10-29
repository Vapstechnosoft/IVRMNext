'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useSaveSalaryIncrement } from '@/hooks/hrms/useSalaryIncrement';
import { cn } from '@/lib/utils';
import { salaryIncrementSchema } from '@/schemas/hrms/salary-increment-schemas';
import type { SalaryIncrementOnloadResponse } from '@/types/hrms/salary-increment';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof salaryIncrementSchema>;

interface AddFormProps {
    onloadData: SalaryIncrementOnloadResponse | undefined;
    onSuccess: () => void;
    className?: string;
}

export default function AddSalaryIncrementForm({ onloadData, onSuccess, className = '' }: AddFormProps) {
    const { mutate: saveIncrement, isPending } = useSaveSalaryIncrement();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(salaryIncrementSchema),
        mode: 'onChange',
        defaultValues: {
            HREIC_Id: 0,
            MI_Id: HRMS_MI_ID,
            HRME_Id: 0,
            HRMED_Id: 0,
            HREIC_IncrementDate: new Date(),
            HREICED_Amount: 0,
            HREICED_Percentage: '',
            HREIC_ArrearApplicableFlg: false,
            HREIC_ArrearGivenFlg: false,
            HREIC_ArrearMonths: 0,
            HREIC_ActiveFlag: true,
            roleId: 2,
            UserId: 5
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = {
            ...data,
            HREIC_IncrementDate: data.HREIC_IncrementDate.toISOString()
        };

        saveIncrement(payload, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success(response.message || 'Salary increment added successfully');
                    reset();
                    onSuccess();
                } else {
                    toast.error(response?.message || 'Failed to add salary increment');
                }
            },
            onError: (error: any) => {
                toast.error(error.message || 'An error occurred');
            }
        });
    };

    const handleReset = () => {
        reset();
    };

    const employees = onloadData?.employeelist || [];
    const earningDeductions = onloadData?.earningdeductiontype || [];

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Employee */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRME_Id'>
                                Employee <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRME_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRME_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select employee' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.HRME_Id} value={String(emp.HRME_Id)}>
                                                    {emp.HRME_EmployeeCode} - {emp.HRME_EmployeeFirstName} {emp.HRME_EmployeeLastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRME_Id && <FormError>{errors.HRME_Id.message}</FormError>}
                        </div>

                        {/* Earning/Deduction Head */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMED_Id'>
                                Earning/Deduction Head <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRMED_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMED_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select head' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {earningDeductions.map((head) => (
                                                <SelectItem key={head.HRMED_Id} value={String(head.HRMED_Id)}>
                                                    {head.HRMED_Name} ({head.HRMED_EarnDedFlag})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMED_Id && <FormError>{errors.HRMED_Id.message}</FormError>}
                        </div>

                        {/* Increment Date */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HREIC_IncrementDate'>
                                Increment Date <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HREIC_IncrementDate'
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal transition-colors focus:ring-2 focus:ring-primary/20',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.HREIC_IncrementDate && <FormError>{errors.HREIC_IncrementDate.message}</FormError>}
                        </div>

                        {/* Amount */}
                        <InputNumber
                            label='Amount'
                            required
                            id='HREICED_Amount'
                            placeholder='Enter amount'
                            {...register('HREICED_Amount', { valueAsNumber: true })}
                            error={errors.HREICED_Amount?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Percentage */}
                        <InputText
                            label='Percentage'
                            id='HREICED_Percentage'
                            placeholder='e.g., 10%'
                            {...register('HREICED_Percentage')}
                            error={errors.HREICED_Percentage?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Arrear Months */}
                        <InputNumber
                            label='Arrear Months'
                            id='HREIC_ArrearMonths'
                            placeholder='Enter arrear months'
                            {...register('HREIC_ArrearMonths', { valueAsNumber: true })}
                            error={errors.HREIC_ArrearMonths?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Arrear Applicable */}
                        <div className='group flex flex-col gap-1.5'>
                            <div className='flex items-center space-x-3 rounded-md border p-4'>
                                <Controller
                                    name='HREIC_ArrearApplicableFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='HREIC_ArrearApplicableFlg' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='HREIC_ArrearApplicableFlg' className='cursor-pointer font-normal'>
                                    Arrear Applicable
                                </Label>
                            </div>
                            {errors.HREIC_ArrearApplicableFlg && <FormError>{errors.HREIC_ArrearApplicableFlg.message}</FormError>}
                        </div>

                        {/* Arrear Given */}
                        <div className='group flex flex-col gap-1.5'>
                            <div className='flex items-center space-x-3 rounded-md border p-4'>
                                <Controller
                                    name='HREIC_ArrearGivenFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='HREIC_ArrearGivenFlg' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='HREIC_ArrearGivenFlg' className='cursor-pointer font-normal'>
                                    Arrear Given
                                </Label>
                            </div>
                            {errors.HREIC_ArrearGivenFlg && <FormError>{errors.HREIC_ArrearGivenFlg.message}</FormError>}
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
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
                            Add Salary Increment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
