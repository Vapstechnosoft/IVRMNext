'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Form } from '@/components/ui/form';
import { FormControl, FormItem, FormMessage } from '@/components/ui/form';
import { FormInput } from '@/components/ui/form/form-input';
import { FormTextarea } from '@/components/ui/form/form-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoomCategorySchema, type RoomCategorySchemaType } from '@/schemas/hostel/room-category.schema';
import { type IFeeGroup, type IHostel, saveRoomCategory } from '@/server/hostel/room-category/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddRoomCategoryFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    hostelList: IHostel[];
    feeGroupList: IFeeGroup[];
}

export default function AddRoomCategoryForm({ onSuccess, onCancel, hostelList, feeGroupList }: AddRoomCategoryFormProps) {
    const form = useForm<RoomCategorySchemaType>({
        resolver: zodResolver(RoomCategorySchema),
        defaultValues: {
            hlmrcA_Id: 0,
            HLMH_Id: 0,
            FMG_Id: 0,
            HLMRCA_RoomCategory: '',
            HLMRCA_SORate: 0,
            HLMRCA_RoomRate: 0,
            HLMRCA_MaxCapacity: 0,
            HLMRCA_Description: '',
            hlmrcA_ACFlg: false,
            hlmrcA_SharingFlg: false,
            hlmrcA_ActiveFlag: true
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting }
    } = form;

    const sharingFlag = watch('hlmrcA_SharingFlg');

    useEffect(() => {
        if (!sharingFlag) {
            setValue('HLMRCA_RoomRate', 0);
        }
    }, [sharingFlag, setValue]);

    const onSubmit = async (data: RoomCategorySchemaType) => {
        const result = await saveRoomCategory(data);
        if (result.returnval) {
            toast.success('Room Category saved successfully');
            onSuccess();
        } else {
            if (result.duplicate) {
                toast.error('Record already exists');
            } else {
                toast.error('Failed to save Room Category');
            }
        }
    };

    return (
        <div className='rounded-lg border bg-background p-4'>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <Controller
                                control={control}
                                name='HLMH_Id'
                                render={({ field, fieldState: { error } }) => (
                                    <FormItem>
                                        <Label required>Hostel Name</Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className={error ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {hostelList.map((hostel) => (
                                                    <SelectItem key={hostel.hlmH_Id} value={hostel.hlmH_Id.toString()}>
                                                        {hostel.hlmH_Name}
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
                                name='FMG_Id'
                                render={({ field, fieldState: { error } }) => (
                                    <FormItem>
                                        <Label required>Fee Group</Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className={error ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {feeGroupList.map((group) => (
                                                    <SelectItem key={group.fmG_Id} value={group.fmG_Id.toString()}>
                                                        {group.fmG_GroupName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormInput
                                control={control}
                                name='HLMRCA_RoomCategory'
                                label='Room Category'
                                placeholder='Enter Room Category Name'
                                required
                            />

                            <FormInput
                                control={control}
                                name='HLMRCA_SORate'
                                label='Single Bed Occupancy Rate'
                                placeholder='Enter Rate'
                                type='number'
                                required
                            />

                            <FormInput
                                control={control}
                                name='HLMRCA_RoomRate'
                                label='Multiple Bed Occupancy Rate'
                                placeholder='Enter Rate'
                                type='number'
                                disabled={!sharingFlag}
                                required={sharingFlag}
                            />
                        </div>

                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='hlmrcA_ACFlg'
                                        render={({ field }) => (
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id='acFlag' />
                                        )}
                                    />
                                    <Label htmlFor='acFlag'>Whether This Room Have AC?</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='hlmrcA_SharingFlg'
                                        render={({ field }) => (
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id='shareFlag' />
                                        )}
                                    />
                                    <Label htmlFor='shareFlag'>Whether This Room is Sharing?</Label>
                                </div>
                            </div>

                            <FormInput
                                control={control}
                                name='HLMRCA_MaxCapacity'
                                label='Max Capacity'
                                placeholder='Enter Max Capacity'
                                type='number'
                                maxLength={3}
                                required
                            />

                            <FormTextarea
                                control={control}
                                name='HLMRCA_Description'
                                label='Description'
                                placeholder='Enter Description...'
                                required
                            />
                        </div>
                    </div>

                    <div className='mt-4 flex justify-center gap-4 border-t pt-4'>
                        <Button type='submit' disabled={isSubmitting} className='w-32'>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type='button' variant='destructive' onClick={onCancel} className='w-32'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
