'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { useMasterYearlyCategory } from '@/hooks/fees/useMasters';
import { toggleMasterclassYearlyCategory } from '@/server/fees/masters/class_yearly_category';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleMasterClassFormProps {
    rowData: IMasterGroupWiseAutoReciptList;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ToggleMasterClassForm({ rowData, onClose, onSuccess }: ToggleMasterClassFormProps) {
    const { refetch } = useMasterYearlyCategory();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isActive = rowData.fycC_ActiveFlag;

    const closeDialog = () => {
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await toggleMasterclassYearlyCategory(Number(rowData.fmcC_Id));

            if (response.success) {
                toast.success(`${rowData.fmcC_ClassCategoryName} successfully ${isActive ? 'deactivated' : 'activated'}`);
                await refetch();
                onSuccess?.();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to toggle category');
            }
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast.error(error.message || 'Error toggling master class category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdaptiveDialog title={'Toggle Master Class Category Status'} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <Label>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>
                            {rowData.fmcC_ClassCategoryName} ({rowData.asmaY_Year})
                        </strong>
                        ?
                    </Label>
                    <div className='text-muted-foreground text-sm'>
                        Classes: {(() => {
                            try {
                                const parsed = JSON.parse(rowData.asmcL_ClassName);
                                return Array.isArray(parsed) ? parsed.join(', ') : rowData.asmcL_ClassName;
                            } catch {
                                return rowData.asmcL_ClassName;
                            }
                        })()}
                    </div>
                </AdaptiveBody>

                <AdaptiveFooter className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={closeDialog}
                        disabled={isSubmitting}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        variant={isActive ? 'destructive' : 'default'}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        {isSubmitting ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
