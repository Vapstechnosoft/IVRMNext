'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type ReportCardXSchema, reportCardXSchema } from '@/schemas/exam/exam-module/reports';
import { getClasses, getReportDetails, getSections, getStudents } from '@/server/exam/exam-module/reports/Report_Card_X';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

const GROUPS = [
    { value: '(Sc)', label: '(Sc)' },
    { value: '(Com)', label: '(Com)' },
    { value: '(Sc Bio)', label: '(Sc Bio)' },
    { value: '(Sc Comp)', label: '(Sc Comp)' },
    { value: '(Com Math)', label: '(Com Math)' },
    { value: '(Humanities)', label: '(Humanities)' }
];

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);

    const methods = useForm<ReportCardXSchema>({
        resolver: zodResolver(reportCardXSchema),
        defaultValues: {
            superAverage: true,
            printLogo: true,
            selectedStudents: [],
            exmname: '',
            brngroup: ''
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSelectedStudents = useWatch({ control, name: 'selectedStudents' });

    // Filter students
    useEffect(() => {
        if (studentSearch.trim() === '') {
            setFilteredStudents(students);
        } else {
            setFilteredStudents(students.filter((s) => s.studentname.toLowerCase().includes(studentSearch.toLowerCase())));
        }
    }, [studentSearch, students]);

    // Initial Data
    useEffect(() => {
        setLoading(false);
    }, []);

    // Load Classes
    useEffect(() => {
        if (watchYear) {
            setLoadingClasses(true);
            getClasses(watchYear)
                .then((res) => {
                    if (res.ctlist && res.ctlist.length > 0) {
                        setClasses(res.ctlist);
                    } else {
                        setClasses([]);
                        toast.info('No classes found');
                    }
                    setLoadingClasses(false);
                })
                .catch((err) => {
                    toast.error('Failed to load classes');
                    setLoadingClasses(false);
                });
            setValue('ASMCL_Id', '');
        }
    }, [watchYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (watchClass) {
            setLoadingSections(true);
            getSections(watchClass)
                .then((res) => {
                    if (res.seclist && res.seclist.length > 0) {
                        setSections(res.seclist);
                    } else {
                        setSections([]);
                        toast.info('No sections found');
                    }
                    setLoadingSections(false);
                })
                .catch((err) => {
                    toast.error('Failed to load sections');
                    setLoadingSections(false);
                });
            setValue('ASMS_Id', '');
        }
    }, [watchClass, setValue]);

    // Load Students
    useEffect(() => {
        if (watchSection) {
            getStudents(watchSection)
                .then((res) => {
                    if (res.studentlist && res.studentlist.length > 0) {
                        setStudents(res.studentlist);
                    } else {
                        setStudents([]);
                        toast.info('No students found');
                    }
                })
                .catch((err) => {
                    toast.error('Failed to load students');
                });
            setValue('selectedStudents', []);
        }
    }, [watchSection, setValue]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setValue(
                'selectedStudents',
                filteredStudents.map((s) => String(s.amsT_Id))
            );
        } else {
            setValue('selectedStudents', []);
        }
    };

    const onSubmit = async (data: ReportCardXSchema) => {
        try {
            const result = await getReportDetails(data);
            const enrichedParams = {
                ...data,
                ASMAY_Year: academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year,
                ASMCL_Id_Name: classes.find((c) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName,
                ASMS_Id_Name: sections.find((s) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName
            };
            onReportGenerated(result, enrichedParams);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        reset({
            superAverage: true,
            printLogo: true,
            selectedStudents: [],
            exmname: '',
            brngroup: '',
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: ''
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    if (loading)
        return (
            <div className='flex justify-center p-4'>
                <Loader2 className='animate-spin' />
            </div>
        );

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Report Card X</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    key={field.value}
                                                    onValueChange={field.onChange}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading ? (
                                                            <SelectItem value='0' disabled>
                                                                Academic Years are loading...
                                                            </SelectItem>
                                                        ) : academicYears.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Academic Years found
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
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className='space-y-2'>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingClasses ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : classes.length === 0 ? (
                                                        <SelectItem value='empty' disabled>
                                                            No Classes found
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
                                        </>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSections ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : sections.length === 0 ? (
                                                        <SelectItem value='empty' disabled>
                                                            No Sections found
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
                                        </>
                                    )}
                                />
                            </div>

                            {/* Group */}
                            <div className='space-y-2'>
                                <Label>
                                    Group <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='brngroup'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Group' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GROUPS.map((grp) => (
                                                        <SelectItem key={grp.value} value={grp.value}>
                                                            {grp.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Exam Name */}
                            <div className='space-y-2'>
                                <Label>
                                    Exam Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='exmname'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input {...field} placeholder='Enter Exam Name' />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            <div className='flex space-x-6 pt-4'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='printLogo'
                                        render={({ field }) => (
                                            <Checkbox id='printLogo' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='printLogo' className='cursor-pointer font-normal'>
                                        Print Logo
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='superAverage'
                                        render={({ field }) => (
                                            <Checkbox id='superAvg' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='superAvg' className='cursor-pointer font-normal'>
                                        Super Average
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Student Multi-select */}
                        <div className='space-y-4'>
                            <Label>
                                Student <span className='text-red-500'>*</span>
                            </Label>
                            <div className='rounded-md border p-4'>
                                <div className='mb-4 flex items-center space-x-2'>
                                    <Checkbox
                                        id='selectAll'
                                        checked={filteredStudents.length > 0 && watchSelectedStudents?.length === filteredStudents.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor='selectAll' className='cursor-pointer font-bold'>
                                        Select All
                                    </Label>
                                    <Input
                                        placeholder='Search...'
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className='ml-auto w-1/2'
                                    />
                                </div>
                                <ScrollArea className='h-[300px]'>
                                    {filteredStudents.length === 0 ? (
                                        <div className='py-4 text-center text-gray-500'>No students found</div>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <div
                                                key={student.amsT_Id}
                                                className='flex flex-row items-center space-x-3 space-y-0 rounded p-2 hover:bg-gray-50'>
                                                <Controller
                                                    control={control}
                                                    name='selectedStudents'
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            checked={field.value?.includes(String(student.amsT_Id))}
                                                            onCheckedChange={(checked) => {
                                                                const id = String(student.amsT_Id);
                                                                const current = field.value || [];
                                                                return checked
                                                                    ? field.onChange([...current, id])
                                                                    : field.onChange(current.filter((val: string) => val !== id));
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Label className='w-full cursor-pointer font-normal text-sm'>{student.studentname}</Label>
                                            </div>
                                        ))
                                    )}
                                </ScrollArea>
                                {methods.formState.errors.selectedStudents && (
                                    <FormError>{methods.formState.errors.selectedStudents.message}</FormError>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='w-fit min-w-[100px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='w-fit min-w-[100px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
