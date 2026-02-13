'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { usePeriodSubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { masterDaySchema } from '@/schemas/timetable/masters';
import { deactivateFixingPeriodSubject } from '@/server/timetable/constraints/fixing';
import { TTPeriodSubjectGridData } from '@/types/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterDaySchema.delete>;

interface TogglePeriodSubjectProps {
    rowData: TTPeriodSubjectGridData;
    onClose: () => void;
}

export default function TogglePeriodSubjectForm({ rowData, onClose }: TogglePeriodSubjectProps) {
    const { refetchAll } = usePeriodSubjectGridData();
    const isActive = rowData.ttrpsU_ActiveFlag;

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
            const response = await deactivateFixingPeriodSubject(Number(rowData.ttrpsU_Id));

            if (response.success || response.returnval === true) {
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
        <AdaptiveDialog title='Toggle Period Subject' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmD_Id')} defaultValue={rowData.ttrpsU_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>{rowData.ismS_SubjectName}</strong>?
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
