import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import { EARNING_DEDUCTION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { EarningsDeductionDetail, MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface EarningsDeductionsFormProps {
    selectedRow?: EarningsDeductionDetail;
    onSuccess?: () => void;
    typeDropdown?: any[];
}

export default function EarningsDeductionsForm({ selectedRow, onSuccess, typeDropdown = [] }: EarningsDeductionsFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterEarningsDeductions(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        control,
        getValues,
        trigger,
        formState: { errors, isDirty }
    } = useForm<MasterEarningsDeductionsInput>({
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

    // Watch the calculation type to dynamically update label and validation
    const calculationType = useWatch({
        control,
        name: 'HRMED_AmountPercentFlag',
        defaultValue: 'Amount'
    });

    // Re-validate value field when calculation type changes
    useEffect(() => {
        trigger('HRMED_AmountPercent');
    }, [calculationType, trigger]);

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMED_Id: selectedRow.HRMED_Id,
                MI_Id: selectedRow.MI_Id,
                HRMED_Name: selectedRow.HRMED_Name,
                HRMED_EDTypeFlag: selectedRow.HRMED_EDTypeFlag,
                HRMED_EarnDedFlag: selectedRow.HRMED_EarnDedFlag,
                HRMED_AmountPercentFlag: selectedRow.HRMED_AmountPercentFlag,
                HRMED_AmountPercent: selectedRow.HRMED_AmountPercent,
                HRMED_ActiveFlag: selectedRow.HRMED_ActiveFlag,
                HRMED_RoundOffFlag: selectedRow.HRMED_RoundOffFlag,
                HRMED_Order: selectedRow.HRMED_Order,
                HRMED_ReviseFlg: selectedRow.HRMED_ReviseFlg
            });
        } else {
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterEarningsDeductionsInput) => {
        const _timestamp = new Date().toISOString();
        const _isUpdate = !!(isEditMode && data.HRMED_Id);

        if (isEditMode && !data.HRMED_Id) {
            console.warn('⚠️ [BROWSER] Edit mode but no HRMED_Id provided');
        }

        try {
            const requestStartTime = Date.now();
            const res = await saveMutation.mutateAsync(data);
            const _requestDuration = Date.now() - requestStartTime;

            if (res?.success) {
                const successMsg =
                    res?.message || (isEditMode ? 'Earning/Deduction updated successfully' : 'Earning/Deduction added successfully');

                if (res?.data) {
                }

                toast.success(successMsg);

                // Reset form if in add mode
                if (!isEditMode) {
                    reset();
                }
                refetchAll();

                // Call success callback (closes the form)
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const errorMsg = res?.message || (isEditMode ? 'Failed to update earning/deduction' : 'Failed to add earning/deduction');

                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔴 [BROWSER] Error Type:', error?.constructor?.name || 'Unknown');
            console.error('🔴 [BROWSER] Error Message:', error?.message);
            console.error('🔴 [BROWSER] Error Stack:', error?.stack);
            console.error('🔴 [BROWSER] Error Object:', error);

            if (error?.response) {
                console.error('🔴 [BROWSER] Error Response Status:', error.response?.status);
                console.error('🔴 [BROWSER] Error Response Data:', JSON.stringify(error.response?.data, null, 2));
                console.error('🔴 [BROWSER] Error Response Headers:', error.response?.headers);
            }

            if (error?.request) {
                console.error('🔴 [BROWSER] Error Request:', error.request);
            }

            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                error?.data?.message ||
                (isEditMode ? 'Failed to update earning/deduction' : 'Failed to add earning/deduction');

            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden fields for IDs */}
            {isEditMode && <input type='hidden' {...register('HRMED_Id', { valueAsNumber: true })} />}
            <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_Name'>
                    Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMED_Name'
                    placeholder='Enter earning/deduction name'
                    {...register('HRMED_Name', EARNING_DEDUCTION_VALIDATION.HRMED_Name)}
                />
                {errors.HRMED_Name && <FormError>{errors.HRMED_Name.message}</FormError>}
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
                            // Re-validate the value field when calculation type changes
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
                <InputText
                    id='HRMED_AmountPercent'
                    placeholder={`Enter ${calculationType === 'Percentage' ? 'percentage' : 'amount'}`}
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
                            // Get current calculation type from form values
                            const currentCalculationType = getValues('HRMED_AmountPercentFlag') || calculationType;
                            if (currentCalculationType === 'Amount') {
                                // Amount: up to 10 digits (e.g., 9999999999)
                                if (numValue > 9999999999) {
                                    return 'Amount must not exceed 10 digits';
                                }
                            } else if (currentCalculationType === 'Percentage') {
                                // Percentage: 0-100, up to 5 digits including decimal (e.g., 99.99)
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
                {errors.HRMED_AmountPercent && <FormError>{errors.HRMED_AmountPercent.message}</FormError>}
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
            <div className='col-span-full flex gap-2'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending || (isEditMode && !isDirty)}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
                {isEditMode && !isDirty && <span className='mt-2 flex items-center text-muted-foreground text-sm'>No changes made</span>}
            </div>
        </form>
    );
}
