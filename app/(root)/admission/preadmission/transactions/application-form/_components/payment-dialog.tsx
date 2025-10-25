'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { useStudentApplicationList } from '@/hooks/admission/preadmission/useTransactions';
import { applicationFormInitiatePayment } from '@/server/admission/preadmission/transactions/application_form';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PaymentDialog({ cell }: { cell: any }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IPreadmissionStudentApplicationList>();
    const { refetchAll } = useStudentApplicationList(selectedRow?.asmay_id ?? 0);
    const [paymentHtmlContent, setPaymentHtmlContent] = useState<string>('');

    const handleEdit = (row: IPreadmissionStudentApplicationList) => {
        setSelectedRow(row);
        getPaymentHtml();
    };

    const getPaymentHtml = async () => {
        try {
            const response = await applicationFormInitiatePayment(selectedRow?.pasr_id ?? 0);
            if (response.success && response.data != null && response.data?.html_form) {
                setPaymentHtmlContent(response.data?.html_form);
                setIsDialogOpen(true);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    function closeDialog() {
        setIsDialogOpen(false);
        refetchAll();
    }

    return (
        <>
            <div className='dropdown-item flex gap-2' onClick={() => handleEdit(cell.getValue())}>
                <Pencil className='text-muted-foreground' /> Pay Now
            </div>

            {selectedRow && (
                <AdaptiveDialog title='Application Form Fee' isOpen={isDialogOpen} onClose={closeDialog} size='xl'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <p>Payment html must be rendered here</p>
                    </AdaptiveBody>
                </AdaptiveDialog>
            )}
        </>
    );
}
