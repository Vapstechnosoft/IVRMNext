'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { togglePromotionalGroupMappings } from '@/server/exam/exam-module/exam-mapping/promotional-setting';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { IPromotionalGroupDetails } from './promotional-group-mapping-columns';

/* ---------------- Schema ---------------- */
const PromotionalGroupToggleSchema = z.object({
    slNo: z.number().min(1, 'Invalid group')
});

type ToggleFormFields = z.infer<typeof PromotionalGroupToggleSchema>;

interface Props {
    rowData: IPromotionalGroupDetails;
    onClose: () => void;
}

export default function PromotionalGroupMappingToggleForm({ rowData, onClose }: Props) {
    const isActive = rowData.isActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ToggleFormFields>({
        resolver: zodResolver(PromotionalGroupToggleSchema),
        defaultValues: { slNo: rowData.slNo }
    });

    const closeDialog = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: ToggleFormFields) => {
        try {
            const res = await togglePromotionalGroupMappings(values.slNo);

            if (res.success) {
                toast.success(res.message || 'Group status updated');
                closeDialog();
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (e: any) {
            toast.error(e.message || 'Something went wrong');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Promotional Group' isOpen onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('slNo')} />

                    <p>
                        Are you sure you want to <strong>{isActive ? 'Deactivate' : 'Activate'}</strong>{' '}
                        <strong>{rowData.groupName}</strong>?
                    </p>

                    <FormError>{errors.slNo?.message}</FormError>
                </AdaptiveBody>

                <AdaptiveFooter>
                    <Button type='button' variant='secondary' onClick={closeDialog}>
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
