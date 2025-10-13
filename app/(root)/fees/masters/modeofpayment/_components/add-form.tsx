'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterModeOfPayment } from '@/hooks/fees/useMasters';
import { masterModeOfPaymentSchema } from '@/schemas/fees/masters';
import { addOrUpdateModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterModeOfPaymentSchema.addOrUpdate>;

interface AddMasterModeOfPaymentProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterModeOfPaymentForm({ onSuccess, className = '' }: AddMasterModeOfPaymentProps) {
    const { refetchAll } = useMasterModeOfPayment();

    const {
        control,
        watch,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterModeOfPaymentSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { ivrmmoD_ModeOfPayment, ivrmmoD_ModeOfPayment_Code } = data;
            const payload = {
                mi_id: 30,
                IVRMMOD_ModeOfPayment: ivrmmoD_ModeOfPayment,
                IVRMMOD_ModeOfPayment_Code: ivrmmoD_ModeOfPayment_Code
            };

            const response = await addOrUpdateModeOfPayment(payload);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Mode Of Payment'
                            required
                            id='ivrmmoD_ModeOfPayment'
                            {...register('ivrmmoD_ModeOfPayment')}
                            error={errors.ivrmmoD_ModeOfPayment?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <InputText
                                label='Mode Of Payment Code'
                                required
                                id='IVRMMOD_ModeOfPayment_Code'
                                {...register('ivrmmoD_ModeOfPayment_Code')}
                                error={errors.ivrmmoD_ModeOfPayment_Code?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                            {errors.ivrmmoD_ModeOfPayment_Code && <FormError>{errors.ivrmmoD_ModeOfPayment_Code.message}</FormError>}
                        </div>
                    </div>

                    {/* Root Error */}
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
                            Save Master Mode Of Payment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
