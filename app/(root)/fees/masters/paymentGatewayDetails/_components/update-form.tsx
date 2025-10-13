'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterPaymentgatewaydetails } from '@/hooks/fees/useMasters';
import { paymentgatewaydetailsSchema } from '@/schemas/fees/masters';
import { addOrUpdatepaymentgatewaydetails } from '@/server/fees/masters/fee_payment_gateway_details';
import type { IMasterPaymentGatewayList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof paymentgatewaydetailsSchema.addOrUpdate>;

interface UpdatePaymentGatewaydetailsFormProps {
    onSuccess?: () => void;
    fpgD_MerchantId?: string;

    selectedRow: IMasterPaymentGatewayList;
}

export default function UpdatepaymentGatewaydetailsForm({
    onSuccess,
    fpgD_MerchantId = '',
    selectedRow: row
}: UpdatePaymentGatewaydetailsFormProps) {
    const { refetchAll } = useMasterPaymentgatewaydetails();

    const {
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(paymentgatewaydetailsSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                fpgD_Id: row.fpgD_Id,
                fpgD_MerchantId: row.fpgD_MerchantId,
                fpgD_SaltKey: row.fpgD_SaltKey
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { fpgD_Id, fpgD_MerchantId, fpgD_SaltKey } = data;
            const payload = {
                mi_id: 30,
                fpgD_Id: fpgD_Id,
                fpgD_MerchantId: fpgD_MerchantId,

                fpgD_SaltKey: fpgD_SaltKey
            };
            const response = await addOrUpdatepaymentgatewaydetails(payload);

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
        <div className={`${fpgD_MerchantId}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                    <InputText
                        label='MerchantId'
                        required
                        id='fpgD_MerchantId'
                        {...register('fpgD_MerchantId')}
                        error={errors.fpgD_MerchantId?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />
                    <div className='group flex flex-col gap-1.5'>
                        <InputText
                            label='Salt Key'
                            required
                            id='fpgD_SaltKey'
                            {...register('fpgD_SaltKey')}
                            error={errors.fpgD_SaltKey?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        {errors.fpgD_SaltKey && <FormError>{errors.fpgD_SaltKey.message}</FormError>}
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
                            Save Payment Gateway Details
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
