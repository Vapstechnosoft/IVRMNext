'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type PromotionDetailsReportSchema, promotionDetailsReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClasses,
    getDetails,
    getReportDetails,
    getSections,
    getTermsAndStudents
} from '@/server/exam/exam-module/reports/promotion-details-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

interface ReportFormProps {
    onReportGenerated: (data: any, isSuperAverage: boolean) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const methods = useForm<PromotionDetailsReportSchema>({
        resolver: zodResolver(promotionDetailsReportSchema),
        defaultValues: {
            superAverage: false,
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSuperAverage = useWatch({ control, name: 'superAverage' });
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
        getDetails().then((res) => {
            setYears(res.acdlist);
            setLoading(false);
        });
    }, []);

    // Load Classes
    useEffect(() => {
        if (watchYear) {
            getClasses(watchYear).then((res) => setClasses(res.ctlist));
            setValue('ASMCL_Id', '');
        }
    }, [watchYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (watchClass) {
            getSections(watchClass).then((res) => setSections(res.seclist));
            setValue('ASMS_Id', '');
        }
    }, [watchClass, setValue]);

    // Load Terms & Students
    useEffect(() => {
        if (watchSection) {
            getTermsAndStudents(watchSection).then((res) => {
                setTerms(res.termlist);
                setStudents(res.studentlist);
            });
            setValue('selectedStudents', []);
        }
    }, [watchSection, setValue]);

    // Super Average Logic
    useEffect(() => {
        if (watchSuperAverage) {
            setValue('EMPG_GroupName', undefined); // Clear term selection
        }
    }, [watchSuperAverage, setValue]);

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

    const onSubmit = async (data: PromotionDetailsReportSchema) => {
        try {
            const result = await getReportDetails(data);
            onReportGenerated(result, data.superAverage);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleClear = () => {
        reset({
            superAverage: false,
            selectedStudents: []
        });
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
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='rounded-lg border p-4 shadow-sm'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-4'>
                                {/* Year */}
                                <div className='space-y-2'>
                                    <Label>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='ASMAY_Id'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Academic Year' />
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
                                <div className='space-y-2'>
                                    <Label>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='ASMCL_Id'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Class' />
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
                                <div className='space-y-2'>
                                    <Label>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='ASMS_Id'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Section' />
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

                                {/* Term */}
                                <div className='space-y-2'>
                                    <Label>
                                        Term <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='EMPG_GroupName'
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ''}
                                                    disabled={watchSuperAverage}>
                                                    <SelectTrigger className={watchSuperAverage ? 'bg-gray-100' : ''}>
                                                        <SelectValue placeholder='Select Term' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {terms.map((term, idx) => (
                                                            <SelectItem key={idx} value={term.empG_GroupName}>
                                                                {term.empG_GroupName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </>
                                        )}
                                    />
                                </div>

                                {/* Super Average */}
                                <div className='flex items-center space-x-2 pt-4'>
                                    <Controller
                                        control={control}
                                        name='superAverage'
                                        render={({ field }) => (
                                            <Checkbox id='superAvg' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='superAvg'>Super Average</Label>
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
                                            checked={
                                                filteredStudents.length > 0 && watchSelectedStudents?.length === filteredStudents.length
                                            }
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <Label htmlFor='selectAll' className='font-bold'>
                                            Select All
                                        </Label>
                                        <Input
                                            placeholder='Search...'
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className='ml-auto w-1/2'
                                        />
                                    </div>
                                    <ScrollArea className='h-[250px]'>
                                        {filteredStudents.map((student) => (
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
                                                                    : field.onChange(current.filter((val) => val !== id));
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Label className='w-full cursor-pointer font-normal text-sm'>{student.studentname}</Label>
                                            </div>
                                        ))}
                                        {filteredStudents.length === 0 && (
                                            <p className='py-4 text-center text-gray-500'>No students found</p>
                                        )}
                                    </ScrollArea>
                                    {methods.formState.errors.selectedStudents && (
                                        <FormError>{methods.formState.errors.selectedStudents.message}</FormError>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='mt-8 flex justify-center gap-4'>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleClear} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
