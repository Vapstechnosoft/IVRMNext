// app/exam/student-transaction/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type StudentTransactionFormData, StudentTransactionSchema } from '@/schemas/exam/exam-module/exam-mapping';
import {
    getCoScholasticAreasBasedOnCoScholasticActivity,
    getLifeSkillAreasBasedOnLifeSkill,
    getStudentTransactionCCEDetails
} from '@/server/exam/exam-module/exam-mapping/student-transaction-cce';
import { getMasterLifeSkills } from '@/server/exam/exam-module/masters/life-skills';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import type { GetStudentDetailsParams, ICoScholasticActivityAreaMapping, IStudentTransaction, IStudentTransactionGrid } from '@/types/exam/exam-module/exam-mapping';
import type { ICoScholasticActivity, ILifeSkill, ILifeSkillArea } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { StudentTransactionColumns } from './_components/columns';
import { getCoScholasticActivities } from '@/server/exam/exam-module/masters/co-scholastic-activity';
const mockGetStudentList = async (
    academicYearId: number,
    classId: number,
    sectionId: number,
    examTermId: number,
    nameId: number,
    areaId: number,
    type: 'Skills' | 'Activities' | undefined
) => {
    return {
        data: [
            {
                slNo: 1,
                studentId: 101,
                studentName: 'Bhuvan N S',
                regNo: 'RRPSRN36',
                rollNo: 1,
                score: 5
            },
            {
                slNo: 2,
                studentId: 102,
                studentName: 'Chamamallikarjun B P',
                regNo: 'RRPSRN37',
                rollNo: 2,
                score: 5
            },
            {
                slNo: 3,
                studentId: 103,
                studentName: 'Eliyana',
                regNo: 'RRPSRN38',
                rollNo: 3,
                score: 5
            },
            {
                slNo: 4,
                studentId: 104,
                studentName: 'Tanu H B',
                regNo: 'RRPSRN39',
                rollNo: 4,
                score: 4
            }
        ],
        total: 4
    };
};

// Mock save API function (replace with actual implementation)
const mockSaveStudentScores = async (payload: any) => {
    console.log('Saving scores with payload:', payload);
    // Simulate API call
    return { success: true, message: 'Scores saved successfully' };
};

type FormFields = z.infer<typeof StudentTransactionSchema.search>;

export default function StudentTransactionPage() {
    return <StudentTransactionContent />;
}

function StudentTransactionContent() {
    // Form setup with schema validation
    const methods = useForm<FormFields>({
        resolver: zodResolver(StudentTransactionSchema.search),
        mode: 'onChange',
        defaultValues: {
            academicYearId: 0,
            classId: 0,
            sectionId: 0,
            examTermId: 0,
            skillActivityType: undefined,
            nameId: 0,
            areaId: 0
        }
    });

    const { control, handleSubmit, watch, setValue, formState, trigger, reset: formReset } = methods;
    const { errors, isSubmitting, isValid } = formState;

    // Watch form values
    const watchAcademicYear = watch('academicYearId');
    const watchClass = watch('classId');
    const watchSection = watch('sectionId');
    const watchExamTerm = watch('examTermId');
    const watchSkillActivity = watch('skillActivityType');
    const watchName = watch('nameId');
    const watchArea = watch('areaId');

    // Dropdown data states
    const { data: academicYearsData, isLoading: loadingAcademicYears } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [examTerms, setExamTerms] = useState<{ ect_Id: number; ect_TermName: string }[]>([]);
    const [skillNames, setSkillNames] = useState<ILifeSkill[]>([]);
    const [activityNames, setActivityNames] = useState<ICoScholasticActivity[]>([]);
    const [skillAreas, setSkillAreas] = useState<ILifeSkillArea[]>([]);
    const [activityAreas, setActivityAreas] = useState<ICoScholasticActivityAreaMapping[]>([]);
    const [students, setStudents] = useState<IStudentTransaction[]>([]);
    const [tableProps, setTableProps] = useState<ReturnType<typeof useDataTableProps> | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showTable, setShowTable] = useState(false);

    // Loading states
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExamTerms, setLoadingExamTerms] = useState(false);
    const [loadingNames, setLoadingNames] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    // Initialize academic years
    useEffect(() => {
        if (academicYearsData?.data) {
            const years = academicYearsData.data.map((y: any) => ({
                asmaY_Id: y.asmaY_Id,
                asmaY_Year: y.asmaY_Year
            }));
            setAcademicYears(years);
            if (years.length > 0 && !watchAcademicYear) {
                setValue('academicYearId', years[0].asmaY_Id);
                trigger('academicYearId');
            }
        }
    }, [academicYearsData, watchAcademicYear, setValue]);

    // Load classes when academic year changes
    useEffect(() => {
        if (!watchAcademicYear || watchAcademicYear === 0) {
            setClasses([]);
            setValue('classId', 0);
            setValue('sectionId', 0);
            setValue('examTermId', 0);
            setValue('skillActivityType', undefined);
            setValue('nameId', 0);
            setValue('areaId', 0);
            return;
        }

        const fetchClasses = async () => {
            setLoadingClasses(true);
            try {
                const { data } = await getClassDropDownByAcademicYearlist(watchAcademicYear);
                setClasses(Array.isArray(data) ? data : []);
                setSections([]);
                setExamTerms([]);
                setSkillNames([]);
                setActivityNames([]);
                setSkillAreas([]);
                setActivityAreas([]);
                setShowTable(false);
            } catch (err) {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, [watchAcademicYear, setValue]);

    // Load sections when class changes
    useEffect(() => {
        if (!watchAcademicYear || !watchClass || watchClass === 0) {
            setSections([]);
            setValue('sectionId', 0);
            setValue('examTermId', 0);
            setValue('skillActivityType', undefined);
            setValue('nameId', 0);
            setValue('areaId', 0);
            return;
        }

        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(watchAcademicYear, watchClass);
                setSections(Array.isArray(data) ? data : []);
                setExamTerms([]);
                setSkillNames([]);
                setActivityNames([]);
                setSkillAreas([]);
                setActivityAreas([]);
                setShowTable(false);
            } catch (err) {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        };

        fetchSections();
    }, [watchAcademicYear, watchClass, setValue]);

    // Load exam terms when section changes
    useEffect(() => {
        if (!watchAcademicYear || !watchClass || !watchSection || watchSection === 0) {
            setExamTerms([]);
            setLoadingExamTerms(false);
            return;
        }

        let mounted = true;

        const fetchExamTerms = async () => {
            setLoadingExamTerms(true);
            try {
                // Replace with your actual API call
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(watchAcademicYear, watchClass, watchSection);

                if (!mounted) return;

                const safeTerms = Array.isArray(data) ? data : [];
                setExamTerms(
                    safeTerms.map((term: any) => ({
                        ect_Id: term.emE_Id || term.ect_Id || 0,
                        ect_TermName: term.emE_ExamName || term.ect_TermName || ''
                    }))
                );

                if (safeTerms.length === 0) {
                    toast.info('No exam terms are mapped for your selections');
                }
            } catch (err) {
                console.error('load exam terms error', err);
                toast.error('Failed to load exam terms');

                if (!mounted) return;
                setExamTerms([]);
            } finally {
                if (mounted) setLoadingExamTerms(false);
            }
        };
        fetchExamTerms();

        return () => {
            mounted = false;
        };
    }, [watchAcademicYear, watchClass, watchSection, setValue]);

    // Load Skills/Activities names when type is selected
    useEffect(() => {
        if (!watchSkillActivity) {
            setSkillNames([]);
            setActivityNames([]);
            setValue('nameId', 0);
            setValue('areaId', 0);
            return;
        }

        const fetchNames = async () => {
            setLoadingNames(true);
            try {
                if (watchSkillActivity === 'Skills') {
                    const { data: names } = await getMasterLifeSkills(30);
                    const safeNames = Array.isArray(names) ? names : [];
                    setSkillNames(safeNames);
                    setActivityNames([]);
                    setSkillAreas([]);
                    setActivityAreas([]);
                    if (safeNames.length > 0) {
                        setValue('nameId', safeNames[0].ecsA_Id);
                        trigger('nameId');
                    }
                } else {
                    const { data: names } = await getCoScholasticActivities();
                    const safeNames = Array.isArray(names) ? names : [];
                    setActivityNames(safeNames);
                    setSkillNames([]);
                    setSkillAreas([]);
                    setActivityAreas([]);
                    if (safeNames.length > 0) {
                        setValue('nameId', safeNames[0].id);
                        trigger('nameId');
                    }
                }
            } catch (err) {
                toast.error(`Failed to load ${watchSkillActivity} names`);
            } finally {
                setLoadingNames(false);
            }
        };

        fetchNames();
    }, [watchSkillActivity, setValue]);

    // Load areas when name is selected
    useEffect(() => {
        if (!watchName || watchName === 0 || !watchSkillActivity) {
            setSkillAreas([]);
            setActivityAreas([]);
            setValue('areaId', 0);
            return;
        }

        const fetchAreas = async () => {
            setLoadingAreas(true);
            try {
                if (watchSkillActivity === 'Skills') {
                    console.log(watchAcademicYear, watchName);
                    const { data: areas } = await getLifeSkillAreasBasedOnLifeSkill(watchAcademicYear, watchName);
                    const safeAreas = Array.isArray(areas) ? areas : [];
                    setSkillAreas(safeAreas);
                    setActivityAreas([]);
                } else {
                    console.log(watchAcademicYear, watchName);
                    const { data: areas } = await getCoScholasticAreasBasedOnCoScholasticActivity(watchAcademicYear, watchName);
                    console.log(areas);
                    const safeAreas = Array.isArray(areas) ? areas : [];
                    setActivityAreas(safeAreas);
                    setSkillAreas([]);
                }
            } catch (err) {
                toast.error(`Failed to load ${watchSkillActivity} areas`);
            } finally {
                setLoadingAreas(false);
            }
        };

        fetchAreas();
    }, [watchName, watchSkillActivity, setValue]);

    const handleScoreChange = (studentId: number, score: number) => {
        setStudents((prev) => {
            const updated = prev.map((s) => (s.amsT_Id === studentId ? { ...s, score } : s));

            // Update table props - use the existing tp and just update data
            if (tableProps) {
                setTableProps({
                    ...tableProps,
                    data: updated
                });
            }

            return updated;
        });
    };

    // Handle search
    const handleSearch = async (data: StudentTransactionFormData) => {
        if (!isValid) {
            await trigger(); // show validation errors
            toast.error('Please fix validation errors');
            return;
        }

        // Required field validation
        if (!data.skillActivityType) {
            methods.setError('skillActivityType', {
                message: 'Select Skill/Activities type'
            });
            toast.error('Select Skill/Activities type');
            return;
        }

        setIsLoading(true);

        try {
            console.log(data.academicYearId, data.classId, data.sectionId, data.examTermId, data.skillActivityType, data.nameId, data.areaId);
            const params: GetStudentDetailsParams = {
                MI_Id: 30,
                ASMAY_Id: 231,
                ASMCL_Id: 414,
                ASMS_Id: 163,
                Skills: 'Skills',
                exam_termwise_flag: 'ExamWise',
                ECACT_Id: 2,
                ECACTA_Id: 14,
                ECS_Id: 1,
                ECSA_Id: 2
            };

            const { data: resp } = await getStudentTransactionCCEDetails(params);
            console.log(resp);
            const students = Array.isArray(resp?.students) ? resp.students : [];
            setStudents(students);
            setSelectedStudentIds([]);
            setShowTable(true);

            setTableProps(
                useDataTableProps({
                    data: students,
                    total: students.length ?? students.length,
                    pageIndex: 0,
                    pageSize: 10
                })
            );
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Failed to load student data');
            setStudents([]);
            setShowTable(false);
            setTableProps(null);
        } finally {
            setIsLoading(false);
        }
    };


    // Handle reset
    const handleReset = () => {
        // Reset form
        formReset({
            academicYearId: 0,
            classId: 0,
            sectionId: 0,
            examTermId: 0,
            skillActivityType: undefined,
            nameId: 0,
            areaId: 0
        });

        // Reset all states
        setStudents([]);
        setSelectedStudentIds([]);
        setTableProps(null);
        setShowTable(false);

        // Reset dropdown data
        setClasses([]);
        setSections([]);
        setExamTerms([]);
        setSkillNames([]);
        setActivityNames([]);
        setSkillAreas([]);
        setActivityAreas([]);

        toast.info('Form reset successfully');
    };

    // Handle save scores
    const handleSaveScores = async () => {
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student to save');
            return;
        }

        // Get selected students with their scores
        const selectedStudents = students.filter((student) => selectedStudentIds.includes(student.amsT_Id));

        // Validate that all selected students have scores
        const studentsWithoutScores = selectedStudents.filter((student) => student.score === undefined || student.score === null);

        if (studentsWithoutScores.length > 0) {
            toast.error('Please enter scores for all selected students');
            return;
        }

        setIsSaving(true);
        try {
            // Prepare payload
            const payload = {
                academicYearId: watchAcademicYear,
                classId: watchClass,
                sectionId: watchSection,
                examTermId: watchExamTerm,
                skillActivityType: watchSkillActivity,
                nameId: watchName,
                areaId: watchArea,
                selectedStudents: selectedStudents.map((student) => ({
                    studentId: student.amsT_Id,
                    studentName: student.studentName,
                    regNo: student.regNumber,
                    rollNo: student.regNumber,
                    score: student.score
                }))
            };

            console.log('Save payload:', payload);

            // Call API to save scores
            const result = await mockSaveStudentScores(payload);

            if (result.success) {
                toast.success(result.message || 'Scores saved successfully');
                // Clear selections after successful save
                setSelectedStudentIds([]);
            } else {
                toast.error(result.message || 'Failed to save scores');
            }
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Failed to save scores');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle row selection change
    const handleRowSelectionChange = (selectedRows: IStudentTransactionGrid[]) => {
        const selectedIds = selectedRows.map((row) => row.amsT_Id);
        setSelectedStudentIds(selectedIds);
    };

    const columns = StudentTransactionColumns(handleScoreChange);

    // Check if all required fields are filled
    const allFieldsFilled =
        watchAcademicYear && watchClass && watchSection && watchExamTerm && watchSkillActivity && watchName && watchArea;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleSearch)} className='min-h-screen bg-gray-50 p-6'>
                <div className='container mx-auto space-y-6'>
                    {/* Filters Section */}
                    <div className='rounded-lg border bg-white p-6 shadow-sm'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                            {/* Academic Year */}
                            <div>
                                <Label htmlFor='academic-year'>
                                    Year: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='academicYearId'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                onValueChange={(v) => {
                                                    field.onChange(v ? Number(v) : 0);
                                                    trigger('academicYearId');
                                                }}>
                                                <SelectTrigger id='academic-year'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYears.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div>
                                <Label htmlFor='class'>
                                    Class: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='classId'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                onValueChange={(v) => {
                                                    field.onChange(v ? Number(v) : 0);
                                                    trigger('classId');
                                                }}
                                                disabled={!watchAcademicYear || loadingClasses}>
                                                <SelectTrigger id='class'>
                                                    <SelectValue
                                                        placeholder={
                                                            !watchAcademicYear
                                                                ? 'Select Year first'
                                                                : loadingClasses
                                                                    ? 'Loading...'
                                                                    : 'Select Class'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div>
                                <Label htmlFor='section'>
                                    Section: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='sectionId'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                onValueChange={(v) => {
                                                    field.onChange(v ? Number(v) : 0);
                                                    trigger('sectionId');
                                                }}
                                                disabled={!watchClass || loadingSections}>
                                                <SelectTrigger id='section'>
                                                    <SelectValue
                                                        placeholder={
                                                            !watchClass
                                                                ? 'Select Class first'
                                                                : loadingSections
                                                                    ? 'Loading...'
                                                                    : 'Select Section'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((section) => (
                                                        <SelectItem key={section.asmS_Id} value={section.asmS_Id.toString()}>
                                                            {section.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Exam Term */}
                            <div>
                                <Label htmlFor='exam-term'>
                                    Exam Term: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='examTermId'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                // Use field.value as key - this forces re-render when value changes
                                                key={`exam-term-${field.value || 'empty'}`}
                                                value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                onValueChange={(v) => {
                                                    field.onChange(v ? Number(v) : 0);
                                                }}
                                                disabled={!watchSection || loadingExamTerms || examTerms.length === 0}>
                                                <SelectTrigger id='exam-term'>
                                                    <SelectValue
                                                        placeholder={
                                                            !watchSection
                                                                ? 'Select Section first'
                                                                : loadingExamTerms
                                                                    ? 'Loading...'
                                                                    : examTerms.length === 0
                                                                        ? 'No terms available'
                                                                        : 'Select Exam Term'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {examTerms.map((term) => (
                                                        <SelectItem key={term.ect_Id} value={term.ect_Id.toString()}>
                                                            {term.ect_TermName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Skill/Activities Section */}
                        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {/* Skill/Activities Type */}
                            <div>
                                <Label htmlFor='Skills-Activities-type'>
                                    Skill/Activities: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='skillActivityType'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                value={field.value || ''}
                                                onValueChange={(v: 'Skills' | 'Activities') => {
                                                    field.onChange(v);
                                                    setValue('nameId', 0);
                                                    setValue('areaId', 0);
                                                    setActivityNames([]);
                                                    setActivityAreas([]);
                                                }}
                                                disabled={!watchExamTerm || watchExamTerm === 0}>
                                                <SelectTrigger id='Skills-Activities-type'>
                                                    <SelectValue
                                                        placeholder={
                                                            !watchExamTerm || watchExamTerm === 0 ? 'Select Exam Term first' : 'Select Type'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Skills'>Skills</SelectItem>
                                                    <SelectItem value='Activities'>Activities</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Skill Name - Only shows when "Skills" is selected */}
                            {watchSkillActivity === 'Skills' && (
                                <div>
                                    <Label htmlFor='Skills-name'>
                                        Skill Name: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='nameId'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select
                                                    key={`Skills-name-${skillNames.length}`} // Force re-render when names change
                                                    value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                    onValueChange={(v) => {
                                                        field.onChange(v ? Number(v) : 0);
                                                    }}
                                                    disabled={loadingNames}>
                                                    <SelectTrigger id='Skills-name'>
                                                        <SelectValue placeholder={loadingNames ? 'Loading...' : 'Select Skill Name'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {skillNames.map((item) => (
                                                            <SelectItem key={item.ecS_Id} value={item.ecS_Id.toString()}>
                                                                {item.ecS_SkillName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Activity Name - Only shows when "Activities" is selected */}
                            {watchSkillActivity === 'Activities' && (
                                <div>
                                    <Label htmlFor='Activities-name'>
                                        Activities Name: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='nameId'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select
                                                    key={`Activities-name-${activityNames.length}`} // Force re-render when names change
                                                    value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                    onValueChange={(v) => {
                                                        field.onChange(v ? Number(v) : 0);
                                                    }}
                                                    disabled={loadingNames}>
                                                    <SelectTrigger id='Activities-name'>
                                                        <SelectValue placeholder={loadingNames ? 'Loading...' : 'Select Activities Name'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {activityNames.map((item) => (
                                                            <SelectItem key={item.ecacT_Id} value={item.ecacT_Id.toString()}>
                                                                {item.ecacT_SkillName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Skill Area - Only shows when "Skills" is selected AND Skills name is chosen */}
                            {watchSkillActivity === 'Skills' && (
                                <div>
                                    <Label htmlFor='Skills-area'>
                                        Skill Area: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='areaId'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select
                                                    key={`Skills-area-${skillAreas.length}`} // Force re-render when areas change
                                                    value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                    onValueChange={(v) => {
                                                        field.onChange(v ? Number(v) : 0);
                                                    }}
                                                    disabled={loadingAreas}>
                                                    <SelectTrigger id='Skills-area'>
                                                        <SelectValue placeholder={loadingAreas ? 'Loading...' : 'Select Skill Area'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {skillAreas.map((area) => (
                                                            <SelectItem key={area.ecsA_Id} value={area.ecsA_Id.toString()}>
                                                                {area.ecsA_SkillArea}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Activity Area - Only shows when "Activities" is selected AND Activities name is chosen */}
                            {watchSkillActivity === 'Activities' && (
                                <div>
                                    <Label htmlFor='Activities-area'>
                                        Activities Area: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='areaId'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select
                                                    key={`Activities-area-${activityAreas.length}`} // Force re-render when areas change
                                                    value={field.value && field.value !== 0 ? String(field.value) : ''}
                                                    onValueChange={(v) => {
                                                        field.onChange(v ? Number(v) : 0);
                                                    }}
                                                    disabled={loadingAreas}>
                                                    <SelectTrigger id='Activities-area'>
                                                        <SelectValue placeholder={loadingAreas ? 'Loading...' : 'Select Activities Area'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {activityAreas.map((area) => (
                                                            <SelectItem key={area.ecactA_Id} value={String(area.ecactA_Id)}>
                                                                {area.ecactA_SkillArea}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <div className='mx-auto mt-8 flex w-fit justify-center'>
                            <Button
                                type='submit'
                                disabled={!allFieldsFilled || isLoading || !isValid}
                                className='py- px-8 font-medium text-white shadow'>
                                {isLoading ? 'LOADING...' : 'SEARCH'}
                            </Button>
                        </div>
                    </div>

                    {/* Student Table (only shows when data is loaded) */}
                    {showTable && tableProps && (
                        <div className='mt-4'>
                            <CollapsibleSection defaultOpen variant='default' size='lg' className='shadow-lg'>
                                <div className='mb-4'>
                                    <h3 className='font-semibold text-lg'>STUDENT LIST</h3>
                                    <p className='text-gray-600 text-sm'>
                                        Selected: {selectedStudentIds.length} of {students.length} students
                                    </p>
                                </div>

                                <GenericDataTable<IStudentTransactionGrid>
                                    {...tableProps}
                                    columns={columns}
                                    isLoading={isLoading}
                                    columnPinning={{ right: [] }}
                                    loadingMessage='Loading student data...'
                                    noDataTitle='No Students Found'
                                    noDataDescription='Click SEARCH to view students'
                                    errorTitle='Error Loading Students'
                                    onRowSelectionChange={handleRowSelectionChange}
                                //defaultSelectedRowIds={[]}
                                />
                                <div className='mx-auto mt-8 flex w-fit justify-center gap-4'>
                                    <Button type='button' onClick={handleReset} variant='outline' className='px-8 py-3 font-medium shadow'>
                                        RESET
                                    </Button>
                                    <Button
                                        type='button'
                                        onClick={handleSaveScores}
                                        disabled={selectedStudentIds.length === 0 || isSaving}
                                        className='px-8 py-3 font-medium text-white shadow hover:bg-green-700'>
                                        {isSaving ? 'SAVING...' : `SAVE (${selectedStudentIds.length} selected)`}
                                    </Button>
                                </div>
                            </CollapsibleSection>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}
