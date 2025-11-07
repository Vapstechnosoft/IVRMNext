'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useClassTeacherEmployee } from '@/hooks/admission/preadmission/useMasters';
import type { IMasterClassTeacherList } from '@/types/admission/preadmission/masters';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

interface FormFields {
    staff_a: number;
    staff_b: number;
    asmaY_Id_a: number;
    asmaY_Id_b: number;
}

interface ExchangeClassTeacherFormProps {
    rowData: IMasterClassTeacherList;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExchangeClassTeacherForm({ onClose }: ExchangeClassTeacherFormProps) {
    const [selectedAcademicYearA, setSelectedAcademicYearA] = useState<number | undefined>();
    const [selectedAcademicYearB, setSelectedAcademicYearB] = useState<number | undefined>();

    const {
        data: academicYear,
        isLoading: academicYearLoading,
        error: academicYearError,
        refetchAll: refetchAcademicYear
    } = useAcademicYearDropdown();

    // Separate hooks for Staff A and Staff B based on their respective academic years
    const { data: employeeDataA, isLoading: employeeLoadingA, error: employeeErrorA } = useClassTeacherEmployee(selectedAcademicYearA);

    const { data: employeeDataB, isLoading: employeeLoadingB, error: employeeErrorB } = useClassTeacherEmployee(selectedAcademicYearB);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        defaultValues: {
            staff_a: 0,
            staff_b: 0,
            asmaY_Id_a: 0,
            asmaY_Id_b: 0
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
        setSelectedAcademicYearA(undefined);
        setSelectedAcademicYearB(undefined);
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        // try {
        //   const { staff_a, staff_b, asmaY_Id_a, asmaY_Id_b } = data;
        //   const payload = {
        //     staff_a,
        //     staff_b,
        //     asmaY_Id_a,
        //     asmaY_Id_b,
        //   };
        //   const response = await toggleMasterClassCategory(payload);
        //   if (response.success) {
        //     toast.success(response.message);
        //     refetchAll();
        //     // Refetch employee dropdowns for both academic years
        //     refetchEmployeeA(asmaY_Id_a);
        //     refetchEmployeeB(asmaY_Id_b);
        //     refetchAcademicYear();
        //     closeDialog();
        //   } else {
        //     toast.error(response.message);
        //   }
        // } catch (error: any) {
        //   toast.error(error.message);
        // }
    };

    return (
        <AdaptiveDialog title='Exchange Class Teacher' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Staff A Section */}
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='academic-year-a' htmlFor='asmaY_Id_a'>
                                    Academic Year (A) <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id_a'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(value) => {
                                                const numValue = Number(value);
                                                field.onChange(numValue);
                                                setSelectedAcademicYearA(numValue);
                                            }}
                                            value={field.value?.toString() || ''}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading Academic Year...
                                                    </SelectItem>
                                                ) : academicYearError ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading Academic Year
                                                    </SelectItem>
                                                ) : (
                                                    academicYear?.data?.map((item) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id_a && <FormError>{errors.asmaY_Id_a.message}</FormError>}
                            </div>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='Staff A' htmlFor='staff_a'>
                                    Staff (A) <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='staff_a'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                            }}
                                            value={field.value?.toString() || ''}
                                            disabled={!selectedAcademicYearA}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Staff A' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employeeLoadingA ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading Staff...
                                                    </SelectItem>
                                                ) : employeeErrorA ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading Staff
                                                    </SelectItem>
                                                ) : !selectedAcademicYearA ? (
                                                    <SelectItem value='no-year' disabled>
                                                        Please select Academic Year first
                                                    </SelectItem>
                                                ) : (
                                                    employeeDataA?.data?.map((item: any) => (
                                                        <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                            {item.employee_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.staff_a && <FormError>{errors.staff_a.message}</FormError>}
                            </div>
                        </div>

                        {/* Staff B Section */}
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='academic-year-b' htmlFor='asmaY_Id_b'>
                                    Academic Year (B) <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id_b'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(value) => {
                                                const numValue = Number(value);
                                                field.onChange(numValue);
                                                setSelectedAcademicYearB(numValue);
                                            }}
                                            value={field.value?.toString() || ''}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading Academic Year...
                                                    </SelectItem>
                                                ) : academicYearError ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading Academic Year
                                                    </SelectItem>
                                                ) : (
                                                    academicYear?.data?.map((item) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id_b && <FormError>{errors.asmaY_Id_b.message}</FormError>}
                            </div>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='Staff B' htmlFor='staff_b'>
                                    Staff (B) <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='staff_b'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                            }}
                                            value={field.value?.toString() || ''}
                                            disabled={!selectedAcademicYearB}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Staff B' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employeeLoadingB ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading Staff...
                                                    </SelectItem>
                                                ) : employeeErrorB ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading Staff
                                                    </SelectItem>
                                                ) : !selectedAcademicYearB ? (
                                                    <SelectItem value='no-year' disabled>
                                                        Please select Academic Year first
                                                    </SelectItem>
                                                ) : (
                                                    employeeDataB?.data?.map((item: any) => (
                                                        <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                            {item.employee_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.staff_b && <FormError>{errors.staff_b.message}</FormError>}
                            </div>
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting}>
                        Exchange
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
