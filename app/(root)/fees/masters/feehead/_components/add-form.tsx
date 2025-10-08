'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';

import { InputText } from '@/components/ui/extension/input-text';

import { useMasterFeehead } from '@/hooks/fees/useMasters';
import { masterFeeheadSchema } from '@/schemas/fees/masters';

import { addOrUpdateMasterfeehead } from '@/server/fees/masters/feehead';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterFeeheadSchema.addOrUpdate>;

interface AddMasterFeeHeadProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterFeeHeadForm({ onSuccess, className = '' }: AddMasterFeeHeadProps) {
    const { refetchAll } = useMasterFeehead();

    const {
        control,
        watch,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterFeeheadSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            fmH_Order: 0
        }
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        console.log('API response:', '30');
        try {
            const { fmH_FeeName, fmH_Flag } = data;
            const payload = {
                mi_id: 30,
                fmH_FeeName: fmH_FeeName,
                fmH_Flag: fmH_Flag
            };

            const response = await addOrUpdateMasterfeehead(payload);
            console.log('API response:', response);
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
                        {/* <InputText
                            label='Class Code'
                            required
                            id='asmcl_classcode'
                            {...register('asmcl_classcode')}
                            error={errors.asmcl_classcode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        /> */}
                        <InputText
                            label='Fee Head'
                            required
                            id='fmH_FeeName'
                            {...register('fmH_FeeName')}
                            error={errors.fmH_FeeName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <InputText
                                label='Fee Head Type'
                                required
                                id='fmH_Flag'
                                {...register('fmH_Flag')}
                                error={errors.fmH_Flag?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                            {errors.fmH_Flag && <FormError>{errors.fmH_Flag.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_minageyear'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Min Age (Year)'
                                        required
                                        id='asmcl_minageyear'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmcl_minageyear && <FormError>{errors.asmcl_minageyear.message}</FormError>}
                        </div> */}
                        {/* <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_minagemonth'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Min Age (Month)'
                                        required
                                        id='asmcl_minagemonth'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmcl_minagemonth && <FormError>{errors.asmcl_minagemonth.message}</FormError>}
                        </div> */}
                        <div className='group flex flex-col gap-1.5'>
                            {/* <Controller
                                name='asmcl_minagedays'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Min Age (Days)'
                                        required
                                        id='asmcl_minagedays'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmcl_minagedays && <FormError>{errors.asmcl_minagedays.message}</FormError>} */}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxageyear'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Max Age (Year)'
                                        required
                                        id='asmcl_maxageyear'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmcl_maxageyear && <FormError>{errors.asmcl_maxageyear.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxagemonth'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Max Age (Month)'
                                        required
                                        id='asmcl_maxagemonth'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmcl_maxagemonth && <FormError>{errors.asmcl_maxagemonth.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxagedays'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Max Age (Days)'
                                        required
                                        id='asmcl_maxagedays'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmcl_maxagedays && <FormError>{errors.asmcl_maxagedays.message}</FormError>}
                        </div> */}
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Preadmission Class' htmlFor='asmcl_preadmflag'>
                                Preadmission Class <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <RadioGroup
                                value={String(watch('asmcl_preadmflag'))}
                                onValueChange={(value) => setValue('asmcl_preadmflag', Number(value))}
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
                        </div> */}
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
                            Save Master Fees Head
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
