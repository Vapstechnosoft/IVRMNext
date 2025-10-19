'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MasterViewDetails } from '@/components/ui/set-order/generic-seto-order';
import { useMasterSubject } from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectSchema } from '@/schemas/exam/exam-module/masters';
import { UpdatedOrderdSubjects, addOrUpdateMasterSubject, getMasterSubjectOrderData } from '@/server/exam/exam-module/masters/subject';
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
    const [updatedOrderData, setUpdatedOrderData] = useState<IMasterSubjectOrder[]>([]);
    const [isOrderSaving, setIsOrderSaving] = useState(false);

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
            mI_Id: 30,
            ismS_Max_Marks: 0,
            ismS_Min_Marks: 0,
            ismS_PreadmFlag: 0,
            ismS_AttendanceFlag: true, // boolean
            ismS_BatchAppl: 0,
            ismS_ExamFlag: 0,
            ismS_LanguageFlg: 0,
            ismS_AtExtraFeeFlg: 0,
            ismS_ActiveFlag: 1, // Add this
            ismS_SubjectName: '', // Add all string fields
            ismS_IVRSSubjectName: '',
            ismS_SubjectCode: '',
            ismS_SubjectNameNew: ''
        }
    });

    // Submit handler
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

    // Fetch and open order modal
    const handleSetOrder = async () => {
        try {
            const response = await getMasterSubjectOrderData(30);

            if (response.success && response.data) {
                const subjects: IMasterSubjectOrder[] = Array.isArray(response.data) ? response.data : [];

                const mappedData = subjects.map((d) => ({ ...d, id: d.ismS_Id }));
                setOrderData(mappedData);
                setOrderModalOpen(true);
            } else {
                toast.error(response.message || 'Failed to fetch subjects.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong while fetching subjects.');
        }
    };

    // Save new order
    const handleOrderSave = async (updatedData: (IMasterSubjectOrder & { id: number })[]) => {
        try {
            setIsOrderSaving(true);
            const updatedOrderData = updatedData.map((item, index) => ({
                ismS_Id: item.ismS_Id,
                mI_Id: item.mI_Id,
                ismS_OrderFlag: index + 1
            }));

            const payload = {
                subject_list_Order: updatedOrderData // ✅ correct variable name
            };

            const response = await UpdatedOrderdSubjects(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
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
                    {/* Row 1 - Basic Info */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Subject Name'
                            required
                            id='ismS_SubjectName'
                            {...register('ismS_SubjectName')}
                            error={errors.ismS_SubjectName?.message}
                        />
                        <InputText
                            label='IVRS Subject Name'
                            required
                            id='ismS_IVRSSubjectName'
                            {...register('ismS_IVRSSubjectName')}
                            error={errors.ismS_IVRSSubjectName?.message}
                        />
                        <InputText
                            label='Subject Code'
                            required
                            id='ismS_SubjectCode'
                            {...register('ismS_SubjectCode')}
                            error={errors.ismS_SubjectCode?.message}
                        />
                        <InputText
                            label='Subject Type / New Name'
                            required
                            id='ismS_SubjectNameNew'
                            {...register('ismS_SubjectNameNew')}
                            error={errors.ismS_SubjectNameNew?.message}
                        />
                    </div>

                    {/* Row 2 - Marks */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='ismS_Max_Marks'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Max Marks'
                                        required
                                        id='ismS_Max_Marks'
                                        value={field.value ?? 0}
                                        onChange={field.onChange}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.ismS_Max_Marks && <FormError>{errors.ismS_Max_Marks.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='ismS_Min_Marks'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Min Marks'
                                        required
                                        id='ismS_Min_Marks'
                                        value={field.value ?? 0}
                                        onChange={field.onChange}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.ismS_Min_Marks && <FormError>{errors.ismS_Min_Marks.message}</FormError>}
                        </div>
                    </div>

                    {/* Row 3 - Flags */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {[
                            { name: 'ismS_PreadmFlag', label: 'Pre-Admission Flag', isBoolean: false },
                            { name: 'ismS_AttendanceFlag', label: 'Attendance Flag', isBoolean: true },
                            { name: 'ismS_BatchAppl', label: 'Batch Wise Flag', isBoolean: false },
                            { name: 'ismS_ExamFlag', label: 'Exam Flag', isBoolean: false },
                            { name: 'ismS_LanguageFlg', label: 'Language Flag', isBoolean: false },
                            { name: 'ismS_AtExtraFeeFlg', label: 'Extra Fee Flag', isBoolean: false }
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
                                            value={fieldDef.isBoolean ? (field.value ? '1' : '0') : String(field.value ?? 0)}
                                            onValueChange={(value) => field.onChange(fieldDef.isBoolean ? value === '1' : Number(value))}
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
                    isLoading={isOrderSaving}
                    columns={[
                        { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                        { key: 'ismS_SubjectName', label: 'Subject Name', className: 'text-left' },
                        { key: 'ismS_SubjectCode', label: 'Subject Code', className: 'text-left' },
                        { key: 'ismS_OrderFlag', label: 'Subject Order', className: 'text-left' }
                    ]}
                    onSave={handleOrderSave}
                    tableHeight='500px'
                />
            )}
        </div>
    );
}
