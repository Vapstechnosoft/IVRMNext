'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import { EARNING_DEDUCTION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
interface AddEarningsDeductionsFormProps {
    onSuccess?: () => void;
    className?: string;
    typeDropdown?: any[];
}
export default function AddEarningsDeductionsForm({ onSuccess, className = '', typeDropdown = [] }: AddEarningsDeductionsFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterEarningsDeductions(roleId);
    const {
        register,
        handleSubmit,
        reset,
        control,
        getValues,
        trigger,
        formState: { errors, isSubmitting }
    } = useForm<MasterEarningsDeductionsInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMED_Name: '',
            HRMED_EDTypeFlag: '',
            HRMED_EarnDedFlag: 'Earning',
            HRMED_AmountPercentFlag: 'Amount',
            HRMED_AmountPercent: '0',
            HRMED_ActiveFlag: true,
            HRMED_RoundOffFlag: '',
            HRMED_Order: 0,
            HRMED_ReviseFlg: false
        }
    });
    const calculationType = useWatch({
        control,
        name: 'HRMED_AmountPercentFlag',
        defaultValue: 'Amount'
    });
    useEffect(() => {
        trigger('HRMED_AmountPercent');
    }, [calculationType, trigger]);
    const onSubmit = async (data: MasterEarningsDeductionsInput) => {
        const sanitizedData: MasterEarningsDeductionsInput = {
            ...data,
            HRMED_Name: data.HRMED_Name?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Earning/Deduction added successfully');
                reset();
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to add earning/deduction');
            }
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                error?.data?.message ||
                'Failed to add earning/deduction';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={className}>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_Name'>
                            Name <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMED_Name'
                            placeholder='Enter earning/deduction name'
                            maxLength={EARNING_DEDUCTION_VALIDATION.HRMED_Name.maxLength?.value}
                            error={errors.HRMED_Name?.message}
                            {...register('HRMED_Name', EARNING_DEDUCTION_VALIDATION.HRMED_Name)}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_EDTypeFlag'>
                            Type <span className='text-destructive'>*</span>
                        </Label>
                        <select
                            id='HRMED_EDTypeFlag'
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                            {...register('HRMED_EDTypeFlag', { required: 'Type is required' })}>
                            <option value=''>Select Type</option>
                            {typeDropdown.map((type) => (
                                <option key={type.HRMEDT_Id} value={type.HRMEDT_EarnDedType}>
                                    {type.HRMEDT_EarnDedType}
                                </option>
                            ))}
                        </select>
                        {errors.HRMED_EDTypeFlag && <FormError>{errors.HRMED_EDTypeFlag.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_RoundOffFlag'>
                            Rounding To <span className='text-destructive'>*</span>
                        </Label>
                        <select
                            id='HRMED_RoundOffFlag'
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                            {...register('HRMED_RoundOffFlag', { required: 'Rounding option is required' })}>
                            <option value=''>Select Rounding</option>
                            <option value='No'>No</option>
                            <option value='RoundUp'>Round Up</option>
                            <option value='RoundDown'>Round Down</option>
                            <option value='HalfRoundUp'>Half Round Up</option>
                        </select>
                        {errors.HRMED_RoundOffFlag && <FormError>{errors.HRMED_RoundOffFlag.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_EarnDedFlag'>
                            Earning/Deduction <span className='text-destructive'>*</span>
                        </Label>
                        <select
                            id='HRMED_EarnDedFlag'
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                            {...register('HRMED_EarnDedFlag', EARNING_DEDUCTION_VALIDATION.HRMED_EarnDedFlag)}>
                            <option value='Earning'>Earning</option>
                            <option value='Deduction'>Deduction</option>
                            <option value='Arrear'>Arrear</option>
                            <option value='Gross'>Gross</option>
                        </select>
                        {errors.HRMED_EarnDedFlag && <FormError>{errors.HRMED_EarnDedFlag.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_AmountPercentFlag'>
                            Calculation Type <span className='text-destructive'>*</span>
                        </Label>
                        <select
                            id='HRMED_AmountPercentFlag'
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                            {...register('HRMED_AmountPercentFlag', {
                                onChange: (_e) => {
                                    trigger('HRMED_AmountPercent');
                                }
                            })}>
                            <option value='Amount'>Amount</option>
                            <option value='Percentage'>Percentage</option>
                        </select>
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_AmountPercent'>
                            {calculationType === 'Percentage' ? 'Percentage' : 'Amount'} <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMED_AmountPercent'
                            placeholder={`Enter ${calculationType === 'Percentage' ? 'percentage' : 'amount'}`}
                            maxLength={calculationType === 'Percentage' ? 5 : undefined}
                            error={errors.HRMED_AmountPercent?.message}
                            {...register('HRMED_AmountPercent', {
                                required: EARNING_DEDUCTION_VALIDATION.HRMED_AmountPercent.required,
                                validate: (value) => {
                                    const numValue = Number.parseFloat(value);
                                    if (Number.isNaN(numValue)) {
                                        return 'Amount/Percentage must be a valid number';
                                    }
                                    if (numValue < 0) {
                                        return 'Amount/Percentage cannot be negative';
                                    }
                                    const currentCalculationType = getValues('HRMED_AmountPercentFlag') || calculationType;
                                    if (currentCalculationType === 'Amount') {
                                        if (numValue > 9999999999) {
                                            return 'Amount must not exceed 10 digits';
                                        }
                                    } else if (currentCalculationType === 'Percentage') {
                                        if (numValue > 100) {
                                            return 'Percentage must not exceed 100';
                                        }
                                        if (value.length > 5) {
                                            return 'Percentage must not exceed 5 characters (e.g., 99.99)';
                                        }
                                    }
                                    return true;
                                }
                            })}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_Order'>Order</Label>
                        <Input
                            type='number'
                            id='HRMED_Order'
                            {...register('HRMED_Order', {
                                valueAsNumber: true
                            })}
                        />
                        {errors.HRMED_Order && <FormError>{errors.HRMED_Order.message}</FormError>}
                    </div>
                    <div className='group flex items-center gap-2'>
                        <Input type='checkbox' id='HRMED_ReviseFlg' className='h-4 w-4' {...register('HRMED_ReviseFlg')} />
                        <Label htmlFor='HRMED_ReviseFlg' className='cursor-pointer'>
                            Revise
                        </Label>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Earning/Deduction
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
