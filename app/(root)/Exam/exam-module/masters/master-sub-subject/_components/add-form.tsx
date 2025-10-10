'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MasterViewDetails } from '@/components/ui/set-order/generic-seto-order';
import { useMasterSubSubject } from '@/hooks/exam/exammodule/usemasters';
import { masterSubSubjectSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubSubject, getMasterSubSubjectOrderData } from '@/server/exam/exam-module/masters/sus-subject';
import type { IMasterSubSubject } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubSubjectSchema.addOrUpdate>;

interface AddMasterSubSubjectFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterSubSubjectForm({ onSuccess, className = '' }: AddMasterSubSubjectFormProps) {
    const { refetchAll } = useMasterSubSubject();
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [orderData, setOrderData] = useState<(IMasterSubSubject & { id: number })[]>([]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubSubjectSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            ex_SubSubjectOrder: 0,
            ex_IsActiveFlag: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await addOrUpdateMasterSubSubject(data);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => reset();

    const handleSetOrder = async () => {
        try {
            const data = await getMasterSubSubjectOrderData();
            // Map id for DnDKit
            const mappedData = data?.data?.map((d) => ({ ...d, id: d.ex_Id })) || [];
            setOrderData(mappedData);
            setOrderModalOpen(true);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleOrderSave = (updatedData: (IMasterSubSubject & { id: number })[]) => {
        setOrderData(updatedData);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Sub Subject Name'
                            required
                            id='ex_SubSubjectName'
                            {...register('ex_SubSubjectName')}
                            error={errors.ex_SubSubjectName?.message}
                        />
                        <InputText
                            label='Sub Subject Code'
                            required
                            id='ex_SubSubjectCode'
                            {...register('ex_SubSubjectCode')}
                            error={errors.ex_SubSubjectCode?.message}
                        />
                        <Controller
                            name='ex_SubSubjectOrder'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Sub Subject Order'
                                    required
                                    id='ex_SubSubjectOrder'
                                    value={field.value || 0}
                                    onChange={(value) => field.onChange(value)}
                                    minValue={0}
                                />
                            )}
                        />
                        {errors.ex_SubSubjectOrder && <FormError>{errors.ex_SubSubjectOrder.message}</FormError>}
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='ex_IsActiveFlag'>
                            Active Flag <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='ex_IsActiveFlag'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={String(field.value ? 1 : 0)}
                                    onValueChange={(value) => field.onChange(Number(value) === 1)}
                                    className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='ex_IsActiveFlag-yes' />
                                        <Label htmlFor='ex_IsActiveFlag-yes'>Yes</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id='ex_IsActiveFlag-no' />
                                        <Label htmlFor='ex_IsActiveFlag-no'>No</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.ex_IsActiveFlag && <FormError>{errors.ex_IsActiveFlag.message}</FormError>}
                    </div>
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-3 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                    <Button
                        type='button'
                        variant='secondary'
                        onClick={handleSetOrder}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-3'>
                        <div className='flex items-center'>
                            <List className='mr-2 h-4 w-4' />
                            Set Order
                        </div>
                    </Button>
                </div>
            </form>

            {/* Set Order Modal */}
            {orderModalOpen && (
                <MasterViewDetails
                    isOpen={orderModalOpen}
                    onClose={() => setOrderModalOpen(false)}
                    data={orderData}
                    columns={[
                        { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                        { key: 'ex_SubSubjectName', label: 'Sub-Subject Name', className: 'text-left' },
                        { key: 'ex_SubSubjectCode', label: 'Sub-Subject Code', className: 'text-left' },
                        { key: 'ex_SubSubjectOrder', label: 'Order', className: 'text-center' }
                    ]}
                    onSave={handleOrderSave}
                    tableHeight='500px'
                />
            )}
        </div>
    );
}
