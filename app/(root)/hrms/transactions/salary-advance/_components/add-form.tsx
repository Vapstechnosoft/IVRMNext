'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeDropdownForAdvance, useModeOfPaymentDropdownForAdvance, useMonthDropdownForAdvance, useSaveSalaryAdvance, useYearDropdownForAdvance } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import { hrmsTransactionSchemas } from '@/schemas/hrms/transaction';
import type { SalaryAdvanceOnloadResponse, SalaryAdvanceSaveRequest } from '@/types/hrms/salary-advance';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type SalaryAdvanceForm = z.infer<typeof hrmsTransactionSchemas.salaryAdvance.form>;
interface AddFormProps {
    onloadData: SalaryAdvanceOnloadResponse | undefined;
    onSuccess: () => void;
    className?: string;
}
export default function AddSalaryAdvanceForm({ onloadData, onSuccess, className = '' }: AddFormProps) {
    const { mutate: saveAdvance, isPending } = useSaveSalaryAdvance();
    
    // Fetch dropdowns from API
    const { data: employeeData, isLoading: isLoadingEmployees } = useEmployeeDropdownForAdvance();
    const { data: monthData, isLoading: isLoadingMonths } = useMonthDropdownForAdvance();
    const { data: yearData, isLoading: isLoadingYears } = useYearDropdownForAdvance();
    const { data: modeOfPaymentData, isLoading: isLoadingModeOfPayment } = useModeOfPaymentDropdownForAdvance();
    
    // Transform Employee dropdown from { key, value } format
    const employeeOptions = useMemo(() => {
        const rawData = Array.isArray(employeeData) ? employeeData : (employeeData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility
                    HRME_Id: item.key,
                    HRME_EmployeeCode: item.value.split(' ')[0] || '',
                    HRME_EmployeeFirstName: item.value.split(' ')[0] || '',
                    HRME_EmployeeMiddleName: item.value.split(' ').slice(1, -1).join(' ') || '',
                    HRME_EmployeeLastName: item.value.split(' ').slice(-1)[0] || ''
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [employeeData]);
    
    // Transform Month dropdown from { key, value } format
    const monthOptions = useMemo(() => {
        const rawData = Array.isArray(monthData) ? monthData : (monthData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: (item.value || '').trim(),
                    // For backward compatibility
                    IVRM_Month_Id: item.key,
                    IVRM_Month_Name: (item.value || '').trim()
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [monthData]);
    
    // Transform Year dropdown from { key, value } format
    const yearOptions = useMemo(() => {
        const rawData = Array.isArray(yearData) ? yearData : (yearData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility
                    HRMLY_Id: item.key,
                    HRMLY_LeaveYear: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [yearData]);
    
    // Transform Mode Of Payment dropdown from { key, value } format
    const modeOfPaymentOptions = useMemo(() => {
        const rawData = Array.isArray(modeOfPaymentData) ? modeOfPaymentData : (modeOfPaymentData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility
                    IVRMMOD_Id: item.key,
                    IVRMMOD_ModeOfPayment: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [modeOfPaymentData]);
    
    // Use transformed options
    const employees = employeeOptions;
    const leaveYears = yearOptions;
    const months = monthOptions;
    const modeOfPayments = modeOfPaymentOptions;
    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<SalaryAdvanceForm>({
        resolver: zodResolver(hrmsTransactionSchemas.salaryAdvance.form),
        mode: 'onChange',
        defaultValues: {
            employeeId: '',
            entryDate: '',
            advanceYear: '',
            advanceMonth: '',
            appliedAmount: 0,
            remarks: '',
            modeOfPayment: '',
            referenceNo: ''
        }
    });
    const watchedEntryDate = watch('entryDate');
    // Auto-select year and month based on entry date
    useEffect(() => {
        if (watchedEntryDate) {
            try {
                const entryDate = new Date(watchedEntryDate);
                if (!Number.isNaN(entryDate.getTime())) {
                    const year = entryDate.getFullYear();
                    const month = entryDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
                    
                    // Find matching year - API sends { key: "2020-2021", value: "2020-2021" }
                    // Match by checking if the value contains the year
                    const matchingYear = leaveYears.find((y: any) => 
                        y.value?.includes(year.toString()) || y.key?.includes(year.toString())
                    );
                    if (matchingYear) {
                        setValue('advanceYear', matchingYear.key || matchingYear.HRMLY_Id);
                    }
                    
                    // Find matching month - API sends { key: 1, value: "January " }
                    // Match by key (month number 1-12)
                    const matchingMonth = months.find((m: any) => 
                        m.key === month || m.IVRM_Month_Id === month
                    );
                    if (matchingMonth) {
                        setValue('advanceMonth', (matchingMonth.key || matchingMonth.IVRM_Month_Id).toString());
                    }
                }
            } catch (_error) {
                // Silently handle date parsing errors
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedEntryDate, leaveYears, months]);
    const onSubmit: SubmitHandler<SalaryAdvanceForm> = async (data: SalaryAdvanceForm) => {
        // Convert referenceNo to number if it's a valid numeric string, otherwise use 0
        const referenceNoValue =
            data.referenceNo && /^\d+$/.test(data.referenceNo)
                ? Number(data.referenceNo)
                : data.referenceNo
                  ? Number(data.referenceNo) || 0
                  : 0;
        const payload = {
            HRESA_Id: 0,
            HRME_Id: Number(data.employeeId),
            HRESA_EntryDate: data.entryDate,
            HRESA_AdvYear: Number(data.advanceYear),
            HRESA_AdvMonth: data.advanceMonth,
            HRESA_AppliedAmount: data.appliedAmount,
            HRESA_Remarks: data.remarks || '',
            HRESA_ActiveFlag: true,
            HRESA_AdvStatus: 'Pending',
            HRESA_SanctinedAmount: 0,
            HRESA_ModeOfPayment: data.modeOfPayment,
            HRESA_ReferenceNo: referenceNoValue,
        } as SalaryAdvanceSaveRequest;
        saveAdvance(payload, {
            onSuccess: () => {
                toast.success('Salary advance created successfully!');
                reset();
                onSuccess();
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to create salary advance');
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
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Employee' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp: any) => (
                                            <SelectItem key={emp.key || emp.HRME_Id} value={(emp.key || emp.HRME_Id).toString()}>
                                                {emp.value || `${emp.HRME_EmployeeCode || ''} - ${getEmployeeName(emp)}`}
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
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveYears.map((year: any) => (
                                            <SelectItem key={year.key || year.HRMLY_Id} value={(year.key || year.HRMLY_Id).toString()}>
                                                {year.value || year.HRMLY_LeaveYear}
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
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Month' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month: any) => (
                                            <SelectItem key={month.key || month.IVRM_Month_Id} value={(month.key || month.IVRM_Month_Id).toString()}>
                                                {month.value || month.IVRM_Month_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.advanceMonth && <FormError>{errors.advanceMonth.message}</FormError>}
                    </div>
                    <div className='space-y-2'>
                        <Label>Advanced Amount *</Label>
                        <InputText
                            type='number'
                            step='0.01'
                            placeholder='Enter advanced amount (max 10 digits including decimals)'
                            {...register('appliedAmount', { valueAsNumber: true })}
                            error={errors.appliedAmount?.message}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Mode of Payment *</Label>
                        <Controller
                            name='modeOfPayment'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Payment Mode' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modeOfPayments.map((mode: any) => (
                                            <SelectItem key={mode.key || mode.IVRMMOD_Id} value={mode.key || mode.IVRMMOD_Id || ''}>
                                                {mode.value || mode.IVRMMOD_ModeOfPayment}
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
                            placeholder='Enter reference number (alphanumeric, max 255 characters)'
                            {...register('referenceNo')}
                            error={errors.referenceNo?.message}
                        />
                    </div>
                    <div className='space-y-2 '>
                    <Label>Remarks</Label>
                    <InputText placeholder='Enter remarks (max 255 characters)' {...register('remarks')} error={errors.remarks?.message} />
                </div>
                </div>
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => reset()}
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
                            Add Salary Advance
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
