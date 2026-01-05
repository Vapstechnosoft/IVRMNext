'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ExamLoginPrivilegesSchema, examLoginPrivilegesReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getCategories,
    getClasses,
    getDetails,
    getEmployees,
    getReportDetails,
    getSections
} from '@/server/exam/exam-module/reports/exam-login-privileges-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

interface ReportFormProps {
    onReportGenerated: (data: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const [years, setYears] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const methods = useForm<ExamLoginPrivilegesSchema>({
        resolver: zodResolver(examLoginPrivilegesReportSchema),
        defaultValues: {
            type: 'all',
            employeeChecked: false,
            selectAllEmployees: false
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchCategory = useWatch({ control, name: 'EMCA_Id' });
    const watchType = useWatch({ control, name: 'type' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchEmployeeChecked = useWatch({ control, name: 'employeeChecked' });

    // Initial Data
    useEffect(() => {
        getDetails().then((res) => {
            setYears(res.acdlist);
            setLoading(false);
        });
    }, []);

    // Load Categories on Year Change
    useEffect(() => {
        if (watchYear) {
            getCategories(watchYear).then((res) => {
                setCategories(res.catlist);
            });
            setValue('EMCA_Id', '');
            setValue('ASMCL_Id', undefined);
            setValue('ASMS_Id', undefined);
        }
    }, [watchYear, setValue]);

    // Load Classes on Category Change
    useEffect(() => {
        if (watchCategory) {
            getClasses(watchCategory).then((res) => {
                setClasses(res.ctlist);
            });
            setValue('ASMCL_Id', undefined);
        }
    }, [watchCategory, setValue]);

    // Load Sections on Class Change
    useEffect(() => {
        if (watchClass) {
            getSections(watchClass).then((res) => {
                setSections(res.seclist);
            });
            setValue('ASMS_Id', undefined);
        }
    }, [watchClass, setValue]);

    // Load Employees on Section Change
    useEffect(() => {
        if (watchSection) {
            getEmployees(watchSection).then((res) => {
                setEmployees(res.emplist);
            });
            setValue('HRME_Id', undefined);
        }
    }, [watchSection, setValue]);

    const onSubmit = async (data: ExamLoginPrivilegesSchema) => {
        try {
            const result = await getReportDetails(data);
            onReportGenerated(result.datareport);
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    const handleClear = () => {
        reset({
            type: 'all',
            employeeChecked: false,
            selectAllEmployees: false
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
                        {/* Type Selection */}
                        <div className='mb-4 flex justify-center rounded-md bg-gray-50 p-3'>
                            <Controller
                                control={control}
                                name='type'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                        <div className='flex items-center space-x-2 space-y-0'>
                                            <RadioGroupItem value='all' id='all' />
                                            <Label htmlFor='all' className='cursor-pointer font-normal'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2 space-y-0'>
                                            <RadioGroupItem value='individual' id='individual' />
                                            <Label htmlFor='individual' className='cursor-pointer font-normal'>
                                                Individual
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='mt-4 grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Academic Year */}
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

                            {/* Category */}
                            <div className='space-y-2'>
                                <Label>
                                    Category <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='EMCA_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.emcA_Id} value={String(cat.emcA_Id)}>
                                                            {cat.emcA_CategoryName}
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
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={watchType !== 'individual'}>
                                                <SelectTrigger className={watchType !== 'individual' ? 'bg-gray-100' : ''}>
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
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={watchType !== 'individual'}>
                                                <SelectTrigger className={watchType !== 'individual' ? 'bg-gray-100' : ''}>
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
                        </div>

                        <div className='mt-4 grid grid-cols-1 gap-6 text-sm md:grid-cols-2'>
                            <Controller
                                control={control}
                                name='selectAllEmployees'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2 rounded border p-3'>
                                        <Checkbox id='selectAll' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='selectAll'>Select All Employees</Label>
                                    </div>
                                )}
                            />
                        </div>

                        <div className='mt-4 grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='flex items-center space-x-2 rounded border p-3'>
                                <Controller
                                    control={control}
                                    name='employeeChecked'
                                    render={({ field }) => (
                                        <Checkbox id='empCheck' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='empCheck'>Filter by Individual Employee</Label>
                            </div>

                            <div className='space-y-2'>
                                <Label>Employee Name</Label>
                                <Controller
                                    control={control}
                                    name='HRME_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchEmployeeChecked}>
                                                <SelectTrigger className={!watchEmployeeChecked ? 'bg-gray-100' : ''}>
                                                    <SelectValue placeholder='Select Employee' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.hrmE_Id} value={String(emp.hrmE_Id)}>
                                                            {emp.hrmE_EmployeeFirstName}
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

                        <div className='mt-8 flex justify-center gap-4'>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                            </Button>
                            <Button type='button' variant='outline' onClick={handleClear} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
