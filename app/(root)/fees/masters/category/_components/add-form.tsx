'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAcademicYearDropdown, useMasterClassCategory } from '@/hooks/fees/useMasters';
import { masterClassSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterClassYearlyCategory } from '@/server/fees/masters/class_yearly_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormFields = {
    academicYear: string;
    classCategory: string;
    classes: string[];
};

interface DropdownOption {
    value: string;
    label: string;
    classes?: { id: string | number; name: string }[];
}

interface ClassOption {
    value: string;
    label: string;
}

interface AddMasterClassFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterClassForm({ onSuccess, className = '' }: AddMasterClassFormProps) {
    const { data: categoryData, isLoading: loadingCategories, error: categoryError, refetch: refetchAll } = useMasterClassCategory();
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onSubmit',
        defaultValues: {
            academicYear: '',
            classCategory: '',
            classes: []
        }
    });

    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [academicYearOptions, setAcademicYearOptions] = useState<DropdownOption[]>([]);
    const [classCategoryOptions, setClassCategoryOptions] = useState<DropdownOption[]>([]);
    const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);

    const academicYear = watch('academicYear');
    const classCategory = watch('classCategory');
    const classesValue = watch('classes');

    useEffect(() => {
        setIsLoadingDropdowns(loadingAcademic || loadingCategories);
    }, [loadingAcademic, loadingCategories]);

    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYearOptions([]);
            return;
        }
        if (academicData?.success && Array.isArray(academicData.academicdrp)) {
            setAcademicYearOptions(academicData.academicdrp);
        } else {
            setAcademicYearOptions([]);
            if (academicData && !academicData.success) {
                toast.error(academicData.message || 'Failed to load academic years');
            }
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (!academicYear) {
            setClassCategoryOptions([]);
            setValue('classCategory', '', { shouldValidate: true });
            setClassOptions([]);
            setSelectedClasses([]);
            setValue('classes', [], { shouldValidate: true });
            return;
        }

        if (categoryError) {
            toast.error(categoryError.message || 'Error fetching class categories');
            setClassCategoryOptions([]);
            setClassOptions([]);
            setSelectedClasses([]);
            setValue('classes', [], { shouldValidate: true });
            return;
        }

        if (categoryData?.success && Array.isArray(categoryData.classcategorydrp)) {
            setClassCategoryOptions(categoryData.classcategorydrp);

            if (!classCategory) {
                setClassOptions([]);
                setSelectedClasses([]);
                setValue('classes', [], { shouldValidate: true });
                return;
            }

            // Populate classes when both academicYear and classCategory are selected
            setIsLoadingClasses(true);
            try {
                const selectedCategory = categoryData.classcategorydrp.find((cat) => cat.value === classCategory);
                if (selectedCategory && Array.isArray(selectedCategory.classes)) {
                    const classes = selectedCategory.classes.map((cls: { id: { toString: () => any }; name: any }) => ({
                        value: cls.id.toString(),
                        label: cls.name
                    }));
                    setClassOptions(classes);
                } else {
                    setClassOptions([]);
                    toast.error('No classes found for this category');
                }
            } catch (error: any) {
                console.error('Error processing classes:', error);
                toast.error(error.message || 'Error processing classes');
                setClassOptions([]);
            } finally {
                setIsLoadingClasses(false);
            }
        } else {
            setClassCategoryOptions([]);
            setClassOptions([]);
            setSelectedClasses([]);
            setValue('classes', [], { shouldValidate: true });
            if (categoryData && !categoryData.success) {
                toast.error(categoryData.message || 'Failed to load class categories');
            }
        }
    }, [academicYear, classCategory, categoryData, categoryError, setValue]);

    const filteredClassOptions = classOptions.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleClassChange = (value: string) => {
        const currentClasses = classesValue || [];
        let updatedClasses: string[];
        if (currentClasses.includes(value)) {
            updatedClasses = currentClasses.filter((c) => c !== value);
        } else {
            updatedClasses = [...currentClasses, value];
        }
        setSelectedClasses(updatedClasses);
        setValue('classes', updatedClasses, { shouldValidate: true });
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (isSubmitting) return;

        try {
            const { academicYear, classCategory, classes } = data;
            if (!academicYear || !classCategory || classes.length === 0) {
                toast.error('Please select academic year, class category, and at least one class.');
                return;
            }

            const payload = {
                asmcC_Id: 0,
                asmaY_Id: academicYear,
                amC_Id: classCategory,
                ASMCL_Classes: JSON.stringify(classes),
                ASMCL_ActiveFlag: true
            };

            const response = await addOrUpdateMasterClassYearlyCategory(payload);

            if (response.success) {
                toast.success(response.message || 'Master class saved successfully');
                reset();
                setSelectedClasses([]);
                setSearchTerm('');
                setClassOptions([]);
                setClassCategoryOptions([]);
                setValue('classCategory', '', { shouldValidate: true });
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save master class');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Error saving master class');
        }
    };

    const handleReset = () => {
        reset();
        setSelectedClasses([]);
        setSearchTerm('');
        setClassOptions([]);
        setClassCategoryOptions([]);
    };

    return (
        <div className={`${className}`}>
            <form
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    handleSubmit(onSubmit)(e);
                }}
                className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div>
                            <Label htmlFor='academicYear'>
                                Academic Year <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => setValue('academicYear', value, { shouldValidate: true })}
                                value={academicYear}
                                disabled={isLoadingDropdowns}>
                                <SelectTrigger
                                    id='academicYear'
                                    className={`transition-colors ${errors.academicYear ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {hasSubmitted && errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                        </div>

                        {/* Class Category */}
                        <div>
                            <Label htmlFor='classCategory'>
                                Class Category <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => setValue('classCategory', value, { shouldValidate: true })}
                                value={classCategory}
                                disabled={!academicYear || isLoadingDropdowns}>
                                <SelectTrigger
                                    id='classCategory'
                                    className={`transition-colors ${errors.classCategory ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder='Select Class Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classCategoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {hasSubmitted && errors.classCategory && <FormError>{errors.classCategory.message}</FormError>}
                        </div>

                        {/* Classes */}
                        <div className='md:col-span-2'>
                            <Label htmlFor='classes'>
                                Classes <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <div className='min-h-[40px] rounded-md border bg-white px-3 py-2'>
                                    <input
                                        type='text'
                                        placeholder='Search Classes'
                                        className='mb-2 w-full rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={!academicYear || !classCategory || isLoadingClasses}
                                    />
                                    <div className='flex max-h-40 flex-col gap-2 overflow-y-auto'>
                                        {isLoadingClasses ? (
                                            <span className='text-gray-400 text-sm'>Loading classes...</span>
                                        ) : filteredClassOptions.length > 0 ? (
                                            filteredClassOptions.map((option) => (
                                                <label
                                                    key={option.value}
                                                    className='flex cursor-pointer items-center rounded p-1 hover:bg-gray-50'>
                                                    <input
                                                        type='checkbox'
                                                        value={option.value}
                                                        checked={selectedClasses.includes(option.value)}
                                                        onChange={() => handleClassChange(option.value)}
                                                        className='mr-2 h-4 w-4 accent-blue-600'
                                                        disabled={isLoadingClasses}
                                                    />
                                                    <span className='truncate'>{option.label}</span>
                                                </label>
                                            ))
                                        ) : !academicYear || !classCategory ? (
                                            <span className='text-gray-400 text-sm'>Select Academic Year and Class Category first</span>
                                        ) : (
                                            <span className='text-gray-400 text-sm'>No classes found</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {hasSubmitted && errors.classes && <FormError>{errors.classes.message}</FormError>}
                        </div>
                    </div>

                    {/* Root Error */}
                    {hasSubmitted && errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isLoadingDropdowns || isLoadingClasses}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={
                            isSubmitting ||
                            isLoadingDropdowns ||
                            isLoadingClasses ||
                            !academicYear ||
                            !classCategory ||
                            selectedClasses.length === 0
                        }
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Class
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
