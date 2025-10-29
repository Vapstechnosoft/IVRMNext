'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterPayrollStandard } from '@/hooks/hrms/useMasterPayrollStandard';
import type { PayrollStandardDetail } from '@/types/hrms/master-payroll-standard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Schema based on visible fields in the image
const payrollStandardSchema = z.object({
    HRC_Id: z.number().optional(),
    MI_Id: z.number(),
    // Provident Fund
    HRC_PFAccPrefix: z.string().optional(),
    HRC_PFMaxAmt: z.number().min(0, 'Cannot be negative'),
    HRC_FPFPer: z.number().min(0).max(100),
    HRC_EPFPer: z.number().min(0).max(100),
    HRC_EPFPerAfterRetirement: z.number().min(0).max(100).optional(),
    HRC_EPFPerAfterRetirement2: z.number().min(0).max(100).optional(),
    HRC_AccNo2Per: z.number().min(0).max(100).optional(),
    HRC_AccNo21Per: z.number().min(0).max(100).optional(),
    HRC_AccNo22Per: z.number().min(0).max(100).optional(),
    HRC_AC2MinAmt: z.number().min(0).optional(),
    HRC_AC21MinAmt: z.number().min(0).optional(),
    HRC_AC22MinAmt: z.number().min(0).optional(),
    HRC_EducationCess: z.number().min(0).optional(),
    HRC_PartAMaxLimit: z.number().min(0).optional(),
    HRC_PartBMaxLimit: z.number().min(0).optional(),
    HRC_AsPerEmployee: z.boolean().optional(),
    HRC_RetirementYrs: z.number().min(1).max(100),
    // ESI
    HRC_ESIAccPrefix: z.string().optional(),
    HRC_ESIMax: z.number().min(0),
    HRC_ESIEmplrCont: z.number().min(0).max(100),
    // Arrear Details
    HRC_ArrearSalaryReport: z.enum(['Separate', 'OnlyArrearHead']).optional(),
    // Approval Process
    HRC_SalaryApproval: z.boolean().optional(),
    HRC_SalaryAdvance: z.boolean().optional(),
    HRC_Loan: z.boolean().optional(),
    HRC_Leave: z.boolean().optional(),
    HRC_Increment: z.boolean().optional(),
    HRC_Probation: z.boolean().optional(),
    // Payment Method
    HRC_PaymentMethod: z.number().min(1).max(6).optional(),
    // Increment Process
    HRC_OptionalHolidays: z.number().min(0).optional(),
    HRC_ApplicableFlag: z.boolean().optional(),
    HRC_MinimumPeriods: z.number().min(0).optional(),
    HRC_IncrementMonth: z.string().optional(),
    HRC_IncrementOnceInMonths: z.number().min(0).optional(),
    HRC_AlertDays: z.number().min(0).optional(),
    // Salary Days
    HRC_SalaryFromDay: z.number().min(1).max(31),
    HRC_SalaryToDay: z.number().min(1).max(31),
    HRC_ActiveFlag: z.boolean()
});

type FormFields = z.infer<typeof payrollStandardSchema>;

interface PayrollStandardFormProps {
    existingData?: PayrollStandardDetail;
    className?: string;
}

export default function PayrollStandardForm({ existingData, className = '' }: PayrollStandardFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterPayrollStandard(roleId);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(payrollStandardSchema),
        mode: 'onChange',
        defaultValues: {
            HRC_Id: existingData?.HRC_Id || 0,
            MI_Id: HRMS_MI_ID,
            HRC_PFAccPrefix: '',
            HRC_PFMaxAmt: 0,
            HRC_FPFPer: 0,
            HRC_EPFPer: 0,
            HRC_EPFPerAfterRetirement: 0,
            HRC_EPFPerAfterRetirement2: 0,
            HRC_AccNo2Per: 0,
            HRC_AccNo21Per: 0,
            HRC_AccNo22Per: 0,
            HRC_AC2MinAmt: 0,
            HRC_AC21MinAmt: 0,
            HRC_AC22MinAmt: 0,
            HRC_EducationCess: 0,
            HRC_PartAMaxLimit: 0,
            HRC_PartBMaxLimit: 0,
            HRC_AsPerEmployee: false,
            HRC_RetirementYrs: 60,
            HRC_ESIAccPrefix: '',
            HRC_ESIMax: 0,
            HRC_ESIEmplrCont: 0,
            HRC_ArrearSalaryReport: 'Separate',
            HRC_SalaryApproval: false,
            HRC_SalaryAdvance: false,
            HRC_Loan: false,
            HRC_Leave: false,
            HRC_Increment: false,
            HRC_Probation: false,
            HRC_PaymentMethod: 1,
            HRC_OptionalHolidays: 0,
            HRC_ApplicableFlag: false,
            HRC_MinimumPeriods: 0,
            HRC_IncrementMonth: '',
            HRC_IncrementOnceInMonths: 0,
            HRC_AlertDays: 0,
            HRC_SalaryFromDay: 1,
            HRC_SalaryToDay: 31,
            HRC_ActiveFlag: true
        }
    });

    // Pre-populate form with existing data
    useEffect(() => {
        if (existingData) {
            reset({
                HRC_Id: existingData.HRC_Id,
                MI_Id: existingData.MI_Id,
                HRC_PFMaxAmt: existingData.HRC_PFMaxAmt,
                HRC_FPFPer: existingData.HRC_FPFPer,
                HRC_EPFPer: existingData.HRC_EPFPer,
                HRC_RetirementYrs: existingData.HRC_RetirementYrs,
                HRC_ESIMax: existingData.HRC_ESIMax,
                HRC_ESIEmplrCont: existingData.HRC_ESIEmplrCont,
                HRC_SalaryFromDay: existingData.HRC_SalaryFromDay,
                HRC_SalaryToDay: existingData.HRC_SalaryToDay,
                HRC_ActiveFlag: existingData.HRC_ActiveFlag
                // Add other fields as they come from API
            } as any);
        }
    }, [existingData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Only send the fields that are in the current API
        const payload = {
            HRC_Id: data.HRC_Id || 0,
            MI_Id: data.MI_Id,
            HRC_PFMaxAmt: data.HRC_PFMaxAmt,
            HRC_FPFPer: data.HRC_FPFPer,
            HRC_EPFPer: data.HRC_EPFPer,
            HRC_RetirementYrs: data.HRC_RetirementYrs,
            HRC_ESIMax: data.HRC_ESIMax,
            HRC_ESIEmplrCont: data.HRC_ESIEmplrCont,
            HRC_SalaryFromDay: data.HRC_SalaryFromDay,
            HRC_SalaryToDay: data.HRC_SalaryToDay,
            HRC_ActiveFlag: data.HRC_ActiveFlag
        };

        saveMutation.mutate(payload, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success(response.message || 'Payroll standard saved successfully');
                } else {
                    toast.error(response?.message || 'Failed to save payroll standard');
                }
            },
            onError: (error: any) => {
                toast.error(error.message || 'An error occurred');
            }
        });
    };

    const handleReset = () => {
        if (existingData) {
            reset();
        } else {
            reset({
                HRC_Id: 0,
                MI_Id: HRMS_MI_ID,
                HRC_PFMaxAmt: 0,
                HRC_FPFPer: 0,
                HRC_EPFPer: 0,
                HRC_RetirementYrs: 60,
                HRC_ESIMax: 0,
                HRC_ESIEmplrCont: 0,
                HRC_SalaryFromDay: 1,
                HRC_SalaryToDay: 31,
                HRC_ActiveFlag: true
            } as any);
        }
    };

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Provident Fund Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>Provident Fund</h3>
                </div>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <InputText
                            label='PF Account Prefix'
                            id='HRC_PFAccPrefix'
                            {...register('HRC_PFAccPrefix')}
                            error={errors.HRC_PFAccPrefix?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='PF Max Amount'
                            required
                            id='HRC_PFMaxAmt'
                            {...register('HRC_PFMaxAmt', { valueAsNumber: true })}
                            error={errors.HRC_PFMaxAmt?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='FPF %'
                            required
                            id='HRC_FPFPer'
                            step='0.01'
                            {...register('HRC_FPFPer', { valueAsNumber: true })}
                            error={errors.HRC_FPFPer?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='EPF %'
                            required
                            id='HRC_EPFPer'
                            step='0.01'
                            {...register('HRC_EPFPer', { valueAsNumber: true })}
                            error={errors.HRC_EPFPer?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='EPF % After Retirement'
                            id='HRC_EPFPerAfterRetirement'
                            step='0.01'
                            {...register('HRC_EPFPerAfterRetirement', {
                                valueAsNumber: true
                            })}
                            error={errors.HRC_EPFPerAfterRetirement?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='EPF % After Retirement (2)'
                            id='HRC_EPFPerAfterRetirement2'
                            step='0.01'
                            {...register('HRC_EPFPerAfterRetirement2', {
                                valueAsNumber: true
                            })}
                            error={errors.HRC_EPFPerAfterRetirement2?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Acc No. 2 %'
                            id='HRC_AccNo2Per'
                            step='0.01'
                            {...register('HRC_AccNo2Per', { valueAsNumber: true })}
                            error={errors.HRC_AccNo2Per?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='A/C2 Min Amount'
                            id='HRC_AC2MinAmt'
                            {...register('HRC_AC2MinAmt', { valueAsNumber: true })}
                            error={errors.HRC_AC2MinAmt?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Acc No. 21 %'
                            id='HRC_AccNo21Per'
                            step='0.01'
                            {...register('HRC_AccNo21Per', { valueAsNumber: true })}
                            error={errors.HRC_AccNo21Per?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='A/C21 Min Amount'
                            id='HRC_AC21MinAmt'
                            {...register('HRC_AC21MinAmt', { valueAsNumber: true })}
                            error={errors.HRC_AC21MinAmt?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Acc No. 22 %'
                            id='HRC_AccNo22Per'
                            step='0.01'
                            {...register('HRC_AccNo22Per', { valueAsNumber: true })}
                            error={errors.HRC_AccNo22Per?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='A/C22 Min Amount'
                            id='HRC_AC22MinAmt'
                            {...register('HRC_AC22MinAmt', { valueAsNumber: true })}
                            error={errors.HRC_AC22MinAmt?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Education Cess'
                            id='HRC_EducationCess'
                            {...register('HRC_EducationCess', { valueAsNumber: true })}
                            error={errors.HRC_EducationCess?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Part A Max Limit'
                            id='HRC_PartAMaxLimit'
                            {...register('HRC_PartAMaxLimit', { valueAsNumber: true })}
                            error={errors.HRC_PartAMaxLimit?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Part B Max Limit'
                            id='HRC_PartBMaxLimit'
                            {...register('HRC_PartBMaxLimit', { valueAsNumber: true })}
                            error={errors.HRC_PartBMaxLimit?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_AsPerEmployee'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRC_AsPerEmployee' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRC_AsPerEmployee' className='cursor-pointer font-normal'>
                                As Per Employee
                            </Label>
                        </div>

                        <InputNumber
                            label='Retirement Years'
                            required
                            id='HRC_RetirementYrs'
                            {...register('HRC_RetirementYrs', { valueAsNumber: true })}
                            error={errors.HRC_RetirementYrs?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* ESI Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>ESI</h3>
                </div>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <InputText
                            label='ESI Account Prefix'
                            id='HRC_ESIAccPrefix'
                            {...register('HRC_ESIAccPrefix')}
                            error={errors.HRC_ESIAccPrefix?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='ESI Max (₹)'
                            required
                            id='HRC_ESIMax'
                            {...register('HRC_ESIMax', { valueAsNumber: true })}
                            error={errors.HRC_ESIMax?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='ESI Max Amount'
                            id='HRC_ESIMax2'
                            {...register('HRC_ESIMax', { valueAsNumber: true })}
                            error={errors.HRC_ESIMax?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Employer Contribution (%)'
                            required
                            id='HRC_ESIEmplrCont'
                            step='0.01'
                            {...register('HRC_ESIEmplrCont', { valueAsNumber: true })}
                            error={errors.HRC_ESIEmplrCont?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* Arrear Details Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>Arrear Details</h3>
                </div>
                <div className='space-y-4'>
                    <div className='group flex flex-col gap-1.5'>
                        <Label>Arrear Salary Report:</Label>
                        <div className='flex gap-6'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='HRC_ArrearSalaryReport'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id='arrear-separate'
                                            value='Separate'
                                            checked={field.value === 'Separate'}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className='h-4 w-4'
                                        />
                                    )}
                                />
                                <Label htmlFor='arrear-separate' className='cursor-pointer font-normal'>
                                    Separate Arrear Salary Report
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='HRC_ArrearSalaryReport'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id='arrear-only-head'
                                            value='OnlyArrearHead'
                                            checked={field.value === 'OnlyArrearHead'}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className='h-4 w-4'
                                        />
                                    )}
                                />
                                <Label htmlFor='arrear-only-head' className='cursor-pointer font-normal'>
                                    Only Arrear Head
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval Process Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>Approval Process</h3>
                </div>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_SalaryApproval'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRC_SalaryApproval' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRC_SalaryApproval' className='cursor-pointer font-normal'>
                                Salary Approval
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_SalaryAdvance'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRC_SalaryAdvance' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRC_SalaryAdvance' className='cursor-pointer font-normal'>
                                Salary Advance
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_Loan'
                                control={control}
                                render={({ field }) => <Checkbox id='HRC_Loan' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label htmlFor='HRC_Loan' className='cursor-pointer font-normal'>
                                Loan
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_Leave'
                                control={control}
                                render={({ field }) => <Checkbox id='HRC_Leave' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label htmlFor='HRC_Leave' className='cursor-pointer font-normal'>
                                Leave
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_Increment'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRC_Increment' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRC_Increment' className='cursor-pointer font-normal'>
                                Increment
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRC_Probation'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRC_Probation' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRC_Probation' className='cursor-pointer font-normal'>
                                Probation
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Payment Method Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>Payment Method</h3>
                </div>
                <div className='space-y-4'>
                    <div className='flex flex-wrap gap-6'>
                        {[1, 2, 3, 4, 5, 6].map((method) => (
                            <div key={method} className='flex items-center space-x-2'>
                                <Controller
                                    name='HRC_PaymentMethod'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id={`method-${method}`}
                                            value={method}
                                            checked={field.value === method}
                                            onChange={() => field.onChange(method)}
                                            className='h-4 w-4'
                                        />
                                    )}
                                />
                                <Label htmlFor={`method-${method}`} className='cursor-pointer font-normal'>
                                    Method {method}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Increment Process Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>Increment Process</h3>
                </div>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <InputNumber
                            label='Optional Holidays'
                            id='HRC_OptionalHolidays'
                            {...register('HRC_OptionalHolidays', { valueAsNumber: true })}
                            error={errors.HRC_OptionalHolidays?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='flex items-center space-x-3 pt-6'>
                            <Controller
                                name='HRC_ApplicableFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRC_ApplicableFlag' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRC_ApplicableFlag' className='cursor-pointer font-normal'>
                                Applicable
                            </Label>
                        </div>

                        <InputNumber
                            label='Minimum Periods'
                            id='HRC_MinimumPeriods'
                            {...register('HRC_MinimumPeriods', { valueAsNumber: true })}
                            error={errors.HRC_MinimumPeriods?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRC_IncrementMonth'>Increment Month</Label>
                            <Controller
                                name='HRC_IncrementMonth'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='HRC_IncrementMonth'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select Month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month} value={month}>
                                                    {month}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRC_IncrementMonth && <FormError>{errors.HRC_IncrementMonth.message}</FormError>}
                        </div>

                        <InputNumber
                            label='Increment Once In Months'
                            id='HRC_IncrementOnceInMonths'
                            {...register('HRC_IncrementOnceInMonths', {
                                valueAsNumber: true
                            })}
                            error={errors.HRC_IncrementOnceInMonths?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputNumber
                            label='Alert Days'
                            id='HRC_AlertDays'
                            {...register('HRC_AlertDays', { valueAsNumber: true })}
                            error={errors.HRC_AlertDays?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* Salary Days Section */}
                <div className='rounded-lg bg-purple-600 p-4 text-white'>
                    <h3 className='font-semibold text-lg'>Salary Days</h3>
                </div>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRC_SalaryFromDay'>From Day</Label>
                            <Controller
                                name='HRC_SalaryFromDay'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger
                                            id='HRC_SalaryFromDay'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select day' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                <SelectItem key={day} value={String(day)}>
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRC_SalaryFromDay && <FormError>{errors.HRC_SalaryFromDay.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRC_SalaryToDay'>To Day</Label>
                            <Controller
                                name='HRC_SalaryToDay'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger
                                            id='HRC_SalaryToDay'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select day' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                <SelectItem key={day} value={String(day)}>
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRC_SalaryToDay && <FormError>{errors.HRC_SalaryToDay.message}</FormError>}
                        </div>
                    </div>
                </div>

                {errors.root && <FormError>{errors.root.message}</FormError>}

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting || saveMutation.isPending}
                        className='order-1 w-fit bg-purple-600 transition-all duration-200 hover:scale-105 hover:bg-purple-700'
                        isLoading={isSubmitting || saveMutation.isPending}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE
                        </div>
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || saveMutation.isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105'>
                        CANCEL
                    </Button>
                </div>
            </form>
        </div>
    );
}
