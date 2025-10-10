'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MasterViewDetails } from '@/components/ui/set-order/generic-seto-order';
import { useMasterSubject } from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubject, getMasterSubjectOrderData } from '@/server/exam/exam-module/masters/subject';
import type { IMasterSubjectOrder } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubjectSchema.addOrUpdate>;

interface AddMasterSubjectFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterSubjectForm({ onSuccess, className = '' }: AddMasterSubjectFormProps) {
    const { refetchAll } = useMasterSubject();

    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [orderData, setOrderData] = useState<(IMasterSubjectOrder & { id: number })[]>([]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            exsuB_MaxMarks: 0,
            exsuB_MinMarks: 0,
            exsuB_PreAdmissionFlag: 0,
            exsuB_AttendanceFlag: 0,
            exsuB_BatchWiseFlag: 0,
            exsuB_ExamFlag: 0,
            exsuB_LanguageFlag: 0,
            exsuB_ExtraFeeFlag: 0
        }
    });

    // ⏺ Submit handler
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await addOrUpdateMasterSubject(data);

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

    // 🔹 Fetch and open order modal
    const handleSetOrder = async () => {
        try {
            const data = await getMasterSubjectOrderData();
            const mappedData = data?.data?.map((d) => ({ ...d, id: d.exsuB_Id })) || [];
            setOrderData(mappedData);
            setOrderModalOpen(true);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // 🔹 Save new order
    const handleOrderSave = (updatedData: (IMasterSubjectOrder & { id: number })[]) => {
        setOrderData(updatedData);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* Row 1 - Basic Info */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Subject Name'
                            required
                            id='exsuB_SubjectName'
                            {...register('exsuB_SubjectName')}
                            error={errors.exsuB_SubjectName?.message}
                        />
                        <InputText
                            label='IVRS Subject Name'
                            required
                            id='exsuB_IVRSName'
                            {...register('exsuB_IVRSName')}
                            error={errors.exsuB_IVRSName?.message}
                        />
                        <InputText
                            label='Subject Code'
                            required
                            id='exsuB_SubjectCode'
                            {...register('exsuB_SubjectCode')}
                            error={errors.exsuB_SubjectCode?.message}
                        />
                        <InputText
                            label='Subject Type'
                            required
                            id='exsuB_SubjectType'
                            {...register('exsuB_SubjectType')}
                            error={errors.exsuB_SubjectType?.message}
                        />
                    </div>

                    {/* Row 2 - Marks */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='exsuB_MaxMarks'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Max Marks'
                                        required
                                        id='exsuB_MaxMarks'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.exsuB_MaxMarks && <FormError>{errors.exsuB_MaxMarks.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='exsuB_MinMarks'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Min Marks'
                                        required
                                        id='exsuB_MinMarks'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.exsuB_MinMarks && <FormError>{errors.exsuB_MinMarks.message}</FormError>}
                        </div>
                    </div>

                    {/* Row 3 - Flags */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {[
                            { name: 'exsuB_PreAdmissionFlag', label: 'Pre-Admission Flag' },
                            { name: 'exsuB_AttendanceFlag', label: 'Attendance Flag' },
                            { name: 'exsuB_BatchWiseFlag', label: 'Batch Wise Flag' },
                            { name: 'exsuB_ExamFlag', label: 'Exam Flag' },
                            { name: 'exsuB_LanguageFlag', label: 'Language Flag' },
                            { name: 'exsuB_ExtraFeeFlag', label: 'Extra Fee Flag' }
                        ].map((fieldDef) => (
                            <div key={fieldDef.name} className='group flex flex-col gap-1.5'>
                                <Label htmlFor={fieldDef.name}>
                                    {fieldDef.label} <span className='ml-1 text-red-500'>*</span>
                                </Label>

                                <Controller
                                    name={fieldDef.name as keyof FormFields}
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={String(field.value ?? 0)}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            className='flex gap-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id={`${fieldDef.name}-yes`} />
                                                <Label htmlFor={`${fieldDef.name}-yes`}>Yes</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='0' id={`${fieldDef.name}-no`} />
                                                <Label htmlFor={`${fieldDef.name}-no`}>No</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {errors[fieldDef.name as keyof FormFields] && (
                                    <FormError>{String(errors[fieldDef.name as keyof FormFields]?.message)}</FormError>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Root Error */}
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
                            Save Subject
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
                        { key: 'exsuB_SubjectName', label: 'Subject Name', className: 'text-left' },
                        { key: 'exsuB_SubjectCode', label: 'Subject Code', className: 'text-left' },
                        { key: 'exsuB_SubjectOrder', label: 'Subject Order', className: 'text-left' }
                    ]}
                    onSave={handleOrderSave}
                    tableHeight='500px'
                />
            )}
        </div>
    );
}
