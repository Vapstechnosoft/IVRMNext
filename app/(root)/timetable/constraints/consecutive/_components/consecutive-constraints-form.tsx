'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { type ConsecutiveConstraintsSchema, consecutiveConstraintsSchema } from '@/schemas/timetable/constraints/consecutive';
import {
    getCategoryDropDownMasterDayClasswise,
    getConsecutiveConstraintsEditDetails,
    getSectionDetails,
    getStaffDropDownMasterDayClasswise,
    getSubjectDropDownMasterDayClasswise,
    getTransactionClassDropdown,
    saveConsecutiveConstraintsDetail
} from '@/server/timetable/constraints/consecutive';
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
        'stafflist',
        'subjectlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory',
        'categorylist'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }

    return [];
};

interface ConsecutiveConstraintsFormProps {
    initialData: any; // Contains lists: academiclist, catelist
    editData?: any; // For editing mode
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ConsecutiveConstraintsForm({ initialData, editData, onSuccess, onCancel }: ConsecutiveConstraintsFormProps) {
    const [categoryList, setCategoryList] = useState<any[]>(extractList(initialData, 'catelist'));
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    // For max value of period validation (optional, from generic API result)?
    // The legacy code referenced `maxvalue`. If it's not in initialData, we might assume a default or fetch it.
    // Assuming standard period count max around 10-15 if not provided.

    const form = useForm<ConsecutiveConstraintsSchema>({
        resolver: zodResolver(consecutiveConstraintsSchema),
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
            TTC_NoOfPeriods: 1,
            TTC_BefAftApplFlag: false,
            TTC_BefAftFalg: '',
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

    const watchedConDays = watch('TTC_NoOfConDays');
    const watchedConPeriods = watch('TTC_NoOfConPeriods');
    const watchedBefAftFlag = watch('TTC_BefAftApplFlag');

    // Hooks for cascading data
    const { data: academicData, isLoading: academicLoading } = usebifurcationAcademicYear();
    const academicList = extractList(academicData, 'academiclist');

    useEffect(() => {
        const loadInitialLists = async () => {
            try {
                if (categoryList.length === 0) {
                    const res = await getCategoryDropDownMasterDayClasswise();
                    setCategoryList(extractList(res, 'catelist'));
                }
                // Pre-load others if needed or for fallback
                if (classList.length === 0) {
                    const res = await getTransactionClassDropdown();
                    if (res) setClassList(extractList(res, 'classlist'));
                }
                if (sectionList.length === 0) {
                    const res = await getSectionDetails();
                    if (res) setSectionList(extractList(res, 'sectionlist'));
                }
                if (staffList.length === 0) {
                    const res = await getStaffDropDownMasterDayClasswise();
                    if (res) setStaffList(extractList(res, 'stafflist'));
                }
                if (subjectList.length === 0) {
                    const res = await getSubjectDropDownMasterDayClasswise();
                    if (res) setSubjectList(extractList(res, 'subjectlist'));
                }
            } catch (error) {
                console.error('Failed to load initial dropdowns:', error);
            }
        };
        loadInitialLists();
    }, [initialData]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('ASMAY_Id', yearId);
        setValue('TTMC_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('TTMC_Id', categoryId);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleClassChange = async (classId: number) => {
        setValue('ASMCL_Id', classId);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('ASMS_Id', sectionId);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('HRME_Id', staffId);
        setValue('ISMS_Id', 0);
    };

    // Calculate Total Periods
    useEffect(() => {
        const days = Number(watchedConDays) || 0;
        const periods = Number(watchedConPeriods) || 0;
        setValue('TTC_NoOfPeriods', days * periods);
    }, [watchedConDays, watchedConPeriods, setValue]);

    // Edit Mode Data Fetching - Only for setting form values
    useEffect(() => {
        const fetchEditDetails = async () => {
            const editId = editData?.ttC_Id || (Array.isArray(editData) && editData[0]?.ttC_Id);
            if (editId) {
                try {
                    const apiResponse = await getConsecutiveConstraintsEditDetails(editId);
                    const editRecord = extractList(apiResponse, 'consecutivelstedit')?.[0];

                    if (editRecord) {
                        // 1. Set simple fields
                        reset({
                            TTC_Id: editRecord.ttC_Id,
                            ASMAY_Id: editRecord.asmaY_Id,
                            TTMC_Id: editRecord.ttmC_Id,
                            ASMCL_Id: editRecord.asmcL_Id,
                            ASMS_Id: editRecord.asmS_Id,
                            HRME_Id: editRecord.hrmE_Id,
                            ISMS_Id: editRecord.ismS_Id,
                            TTC_NoOfConDays: editRecord.ttC_NoOfConDays,
                            TTC_NoOfConPeriods: editRecord.ttC_NoOfConPeriods,
                            TTC_NoOfPeriods: editRecord.ttC_NoOfConPeriods * editRecord.ttC_NoOfConDays, // Recalculate if not provided
                            TTC_BefAftApplFlag: editRecord.ttC_BefAftApplFlag === 1,
                            TTC_BefAftFalg: editRecord.ttC_BefAftFalg ? String(editRecord.ttC_BefAftFalg) : '', // Select expects string often
                            TTC_BefAftPeriod: editRecord.ttC_BefAftPeriod
                        });

                        // Dropdowns are already pre-loaded or loaded from initialData
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

    const onSubmit: SubmitHandler<ConsecutiveConstraintsSchema> = async (data) => {
        try {
            const payload = {
                ...data,
                TTC_BefAftApplFlag: data.TTC_BefAftApplFlag ? 1 : 0,
                TTC_AllotPeriods: data.TTC_NoOfPeriods, // Legacy backend compatibility
                TTC_RemPeriods: data.TTC_NoOfPeriods,
                TTC_AllotedFlag: 'N'
            };

            const res = await saveConsecutiveConstraintsDetail(payload);
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
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleAcademicYearChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            academicList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
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
                                <Select onValueChange={(val) => handleClassChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
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
                                <Select onValueChange={(val) => handleStaffChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
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

                {/* Right Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Category <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='TTMC_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleCategoryChange(Number(val))} value={field.value?.toString()}>
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
                                <Select onValueChange={(val) => handleSectionChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
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
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectList.map((item: any) => (
                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                {item.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
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

            {/* Calculation Row */}
            <div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>Calculated Total Periods</Label>
                    <InputText {...register('TTC_NoOfPeriods')} disabled className='bg-gray-100' />
                </div>
            </div>

            {/* Before After Section */}
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
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
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
                            {/* Assuming standard manual input or dropdown. Legacy had input type number with maxvalue */}
                            <InputText type='number' {...register('TTC_BefAftPeriod')} error={errors.TTC_BefAftPeriod?.message} />
                        </div>
                    </div>
                )}
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
