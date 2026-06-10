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
import { useInvMasterCustomer } from '@/hooks/inventory/masters/use-inv-master-customer';

interface ToggleCustomerModalProps {
    rowData: any;
    onClose: () => void;
}

export function ToggleCustomerModal({ rowData, onClose }: ToggleCustomerModalProps) {
    const { deleteMutation } = useInvMasterCustomer();
    const isActive = rowData.invmC_ActiveFlg;

    const handleConfirm = () => {
        deleteMutation.mutate(
            { ...rowData, invmC_ActiveFlg: !isActive },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isActive ? 'Deactivate Record' : 'Activate Record'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} this customer record?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex gap-2">
                    <AlertDialogCancel className="text-black dark:text-white hover:bg-transparent" disabled={deleteMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant={isActive ? 'destructive' : 'default'}
                            onClick={handleConfirm}
                            isLoading={deleteMutation.isPending}
                        >
                            Yes, {isActive ? 'Deactivate' : 'Activate'} it
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
