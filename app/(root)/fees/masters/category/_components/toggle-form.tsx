'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { useMasterYearlyCategory } from '@/hooks/fees/useMasters';
import { toggleMasterclassYearlyCategory } from '@/server/fees/masters/class_yearly_category'; // Using same API
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteMasterClassFormProps {
    rowData: IMasterClassYearlyList;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DeleteMasterClassForm({ rowData, onClose, onSuccess }: DeleteMasterClassFormProps) {
    const { refetch } = useMasterYearlyCategory();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const closeDialog = () => {
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const idToToggle = Number((rowData as any).fyccC_Id ?? (rowData as any).fycC_Id ?? (rowData as any).fmcC_Id ?? 0);

            if (!idToToggle) {
                toast.error('Invalid record id. Cannot delete.');
                return;
            }

            const response = await toggleMasterclassYearlyCategory(idToToggle);

            if (response?.success) {
                toast.success(`${rowData.fmcC_ClassCategoryName} successfully deleted`);
                // refetch from local hook and call parent success handler (if provided)
                try {
                    await refetch();
                } catch (e) {
                    // ignore refetch errors here; parent onSuccess will trigger a refresh too
                    console.warn('Local refetch failed after delete:', e);
                }

                onSuccess?.();
                closeDialog();
            } else {
                toast.error(response?.message || 'Failed to delete category');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Error deleting master class category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdaptiveDialog title={'Delete Master Class Category'} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <Label>
                        Are you sure you want to delete{' '}
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
                        variant='destructive'
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
