'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoomTariffSchema, RoomTariffSchemaType } from '@/schemas/hostel/room-tariff.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { IAcademicYear, IRoom, IRoomTariff } from '@/types/hostel/hostel-management/masters';
import { getBedCount, saveRoomTariff } from '@/server/hostel/hostel-management/masters/room-tariff';



interface AddRoomTariffFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    yearList: IAcademicYear[];
    roomList: IRoom[];
    className?: string;
}

export default function AddRoomTariffForm({ onSuccess, onCancel, yearList, roomList, className = '' }: AddRoomTariffFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<RoomTariffSchemaType>({
        resolver: zodResolver(RoomTariffSchema),
        mode: 'onChange',
        defaultValues: {
            HLMRTF_Id: 0,
            ASMAY_Id: 0,
            HRMRM_Id: 0,
            HLMRTF_SORate: 0,
            HLMRTF_RoomRate: 0,
            HLMRTF_ActiveFlag: true,
        },
    });

    const roomId = watch('HRMRM_Id');
    const singleRate = watch('HLMRTF_SORate');

    const handleSingleRateBlur = async () => {
        if (!roomId || !singleRate) return;

        const response = await getBedCount(roomId, singleRate);
        if (response?.hrmrM_BedCapacity) {
            const totalRate = singleRate * response.hrmrM_BedCapacity;
            setValue('HLMRTF_RoomRate', totalRate);
        }
    };

    const onSubmit: SubmitHandler<RoomTariffSchemaType> = async (data) => {
        try {
            const result = await saveRoomTariff(data);

            if (result?.returnval) {
                toast.success('Room Tariff saved successfully');
                reset();
                onSuccess?.();
            } else {
                if (result?.duplicate) {
                    toast.error('Record already exists');
                } else {
                    toast.error('Failed to save Room Tariff');
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        }
    };

    const handleReset = () => {
        reset({
            HLMRTF_Id: 0,
            ASMAY_Id: 0,
            HRMRM_Id: 0,
            HLMRTF_SORate: 0,
            HLMRTF_RoomRate: 0,
            HLMRTF_ActiveFlag: true,
        });
        toast.info('Form reset');
    };

    return (
        <div className={`${className} items-center justify-center`}>
            <form onSubmit={handleSubmit(onSubmit)} className='items-center justify-center space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='group flex flex-col gap-2'>
                            <Label htmlFor='ASMAY_Id'>
                                Academic Year <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(val) => setValue('ASMAY_Id', Number(val))}
                                defaultValue=''
                            >
                                <SelectTrigger className={errors.ASMAY_Id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="--Select Academic Year--" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearList.map((year) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                        </div>

                        {/* Room */}
                        <div className='group flex flex-col gap-2'>
                            <Label htmlFor='HRMRM_Id'>
                                Room <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(val) => setValue('HRMRM_Id', Number(val))}
                                defaultValue=''
                            >
                                <SelectTrigger className={errors.HRMRM_Id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="--Select Room--" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roomList.map((room) => (
                                        <SelectItem key={room.hrmrM_Id} value={room.hrmrM_Id.toString()}>
                                            {room.hrmrM_RoomNo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.HRMRM_Id && <FormError>{errors.HRMRM_Id.message}</FormError>}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Single Bed Rate */}
                        <InputText
                            label='Single Bed Rate'
                            required
                            id='HLMRTF_SORate'
                            {...register('HLMRTF_SORate', { valueAsNumber: true })}
                            error={errors.HLMRTF_SORate?.message}
                            placeholder='Enter Rate'
                            type='number'
                            disabled={!roomId}
                            onBlur={handleSingleRateBlur}
                        />

                        {/* Entire Room Rate */}
                        <InputText
                            label='Entire Room Rate'
                            required
                            id='HLMRTF_RoomRate'
                            {...register('HLMRTF_RoomRate', { valueAsNumber: true })}
                            error={errors.HLMRTF_RoomRate?.message}
                            placeholder='Auto Calculated'
                            type='number'
                            readOnly
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Tariff
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}