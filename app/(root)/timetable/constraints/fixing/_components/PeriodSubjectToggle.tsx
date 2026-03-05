'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { usePeriodSubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { deactivateFixingPeriodSubject } from '@/server/timetable/constraints/fixing';
import type { TTPeriodSubjectGridData } from '@/types/timetable/constraints/fixing';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface TogglePeriodSubjectProps {
    rowData: TTPeriodSubjectGridData;
    onClose: () => void;
}

export default function TogglePeriodSubjectForm({ rowData, onClose }: TogglePeriodSubjectProps) {
    const { refetchAll } = usePeriodSubjectGridData();
    const isActive =
        (rowData as any).ttfpsU_ActiveFlag === true ||
        (rowData as any).ttfpsU_ActiveFlag === 1 ||
        (rowData as any).ttfpsU_ActiveFlag === 'true' ||
        (rowData as any).ttfpsU_ActiveFlag === 'Active';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<any>({
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<any> = async () => {
        try {
            const response = await deactivateFixingPeriodSubject({
                TTRPSU_Id: Number(rowData.ttfpsU_Id),
                TTRPSU_ActiveFlag: !isActive
            });

            const res = response as any;
            if (
                res.success === true ||
                res.success === 'true' ||
                res.returnval === true ||
                res.returnval === 'true' ||
                res.returnVal === true ||
                res.returnVal === 'true'
            ) {
                toast.success(res.message || 'Status updated successfully');
                await refetchAll();
                closeDialog();
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Period Subject' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmD_Id')} defaultValue={String(rowData.ttfpsU_Id)} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.ismS_SubjectName}</strong>?
                    </p>
                    <FormError>{errors.ttmD_Id?.message as string}</FormError>
                    <FormError>{errors.root?.message as string}</FormError>
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
