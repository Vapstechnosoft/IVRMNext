'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterCategoryClassMapping } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { categoryClassMappingSchema } from '@/schemas/exam/exam-module/masters';
import {
    addOrUpdateCategoryClassMapping,
    getCategories,
    getClassMappedSections,
    getClasses
} from '@/server/exam/exam-module/masters/category-class-mapping';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IAcademicYear, ICategory, IClass } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof categoryClassMappingSchema.addOrUpdate>;

interface AddCategoryClassFormProps {
    onSuccess?: () => void;
    initialData?: FormFields;
}

export default function AddCategoryClassForm({ onSuccess, initialData }: AddCategoryClassFormProps) {
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { refetchAll } = useMasterCategoryClassMapping();
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(categoryClassMappingSchema.addOrUpdate),
        defaultValues: initialData || {
            mI_Id: 30, // fixed from payload
            emcA_Id: 0,
            ecaC_Id: 0,
            asmaY_Id: 0,
            asmcL_Id: 0,
            section_list: []
        }
    });

    const watchedYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');
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
    }, [academicData, academicError]);

    // Fetch dropdown data
    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const { data: cats } = await getCategories();
                const { data: cls } = await getClasses();
                setCategories(Array.isArray(cats) ? cats : []);
                setClasses(Array.isArray(cls) ? cls : []);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }
        fetchDropdowns();
    }, []);

    // Fetch sections based on year and class
    useEffect(() => {
        if (watchedYear && watchedClass) {
            async function fetchSections() {
                try {
                    setLoadingSections(true);
                    const res = await getClassMappedSections(watchedYear, watchedClass);
                    const sectionData = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

                    setSections(sectionData);
                    if (initialData?.section_list?.length) {
                        const selected = sectionData.filter((s) => initialData.section_list.some((sel) => sel.asmS_Id === s.asmS_Id));
                        setValue('section_list', selected);
                    } else {
                        setValue('section_list', []);
                    }
                } catch (err: any) {
                    toast.error(err.message || 'Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            }
            fetchSections();
        } else {
            setSections([]);
            setValue('section_list', []);
        }
    }, [watchedYear, watchedClass, initialData, setValue]);

    // Submit Handler
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                section_list: data.section_list.map((s) => ({
                    asmS_Id: s.asmS_Id
                }))
            };
            const res = await addOrUpdateCategoryClassMapping(payload);
            if (res.success) {
                toast.success(res.message);
                onSuccess?.();
            } else {
                toast.error(res.message);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save mapping');
        }
    };

    // JSX
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Left Side */}
            <div className='space-y-4'>
                {/* Academic Year */}
                <Controller
                    control={control}
                    name='asmaY_Id'
                    render={({ field }) => (
                        <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                        {year.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.asmaY_Id && <p className='text-red-600 text-sm'>{errors.asmaY_Id.message}</p>}

                {/* Category */}
                <Controller
                    control={control}
                    name='emcA_Id'
                    render={({ field }) => (
                        <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Category' />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.emcA_Id} value={String(cat.emcA_Id)}>
                                        {cat.emcA_CategoryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.emcA_Id && <p className='text-red-600 text-sm'>{errors.emcA_Id.message}</p>}

                {/* Class */}
                <Controller
                    control={control}
                    name='asmcL_Id'
                    render={({ field }) => (
                        <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                        {cls.asmcL_ClassName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.asmcL_Id && <p className='text-red-600 text-sm'>{errors.asmcL_Id.message}</p>}
            </div>

            {/* Right Side - Sections */}
            <div className='space-y-2'>
                {!sections.length && <h4 className='font-semibold'>Sections</h4>}
                <Controller
                    control={control}
                    name='section_list'
                    render={({ field }) =>
                        loadingSections ? (
                            <p>Loading sections...</p>
                        ) : sections.length ? (
                            <CustomMultiSelectBox
                                options={sections.map((section) => ({
                                    label: section.asmC_SectionName,
                                    value: section.asmS_Id.toString()
                                }))}
                                value={field.value.map((s) => s.asmS_Id.toString())}
                                onChange={(vals) => {
                                    const selected = sections
                                        .filter((s) => vals.includes(s.asmS_Id.toString()))
                                        .map((s) => ({ asmS_Id: s.asmS_Id }));
                                    field.onChange(selected);
                                }}
                                isSearchRequired
                                error={errors.section_list?.message}
                            />
                        ) : (
                            <p className='text-gray-500'>Select Academic Year, Category, and Class to load sections</p>
                        )
                    }
                />
            </div>

            {/* Buttons */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:col-span-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => window.location.reload()}
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
                        Save Category Class Mapping
                    </div>
                </Button>
            </div>
        </form>
    );
}
