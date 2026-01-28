'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bmiCalculationSchema, IBMICalculation } from '@/types/sports/transactions/bmi-calculation';
import { useBMICalculation } from '@/hooks/sports/useBMICalculation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePicker } from '../../../../../../components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';

interface BMICalculationFormProps {
    onSuccess?: () => void;
    selectedRow?: IBMICalculation | null;
}

export default function BMICalculationForm({ onSuccess, selectedRow }: BMICalculationFormProps) {
    const { data: loadGridData, sections, students, save } = useBMICalculation();
    const [showStudentTable, setShowStudentTable] = useState(false);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<IBMICalculation>({
        resolver: zodResolver(bmiCalculationSchema),
        defaultValues: {
            asmaY_Id: selectedRow?.asmaY_Id || 0,
            asmcL_Id: selectedRow?.asmcL_Id || 0,
            asmS_Id: selectedRow?.asmS_Id || 0,
            spccshW_AsOnDate: selectedRow?.spccshW_AsOnDate ? new Date(selectedRow.spccshW_AsOnDate) : new Date(),
            student: []
        } as any
    });

    const { fields, replace, update } = useFieldArray({
        control,
        name: 'student'
    });

    const watchedAsmaY_Id = watch('asmaY_Id');
    const watchedAsmcL_Id = watch('asmcL_Id');
    const watchedAsmS_Id = watch('asmS_Id');

    // Fetch sections when Year or Class changes
    useEffect(() => {
        if (watchedAsmaY_Id && watchedAsmcL_Id) {
            sections.mutate({ ASMAY_Id: watchedAsmaY_Id, ASMCL_Id: watchedAsmcL_Id });
        }
    }, [watchedAsmaY_Id, watchedAsmcL_Id]);

    const handleGetStudents = async () => {
        const asonDate = watch('spccshW_AsOnDate');
        if (!watchedAsmaY_Id || !watchedAsmcL_Id || !watchedAsmS_Id || !asonDate) {
            toast.error('Please select all filters');
            return;
        }

        const result = await students.mutateAsync({
            ASMAY_Id: watchedAsmaY_Id,
            ASMCL_Id: watchedAsmcL_Id,
            ASMS_Id: watchedAsmS_Id,
            SPCCSHW_AsOnDate: asonDate
        });

        if (result.studentList) {
            replace(result.studentList as any);
            setShowStudentTable(true);
        }
    };

    const calculateBMI = (weight: number, height: number) => {
        if (!weight || !height) return { bmi: 0, remark: '' };
        const heightMeters = height / 100;
        const bmi = parseFloat((weight / (heightMeters * heightMeters)).toFixed(2));

        let remark = '';
        if (bmi <= 18.5) remark = 'Underweight';
        else if (bmi >= 18.5 && bmi <= 24.9) remark = 'Normal';
        else if (bmi >= 25 && bmi <= 29.9) remark = 'Overweight';
        else if (bmi >= 30.0 && bmi <= 39.5) remark = 'Obese';
        else if (bmi > 39.5) remark = 'Extreme Obese';

        return { bmi, remark };
    };

    const handleWeightHeightChange = (index: number, type: 'weight' | 'height', value: string) => {
        const numValue = parseFloat(value) || 0;
        const student = fields[index];
        const newWeight = type === 'weight' ? numValue : (Number(student.spccshW_Weight) || 0);
        const newHeight = type === 'height' ? numValue : (Number(student.spccshW_Height) || 0);

        const { bmi, remark } = calculateBMI(newWeight, newHeight);

        update(index, {
            ...student,
            [type === 'weight' ? 'spccshW_Weight' : 'spccshW_Height']: numValue,
            spccshW_BMI: bmi,
            spccshW_BMIRemark: remark
        } as any);
    };

    const onSubmit = async (values: any) => {
        const selectedStudents = values.student.filter((s: any) => s.selected);
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const dataToSave = {
            ...values,
            student: selectedStudents,
            SPCCSHW_Id: selectedRow?.spccshW_Id || 0
        };

        const result = await save.mutateAsync(dataToSave);
        if (result.success || result.returnVal === 'saved' || result.returnVal === 'update') {
            toast.success('Record saved successfully');
            onSuccess?.();
        } else {
            toast.error(result.message || 'Failed to save record');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                {/* Academic Year */}
                <div className='flex flex-col gap-2'>
                    <Label>Academic Year</Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadGridData?.academicYear?.map((y: any) => (
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
                    <Label>Class Name</Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadGridData?.classlist?.map((c: any) => (
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
                    <Label>Section Name</Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.data?.sectionList?.map((s: any) => (
                                        <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <span className='text-xs text-destructive'>{errors.asmS_Id.message}</span>}
                </div>

                {/* Date */}
                <div className='flex flex-col gap-2'>
                    <Label>Date</Label>
                    <Controller
                        name='spccshW_AsOnDate'
                        control={control}
                        render={({ field }) => (
                            <DatePicker date={field.value as Date} setDate={field.onChange} />
                        )}
                    />
                    {errors.spccshW_AsOnDate && <span className='text-xs text-destructive'>{errors.spccshW_AsOnDate.message as string}</span>}
                </div>
            </div>

            <div className='flex justify-center'>
                <Button type='button' onClick={handleGetStudents} disabled={students.isPending}>
                    {students.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                    Student Details
                </Button>
            </div>

            {showStudentTable && fields.length > 0 && (
                <div className='mt-8 overflow-x-auto rounded-md border'>
                    <table className='w-full text-sm'>
                        <thead className='bg-muted/50'>
                            <tr className='border-b'>
                                <th className='p-2'><Checkbox onCheckedChange={(checked) => fields.forEach((_, i) => update(i, { ...fields[i], selected: !!checked }))} /></th>
                                <th className='p-2 text-left'>SL.No</th>
                                <th className='p-2 text-left'>Student Name</th>
                                <th className='p-2 text-left'>Adm No.</th>
                                <th className='p-2 text-left'>Weight(kg)</th>
                                <th className='p-2 text-left'>Height(cm)</th>
                                <th className='p-2 text-left'>BMI</th>
                                <th className='p-2 text-left'>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id} className='border-b hover:bg-muted/20'>
                                    <td className='p-2 text-center'>
                                        <Controller
                                            name={`student.${index}.selected`}
                                            control={control}
                                            render={({ field: checkField }) => (
                                                <Checkbox checked={!!checkField.value} onCheckedChange={checkField.onChange} />
                                            )}
                                        />
                                    </td>
                                    <td className='p-2'>{index + 1}</td>
                                    <td className='p-2'>{field.studentName}</td>
                                    <td className='p-2'>{field.amsT_AdmNo}</td>
                                    <td className='p-2'>
                                        <Input
                                            type='number'
                                            step='0.1'
                                            className='h-8 w-20'
                                            value={field.spccshW_Weight}
                                            onChange={(e) => handleWeightHeightChange(index, 'weight', e.target.value)}
                                        />
                                    </td>
                                    <td className='p-2'>
                                        <Input
                                            type='number'
                                            step='0.1'
                                            className='h-8 w-20'
                                            value={field.spccshW_Height}
                                            onChange={(e) => handleWeightHeightChange(index, 'height', e.target.value)}
                                        />
                                    </td>
                                    <td className='p-2'>{field.spccshW_BMI}</td>
                                    <td className='p-2'>{field.spccshW_BMIRemark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showStudentTable && (
                <div className='flex justify-center gap-4'>
                    <Button type='submit' className='w-32' disabled={save.isPending}>
                        {save.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Save'}
                    </Button>
                    <Button type='button' variant='outline' className='w-32' onClick={() => { setShowStudentTable(false); reset(); }}>
                        Cancel
                    </Button>
                </div>
            )}
        </form>
    );
}
