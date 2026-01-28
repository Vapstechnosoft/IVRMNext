'use client';

import { deleteRoomCategory, IRoomCategory } from '@/server/hostel/room-category/server-action';
import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { toast } from 'sonner';

interface ToggleRoomCategoryProps {
    data: IRoomCategory;
    onClose: () => void;
    onSuccess: () => void;
}

export const ToggleRoomCategory = ({ data, onClose, onSuccess }: ToggleRoomCategoryProps) => {
    const onConfirm = async () => {
        try {
            const result = await deleteRoomCategory(data);

            if (result?.returnval) {
                toast.success(
                    data.hlmrcA_ActiveFlag
                        ? 'Room Category deactivated successfully'
                        : 'Room Category activated successfully'
                );
                onSuccess();
            } else {
                toast.error('Failed to toggle Room Category status');
            }
        } catch (error) {
            toast.error('Failed to update Room Category status');
        } finally {
            onClose();
        }
    };

    return (
        <ToggleFormWrapper
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            title={data.hlmrcA_ActiveFlag ? 'Deactivate Room Category' : 'Activate Room Category'}
            description={`Are you sure you want to ${data.hlmrcA_ActiveFlag ? 'deactivate' : 'activate'
                } ${data.hlmrcA_RoomCategory}?`}
        />
    );
};
