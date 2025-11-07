'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterPayrollStandard } from '@/hooks/hrms/useMasters';
import type { PayrollStandardDetail } from '@/types/hrms/master-payroll-standard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Schema based on visible fields in the image
const payrollStandardSchema = z.object({
    HRC_Id: z.number().optional(),
    MI_Id: z.number(),
    // Provident Fund
    HRC_PFAccPrefix: z.string().optional(),
    HRC_PFMaxAmt: z.number().min(0, 'Cannot be negative').optional().or(z.literal(undefined)),
    HRC_FPFPer: z.number().min(0).max(100).optional().or(z.literal(undefined)),
    HRC_EPFPer: z.number().min(0).max(100).optional().or(z.literal(undefined)),
    HRC_EPFPerAfterRetirement: z.number().min(0).max(100).optional(),
    HRC_EPFPerAfterRetirement2: z.number().min(0).max(100).optional(),
    HRC_AccNo2Per: z.number().min(0).optional(), // Account number, not percentage
    HRC_AccNo21Per: z.number().min(0).optional(), // Account number, not percentage
    HRC_AccNo22Per: z.number().min(0).optional(), // Account number, not percentage
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
    HRC_ESIMax: z.number().min(0).optional().or(z.literal(undefined)),
    HRC_ESIEmplrCont: z.number().min(0).max(100).optional().or(z.literal(undefined)),
    // Arrear Details
    HRC_ArrearSalaryReport: z.enum(['Separate', 'OnlyArrearHead']).optional(),
    HRC_ArrearRequired: z.enum(['Cumulative', 'Monthwise']).optional(),
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
        watch,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(payrollStandardSchema),
        mode: 'onBlur', // Changed from 'onChange' to prevent validation before data loads
        defaultValues: {
            HRC_Id: existingData?.HRC_Id || 0,
            MI_Id: HRMS_MI_ID,
            HRC_PFAccPrefix: '',
            HRC_PFMaxAmt: undefined,
            HRC_FPFPer: undefined,
            HRC_EPFPer: undefined,
            HRC_EPFPerAfterRetirement: undefined,
            HRC_EPFPerAfterRetirement2: undefined,
            HRC_AccNo2Per: undefined,
            HRC_AccNo21Per: undefined,
            HRC_AccNo22Per: undefined,
            HRC_AC2MinAmt: undefined,
            HRC_AC21MinAmt: undefined,
            HRC_AC22MinAmt: undefined,
            HRC_EducationCess: undefined,
            HRC_PartAMaxLimit: undefined,
            HRC_PartBMaxLimit: undefined,
            HRC_AsPerEmployee: false,
            HRC_RetirementYrs: 60,
            HRC_ESIAccPrefix: '',
            HRC_ESIMax: undefined,
            HRC_ESIEmplrCont: undefined,
            HRC_ArrearSalaryReport: 'Separate',
            HRC_ArrearRequired: 'Monthwise',
            HRC_SalaryApproval: false,
            HRC_SalaryAdvance: false,
            HRC_Loan: false,
            HRC_Leave: false,
            HRC_Increment: false,
            HRC_Probation: false,
            HRC_PaymentMethod: 1,
            HRC_OptionalHolidays: undefined,
            HRC_ApplicableFlag: false,
            HRC_MinimumPeriods: undefined,
            HRC_IncrementMonth: '',
            HRC_IncrementOnceInMonths: undefined,
            HRC_AlertDays: undefined,
            HRC_SalaryFromDay: 1, // Set default to 1 to avoid validation error
            HRC_SalaryToDay: 31, // Set default to 31 to avoid validation error
            HRC_ActiveFlag: true
        }
    });

    // Watch for Arrear Salary Report changes
    const arrearSalaryReport = watch('HRC_ArrearSalaryReport');

    // Pre-populate form with existing data
    useEffect(() => {
        if (existingData) {
            console.log('📝 [PAYROLL STANDARD FORM] Loading existing data:', JSON.stringify(existingData, null, 2));
            console.log('📝 [FORM] HRC_IncrementMonth from API:', existingData.HRC_IncrementMonth);
            console.log('📝 [FORM] HRC_SalaryFromDay from API:', existingData.HRC_SalaryFromDay);
            console.log('📝 [FORM] HRC_SalaryToDay from API:', existingData.HRC_SalaryToDay);

            // Helper function to convert 0 to undefined for empty display
            const clearZero = (value: number | undefined) => (value === 0 ? undefined : value);

            reset({
                HRC_Id: existingData.HRC_Id,
                MI_Id: existingData.MI_Id,
                // Provident Fund
                HRC_PFAccPrefix: existingData.HRC_PFAccNoPrefix || '',
                HRC_PFMaxAmt: clearZero(existingData.HRC_PFMaxAmt),
                HRC_FPFPer: clearZero(existingData.HRC_FPFPer),
                HRC_EPFPer: clearZero(existingData.HRC_EPFPer),
                HRC_EPFPerAfterRetirement: clearZero(existingData.HRC_ARTFPFPer),
                HRC_EPFPerAfterRetirement2: clearZero(existingData.HRC_ARTEPFPer),
                HRC_AccNo2Per: clearZero(existingData.HRC_AccNo2),
                HRC_AccNo21Per: clearZero(existingData.HRC_AccNo21),
                HRC_AccNo22Per: clearZero(existingData.HRC_AccNo22),
                HRC_AC2MinAmt: clearZero(existingData.HRC_AC2MinAmount),
                HRC_AC21MinAmt: clearZero(existingData.HRC_AC21MinAmount),
                HRC_AC22MinAmt: clearZero(existingData.HRC_AC22MinAmount),
                HRC_EducationCess: clearZero(existingData.HRC_EducationCess),
                HRC_PartAMaxLimit: clearZero(existingData.HRC_partAmaxflag),
                HRC_PartBMaxLimit: clearZero(existingData.HRC_partBmaxflag),
                HRC_AsPerEmployee: existingData.HRC_AsPerEmpFlag ?? false,
                HRC_RetirementYrs: existingData.HRC_RetirementYrs || 60,
                // ESI
                HRC_ESIAccPrefix: existingData.HRC_ECodePrefix || '',
                HRC_ESIMax: clearZero(existingData.HRC_ESIMax),
                HRC_ESIEmplrCont: clearZero(existingData.HRC_ESIEmplrCont),
                // Arrear Details
                HRC_ArrearSalaryReport: existingData.HRC_ArrSalaryFlag ? 'Separate' : 'OnlyArrearHead',
                HRC_ArrearRequired: existingData.HRC_CummArrFlag ? 'Cumulative' : 'Monthwise',
                // Approval Process
                HRC_SalaryApproval: existingData.HRC_SalApprovalFlg ?? false,
                HRC_SalaryAdvance: existingData.HRC_SalAdvApprovalFlg ?? false,
                HRC_Loan: existingData.HRC_LoanApprovalFlg ?? false,
                HRC_Leave: existingData.HRC_LeaveApprovalFlg ?? false,
                HRC_Increment: existingData.HRC_IncrementApprovalFlg ?? false,
                HRC_Probation: existingData.HRC_ProbationApprovalFlg ?? false,
                // Payment Method
                HRC_PaymentMethod: Number(existingData.HRC_PayMethodFlg) || 1,
                // Increment Process
                HRC_OptionalHolidays: clearZero(existingData.HRC_NoOfOptionalHolidays),
                HRC_ApplicableFlag: existingData.HRC_FixedIncrmentFlg ?? false,
                HRC_MinimumPeriods: clearZero(existingData.HRC_MinimumWorkingPeriod),
                HRC_IncrementMonth: existingData.HRC_IncrementMonth || '',
                HRC_IncrementOnceInMonths: clearZero(existingData.HRC_IncrementOnceInMonths),
                HRC_AlertDays: clearZero(existingData.HRC_AlertDay),
                // Salary Days
                HRC_SalaryFromDay: existingData.HRC_SalaryFromDay ?? 1,
                HRC_SalaryToDay: existingData.HRC_SalaryToDay ?? 31,
                HRC_ActiveFlag: existingData.HRC_ActiveFlag ?? true
            } as any);

            console.log('📝 [PAYROLL STANDARD FORM] Form reset complete');
        }
    }, [existingData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        console.log('🔵 ========== PAYROLL STANDARD FORM SUBMIT ==========');
        console.log('🔵 [FORM] onSubmit handler CALLED! This means validation passed!');
        console.log('🔵 [FORM] Form submit - Data:', JSON.stringify(data, null, 2));
        console.log('🔵 [FORM] HRC_Id:', data.HRC_Id);
        console.log('🔵 [FORM] HRC_ArrearSalaryReport:', data.HRC_ArrearSalaryReport);
        console.log('🔵 [FORM] HRC_ArrearRequired:', data.HRC_ArrearRequired);

        // Map form fields to API fields
        const payload = {
            HRC_Id: data.HRC_Id || 0,
            MI_Id: data.MI_Id,
            // Provident Fund
            HRC_PFAccNoPrefix: data.HRC_PFAccPrefix || '',
            HRC_PFMaxAmt: data.HRC_PFMaxAmt || 0,
            HRC_FPFPer: data.HRC_FPFPer || 0,
            HRC_EPFPer: data.HRC_EPFPer || 0,
            HRC_ARTFPFPer: data.HRC_EPFPerAfterRetirement || 0,
            HRC_ARTEPFPer: data.HRC_EPFPerAfterRetirement2 || 0,
            HRC_AccNo2: data.HRC_AccNo2Per || 0,
            HRC_AccNo21: data.HRC_AccNo21Per || 0,
            HRC_AccNo22: data.HRC_AccNo22Per || 0,
            HRC_AC2MinAmount: data.HRC_AC2MinAmt || 0,
            HRC_AC21MinAmount: data.HRC_AC21MinAmt || 0,
            HRC_AC22MinAmount: data.HRC_AC22MinAmt || 0,
            HRC_EducationCess: data.HRC_EducationCess || 0,
            HRC_partAmaxflag: data.HRC_PartAMaxLimit || 0,
            HRC_partBmaxflag: data.HRC_PartBMaxLimit || 0,
            HRC_AsPerEmpFlag: data.HRC_AsPerEmployee ?? false,
            HRC_RetirementYrs: data.HRC_RetirementYrs || 60,
            // ESI
            HRC_ECodePrefix: data.HRC_ESIAccPrefix || '',
            HRC_ESIMax: data.HRC_ESIMax || 0,
            HRC_ESIMaxAmount: data.HRC_ESIMax || 0,
            HRC_ESIEmplrCont: data.HRC_ESIEmplrCont || 0,
            // Arrear Details
            HRC_ArrSalaryFlag: data.HRC_ArrearSalaryReport === 'Separate',
            HRC_CummArrFlag: data.HRC_ArrearRequired === 'Cumulative',
            // Approval Process
            HRC_SalApprovalFlg: data.HRC_SalaryApproval ?? false,
            HRC_SalAdvApprovalFlg: data.HRC_SalaryAdvance ?? false,
            HRC_LoanApprovalFlg: data.HRC_Loan ?? false,
            HRC_LeaveApprovalFlg: data.HRC_Leave ?? false,
            HRC_IncrementApprovalFlg: data.HRC_Increment ?? false,
            HRC_ProbationApprovalFlg: data.HRC_Probation ?? false,
            // Payment Method
            HRC_PayMethodFlg: String(data.HRC_PaymentMethod || 1),
            // Increment Process
            HRC_NoOfOptionalHolidays: data.HRC_OptionalHolidays || 0,
            HRC_FixedIncrmentFlg: data.HRC_ApplicableFlag ?? false,
            HRC_MinimumWorkingPeriod: data.HRC_MinimumPeriods || 0,
            HRC_IncrementMonth: data.HRC_IncrementMonth || '',
            HRC_IncrementOnceInMonths: data.HRC_IncrementOnceInMonths || 0,
            HRC_AlertDay: data.HRC_AlertDays || 0,
            // Salary Days
            HRC_SalaryFromDay: data.HRC_SalaryFromDay || 1,
            HRC_SalaryToDay: data.HRC_SalaryToDay || 31,
            HRC_ActiveFlag: data.HRC_ActiveFlag ?? true
        };

        console.log('🟠 [FORM] Prepared payload:', JSON.stringify(payload, null, 2));
        console.log('🟠 [FORM] Calling saveMutation...');

        saveMutation.mutate(payload, {
            onSuccess: (response) => {
                console.log('🟢 [FORM] Save mutation onSuccess called');
                console.log('🟢 [FORM] Response:', JSON.stringify(response, null, 2));

                if (response?.success) {
                    console.log('✅ [FORM] Save successful');
                    toast.success(response.message || 'Payroll standard saved successfully');
                } else {
                    console.log('❌ [FORM] Save failed');
                    toast.error(response?.message || 'Failed to save payroll standard');
                }
                console.log('🔵 ========== PAYROLL STANDARD FORM SUBMIT END ==========');
            },
            onError: (error: any) => {
                console.log('🔴 [FORM] Save mutation onError called');
                console.log('🔴 [FORM] Error:', error);
                toast.error(error.message || 'An error occurred');
                console.log('🔵 ========== PAYROLL STANDARD FORM SUBMIT END ==========');
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

    // Add debug logging for form state changes
    const formValues = watch();
    console.log('📝 [PAYROLL STANDARD FORM] Current form values:', formValues);
    console.log('📝 [PAYROLL STANDARD FORM] Form errors:', errors);
    if (errors.HRC_SalaryFromDay) {
        console.log('❌ [FORM] HRC_SalaryFromDay error:', errors.HRC_SalaryFromDay.message);
    }
    if (errors.HRC_SalaryToDay) {
        console.log('❌ [FORM] HRC_SalaryToDay error:', errors.HRC_SalaryToDay.message);
    }
    console.log('📝 [PAYROLL STANDARD FORM] isSubmitting:', isSubmitting);

    const handleFormSubmit = (e?: React.FormEvent) => {
        console.log('🔵 [PAYROLL STANDARD FORM] handleFormSubmit triggered!', e?.type);
        console.log('🔵 [FORM] Current form errors:', errors);
        console.log('🔵 [FORM] All error keys:', Object.keys(errors));
        console.log('🔵 [FORM] Current form values:', watch());
        return handleSubmit(onSubmit)(e);
    };

    return (
        <div className={className}>
            <form onSubmit={handleFormSubmit} className='space-y-6'>
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

                        <Controller
                            name='HRC_PFMaxAmt'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_PFMaxAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='PF Max Amount'
                                            required
                                            id='HRC_PFMaxAmt'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_PFMaxAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_PFMaxAmt?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_FPFPer'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_FPFPer', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='FPF %'
                                            required
                                            id='HRC_FPFPer'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_FPFPer', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_FPFPer?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_EPFPer'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_EPFPer', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='EPF %'
                                            required
                                            id='HRC_EPFPer'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_EPFPer', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_EPFPer?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_EPFPerAfterRetirement'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_EPFPerAfterRetirement', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='EPF % After Retirement'
                                            id='HRC_EPFPerAfterRetirement'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_EPFPerAfterRetirement', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_EPFPerAfterRetirement?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_EPFPerAfterRetirement2'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_EPFPerAfterRetirement2', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='EPF % After Retirement (2)'
                                            id='HRC_EPFPerAfterRetirement2'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_EPFPerAfterRetirement2', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_EPFPerAfterRetirement2?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AccNo2Per'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AccNo2Per', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Acc No. 2 %'
                                            id='HRC_AccNo2Per'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AccNo2Per', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AccNo2Per?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AC2MinAmt'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AC2MinAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='A/C2 Min Amount'
                                            id='HRC_AC2MinAmt'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AC2MinAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AC2MinAmt?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AccNo21Per'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AccNo21Per', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Acc No. 21 %'
                                            id='HRC_AccNo21Per'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AccNo21Per', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AccNo21Per?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AC21MinAmt'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AC21MinAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='A/C21 Min Amount'
                                            id='HRC_AC21MinAmt'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AC21MinAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AC21MinAmt?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AccNo22Per'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AccNo22Per', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Acc No. 22 %'
                                            id='HRC_AccNo22Per'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AccNo22Per', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AccNo22Per?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AC22MinAmt'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AC22MinAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='A/C22 Min Amount'
                                            id='HRC_AC22MinAmt'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AC22MinAmt', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AC22MinAmt?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_EducationCess'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_EducationCess', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Education Cess'
                                            id='HRC_EducationCess'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_EducationCess', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_EducationCess?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_PartAMaxLimit'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_PartAMaxLimit', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Part A Max Limit'
                                            id='HRC_PartAMaxLimit'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_PartAMaxLimit', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_PartAMaxLimit?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_PartBMaxLimit'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_PartBMaxLimit', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Part B Max Limit'
                                            id='HRC_PartBMaxLimit'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_PartBMaxLimit', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_PartBMaxLimit?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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

                        <Controller
                            name='HRC_RetirementYrs'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_RetirementYrs', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Retirement Years'
                                            required
                                            id='HRC_RetirementYrs'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_RetirementYrs', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_RetirementYrs?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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

                        <Controller
                            name='HRC_ESIMax'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_ESIMax', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='ESI Max (₹)'
                                            required
                                            id='HRC_ESIMax'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_ESIMax', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_ESIMax?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_ESIMax'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_ESIMax', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='ESI Max Amount'
                                            id='HRC_ESIMax2'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_ESIMax', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_ESIMax?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_ESIEmplrCont'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_ESIEmplrCont', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Employer Contribution (%)'
                                            required
                                            id='HRC_ESIEmplrCont'
                                            step={0.01}
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_ESIEmplrCont', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_ESIEmplrCont?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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

                    {/* Conditional Arrear Required Section - Only shown when "Separate" is selected */}
                    {arrearSalaryReport === 'Separate' && (
                        <div className='group flex flex-col gap-1.5 rounded-md border border-purple-200 bg-purple-50 p-4'>
                            <Label>Arrear Required:</Label>
                            <div className='flex gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='HRC_ArrearRequired'
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type='radio'
                                                id='arrear-cumulative'
                                                value='Cumulative'
                                                checked={field.value === 'Cumulative'}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                className='h-4 w-4'
                                            />
                                        )}
                                    />
                                    <Label htmlFor='arrear-cumulative' className='cursor-pointer font-normal'>
                                        Cumulative Arrear
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='HRC_ArrearRequired'
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type='radio'
                                                id='arrear-monthwise'
                                                value='Monthwise'
                                                checked={field.value === 'Monthwise'}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                className='h-4 w-4'
                                            />
                                        )}
                                    />
                                    <Label htmlFor='arrear-monthwise' className='cursor-pointer font-normal'>
                                        Month wise Arrear
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}
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
                        <Controller
                            name='HRC_OptionalHolidays'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_OptionalHolidays', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Optional Holidays'
                                            id='HRC_OptionalHolidays'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_OptionalHolidays', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_OptionalHolidays?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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

                        <Controller
                            name='HRC_MinimumPeriods'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_MinimumPeriods', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Minimum Periods'
                                            id='HRC_MinimumPeriods'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_MinimumPeriods', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_MinimumPeriods?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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

                        <Controller
                            name='HRC_IncrementOnceInMonths'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_IncrementOnceInMonths', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Increment Once In Months'
                                            id='HRC_IncrementOnceInMonths'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_IncrementOnceInMonths', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_IncrementOnceInMonths?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            name='HRC_AlertDays'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRC_AlertDays', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Alert Days'
                                            id='HRC_AlertDays'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRC_AlertDays', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRC_AlertDays?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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
                        disabled={isSubmitting || saveMutation.isPending || !isDirty}
                        className='order-1 w-fit bg-purple-600 transition-all duration-200 hover:scale-105 hover:bg-purple-700'
                        isLoading={isSubmitting || saveMutation.isPending}
                        loadingText='Saving...'
                        onClick={() => {
                            console.log('🔵 [PAYROLL STANDARD FORM] Save button clicked!');
                            console.log('🔵 [FORM] Button disabled:', isSubmitting || saveMutation.isPending);
                            console.log('🔵 [FORM] isSubmitting:', isSubmitting);
                            console.log('🔵 [FORM] saveMutation.isPending:', saveMutation.isPending);
                            console.log('🔵 [FORM] Current errors:', errors);
                            console.log('🔵 [FORM] Error count:', Object.keys(errors).length);
                        }}>
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
                    {!isDirty && (
                        <span className='order-3 flex items-center text-sm text-muted-foreground sm:order-3'>
                            No changes made
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
