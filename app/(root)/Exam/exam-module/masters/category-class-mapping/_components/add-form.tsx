'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    addOrUpdateCategoryClassMapping,
    getAcademicYears,
    getCategories,
    getClassMappedSections,
    getClasses
} from '@/server/exam/exam-module/masters/category-class-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// -------------------------
// ZOD SCHEMA
// -------------------------
export const categoryClassMappingSchema = z.object({
    ex_AcademicYear: z.string().nonempty({ message: 'Academic Year is required' }),
    ex_CategoryName: z.string().nonempty({ message: 'Category is required' }),
    ex_ClassName: z.string().nonempty({ message: 'Class is required' }),
    sections: z.array(z.number()).min(1, { message: 'At least one section must be selected' })
});

type FormFields = z.infer<typeof categoryClassMappingSchema>;

interface AddCategoryClassFormProps {
    onSuccess?: () => void;
    initialData?: FormFields;
}

export default function AddCategoryClassForm({ onSuccess, initialData }: AddCategoryClassFormProps) {
    const [academicYears, setAcademicYears] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(categoryClassMappingSchema),
        defaultValues: initialData || {
            ex_AcademicYear: '',
            ex_CategoryName: '',
            ex_ClassName: '',
            sections: []
        }
    });

    const watchedYear = watch('ex_AcademicYear');
    const _watchedCategory = watch('ex_CategoryName');
    const watchedClass = watch('ex_ClassName');

    // ------------------------- Fetch dropdown options
    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const years = await getAcademicYears();
                const cats = await getCategories();
                const cls = await getClasses();
                setAcademicYears(years.map((a) => a.year) || []);
                setCategories(cats.map((c) => c.name) || []);
                setClasses(cls.map((c) => c.name) || []);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }
        fetchDropdowns();
    }, []);

    // ------------------------- Fetch sections once all three selected
    useEffect(() => {
        if (watchedYear && watchedClass) {
            async function fetchSections() {
                try {
                    setLoadingSections(true);
                    const res = await getClassMappedSections(watchedYear, watchedClass);
                    setSections(res || []);
                } catch (err: any) {
                    toast.error(err.message || 'Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            }
            fetchSections();
        } else {
            setSections([]);
            setSelectedSections([]);
        }
    }, [watchedYear, watchedClass]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = { ...data, sections: selectedSections };
        try {
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Left Side - Dropdowns */}
            <div className='space-y-4'>
                <Controller
                    control={control}
                    name='ex_AcademicYear'
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

                <Controller
                    control={control}
                    name='ex_CategoryName'
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

                <Controller
                    control={control}
                    name='ex_ClassName'
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

            {/* Right Side - Sections */}
            <div className='space-y-2'>
                <h3 className='font-semibold'>Sections</h3>
                {loadingSections ? (
                    <p>Loading sections...</p>
                ) : sections.length ? (
                    <div className='grid grid-cols-1 gap-2'>
                        {sections.map((section) => (
                            <Checkbox
                                key={section.id}
                                checked={selectedSections.includes(section.id)}
                                onCheckedChange={(val) => {
                                    if (val) setSelectedSections((prev) => [...prev, section.id]);
                                    else setSelectedSections((prev) => prev.filter((id) => id !== section.id));
                                }}>
                                {section.name}
                            </Checkbox>
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
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Saving...'>
                    Save
                </Button>
            </div>
        </form>
    );
}
