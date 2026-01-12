'use client';

import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { type IRoomCategory, deleteRoomCategory } from '@/server/hostel/room-category/server-action';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ToggleRoomCategoryProps {
    data: IRoomCategory;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ToggleRoomCategory({ data, onSuccess, onCancel }: ToggleRoomCategoryProps) {
    const form = useForm();
    const {
        formState: { isSubmitting }
    } = form;

    const onSubmit = async () => {
        const result = await deleteRoomCategory(data);
        if (result.returnval) {
            toast.success(data.hlmrcA_ActiveFlag ? 'Room Category deactivated successfully' : 'Room Category activated successfully');
            onSuccess();
        } else {
            toast.error('Failed to toggle Room Category status');
        }
    };

    return (
        <ToggleFormWrapper
            isActive={data.hlmrcA_ActiveFlag}
            isSubmitting={isSubmitting}
            onSubmit={form.handleSubmit(onSubmit)}
            onCancel={onCancel}
        />
    );
}
