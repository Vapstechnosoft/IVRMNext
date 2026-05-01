'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { ndsCoScholasticReportSchema, type NDSCoScholasticReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getExamAcademicYearDropdown,
    getExamReportCard,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/nds-co-scholastic-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCcw, FileText } from 'lucide-react';
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
                    const studentList = response?.success && Array.isArray(response.data) ? response.data : [];
                    setStudents(studentList);

                    // Auto-select all students
                    if (Array.isArray(studentList)) {
                        setValue('selectedStudents', studentList.map((s: any) => String(s.amsT_Id)));
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
                asmaY_Id: Number(data.ASMAY_Id),
                asmcL_Id: Number(data.ASMCL_Id),
                asmS_Id: Number(data.ASMS_Id),
                temp_AmstIds: data.selectedStudents.map((id) => ({ amsT_Id: Number(id) })),
                // Add any other required fields for I to VIII if needed
            };

            const response = await getExamReportCard(payload);
            const academicYear = years.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';

            onReportGenerated(response, academicYear);
            toast.success('Report generated successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        reset();
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
        <div className="w-full bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="bg-primary/5 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    1 to 8 Report Card
                </h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                <SelectValue placeholder="--Select Year--" />
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
                                                    <SelectValue placeholder="--Select Class--" />
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
                                                    <SelectValue placeholder="--Select Section--" />
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

                    {/* Student Multi-Select */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Student <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="selectedStudents"
                            render={({ field, fieldState }) => (
                                <>
                                    <MultiSelect
                                        options={students.map((s) => ({
                                            label: s.studentName || s.studentname,
                                            value: String(s.amsT_Id)
                                        }))}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={loadingStudents ? "Loading students..." : "Select Students"}
                                        disabled={!watchSection || loadingStudents}
                                        className="w-full"
                                    />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[120px] shadow-sm hover:shadow-md transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-4 w-4" />
                            )}
                            Report
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className="min-w-[120px]"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
