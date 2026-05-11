'use client';

import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { useMasterRackDetails } from '@/hooks/library/useMasters';
import { deactivateMasterRack } from '@/server/library/masters/rack-details';
import type { IMasterRackDetails } from '@/types/library/masters/rack-details';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ToggleRackFormProps {
    rowData: IMasterRackDetails;
    onClose: () => void;
}

export default function ToggleRackForm({ rowData, onClose }: ToggleRackFormProps) {
    const { refetchAll } = useMasterRackDetails();
    const isActive = rowData.lmrA_ActiveFlag;

    const mutation = useMutation({
        mutationFn: deactivateMasterRack,
        onSuccess: async (data) => {
            if (data.returnval) {
                toast.success(`Record ${isActive ? 'Deactivated' : 'Activated'} Successfully!!!`);
                await refetchAll();
                onClose();
            } else {
                toast.error(`Failed to ${isActive ? 'Deactivate' : 'Activate'} Record`);
            }
        },
        onError: (error) => {
            toast.error('An error occurred while updating status');
            console.error(error);
        }
    });

    const handleConfirm = () => {
        mutation.mutate(rowData);
    };

    return (
        <AdaptiveDialog
            title={isActive ? 'Deactivate Rack' : 'Activate Rack'}
            isOpen={true}
            onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <p className='text-sm'>
                    Are you sure you want to {isActive ? 'deactivate' : 'activate'} the record{' '}
                    <span className='font-bold'>{rowData.lmrA_Location}</span>?
                </p>
                <div className='flex justify-end gap-3 pt-2'>
                    <Button variant='outline' onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant={isActive ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={mutation.isPending}
                        className='min-w-[100px]'>
                        {mutation.isPending
                            ? isActive ? 'Deactivating...' : 'Activating...'
                            : isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
                    </Button>
                </div>
            </div>
        </AdaptiveDialog>
    );
}

