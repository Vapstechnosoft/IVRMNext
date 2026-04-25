'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterCategoryListData } from '@/hooks/library/useMasters';
import { masterCategorySchema } from '@/schemas/library/masters';
import { toggleMasterCategory } from '@/server/library/masters/library_category';
import type { IMasterCategoryList } from '@/types/library/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterCategorySchema.delete>;

interface ToggleMasterCategoryFormProps {
    rowData: IMasterCategoryList;
    onClose: () => void;
}

export default function ToggleMasterCategoryForm({ rowData, onClose }: ToggleMasterCategoryFormProps) {
    const { refetchAll } = useMasterCategoryListData();
    const isActive = rowData.lmC_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterCategorySchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await toggleMasterCategory(Number(rowData.lmC_Id));

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(typeof error === 'string' ? error : error?.message || 'An unknown error occurred.');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Category' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('lmC_Id')} defaultValue={rowData.lmC_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.lmC_CategoryName}</strong>?
                    </p>
                    <FormError>{errors.lmC_Id?.message}</FormError>
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
