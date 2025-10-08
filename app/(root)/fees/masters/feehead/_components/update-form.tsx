'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterFeehead } from '@/hooks/fees/useMasters';
import { masterFeeheadSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterfeehead } from '@/server/fees/masters/feehead';
import type { IFeeHeadsList } from '@/types/fees/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterFeeheadSchema.addOrUpdate>;

interface UpdateMasterFeeheadFormProps {
    onSuccess?: () => void;
    feeheadname?: string;
    selectedRow: IFeeHeadsList;
}

export default function UpdateMasterFeeheadForm({ onSuccess, feeheadname = '', selectedRow: row }: UpdateMasterFeeheadFormProps) {
    const { refetchAll } = useMasterFeehead();

    const {
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterFeeheadSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                fmH_Id: row.fmH_Id,
                fmH_FeeName: row.fmH_FeeName,
                fmH_Order: row.fmH_Order,
                fmH_Flag: row.fmH_Flag
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { fmH_FeeName, fmH_Id, fmH_Flag, fmH_Order } = data;
            const payload = {
                MI_Id: 30,
                fmH_Id: fmH_Id,
                fmH_FeeName: fmH_FeeName,
                fmH_Flag: fmH_Flag,
                ASMCL_ActiveFlag: true,
                fmH_Order: fmH_Order
            };
            console.log('updatedata', payload);
            const response = await addOrUpdateMasterfeehead(payload);

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

    console.log('ERROR', errors);

    return (
        <div className={`${feeheadname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Fees Head'
                            required
                            id='fmH_FeeName'
                            {...register('fmH_FeeName')}
                            defaultValue={row.fmH_FeeName}
                            error={errors.fmH_FeeName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Fees Head Type'
                            required
                            id='fmH_Flag'
                            {...register('fmH_Flag')}
                            defaultValue={row.fmH_Flag}
                            error={errors.fmH_Flag?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
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
                            Save Master Fee Head
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
