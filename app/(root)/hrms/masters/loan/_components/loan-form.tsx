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

interface LoanFormProps {
    selectedRow?: MasterLoanDetail;
    onSuccess?: () => void;
}

export default function LoanForm({ selectedRow, onSuccess }: LoanFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterLoan(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterLoanInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRML_LoanType: '',
            HRML_Max: 0,
            HRMLN_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            const formData = {
                HRMLN_Id: selectedRow.HRMLN_Id,
                MI_Id: selectedRow.MI_Id,
                HRML_LoanType: selectedRow.HRML_LoanType,
                HRML_Max: selectedRow.HRML_Max,
                HRMLN_ActiveFlag: selectedRow.HRMLN_ActiveFlag
            };
            reset(formData);
        }
        // else: no selected row, form remains empty
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterLoanInput) => {
        // Trim whitespace from text fields
        const sanitizedData: MasterLoanInput = {
            ...data,
            HRML_LoanType: data.HRML_LoanType?.trim() || ''
        };

        try {
            const res = await saveMutation.mutateAsync(sanitizedData);

            if (res?.success) {
                // Use the actual message from the API response
                const successMsg = res?.message || (isEditMode ? 'Loan type updated successfully' : 'Loan type added successfully');
                toast.success(successMsg);
                if (!isEditMode) {
                    reset();
                }
                refetchAll();
                if (onSuccess) onSuccess();
            } else {
                // Show the actual error message from the API response
                const errorMsg = res?.message || (isEditMode ? 'Failed to update loan type' : 'Failed to add loan type');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            // Handle actual errors (network errors, etc.)
            const errorMsg =
                error?.response?.data?.message || error?.message || (isEditMode ? 'Failed to update loan type' : 'Failed to add loan type');
            console.error('🔴 [BROWSER] Loan form error:', error);
            toast.error(errorMsg);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <input type='hidden' {...register('HRMLN_Id')} />
            <input type='hidden' {...register('MI_Id')} />

            <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRML_LoanType'>
                            Loan Type <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRML_LoanType'
                            placeholder='Enter loan type'
                            maxLength={LOAN_TYPE_VALIDATION.HRML_LoanType.maxLength?.value}
                            error={errors.HRML_LoanType?.message}
                            {...register('HRML_LoanType', LOAN_TYPE_VALIDATION.HRML_LoanType)}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <Controller
                        name='HRML_Max'
                        control={control}
                        rules={LOAN_TYPE_VALIDATION.HRML_Max}
                        render={({ field }) => {
                            // Callback ref to attach input listener when element is mounted
                            const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                if (!containerElement) return;

                                // Find the actual input element inside the NumberField
                                const findInput = () => {
                                    return containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                };

                                // Try to find input immediately, or after a short delay for React Aria rendering
                                const attachListener = () => {
                                    const inputElement = findInput();
                                    if (!inputElement) {
                                        setTimeout(attachListener, 50);
                                        return;
                                    }

                                    // Check if listener is already attached to avoid duplicates
                                    if ((inputElement as any).__dirtyHandlerAttached) {
                                        return;
                                    }

                                    const handleInput = (e: Event) => {
                                        const target = e.target as HTMLInputElement;
                                        const inputValue = target.value.trim();

                                        // Only process if there's a valid number
                                        if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                            const numValue = Number(inputValue);
                                            // Get current value from the field to compare
                                            const currentValue = field.value || 0;
                                            // Check if value actually changed to avoid unnecessary updates
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

            <div className='flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-start sm:items-center'>
                <Button
                    type='submit'
                    disabled={isSubmitting || (isEditMode && !isDirty)}
                    className='h-8 w-auto rounded-md px-4 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90'
                    isLoading={isSubmitting}
                    loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                    {isEditMode ? 'Update' : 'Save'}
                </Button>
                <Button
                    type='button'
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className='h-8 w-auto rounded-md px-4 py-1.5 text-sm bg-secondary text-secondary-foreground hover:opacity-90'>
                    Clear
                </Button>
            </div>
        </form>
    );
}
