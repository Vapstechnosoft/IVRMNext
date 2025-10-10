'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface ToggleMasterDataFormProps<T> {
    title: string; // e.g. "Toggle Class Status" or "Toggle Subject Status"
    schema: any; // e.g. masterClassSchema.delete
    rowData: T; // current record
    idKey: keyof T; // e.g. 'asmcL_Id' or 'ex_Id'
    nameKey: keyof T; // e.g. 'asmcL_ClassName' or 'ex_ExamName'
    statusKey: keyof T; // e.g. 'isActive' or 'ex_IsActiveFlag'
    onToggle: (id: number) => Promise<{ success: boolean; message: string }>;
    onClose: () => void;
    onRefetch: () => void; // refetch after successful toggle
}

export default function ToggleMasterGradeForm<T extends Record<string, any>>({
    title,
    schema,
    rowData,
    idKey,
    nameKey,
    statusKey,
    onToggle,
    onClose,
    onRefetch
}: ToggleMasterDataFormProps<T>) {
    type FormFields = z.infer<typeof schema>;

    const isActive = Boolean(rowData[statusKey]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await onToggle(Number(rowData[idKey]));
            if (response.success) {
                toast.success(response.message);
                onRefetch();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <AdaptiveDialog title={title} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register(idKey as any)} defaultValue={rowData[idKey]} />
                    <p>
                        Are you sure you want to <strong>{isActive ? 'deactivate' : 'activate'}</strong>{' '}
                        <strong>{String(rowData[nameKey])}</strong>?
                    </p>
                    <FormError>{(errors as any)[idKey]?.message}</FormError>
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
