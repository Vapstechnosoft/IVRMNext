'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { MasterViewDetails } from '@/components/ui/set-order/generic-seto-order';
import { useMasterSubSubject } from '@/hooks/exam/exammodule/usemasters';
import { masterSubSubjectSchema } from '@/schemas/exam/exam-module/masters';
import {
    UpdatedOrderdSubSubjects,
    addOrUpdateMasterSubSubject,
    getMasterSubSubjectOrderData
} from '@/server/exam/exam-module/masters/sus-subject';
import type { IMasterSubSubject } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Save } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
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
            mI_Id: 30,
            emsS_SubSubjectName: '',
            emsS_SubSubjectCode: '',
            emsS_Order: 0,
            emsS_ActiveFlag: true
        }
    });
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    // Submit handler
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

    // Fetch order data
    const handleSetOrder = async () => {
        try {
            const response = await getMasterSubSubjectOrderData(30);

            if (response.success && response.data) {
                const data = Array.isArray(response.data) ? response.data : [];
                const mapped = data.map((d: IMasterSubSubject) => ({ ...d, id: d.emsS_Id }));
                setOrderData(mapped);
                setOrderModalOpen(true);
            } else {
                toast.error(response.message || 'Failed to fetch sub-subjects.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong while fetching sub-subjects.');
        }
    };

    // Handle order save
    const handleOrderSave = async (updatedData: (IMasterSubSubject & { id: number })[]) => {
        try {
            setIsOrderSaving(true);
            // Build the DTO array
            const subsubjectDTO = updatedData.map((item, index) => ({
                emsS_Id: item.emsS_Id,
                emsS_Order: index + 1 // Correct property name
            }));

            // Wrap it in the correct payload structure
            const payload = { subsubjectDTO };
            // Send the payload to the API
            const response = await UpdatedOrderdSubSubjects(payload);

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                setIsOrderSaving(false);
                setOrderModalOpen(false);
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsOrderSaving(false);
            setOrderModalOpen(false);
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* SubSubject Name and Code */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Sub Subject Name'
                            required
                            {...register('emsS_SubSubjectName')}
                            error={errors.emsS_SubSubjectName?.message}
                        />

                        <InputText
                            label='Sub Subject Code'
                            required
                            {...register('emsS_SubSubjectCode')}
                            error={errors.emsS_SubSubjectCode?.message}
                        />
                    </div>
                </div>

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
                            Save Sub-Subject
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

            {/* Order Modal */}
            {orderModalOpen && (
                <MasterViewDetails
                    isOpen={orderModalOpen}
                    onClose={() => setOrderModalOpen(false)}
                    data={orderData}
                    isLoading={isOrderSaving}
                    columns={[
                        { key: 'id', label: 'SL.No', className: 'text-center w-12' },
                        { key: 'emsS_SubSubjectName', label: 'Sub Subject Name', className: 'text-left' },
                        { key: 'emsS_SubSubjectCode', label: 'Sub Subject Code', className: 'text-left' },
                        { key: 'emsS_Order', label: 'Order', className: 'text-left' }
                    ]}
                    onSave={handleOrderSave}
                    tableHeight='500px'
                />
            )}
        </div>
    );
}
