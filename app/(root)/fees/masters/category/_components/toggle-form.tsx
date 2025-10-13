'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterClassCategory } from '@/hooks/fees/useMasters';
import { masterClassSchema } from '@/schemas/fees/masters';
import { toggleMasterclassYearlyCategory } from '@/server/fees/masters/class_yearly_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.delete>;

interface MasterClassYearlyDataCategoryFormProps {
    rowData: {
        amC_Name: string;
        asmcL_ClassName: string;
        is_Active: boolean;
        asmcC_Id: number;
        mi_id: number;
    };
    onClose: () => void;
}

export default function MasterClassYearlyDataCategoryForm({ rowData, onClose }: MasterClassYearlyDataCategoryFormProps) {
    const { refetchAll } = useMasterClassCategory();
    const isActive = rowData.is_Active;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleMasterclassYearlyCategory(rowData.mi_id, rowData.asmcC_Id);

            if (response.success) {
                toast.success(`${rowData.amC_Name} - ${rowData.asmcL_ClassName} successfully ${isActive ? 'deactivated' : 'activated'}`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message || 'Something went wrong');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to toggle category');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Class Category Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('asmS_Id')} defaultValue={rowData.asmcC_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>
                            {rowData.amC_Name} - {rowData.asmcL_ClassName}
                        </strong>
                        ?
                    </p>
                    <FormError>{errors.asmS_Id?.message}</FormError>
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
