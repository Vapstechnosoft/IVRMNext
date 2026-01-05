// app/exam/exam-module/student-marks-publish/_components/search-form.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { studentMarksPublishSchema } from '@/schemas/exam/exam-module/marks-entry';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/tbs-report-school';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// Import fee-related hooks
import { useFeeGroupDefaulterreport, useFeeTermDefaulterreport } from '@/hooks/fees/useReports';
import { getStudentWisePublishMarksData } from '@/server/exam/exam-module/marks-entry/student-wise-publish-marks';

type FormFields = z.infer<typeof studentMarksPublishSchema.search>;

interface Props {
    onSuccess?: (params: any, data: any[]) => void;
    onRefresh?: (params: any, data: any[]) => void;
    onPayloadChange?: (payload: any) => void;
}

export default function SearchForm({ onSuccess, onRefresh, onPayloadChange }: Props) {
    const [loading, setLoading] = useState(false);
    const [processBtnEnabled, setProcessBtnEnabled] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // State for dropdown data
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    // Loading states
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    // Keys to force re-render of selects
    const [classKey, setClassKey] = useState(0);
    const [sectionKey, setSectionKey] = useState(0);
    const [examKey, setExamKey] = useState(0);

    const methods = useForm<FormFields>({
        resolver: zodResolver(studentMarksPublishSchema.search),
        defaultValues: {
            radiotype: 'Exam',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            feeinstallmentcheckbox: false,
            SMSFLAG: false,
            EMAILFLAG: false,
            NOTIFYFLAG: false,
            feeGroupIds: [],
            FMT_Id: 0
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
        getValues
    } = methods;

    const radiotype = watch('radiotype');
    const academicYearId = watch('asmaY_Id');
    const classId = watch('asmcL_Id');
    const sectionId = watch('asmS_Id');
    const feeInstallmentCheckbox = watch('feeinstallmentcheckbox');

    const { data: academicYears, isLoading: academicYearLoading } = useAcademicYearDropdown();

    // Fee-related hooks
    const { data: feeGroupsData, isLoading: loadingFeeGroup } = useFeeGroupDefaulterreport();
    const { data: feeTermsData, isLoading: loadingFeeTerm } = useFeeTermDefaulterreport();

    // Get actual data from responses
    const feeGroups = feeGroupsData?.data || [];
    const feeTerms = feeTermsData?.data || [];

    // Reset all dependent dropdowns when academic year changes
    useEffect(() => {
        if (!academicYearId || academicYearId === 0) {
            // Clear all dependent data
            setClasses([]);
            setSections([]);
            setExams([]);
            setStudents([]);

            // Reset form values
            setValue('asmcL_Id', 0);
            setValue('asmS_Id', 0);
            setValue('emE_Id', 0);

            // Force re-render of selects
            setClassKey(prev => prev + 1);
            setSectionKey(prev => prev + 1);
            setExamKey(prev => prev + 1);

            setProcessBtnEnabled(false);
            return;
        }

        const fetchClasses = async () => {
            setLoadingClasses(true);
            try {
                // Clear previous data first
                setClasses([]);
                setValue('asmcL_Id', 0);
                setClassKey(prev => prev + 1);

                const res = await getClassDropDownByAcademicYearlist(academicYearId);
                const classData = res.data || [];
                setClasses(classData);

                // Clear dependent data
                setSections([]);
                setExams([]);
                setStudents([]);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setSectionKey(prev => prev + 1);
                setExamKey(prev => prev + 1);

                if (classData.length === 0) {
                    toast.info('No classes found for selected academic year');
                }
            } catch (error) {
                console.error('Error loading classes:', error);
                toast.error('Failed to load classes');
                setClasses([]);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, [academicYearId, setValue]);

    // Handle sections when class changes
    useEffect(() => {
        if (!academicYearId || !classId || classId === 0) {
            // Clear dependent data
            setSections([]);
            setExams([]);
            setStudents([]);

            // Reset form values
            setValue('asmS_Id', 0);
            setValue('emE_Id', 0);

            // Force re-render
            setSectionKey(prev => prev + 1);
            setExamKey(prev => prev + 1);

            setProcessBtnEnabled(false);
            return;
        }

        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                // Clear previous data first
                setSections([]);
                setValue('asmS_Id', 0);
                setSectionKey(prev => prev + 1);

                const res = await getSectionsDropDownByAcademicYearandClasslist(academicYearId, classId);
                const sectionData = res.data || [];
                setSections(sectionData);

                // Clear dependent data
                setExams([]);
                setStudents([]);
                setValue('emE_Id', 0);
                setExamKey(prev => prev + 1);

                if (sectionData.length === 0) {
                    toast.info('No sections found for selected class');
                }
            } catch (error) {
                console.error('Error loading sections:', error);
                toast.error('Failed to load sections');
                setSections([]);
            } finally {
                setLoadingSections(false);
            }
        };

        fetchSections();
    }, [academicYearId, classId, setValue]);

    // Handle exams and students when section changes
    useEffect(() => {
        if (!academicYearId || !classId || !sectionId || sectionId === 0) {
            setExams([]);
            setStudents([]);
            setValue('emE_Id', 0);
            setExamKey(prev => prev + 1);
            setProcessBtnEnabled(false);
            return;
        }

        const fetchData = async () => {
            setLoadingExams(true);
            try {
                // Clear previous data first
                setExams([]);
                setValue('emE_Id', 0);
                setExamKey(prev => prev + 1);

                // Load exams (only for Exam Wise mode)
                if (radiotype === 'Exam') {
                    const examRes = await getExamsDropDownByAcademicYearandClassandSectionlist(academicYearId, classId, sectionId);
                    const examData = examRes.data || [];
                    setExams(examData);

                    if (examData.length === 0) {
                        toast.info('No exams found for selected section');
                    }
                }
                // Enable process button if we have data
                setTimeout(() => {
                    setProcessBtnEnabled(true);
                }, 300);
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Failed to load data');
                setExams([]);
                setStudents([]);
            } finally {
                setLoadingExams(false);
            }
        };

        fetchData();
    }, [academicYearId, classId, sectionId, radiotype, setValue]);

    // Handle radio type change
    useEffect(() => {
        if (radiotype !== 'Exam') {
            setExams([]);
            setValue('emE_Id', 0);
            setExamKey(prev => prev + 1);
        }
    }, [radiotype, setValue]);

    const handleSearch = async (formData: FormFields) => {
        setLoading(true);

        try {
            const payload = {
                mI_Id: 30, // or from context/store if dynamic
                asmaY_Id: formData.asmaY_Id,
                asmcL_Id: formData.asmcL_Id,
                asmS_Id: formData.asmS_Id,
                emE_Id: formData.emE_Id,
                radiotype: formData.radiotype,
                feeinstallmentcheckbox: formData.feeinstallmentcheckbox,
                fmT_Id: formData.feeinstallmentcheckbox ? formData.FMT_Id : 0,
                ismS_Id: 0,
                tempGroupList: formData.feeGroupIds?.length
                    ? formData.feeGroupIds
                    : [0]
            };
            console.log('Payload:', payload);
            const { data: response } = await getStudentWisePublishMarksData(payload);
            const apiStudents = Array.isArray(response)
                ? response
                : [];
            if (isInitialLoad) {
                onSuccess?.(formData, apiStudents);
                setIsInitialLoad(false);
            } else {
                onRefresh?.(formData, apiStudents);
            }

            toast.success(`${apiStudents.length} students found`);
            onPayloadChange?.(payload);
        } catch (error: any) {
            console.error('Search error:', error);
            toast.error(error.message || 'Failed to search students');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        reset({
            radiotype: 'Exam',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            feeinstallmentcheckbox: false,
            SMSFLAG: false,
            EMAILFLAG: false,
            NOTIFYFLAG: false,
            feeGroupIds: [],
            FMT_Id: 0
        });

        // Clear state
        setClasses([]);
        setSections([]);
        setExams([]);
        setStudents([]);

        // Reset keys to force re-render
        setClassKey(prev => prev + 1);
        setSectionKey(prev => prev + 1);
        setExamKey(prev => prev + 1);

        setProcessBtnEnabled(false);
    };

    return (
        <form onSubmit={handleSubmit(handleSearch)} className='space-y-6'>
            {/* Radio Buttons */}
            <div className='flex justify-center'>
                <div className='inline-flex rounded-lg border p-1'>
                    <Controller
                        control={control}
                        name='radiotype'
                        render={({ field }) => (
                            <>
                                <button
                                    type='button'
                                    className={`rounded-md px-6 py-2 font-medium text-sm transition-colors ${field.value === 'Exam'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => field.onChange('Exam')}>
                                    Exam Wise
                                </button>
                                <button
                                    type='button'
                                    className={`rounded-md px-6 py-2 font-medium text-sm transition-colors ${field.value === 'Promotion'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => {
                                        field.onChange('Promotion');
                                        setValue('emE_Id', 0);
                                        setExamKey(prev => prev + 1);
                                    }}>
                                    Promotion
                                </button>
                            </>
                        )}
                    />
                </div>
            </div>

            {/* Form Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    {/* Academic Year */}
                    <div>
                        <Label>Academic Year *</Label>
                        <Controller
                            control={control}
                            name='asmaY_Id'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={academicYearLoading}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={academicYearLoading ? 'Loading Academic Year...' : 'Select Academic Year'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYearLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading Academic Year...
                                                </SelectItem>
                                            ) : academicYears?.data?.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No academic years available
                                                </SelectItem>
                                            ) : (
                                                academicYears?.data?.map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Exclude Fee Defaulters Checkbox */}
                    <div className='space-y-2'>
                        <Controller
                            control={control}
                            name='feeinstallmentcheckbox'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='feeinstallmentcheckbox' checked={field.value} onCheckedChange={field.onChange} />
                                    <Label htmlFor='feeinstallmentcheckbox' className='font-medium'>
                                        Exclude Fee Defaulters: *
                                    </Label>
                                </div>
                            )}
                        />
                    </div>

                    {/* Fee Term (only when Exclude Fee Defaulters is checked) */}
                    <div>
                        <Label>Fee Term *</Label>
                        <Controller
                            control={control}
                            name='FMT_Id'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={!feeInstallmentCheckbox || loadingFeeTerm}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingFeeTerm
                                                        ? 'Loading fee terms...'
                                                        : !feeInstallmentCheckbox
                                                            ? 'Enable Exclude Fee Defaulters first'
                                                            : feeTerms.length === 0
                                                                ? 'No fee terms available'
                                                                : 'Select Fee Term'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingFeeTerm ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading fee terms...
                                                </SelectItem>
                                            ) : feeTerms.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No fee terms available
                                                </SelectItem>
                                            ) : (
                                                feeTerms.map((term: any) => (
                                                    <SelectItem key={term.fmT_Id} value={String(term.fmT_Id)}>
                                                        {term.fmT_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Fee Group Multi-select */}
                    <div>
                        <div className='mb-2'>
                            <Label className='font-medium'>Fee Group: *</Label>
                        </div>
                        <Controller
                            control={control}
                            name='feeGroupIds'
                            render={({ field, fieldState }) => (
                                <>
                                    <CustomMultiSelectBox
                                        options={feeGroups.map((group: any) => ({
                                            label: group.fmG_GroupName,
                                            value: group.fmG_Id.toString()
                                        }))}
                                        onChange={(vals) => field.onChange(vals.map((v: string) => Number(v)))}
                                        value={field.value ? field.value.map((v) => v.toString()) : []}
                                        placeholder={
                                            loadingFeeGroup
                                                ? 'Loading fee groups...'
                                                : !feeInstallmentCheckbox
                                                    ? 'Enable Exclude Fee Defaulters first'
                                                    : 'Search here...'
                                        }
                                        height='150px'
                                        isSearchRequired={true}
                                        disabled={!feeInstallmentCheckbox || loadingFeeGroup}
                                    />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    {/* Class */}
                    <div>
                        <Label>Class *</Label>
                        <Controller
                            control={control}
                            name='asmcL_Id'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        key={`class-${classKey}`}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={!academicYearId || loadingClasses}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingClasses
                                                        ? 'Loading classes...'
                                                        : !academicYearId
                                                            ? 'Select Academic Year first'
                                                            : classes.length === 0
                                                                ? 'No classes available'
                                                                : 'Select Class'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingClasses ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading classes...
                                                </SelectItem>
                                            ) : classes.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No classes available
                                                </SelectItem>
                                            ) : (
                                                classes.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Section */}
                    <div>
                        <Label>Section *</Label>
                        <Controller
                            control={control}
                            name='asmS_Id'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        key={`section-${sectionKey}`}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={!classId || loadingSections}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingSections
                                                        ? 'Loading sections...'
                                                        : !classId
                                                            ? 'Select Class first'
                                                            : sections.length === 0
                                                                ? 'No sections available'
                                                                : 'Select Section'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingSections ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading sections...
                                                </SelectItem>
                                            ) : sections.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No sections available
                                                </SelectItem>
                                            ) : (
                                                sections.map((sec: any) => (
                                                    <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Exam Name (only for Exam Wise) */}
                    <div>
                        <Label>Exam Name {radiotype === 'Exam' && '*'}</Label>
                        <Controller
                            control={control}
                            name='emE_Id'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        key={`exam-${examKey}`}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={radiotype !== 'Exam' || !sectionId || loadingExams}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingExams
                                                        ? 'Loading exams...'
                                                        : radiotype !== 'Exam'
                                                            ? 'Select Exam Wise mode'
                                                            : !sectionId
                                                                ? 'Select Section first'
                                                                : exams.length === 0
                                                                    ? 'No exams available'
                                                                    : 'Select Exam Name'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingExams ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading exams...
                                                </SelectItem>
                                            ) : exams.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No exams available
                                                </SelectItem>
                                            ) : (
                                                exams.map((exam: any) => (
                                                    <SelectItem key={exam.emE_Id} value={String(exam.emE_Id)}>
                                                        {exam.emE_ExamName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className='flex justify-center gap-4 pt-4'>
                <Button
                    type='submit'
                    disabled={loading || !isValid || !academicYearId || !classId || !sectionId || (radiotype === 'Exam' && !watch('emE_Id'))}
                    className='min-w-[120px]'
                >
                    {loading ? (
                        <span className='flex items-center gap-2'>
                            <Search className='h-4 w-4' />
                            Searching...
                        </span>
                    ) : (
                        <span className='flex items-center gap-2'>
                            <Search className='h-4 w-4' />
                            Search
                        </span>
                    )}
                </Button>

                <Button type='button' variant='outline' onClick={handleReset} disabled={loading}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
            </div>
        </form>
    );
}