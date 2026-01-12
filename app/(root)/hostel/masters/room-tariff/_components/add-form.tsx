'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormError, Label } from '@/components/ui/extension/field';
import { FormInput } from '@/components/ui/form/form-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoomTariffSchema, RoomTariffSchemaType } from '@/schemas/hostel/room-tariff.schema';
import { IAcademicYear, IRoom, getBedCount, saveRoomTariff } from '@/server/hostel/room-tariff/server-action';
import { toast } from 'sonner';
import { FormItem, FormMessage, FormControl } from '@/components/ui/form';

interface AddRoomTariffFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    yearList: IAcademicYear[];
    roomList: IRoom[];
}

export default function AddRoomTariffForm({ onSuccess, onCancel, yearList, roomList }: AddRoomTariffFormProps) {
    const form = useForm<RoomTariffSchemaType>({
        resolver: zodResolver(RoomTariffSchema),
        defaultValues: {
            HLMRTF_Id: 0,
            ASMAY_Id: 0,
            HRMRM_Id: 0,
            HLMRTF_SORate: 0,
            HLMRTF_RoomRate: 0,
            HLMRTF_ActiveFlag: true,
        },
    });

    const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = form;

    const roomId = watch('HRMRM_Id');
    const singleRate = watch('HLMRTF_SORate');

    const handleSingleRateBlur = async () => {
        if (!roomId || !singleRate) return;

        const response = await getBedCount(roomId, singleRate);
        if (response && response.hrmrM_BedCapacity) {
            const totalRate = singleRate * response.hrmrM_BedCapacity;
            setValue('HLMRTF_RoomRate', totalRate);
        }
    };

    const onSubmit = async (data: RoomTariffSchemaType) => {
        const result = await saveRoomTariff(data);
        if (result.returnval) {
            toast.success('Room Tariff saved successfully');
            onSuccess();
        } else {
            if (result.duplicate) {
                toast.error('Record already exists');
            } else {
                toast.error('Failed to save Room Tariff');
            }
        }
    };

    return (
        <div className="p-4 bg-background rounded-lg border">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Controller
                                control={control}
                                name="ASMAY_Id"
                                render={({ field, fieldState: { error } }) => (
                                    <FormItem>
                                        <Label required>Academic Year</Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className={error ? "border-red-500" : ""}>
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {yearList.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={control}
                                name="HRMRM_Id"
                                render={({ field, fieldState: { error } }) => (
                                    <FormItem>
                                        <Label required>Room</Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className={error ? "border-red-500" : ""}>
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roomList.map((room) => (
                                                    <SelectItem key={room.hrmrM_Id} value={room.hrmrM_Id.toString()}>
                                                        {room.hrmrM_RoomNo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <FormInput
                                control={control}
                                name="HLMRTF_SORate"
                                label="Single Bed Rate"
                                placeholder="Enter Rate"
                                type="number"
                                required
                                disabled={!roomId}
                                onBlur={handleSingleRateBlur}
                            />

                            <FormInput
                                control={control}
                                name="HLMRTF_RoomRate"
                                label="Entire Room Rate"
                                placeholder="Auto Calculated"
                                type="number"
                                disabled={true}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4 border-t mt-4">
                        <Button type="submit" disabled={isSubmitting} className="w-32">
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type="button" variant="destructive" onClick={onCancel} className="w-32">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
