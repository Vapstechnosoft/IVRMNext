'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasters';
import { LOAN_TYPE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterLoanDetail, MasterLoanInput } from '@/types/hrms/master-loan';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface UpdateLoanFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: MasterLoanDetail;
}
export default function UpdateLoanForm({ onSuccess, className = '', selectedRow: row }: UpdateLoanFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterLoan(roleId);
    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterLoanInput>({
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                HRMLN_Id: row.HRMLN_Id,
                MI_Id: row.MI_Id,
                HRML_LoanType: row.HRML_LoanType,
                HRML_Max: row.HRML_Max,
                HRMLN_ActiveFlag: row.HRMLN_ActiveFlag
            });
        }
    }, [row, reset]);
    const onSubmit = async (data: MasterLoanInput) => {
        const sanitizedData: MasterLoanInput = {
            ...data,
            HRML_LoanType: data.HRML_LoanType?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Loan type updated successfully');
                refetchAll();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || 'Failed to update loan type');
            }
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message || error?.message || 'Failed to update loan type';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={className}>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <input type='hidden' {...register('HRMLN_Id')} />
                        <input type='hidden' {...register('MI_Id')} />
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRML_LoanType'>
                                Loan Type <span className='text-destructive'>*</span>
                            </Label>
                            <HRMSInputText
                                id='HRML_LoanType'
                                placeholder='Enter loan type'
                                maxLength={LOAN_TYPE_VALIDATION.HRML_LoanType.maxLength?.value}
                                onKeyDown={(e) => {
                                    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                        return;
                                    }
                                    const allowedPattern = /^[a-zA-Z\s]$/;
                                    if (!allowedPattern.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                error={errors.HRML_LoanType?.message}
                                defaultValue={row.HRML_LoanType}
                                {...register('HRML_LoanType', LOAN_TYPE_VALIDATION.HRML_LoanType)}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                        <Controller
                            name='HRML_Max'
                            control={control}
                            rules={LOAN_TYPE_VALIDATION.HRML_Max}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () =>
                                        containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
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
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRML_Max', numValue, { shouldDirty: true, shouldValidate: true });
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
                                            label='Maximum Amount'
                                            required
                                            id='HRML_Max'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRML_Max', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRML_Max?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
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
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Loan Type
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
