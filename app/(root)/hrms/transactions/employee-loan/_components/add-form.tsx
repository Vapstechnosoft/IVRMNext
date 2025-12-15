'use client';
import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeDropdownForLoan, useLoanTypeDropdownForLoan, useModeOfPaymentDropdownForLoan, useSaveEmployeeLoan } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import { hrmsTransactionSchemas } from '@/schemas/hrms/transaction';
import type { EmployeeLoanOnloadResponse } from '@/types/hrms/employee-loan';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type EmployeeLoanForm = z.infer<typeof hrmsTransactionSchemas.employeeLoan.form>;
interface AddFormProps {
    onloadData: EmployeeLoanOnloadResponse | undefined;
    onSuccess: () => void;
    className?: string;
}
export default function AddEmployeeLoanForm({ onloadData, onSuccess, className = '' }: AddFormProps) {
    const { mutate: saveLoan, isPending } = useSaveEmployeeLoan();
    
    // Fetch dropdowns from API
    const { data: employeeData, isLoading: isLoadingEmployees } = useEmployeeDropdownForLoan();
    const { data: loanTypeData, isLoading: isLoadingLoanTypes } = useLoanTypeDropdownForLoan();
    const { data: modeOfPaymentData, isLoading: isLoadingModeOfPayment } = useModeOfPaymentDropdownForLoan();
    
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
    
    // Transform Loan Type dropdown from { key, value } format
    const loanTypeOptions = useMemo(() => {
        const rawData = Array.isArray(loanTypeData) ? loanTypeData : (loanTypeData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility
                    HRMLN_Id: item.key,
                    HRML_LoanType: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [loanTypeData]);
    
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
    const loanTypes = loanTypeOptions;
    const paymentModes = modeOfPaymentOptions;
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeLoanForm>({
        resolver: zodResolver(hrmsTransactionSchemas.employeeLoan.form),
        mode: 'onChange',
        defaultValues: {
            employeeId: 0,
            loanTypeId: 0,
            amount: 0,
            installments: 0,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            modeOfPayment: '',
            referenceNo: '',
            loanInterest: 0,
            loanEMI: 0
        }
    });
    // Watch employeeId to enable/disable loan fields
    const watchedEmployeeId = useWatch({
        control,
        name: 'employeeId',
        defaultValue: 0
    });
    const isEmployeeSelected = watchedEmployeeId && watchedEmployeeId > 0;
    const onSubmit: SubmitHandler<EmployeeLoanForm> = async (data: EmployeeLoanForm) => {
        const loanData = {
            HREL_Id: 0,
            MI_Id: 0,
            HRME_Id: data.employeeId,
            HREL_AppliedDate: data.startDate,
            HREL_EmpLoanId: '',
            HRMLN_Id: data.loanTypeId,
            HREL_LoanAmount: data.amount,
            HREL_LoanInsallments: data.installments,
            HREL_LaonEMI: data.loanEMI || 0,
            HREL_LoanInterest: data.loanInterest || 0,
            HREL_ModeOfPayment: data.modeOfPayment || '',
            HREL_ReferenceNo: data.referenceNo || 0,
            ASMAY_Id: 0
        };
        saveLoan(loanData, {
            onSuccess: () => {
                toast.success('Employee loan created successfully!');
                reset();
                onSuccess();
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to create employee loan');
            }
        });
    };
    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <Controller
                        name='employeeId'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Employee *</Label>
                                <Select
                                    onValueChange={(value) => {
                                        // Find the employee by the selected value (name) and get its ID (key)
                                        const selectedEmployee = employees.find((emp: any) => 
                                            emp.value === value || String(emp.key) === value || String(emp.HRME_Id) === value
                                        );
                                        field.onChange(selectedEmployee?.key || selectedEmployee?.HRME_Id || Number(value));
                                    }}
                                    value={
                                        field.value && field.value > 0
                                            ? (() => {
                                                  const selectedEmployee = employees.find(
                                                      (emp: any) => emp.key === field.value || emp.HRME_Id === field.value
                                                  );
                                                  return selectedEmployee ? (selectedEmployee.value || `${selectedEmployee.HRME_EmployeeCode || ''} - ${selectedEmployee.HRME_EmployeeFirstName || ''} ${selectedEmployee.HRME_EmployeeMiddleName || ''} ${selectedEmployee.HRME_EmployeeLastName || ''}`.trim()) : '';
                                              })()
                                            : ''
                                    }>
                                    <SelectTrigger
                                        className={cn(
                                            'transition-colors focus:ring-2 focus:ring-primary/20',
                                            errors.employeeId && 'border-destructive'
                                        )}>
                                        <SelectValue placeholder={isLoadingEmployees ? 'Loading employees...' : 'Select or search Employee in the list'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.length > 0 ? (
                                            employees
                                                .filter((emp: any) => (emp?.key || emp?.HRME_Id) != null)
                                                .map((employee: any) => (
                                                    <SelectItem key={employee.key || employee.HRME_Id} value={employee.value || `${employee.HRME_EmployeeCode || ''} - ${employee.HRME_EmployeeFirstName || ''} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim()}>
                                                        {employee.value || `${employee.HRME_EmployeeCode || ''} - ${employee.HRME_EmployeeFirstName || ''} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim()}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>{isLoadingEmployees ? 'Loading employees...' : 'No employees available'}</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.employeeId && <FormError>{errors.employeeId.message}</FormError>}
                            </div>
                        )}
                    />
                    <div className='space-y-2'>
                        <Label>Applied Date *</Label>
                        <Controller
                            name='startDate'
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
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <CalendarYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.startDate && <FormError>{errors.startDate.message}</FormError>}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Loan Type *</Label>
                        <Select
                            onValueChange={(value) => {
                                // Find the loan type by the selected value (name) and get its ID (key)
                                const selectedLoanType = loanTypes.find((lt: any) => 
                                    lt.value === value || String(lt.key) === value || String(lt.HRMLN_Id) === value
                                );
                                setValue('loanTypeId', selectedLoanType?.key || selectedLoanType?.HRMLN_Id || Number(value));
                            }}
                            value={
                                watch('loanTypeId') && watch('loanTypeId') > 0
                                    ? (() => {
                                          const selectedLoanType = loanTypes.find(
                                              (lt: any) => lt.key === watch('loanTypeId') || lt.HRMLN_Id === watch('loanTypeId')
                                          );
                                          return selectedLoanType ? (selectedLoanType.value || selectedLoanType.HRML_LoanType || '') : '';
                                      })()
                                    : ''
                            }>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingLoanTypes ? 'Loading loan types...' : 'Select Loan Type'} />
                            </SelectTrigger>
                            <SelectContent>
                                {loanTypes && loanTypes.length > 0 ? (
                                    loanTypes
                                        .filter((type: any) => type && (type.key !== undefined || type.HRMLN_Id !== undefined))
                                        .map((loanType: any) => (
                                            <SelectItem key={loanType.key || loanType.HRMLN_Id} value={loanType.value || loanType.HRML_LoanType || ''}>
                                                {loanType.value || loanType.HRML_LoanType || ''}
                                            </SelectItem>
                                        ))
                                ) : (
                                    <div className='p-2 text-muted-foreground text-sm'>
                                        {isLoadingLoanTypes ? 'Loading loan types...' : 'No loan types available'}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.loanTypeId && <FormError>{errors.loanTypeId.message}</FormError>}
                    </div>
                    <Controller
                        name='modeOfPayment'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Mode Of Payment *</Label>
                                <Select
                                    onValueChange={(value) => {
                                        // Find the mode of payment by the selected value (name) and get its key
                                        const selectedMode = paymentModes.find((mode: any) => 
                                            mode.value === value || mode.key === value || mode.IVRMMOD_ModeOfPayment === value
                                        );
                                        field.onChange(selectedMode?.key || selectedMode?.IVRMMOD_ModeOfPayment || value);
                                    }}
                                    value={
                                        field.value
                                            ? (() => {
                                                  const selectedMode = paymentModes.find(
                                                      (mode: any) => mode.key === field.value || mode.IVRMMOD_ModeOfPayment === field.value
                                                  );
                                                  return selectedMode ? (selectedMode.value || selectedMode.IVRMMOD_ModeOfPayment || '') : field.value;
                                              })()
                                            : ''
                                    }>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingModeOfPayment ? 'Loading payment modes...' : '--Select--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentModes
                                            .filter((mode: any) => (mode?.key || mode?.IVRMMOD_Id) != null && (mode?.value || mode?.IVRMMOD_ModeOfPayment))
                                            .map((mode: any) => (
                                                <SelectItem key={mode.key || mode.IVRMMOD_Id} value={mode.value || mode.IVRMMOD_ModeOfPayment || ''}>
                                                    {mode.value || mode.IVRMMOD_ModeOfPayment || ''}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.modeOfPayment && <FormError>{errors.modeOfPayment.message}</FormError>}
                            </div>
                        )}
                    />
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <Controller
                        name='referenceNo'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Reference No.</Label>
                                <InputText
                                    id='referenceNo'
                                    placeholder='Enter reference number (max 20 characters, numbers only)'
                                    {...field}
                                    error={errors.referenceNo?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        )}
                    />
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Loan Amount *</Label>
                        <InputText
                            type='number'
                            id='amount'
                            step='0.01'
                            placeholder='Enter loan amount (max 10 digits including decimals)'
                            {...register('amount', { valueAsNumber: true })}
                            error={errors.amount?.message}
                            disabled={!isEmployeeSelected}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Loan Interest *</Label>
                        <InputText
                            type='number'
                            id='loanInterest'
                            step='0.01'
                            placeholder='Enter loan interest (max 5 digits including decimals)'
                            {...register('loanInterest', { valueAsNumber: true })}
                            error={errors.loanInterest?.message}
                            disabled={!isEmployeeSelected}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Loan Installments (IN MONTHS) *</Label>
                        <InputText
                            type='number'
                            id='installments'
                            placeholder='Enter loan installments (max 4 digits)'
                            {...register('installments', { valueAsNumber: true })}
                            error={errors.installments?.message}
                            disabled={!isEmployeeSelected}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Loan EMI *</Label>
                        <InputText
                            type='number'
                            id='loanEMI'
                            step='0.01'
                            placeholder='Enter loan EMI (max 10 digits including decimals)'
                            {...register('loanEMI', { valueAsNumber: true })}
                            error={errors.loanEMI?.message}
                            disabled={!isEmployeeSelected}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
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
                            Add Employee Loan
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
