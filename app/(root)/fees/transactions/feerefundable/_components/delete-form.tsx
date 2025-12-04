'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterPaymentgatewaydetails } from '@/hooks/fees/useMasters';
import { feesRefundableSchema } from '@/schemas/fees/trasactions';
import { deleteFeeRefundableDetails } from '@/server/fees/trasactions/fee_refundable';
import type { IFeeRefundableList } from '@/types/fees/transactions/transactions';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feesRefundableSchema.delete>;

interface DeleteFeeRefundableFormProps {
    rowData: IFeeRefundableList;
    onClose: () => void;
}

export default function DeleteFeeRefundableForm({ rowData, onClose }: DeleteFeeRefundableFormProps) {
    const { refetchAll } = useMasterPaymentgatewaydetails();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesRefundableSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await deleteFeeRefundableDetails(Number(rowData.fr_id));
            if (response?.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Delete Fee Refundable' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fR_Id')} defaultValue={rowData.fr_id} />
                    <p>Are you sure you want to permanently delete The selected Data</p>
                    <FormError>{errors.fR_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant='destructive'>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
