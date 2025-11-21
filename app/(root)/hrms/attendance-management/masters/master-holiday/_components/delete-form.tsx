'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useDeleteMasterHoliday, useMasterHoliday } from '@/hooks/hrms/attendance-management/useMasters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { MasterHoliday } from './columns';

interface DeleteMasterHolidayFormProps {
    rowData: MasterHoliday;
    onClose: () => void;
}

export default function DeleteMasterHolidayForm({ rowData, onClose }: DeleteMasterHolidayFormProps) {
    const { refetchAll } = useMasterHoliday();
    const { mutate: deleteMasterHoliday, isPending } = useDeleteMasterHoliday();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<{ id: number }>({
        resolver: zodResolver(z.object({ id: z.coerce.number() })),
        mode: 'onChange',
        defaultValues: {
            id: Number(rowData.id) || 0
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<{ id: number }> = async () => {
        const idToDelete = Number(rowData.id);
        if (Number.isNaN(idToDelete) || idToDelete === 0) {
            return;
        }
        
        deleteMasterHoliday(idToDelete, {
            onSuccess: () => {
                refetchAll();
                closeDialog();
            }
        });
    };

    return (
        <AdaptiveDialog title='Delete Master Holiday' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('id')} />
                    <p>
                        Are you sure you want to delete <strong>{rowData.name}</strong>?
                    </p>
                    <FormError>{errors.id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting || isPending} variant={'destructive'}>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
