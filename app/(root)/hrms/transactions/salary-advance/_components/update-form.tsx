'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useSaveSalaryAdvance } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import type { SalaryAdvanceItem, SalaryAdvanceOnloadResponse } from '@/types/hrms/salary-advance';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SalaryAdvanceForm {
    employeeId: string;
    entryDate: string;
    advanceYear: string;
    advanceMonth: string;
    appliedAmount: number;
    remarks: string;
    modeOfPayment: string;
    referenceNo: number;
}

interface UpdateFormProps {
    selectedRow: SalaryAdvanceItem | null;
    onloadData: SalaryAdvanceOnloadResponse | undefined;
    onSuccess: () => void;
    className?: string;
}

export default function UpdateSalaryAdvanceForm({ selectedRow, onloadData, onSuccess, className = '' }: UpdateFormProps) {
    const { mutate: saveAdvance, isPending } = useSaveSalaryAdvance();

    // Memoize arrays to prevent unnecessary re-renders
    const employees = useMemo(() => onloadData?.employeedropdown || [], [onloadData?.employeedropdown]);
    const leaveYears = useMemo(() => onloadData?.leaveyeardropdown || [], [onloadData?.leaveyeardropdown]);
    const months = useMemo(() => onloadData?.monthdropdown || [], [onloadData?.monthdropdown]);
    const modeOfPayments = useMemo(() => onloadData?.modeOfPaymentdropdown || [], [onloadData?.modeOfPaymentdropdown]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<SalaryAdvanceForm>({
        mode: 'onChange',
        defaultValues: {
            employeeId: '',
            entryDate: '',
            advanceYear: '',
            advanceMonth: '',
            appliedAmount: 0,
            remarks: '',
            modeOfPayment: '',
            referenceNo: 0
        }
    });

    const watchedEntryDate = watch('entryDate');

    useEffect(() => {
        if (selectedRow) {
            reset({
                employeeId: selectedRow.HRME_Id.toString(),
                entryDate: selectedRow.HRESA_EntryDate ? format(new Date(selectedRow.HRESA_EntryDate), 'yyyy-MM-dd') : '',
                advanceYear: selectedRow.HRESA_AdvYear.toString(),
                advanceMonth: selectedRow.HRESA_AdvMonth,
                appliedAmount: selectedRow.HRESA_AppliedAmount,
                remarks: selectedRow.HRESA_Remarks || '',
                modeOfPayment: selectedRow.HRESA_ModeOfPayment || '',
                referenceNo: selectedRow.HRESA_ReferenceNo || 0
            });
        }
    }, [selectedRow, reset]);

    // Auto-select year and month based on entry date
    useEffect(() => {
        if (watchedEntryDate) {
            try {
                const entryDate = new Date(watchedEntryDate);
                if (!isNaN(entryDate.getTime())) {
                    const year = entryDate.getFullYear();
                    const month = entryDate.getMonth() + 1; // getMonth() returns 0-11, so add 1

                    // Find matching year from leaveYears dropdown
                    const matchingYear = leaveYears.find((y) => y.HRMLY_LeaveYear === year.toString() || y.HRMLY_LeaveYear === String(year));
                    if (matchingYear) {
                        setValue('advanceYear', matchingYear.HRMLY_Id.toString());
                    }

                    // Find matching month from months dropdown
                    // Try to match by month number (1-12) or by month name
                    const monthNames = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                    ];
                    const monthName = monthNames[month - 1];

                    const matchingMonth = months.find((m) => {
                        // Try matching by month name (case insensitive)
                        const monthNameMatch = m.IVRM_Month_Name?.toLowerCase() === monthName.toLowerCase() ||
                            m.IVRM_Month_Name?.toLowerCase().includes(monthName.toLowerCase().substring(0, 3));
                        
                        // Try matching by month number if IVRM_Month_Id matches the month number
                        const monthIdMatch = m.IVRM_Month_Id === month;
                        
                        return monthNameMatch || monthIdMatch;
                    });

                    if (matchingMonth) {
                        setValue('advanceMonth', matchingMonth.IVRM_Month_Id.toString());
                    }
                }
            } catch (error) {
                // Silently handle date parsing errors
                console.error('Error parsing entry date:', error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedEntryDate, leaveYears, months]);

    const onSubmit: SubmitHandler<SalaryAdvanceForm> = async (data: SalaryAdvanceForm) => {
        if (!selectedRow) {
            toast.error('No row selected for update');
            return;
        }

        const payload = {
            HRESA_Id: selectedRow.HRESA_Id,
            MI_Id: HRMS_MI_ID,
            HRME_Id: Number(data.employeeId),
            HRESA_EntryDate: data.entryDate,
            HRESA_AdvYear: Number(data.advanceYear),
            HRESA_AdvMonth: data.advanceMonth,
            HRESA_AppliedAmount: data.appliedAmount,
            HRESA_Remarks: data.remarks,
            HRESA_ActiveFlag: selectedRow.HRESA_ActiveFlag,
            HRESA_AdvStatus: selectedRow.HRESA_AdvStatus,
            HRESA_SanctinedAmount: selectedRow.HRESA_SanctinedAmount,
            HRESA_ModeOfPayment: data.modeOfPayment,
            HRESA_ReferenceNo: data.referenceNo,
            roleId: 2
        };

        saveAdvance(payload, {
            onSuccess: () => {
                toast.success('Salary advance updated successfully!');
                onSuccess();
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to update salary advance');
            }
        });
    };

    const getEmployeeName = (employee: any) => {
        return `${employee.HRME_EmployeeFirstName} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim();
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Employee *</Label>
                        <Controller
                            name='employeeId'
                            control={control}
                            rules={{ required: 'Please select an employee' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Employee' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.HRME_Id} value={emp.HRME_Id.toString()}>
                                                {emp.HRME_EmployeeCode} - {getEmployeeName(emp)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.employeeId && <FormError>{errors.employeeId.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Entry Date *</Label>
                        <Controller
                            name='entryDate'
                            control={control}
                            rules={{ required: 'Please select entry date' }}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date: Date | undefined) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.entryDate && <FormError>{errors.entryDate.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Advance Year *</Label>
                        <Controller
                            name='advanceYear'
                            control={control}
                            rules={{ required: 'Please select advance year' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveYears.map((year) => (
                                            <SelectItem key={year.HRMLY_Id} value={year.HRMLY_Id.toString()}>
                                                {year.HRMLY_LeaveYear}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.advanceYear && <FormError>{errors.advanceYear.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Advance Month *</Label>
                        <Controller
                            name='advanceMonth'
                            control={control}
                            rules={{ required: 'Please select advance month' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Month' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Id.toString()}>
                                                {month.IVRM_Month_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.advanceMonth && <FormError>{errors.advanceMonth.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Applied Amount *</Label>
                        <InputText
                            type='number'
                            step='any'
                            placeholder='Enter amount'
                            {...register('appliedAmount', {
                                required: 'Please enter applied amount',
                                min: {
                                    value: 1,
                                    message: 'Amount must be greater than 0'
                                }
                            })}
                            error={errors.appliedAmount?.message}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>Mode of Payment *</Label>
                        <Controller
                            name='modeOfPayment'
                            control={control}
                            rules={{ required: 'Please select mode of payment' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Payment Mode' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modeOfPayments.map((mode) => (
                                            <SelectItem key={mode.IVRMMOD_Id} value={mode.IVRMMOD_Id.toString()}>
                                                {mode.IVRMMOD_ModeOfPayment}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.modeOfPayment && <FormError>{errors.modeOfPayment.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Reference No</Label>
                        <InputText
                            type='number'
                            placeholder='Enter reference number'
                            {...register('referenceNo', { valueAsNumber: true })}
                            error={errors.referenceNo?.message}
                        />
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label>Remarks</Label>
                    <InputText placeholder='Enter remarks' {...register('remarks')} error={errors.remarks?.message} />
                </div>

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
