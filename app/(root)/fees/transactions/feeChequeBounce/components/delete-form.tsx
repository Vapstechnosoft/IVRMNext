'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteFeeChequeBounce } from '@/server/fees/trasactions/fee_cheque_bounce';
import { IFeeChequeBounceGrid } from '@/types/fees/transactions/feeChequeBounce';
import { FEES_QUERY_KEYS } from '@/constants/query-keys';
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

export default function DeleteFeeChequeBounceForm({
    rowData,
    onClose
}: {
    rowData: IFeeChequeBounceGrid;
    onClose: () => void;
}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteFeeChequeBounce(rowData.fcB_Id),
        onSuccess: (data) => {
            if (data.returnval) {
                toast.success('Record Deleted Successfully');
                queryClient.invalidateQueries();
                onClose();
            } else {
                toast.error('Record Not Deleted Successfully');
            }
        },
        onError: () => {
            toast.error('An error occurred while deleting the record');
        }
    });

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do You Want To Delete Record for Receipt No: {rowData.fyP_Receipt_No}? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => mutation.mutate()}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                        {mutation.isPending ? 'Deleting...' : 'Yes, Delete it'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
