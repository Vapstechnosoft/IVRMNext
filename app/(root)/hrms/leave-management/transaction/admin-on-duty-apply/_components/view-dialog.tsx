'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { useLeaveDetailsById } from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ViewLeaveDetailsDialogProps {
    leaveId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewLeaveDetailsDialog({
    leaveId,
    open,
    onOpenChange
}: ViewLeaveDetailsDialogProps) {
    const { data, isLoading } = useLeaveDetailsById(leaveId);

    const leaveApp = data?.leaveApplication?.[0];
    const leaveDetails = data?.leaveApplicationDetails?.[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle>Leave Application Details</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex justify-center py-8'>
                        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                ) : leaveApp ? (
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-2 gap-2 text-sm'>
                            <div className='font-semibold'>Application ID:</div>
                            <div>{leaveApp.hrelaP_ApplicationID}</div>

                            <div className='font-semibold'>Employee ID:</div>
                            <div>{leaveApp.hrmE_Id}</div>

                            <div className='font-semibold'>Leave Reason:</div>
                            <div className='col-span-2 rounded-md bg-muted p-2'>
                                {leaveApp.hrelaP_LeaveReason}
                            </div>

                            <div className='font-semibold'>From Date:</div>
                            <div>
                                {leaveApp.hrelaP_FromDate
                                    ? format(new Date(leaveApp.hrelaP_FromDate), 'dd/MM/yyyy')
                                    : '-'}
                            </div>

                            <div className='font-semibold'>To Date:</div>
                            <div>
                                {leaveApp.hrelaP_ToDate
                                    ? format(new Date(leaveApp.hrelaP_ToDate), 'dd/MM/yyyy')
                                    : '-'}
                            </div>

                            <div className='font-semibold'>Total Days:</div>
                            <div>{leaveApp.hrelaP_TotalDays}</div>

                            <div className='font-semibold'>Status:</div>
                            <div>{leaveApp.hrelaP_ApplicationStatus}</div>

                            {leaveDetails && (
                                <>
                                    <div className='font-semibold'>Time:</div>
                                    <div>
                                        {leaveDetails.hrelapD_InTime} - {leaveDetails.hrelapD_OutTime}
                                    </div>
                                </>
                            )}

                            {leaveApp.hrelaP_SupportingDocument && (
                                <>
                                    <div className='font-semibold'>Document:</div>
                                    <div>
                                        <a
                                            href={leaveApp.hrelaP_SupportingDocument}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className='py-8 text-center text-muted-foreground'>
                        No details found.
                    </div>
                )}

                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
