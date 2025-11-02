'use client';

import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoryClassMappingSchema } from '@/schemas/exam/exam-module/masters';
import {
    addOrUpdateCategoryClassMapping,
    getAcademicYears,
    getCategories,
    getClassMappedSections,
    getClasses
} from '@/server/exam/exam-module/masters/category-class-mapping';
import type { IAcademicYear, ICategory, ICategoryMapping, IClass } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof categoryClassMappingSchema.addOrUpdate>;

interface UpdateCategoryClassFormProps {
    onSuccess?: () => void;
    initialData: ICategoryMapping;
}

export default function UpdateCategoryClassForm({ onSuccess, initialData }: UpdateCategoryClassFormProps) {
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(categoryClassMappingSchema.addOrUpdate),
        defaultValues: initialData
    });

    const watchedYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const years = await getAcademicYears();
                const { data: cats } = await getCategories();
                const { data: cls } = await getClasses();
                setAcademicYears(Array.isArray(years) ? years : []);
                setCategories(Array.isArray(cats) ? cats : []);
                setClasses(Array.isArray(cls) ? cls : []);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (watchedYear && watchedClass) {
            async function fetchSections() {
                try {
                    setLoadingSections(true);
                    const res = await getClassMappedSections(watchedYear, watchedClass);
                    const sectionData = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
                    setSections(sectionData);
                    //   if (initialData?.section_list?.length) {
                    //     const validSections = sectionData.filter((s) =>
                    //       initialData.section_list.some((sel) => sel.asmS_Id === s.asmS_Id)
                    //     );
                    //     setValue('section_list', validSections);
                    //   }
                } catch (err: any) {
                    toast.error(err.message || 'Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            }
            fetchSections();
        }
    }, [watchedYear, watchedClass, initialData, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const res = await addOrUpdateCategoryClassMapping(data);
            if (res.success) {
                toast.success('Category Class Mapping Updated Successfully');
                onSuccess?.();
            } else {
                toast.error(res.message);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update mapping');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
                <Controller
                    control={control}
                    name='asmaY_Id'
                    render={({ field }) => (
                        <Select
                            value={field.value ? String(field.value) : ''}
                            disabled
                            onValueChange={(val) => field.onChange(Number(val))}>
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

                <Controller
                    control={control}
                    name='emcA_Id'
                    render={({ field }) => (
                        <Select
                            value={field.value ? String(field.value) : ''}
                            disabled
                            onValueChange={(val) => field.onChange(Number(val))}>
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

                <Controller
                    control={control}
                    name='asmcL_Id'
                    render={({ field }) => (
                        <Select
                            value={field.value ? String(field.value) : ''}
                            disabled
                            onValueChange={(val) => field.onChange(Number(val))}>
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

            <div className='space-y-2'>
                <h3 className='font-semibold'>Sections</h3>
                <Controller
                    control={control}
                    name='section_list'
                    render={({ field }) =>
                        loadingSections ? (
                            <p>Loading sections...</p>
                        ) : sections.length ? (
                            <MultiSelect
                                options={sections.map((section) => ({
                                    label: section.asmC_SectionName,
                                    value: section.asmS_Id.toString()
                                }))}
                                onValueChange={(selectedValues) => {
                                    const selected = sections.filter((s) => selectedValues.includes(s.asmS_Id.toString()));
                                    field.onChange(selected);
                                }}
                                value={field.value.map((s) => s.asmS_Id.toString())}
                                placeholder='Select Sections'
                                variant='inverted'
                            />
                        ) : (
                            <p className='text-gray-500'>Select Academic Year, Category, and Class to load sections</p>
                        )
                    }
                />
                {errors.section_list && <p className='text-red-600 text-sm'>{errors.section_list.message}</p>}
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:col-span-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => window.location.reload()}
                    disabled={isSubmitting}
                    className='w-fit transition-all duration-200 hover:scale-105'>
                    Cancel
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-fit transition-all duration-200 hover:scale-105'
                    isLoading={isSubmitting}
                    loadingText='Updating...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Update Category Class Mapping
                    </div>
                </Button>
            </div>
        </form>
    );
}
