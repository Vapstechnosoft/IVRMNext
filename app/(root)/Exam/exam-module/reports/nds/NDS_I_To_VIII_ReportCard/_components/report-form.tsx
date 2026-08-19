'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type NDSCoScholasticReportSchema, ndsCoScholasticReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getExamAcademicYearDropdown,
    getGmvpsProgressCardIXReport,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/nds-co-scholastic-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, academicYear: string, className?: string, sectionName?: string) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const fetchedYears = academicData?.data || [];

    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<NDSCoScholasticReportSchema>({
        resolver: zodResolver(ndsCoScholasticReportSchema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSelectedStudents = useWatch({ control, name: 'selectedStudents' }) || [];

    // Helper to safely extract list data from API responses
    const extractList = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        if (res.data && typeof res.data === 'object') {
            const list =
                res.data.classlist ||
                res.data.classList ||
                res.data.getclasslist ||
                res.data.fillclass ||
                res.data.yearlist ||
                res.data.yearList ||
                res.data.sectionList ||
                res.data.sectionlist ||
                res.data.getsectionlist ||
                res.data.fillsection ||
                res.data.studentlist ||
                res.data.studentList ||
                res.data.getstudentdetails;
            if (Array.isArray(list)) return list;
        }
        if (typeof res === 'object') {
            const list =
                res.classlist ||
                res.classList ||
                res.getclasslist ||
                res.fillclass ||
                res.yearlist ||
                res.yearList ||
                res.sectionList ||
                res.sectionlist ||
                res.getsectionlist ||
                res.fillsection ||
                res.studentlist ||
                res.studentList ||
                res.getstudentdetails;
            if (Array.isArray(list)) return list;
        }
        if (Array.isArray(res.data)) return res.data;
        return [];
    };

    // Load Initial Data (Academic Years)
    useEffect(() => {
        if (fetchedYears.length > 0) {
            setYears(fetchedYears);
            setLoading(false);
        } else {
            (async () => {
                try {
                    const response = await getExamAcademicYearDropdown();
                    const yearList = extractList(response);
                    setYears(yearList);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [fetchedYears]);

    // Load Classes on Year Change
    useEffect(() => {
        if (watchYear) {
            (async () => {
                try {
                    setLoadingClasses(true);
                    const response: any = await getClassDropDownByAcademicYearlist(Number(watchYear));
                    const classList = extractList(response);
                    setClasses(classList);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load classes');
                } finally {
                    setLoadingClasses(false);
                }
            })();
            setValue('ASMCL_Id', '');
            setValue('ASMS_Id', '');
            setValue('selectedStudents', []);
        } else {
            setClasses([]);
        }
    }, [watchYear, setValue]);

    // Load Sections on Class Change
    useEffect(() => {
        if (watchYear && watchClass) {
            (async () => {
                try {
                    setLoadingSections(true);
                    const response: any = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                    const sectionList = extractList(response);
                    setSections(sectionList);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            })();
            setValue('ASMS_Id', '');
            setValue('selectedStudents', []);
        } else {
            setSections([]);
        }
    }, [watchYear, watchClass, setValue]);

    // Load Students on Section Change
    useEffect(() => {
        if (watchYear && watchClass && watchSection) {
            (async () => {
                try {
                    setLoadingStudents(true);
                    const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                        Number(watchYear),
                        Number(watchClass),
                        Number(watchSection)
                    );
                    const rawList = extractList(response);
                    const studentList = rawList.map((s: any) => ({
                        ...s,
                        amsT_Id: s.amsT_Id ?? s.AMST_Id,
                        studentName:
                            s.studentName ||
                            s.studentname ||
                            `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || s.AMST_MiddleName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim()
                    }));
                    setStudents(studentList);

                    // Auto-select all students
                    if (Array.isArray(studentList)) {
                        setValue(
                            'selectedStudents',
                            studentList.map((s: any) => String(s.amsT_Id))
                        );
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load students');
                } finally {
                    setLoadingStudents(false);
                }
            })();
        } else {
            setStudents([]);
            setValue('selectedStudents', []);
        }
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: NDSCoScholasticReportSchema) => {
        try {
            const studentArr = data.selectedStudents.map((id) => ({
                AMST_Id: Number(id),
                amsT_Id: Number(id)
            }));

            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                studentlist: studentArr,
                Temp_AmstIds: studentArr
            };

            const response = await getGmvpsProgressCardIXReport(payload);
            const academicYear =
                years.find((y: any) => String(y.asmaY_Id ?? y.ASMAY_Id) === data.ASMAY_Id)?.asmaY_Year ||
                years.find((y: any) => String(y.asmaY_Id ?? y.ASMAY_Id) === data.ASMAY_Id)?.ASMAY_Year ||
                '';
            const className =
                classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id) === data.ASMCL_Id)?.asmcL_ClassName ||
                classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id) === data.ASMCL_Id)?.ASMCL_ClassName ||
                '';
            const sectionName =
                sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.asmC_SectionName ||
                sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.ASMC_SectionName ||
                sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.asmS_SectionName ||
                '';
            const reportData = response?.data || response;

            if (response?.success && reportData) {
                onReportGenerated(reportData, academicYear, className, sectionName);
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'No data found for the selected criteria');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Something went wrong');
        }
    };

    const handleClear = () => {
        reset();
        setSearchQuery('');
        onReset();
    };

    const filteredStudents = students.filter((s) => (s.studentName || s.studentname)?.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setValue(
                'selectedStudents',
                students.map((s) => String(s.amsT_Id))
            );
        } else {
            setValue('selectedStudents', []);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='w-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md'>
            <div className='border-b bg-blue-600 px-6 py-3'>
                <h3 className='flex items-center gap-2 font-bold text-sm text-white uppercase tracking-wider'>
                    <FileText className='h-4 w-4' />1 to 8 Report Card
                </h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column: Dropdowns */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year: any) => {
                                                        const id = year.asmaY_Id ?? year.ASMAY_Id;
                                                        const name = year.asmaY_Year ?? year.ASMAY_Year;
                                                        return (
                                                            <SelectItem key={id} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Class <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                disabled={!watchYear || loadingClasses}>
                                                <SelectTrigger className='w-full'>
                                                    {loadingClasses ? (
                                                        <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <SelectValue placeholder='--Select--' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls: any, idx: number) => {
                                                        const id = cls.asmcL_Id ?? cls.ASMCL_Id ?? cls.asmcL_ID ?? cls.id ?? idx;
                                                        const name =
                                                            cls.asmcL_ClassName ??
                                                            cls.ASMCL_ClassName ??
                                                            cls.className ??
                                                            cls.classname ??
                                                            cls.name;
                                                        return (
                                                            <SelectItem key={String(id)} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Section <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                disabled={!watchClass || loadingSections}>
                                                <SelectTrigger className='w-full'>
                                                    {loadingSections ? (
                                                        <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <SelectValue placeholder='--Select--' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((sec: any, idx: number) => {
                                                        const id =
                                                            sec.asmS_Id ?? sec.ASMS_Id ?? sec.asms_Id ?? sec.asmS_ID ?? sec.id ?? idx;
                                                        const name =
                                                            sec.asmC_SectionName ??
                                                            sec.ASMC_SectionName ??
                                                            sec.asmS_SectionName ??
                                                            sec.ASMS_SectionName ??
                                                            sec.sectionName ??
                                                            sec.sectionname ??
                                                            sec.asmC_Sectionname ??
                                                            sec.name;
                                                        return (
                                                            <SelectItem key={String(id)} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Column: Student Selection */}
                        <div className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='selectAll'
                                        checked={students.length > 0 && watchSelectedStudents.length === students.length}
                                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        disabled={students.length === 0}
                                    />
                                    <Label htmlFor='selectAll' className='cursor-pointer font-semibold text-sm'>
                                        Student : <span className='text-destructive'>*</span>
                                    </Label>
                                </div>
                                <div className='relative w-48'>
                                    <Search className='absolute top-2.5 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                    <Input
                                        placeholder='search here...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='h-8 pl-8 font-normal text-xs'
                                    />
                                </div>
                            </div>

                            <ScrollArea className='h-[200px] w-full rounded-md border bg-white shadow-inner'>
                                <div className='space-y-1 p-2'>
                                    {loadingStudents ? (
                                        <div className='flex h-[180px] flex-col items-center justify-center text-muted-foreground'>
                                            <Loader2 className='mb-2 h-6 w-6 animate-spin' />
                                            <span className='text-xs'>Loading students...</span>
                                        </div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <div
                                                key={student.amsT_Id}
                                                className='flex items-center space-x-2 rounded-sm p-1.5 transition-colors hover:bg-slate-50'>
                                                <Controller
                                                    control={control}
                                                    name='selectedStudents'
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            id={`student-${student.amsT_Id}`}
                                                            checked={field.value?.includes(String(student.amsT_Id))}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                const updated = checked
                                                                    ? [...current, String(student.amsT_Id)]
                                                                    : current.filter((id) => id !== String(student.amsT_Id));
                                                                field.onChange(updated);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Label
                                                    htmlFor={`student-${student.amsT_Id}`}
                                                    className='flex-1 cursor-pointer py-1 font-medium text-xs'>
                                                    {student.studentName || student.studentname}
                                                </Label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='flex h-[180px] items-center justify-center text-muted-foreground text-xs italic'>
                                            {watchSection ? 'No students found' : 'Select Section to load students'}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <Controller
                                control={control}
                                name='selectedStudents'
                                render={({ fieldState }) =>
                                    fieldState.error ? <FormError className='text-xs'>{fieldState.error.message}</FormError> : <></>
                                }
                            />
                        </div>
                    </div>

                    <div className='flex items-center justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='min-w-[120px] bg-indigo-600 shadow-sm hover:bg-indigo-700'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='min-w-[120px] border-none bg-orange-500 shadow-sm hover:bg-orange-600'>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        {/* <Button
                            type="button"
                            variant="outline"
                            className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm"
                            disabled={isSubmitting}
                            onClick={() => {
                                // For now, trigger same as report or just show toast
                                handleSubmit(onSubmit)();
                            }}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            PRINT
                        </Button> */}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
