'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterFeeGroupGrouping } from '@/hooks/fees/useMasters';
import { masterGroupsGroupingSchema } from '@/schemas/fees/masters';
import { toggleGroupGrouping } from '@/server/fees/masters/groupsgrouping';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterGroupsGroupingSchema.delete>;

interface ToggleMasterFeeGroupGroupingFormProps {
    rowData: IMasterGroupsGrouping;
    onClose: () => void;
}

export default function ToggleMasterFeeGroupGroupingForm({ rowData, onClose }: ToggleMasterFeeGroupGroupingFormProps) {
    const { refetchAll } = useMasterFeeGroupGrouping();
    const isActive = rowData.imgg_ActiveFlag;

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterGroupsGroupingSchema.delete),
        mode: 'onChange'
    });

    const closeDialog = () => {
        onClose();
        reset();
    };

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleGroupGrouping(Number(rowData.imgg_Id));

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Fee Group Grouping Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.imgg_GroupingName}</strong>?
                    </p>
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
