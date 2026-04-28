'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useMasterCategoryListData } from '@/hooks/library/useMasters';
import { toggleMasterCategory } from '@/server/library/masters/library_category';
import type { IMasterCategoryList } from '@/types/library/masters/masters';
import { toast } from 'sonner';

interface ToggleMasterCategoryFormProps {
    rowData: IMasterCategoryList;
    onClose: () => void;
}

export default function ToggleMasterCategoryForm({ rowData, onClose }: ToggleMasterCategoryFormProps) {
    const { refetchAll } = useMasterCategoryListData();
    const isActive = rowData.lmC_ActiveFlag;

    const handleToggle = async () => {
        try {
            const response = await toggleMasterCategory(rowData.lmC_Id);

            if (response?.success) {
                toast.success(response.message || 'Status updated successfully');
                refetchAll();
                onClose();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Category' isOpen={true} onClose={onClose}>
            <AdaptiveBody>
                <p>
                    Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.lmC_CategoryName}</strong>?
                </p>
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button variant='outline' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant={isActive ? 'destructive' : 'default'} onClick={handleToggle}>
                    {isActive ? 'Deactivate' : 'Activate'}
                </Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
