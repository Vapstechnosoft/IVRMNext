'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist,
    getExamsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface ReportFormProps {
    title: string;
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ title, onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    const methods = useForm({
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            selectedStudents: [] as string[],
            selectedExams: [] as string[],
            Reopen_Date: new Date(),
            BG: 'BG1'
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(watchYear));
                setClasses(Array.isArray(data) ? data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(data) ? data : []);
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                setLoadingExams(true);
                const [{ data: studentsData }, { data: examsData }] = await Promise.all([
                    getStudentsDropDownByAcademicYearandClassandSectionlist(Number(watchYear), Number(watchClass), Number(watchSection)),
                    getExamsDropDownByAcademicYearandClassandSectionlist(Number(watchYear), Number(watchClass), Number(watchSection))
                ]);

                const validStudents = Array.isArray(studentsData) ? studentsData.filter((s: any) => !!s?.amsT_Id) : [];
                setStudents(validStudents.map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
                })));

                setExams(Array.isArray(examsData) ? examsData : []);
            } catch {
                toast.error('Failed to load students and exams');
            } finally {
                setLoadingStudents(false);
                setLoadingExams(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const generateMockData = (values: any, selectedStudentDetails: any[], selectedExamDetails: any[]) => {
        const yearName = academicYears.find((y: any) => y.asmaY_Id === Number(values.ASMAY_Id))?.asmaY_Year || '2025-26';
        const className = classes.find((c: any) => c.asmcL_Id === Number(values.ASMCL_Id))?.asmcL_ClassName || 'Class';
        const sectionName = sections.find((s: any) => s.asmS_Id === Number(values.ASMS_Id))?.asmC_SectionName || 'Section';

        const mockStudents = selectedStudentDetails.map((student, idx) => {
            // Mock subjects
            const subjects = [
                {
                    ISMS_Id: 1, ISMS_SubjectName: 'English', EYCES_AplResultFlg: true,
                    subexam_list: [
                        { EMSS_Id: 101, EMSS_SubSubjectName: 'Reading', EYCES_MarksDisplayFlg: true, EYCES_GradeDisplayFlg: false },
                        { EMSS_Id: 102, EMSS_SubSubjectName: 'Writing', EYCES_MarksDisplayFlg: true, EYCES_GradeDisplayFlg: false },
                        { EMSS_Id: 103, EMSS_SubSubjectName: 'Speaking', EYCES_MarksDisplayFlg: false, EYCES_GradeDisplayFlg: true }
                    ]
                },
                {
                    ISMS_Id: 2, ISMS_SubjectName: 'Mathematics', EYCES_AplResultFlg: true,
                    subexam_list: [
                        { EMSS_Id: 201, EMSS_SubSubjectName: 'Numbers', EYCES_MarksDisplayFlg: true, EYCES_GradeDisplayFlg: false },
                        { EMSS_Id: 202, EMSS_SubSubjectName: 'Shapes', EYCES_MarksDisplayFlg: false, EYCES_GradeDisplayFlg: true }
                    ]
                }
            ];

            const obtaioned_subject_wisemarks: any[] = [];
            selectedExamDetails.forEach(exam => {
                subjects.forEach(subj => {
                    subj.subexam_list.forEach(sub => {
                        const marks = Math.floor(Math.random() * 20) + 80;
                        obtaioned_subject_wisemarks.push({
                            EME_id: exam.emE_Id,
                            ISMS_Id: subj.ISMS_Id,
                            EMSS_Id: sub.EMSS_Id,
                            ESTMPSSS_PassFailFlg: 'P',
                            ESTMPSSS_ObtainedMarks: marks,
                            ESTMPSSS_ObtainedGrade: marks > 90 ? 'A+' : 'A'
                        });
                    });
                });
            });

            return {
                AMST_Id: student.amsT_Id,
                studentname: student.studentName,
                classname: className,
                sectionname: sectionName,
                admno: student.amsT_AdmNo || `ADM00${idx}`,
                dob: new Date(2018, 5, 10).toISOString(),
                fathername: 'John Doe',
                mothername: 'Jane Doe',
                AMST_BloodGroup: 'O+',
                photoname: 'https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg',
                subjects,
                obtaioned_subject_wisemarks,
                ECACTA_SkillArea_temp: [
                    { ECACT_Id: 1, ECACTA_Id: 1, ECACTA_SkillArea: 'Drawing' },
                    { ECACT_Id: 1, ECACTA_Id: 2, ECACTA_SkillArea: 'Painting' }
                ],
                activity_mian_stu_wise: selectedExamDetails.flatMap(exam => [
                    { EME_Id: exam.emE_Id, ECACTA_Id: 1, ECSACTT_Score: 'A' },
                    { EME_Id: exam.emE_Id, ECACTA_Id: 2, ECSACTT_Score: 'B' }
                ]),
                totalWorkingDays: 200,
                totalPresentDays: 185,
                SPCCSHW_Height: '120',
                SPCCSHW_Weight: '25',
                HMVSN_VisionHygiene: 'Normal',
                HMDNHY_DentalHygiene: 'Good'
            };
        });

        const activity_temp = [
            { ECACT_Id: 1, ECACT_SkillName: 'Creative Arts' }
        ];

        return {
            year: yearName,
            Reopen_Date: values.Reopen_Date,
            headerbg: values.BG === 'BG1' ? '#ffd3ac' : '#811414d4',
            marksbg: values.BG === 'BG1' ? '#fdece9' : '#FAF9F6',
            color: values.BG === 'BG1' ? 'black' : 'white',
            examlist_new: selectedExamDetails,
            getstudentdetails: mockStudents,
            activity_temp
        };
    };

    const onSubmit = async (values: any) => {
        if (!values.selectedStudents?.length || !values.selectedExams?.length) {
            toast.error('Please select at least one student and one exam');
            return;
        }

        const selectedStudentDetails = students.filter(s => values.selectedStudents.includes(String(s.amsT_Id)));
        const selectedExamDetails = exams.filter(e => values.selectedExams.includes(String(e.emE_Id)));

        const mockData = generateMockData(values, selectedStudentDetails, selectedExamDetails);
        onReportGenerated(mockData, values);
    };

    const handleClear = () => {
        reset();
        setClasses([]);
        setSections([]);
        setStudents([]);
        setExams([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <Controller control={control} name='ASMAY_Id' render={({ field }) => (
                                <div className='space-y-2'>
                                    <Label>Academic Year <span className='text-red-500'>*</span></Label>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder='Select Academic Year' /></SelectTrigger>
                                        <SelectContent>
                                            {academicYearLoading ? <SelectItem value='loading' disabled>Loading...</SelectItem> :
                                                academicYears.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>{y.asmaY_Year}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )} />
                            <Controller control={control} name='ASMCL_Id' render={({ field }) => (
                                <div className='space-y-2'>
                                    <Label>Class <span className='text-red-500'>*</span></Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchYear}>
                                        <SelectTrigger><SelectValue placeholder='Select Class' /></SelectTrigger>
                                        <SelectContent>
                                            {loadingClasses ? <SelectItem value='loading' disabled>Loading...</SelectItem> :
                                                classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>{c.asmcL_ClassName}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )} />
                            <Controller control={control} name='ASMS_Id' render={({ field }) => (
                                <div className='space-y-2'>
                                    <Label>Section <span className='text-red-500'>*</span></Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchClass}>
                                        <SelectTrigger><SelectValue placeholder='Select Section' /></SelectTrigger>
                                        <SelectContent>
                                            {loadingSections ? <SelectItem value='loading' disabled>Loading...</SelectItem> :
                                                sections.map((s) => (
                                                    <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>{s.asmC_SectionName}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )} />
                            <Controller control={control} name='Reopen_Date' render={({ field }) => (
                                <div className='space-y-2'>
                                    <Label>Reopen Date <span className='text-red-500'>*</span></Label>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                </div>
                            )} />
                            <Controller control={control} name='BG' render={({ field }) => (
                                <div className='space-y-2'>
                                    <Label>Color</Label>
                                    <div className='flex gap-4'>
                                        <Label className='flex items-center gap-2 cursor-pointer'>
                                            <input type='radio' name='BG' value='BG1' checked={field.value === 'BG1'} onChange={() => field.onChange('BG1')} className='w-4 h-4 text-blue-600' />
                                            <span className='w-4 h-4 inline-block rounded' style={{ backgroundColor: '#2E6F40' }}></span>
                                        </Label>
                                        <Label className='flex items-center gap-2 cursor-pointer'>
                                            <input type='radio' name='BG' value='BG2' checked={field.value === 'BG2'} onChange={() => field.onChange('BG2')} className='w-4 h-4 text-blue-600' />
                                            <span className='w-4 h-4 inline-block rounded' style={{ backgroundColor: '#811414d4' }}></span>
                                        </Label>
                                    </div>
                                </div>
                            )} />
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>Exam <span className='text-red-500'>*</span></Label>
                                <Controller control={control} name='selectedExams' render={({ field, fieldState }) => (
                                    <CustomMultiSelectBox
                                        options={exams.map((e) => ({ label: e.emE_ExamName, value: String(e.emE_Id) }))}
                                        onChange={field.onChange}
                                        value={field.value}
                                        placeholder='Select Exams'
                                        height='150px'
                                        isSearchRequired
                                        error={fieldState.error?.message}
                                    />
                                )} />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>Student <span className='text-red-500'>*</span></Label>
                                <Controller control={control} name='selectedStudents' render={({ field, fieldState }) => (
                                    <CustomMultiSelectBox
                                        options={students.map((s) => ({ label: `${s.studentName} - ${s.amsT_AdmNo}`, value: String(s.amsT_Id) }))}
                                        onChange={field.onChange}
                                        value={field.value}
                                        placeholder='Select Students'
                                        height='200px'
                                        isSearchRequired
                                        error={fieldState.error?.message}
                                    />
                                )} />
                            </div>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleClear} disabled={isSubmitting} className='min-w-[120px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
