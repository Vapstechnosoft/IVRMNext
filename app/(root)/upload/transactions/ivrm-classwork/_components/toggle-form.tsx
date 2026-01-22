'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { IClassWork } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { deleteClassWork } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleClassWorkFormProps {
    rowData: IClassWork;
    onClose: () => void;
}

export default function ToggleClassWorkForm({ rowData, onClose }: ToggleClassWorkFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!rowData.icW_Id) return;
        setIsLoading(true);
        try {
            const result = await deleteClassWork(rowData.icW_Id);
            if (result.success) {
                toast.success(result.message);
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to change status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will {rowData.icW_ActiveFlag ? 'deactivate' : 'activate'} the ClassWork record.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading} onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isLoading}
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        className={rowData.icW_ActiveFlag ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}
                    >
                        {isLoading ? 'Processing...' : (rowData.icW_ActiveFlag ? 'Deactivate' : 'Activate')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
