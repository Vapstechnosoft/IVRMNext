'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeDropdownForAdvance, useModeOfPaymentDropdownForAdvance, useMonthDropdownForAdvance, useSaveSalaryAdvance, useYearDropdownForAdvance } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import type { SalaryAdvanceItem, SalaryAdvanceOnloadResponse, SalaryAdvanceSaveRequest } from '@/types/hrms/salary-advance';
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
    
    // Fetch dropdowns from API
    const { data: employeeData, isLoading: isLoadingEmployees } = useEmployeeDropdownForAdvance();
    const { data: monthData, isLoading: isLoadingMonths } = useMonthDropdownForAdvance();
    const { data: yearData, isLoading: isLoadingYears } = useYearDropdownForAdvance();
    const { data: modeOfPaymentData, isLoading: isLoadingModeOfPayment } = useModeOfPaymentDropdownForAdvance();
    
    // Transform Employee dropdown from { key, value } format
    const employeeOptions = useMemo(() => {
        const rawData = Array.isArray(employeeData) ? employeeData : (employeeData as any)?.data || [];
        return rawData.map((item: any) => {
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    HRME_Id: item.key,
                    HRME_EmployeeCode: item.value.split(' ')[0] || '',
                    HRME_EmployeeFirstName: item.value.split(' ')[0] || '',
                    HRME_EmployeeMiddleName: item.value.split(' ').slice(1, -1).join(' ') || '',
                    HRME_EmployeeLastName: item.value.split(' ').slice(-1)[0] || ''
                };
            }
            return item;
        });
    }, [employeeData]);
    
    // Transform Month dropdown from { key, value } format
    const monthOptions = useMemo(() => {
        const rawData = Array.isArray(monthData) ? monthData : (monthData as any)?.data || [];
        return rawData.map((item: any) => {
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value.trim(),
                    IVRM_Month_Id: item.key,
                    IVRM_Month_Name: item.value.trim()
                };
            }
            return item;
        });
    }, [monthData]);
    
    // Transform Year dropdown from { key, value } format
    const yearOptions = useMemo(() => {
        const rawData = Array.isArray(yearData) ? yearData : (yearData as any)?.data || [];
        return rawData.map((item: any) => {
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    HRMLY_Id: item.key,
                    HRMLY_LeaveYear: item.value
                };
            }
            return item;
        });
    }, [yearData]);
    
    // Transform Mode Of Payment dropdown from { key, value } format
    const modeOfPaymentOptions = useMemo(() => {
        const rawData = Array.isArray(modeOfPaymentData) ? modeOfPaymentData : (modeOfPaymentData as any)?.data || [];
        return rawData.map((item: any) => {
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    IVRMMOD_Id: item.key,
                    IVRMMOD_ModeOfPayment: item.value
                };
            }
            return item;
        });
    }, [modeOfPaymentData]);
    
    // Use transformed options
    const employees = employeeOptions;
    const months = monthOptions;
    const leaveYears = yearOptions;
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
            // Find the matching year and month from dropdowns to set the correct value
            const matchingYear = leaveYears.find((y: any) => 
                y.key === selectedRow.HRESA_AdvYear || y.HRMLY_Id === selectedRow.HRESA_AdvYear || y.value?.includes(selectedRow.HRESA_AdvYear.toString())
            );
            const matchingMonth = months.find((m: any) => 
                m.key === Number(selectedRow.HRESA_AdvMonth) || m.IVRM_Month_Id === Number(selectedRow.HRESA_AdvMonth)
            );
            const matchingMode = modeOfPayments.find((mode: any) => 
                mode.key === selectedRow.HRESA_ModeOfPayment || mode.IVRMMOD_ModeOfPayment === selectedRow.HRESA_ModeOfPayment
            );
            
            reset({
                employeeId: selectedRow.HRME_Id.toString(),
                entryDate: selectedRow.HRESA_EntryDate ? format(new Date(selectedRow.HRESA_EntryDate), 'yyyy-MM-dd') : '',
                advanceYear: matchingYear ? (matchingYear.key || matchingYear.HRMLY_Id) : selectedRow.HRESA_AdvYear.toString(),
                advanceMonth: matchingMonth ? (matchingMonth.key || matchingMonth.IVRM_Month_Id).toString() : selectedRow.HRESA_AdvMonth,
                appliedAmount: selectedRow.HRESA_AppliedAmount,
                remarks: selectedRow.HRESA_Remarks || '',
                modeOfPayment: matchingMode ? (matchingMode.key || matchingMode.IVRMMOD_ModeOfPayment) : selectedRow.HRESA_ModeOfPayment || '',
                referenceNo: selectedRow.HRESA_ReferenceNo || 0
            });
        }
    }, [selectedRow, reset, leaveYears, months, modeOfPayments]);
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
        if (!selectedRow) {
            toast.error('No row selected for update');
            return;
        }
        // Map selected values back to IDs/keys for API
        const selectedYear = leaveYears.find((y: any) => y.key === data.advanceYear || y.HRMLY_Id === data.advanceYear || y.value === data.advanceYear);
        const selectedMonth = months.find((m: any) => 
            String(m.key) === data.advanceMonth || String(m.IVRM_Month_Id) === data.advanceMonth || m.value === data.advanceMonth
        );
        const selectedMode = modeOfPayments.find((mode: any) => 
            mode.key === data.modeOfPayment || mode.IVRMMOD_ModeOfPayment === data.modeOfPayment || mode.value === data.modeOfPayment
        );
        
        const payload = {
            HRESA_Id: selectedRow.HRESA_Id,
            HRME_Id: Number(data.employeeId),
            HRESA_EntryDate: data.entryDate,
            HRESA_AdvYear: selectedYear ? (selectedYear.key || selectedYear.HRMLY_Id) : data.advanceYear,
            HRESA_AdvMonth: selectedMonth ? (selectedMonth.key || selectedMonth.IVRM_Month_Id).toString() : data.advanceMonth,
            HRESA_AppliedAmount: data.appliedAmount,
            HRESA_Remarks: data.remarks,
            HRESA_ActiveFlag: selectedRow.HRESA_ActiveFlag,
            HRESA_AdvStatus: selectedRow.HRESA_AdvStatus,
            HRESA_SanctinedAmount: selectedRow.HRESA_SanctinedAmount,
            HRESA_ModeOfPayment: selectedMode ? (selectedMode.key || selectedMode.IVRMMOD_ModeOfPayment) : data.modeOfPayment,
            HRESA_ReferenceNo: data.referenceNo,
        } as SalaryAdvanceSaveRequest;
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
                                        {employees.length > 0 ? (
                                            employees.map((emp: any) => (
                                                <SelectItem key={emp.key || emp.HRME_Id} value={(emp.key || emp.HRME_Id).toString()}>
                                                    {emp.value || `${emp.HRME_EmployeeCode || ''} - ${getEmployeeName(emp)}`.trim()}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>{isLoadingEmployees ? 'Loading employees...' : 'No employees available'}</div>
                                        )}
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
                                        {leaveYears.length > 0 ? (
                                            leaveYears.map((year: any) => (
                                                <SelectItem key={year.key || year.HRMLY_Id} value={year.key || year.HRMLY_Id}>
                                                    {year.value || year.HRMLY_LeaveYear}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>{isLoadingYears ? 'Loading years...' : 'No years available'}</div>
                                        )}
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
                                        {months.length > 0 ? (
                                            months.map((month: any) => (
                                                <SelectItem key={month.key || month.IVRM_Month_Id} value={(month.key || month.IVRM_Month_Id).toString()}>
                                                    {month.value || month.IVRM_Month_Name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>{isLoadingMonths ? 'Loading months...' : 'No months available'}</div>
                                        )}
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
                                        {modeOfPayments.length > 0 ? (
                                            modeOfPayments.map((mode: any) => (
                                                <SelectItem key={mode.key || mode.IVRMMOD_Id} value={mode.key || mode.IVRMMOD_ModeOfPayment || ''}>
                                                    {mode.value || mode.IVRMMOD_ModeOfPayment}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>{isLoadingModeOfPayment ? 'Loading payment modes...' : 'No payment modes available'}</div>
                                        )}
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
                    <div className='space-y-2'>
                    <Label>Remarks</Label>
                    <InputText placeholder='Enter remarks' {...register('remarks')} error={errors.remarks?.message} />
                    </div>
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
