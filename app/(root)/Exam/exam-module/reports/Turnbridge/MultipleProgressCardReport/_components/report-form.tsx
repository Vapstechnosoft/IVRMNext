'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getMultipleProgressCardReport } from '@/server/exam/exam-module/reports/Turnbridge/MultipleProgressCardReportController';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
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
    showAttendance: z.boolean().default(true)
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

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedExams: [],
            showAttendance: true
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // Load Classes when Academic Year changes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                if (response?.success) {
                    setClasses(response.data || []);
                }
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // Load Sections when Class changes
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const response = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                if (response?.success) {
                    setSections(response.data || []);
                }
                setValue('ASMS_Id', '');
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // Load Exams when Section changes
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const response = await getExamsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                if (response?.success) {
                    setExams(response.data || []);
                }
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: FormSchema) => {
        try {
            const selectedExamsDetails = exams.filter((e) => data.selectedExams.includes(String(e.emE_Id)));

            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                examlist: selectedExamsDetails.map((e) => ({ EME_Id: e.emE_Id, EME_ExamName: e.emE_ExamName }))
            };

            const response = await getMultipleProgressCardReport(payload);

            const academicYearName = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year;
            const classname = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName;
            const sectionname = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName;

            const extraParams = {
                ...data,
                academicYearName,
                classname,
                sectionname
            };

            const resData = response?.data || response;
            const hasStudents = Array.isArray(resData?.getstudentdetails) && resData.getstudentdetails.length > 0;

            onReportGenerated(resData, extraParams);

            if (hasStudents) {
                toast.success('Report generated successfully');
            } else {
                toast.error('No report data found for the selected criteria');
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
        onReset();
    };

    return (
        <div className='mx-auto w-full max-w-6xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-6 border-b pb-4 text-center'>
                <h3 className='font-bold text-gray-900 text-xl uppercase'>PROGRESS CARD REPORT</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Dropdowns */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
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
                                        <Label>
                                            Class: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingClasses ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                )}
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
                                        <Label>
                                            Section: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingSections ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    sections.map((sec) => (
                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Multi-Select Exams */}
                        <div className='space-y-2'>
                            <Label className='font-medium text-sm'>
                                Exam: <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='selectedExams'
                                render={({ field, fieldState }) => (
                                    <CustomMultiSelectBox
                                        options={exams.map((e) => ({
                                            label: e.emE_ExamName,
                                            value: e.emE_Id.toString()
                                        }))}
                                        onChange={(vals) => setValue('selectedExams', vals, { shouldValidate: true })}
                                        value={field.value ?? []}
                                        placeholder={loadingExams ? 'Loading exams...' : 'Select Exams'}
                                        height='200px'
                                        isSearchRequired
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Options */}
                        <div className='flex flex-col justify-start space-y-4'>
                            <div className='flex items-center space-x-2 pt-6'>
                                <Controller
                                    control={control}
                                    name='showAttendance'
                                    render={({ field }) => (
                                        <div className='flex items-center gap-2'>
                                            <Checkbox id='showAttendance' checked={field.value} onCheckedChange={field.onChange} />
                                            <label
                                                htmlFor='showAttendance'
                                                className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                                Show Attendance ?
                                            </label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-center gap-4 border-t pt-8'>
                        <Button type='submit' disabled={isSubmitting} size='lg' className='bg-blue-600 px-8 text-white hover:bg-blue-700'>
                            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            REPORT
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClear}
                            size='lg'
                            className='bg-red-500 px-8 text-white hover:bg-red-600'>
                            CANCEL
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
