'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterPaymentgateway_dropdown, useMasterPaymentgatewaydetails } from '@/hooks/fees/useMasters';
import { paymentgatewaydetailsSchema } from '@/schemas/fees/masters';
import { addOrUpdatepaymentgatewaydetails } from '@/server/fees/masters/fee_payment_gateway_details';
import type { IMasterPaymentGatewayList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof paymentgatewaydetailsSchema.addOrUpdate>;

interface UpdateFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterPaymentGatewayList;
}

export default function UpdatePaymentGatewayDetailsForm({ onSuccess, selectedRow }: UpdateFormProps) {
    const { refetchAll } = useMasterPaymentgatewaydetails();
    const {
        data: gatewaydata,
        isLoading: gatewayLoading,
        error: gatewayError,
        refetchAll: refetchGateway
    } = useMasterPaymentgateway_dropdown();

    const {
        control,
        register,
        handleSubmit,
        reset,

        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(paymentgatewaydetailsSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            fpgD_MobileActiveFlag: false
        }
    });

    const [submerchantIds, setSubmerchantIds] = useState([{ id: '' }]);

    useEffect(() => {
        if (selectedRow) {
            reset({
                fpgD_MerchantId: selectedRow.fpgD_MerchantId,
                fpgD_SaltKey: selectedRow.fpgD_SaltKey,
                fpgD_Image: selectedRow.fpgD_Image,
                fpgD_URL: selectedRow.fpgD_URL,
                fpgD_AccNo: selectedRow.fpgD_AccNo,
                fpgD_MerchantKey: selectedRow.fpgD_MerchantKey,
                impG_Id: selectedRow.impG_Id,
                fpgD_MobileActiveFlag: selectedRow.fpgD_MobileActiveFlag ?? false
            });

            if (Array.isArray(selectedRow.submerchantIds)) {
                setSubmerchantIds(selectedRow.submerchantIds.map((id: any) => ({ id: id.fpgD_SubMerchantId || id.id })));
            }
        }
    }, [selectedRow, reset]);

    const handleChange = (index: number, value: string) => {
        const updated = [...submerchantIds];
        updated[index].id = value;
        setSubmerchantIds(updated);
    };

    const addNew = () => {
        if (submerchantIds.length < 5) {
            setSubmerchantIds([...submerchantIds, { id: '' }]);
        }
    };

    const remove = (index: number) => {
        const updated = [...submerchantIds];
        updated.splice(index, 1);
        setSubmerchantIds(updated);
    };

    const onSubmit = async (data: FormFields) => {
        const payload = {
            mi_id: 30,
            fpgD_Id: selectedRow.fpgD_Id,
            fpgD_SaltKey: data.fpgD_SaltKey,
            fpgD_MerchantId: data.fpgD_MerchantId,
            fpgD_Image: data.fpgD_Image,
            fpgD_URL: data.fpgD_URL,
            fpgD_AccNo: data.fpgD_AccNo,
            submerchantIds: submerchantIds.filter((item) => item.id.trim() !== '').map((item) => ({ fpgD_SubMerchantId: item.id })),
            fpgD_MerchantKey: data.fpgD_MerchantKey,
            impG_Id: data.impG_Id,
            fpgD_MobileActiveFlag: data.fpgD_MobileActiveFlag
        };

        try {
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <InputText
                    label='Merchant Id'
                    id='fpgD_MerchantId'
                    {...register('fpgD_MerchantId')}
                    error={errors.fpgD_MerchantId?.message}
                />
                <InputText label='Salt Key' id='fpgD_SaltKey' {...register('fpgD_SaltKey')} error={errors.fpgD_SaltKey?.message} />
                <InputText label='Image' id='fpgD_Image' {...register('fpgD_Image')} error={errors.fpgD_Image?.message} />
                <InputText label='URL' id='fpgD_URL' {...register('fpgD_URL')} error={errors.fpgD_URL?.message} />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <InputText label='Account Number' id='fpgD_AccNo' {...register('fpgD_AccNo')} error={errors.fpgD_AccNo?.message} />
                <InputText
                    label='Merchant Key'
                    id='fpgD_MerchantKey'
                    {...register('fpgD_MerchantKey')}
                    error={errors.fpgD_MerchantKey?.message}
                />

                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='impG_Id'>
                        Gateway Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='impG_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Gateway' />
                                </SelectTrigger>
                                <SelectContent>
                                    {gatewayLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : gatewayError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading
                                        </SelectItem>
                                    ) : (
                                        gatewaydata?.data?.map((item) => (
                                            <SelectItem key={item.impG_Id} value={item.impG_Id.toString()}>
                                                {item.impG_PGName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.impG_Id && <FormError>{errors.impG_Id.message}</FormError>}
                </div>

                <div className='col-span-4'>
                    {submerchantIds.map((item, index) => (
                        <div key={index} className='mb-4 flex items-center gap-2'>
                            <InputText
                                id={`submrchntId-${index}`}
                                label={`Sub Merchant Id ${index + 1}`}
                                value={item.id}
                                onChange={(e) => handleChange(index, e.target.value)}
                            />
                            {index === submerchantIds.length - 1 && submerchantIds.length < 5 && (
                                <button type='button' onClick={addNew}>
                                    <Plus className='h-4 w-4' />
                                </button>
                            )}
                            {submerchantIds.length > 1 && (
                                <button type='button' onClick={() => remove(index)}>
                                    <Minus className='h-4 w-4' />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className='group flex items-center space-x-2'>
                <Controller
                    name='fpgD_MobileActiveFlag'
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked: boolean) => field.onChange(checked)}
                            id='fpgD_MobileActiveFlag'
                        />
                    )}
                />
                <Label htmlFor='fpgD_MobileActiveFlag'>Enable Payment in Mobile App</Label>
            </div>

            <div className='flex gap-3 border-t pt-4'>
                <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting}>
                    Reset
                </Button>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Saving...'>
                    <Save className='mr-2 h-4 w-4' />
                    Update Payment Gateway
                </Button>
            </div>
        </form>
    );
}
