'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterModeOfPayment } from '@/hooks/fees/useMasters';
import { feeConfigSchema } from '@/schemas/fees/masters';
import { addOrUpdateModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeConfigSchema.addOrUpdate>;

interface AddFeeConfigProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddFeeConfigForm({ onSuccess, className = '' }: AddFeeConfigProps) {
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
        resolver: zodResolver(feeConfigSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            // const { ivrmmoD_ModeOfPayment, ivrmmoD_ModeOfPayment_Code } = data;
            const payload = {
                // mi_id: 30,
                // IVRMMOD_ModeOfPayment: ivrmmoD_ModeOfPayment,
                // IVRMMOD_ModeOfPayment_Code: ivrmmoD_ModeOfPayment_Code
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
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='group flex flex-col gap-1.5'>
                        <Label aria-label='Preadmission Class' htmlFor='asmcl_preadmflag'>
                            Preadmission Class <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <RadioGroup
                            value={String(watch('FMC_GroupOrTermFlg'))}
                            onValueChange={(value) => setValue('FMC_GroupOrTermFlg', String(value))}
                            className='flex gap-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='1' id='yes' />
                                <Label aria-label='Yes' htmlFor='yes'>
                                    Yes
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='0' id='no' />
                                <Label aria-label='No' htmlFor='no'>
                                    No
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Mode Of Payment'
                            required
                            id='PartialPayment'
                            {...register('PartialPayment')}
                            error={errors.PartialPayment?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        {/* <div className='group flex flex-col gap-1.5'>
                            <InputText
                                label='Mode Of Payment Code'
                                required
                                id='IVRMMOD_ModeOfPayment_Code'
                                {...register('ivrmmoD_ModeOfPayment_Code')}
                                error={errors.ivrmmoD_ModeOfPayment_Code?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                            {errors.ivrmmoD_ModeOfPayment_Code && <FormError>{errors.ivrmmoD_ModeOfPayment_Code.message}</FormError>}
                        </div> */}
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='group flex flex-col gap-1.5'>
                    <div className='group flex flex-row gap-6'>
                        <Controller
                            name='FinancialAccount'
                            control={control}
                            defaultValue='0' // Set default as "0" (unchecked)
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={field.value === '1'}
                                        onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                        id='FinancialAccount'
                                    />
                                    <Label htmlFor='FinancialAccount'>ECS Flag</Label>
                                </div>
                            )}
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
                            Save Master Mode Of Payment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
