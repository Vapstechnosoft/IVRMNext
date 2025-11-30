'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEmployeeType } from '@/hooks/hrms/useMasters';
import { employeeTypeSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type FormFields = z.infer<typeof employeeTypeSchema.addOrUpdate>;
interface AddEmployeeTypeFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddEmployeeTypeForm({ onSuccess, className = '' }: AddEmployeeTypeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterEmployeeType(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeTypeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMET_EmployeeType: '',
            HRMET_ActiveFlag: true
        }
    });
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Trim whitespace from text fields
        const sanitizedData = {
            ...data,
            HRMET_EmployeeType: data.HRMET_EmployeeType?.trim() || ''
        };
        try {
            const response = await saveMutation.mutateAsync(sanitizedData);
            if (response?.success) {
                toast.success(response.message || 'Employee type saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save employee type');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <HRMSInputText
                            label='Employee Type'
                            required
                            id='HRMET_EmployeeType'
                            placeholder='Enter employee type'
                            maxLength={50}
                            onKeyDown={(e) => {
                                // Only allow letters, spaces, and control keys
                                const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                                if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                    return; // Allow control keys
                                }
                                // Allow letters (a-z, A-Z) and spaces
                                const allowedPattern = /^[a-zA-Z\s]$/;
                                if (!allowedPattern.test(e.key)) {
                                    e.preventDefault(); // Block numbers and special characters
                                }
                            }}
                            {...register('HRMET_EmployeeType')}
                            error={errors.HRMET_EmployeeType?.message}
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
                            Save Employee Type
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
