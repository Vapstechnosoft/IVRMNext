'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { useCheckPreadmissionLive } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { ArrowUpRight, LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import AddPreadmissionRegistrationForm from './_components/registration-form';

export default function PreadmissionRegistration() {
    const { sub_domain } = useParams();
    const searchParams = useSearchParams();

    const callbackUrl = searchParams.get('callbackUrl');
    let resolvedSubDomain = sub_domain?.toString();
    if (!resolvedSubDomain && callbackUrl) {
        resolvedSubDomain = callbackUrl.split('/').filter(Boolean)[0];
    }
    resolvedSubDomain = resolvedSubDomain?.toUpperCase();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: preadmissionLive, refetch: refetchAll } = useCheckPreadmissionLive(resolvedSubDomain || '');

    const handleEdit = () => {
        setIsDialogOpen(true);
    };

    function closeDialog() {
        setIsDialogOpen(false);
        refetchAll();
    }

    const isPreadmissionLive: boolean = !(preadmissionLive === undefined || preadmissionLive?.data === false);

    return (
        <div className="flex flex-col items-center w-full gap-4">
            {isPreadmissionLive && (
                <div className="flex items-baseline gap-2 font-bold animate-in fade-in zoom-in duration-500 mb-2">
                    <span className="text-[#d35400] text-xl">Preadmission is</span>
                    <span className="text-[#27ae60] text-3xl tracking-wider">LIVE!</span>
                </div>
            )}
            <Button
                type='button'
                variant='outline'
                className={cn('h-12 w-full border-2 border-gray-200', isPreadmissionLive && 'bg-success')}
                onClick={() => handleEdit()}
                toolTip={
                    isPreadmissionLive === false ? 'Preadmission Registration is not available yet.' : 'Preadmission Registration is live.'
                }
                disabled={isPreadmissionLive === false}>
                {isPreadmissionLive === false ? (
                    <LockKeyhole className='mr-2 h-4 w-4 text-gray-600 ' />
                ) : (
                    <LockKeyholeOpen className='mr-2 h-4 w-4 text-white ' />
                )}
                <span className={isPreadmissionLive === false ? 'flex-1 font-medium text-gray-600' : 'flex-1 text-white tracking-widest'}>
                    Preadmission Registration
                </span>
                {isPreadmissionLive === true && <ArrowUpRight className={'h-4 w-4 text-white'} />}
            </Button>
            <AdaptiveDialog title='Preadmission Registration' isOpen={isDialogOpen} onClose={closeDialog} size='lg'>
                <AddPreadmissionRegistrationForm sub_domain={resolvedSubDomain || ''} closeDialog={closeDialog} />
            </AdaptiveDialog>
        </div>
    );
}
