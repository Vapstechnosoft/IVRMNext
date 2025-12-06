'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import type { EarningsDeductionDetail } from '@/types/hrms/master-earnings-deductions';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    HRMED_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleMasterEarningsDeductionsFormProps {
    rowData: EarningsDeductionDetail;
    onClose: () => void;
}

export default function ToggleMasterEarningsDeductionsForm({ rowData, onClose }: ToggleMasterEarningsDeductionsFormProps) {
    const { toggleMutation, refetchAll } = useMasterEarningsDeductions(HRMS_MI_ID);
    const isActive = rowData.HRMED_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange',
        defaultValues: {
            HRMED_Id: rowData.HRMED_Id
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleMutation.mutateAsync({
                HRMED_Id: rowData.HRMED_Id,
                HRMED_ActiveFlag: !isActive,
                MI_Id: HRMS_MI_ID
            });

            if (response?.success) {
                toast.success(response?.message || `Earnings/Deduction ${!isActive ? 'activated' : 'deactivated'} successfully`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} earnings/deduction`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} earnings/deduction`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Earnings/Deduction Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('HRMED_Id', { valueAsNumber: true })} defaultValue={rowData.HRMED_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.HRMED_Name}</strong>?
                    </p>
                    <FormError>{errors.HRMED_Id?.message}</FormError>
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
