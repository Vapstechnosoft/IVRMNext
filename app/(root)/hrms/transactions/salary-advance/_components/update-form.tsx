'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveSalaryAdvance } from '@/hooks/hrms/useSalaryAdvance';
import { cn } from '@/lib/utils';
import { salaryAdvanceSchema } from '@/schemas/hrms/salary-advance-schemas';
import type { SalaryAdvanceItem, SalaryAdvanceOnloadResponse } from '@/types/hrms/salary-advance';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof salaryAdvanceSchema>;

interface UpdateFormProps {
    selectedRow: SalaryAdvanceItem;
    onloadData: SalaryAdvanceOnloadResponse | undefined;
    onSuccess: () => void;
    className?: string;
}

export default function UpdateSalaryAdvanceForm({ selectedRow, onloadData, onSuccess, className = '' }: UpdateFormProps) {
    const { mutate: saveAdvance, isPending } = useSaveSalaryAdvance();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(salaryAdvanceSchema),
        mode: 'onChange',
        defaultValues: {
            HRESA_Id: 0,
            MI_Id: 30,
            HRME_Id: 0,
            HRESA_EntryDate: new Date(),
            HRESA_AdvYear: new Date().getFullYear(),
            HRESA_AdvMonth: '',
            HRESA_AppliedAmount: 0,
            HRESA_SanctinedAmount: 0,
            HRESA_Remarks: '',
            HRESA_AdvStatus: 'Pending',
            HRESA_ModeOfPayment: '',
            HRESA_ReferenceNo: 0,
            HRESA_ActiveFlag: true,
            roleId: 2
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRESA_Id: selectedRow.HRESA_Id,
                MI_Id: selectedRow.MI_Id || 30,
                HRME_Id: selectedRow.HRME_Id,
                HRESA_EntryDate: selectedRow.HRESA_EntryDate ? new Date(selectedRow.HRESA_EntryDate) : new Date(),
                HRESA_AdvYear: selectedRow.HRESA_AdvYear,
                HRESA_AdvMonth: selectedRow.HRESA_AdvMonth,
                HRESA_AppliedAmount: selectedRow.HRESA_AppliedAmount,
                HRESA_SanctinedAmount: selectedRow.HRESA_SanctinedAmount,
                HRESA_Remarks: selectedRow.HRESA_Remarks || '',
                HRESA_AdvStatus: selectedRow.HRESA_AdvStatus,
                HRESA_ModeOfPayment: selectedRow.HRESA_ModeOfPayment,
                HRESA_ReferenceNo: selectedRow.HRESA_ReferenceNo || 0,
                HRESA_ActiveFlag: selectedRow.HRESA_ActiveFlag,
                roleId: 2
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = {
            ...data,
            HRESA_EntryDate: data.HRESA_EntryDate.toISOString()
        };

        saveAdvance(payload, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success(response.message || 'Salary advance updated successfully');
                    onSuccess();
                } else {
                    toast.error(response?.message || 'Failed to update salary advance');
                }
            },
            onError: (error: any) => {
                toast.error(error.message || 'An error occurred');
            }
        });
    };

    const employees = onloadData?.employeedropdown || [];
    const months = onloadData?.monthdropdown || [];
    const paymentModes = onloadData?.modeOfPaymentdropdown || [];
    const statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
    ];

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

                        {/* Year */}
                        <InputNumber
                            label='Year'
                            required
                            id='HRESA_AdvYear'
                            placeholder='Enter year'
                            {...register('HRESA_AdvYear', { valueAsNumber: true })}
                            error={errors.HRESA_AdvYear?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Month */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRESA_AdvMonth'>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRESA_AdvMonth'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='HRESA_AdvMonth' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name}>
                                                    {month.IVRM_Month_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRESA_AdvMonth && <FormError>{errors.HRESA_AdvMonth.message}</FormError>}
                        </div>

                        {/* Applied Amount */}
                        <InputNumber
                            label='Applied Amount'
                            required
                            id='HRESA_AppliedAmount'
                            placeholder='Enter applied amount'
                            {...register('HRESA_AppliedAmount', { valueAsNumber: true })}
                            error={errors.HRESA_AppliedAmount?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Sanctioned Amount */}
                        <InputNumber
                            label='Sanctioned Amount'
                            id='HRESA_SanctinedAmount'
                            placeholder='Enter sanctioned amount'
                            {...register('HRESA_SanctinedAmount', { valueAsNumber: true })}
                            error={errors.HRESA_SanctinedAmount?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Status */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRESA_AdvStatus'>
                                Status <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRESA_AdvStatus'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='HRESA_AdvStatus'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRESA_AdvStatus && <FormError>{errors.HRESA_AdvStatus.message}</FormError>}
                        </div>

                        {/* Mode of Payment */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRESA_ModeOfPayment'>
                                Mode of Payment <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRESA_ModeOfPayment'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='HRESA_ModeOfPayment'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select mode' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentModes.map((mode) => (
                                                <SelectItem key={mode.value} value={mode.value}>
                                                    {mode.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRESA_ModeOfPayment && <FormError>{errors.HRESA_ModeOfPayment.message}</FormError>}
                        </div>

                        {/* Reference No */}
                        <InputNumber
                            label='Reference Number'
                            id='HRESA_ReferenceNo'
                            placeholder='Enter reference number'
                            {...register('HRESA_ReferenceNo', { valueAsNumber: true })}
                            error={errors.HRESA_ReferenceNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Entry Date */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRESA_EntryDate'>
                                Entry Date <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRESA_EntryDate'
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
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.HRESA_EntryDate && <FormError>{errors.HRESA_EntryDate.message}</FormError>}
                        </div>

                        {/* Remarks */}
                        <div className='col-span-full'>
                            <InputText
                                label='Remarks'
                                id='HRESA_Remarks'
                                placeholder='Enter remarks (optional)'
                                {...register('HRESA_Remarks')}
                                error={errors.HRESA_Remarks?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onSuccess}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Salary Advance
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
