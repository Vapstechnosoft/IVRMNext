'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { deactivateFixingDayStaff } from '@/server/timetable/constraints/fixing';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleDayStaffFormProps {
    rowData: any;
    onClose: () => void;
}

export default function DayStaffToggle({ rowData, onClose }: ToggleDayStaffFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isActive = rowData.ttfdS_ActiveFlag;

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const payload = {
                TTFDS_Id: rowData.ttfdS_Id || rowData.ttfD_Id,
                TTFDS_ActiveFlag: !isActive
            };
            const res = await deactivateFixingDayStaff(payload);
            if (res?.returnval === true) {
                toast.success(`Record ${isActive ? 'Deactivated' : 'Activated'} Successfully`);
                window.location.reload();
            } else {
                toast.error(res?.message || 'Failed to update record status');
            }
        } catch (error) {
            console.error('Error toggling record:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>{isActive ? 'Deactivate' : 'Activate'} Record</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} this record?
                        <br />
                        <strong>Class:</strong> {rowData.asmcL_ClassName || 'N/A'} | <strong>Section:</strong> {rowData.asmC_SectionName || 'N/A'}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='mt-6'>
                    <Button variant='outline' onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant={isActive ? 'destructive' : 'default'} onClick={handleToggle} disabled={isLoading}>
                        {isLoading ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
