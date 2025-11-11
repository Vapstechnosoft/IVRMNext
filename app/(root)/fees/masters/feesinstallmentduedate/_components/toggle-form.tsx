'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterFeeInstallmentDueDate } from '@/hooks/fees/useMasters';
import { masterInstallmentSchema } from '@/schemas/fees/masters';
import { toggleMasterfeeInstallmentDueDate } from '@/server/fees/masters/feeinstallmentduedate';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterInstallmentSchema.delete>;

interface ToggleMasterInstallmentFormProps {
    rowData: IMasterFeesInstallmentDueDateList;
    onClose: () => void;
}

export default function ToggleMasterInstallmentDueDateForm({ rowData, onClose }: ToggleMasterInstallmentFormProps) {
    const { refetchAll } = useMasterFeeInstallmentDueDate();

    // Normalize boolean/number safely
    const isActive =
        typeof (rowData as any).fmI_ActiveFlag === 'number'
            ? (rowData as any).fmI_ActiveFlag === 1
            : Boolean((rowData as any).fmI_ActiveFlag);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstallmentSchema.delete),
        mode: 'onChange'
    });

    const closeDialog = () => {
        onClose();
        reset();
    };

    const onSubmit: SubmitHandler<FormFields> = async (_formData) => {
        try {
            await toggleMasterfeeInstallmentDueDate(30, rowData.mI_Id);
            const response = await toggleMasterfeeInstallmentDueDate(30, rowData.mI_Id);

            if (response.success) {
                toast.success(response.message || 'Status updated successfully!');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to update status.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Installment Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fmI_Id', { valueAsNumber: true })} defaultValue={rowData.fmI_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.fmI_Name}</strong>?
                    </p>

                    <FormError>{errors.fmI_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>

                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
