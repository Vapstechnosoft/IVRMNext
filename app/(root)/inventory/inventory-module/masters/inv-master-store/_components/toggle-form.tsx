'use client';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogAction
} from '@/components/ui/alert-dialog';
import { deactivateInvMasterStore } from '@/server/inventory/masters/inv-master-store';
import { useInvMasterStore } from '@/hooks/inventory/masters/use-inv-master-store';
import type { IInvMasterStore } from '@/types/inventory/masters/inv-master-store';
import { toast } from 'sonner';
import { useCallback } from 'react';

interface ToggleInvMasterStoreFormProps {
    rowData: IInvMasterStore;
    onClose: () => void;
}

export default function ToggleInvMasterStoreForm({ rowData, onClose }: ToggleInvMasterStoreFormProps) {
    const { refetchAll } = useInvMasterStore();

    const handleToggle = useCallback(async () => {
        try {
            const result = await deactivateInvMasterStore(rowData);
            if (result.returnval) {
                toast.success('Record status updated successfully');
                refetchAll();
                onClose();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    }, [rowData, refetchAll, onClose]);

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {rowData.invmS_ActiveFlg ? 'Deactivate Record' : 'Activate Record'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {rowData.invmS_ActiveFlg ? 'deactivate' : 'activate'} this store record?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex gap-2">
                    <AlertDialogCancel asChild>
                        <Button variant="secondary">Cancel</Button>
                    </AlertDialogCancel>

                    <AlertDialogAction asChild>
                        <Button
                            variant={rowData.invmS_ActiveFlg ? 'destructive' : 'default'}
                            onClick={handleToggle}
                        >
                            Yes, {rowData.invmS_ActiveFlg ? 'Deactivate' : 'Activate'} it
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
