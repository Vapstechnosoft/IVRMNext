'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasters';
import { SPECIALIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterSpecializationInput, SpecializationItem } from '@/types/hrms/master-specialization';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface UpdateSpecializationFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: SpecializationItem;
}
export default function UpdateSpecializationForm({ onSuccess, className = '', selectedRow: row }: UpdateSpecializationFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterSpecialization(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterSpecializationInput>({
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                HRMSPL_Id: row.HRMSPL_Id,
                MI_Id: row.MI_Id,
                HRMSPL_SpecialisationName: row.HRMSPL_SpecialisationName,
                HRMSPL_ActiveFlg: row.HRMSPL_ActiveFlg
            });
        }
    }, [row, reset]);
    const onSubmit = async (data: MasterSpecializationInput) => {
        const sanitizedData: MasterSpecializationInput = {
            ...data,
            HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Specialization updated successfully');
                refetchAll();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || 'Failed to update specialization');
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update specialization';
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
                            defaultValue={row.HRMSPL_SpecialisationName}
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
                        disabled={isSubmitting || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Specialization
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
