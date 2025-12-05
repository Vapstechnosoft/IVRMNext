'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useReligionCategoryMappingCRUD } from '@/hooks/hrms/useMasters';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    IRCC_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleReligionCategoryMappingFormProps {
    rowData: ReligionCategoryMappingDetail;
    onClose: () => void;
}

export default function ToggleReligionCategoryMappingForm({ rowData, onClose }: ToggleReligionCategoryMappingFormProps) {
    const { toggleMutation, refetchAll } = useReligionCategoryMappingCRUD();
    const isActive = rowData.IRCC_ActiveFlg;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange',
        defaultValues: {
            IRCC_Id: rowData.IRCC_Id
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleMutation.mutateAsync(rowData.IRCC_Id);

            if (response?.success) {
                toast.success(response?.message || `Mapping ${!isActive ? 'activated' : 'deactivated'} successfully`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} mapping`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} mapping`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Religion-Category Mapping Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('IRCC_Id', { valueAsNumber: true })} defaultValue={rowData.IRCC_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} mapping for{' '}
                        <strong>
                            {rowData.IVRMMR_Name} - {rowData.IMCC_CategoryName}
                        </strong>
                        ?
                    </p>
                    <FormError>{errors.IRCC_Id?.message}</FormError>
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
