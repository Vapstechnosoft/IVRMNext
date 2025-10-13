'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { useCheckPreadmissionLive } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { ArrowUpRight, LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import AddPreadmissionRegistrationForm from './_components/registration-form';

export default function PreadmissionRegistration() {
    const { sub_domain } = useParams();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: preadmissionLive, refetch: refetchAll } = useCheckPreadmissionLive(sub_domain?.toString() || '');

    const handleEdit = () => {
        setIsDialogOpen(true);
    };

    function closeDialog() {
        setIsDialogOpen(false);
        refetchAll();
    }

    return (
        <>
            <Button
                type='button'
                variant='outline'
                className={cn('h-12 w-full border-2 border-gray-200', preadmissionLive?.data === true && 'bg-success')}
                onClick={() => handleEdit()}
                toolTip={
                    preadmissionLive?.data === false
                        ? 'Preadmission Registration is not available yet.'
                        : 'Preadmission Registration is live.'
                }
                disabled={preadmissionLive?.data === false}>
                {preadmissionLive?.data === false ? (
                    <LockKeyhole className='mr-2 h-4 w-4 text-gray-600 ' />
                ) : (
                    <LockKeyholeOpen className='mr-2 h-4 w-4 text-white ' />
                )}
                <span
                    className={preadmissionLive?.data === false ? 'flex-1 font-medium text-gray-500' : 'flex-1 text-white tracking-widest'}>
                    Preadmission Registration
                </span>
                <ArrowUpRight className={preadmissionLive?.data === false ? 'h-4 w-4 text-gray-400' : 'h-4 w-4 text-white'} />
            </Button>
            <AdaptiveDialog title='Preadmission Registration' isOpen={isDialogOpen} onClose={closeDialog} size='lg'>
                <AddPreadmissionRegistrationForm sub_domain={sub_domain?.toString() || ''} closeDialog={closeDialog} />
            </AdaptiveDialog>
        </>
    );
}
