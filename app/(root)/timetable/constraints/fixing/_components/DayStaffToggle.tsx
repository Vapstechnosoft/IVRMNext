'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useDayStaffGridData } from '@/hooks/timetable/constraints/fixingData';
import { masterDaySchema } from '@/schemas/timetable/masters';
import { deactivateFixingDayStaff } from '@/server/timetable/constraints/fixing';
import type { TTDayStaffGridData } from '@/types/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterDaySchema.delete>;

interface ToggleDayStaffProps {
    rowData: TTDayStaffGridData;
    onClose: () => void;
}

export default function ToggleDayStaffForm({ rowData, onClose }: ToggleDayStaffProps) {
    const { refetchAll } = useDayStaffGridData();
    const isActive =
        (rowData as any).ttfdS_ActiveFlag === true ||
        (rowData as any).ttfdS_ActiveFlag === 1 ||
        (rowData as any).ttfdS_ActiveFlag === 'true';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterDaySchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await deactivateFixingDayStaff({
                TTFDS_Id: Number(rowData.ttfdS_Id),
                TTFDS_ActiveFlag: !isActive
            });

            if (response.success || response.returnval === true || response.returnval === 'true' || (response as any).returnVal === true) {
                toast.success(response.message || 'Status updated successfully');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Day Staff' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmD_Id')} defaultValue={rowData.ttfdS_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.staffName}</strong>?
                    </p>
                    <FormError>{errors.ttmD_Id?.message}</FormError>
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
