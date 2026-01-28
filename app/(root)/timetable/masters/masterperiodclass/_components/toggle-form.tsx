'use client';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { deactivatePeriodClass } from '@/server/timetable/masters/periodallocation';
import type { IMasterPeriodClassList } from '@/types/timetable/masters/masters';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ToggleMasterPeriodClassFormProps {
    rowData: IMasterPeriodClassList;
    onClose: () => void;
}

export default function ToggleMasterPeriodClassForm({ rowData, onClose }: ToggleMasterPeriodClassFormProps) {
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const payload = {
                ttmpC_Id: rowData.ttmpC_Id,
                ttmpC_ActiveFlag: rowData.ttmpC_ActiveFlag
            };
            return await deactivatePeriodClass(payload);
        },
        onSuccess: (response) => {
            if (response.returnval) {
                toast.success('Status updated successfully');
                onClose();
            } else if (response.returnduplicatestatus === 'active') {
                toast.warning('Master Period is deactivated !!!');
            } else {
                toast.error('Failed to update status');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred');
        }
    });

    return (
        <AdaptiveDialog
            title={rowData.ttmpC_ActiveFlag ? 'Deactivate Period Class' : 'Activate Period Class'}
            isOpen={true}
            onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>Are you sure you want to {rowData.ttmpC_ActiveFlag ? 'deactivate' : 'activate'} this mapping?</p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button onClick={() => mutate()} isLoading={isPending} variant={rowData.ttmpC_ActiveFlag ? 'destructive' : 'default'}>
                        {rowData.ttmpC_ActiveFlag ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
