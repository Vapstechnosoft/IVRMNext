'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import type { IAlumniGallery } from '@/types/alumni/alumni-gallery';
import type React from 'react';
import { toast } from 'sonner';

interface ToggleAlumniGalleryFormProps {
    rowData: IAlumniGallery;
    onClose: () => void;
    onSuccess?: () => void;
}

// Mock API function
const mockToggleAlumniGalleryItem = async (algA_Id: number, algaPId: number, algaVId: number) => {
    console.log('Toggling gallery item:', { algA_Id, algaPId, algaVId });
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, message: 'Record status updated successfully' };
};

export default function ToggleAlumniGalleryForm({ rowData, onClose, onSuccess }: ToggleAlumniGalleryFormProps) {
    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await mockToggleAlumniGalleryItem(rowData.algA_Id, 0, 0);
            if (res) {
                toast.success(
                    `Gallery "${rowData.algA_GalleryName}" ${rowData.algA_ActiveFlag ? 'deactivated' : 'activated'} successfully`
                );
                onSuccess?.();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update gallery status');
        }
    };

    return (
        <AdaptiveDialog title={`${rowData.algA_ActiveFlag ? 'Deactivate' : 'Activate'} Gallery?`} isOpen={true} onClose={onClose}>
            <form onSubmit={handleConfirm} className='flex flex-col gap-4'>
                <AdaptiveBody>
                    <div className='space-y-4'>
                        <div className='rounded-lg bg-muted/30 p-4'>
                            <p className='mb-2 font-semibold'>Gallery Details:</p>
                            <p>
                                <span className='text-muted-foreground'>Name:</span> {rowData.algA_GalleryName}
                            </p>
                            <p>
                                <span className='text-muted-foreground'>Date:</span> {new Date(rowData.algA_Date).toLocaleDateString()}
                            </p>
                            <p>
                                <span className='text-muted-foreground'>Files:</span> {rowData.images_list?.length || 0} items
                            </p>
                        </div>

                        <div className='rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4'>
                            <p className='font-medium text-blue-700'>
                                {rowData.algA_ActiveFlag
                                    ? 'Deactivating will hide this gallery from public view.'
                                    : 'Activating will make this gallery visible to alumni.'}
                            </p>
                        </div>
                    </div>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        variant={rowData.algA_ActiveFlag ? 'destructive' : 'default'}
                        className={rowData.algA_ActiveFlag ? '' : 'bg-green-600 hover:bg-green-700'}>
                        {rowData.algA_ActiveFlag ? 'Deactivate Gallery' : 'Activate Gallery'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
