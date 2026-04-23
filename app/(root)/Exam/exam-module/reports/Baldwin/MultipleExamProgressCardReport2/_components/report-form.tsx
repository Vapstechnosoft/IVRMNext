'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import {
    getInitialData,
    getClassesByYear,
    getSectionsByClass,
    getExamsAndGrades,
    getMultipleExamProgressReport
} from '@/server/exam/exam-module/reports/Baldwin/multiple-exam-progress-card-report-2';

const schema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    examlist: z.array(z.string()).min(1, 'At least one exam must be selected')
});

type FormValues = z.infer<typeof schema>;

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
}

export function ReportForm({ onReportGenerated }: ReportFormProps) {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            examlist: []
        }
    });

    const { control, handleSubmit, watch, setValue, reset } = methods;

    const watchYear = watch('ASMAY_Id');
    const watchClass = watch('ASMCL_Id');
    const watchSection = watch('ASMS_Id');

    // 1. Initial Data
    useEffect(() => {
        const fetchInitial = async () => {
            setLoadingYears(true);
            try {
                const res: any = await getInitialData();
                setYears(res?.getyearlist || []);
            } catch (error) {
                toast.error('Failed to load academic years');
            } finally {
                setLoadingYears(false);
            }
        };
        fetchInitial();
    }, []);

    // 2. Load Classes
    useEffect(() => {
        if (!watchYear) return;
        const fetchClasses = async () => {
            setLoadingClasses(true);
            try {
                const res: any = await getClassesByYear(Number(watchYear));
                setClasses(res?.getclasslist || []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('examlist', []);
            } catch (error) {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, [watchYear, setValue]);

    // 3. Load Sections
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                const res: any = await getSectionsByClass(Number(watchYear), Number(watchClass));
                setSections(res?.getsectionlist || []);
                setValue('ASMS_Id', '');
                setValue('examlist', []);
            } catch (error) {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        };
        fetchSections();
    }, [watchYear, watchClass, setValue]);

    // 4. Load Exams
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        const fetchExams = async () => {
            setLoadingExams(true);
            try {
                const res: any = await getExamsAndGrades(Number(watchYear), Number(watchClass), Number(watchSection));
                setExams(res?.getexam || []);
                setValue('examlist', []);
            } catch (error) {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        };
        fetchExams();
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const selectedExams = exams
                .filter(exm => data.examlist.includes(String(exm.emE_Id)))
                .map(exm => ({
                    EME_Id: exm.emE_Id,
                    EME_ExamName: exm.emE_ExamName
                }));

            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                examlist: selectedExams
            };

            const response = await getMultipleExamProgressReport(payload);
            
            if (response) {
                const yearName = years.find(y => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';
                onReportGenerated(response, { ...data, yearName });
                toast.success('Report generated');
            } else {
                toast.warning('No data found');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onCancel = () => {
        reset();
        onReportGenerated(null, null);
    };

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Progress Card Report Filters</h3>
            
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>Academic Year <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="ASMAY_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingYears ? <SelectItem value="0" disabled>Loading...</SelectItem> :
                                                    years.map(y => (
                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>{y.asmaY_Year}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Class <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="ASMCL_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchYear}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingClasses ? <SelectItem value="0" disabled>Loading...</SelectItem> :
                                                    classes.map(c => (
                                                        <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>{c.asmcL_ClassName}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Section <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="ASMS_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchClass}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingSections ? <SelectItem value="0" disabled>Loading...</SelectItem> :
                                                    sections.map(s => (
                                                        <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>{s.asmC_SectionName}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-1 flex flex-col h-full">
                            <Label>Exam <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="examlist"
                                render={({ field }) => (
                                    <div className="flex-1 min-h-[150px]">
                                        <CustomMultiSelectBox
                                            options={exams.map(ex => ({
                                                label: ex.emE_ExamName,
                                                value: String(ex.emE_Id)
                                            }))}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={loadingExams ? "Loading exams..." : "Select Exams"}
                                            height="180px"
                                            isSearchRequired={false}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4 border-t mt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            Report
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
