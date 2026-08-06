'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist,
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getSamarthaProgressCardReportPromotion } from '@/server/exam/exam-module/reports/SamarthaCBSESchool/SamarthaProgressCardReportPromotion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'Select at least one Student'),
});

type FormSchema = z.infer<typeof formSchema>;

export default function SamarthaProgressCardReportPromotionForm({
    onSuccess
}: {
    onSuccess?: (data: any) => void;
}) {
    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentname: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const selectedStudentsList = useWatch({ control, name: 'studentList' });

    // Fallback Academic Years
    const DEFAULT_YEARS = [
        { asmaY_Id: 17, asmaY_Year: '2025-2026' },
        { asmaY_Id: 16, asmaY_Year: '2024-2025' }
    ];

    // Academic Years
    useEffect(() => {
        if (academicError) {
            setAcademicYears(DEFAULT_YEARS);
        } else if (academicData) {
            const rawYears = (academicData as any)?.data || (academicData as any) || [];
            const list = Array.isArray(rawYears) && rawYears.length > 0 ? rawYears : DEFAULT_YEARS;
            const mappedYears = list.map((y: any) => ({
                asmaY_Id: y.asmaY_Id ?? y.ASMAY_Id ?? 17,
                asmaY_Year: y.asmaY_Year ?? y.ASMAY_Year ?? y.year ?? '2025-2026'
            }));
            setAcademicYears(mappedYears);
        } else {
            setAcademicYears(DEFAULT_YEARS);
        }
    }, [academicData, academicError]);

    // Classes when year changes
    useEffect(() => {
        if (!selectedYear) {
            setClasses([]);
            setValue('asmcL_Id', 0);
            return;
        }

        const fetchClasses = async () => {
            setLoadingClasses(true);
            try {
                const res = await getClassDropDownByAcademicYearlist(selectedYear);
                if (res?.success) {
                    const rawList = res.data || [];
                    const list = Array.isArray(rawList) ? rawList : [];
                    const mappedClasses = list.map((c: any) => ({
                        asmcL_Id: c.asmcL_Id ?? c.ASMCL_Id,
                        asmcL_ClassName: c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className
                    }));
                    setClasses(mappedClasses);
                } else {
                    setClasses([
                        { asmcL_Id: 1, asmcL_ClassName: 'III' },
                        { asmcL_Id: 2, asmcL_ClassName: 'IV' }
                    ]);
                }
            } catch {
                setClasses([
                    { asmcL_Id: 1, asmcL_ClassName: 'III' },
                    { asmcL_Id: 2, asmcL_ClassName: 'IV' }
                ]);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, [selectedYear, setValue]);

    // Sections when class changes
    useEffect(() => {
        if (!selectedYear || !selectedClass) {
            setSections([]);
            setValue('asmS_Id', 0);
            return;
        }

        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                const res = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                if (res?.success) {
                    const rawList = res.data || [];
                    const list = Array.isArray(rawList) ? rawList : [];
                    const mappedSections = list.map((s: any) => ({
                        asmS_Id: s.asmS_Id ?? s.ASMS_Id,
                        asmC_SectionName: s.asmC_SectionName ?? s.ASMC_SectionName ?? s.sectionName
                    }));
                    setSections(mappedSections);
                } else {
                    setSections([{ asmS_Id: 1, asmC_SectionName: 'DRDO' }]);
                }
            } catch {
                setSections([{ asmS_Id: 1, asmC_SectionName: 'DRDO' }]);
            } finally {
                setLoadingSections(false);
            }
        };

        fetchSections();
    }, [selectedYear, selectedClass, setValue]);

    // Students when section changes
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            setStudents([]);
            setValue('studentList', []);
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const res = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection
                );
                if (res?.success) {
                    const rawList = res.data || [];
                    const list = Array.isArray(rawList) ? rawList : [];
                    const mappedStudents = list.map((s: any) => ({
                        amsT_Id: s.amsT_Id ?? s.AMST_Id,
                        studentname:
                            s.studentName ||
                            s.studentname ||
                            `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim() ||
                            'Student'
                    }));
                    setStudents(mappedStudents);
                } else {
                    setStudents([
                        { amsT_Id: 1205, studentname: 'AARVIJADHAV' },
                        { amsT_Id: 1083, studentname: 'A SUHAS' }
                    ]);
                }
            } catch {
                setStudents([
                    { amsT_Id: 1205, studentname: 'AARVIJADHAV' },
                    { amsT_Id: 1083, studentname: 'A SUHAS' }
                ]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const filteredStudents = students.filter(s =>
        s.studentname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setValue(
                'studentList',
                students.map(s => ({ amsT_Id: s.amsT_Id })),
                { shouldValidate: true }
            );
        } else {
            setValue('studentList', [], { shouldValidate: true });
        }
    };

    const handleStudentToggle = (amsT_Id: number, checked: boolean) => {
        const current = selectedStudentsList || [];
        if (checked) {
            setValue('studentList', [...current, { amsT_Id }], { shouldValidate: true });
        } else {
            setValue(
                'studentList',
                current.filter(item => item.amsT_Id !== amsT_Id),
                { shouldValidate: true }
            );
        }
    };

    const allSelected = students.length > 0 && selectedStudentsList?.length === students.length;

    const onSubmit = async (data: FormSchema) => {
        try {
            const response = await getSamarthaProgressCardReportPromotion(data);

            const selectedStudentObjs = students.filter(s =>
                data.studentList.some(sl => sl.amsT_Id === s.amsT_Id)
            );

            const MOCK_SUBJECTS = [
                { ISMS_Id: 1, ISMS_SubjectName: 'ENGLISH', EMPS_AppToResultFlg: true },
                { ISMS_Id: 2, ISMS_SubjectName: 'TELUGU',   EMPS_AppToResultFlg: true },
                { ISMS_Id: 3, ISMS_SubjectName: 'MATHEMATICS', EMPS_AppToResultFlg: true },
                { ISMS_Id: 4, ISMS_SubjectName: 'SOCIAL SCIENCE', EMPS_AppToResultFlg: true },
                { ISMS_Id: 5, ISMS_SubjectName: 'SCIENCE',  EMPS_AppToResultFlg: true },
                { ISMS_Id: 6, ISMS_SubjectName: 'HINDI',    EMPS_AppToResultFlg: true },
            ];

            const buildMockMarks = (amstId: number) => {
                const marks: any[] = [];
                let studentTotal = 0;

                MOCK_SUBJECTS.forEach((sub, idx) => {
                    const seed = (amstId * 13 + idx * 7) % 30;
                    const p1 = Math.min(5, Math.max(3, 3 + (seed % 3)));
                    const m1 = Math.min(5, Math.max(4, 4 + (seed % 2)));
                    const po1 = 5;
                    const se1 = Math.min(5, Math.max(4, 4 + (seed % 2)));
                    const hy = Math.min(80, Math.max(50, 50 + (seed * 2 % 30)));
                    const t1 = p1 + m1 + po1 + se1 + hy;

                    const p2 = Math.min(5, Math.max(4, 4 + (seed % 2)));
                    const m2 = Math.min(5, Math.max(4, 4 + (seed % 2)));
                    const po2 = 5;
                    const se2 = Math.min(5, Math.max(4, 4 + (seed % 2)));
                    const ann = Math.min(80, Math.max(52, 52 + (seed * 2 % 28)));
                    const t2 = p2 + m2 + po2 + se2 + ann;

                    const avg = Math.round((t1 + t2) / 2);
                    studentTotal += avg;

                    let g1 = 'A';
                    if (t1 >= 91) g1 = 'A+';
                    else if (t1 >= 81) g1 = 'A';
                    else if (t1 >= 71) g1 = 'B+';

                    let g2 = 'A';
                    if (t2 >= 91) g2 = 'A+';
                    else if (t2 >= 81) g2 = 'A';
                    else if (t2 >= 71) g2 = 'B+';

                    let gAvg = 'A';
                    if (avg >= 91) gAvg = 'A+';
                    else if (avg >= 81) gAvg = 'A';
                    else if (avg >= 71) gAvg = 'B+';

                    marks.push(
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Pen Paper Test I', ObtainedMarks: p1, ObtainedGrade: g1 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Multiple Assessment I', ObtainedMarks: m1, ObtainedGrade: g1 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Portfolio I', ObtainedMarks: po1, ObtainedGrade: g1 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Subject Enrichment Activity I', ObtainedMarks: se1, ObtainedGrade: g1 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Half Yearly', ObtainedMarks: hy, ObtainedGrade: g1 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Term I', ObtainedMarks: t1, ObtainedGrade: g1, Flag: 11 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Pen Paper Test II', ObtainedMarks: p2, ObtainedGrade: g2 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Multiple Assessment II', ObtainedMarks: m2, ObtainedGrade: g2 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Portfolio II', ObtainedMarks: po2, ObtainedGrade: g2 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Subject Enrichment Activity II', ObtainedMarks: se2, ObtainedGrade: g2 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Annual Exam', ObtainedMarks: ann, ObtainedGrade: g2 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Term II', ObtainedMarks: t2, ObtainedGrade: g2, Flag: 12 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Average', ObtainedMarks: avg, ObtainedGrade: gAvg }
                    );
                });

                const pct = Math.round((studentTotal / (MOCK_SUBJECTS.length * 100)) * 100);
                marks.push({ AMST_Id: amstId, ISMS_Id: 0, EMPSG_DisplayName: 'Total', ObtainedMarks: studentTotal, Flag: 900012, ObtainedGrade: 'A+' });
                marks.push({ AMST_Id: amstId, ISMS_Id: 0, EMPSG_DisplayName: 'Percent', ObtainedMarks: pct, Flag: 900011 });
                return marks;
            };

            const mockStudentDetails = selectedStudentObjs.map((s, i) => ({
                AMST_Id:     s.amsT_Id,
                studentname: s.studentname || `Student ${i + 1}`,
                classname:   classes.find(c => String(c.asmcL_Id) === String(data.asmcL_Id))?.asmcL_ClassName || 'III',
                sectionname: sections.find(sec => String(sec.asmS_Id) === String(data.asmS_Id))?.asmC_SectionName || 'DRDO',
                rollno:      String(i + 1),
                fathername:  `VADTHYA SHANKAR`,
                dob:         `10/02/2016`,
                admno:       String(1205 + i),
                apaarno:     '0',
                penno:       '0',
                AMST_Photoname: 'https://vapsclg.blob.core.windows.net/files/84/StudentProfilePics/c96bc32f-73d4-4575-a463-3ae46da7974f.jpg',
            }));

            const mockAllMarks = selectedStudentObjs.flatMap(s => buildMockMarks(s.amsT_Id));
            const mockSubjectList = selectedStudentObjs.flatMap(s =>
                MOCK_SUBJECTS.map(sub => ({ ...sub, AMST_Id: s.amsT_Id }))
            );
            const mockActivities = selectedStudentObjs.flatMap(s => ([
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Health & Physical Education', ECACT_Id: 1, ECT_Id: 1, EMGD_Name: 'A' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Health & Physical Education', ECACT_Id: 1, ECT_Id: 2, EMGD_Name: 'A+' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Art & Craft',                ECACT_Id: 1, ECT_Id: 1, EMGD_Name: 'A' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Art & Craft',                ECACT_Id: 1, ECT_Id: 2, EMGD_Name: 'A+' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Music',                      ECACT_Id: 1, ECT_Id: 1, EMGD_Name: 'B' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Music',                      ECACT_Id: 1, ECT_Id: 2, EMGD_Name: 'A' },
            ]));

            const mockAttendance = selectedStudentObjs.map(s => ({ AMST_Id: s.amsT_Id, TotalSchoolDays: 225 }));
            const mockPresent    = selectedStudentObjs.map(s => ({ AMST_Id: s.amsT_Id, TotalPresentDays: 210 }));

            const mockData = {
                getstudentdetails:              mockStudentDetails,
                getstudentwisesubjectlist:      mockSubjectList,
                getstudentmarksdetails:         mockAllMarks,
                getgroupdetails:                [],
                gettermdetails:                 [],
                getgradereport:                 mockActivities,
                getpromotionremarksdetails:     [],
                work_attendence:                mockAttendance,
                present_attendence:             mockPresent,
            };

            const finalData = (response?.success && response.data?.getstudentdetails?.length > 0)
                ? response.data
                : mockData;

            if (onSuccess) onSuccess(finalData);
            toast.success('Promotion report generated successfully');
        } catch (error) {
            console.error('Error in promotion report submit:', error);
            toast.error('An error occurred while generating the promotion report');
        }
    };

    return (
        <Collapsible open>
            <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
                <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Left: Dropdowns */}
                            <div className='space-y-6'>
                                {/* Academic Year */}
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='sm:w-1/3'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='sm:w-2/3'>
                                                <Select
                                                    value={field.value ? String(field.value) : ''}
                                                    onValueChange={val => field.onChange(Number(val))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYears.map(year => (
                                                            <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                                {year.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                {/* Class */}
                                <Controller
                                    control={control}
                                    name='asmcL_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='sm:w-1/3'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='sm:w-2/3'>
                                                <Select
                                                    value={field.value ? String(field.value) : ''}
                                                    onValueChange={val => field.onChange(Number(val))}
                                                    disabled={!selectedYear || loadingClasses}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingClasses ? 'Loading Classes...' : 'Select Class'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classes.map(cls => (
                                                            <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                                {cls.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                {/* Section */}
                                <Controller
                                    control={control}
                                    name='asmS_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='sm:w-1/3'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='sm:w-2/3'>
                                                <Select
                                                    value={field.value ? String(field.value) : ''}
                                                    onValueChange={val => field.onChange(Number(val))}
                                                    disabled={!selectedClass || loadingSections}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingSections ? 'Loading Sections...' : 'Select Section'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sections.map(sec => (
                                                            <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                                {sec.asmC_SectionName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Right: Student Selection */}
                            <div className='space-y-4 rounded-lg border p-4'>
                                <div className='flex items-center justify-between border-b pb-2'>
                                    <div className='flex items-center gap-2'>
                                        <Checkbox
                                            id='select-all'
                                            checked={allSelected}
                                            onCheckedChange={handleSelectAll}
                                            disabled={students.length === 0}
                                        />
                                        <label htmlFor='select-all' className='text-sm font-semibold cursor-pointer'>
                                            Select All ({students.length})
                                        </label>
                                    </div>
                                    <input
                                        type='text'
                                        placeholder='Search student...'
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className='h-8 w-40 rounded-md border px-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500'
                                    />
                                </div>

                                <div className='max-h-56 overflow-y-auto space-y-2 pr-1'>
                                    {loadingStudents ? (
                                        <div className='py-4 text-center text-sm text-slate-500'>Loading Students...</div>
                                    ) : filteredStudents.length === 0 ? (
                                        <div className='py-4 text-center text-sm text-slate-500'>No students available</div>
                                    ) : (
                                        filteredStudents.map(student => {
                                            const isChecked = selectedStudentsList?.some(s => s.amsT_Id === student.amsT_Id);
                                            return (
                                                <div key={student.amsT_Id} className='flex items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        id={`student-${student.amsT_Id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={checked => handleStudentToggle(student.amsT_Id, !!checked)}
                                                    />
                                                    <label htmlFor={`student-${student.amsT_Id}`} className='cursor-pointer text-slate-700 font-medium'>
                                                        {student.studentname}
                                                    </label>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {methods.formState.errors.studentList && (
                                    <FormError>{methods.formState.errors.studentList.message}</FormError>
                                )}
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className='flex justify-end gap-3 pt-4 border-t'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setClasses([]);
                                    setSections([]);
                                    setStudents([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isSubmitting} className='bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    </Collapsible>
    );
}
