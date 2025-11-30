'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasters';
import { SPECIALIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterSpecializationInput } from '@/types/hrms/master-specialization';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface AddSpecializationFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddSpecializationForm({ onSuccess, className = '' }: AddSpecializationFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterSpecialization(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterSpecializationInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMSPL_SpecialisationName: '',
            HRMSPL_ActiveFlg: true
        }
    });
    const onSubmit = async (data: MasterSpecializationInput) => {
        const sanitizedData: MasterSpecializationInput = {
            ...data,
            HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Specialization added successfully');
                reset();
                refetchAll();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || 'Failed to add specialization');
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to add specialization';
            toast.error(errorMessage);
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
                        <Label htmlFor='HRMSPL_SpecialisationName'>
                            Specialization Name <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMSPL_SpecialisationName'
                            placeholder='Enter specialization name'
                            maxLength={SPECIALIZATION_VALIDATION.HRMSPL_SpecialisationName.maxLength?.value || 10}
                            error={errors.HRMSPL_SpecialisationName?.message}
                            {...register('HRMSPL_SpecialisationName', SPECIALIZATION_VALIDATION.HRMSPL_SpecialisationName)}
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
                            Save Specialization
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
