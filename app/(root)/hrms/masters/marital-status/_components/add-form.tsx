'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterMaritalStatus } from '@/hooks/hrms/useMasters';
import { MARITAL_STATUS_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface AddMaritalStatusFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddMaritalStatusForm({ onSuccess, className = '' }: AddMaritalStatusFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterMaritalStatus(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterMaritalStatusInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            IVRMMMS_MaritalStatus: '',
            IVRMMMS_ActiveFlag: true
        }
    });
    const onSubmit = async (data: MasterMaritalStatusInput) => {
        const sanitizedData: MasterMaritalStatusInput = {
            ...data,
            IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Marital status added successfully');
                reset();
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to add marital status');
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to add marital status';
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
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='IVRMMMS_MaritalStatus'>
                            Marital Status <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='IVRMMMS_MaritalStatus'
                            placeholder='Enter marital status'
                            maxLength={MARITAL_STATUS_VALIDATION.HRMMS_MaritalStatus.maxLength?.value}
                            error={errors.IVRMMMS_MaritalStatus?.message}
                            {...register('IVRMMMS_MaritalStatus', MARITAL_STATUS_VALIDATION.HRMMS_MaritalStatus)}
                        />
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
                            Save Marital Status
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
