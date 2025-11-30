'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGender } from '@/hooks/hrms/useMasters';
import { GENDER_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { GenderItem, MasterGenderInput } from '@/types/hrms/master-gender';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface UpdateGenderFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: GenderItem;
}
export default function UpdateGenderForm({ onSuccess, className = '', selectedRow: row }: UpdateGenderFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGender(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterGenderInput>({
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                IVRMMG_Id: row.IVRMMG_Id,
                MI_Id: row.MI_Id,
                IVRMMG_GenderName: row.IVRMMG_GenderName,
                IVRMMG_ActiveFlag: row.IVRMMG_ActiveFlag
            });
        }
    }, [row, reset]);
    const onSubmit = async (data: MasterGenderInput) => {
        const sanitizedData: MasterGenderInput = {
            ...data,
            IVRMMG_GenderName: data.IVRMMG_GenderName?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Gender updated successfully');
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to update gender');
            }
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                error?.data?.message ||
                'Failed to update gender';
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
                    <input type='hidden' {...register('IVRMMG_Id', { valueAsNumber: true })} />
                    <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='IVRMMG_GenderName'>
                            Gender Name <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='IVRMMG_GenderName'
                            placeholder='Enter gender name'
                            maxLength={GENDER_VALIDATION.HRMGEN_GenderName.maxLength?.value}
                            error={errors.IVRMMG_GenderName?.message}
                            defaultValue={row.IVRMMG_GenderName}
                            {...register('IVRMMG_GenderName', GENDER_VALIDATION.HRMGEN_GenderName)}
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
                            Save Gender
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
