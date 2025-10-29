'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useSaveEmployeeLoan } from '@/hooks/hrms/useEmployeeLoan';
import { cn } from '@/lib/utils';
import { employeeLoanSchema } from '@/schemas/hrms/employee-loan-schemas';
import type { EmployeeLoanOnloadResponse } from '@/types/hrms/employee-loan';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeLoanSchema>;

interface AddFormProps {
    onloadData: EmployeeLoanOnloadResponse | undefined;
    onSuccess: () => void;
    className?: string;
}

export default function AddEmployeeLoanForm({ onloadData, onSuccess, className = '' }: AddFormProps) {
    const { mutate: saveLoan, isPending } = useSaveEmployeeLoan();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeLoanSchema),
        mode: 'onChange',
        defaultValues: {
            HREL_Id: 0,
            MI_Id: HRMS_MI_ID,
            HRME_Id: 0,
            HRMLN_Id: 0,
            HREL_AppliedDate: new Date(),
            HREL_LoanAmount: 0,
            HREL_LoanInsallments: 1,
            HREL_LaonEMI: 0,
            HREL_SanctionedAmount: 0,
            HREL_LoanStatus: 'Pending',
            HREL_LoanInterest: 0,
            HREL_ModeOfPayment: '',
            HREL_ReferenceNo: '',
            HREL_NoofInstallment: 1,
            HREL_TotalPrincipalPaid: 0,
            HREL_TotalInterestPaid: 0,
            HREL_TotalPending: 0,
            HREL_ActiveFlag: true,
            roleId: 2
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = {
            ...data,
            HREL_AppliedDate: data.HREL_AppliedDate.toISOString(),
            HREL_TotalPending: data.HREL_SanctionedAmount
        };

        saveLoan(payload, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success(response.message || 'Employee loan added successfully');
                    reset();
                    onSuccess();
                } else {
                    toast.error(response?.message || 'Failed to add employee loan');
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

    const employees = onloadData?.employeedropdown || [];
    const loanTypes = onloadData?.masterloandropdown || [];
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

                        {/* Loan Type */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMLN_Id'>
                                Loan Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRMLN_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMLN_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select loan type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loanTypes.map((loan) => (
                                                <SelectItem key={loan.HRMLN_Id} value={String(loan.HRMLN_Id)}>
                                                    {loan.HRML_LoanType} (Max: ₹{loan.HRML_Max})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMLN_Id && <FormError>{errors.HRMLN_Id.message}</FormError>}
                        </div>

                        {/* Applied Date */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HREL_AppliedDate'>
                                Applied Date <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HREL_AppliedDate'
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
                            {errors.HREL_AppliedDate && <FormError>{errors.HREL_AppliedDate.message}</FormError>}
                        </div>

                        {/* Loan Amount */}
                        <InputNumber
                            label='Loan Amount'
                            required
                            id='HREL_LoanAmount'
                            placeholder='Enter loan amount'
                            {...register('HREL_LoanAmount', { valueAsNumber: true })}
                            error={errors.HREL_LoanAmount?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Sanctioned Amount */}
                        <InputNumber
                            label='Sanctioned Amount'
                            id='HREL_SanctionedAmount'
                            placeholder='Enter sanctioned amount'
                            {...register('HREL_SanctionedAmount', { valueAsNumber: true })}
                            error={errors.HREL_SanctionedAmount?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Number of Installments */}
                        <InputNumber
                            label='Number of Installments'
                            required
                            id='HREL_NoofInstallment'
                            placeholder='Enter number'
                            {...register('HREL_NoofInstallment', { valueAsNumber: true })}
                            error={errors.HREL_NoofInstallment?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Installments */}
                        <InputNumber
                            label='Installments'
                            required
                            id='HREL_LoanInsallments'
                            placeholder='Enter installments'
                            {...register('HREL_LoanInsallments', { valueAsNumber: true })}
                            error={errors.HREL_LoanInsallments?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* EMI */}
                        <InputNumber
                            label='EMI Amount'
                            id='HREL_LaonEMI'
                            placeholder='Enter EMI amount'
                            {...register('HREL_LaonEMI', { valueAsNumber: true })}
                            error={errors.HREL_LaonEMI?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Loan Interest */}
                        <InputNumber
                            label='Interest Rate (%)'
                            id='HREL_LoanInterest'
                            placeholder='Enter interest rate'
                            {...register('HREL_LoanInterest', { valueAsNumber: true })}
                            error={errors.HREL_LoanInterest?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Loan Status */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HREL_LoanStatus'>
                                Status <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HREL_LoanStatus'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='HREL_LoanStatus'
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
                            {errors.HREL_LoanStatus && <FormError>{errors.HREL_LoanStatus.message}</FormError>}
                        </div>

                        {/* Mode of Payment */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HREL_ModeOfPayment'>Mode of Payment</Label>
                            <Controller
                                name='HREL_ModeOfPayment'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='HREL_ModeOfPayment'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select mode' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentModes.map((mode) => (
                                                <SelectItem key={mode.IVRMMOD_Id} value={mode.IVRMMOD_ModeOfPayment}>
                                                    {mode.IVRMMOD_ModeOfPayment}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HREL_ModeOfPayment && <FormError>{errors.HREL_ModeOfPayment.message}</FormError>}
                        </div>

                        {/* Reference No */}
                        <InputText
                            label='Reference Number'
                            id='HREL_ReferenceNo'
                            placeholder='Enter reference number'
                            {...register('HREL_ReferenceNo')}
                            error={errors.HREL_ReferenceNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
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
                            Add Employee Loan
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
