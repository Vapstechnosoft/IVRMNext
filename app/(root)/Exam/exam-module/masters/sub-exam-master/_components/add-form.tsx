'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { MasterViewDetails } from '@/components/ui/set-order/generic-seto-order';
import { useMasterExam } from '@/hooks/exam/exammodule/usemasters';
import { masterSubExamSchema } from '@/schemas/exam/exam-module/masters';
import { UpdatedOrderdSubExams, addOrUpdateMasterSubExam, getMasterSubExamOrderData } from '@/server/exam/exam-module/masters/sub-exam';
import type { IMasterSubExam } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Save } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubExamSchema.addOrUpdate>;

interface AddMasterSubExamFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterSubExamForm({ onSuccess, className = '' }: AddMasterSubExamFormProps) {
    const { refetchAll } = useMasterExam();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubExamSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            emsE_Id: 0,
            mI_Id: 30, // ✅ Default institution ID or dynamic if needed
            emsE_SubExamName: '',
            emsE_SubExamCode: ''
        }
    });

    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [orderData, setOrderData] = useState<(IMasterSubExam & { id: number })[]>([]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            console.info('data', data);
            const response = await addOrUpdateMasterSubExam(data);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving sub-exam.');
        }
    };

    const handleSetOrder = async () => {
        try {
            // Type the API response
            const data: { data: IMasterSubExam[] } = await getMasterSubExamOrderData();

            // Map each item and add 'id' field for table usage
            const mappedData: (IMasterSubExam & { id: number })[] = data.data.map((d: IMasterSubExam) => ({
                ...d,
                id: d.emsE_Id // for row identification
            }));

            setOrderData(mappedData); // use mappedData here
            setOrderModalOpen(true);
        } catch (error: any) {
            toast.error(error?.message || 'Error fetching sub-exam list.');
        }
    };

    const handleReset = () => reset();
    const handleOrderSave = async (updatedData: (IMasterSubExam & { id: number })[]) => {
        try {
            // Map updated data with new order
            const updatedOrderData = updatedData.map((item, index) => ({
                emsE_Id: item.emsE_Id,
                emsE_SubExamOrder: index + 1
            }));

            const payload = {
                subject_list_Order: updatedOrderData // ✅ correct variable name
            };

            console.log('Payload being sent:', payload);

            // Call API
            const response = await UpdatedOrderdSubExams(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong.');
        }
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Basic Fields */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <InputText
                        label='Sub Exam Name'
                        required
                        id='emsE_SubExamName'
                        {...register('emsE_SubExamName')}
                        error={errors.emsE_SubExamName?.message}
                    />

                    <InputText
                        label='Sub Exam Code'
                        required
                        id='emsE_SubExamCode'
                        {...register('emsE_SubExamCode')}
                        error={errors.emsE_SubExamCode?.message}
                    />
                </div>
                {/* Root Error */}
                {errors.root && <FormError>{errors.root.message}</FormError>}

                {/* Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
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
                            Save Sub Exam
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
                        { key: 'emsE_SubExamName', label: 'Sub-Exam Name', className: 'text-left' },
                        { key: 'emsE_SubExamCode', label: 'Sub-Exam Code', className: 'text-left' },
                        { key: 'emsE_SubExamOrder', label: 'Sub-Exam Order', className: 'text-left' }
                    ]}
                    onSave={handleOrderSave}
                    tableHeight='500px'
                />
            )}
        </div>
    );
}
