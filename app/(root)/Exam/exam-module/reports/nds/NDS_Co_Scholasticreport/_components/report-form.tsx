'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ndsCoScholasticReportSchema, type NDSCoScholasticReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getExamAcademicYearDropdown,
    getGmvpsProgressCardIXReport,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/nds-co-scholastic-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCcw, FileText, Printer, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, academicYear: string) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
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
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSelectedStudents = useWatch({ control, name: 'selectedStudents' }) || [];

    // Load Initial Data
    useEffect(() => {
        (async () => {
            try {
                const response = await getExamAcademicYearDropdown();
                if (response?.success && Array.isArray(response.data)) {
                    setYears(response.data);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load initial details');
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
                    const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                    if (response?.success && Array.isArray(response.data)) {
                        setClasses(response.data);
                    }
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
                    const response = await getSectionsDropDownByAcademicYearandClasslist(
                        Number(watchClass),
                        Number(watchYear)
                    );
                    if (response?.success && Array.isArray(response.data)) {
                        setSections(response.data);
                    }
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
                    if (response?.success && Array.isArray(response.data)) {
                        setStudents(response.data);
                        // Auto-select all students
                        setValue('selectedStudents', response.data.map((s: any) => String(s.amsT_Id)));
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
            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                Temp_AmstIds: data.selectedStudents.map((id) => ({ amsT_Id: Number(id) })),
            };

            const response = await getGmvpsProgressCardIXReport(payload);
            const academicYear = years.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';

            if (response?.success && response.data) {
                onReportGenerated(response.data, academicYear);
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'Failed to generate report');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        reset();
        setSearchQuery('');
        onReset();
    };

    const filteredStudents = students.filter(s =>
        (s.studentName || s.studentname)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setValue('selectedStudents', students.map(s => String(s.amsT_Id)));
        } else {
            setValue('selectedStudents', []);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="bg-primary/5 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    NDS_CO_SCHOLASTIC REPORT
                </h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Dropdowns */}
                        <div className="space-y-4">
                            {/* Academic Year */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Academic Year <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMAY_Id"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
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
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Class <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMCL_Id"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchYear || loadingClasses}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {loadingClasses ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                    ) : (
                                                        <SelectValue placeholder="--Select--" />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
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
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Section <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMS_Id"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchClass || loadingSections}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {loadingSections ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                    ) : (
                                                        <SelectValue placeholder="--Select--" />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((sec) => (
                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                            {sec.asmC_SectionName}
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

                        {/* Right Column: Student Selection */}
                        <div className="space-y-3 border rounded-lg p-4 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="selectAll"
                                        checked={students.length > 0 && watchSelectedStudents.length === students.length}
                                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        disabled={students.length === 0}
                                    />
                                    <Label htmlFor="selectAll" className="text-sm font-semibold cursor-pointer">
                                        Student : <span className="text-destructive">*</span>
                                    </Label>
                                </div>
                                <div className="relative w-48">
                                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="search here..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-8 text-xs"
                                    />
                                </div>
                            </div>

                            <ScrollArea className="h-[200px] w-full border rounded-md bg-white">
                                <div className="p-2 space-y-1">
                                    {loadingStudents ? (
                                        <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                            <span className="text-xs">Loading students...</span>
                                        </div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <div key={student.amsT_Id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-sm transition-colors">
                                                <Controller
                                                    control={control}
                                                    name="selectedStudents"
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
                                                    className="text-xs font-medium cursor-pointer flex-1 py-1"
                                                >
                                                    {student.studentName || student.studentname}
                                                </Label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-[180px] text-muted-foreground text-xs italic">
                                            {watchSection ? "No students found" : "Select Section to load students"}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <Controller
                                control={control}
                                name="selectedStudents"
                                render={({ fieldState }) => (
                                    fieldState.error ? <FormError className="text-xs">{fieldState.error.message}</FormError> : <></>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-4 w-4" />
                            )}
                            REPORT
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className="min-w-[120px] bg-orange-500 hover:bg-orange-600 border-none"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            CANCEL
                        </Button>

                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
