'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentEligibleReportSchema, IStudentEligibleReport } from '@/types/sports/reports/student-eligible-report';
import { useStudentEligibleReport } from '@/hooks/sports/useStudentEligibleReport';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { FileText, X, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ReportFormProps {
    onReport: (data: any) => void;
    onReset: () => void;
    onPrint: () => void;
    onExcel: () => void;
    hasData: boolean;
}

export default function ReportForm({ onReport, onReset, onPrint, onExcel, hasData }: ReportFormProps) {
    const { data: loadGridData, getClasses, getSections, getStudents, showDetails } = useStudentEligibleReport();
    const [showStudentList, setShowStudentList] = useState(false);

    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<IStudentEligibleReport>({
        resolver: zodResolver(studentEligibleReportSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: []
        }
    });

    const { fields, replace, update } = useFieldArray({
        control,
        name: 'studentList'
    });

    const watchedAsmaY_Id = watch('asmaY_Id');
    const watchedAsmcL_Id = watch('asmcL_Id');
    const watchedAsmS_Id = watch('asmS_Id');

    // Cascade: Year -> Class
    useEffect(() => {
        if (watchedAsmaY_Id) {
            getClasses.mutate({ ASMAY_Id: watchedAsmaY_Id });
        }
    }, [watchedAsmaY_Id]);

    // Cascade: Class -> Section
    useEffect(() => {
        if (watchedAsmaY_Id && watchedAsmcL_Id) {
            getSections.mutate({ ASMAY_Id: watchedAsmaY_Id, ASMCL_Id: watchedAsmcL_Id });
        }
    }, [watchedAsmaY_Id, watchedAsmcL_Id]);

    // Cascade: Section -> Students
    useEffect(() => {
        if (watchedAsmaY_Id && watchedAsmcL_Id && watchedAsmS_Id) {
            getStudents.mutateAsync({
                ASMAY_Id: watchedAsmaY_Id,
                ASMCL_Id: watchedAsmcL_Id,
                ASMS_Id: watchedAsmS_Id
            }).then(res => {
                if (res.studentList1) {
                    replace(res.studentList1.map((s: any) => ({ ...s, Selected: false })));
                    setShowStudentList(true);
                }
            });
        }
    }, [watchedAsmaY_Id, watchedAsmcL_Id, watchedAsmS_Id]);

    const onSubmit = async (values: IStudentEligibleReport) => {
        const selectedStudents = values.studentList?.filter(s => s.Selected) || [];
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const res = await showDetails.mutateAsync({
            ...values,
            StudentList: selectedStudents
        });

        if (res.data) {
            onReport(res);
        } else {
            toast.error('No records found');
        }
    };

    const handleCancel = () => {
        reset();
        setShowStudentList(false);
        onReset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='flex flex-col gap-2'>
                    <Label>Academic Year <span className='text-destructive'>*</span></Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadGridData?.yearlist?.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-xs text-destructive'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Class */}
                <div className='flex flex-col gap-2'>
                    <Label>Class <span className='text-destructive'>*</span></Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {getClasses.data?.classList?.map((c: any) => (
                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <span className='text-xs text-destructive'>{errors.asmcL_Id.message}</span>}
                </div>

                {/* Section */}
                <div className='flex flex-col gap-2'>
                    <Label>Section <span className='text-destructive'>*</span></Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {getSections.data?.sectionList?.map((s: any) => (
                                        <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <span className='text-xs text-destructive'>{errors.asmS_Id.message}</span>}
                </div>

                {/* Students Multiselect */}
                {showStudentList && (
                    <div className='flex flex-col gap-2'>
                        <Label>Student <span className='text-destructive'>*</span></Label>
                        <div className='h-32 overflow-y-auto rounded-md border p-2 space-y-1'>
                            <div className='flex items-center space-x-2 pb-1 border-b mb-1'>
                                <Checkbox
                                    onCheckedChange={(checked) => fields.forEach((_, i) => update(i, { ...fields[i], Selected: !!checked } as any))}
                                />
                                <span className='text-xs font-medium'>Select All</span>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className='flex items-center space-x-2'>
                                    <Controller
                                        name={`studentList.${index}.Selected`}
                                        control={control}
                                        render={({ field: checkField }) => (
                                            <Checkbox checked={!!checkField.value} onCheckedChange={checkField.onChange} />
                                        )}
                                    />
                                    <span className='text-sm'>{field.studentname}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className='flex justify-center gap-4'>
                <Button type='submit' className='bg-primary' disabled={showDetails.isPending}>
                    {showDetails.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                    Report
                </Button>
                <Button type='button' variant='destructive' onClick={handleCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
                <Button type='button' className='bg-blue-600 hover:bg-blue-700' onClick={onPrint} disabled={!hasData}>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
                <Button type='button' className='bg-green-600 hover:bg-green-700' onClick={onExcel} disabled={!hasData}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Excel
                </Button>
            </div>
        </form>
    );
}
