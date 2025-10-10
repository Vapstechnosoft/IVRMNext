'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import type { ICategoryMapping } from '@/types/exam/exam-module/masters';
import { toast } from 'sonner';

interface ToggleCategoryClassMappingFormProps {
    rowData: ICategoryMapping;
    onToggle: (id: number) => Promise<{ success: boolean; message: string }>;
    onClose: () => void;
    onRefetch: () => void;
}

export default function ToggleCategoryClassMappingForm({ rowData, onToggle, onClose, onRefetch }: ToggleCategoryClassMappingFormProps) {
    const isActive = Boolean(rowData.ex_IsActiveFlag);

    const handleToggle = async () => {
        try {
            const response = await onToggle(rowData.ex_Id);
            if (response.success) {
                toast.success(response.message);
                onRefetch();
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Category-Class Mapping Status' isOpen={true} onClose={onClose}>
            <AdaptiveBody>
                <p>
                    Are you sure you want to <strong>{isActive ? 'deactivate' : 'activate'}</strong> the mapping for{' '}
                    <strong>
                        {rowData.ex_CategoryName} - {rowData.ex_ClassName}
                    </strong>
                    ?
                </p>
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button variant='secondary' onClick={onClose} type='button'>
                    Cancel
                </Button>
                <Button type='button' variant={isActive ? 'destructive' : 'default'} onClick={handleToggle}>
                    {isActive ? 'Deactivate' : 'Activate'}
                </Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
