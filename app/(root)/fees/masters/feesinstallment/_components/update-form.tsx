'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';

import { useMasterFeeInstallment } from '@/hooks/fees/useMasters';
import { masterInstallmentSchema } from '@/schemas/fees/masters';
import { addOrUpdateInsallment } from '@/server/fees/masters/feeinstallment';
import type { IMasterFeesInstallmentList } from '@/types/fees/masters';

type FormFields = z.infer<typeof masterInstallmentSchema.addOrUpdate> & {
    fmI_Id?: number;
};

interface UpdateMasterFeeheadFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterFeesInstallmentList;
}

export default function UpdateMasterFeeheadForm({ onSuccess, selectedRow: row }: UpdateMasterFeeheadFormProps) {
    const { refetchAll } = useMasterFeeInstallment();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstallmentSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                fmI_Id: row.fmI_Id,
                fmI_Name: row.fmI_Name,
                fmI_Installment_Type: row.fmI_Installment_Type,
                fmI_No_Of_Installments: row.fmI_No_Of_Installments,
                installments: [{ sno: 1, ftI_Name: row.ftI_Name || '' }]
            });
        }
    }, [row, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                fmI_Id: data.fmI_Id ?? row.fmI_Id,
                mI_ID: row.mI_ID ?? 30,
                fmI_Name: data.fmI_Name,
                fmI_Installment_Type: data.fmI_Installment_Type,
                fmI_No_Of_Installments: data.fmI_No_Of_Installments,
                installments: data.installments,
                fmI_ActiveFlag: row.fmI_ActiveFlag
            };

            const response = await addOrUpdateInsallment(payload);

            if (response.success) {
                toast.success('Master Installment updated successfully!');
                refetchAll();
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update installment');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => reset();

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <input type='hidden' value={row.fmI_Id} {...control.register('fmI_Id')} />

                    {/* Master Installment Name */}
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Name'>
                            Master Installment Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='fmI_Name'
                            control={control}
                            render={({ field }) => <InputText id='fmI_Name' placeholder='Enter master installment name' {...field} />}
                        />
                        {errors.fmI_Name && <FormError>{errors.fmI_Name.message}</FormError>}
                    </div>

                    {/* Installment Type */}
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Installment_Type'>
                            Installment Type <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='fmI_Installment_Type'
                            control={control}
                            render={({ field }) => <InputText id='fmI_Installment_Type' placeholder='Enter installment type' {...field} />}
                        />
                        {errors.fmI_Installment_Type && <FormError>{errors.fmI_Installment_Type.message}</FormError>}
                    </div>
                </div>

                {/* No of Installments */}
                <div className='grid grid-cols-1 sm:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_No_Of_Installments'>No. of Installments</Label>
                        <Controller
                            name='fmI_No_Of_Installments'
                            control={control}
                            render={({ field }) => (
                                <input
                                    id='fmI_No_Of_Installments'
                                    type='number'
                                    min='1'
                                    {...field}
                                    placeholder='Enter number of installments'
                                    className='w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                />
                            )}
                        />
                        {errors.fmI_No_Of_Installments && <FormError>{errors.fmI_No_Of_Installments.message}</FormError>}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                        disabled={isSubmitting}>
                        Reset
                    </Button>

                    <Button
                        type='submit'
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Master Installment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
