'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { HomeWorkUploadedList } from '@/hooks/upload/transactions/useHomeWork';
import { homeWorkSchema } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { toggleUploadHomeWork } from '@/server/upload/transactions/ivrm-homework/server-action';

import { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// Define the form fields type based on the schema
type FormFields = z.infer<typeof homeWorkSchema.delete>;

interface ToggleHomeWorkFormProps {
    rowData: IHomeWorkDetails;
    onClose: () => void;
}

export default function ToggleHomeWorkForm({ rowData, onClose }: ToggleHomeWorkFormProps) {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(homeWorkSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await toggleUploadHomeWork(Number(rowData.ihW_Id));

            if (response.success) {
                toast.success(response.message);
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Home Work Upload Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ihW_Id')} defaultValue={rowData.ihW_Id ?? ''} />
                    <p>
                        Are you sure you want to {rowData.ihW_ActiveFlag ? 'deactivate' : 'activate'} <strong>{rowData.ihW_Topic}</strong> ?
                    </p>

                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={rowData.ihW_ActiveFlag ? 'destructive' : 'default'}>
                        {rowData.ihW_ActiveFlag ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
