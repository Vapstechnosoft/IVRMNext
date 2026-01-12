'use client';

import { useForm } from 'react-hook-form';
import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { deleteRoomTariff, IRoomTariff } from '@/server/hostel/room-tariff/server-action';
import { toast } from 'sonner';

interface ToggleRoomTariffProps {
    data: IRoomTariff;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ToggleRoomTariff({ data, onSuccess, onCancel }: ToggleRoomTariffProps) {
    const form = useForm();
    const { formState: { isSubmitting } } = form;

    const onSubmit = async () => {
        const result = await deleteRoomTariff(data);
        if (result.returnval) {
            toast.success(data.hlmrtF_ActiveFlag ? 'Room Tariff deactivated successfully' : 'Room Tariff activated successfully');
            onSuccess();
        } else {
            toast.error('Failed to toggle Room Tariff status');
        }
    };

    return (
        <ToggleFormWrapper
            isActive={data.hlmrtF_ActiveFlag}
            isSubmitting={isSubmitting}
            onSubmit={form.handleSubmit(onSubmit)}
            onCancel={onCancel}
        />
    );
}
