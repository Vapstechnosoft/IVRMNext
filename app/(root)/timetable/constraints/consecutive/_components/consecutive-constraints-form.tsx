'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategoryDropDownMasterDayClasswise,
    useConsecutive
} from '@/hooks/timetable/constraints/consecutive';
import { consecutiveConstraintsSchema } from '@/schemas/timetable/constraints/consecutive';
import {
    getConsecutiveConstraintsEditDetails,
    getStaffDropDownMasterDayClasswise,
    getSubjectDropDownMasterDayClasswise,
    getTransactionClassDropdown,
    saveConsecutiveConstraintsDetail
} from '@/server/timetable/constraints/consecutive';
import { getSectionDropdownByClassCategory as getSectionByClassFixing } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof consecutiveConstraintsSchema.save>;

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = [
        'academiclist',
        'catelist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory',
        'categorylist',
        'classDrpDwn',
        'sectDrpDwn',
        'consecutivelstedit'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }
    return [];
};

interface ConsecutiveConstraintsFormProps {
    editData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ConsecutiveConstraintsForm({ editData, onSuccess, onCancel }: ConsecutiveConstraintsFormProps) {
    const { refetchAll } = useConsecutive();
    const [classList, setClassList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [isSectionLoading, setIsSectionLoading] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [isStaffLoading, setIsStaffLoading] = useState(false);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isSubjectLoading, setIsSubjectLoading] = useState(false);

    const form = useForm<FormFields>({
        resolver: zodResolver(consecutiveConstraintsSchema.save),
        mode: 'onChange',
        defaultValues: {
            TTC_Id: 0,
            ASMAY_Id: undefined,
            TTMC_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            HRME_Id: undefined,
            ISMS_Id: undefined,
            TTC_NoOfConDays: 1,
            TTC_NoOfConPeriods: 1,
            TTC_NoOfPeriods: 0,
            TTC_BefAftApplFlag: false,
            TTC_BefAftFalg: undefined,
            TTC_BefAftPeriod: 0
        }
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const handleReset = () => {
        reset();
    };

    const watchedConDays = watch('TTC_NoOfConDays');
    const watchedConPeriods = watch('TTC_NoOfConPeriods');
    const watchedBefAftFlag = watch('TTC_BefAftApplFlag');

    // Cascading Hooks
    const { data: academicData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const academicList = extractList(academicData, 'academiclist').filter((item: any) => item.asmaY_Id > 0 && item.asmaY_Year);

    const { data: categoryData } = useCategoryDropDownMasterDayClasswise();
    const categoryList = extractList(categoryData, 'catelist').filter((item: any) => item.ttmC_Id > 0 && item.ttmC_CategoryName);

    const watchedYear = watch('ASMAY_Id');
    const watchedCategory = watch('TTMC_Id');
    const watchedClass = watch('ASMCL_Id');
    const _watchedSection = watch('ASMS_Id');

    const fetchClasses = async (yearId: number, categoryId: number) => {
        if (!yearId || !categoryId) {
            setClassList([]);
            return;
        }
        setIsClassLoading(true);
        try {
            const data = await getTransactionClassDropdown(yearId, categoryId);
            const list = extractList(data, 'classbycategory').filter((item: any) => item.asmcL_Id > 0 && item.asmcL_ClassName);
            setClassList(list || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setIsClassLoading(false);
        }
    };

    const fetchSections = async (yearId: number, categoryId: number, classId: number) => {
        if (!yearId || !categoryId || !classId) {
            setSectionList([]);
            return;
        }
        setIsSectionLoading(true);
        try {
            const data = await getSectionByClassFixing(yearId, classId, categoryId);
            const list = extractList(data, 'get_period_section1').filter(
                (item: any) => (item.asmS_Id || item.asmC_Id) > 0 && (item.asmS_SectionName || item.asmC_SectionName)
            );
            setSectionList(list || []);
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('Failed to load sections');
        } finally {
            setIsSectionLoading(false);
        }
    };

    const fetchStaff = async (yearId: number, categoryId: number, classId: number, sectionId: number) => {
        if (!yearId || !categoryId || !classId || !sectionId) {
            setStaffList([]);
            return;
        }
        setIsStaffLoading(true);
        try {
            const data = await getStaffDropDownMasterDayClasswise({
                ASMAY_Id: yearId,
                TTMC_Id: categoryId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId
            });
            const list = extractList(data, 'stafflist').filter(
                (item: any) => item.hrmE_Id > 0 && (item.staffName || item.hrmE_EmployeeFirstName)
            );
            setStaffList(list || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff');
        } finally {
            setIsStaffLoading(false);
        }
    };

    const fetchSubjects = async (yearId: number, categoryId: number, classId: number, sectionId: number, staffId: number) => {
        if (!yearId || !categoryId || !classId || !sectionId || !staffId) {
            setSubjectList([]);
            return;
        }
        setIsSubjectLoading(true);
        try {
            const data = await getSubjectDropDownMasterDayClasswise({
                ASMAY_Id: yearId,
                TTMC_Id: categoryId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId,
                HRME_Id: staffId
            });
            const list = extractList(data, 'subjectlist').filter((item: any) => item.ismS_Id > 0 && item.ismS_SubjectName);
            setSubjectList(list || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setIsSubjectLoading(false);
        }
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('ASMAY_Id', yearId);
        setValue('TTMC_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setClassList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('TTMC_Id', categoryId);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setClassList([]);
        setSubjectList([]);
        if (form.getValues('ASMAY_Id') && categoryId) {
            await fetchClasses(form.getValues('ASMAY_Id'), categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setValue('ASMCL_Id', classId);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && classId) {
            await fetchSections(watchedYear, watchedCategory, classId);
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('ASMS_Id', sectionId);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && sectionId) {
            await fetchStaff(watchedYear, watchedCategory, watchedClass, sectionId);
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('HRME_Id', staffId);
        setValue('ISMS_Id', 0);
        const { ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id } = form.getValues();
        if (ASMAY_Id && TTMC_Id && ASMCL_Id && ASMS_Id && staffId) {
            await fetchSubjects(ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id, staffId);
        }
    };

    // Calculate Total Periods
    useEffect(() => {
        const days = Number(watchedConDays) || 0;
        const periods = Number(watchedConPeriods) || 0;
        setValue('TTC_NoOfPeriods', days * periods);
    }, [watchedConDays, watchedConPeriods, setValue]);

    // Edit Mode
    useEffect(() => {
        const fetchEditDetails = async () => {
            let d = editData;
            const editId = d?.ttC_Id || (Array.isArray(d) && d[0]?.ttC_Id);

            if (editId) {
                try {
                    const apiResponse = await getConsecutiveConstraintsEditDetails(editId);

                    let editRecord = null;
                    // Check if response itself has the ID (flat response)
                    if (apiResponse && (apiResponse.ttC_Id || apiResponse.TTC_Id)) {
                        editRecord = apiResponse;
                    } else {
                        // Fallback to searching for an array in the response
                        editRecord = extractList(apiResponse, 'consecutivelstedit')?.[0];
                    }

                    if (editRecord) {
                        d = editRecord;
                        // Normalize keys (handle casing differences)
                        const normalizedData = {
                            TTC_Id: d.ttC_Id || d.TTC_Id || 0,
                            ASMAY_Id: d.asmaY_Id || d.ASMAY_Id || 0,
                            TTMC_Id: d.ttmC_Id || d.TTMC_Id || 0,
                            ASMCL_Id: d.asmcL_Id || d.ASMCL_Id || 0,
                            ASMS_Id: d.asmS_Id || d.ASMS_Id || 0,
                            HRME_Id: d.hrmE_Id || d.HRME_Id || 0,
                            ISMS_Id: d.ismS_Id || d.ISMS_Id || 0,
                            TTC_NoOfConDays: d.ttC_NoOfConDays ?? d.TTC_NoOfConDays ?? 1,
                            TTC_NoOfConPeriods: d.ttC_NoOfConPeriods ?? d.TTC_NoOfConPeriods ?? 1,
                            TTC_BefAftApplFlag:
                                (d.ttC_BefAftApplFlag ?? d.TTC_BefAftApplFlag) === 1 ||
                                (d.ttC_BefAftApplFlag ?? d.TTC_BefAftApplFlag) === true,
                            TTC_BefAftFalg: d.ttC_BefAftFalg || d.TTC_BefAftFalg ? String(d.ttC_BefAftFalg || d.TTC_BefAftFalg) : '',
                            TTC_BefAftPeriod: d.ttC_BefAftPeriod ?? d.TTC_BefAftPeriod ?? 0
                        };

                        // Sequential Fetching to ensure dropdown lists are ready before reset
                        if (normalizedData.ASMAY_Id && normalizedData.TTMC_Id) {
                            await fetchClasses(normalizedData.ASMAY_Id, normalizedData.TTMC_Id);

                            if (normalizedData.ASMCL_Id) {
                                await fetchSections(normalizedData.ASMAY_Id, normalizedData.TTMC_Id, normalizedData.ASMCL_Id);

                                if (normalizedData.ASMS_Id) {
                                    await fetchStaff(
                                        normalizedData.ASMAY_Id,
                                        normalizedData.TTMC_Id,
                                        normalizedData.ASMCL_Id,
                                        normalizedData.ASMS_Id
                                    );

                                    if (normalizedData.HRME_Id) {
                                        await fetchSubjects(
                                            normalizedData.ASMAY_Id,
                                            normalizedData.TTMC_Id,
                                            normalizedData.ASMCL_Id,
                                            normalizedData.ASMS_Id,
                                            normalizedData.HRME_Id
                                        );
                                    }
                                }
                            }
                        }

                        // Wait for a small delay to ensure state updates for lists are processed by React
                        // before forcing the Select components to bind their values.
                        setTimeout(() => {
                            reset({
                                TTC_Id: normalizedData.TTC_Id,
                                ASMAY_Id: normalizedData.ASMAY_Id,
                                TTMC_Id: normalizedData.TTMC_Id,
                                ASMCL_Id: normalizedData.ASMCL_Id,
                                ASMS_Id: normalizedData.ASMS_Id,
                                HRME_Id: normalizedData.HRME_Id,
                                ISMS_Id: normalizedData.ISMS_Id,
                                TTC_NoOfConDays: normalizedData.TTC_NoOfConDays,
                                TTC_NoOfConPeriods: normalizedData.TTC_NoOfConPeriods,
                                TTC_NoOfPeriods: normalizedData.TTC_NoOfConPeriods * normalizedData.TTC_NoOfConDays,
                                TTC_BefAftApplFlag: normalizedData.TTC_BefAftApplFlag,
                                TTC_BefAftFalg: normalizedData.TTC_BefAftFalg,
                                TTC_BefAftPeriod: normalizedData.TTC_BefAftPeriod
                            });
                        }, 100);
                    }
                } catch (err) {
                    console.error('Failed to fetch edit details', err);
                    toast.error('Failed to load record details');
                }
            }
        };

        if (editData) {
            fetchEditDetails();
        } else {
            handleReset();
        }
    }, [editData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ttC_Id: data.TTC_Id || 0,
                ttmC_Id: data.TTMC_Id,
                asmaY_Id: data.ASMAY_Id,
                asmcL_Id: data.ASMCL_Id,
                hrmE_Id: data.HRME_Id,
                asmS_Id: data.ASMS_Id,
                ismS_Id: data.ISMS_Id,
                ttC_NoOfConDays: data.TTC_NoOfConDays,
                ttC_NoOfConPeriods: data.TTC_NoOfConPeriods,
                ttC_NoOfPeriods: data.TTC_NoOfPeriods || 0,
                ttC_RemPeriods: data.TTC_NoOfPeriods || 0,
                ttC_AllotPeriods: data.TTC_NoOfPeriods || 0,
                ttC_BefAftApplFlag: data.TTC_BefAftApplFlag ? 1 : 0,
                ttC_BefAftFalg: Number(data.TTC_BefAftFalg) || 0,
                ttC_BefAftPeriod: data.TTC_BefAftPeriod || 0,
                ttC_AllotedFlag: 'N'
            };

            const response = await saveConsecutiveConstraintsDetail(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        handleAcademicYearChange(Number(val));
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {academicList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => {
                                        const value = Number(val);
                                        field.onChange(value);
                                        handleClassChange(value);
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isClassLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            classList.map((item: any) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Staff <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='HRME_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => {
                                        const value = Number(val);
                                        field.onChange(value);
                                        handleStaffChange(value);
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isStaffLoading ? 'Loading...' : '--Select--'} />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                {item.staffName || item.hrmE_EmployeeFirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRME_Id && <FormError>{errors.HRME_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Days <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConDays')} error={errors.TTC_NoOfConDays?.message} />
                    </div>
                </div>

                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Category <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='TTMC_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => {
                                        const value = Number(val);
                                        field.onChange(value);
                                        handleCategoryChange(value);
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryList.map((item: any) => (
                                            <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                {item.ttmC_CategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMS_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => handleSectionChange(Number(val))}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isSectionLoading ? 'Loading...' : '--Select--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem
                                                key={item.asmS_Id || item.asmC_Id}
                                                value={(item.asmS_Id || item.asmC_Id).toString()}>
                                                {item.asmS_SectionName || item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Subject <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ISMS_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => setValue('ISMS_Id', Number(val))}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isSubjectLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            subjectList.map((item: any) => (
                                                <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                    {item.ismS_SubjectName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ISMS_Id && <FormError>{errors.ISMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Periods <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConPeriods')} error={errors.TTC_NoOfConPeriods?.message} />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>Calculated Total Periods</Label>
                    <InputText {...register('TTC_NoOfPeriods')} disabled className='bg-gray-100' />
                </div>
            </div>

            <div className='mt-4 space-y-4 rounded-md border bg-gray-50 p-4'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        control={control}
                        name='TTC_BefAftApplFlag'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='ba_flag' />}
                    />
                    <Label htmlFor='ba_flag' className='font-semibold'>
                        Before After Consecutive
                    </Label>
                </div>

                {watchedBefAftFlag && (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='TTC_BefAftFalg'
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={field.onChange}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Before</SelectItem>
                                            <SelectItem value='2'>After</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.TTC_BefAftFalg && <FormError>{errors.TTC_BefAftFalg.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Period <span className='text-red-500'>*</span>
                            </Label>
                            <InputText type='number' {...register('TTC_BefAftPeriod')} error={errors.TTC_BefAftPeriod?.message} />
                        </div>
                    </div>
                )}
            </div>

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
                        <Save className='mr-2 h-4 w-4' /> {editData ? 'Update' : 'Save Consecutive Constraint'}
                    </div>
                </Button>
            </div>
        </form>
    );
}
