'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    addOrUpdateCategoryClassMapping,
    getAcademicYears,
    getCategories,
    getClasses
} from '@/server/exam/exam-module/masters/category-class-mapping';
import type { ICategoryMapping, ISection } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// ------------------------- ZOD Schema
export const categoryClassMappingSchema = z.object({
    ex_AcademicYear: z.string().nonempty({ message: 'Academic Year is required' }),
    ex_CategoryName: z.string().nonempty({ message: 'Category is required' }),
    ex_ClassName: z.string().nonempty({ message: 'Class is required' }),
    sections: z
        .array(
            z.object({
                id: z.number(),
                name: z.string()
            })
        )
        .min(1, { message: 'At least one section must be selected' })
});

export type CategoryClassFormFields = z.infer<typeof categoryClassMappingSchema>;

interface UpdateCategoryClassFormProps {
    initialData: ICategoryMapping;
    sections: ISection[];
    _selectedSections: ISection[];
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateCategoryClassMappingForm({
    initialData,
    sections,
    _selectedSections,
    onSuccess,
    className = ''
}: UpdateCategoryClassFormProps) {
    const [academicYears, setAcademicYears] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [selectedSections, setSelectedSections] = useState<ISection[]>(_selectedSections || []);
    const [loadingSections, setLoadingSections] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CategoryClassFormFields>({
        resolver: zodResolver(categoryClassMappingSchema),
        defaultValues: {
            ex_AcademicYear: initialData.ex_AcademicYear || '',
            ex_CategoryName: initialData.ex_CategoryName || '',
            ex_ClassName: initialData.ex_ClassName || '',
            sections: _selectedSections || []
        }
    });

    const _watchedYear = watch('ex_AcademicYear');
    const _watchedCategory = watch('ex_CategoryName');
    const _watchedClass = watch('ex_ClassName');

    // ------------------------- Reset form when initialData changes (for editing)
    useEffect(() => {
        reset({
            ex_AcademicYear: initialData.ex_AcademicYear,
            ex_CategoryName: initialData.ex_CategoryName,
            ex_ClassName: initialData.ex_ClassName,
            sections: _selectedSections || []
        });
        setSelectedSections(_selectedSections || []);
    }, [initialData, _selectedSections, reset]);

    // ------------------------- Fetch dropdowns
    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const years = await getAcademicYears();
                const cats = await getCategories();
                const cls = await getClasses();
                setAcademicYears(years.map((a) => a.year) || []);
                setCategories(cats.map((c) => c.name) || []);
                setClasses(cls.map((c) => c.name) || []);
                setLoadingSections(false);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }
        fetchDropdowns();
    }, []);

    // ------------------------- Submit handler
    const onSubmit: SubmitHandler<CategoryClassFormFields> = async (data) => {
        const payload = {
            ...data,
            ex_Id: initialData.ex_Id,
            sections: selectedSections
        };

        try {
            const res = await addOrUpdateCategoryClassMapping(payload);
            if (res.success) {
                toast.success('Mapping updated successfully');
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to update mapping');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error updating mapping');
        }
    };

    // ------------------------- JSX
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${className}`}>
            {/* Left - Dropdowns */}
            <div className='space-y-4'>
                {/* Academic Year */}
                <Controller
                    control={control}
                    name='ex_AcademicYear'
                    defaultValue={initialData.ex_AcademicYear}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.ex_AcademicYear && <p className='text-red-600 text-sm'>{errors.ex_AcademicYear.message}</p>}

                {/* Category */}
                <Controller
                    control={control}
                    name='ex_CategoryName'
                    defaultValue={initialData.ex_CategoryName}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Category' />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.ex_CategoryName && <p className='text-red-600 text-sm'>{errors.ex_CategoryName.message}</p>}

                {/* Class */}
                <Controller
                    control={control}
                    name='ex_ClassName'
                    defaultValue={initialData.ex_ClassName}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls} value={cls}>
                                        {cls}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.ex_ClassName && <p className='text-red-600 text-sm'>{errors.ex_ClassName.message}</p>}
            </div>

            {/* Right - Sections */}
            <div className='space-y-2'>
                <h3 className='font-semibold'>Sections</h3>
                {loadingSections ? (
                    <p>Loading sections...</p>
                ) : sections.length ? (
                    <div className='grid grid-cols-1 gap-2'>
                        {sections.map((sec) => (
                            <label key={sec.id} htmlFor={`checkbox-${sec.id}`} className='flex items-center gap-2'>
                                <Checkbox
                                    id={`checkbox-${sec.id}`}
                                    checked={selectedSections.some((s) => s.id === sec.id)}
                                    onCheckedChange={(val) => {
                                        if (val) setSelectedSections((prev) => [...prev, sec]);
                                        else setSelectedSections((prev) => prev.filter((s) => s.id !== sec.id));
                                    }}
                                />
                                <span>{sec.name}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className='text-gray-500'>Select Academic Year, Category, and Class to load sections</p>
                )}
            </div>

            {/* Actions */}
            <div className='col-span-1 mt-4 flex justify-end gap-2 md:col-span-2'>
                <Button type='button' variant='outline' onClick={() => window.location.reload()}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Updating...'>
                    Update
                </Button>
            </div>
        </form>
    );
}
