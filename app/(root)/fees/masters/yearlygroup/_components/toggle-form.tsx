'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterFeeYearlyGroup } from '@/hooks/fees/useMasters';
import { YearlyGroupSchema } from '@/schemas/fees/masters';
import { toggleMasterclassYearlyCategory } from '@/server/fees/masters/class_yearly_category';
import type { IMaasterFeesYearlyGrouping } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof YearlyGroupSchema.delete>;

interface ToggleYearColumnFormProps {
    rowData: IMaasterFeesYearlyGrouping;
    onClose: () => void;
}

export default function ToggleYearColumnForm({ rowData, onClose }: ToggleYearColumnFormProps) {
    const { refetchAll } = useMasterFeeYearlyGroup();

    // Normalize boolean/number safely
    const isActive = typeof rowData.fmI_ActiveFlag === 'number' ? rowData.fmI_ActiveFlag === 1 : Boolean(rowData.fmI_ActiveFlag);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(YearlyGroupSchema.delete),
        mode: 'onChange',
        defaultValues: {
            fyG_Id: rowData.fmG_Id
        }
    });

    const closeDialog = () => {
        onClose();
        reset();
    };

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const response = await toggleMasterclassYearlyCategory(rowData.mI_Id, Number(formData.fyG_Id));

            if (response.success) {
                toast.success(response.message || 'Status updated successfully!');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to update status.');
            }
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Yearly Group Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fyG_Id', { valueAsNumber: true })} defaultValue={rowData.fmG_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.fmG_GroupName}</strong>?
                    </p>

                    <FormError>{errors.fyG_Id?.message}</FormError>
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
