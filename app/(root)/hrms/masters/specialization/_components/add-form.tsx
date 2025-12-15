'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterSpecialization } from '@/hooks/hrms/useMasters';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateMasterSpecialization } from '@/server/hrms/hrmsConfig/master/specialization';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type FieldErrors, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hrmsMasterSchemas.specialization.add>;

interface AddSpecializationFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddSpecializationForm({ onSuccess, className = '' }: AddSpecializationFormProps) {
    const { refetchAll } = useMasterSpecialization();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.specialization.add),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                hrmspL_Id: 0,
                hrmspL_SpecialisationName: data.hrmspL_SpecialisationName?.trim() || '',
                hrmspL_ActiveFlag: true
            };
            const response = await addOrUpdateMasterSpecialization(payload);

            if (response?.success) {
                toast.success(response?.message || 'Specialization saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save specialization');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save specialization');
        }
    };

    const handleReset = () => {
        reset();
    };

    const onError = (errors: FieldErrors<FormFields>) => {
        // Show first error message
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
            toast.error(firstError.message);
        } else {
            toast.error('Please fix the validation errors before submitting');
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Specialization Name'
                            required
                            id='hrmspL_SpecialisationName'
                            placeholder='Enter specialization name'
                            maxLength={50}
                            {...register('hrmspL_SpecialisationName')}
                            error={errors.hrmspL_SpecialisationName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
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
