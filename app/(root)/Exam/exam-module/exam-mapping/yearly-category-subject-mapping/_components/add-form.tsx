'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYearlyCategorySubjectMapping } from '@/hooks/exam/exammodule/exam-mapping';
import { useMasterSubjectGroup } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { categorySubjectMappingSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getCategoryDropDownByAcademicYearlist } from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import { addOrUpdateYearlyCategorySubjectMapping } from '@/server/exam/exam-module/exam-mapping/yearly-category-subject-mapping';
import { getMasterSubjectGroupDetails } from '@/server/exam/exam-module/masters/subject-group';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IYearlyCategorySubjectMapping } from '@/types/exam/exam-module/exam-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof categorySubjectMappingSchema.addOrUpdate>;

export default function AddCategorySubjectMappingForm({ onSuccess }: { onSuccess?: () => void }, rowData?: IYearlyCategorySubjectMapping) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(categorySubjectMappingSchema.addOrUpdate),
        mode: 'all',
        defaultValues: {
            userId: 1,
            eycG_Id: 0,
            mI_Id: 30,
            asmaY_Id: 0,
            emcA_Id: 0,
            emG_Id: 0,
            subjects_list: [],
            eyC_BasedOnPaperTypeFlg: false
        }
    });
    const { refetchAll } = useYearlyCategorySubjectMapping();
    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { errors, isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<{ emG_Id: number; emG_GroupName: string }[]>([]);
    const [subjects, setSubjects] = useState<{ ismS_Id: number; ismS_SubjectName: string }[]>([]);
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: subjectGroupList, error: subjectGroupError } = useMasterSubjectGroup();
    useEffect(() => {
        reset({
            userId: 1,
            eycG_Id: rowData?.eycG_Id ?? 0,
            mI_Id: 30,
            asmaY_Id: rowData?.asmaY_Id ?? 0,
            emcA_Id: 0,
            emG_Id: rowData?.emG_Id ?? 0,
            subjects_list: [],
            eyC_BasedOnPaperTypeFlg: rowData?.eyC_BasedOnPaperTypeFlg ?? false
        });
    }, [reset, rowData]);

    useEffect(() => {
        // Academic Years
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYears([]);
        } else if (academicData?.data && Array.isArray(academicData.data)) {
            const formattedYears: IAcademicYearDropDown[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id?.toString() ?? '',
                asmaY_Year: item.asmaY_Year ?? '',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formattedYears);
        } else {
            setAcademicYears([]);
        }

        if (subjectGroupError) {
            toast.error(subjectGroupError.message || 'Error fetching subject groups');
            setSubjectGroups([]);
        } else if (subjectGroupList?.data && Array.isArray(subjectGroupList.data)) {
            setSubjectGroups(subjectGroupList.data);
        } else {
            setSubjectGroups([]);
        }
    }, [academicData, academicError, subjectGroupList, subjectGroupError]);

    // Watch selected Academic Year
    const selectedYearId = useWatch({
        control,
        name: 'asmaY_Id'
    });

    // Fetch categories whenever Academic Year changes
    useEffect(() => {
        if (!selectedYearId) return;
        async function fetchCategories() {
            try {
                const { data: cats } = await getCategoryDropDownByAcademicYearlist(30, selectedYearId);
                setCategories(Array.isArray(cats) ? cats : []);
                setValue('emcA_Id', 0); // reset selected category whenever year changes
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
            }
        }
        fetchCategories();
    }, [selectedYearId]);

    const selectedGroupSubjectId = useWatch({
        control,
        name: 'emG_Id'
    });

    // Fetch categories whenever Academic Year changes
    useEffect(() => {
        if (!selectedGroupSubjectId) return;
        async function fetchSubjects() {
            try {
                const { data: subj } = await getMasterSubjectGroupDetails(selectedGroupSubjectId);

                setSubjects(Array.isArray(subj) ? subj : []);
                setValue('subjects_list', []); // reset selected category whenever year changes
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
            }
        }
        fetchSubjects();
    }, [selectedGroupSubjectId]);

    const onSubmit = async (data: FormFields) => {
        try {
            const res = await addOrUpdateYearlyCategorySubjectMapping(data);
            if (res?.success) {
                toast.success('Yearly category dates mapping saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res?.message ?? 'Save failed');
            }
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to save');
        }
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Left Column */}
                        <div className='grid grid-rows-2 gap-3'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='emcA_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Category <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cats) => (
                                                    <SelectItem key={cats.emcA_Id} value={String(cats.emcA_Id)}>
                                                        {cats.emcA_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='emG_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Subject Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Subject Group' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjectGroups.map((grop) => (
                                                    <SelectItem key={grop.emG_Id} value={String(grop.emG_Id)}>
                                                        {grop.emG_GroupName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='eyC_BasedOnPaperTypeFlg'
                                render={({ field }) => (
                                    <label className='flex items-center space-x-2'>
                                        <input
                                            type='checkbox'
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className='h-4 w-4'
                                        />
                                        <span>Based on Paper Type</span>
                                    </label>
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                control={control}
                                name='subjects_list'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        options={subjects.map((subj) => ({
                                            label: subj.ismS_SubjectName,
                                            value: subj.ismS_Id.toString()
                                        }))}
                                        onChange={(selectedValues) => {
                                            const selected = subjects.filter((subj) => selectedValues.includes(subj.ismS_Id.toString()));
                                            field.onChange(selected);
                                        }}
                                        value={field.value.map((subj: { ismS_Id: { toString: () => any } }) => subj.ismS_Id.toString())}
                                        label='Subjects'
                                        height='200px'
                                        isSearchRequired={true}
                                        error={errors.subjects_list?.message}
                                    />
                                )}
                            />
                            {errors.subjects_list && <p className='text-red-600 text-sm'>{errors.subjects_list.message}</p>}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='mt-4 flex justify-start gap-4'>
                        <Button type='submit' className='w-fit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type='button' variant='outline' className='w-fit' onClick={() => reset()}>
                            Reset
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
