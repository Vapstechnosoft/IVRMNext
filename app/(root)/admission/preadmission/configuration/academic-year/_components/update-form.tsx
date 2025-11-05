'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { usePreAdmissionAcademicYear } from '@/hooks/admission/preadmission/useConfigurations';
import { PreAdmissionAcademicYearSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdatePreAdmissionYear } from '@/server/admission/preadmission/configuration/academic_year_master';
import type { IMasterAcademicYearMasterList } from '@/types/admission/preadmission/configaration';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof PreAdmissionAcademicYearSchema.addOrUpdate>;

interface UpdateMasterAcademicYearFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterAcademicYearMasterList;
}

export default function UpdateMasterAcademicYearForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterAcademicYearFormProps) {
    const { refetchAll } = usePreAdmissionAcademicYear();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(PreAdmissionAcademicYearSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            // Extract from and to years from asmaY_Year (e.g., "1199-1200")
            const [fromYear, toYear] = row.asmaY_Year?.split('-') || ['', ''];

            reset({
                asmaY_Id: Number(row.asmaY_Id),
                academicFromYear: fromYear,
                academicToYear: toYear,
                asmaY_Year: row.asmaY_Year,
                asmaY_From_Date: row.asmaY_From_Date ? new Date(row.asmaY_From_Date).toISOString().slice(0, 16) : null,
                asmaY_To_Date: row.asmaY_To_Date ? new Date(row.asmaY_To_Date).toISOString().slice(0, 16) : null,
                asmaY_PreAdm_F_Date: row.asmaY_PreAdm_F_Date ? new Date(row.asmaY_PreAdm_F_Date).toISOString().slice(0, 16) : null,
                asmaY_PreAdm_T_Date: row.asmaY_PreAdm_T_Date ? new Date(row.asmaY_PreAdm_T_Date).toISOString().slice(0, 16) : null,
                asmaY_Order: Number(row.asmaY_Order),
                asmaY_ActiveFlag: Number(row.asmaY_ActiveFlag),
                asmaY_Cut_Of_Date: row.asmaY_Cut_Of_Date ? new Date(row.asmaY_Cut_Of_Date).toISOString().slice(0, 16) : null,
                asmaY_Pre_ActiveFlag: Number(row.asmaY_Pre_ActiveFlag),
                asmaY_ReggularFlg: Boolean(row.asmaY_ReggularFlg),
                asmaY_NewFlg: Boolean(row.asmaY_NewFlg),
                asmaY_NewAdmissionFlg: Boolean(row.asmaY_NewAdmissionFlg),
                asmaY_TransportSDate: row.asmaY_TransportSDate ? new Date(row.asmaY_TransportSDate).toISOString().slice(0, 16) : null,
                asmaY_TransportEDate: row.asmaY_TransportEDate ? new Date(row.asmaY_TransportEDate).toISOString().slice(0, 16) : null,
                asmaY_ReferenceDate: row.asmaY_ReferenceDate ? new Date(row.asmaY_ReferenceDate).toISOString().slice(0, 16) : null,
                asmaY_AcademicYearCode: row.asmaY_AcademicYearCode,
                asmaY_AdvanceFeeDate: row.asmaY_AdvanceFeeDate ? new Date(row.asmaY_AdvanceFeeDate).toISOString().slice(0, 16) : null,
                asmaY_RegularFeeFDate: row.asmaY_RegularFeeFDate ? new Date(row.asmaY_RegularFeeFDate).toISOString().slice(0, 16) : null,
                asmaY_RegularFeeTDate: row.asmaY_RegularFeeTDate ? new Date(row.asmaY_RegularFeeTDate).toISOString().slice(0, 16) : null,
                asmaY_ArrearFeeDate: row.asmaY_ArrearFeeDate ? new Date(row.asmaY_ArrearFeeDate).toISOString().slice(0, 16) : null
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const payload = {
                ASMAY_Id: Number(row.asmaY_Id),
                ASMAY_Year: data.asmaY_Year,
                ASMAY_From_Date: data.asmaY_From_Date,
                ASMAY_To_Date: data.asmaY_To_Date,
                ASMAY_PreAdm_F_Date: data.asmaY_PreAdm_F_Date,
                ASMAY_PreAdm_T_Date: data.asmaY_PreAdm_T_Date,
                ASMAY_Order: Number(data.asmaY_Order),
                ASMAY_ActiveFlag: Number(data.asmaY_ActiveFlag),
                ASMAY_Cut_Of_Date: data.asmaY_Cut_Of_Date,
                ASMAY_Pre_ActiveFlag: Number(data.asmaY_Pre_ActiveFlag),
                ASMAY_ReggularFlg: Boolean(data.asmaY_ReggularFlg),
                ASMAY_NewFlg: Boolean(data.asmaY_NewFlg),
                ASMAY_NewAdmissionFlg: Boolean(data.asmaY_NewAdmissionFlg),
                ASMAY_TransportSDate: data.asmaY_TransportSDate,
                ASMAY_TransportEDate: data.asmaY_TransportEDate,
                ASMAY_ReferenceDate: data.asmaY_ReferenceDate,
                ASMAY_AcademicYearCode: data.asmaY_AcademicYearCode,
                ASMAY_AdvanceFeeDate: data.asmaY_AdvanceFeeDate,
                ASMAY_RegularFeeFDate: data.asmaY_RegularFeeFDate,
                ASMAY_RegularFeeTDate: data.asmaY_RegularFeeTDate,
                ASMAY_ArrearFeeDate: data.asmaY_ArrearFeeDate
            };

            const response = await addOrUpdatePreAdmissionYear(payload);

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

    const handleReset = () => {
        reset();
    };
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* Basic Information */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Academic Year'
                            required
                            id='asmaY_Year'
                            placeholder='e.g., 1199-1200'
                            {...register('asmaY_Year')}
                            defaultValue={row.asmaY_Year}
                            error={errors.asmaY_Year?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Academic Year Code'
                            required
                            id='asmaY_AcademicYearCode'
                            placeholder='Enter Code'
                            {...register('asmaY_AcademicYearCode')}
                            defaultValue={row.asmaY_AcademicYearCode}
                            error={errors.asmaY_AcademicYearCode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Academic Year Order'
                            required
                            type='number'
                            id='asmaY_Order'
                            placeholder='Enter Order'
                            {...register('asmaY_Order', { valueAsNumber: true })}
                            defaultValue={row.asmaY_Order}
                            error={errors.asmaY_Order?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Academic Year Dates */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Start Date'
                            required
                            type='datetime-local'
                            id='asmaY_From_Date'
                            {...register('asmaY_From_Date')}
                            defaultValue={row.asmaY_From_Date}
                            error={errors.asmaY_From_Date?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='End Date'
                            required
                            type='datetime-local'
                            id='asmaY_To_Date'
                            {...register('asmaY_To_Date')}
                            defaultValue={row.asmaY_To_Date}
                            error={errors.asmaY_To_Date?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Pre-Admission Dates */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Pre-Admission Start Date'
                            required
                            type='datetime-local'
                            id='asmaY_PreAdm_F_Date'
                            {...register('asmaY_PreAdm_F_Date')}
                            defaultValue={row.asmaY_PreAdm_F_Date}
                            error={errors.asmaY_PreAdm_F_Date?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Pre-Admission End Date'
                            required
                            type='datetime-local'
                            id='asmaY_PreAdm_T_Date'
                            {...register('asmaY_PreAdm_T_Date')}
                            defaultValue={row.asmaY_PreAdm_T_Date}
                            error={errors.asmaY_PreAdm_T_Date?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Transport Dates */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Pre Admission Age Cut off Date'
                            required
                            type='datetime-local'
                            id='asmaY_Cut_Of_Date'
                            {...register('asmaY_Cut_Of_Date')}
                            defaultValue={row.asmaY_Cut_Of_Date}
                            error={errors.asmaY_Cut_Of_Date?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Reference Date'
                            type='datetime-local'
                            id='asmaY_ReferenceDate'
                            {...register('asmaY_ReferenceDate')}
                            defaultValue={row.asmaY_ReferenceDate}
                            error={errors.asmaY_ReferenceDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Fee Dates */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Transport Start Date'
                            type='datetime-local'
                            id='asmaY_TransportSDate'
                            {...register('asmaY_TransportSDate')}
                            defaultValue={row.asmaY_TransportSDate}
                            error={errors.asmaY_TransportSDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Transport End Date'
                            type='datetime-local'
                            id='asmaY_TransportEDate'
                            {...register('asmaY_TransportEDate')}
                            defaultValue={row.asmaY_TransportEDate}
                            error={errors.asmaY_TransportEDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Financial Year Start Date'
                            type='datetime-local'
                            id='asmaY_RegularFeeFDate'
                            {...register('asmaY_RegularFeeFDate')}
                            defaultValue={row.asmaY_RegularFeeFDate}
                            error={errors.asmaY_RegularFeeFDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Financial Year End Date'
                            type='datetime-local'
                            id='asmaY_RegularFeeTDate'
                            {...register('asmaY_RegularFeeTDate')}
                            defaultValue={row.asmaY_RegularFeeTDate}
                            error={errors.asmaY_RegularFeeTDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Other Dates */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Advance Date'
                            type='datetime-local'
                            id='asmaY_AdvanceFeeDate'
                            {...register('asmaY_AdvanceFeeDate')}
                            defaultValue={row.asmaY_AdvanceFeeDate}
                            error={errors.asmaY_AdvanceFeeDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Arrear Date'
                            type='datetime-local'
                            id='asmaY_ArrearFeeDate'
                            {...register('asmaY_ArrearFeeDate')}
                            defaultValue={row.asmaY_ArrearFeeDate}
                            error={errors.asmaY_ArrearFeeDate?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Boolean Flags */}
                    <div className='flex justify-start gap-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='asmaY_ReggularFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='asmaY_ReggularFlg' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='asmaY_ReggularFlg' className='cursor-pointer'>
                                Regular Flag
                            </Label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='asmaY_NewFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='asmaY_NewFlg' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='asmaY_NewFlg' className='cursor-pointer'>
                                New Flag
                            </Label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='asmaY_NewAdmissionFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='asmaY_NewAdmissionFlg' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='asmaY_NewAdmissionFlg' className='cursor-pointer'>
                                New Admission Flag
                            </Label>
                        </div>
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
                            Save Academic Year
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
