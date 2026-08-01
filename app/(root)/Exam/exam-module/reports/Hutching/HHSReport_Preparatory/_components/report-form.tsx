'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, RefreshCcw, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { hhsReportPreparatorySchema, type HHSReportPreparatorySchema } from '@/schemas/exam/exam-module/reports';
import {
    getHHSReportPreparatoryDetails,
    getClassByYear,
    getSectionByClass,
    getAttendanceBySection,
    getPrimarySaveDetails
} from '@/server/exam/exam-module/reports/Hutching/hhs-report-preparatory';

interface ReportFormProps {
    onReportGenerated: (data: any, year: string, cls: string, sec: string, reOpen: Date | null) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const [years, setYears] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<HHSReportPreparatorySchema>({
        resolver: zodResolver(hhsReportPreparatorySchema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            AMST_Id: '',
            EMGR_Id: '',
            re_opendate: undefined
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting, errors } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchReOpenDate = useWatch({ control, name: 're_opendate' });

    // Load Initial Data: Years and Grades
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const response = (await getHHSReportPreparatoryDetails()) as any;
                if (response?.success && response.data) {
                    setYears(response.data.yearlist || []);
                    setGrades(response.data.grade_list || []);
                } else if (response?.yearlist) {
                    // fallback if not nested under data
                    setYears(response.yearlist || []);
                    setGrades(response.grade_list || []);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load initial report details');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Load Classes on Year Change
    useEffect(() => {
        if (watchYear) {
            (async () => {
                try {
                    setLoadingClasses(true);
                    const response = (await getClassByYear(Number(watchYear))) as any;
                    const classList = response?.success && response.data ? response.data.fillclass : response?.fillclass;
                    setClasses(classList || []);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load classes');
                } finally {
                    setLoadingClasses(false);
                }
            })();
            setValue('ASMCL_Id', '');
            setValue('ASMS_Id', '');
            setValue('AMST_Id', '');
            setSections([]);
            setStudents([]);
        } else {
            setClasses([]);
            setSections([]);
            setStudents([]);
        }
    }, [watchYear, setValue]);

    // Load Sections on Class Change
    useEffect(() => {
        if (watchYear && watchClass) {
            (async () => {
                try {
                    setLoadingSections(true);
                    const payload = {
                        ASMAY_Id: Number(watchYear),
                        ASMCL_Id: Number(watchClass)
                    };
                    const response = (await getSectionByClass(payload)) as any;
                    const sectionList = response?.success && response.data ? response.data.fillsection : response?.fillsection;
                    setSections(sectionList || []);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            })();
            setValue('ASMS_Id', '');
            setValue('AMST_Id', '');
            setStudents([]);
        } else {
            setSections([]);
            setStudents([]);
        }
    }, [watchYear, watchClass, setValue]);

    // Load Students on Section Change
    useEffect(() => {
        if (watchYear && watchClass && watchSection) {
            (async () => {
                try {
                    setLoadingStudents(true);
                    const payload = {
                        ASMAY_Id: Number(watchYear),
                        ASMCL_Id: Number(watchClass),
                        ASMS_Id: Number(watchSection)
                    };
                    const response = (await getAttendanceBySection(payload)) as any;
                    const studentList = response?.success && response.data ? response.data.fillstudents : response?.fillstudents;
                    setStudents(studentList || []);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load students');
                } finally {
                    setLoadingStudents(false);
                }
            })();
            setValue('AMST_Id', '');
        } else {
            setStudents([]);
        }
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: HHSReportPreparatorySchema) => {
        try {
            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                AMST_Id: Number(data.AMST_Id),
                EMGR_Id: Number(data.EMGR_Id)
            };

            const response = (await getPrimarySaveDetails(payload)) as any;

            const selectedYear = years.find(y => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';
            const selectedClass = classes.find(c => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName || '';
            const selectedSection = sections.find(s => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName || '';

            if (response && (response.success || response.eam_sub_mrks_list)) {
                const reportData = response.data || response;
                if (reportData.eam_sub_mrks_list && reportData.eam_sub_mrks_list.length > 0) {
                    onReportGenerated(
                        reportData,
                        selectedYear,
                        selectedClass,
                        selectedSection,
                        data.re_opendate || null
                    );
                    toast.success('Report card data fetched successfully');
                } else {
                    toast.error('No marks entry details found for the selected student');
                }
            } else {
                toast.error('Failed to fetch report card details');
            }
        } catch (error) {
            console.error('Error fetching report details:', error);
            toast.error('An error occurred while generating the report');
        }
    };

    const handleClear = () => {
        reset({
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            AMST_Id: '',
            EMGR_Id: '',
            re_opendate: undefined
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    return (
        <Card className="w-full bg-white rounded-lg border border-gray-200 p-4 shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="mb-4 border-b pb-2 bg-primary/5">
                <CardTitle className="font-semibold text-primary text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    HHS Progress Card Preparatory
                </CardTitle>
            </CardHeader>

            <CardContent>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Academic Year */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Academic Year <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMAY_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Academic Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Class <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMCL_Id"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!watchYear || loadingClasses}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        loadingClasses
                                                            ? 'Loading Classes...'
                                                            : 'Select Class'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
                            </div>

                            {/* Section */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Section <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMS_Id"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!watchClass || loadingSections}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        loadingSections
                                                            ? 'Loading Sections...'
                                                            : 'Select Section'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                            </div>

                            {/* Student Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Student Name <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="AMST_Id"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!watchSection || loadingStudents}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        loadingStudents
                                                            ? 'Loading Students...'
                                                            : 'Select Student'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.amsT_Id} value={String(student.amsT_Id)}>
                                                        {student.amsT_FirstName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.AMST_Id && <FormError>{errors.AMST_Id.message}</FormError>}
                            </div>

                            {/* Grade */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Grade Group <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="EMGR_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((grade) => (
                                                    <SelectItem key={grade.emgR_Id} value={String(grade.emgR_Id)}>
                                                        {grade.emgR_GradeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.EMGR_Id && <FormError>{errors.EMGR_Id.message}</FormError>}
                            </div>

                            {/* School Re-open Date */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    School Re-open Date
                                </Label>
                                <Controller
                                    control={control}
                                    name="re_opendate"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal border-gray-300',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, 'dd-MM-yyyy') : <span>Select Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 border-t pt-4">
                            <Button type="submit" disabled={isSubmitting} className="w-32 bg-primary hover:bg-primary/95 text-white">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Report'
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleClear} className="w-32">
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};
