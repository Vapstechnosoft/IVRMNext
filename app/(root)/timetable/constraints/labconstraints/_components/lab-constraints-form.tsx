'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type LabConstraintsSchema, labConstraintsSchema } from '@/schemas/timetable/constraints/labconstraints';
import {
    getAcademicYearDropDown,
    getCategoryDropDown,
    getClassDetails,
    getLabConstraintsEditDetails,
    getLabDetails,
    getSectionDetails,
    saveLabConstraintsDetail
} from '@/server/timetable/constraints/labconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    // Identify the actual data object (handle ApiResponse wrapper)
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];

    // If a preferred key is provided, try that first
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];

    // Try known backend list keys
    const keys = [
        'academiclist',
        'catelist',
        'classlist',
        'sectionlist',
        'lablist',
        'yearlist',
        'categorylist',
        'sectionlist',
        'classList',
        'sectionList',
        'categoryList'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }

    return [];
};

interface LabConstraintsFormProps {
    initialData: any;
    editData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function LabConstraintsForm({ initialData, editData, onSuccess, onCancel }: LabConstraintsFormProps) {
    // Dropdown options
    const [academicList, setAcademicList] = useState<any[]>(extractList(initialData, 'yearlist'));
    const [categoryList, setCategoryList] = useState<any[]>(extractList(initialData, 'categorylist'));
    const [labList, setLabList] = useState<any[]>(extractList(initialData, 'lablist'));

    // Local state for dropdowns
    const [classList, setClassList] = useState<any[]>(extractList(initialData, 'classlist'));
    const [sectionList, setSectionList] = useState<any[]>(extractList(initialData, 'sectionlist'));

    const form = useForm<LabConstraintsSchema>({
        resolver: zodResolver(labConstraintsSchema),
        mode: 'onChange',
        defaultValues: {
            TTLAB_Id: 0,
            ASMAY_Id: 0,
            TTMC_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            TTLAB_LABLibId: 0
        }
    });

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    // Watchers
    const watchedAcademicYear = watch('ASMAY_Id');
    const watchedCategory = watch('TTMC_Id');
    const watchedClass = watch('ASMCL_Id');
    const watchedSection = watch('ASMS_Id');

    // Initial Loading of lists if missing
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (academicList.length === 0) {
                    const res = await getAcademicYearDropDown();
                    setAcademicList(extractList(res, 'yearlist'));
                }
                if (categoryList.length === 0) {
                    const res = await getCategoryDropDown();
                    setCategoryList(extractList(res, 'categorylist'));
                }
                if (classList.length === 0) {
                    const res = await getClassDetails();
                    setClassList(extractList(res, 'classlist'));
                }
                if (sectionList.length === 0) {
                    const res = await getSectionDetails();
                    setSectionList(extractList(res, 'sectionlist'));
                }
            } catch (error) {
                console.error('Failed to load initial dropdowns', error);
            }
        };
        loadInitialData();
    }, []);

    // Fetch Edit Details
    useEffect(() => {
        const fetchEditDetails = async () => {
            if (Array.isArray(editData) && editData.length > 0) {
                try {
                    const apiResponse = await getLabConstraintsEditDetails(editData[0].ttlaB_Id);
                    const editDetails = (apiResponse as any).editdetails?.[0];

                    if (editDetails) {
                        reset({
                            TTLAB_Id: editDetails.ttlaB_Id,
                            ASMAY_Id: editDetails.asmaY_Id,
                            TTMC_Id: editDetails.ttmC_Id,
                            ASMCL_Id: editDetails.asmcL_Id,
                            ASMS_Id: editDetails.asmS_Id,
                            TTLAB_LABLibId: editDetails.ttlaB_LABLibId
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch edit details', err);
                    toast.error('Failed to load record details');
                }
            }
        };

        if (editData) {
            fetchEditDetails();
        }
    }, [editData, reset]);

    // Lab Details (Lab Name) cascading on Class/Section
    useEffect(() => {
        const fetchLabs = async () => {
            if (watchedAcademicYear && watchedCategory && watchedClass && watchedSection) {
                try {
                    const res = await getLabDetails({
                        ASMAY_Id: watchedAcademicYear,
                        TTMC_Id: watchedCategory,
                        ASMCL_Id: watchedClass,
                        ASMS_Id: watchedSection
                    });
                    setLabList(extractList(res, 'lablist'));
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchLabs();
    }, [watchedAcademicYear, watchedCategory, watchedClass, watchedSection]);

    const onSubmit: SubmitHandler<LabConstraintsSchema> = async (data) => {
        try {
            const res = await saveLabConstraintsDetail(data);
            if (res.returnval === true) {
                toast.success('Saved Successfully');
                onSuccess?.();
            } else if (res.returnduplicatestatus === 'Duplicate') {
                toast.warning('Record Already Exists');
            } else {
                toast.error('Failed to Save');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ASMAY_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicList.map((item: any) => {
                                        const id = item.asmaY_Id || item.ASMAY_Id || item.id;
                                        const year = item.asmaY_Year || item.asmay_Year || item.year;
                                        return (
                                            <SelectItem key={id} value={id?.toString()}>
                                                {year}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Category <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='TTMC_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryList.map((item: any) => {
                                        const id = item.ttmC_Id || item.TTMC_Id || item.id;
                                        const name = item.ttmC_CategoryName || item.categoryName || item.ttmC_CategoryName;
                                        return (
                                            <SelectItem key={id} value={id?.toString()}>
                                                {name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ASMCL_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classList.map((item: any) => {
                                        const id = item.asmcL_Id || item.ASMCL_Id || item.asmcL_Id;
                                        const name = item.asmcL_ClassName || item.className || item.asmcL_ClassName;
                                        return (
                                            <SelectItem key={id} value={id?.toString()}>
                                                {name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Section <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ASMS_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionList.map((item: any) => {
                                        const id = item.asmS_Id || item.ASMS_Id || item.asms_Id;
                                        const name = item.asmC_SectionName || item.asmS_SectionName || item.sectionName;
                                        return (
                                            <SelectItem key={id} value={id?.toString()}>
                                                {name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Lab Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='TTLAB_LABLibId'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {labList.map((item: any) => {
                                        const id = item.labLibId || item.ttlaB_LABLibId || item.id;
                                        const name = item.labName || item.labLibName || item.name;
                                        return (
                                            <SelectItem key={id} value={id?.toString()}>
                                                {name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.TTLAB_LABLibId && <FormError>{errors.TTLAB_LABLibId.message}</FormError>}
                </div>
            </div>

            <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' /> {editData ? 'Update' : 'Save'}
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
