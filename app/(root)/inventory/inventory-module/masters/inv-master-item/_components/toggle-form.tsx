'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useInvMasterItem } from '@/hooks/inventory/masters/use-inv-master-item';
import { deactivateInvMasterItem } from '@/server/inventory/masters/inv-master-item';
import type { IInvMasterItem } from '@/types/inventory/masters/inv-master-item';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ToggleInvMasterItemFormProps {
    rowData: IInvMasterItem;
    onClose: () => void;
}

export default function ToggleInvMasterItemForm({ rowData, onClose }: ToggleInvMasterItemFormProps) {
    const { refetchAll } = useInvMasterItem();

    const handleToggle = useCallback(async () => {
        try {
            const result = await deactivateInvMasterItem(rowData);
            if (result.success || result.returnval) {
                toast.success(result.message || 'Record status updated successfully');
                refetchAll();
                onClose();
            } else {
                toast.error(result.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    }, [rowData, refetchAll, onClose]);

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{rowData.invmI_ActiveFlg ? 'Deactivate Record' : 'Activate Record'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {rowData.invmI_ActiveFlg ? 'deactivate' : 'activate'} this item record?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className='flex gap-2'>
                    <AlertDialogCancel className='text-black hover:bg-transparent dark:text-white'>Cancel</AlertDialogCancel>

                    <AlertDialogAction asChild>
                        <Button variant={rowData.invmI_ActiveFlg ? 'destructive' : 'default'} onClick={handleToggle}>
                            Yes, {rowData.invmI_ActiveFlg ? 'Deactivate' : 'Activate'} it
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
