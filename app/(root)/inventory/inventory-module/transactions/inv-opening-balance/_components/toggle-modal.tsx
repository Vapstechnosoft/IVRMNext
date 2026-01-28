'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useInvOpeningBalance } from '@/hooks/inventory/transactions/use-inv-opening-balance';
import type { IInvOpeningBalance } from '@/types/inventory/transactions/inv-opening-balance';
import { useForm } from 'react-hook-form';

interface ToggleOBModalProps {
    rowData: IInvOpeningBalance;
    onClose: () => void;
}

export function ToggleOBModal({ rowData, onClose }: ToggleOBModalProps) {
    const { toggleActiveMutation } = useInvOpeningBalance();
    const isActive = rowData.invoB_ActiveFlg;

    const {
        handleSubmit,
        formState: { isSubmitting }
    } = useForm();

    const onSubmit = async () => {
        try {
            await toggleActiveMutation.mutateAsync(rowData);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Opening Balance Status' isOpen={true} onClose={onClose} size="md">
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <div className='space-y-3'>
                        <p className='text-sm text-warning-foreground'>
                            Are you sure you want to {isActive ? 'deactivate' : 'activate'} Opening Balance for <strong>{rowData.invmI_ItemName}</strong> (Batch: {rowData.invoB_BatchNo})?
                        </p>
                    </div>
                </AdaptiveBody>

                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        isLoading={isSubmitting}
                        variant={isActive ? 'destructive' : 'default'}
                        loadingText={isActive ? 'Deactivating...' : 'Activating...'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
