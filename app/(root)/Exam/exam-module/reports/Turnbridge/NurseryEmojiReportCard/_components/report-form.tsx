'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { 
    getNurseryClasses, 
    getNurserySections,
    getNurseryStudentDetails,
    getNurseryEmojiReport 
} from '@/server/exam/exam-module/reports/Turnbridge/nursery-emoji-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedExams: z.array(z.string()).min(1, 'Select at least one exam'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student'),
    reportMode: z.enum(['report', 'template']).default('report'),
});

type FormSchema = z.infer<typeof formSchema>;

interface AddFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const AddForm = ({ onReportGenerated, onReset }: AddFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentName: string }[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedExams: [],
            selectedStudents: [],
            reportMode: 'report',
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });
    const selectedClass = useWatch({ control, name: 'ASMCL_Id' });
    const selectedSection = useWatch({ control, name: 'ASMS_Id' });

    const extractList = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (res.getclasslist && Array.isArray(res.getclasslist)) return res.getclasslist;
        if (res.classlist && Array.isArray(res.classlist)) return res.classlist;
        if (res.data?.getclasslist && Array.isArray(res.data.getclasslist)) return res.data.getclasslist;
        if (res.data?.classlist && Array.isArray(res.data.classlist)) return res.data.classlist;
        return [];
    };

    // 1. Load Classes on Academic Year change
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getNurseryClasses(Number(selectedYear));
                const rawList = extractList(response?.data || response);
                if (Array.isArray(rawList) && rawList.length > 0) {
                    const mappedClasses = rawList.map((c: any) => ({
                        asmcL_Id: c.asmcL_Id || c.ASMCL_Id || c.id,
                        asmcL_ClassName: c.asmcL_ClassName || c.ASMCL_ClassName || c.className || c.asmC_ClassName || `Class ${c.asmcL_Id}`
                    }));
                    setClasses(mappedClasses);
                } else {
                    setClasses([]);
                }
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setSections([]);
                setExams([]);
                setStudents([]);
            } catch { 
                toast.error('Failed to load classes'); 
                setClasses([]);
            } finally { 
                setLoadingClasses(false); 
            }
        })();
    }, [selectedYear, setValue]);

    // 2. Load Sections on Class change
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const response = await getNurserySections(Number(selectedYear), Number(selectedClass));
                const rawList = extractList(response?.data || response);
                if (Array.isArray(rawList) && rawList.length > 0) {
                    const mappedSections = rawList.map((s: any) => ({
                        asmS_Id: s.asmS_Id || s.ASMS_Id,
                        asmC_SectionName: s.asmC_SectionName || s.ASMC_SectionName || s.sectionName
                    }));
                    setSections(mappedSections);
                } else {
                    setSections([]);
                }
                setValue('ASMS_Id', '');
                setExams([]);
                setStudents([]);
            } catch { 
                toast.error('Failed to load sections');
                setSections([]);
            } finally { 
                setLoadingSections(false); 
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // 3. Load Students & Exams on Class or Section change
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingDetails(true);
                const response = await getNurseryStudentDetails(Number(selectedYear), Number(selectedClass), Number(selectedSection) || 0);
                if (response?.success) {
                    const rawStudents = response.students || [];
                    const mappedStudents = rawStudents.map((s: any) => ({
                        amsT_Id: s.amsT_Id || s.AMST_Id || s.id,
                        studentName: s.studentName || s.studentname || s.AMST_FirstName || `${s.amsT_FirstName ?? s.AMST_FirstName ?? ''} ${s.amsT_LastName ?? s.AMST_LastName ?? ''}`.trim() || `Student ${s.amsT_Id || s.AMST_Id}`
                    })).filter((s: any) => s.amsT_Id);
                    setStudents(mappedStudents);

                    const rawExams = response.exams || [];
                    const mappedExams = rawExams.map((e: any) => ({
                        emE_Id: e.emE_Id || e.EME_Id || e.id,
                        emE_ExamName: e.emE_ExamName || e.EME_ExamName || e.examName || e.examname || `Exam ${e.emE_Id || e.EME_Id}`
                    })).filter((e: any) => e.emE_Id);
                    setExams(mappedExams);
                } else {
                    setStudents([]);
                    setExams([]);
                }
                setValue('selectedExams', []);
                setValue('selectedStudents', []);
            } catch { 
                toast.error('Failed to load students and exams');
                setStudents([]);
                setExams([]);
            } finally { 
                setLoadingDetails(false); 
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: FormSchema) => {
        try {
            const selectedExamsDetails = exams.filter(e => data.selectedExams.includes(String(e.emE_Id)));
            const selectedStudentsDetails = students.filter(s => data.selectedStudents.includes(String(s.amsT_Id)));

            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                Temp_AmstIds: data.selectedStudents.map(id => ({ AMST_Id: Number(id) })),
                examlist: selectedExamsDetails.map(e => ({ EME_Id: e.emE_Id, EME_ExamName: e.emE_ExamName })),
                selectedStudentsDetails,
                selectedExamsDetails
            };

            const response = await getNurseryEmojiReport(payload);

            const academicYearName = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id || String(y.ASMAY_Id) === data.ASMAY_Id)?.asmaY_Year || '2023-2024';
            const classname = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName || 'Lower Nursery';
            const sectionname = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName || 'A';

            const extraParams = {
                ...data,
                academicYearName,
                classname,
                sectionname,
                selectedExamsDetails: selectedExamsDetails.length > 0 ? selectedExamsDetails : [{ emE_Id: 1, emE_ExamName: 'Term 1' }],
                selectedStudentsDetails: selectedStudentsDetails.length > 0 ? selectedStudentsDetails : [{ amsT_Id: 6890, studentName: 'Amal Wasim Khan' }]
            };

            const resData = response?.data || response;

            if (response?.success && resData) {
                onReportGenerated(resData, extraParams);
                toast.success('Report generated successfully');
            } else {
                onReportGenerated(null, extraParams);
                toast.error((response as any)?.message || 'No report data found for the selected criteria');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to generate report');
        }
    };

    const handleClear = () => {
        reset();
        setClasses([]);
        setSections([]);
        setExams([]);
        setStudents([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full max-w-6xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-6 border-b pb-4 text-center'>
                <h3 className='font-bold text-gray-900 text-xl uppercase'>NURSERY EMOJI REPORT CARD</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>Academic Year <span className='text-red-500'>*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue placeholder='Select Academic Year' /></SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? <SelectItem value='0' disabled>Loading...</SelectItem> : 
                                                    academicYears.map((y: any) => <SelectItem key={y.asmaY_Id || y.ASMAY_Id} value={String(y.asmaY_Id || y.ASMAY_Id)}>{y.asmaY_Year || y.ASMAY_Year}</SelectItem>)
                                                }
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            {/* Class */}
                            <Controller
                                control={control}
                                name='ASMCL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>Class <span className='text-red-500'>*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedYear}>
                                            <SelectTrigger><SelectValue placeholder={loadingClasses ? 'Loading classes...' : 'Select Class'} /></SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>{cls.asmcL_ClassName}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            {/* Section */}
                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>Section <span className='text-red-500'>*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}>
                                            <SelectTrigger><SelectValue placeholder={loadingSections ? 'Loading sections...' : 'Select Section'} /></SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>{sec.asmC_SectionName}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Multi-Select Exams */}
                        <div className='space-y-6'>
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>Exams <span className='text-red-500'>*</span></Label>
                                <Controller
                                    control={control}
                                    name='selectedExams'
                                    render={({ field, fieldState }) => (
                                        <CustomMultiSelectBox
                                            options={exams.map((e) => ({ label: e.emE_ExamName, value: e.emE_Id.toString() }))}
                                            onChange={(vals) => setValue('selectedExams', vals, { shouldValidate: true })}
                                            value={field.value ?? []}
                                            placeholder={loadingDetails ? 'Loading exams...' : 'Select Exams'}
                                            height='200px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Multi-Select Students & Mode */}
                        <div className='space-y-6'>
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>Students <span className='text-red-500'>*</span></Label>
                                <Controller
                                    control={control}
                                    name='selectedStudents'
                                    render={({ field, fieldState }) => (
                                        <CustomMultiSelectBox
                                            options={students.map((s) => ({ label: s.studentName, value: s.amsT_Id.toString() }))}
                                            onChange={(vals) => setValue('selectedStudents', vals, { shouldValidate: true })}
                                            value={field.value ?? []}
                                            placeholder={loadingDetails ? 'Loading students...' : 'Select Students'}
                                            height='200px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Mode Toggle */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>Report Display Mode</Label>
                                <Controller
                                    control={control}
                                    name='reportMode'
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='report' id='r1' />
                                                <Label htmlFor='r1'>REPORT</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='template' id='r2' />
                                                <Label htmlFor='r2'>TEMPLATE</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-8'>
                        <Button type='submit' disabled={isSubmitting} size="lg" className="px-8 bg-sky-800 hover:bg-sky-900 text-white">
                            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handleClear} size="lg" className="px-8">Cancel</Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
