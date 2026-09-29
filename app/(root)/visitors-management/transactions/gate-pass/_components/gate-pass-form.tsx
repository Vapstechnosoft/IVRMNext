'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGatePass } from '@/hooks/visitors-management/transactions/useGatePass';
import { type GatePassSchema, gatePassSchema } from '@/schemas/visitors-management/transactions';
import type { GatePassTransactionData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, GraduationCap, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface GatePassFormProps {
    onSuccess: () => void;
    initialData?: GatePassTransactionData | null;
    onCancel?: () => void;
}

export default function GatePassForm({ onSuccess, initialData, onCancel }: GatePassFormProps) {
    const { saveGatePass, data: loadedData, isSaving } = useGatePass();
    const students = loadedData?.studentlist || [];
    const employees = loadedData?.emplist || [];

    const [studentSearch, _setStudentSearch] = useState('');
    const [employeeSearch, _setEmployeeSearch] = useState('');

    const form = useForm<GatePassSchema>({
        resolver: zodResolver(gatePassSchema),
        defaultValues: {
            gatePassType: 'student',
            studentId: undefined,
            employeeId: undefined,
            remarks: ''
        }
    });

    const gatePassType = form.watch('gatePassType');

    useEffect(() => {
        if (initialData) {
            form.reset({
                gatePassType: initialData.type,
                studentId: initialData.studentId,
                employeeId: initialData.employeeId,
                remarks: initialData.remarks
            });
        } else {
            form.reset({
                gatePassType: 'student',
                studentId: undefined,
                employeeId: undefined,
                remarks: ''
            });
        }
    }, [initialData, form]);

    useEffect(() => {
        if (!initialData) {
            if (gatePassType === 'student') {
                form.setValue('employeeId', undefined);
            } else {
                form.setValue('studentId', undefined);
            }
        }
    }, [gatePassType, form, initialData]);

    const _filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return students;
        const q = studentSearch.toLowerCase();
        return students.filter(
            (s) =>
                (s.amsT_FirstName || '').toLowerCase().includes(q) ||
                (s.amsT_AdmNo || '').toLowerCase().includes(q) ||
                (s.asmcL_ClassName || '').toLowerCase().includes(q) ||
                (s.asmC_SectionName || '').toLowerCase().includes(q)
        );
    }, [students, studentSearch]);

    const _filteredEmployees = useMemo(() => {
        if (!employeeSearch.trim()) return employees;
        const q = employeeSearch.toLowerCase();
        return employees.filter((e) => (e.hrmE_EmployeeFirstName || '').toLowerCase().includes(q));
    }, [employees, employeeSearch]);

    const onSubmit = async (data: GatePassSchema) => {
        try {
            await saveGatePass(data);
            form.reset({
                gatePassType: data.gatePassType,
                studentId: undefined,
                employeeId: undefined,
                remarks: ''
            });
            onSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* 1. Gate Pass Type Selection matching Template */}
                <div className='max-w-lg rounded-lg border bg-muted/10 p-3'>
                    <Label className='mb-2 block font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Gate Pass Type <span className='text-destructive'>*</span>
                    </Label>
                    <FormField
                        control={form.control}
                        name='gatePassType'
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6 pt-1'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='student' id='gp-std' />
                                    <Label htmlFor='gp-std' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                        <GraduationCap className='h-4 w-4 text-primary' />
                                        Student Gate Pass
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='employee' id='gp-emp' />
                                    <Label htmlFor='gp-emp' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                        <Briefcase className='h-4 w-4 text-primary' />
                                        Employee Gate Pass
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                {/* 2. Selection Inputs Grid */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {gatePassType === 'student' && (
                        <FormField
                            control={form.control}
                            name='studentId'
                            render={({ field }) => (
                                <FormItem className='space-y-1.5'>
                                    <FormLabel className='font-semibold text-xs'>
                                        Student <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger className='h-9 text-xs'>
                                                <SelectValue placeholder='Select Student' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='max-h-64'>
                                            {students.length === 0 ? (
                                                <div className='p-2 text-center text-muted-foreground text-xs'>No students found</div>
                                            ) : (
                                                students.map((stu) => (
                                                    <SelectItem key={stu.amsT_Id} value={stu.amsT_Id.toString()} className='text-xs'>
                                                        {stu.amsT_FirstName} ({stu.amsT_AdmNo}) - {stu.asmcL_ClassName}{' '}
                                                        {stu.asmC_SectionName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className='text-xs' />
                                </FormItem>
                            )}
                        />
                    )}

                    {gatePassType === 'employee' && (
                        <FormField
                            control={form.control}
                            name='employeeId'
                            render={({ field }) => (
                                <FormItem className='space-y-1.5'>
                                    <FormLabel className='font-semibold text-xs'>
                                        Employee <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger className='h-9 text-xs'>
                                                <SelectValue placeholder='Select Employee' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='max-h-64'>
                                            {employees.length === 0 ? (
                                                <div className='p-2 text-center text-muted-foreground text-xs'>No employees found</div>
                                            ) : (
                                                employees.map((emp) => (
                                                    <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()} className='text-xs'>
                                                        {emp.hrmE_EmployeeFirstName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className='text-xs' />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name='remarks'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5 sm:col-span-2'>
                                <FormLabel className='font-semibold text-xs'>
                                    Remarks <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter Remarks' maxLength={250} rows={2} className='text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />
                </div>

                {/* 3. Action Buttons matching Screenshot 1 */}
                <div className='flex flex-wrap items-center gap-3 border-t pt-4 sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            form.reset();
                            if (onCancel) onCancel();
                        }}
                        disabled={isSaving}
                        className='h-9 rounded-2xl border-gray-300 px-5 text-xs transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSaving}
                        className='h-9 rounded-2xl bg-[#EE7854] px-5 text-white text-xs shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#d96643]'>
                        <Send className='mr-1.5 h-3.5 w-3.5' />
                        {isSaving ? 'Processing...' : initialData ? 'Update Gate Pass' : 'Generate Gate Pass'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
