'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGatePass } from '@/hooks/visitors-management/transactions/useGatePass';
import { type GatePassSchema, gatePassSchema } from '@/schemas/visitors-management/transactions';
import type { GatePassTransactionData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface GatePassFormProps {
    onSuccess: () => void;
    initialData?: GatePassTransactionData | null;
}

export default function GatePassForm({ onSuccess, initialData }: GatePassFormProps) {
    const { saveGatePass, data: loadedData } = useGatePass();
    const students = loadedData?.studentlist || [];
    const employees = loadedData?.emplist || [];

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

    // Reset hidden fields when type changes for cleaner data
    useEffect(() => {
        if (!initialData) {
            // Only auto-clear when not in edit mode init (or user switched type manually)
            if (gatePassType === 'student') {
                form.setValue('employeeId', undefined);
            } else {
                form.setValue('studentId', undefined);
            }
        }
    }, [gatePassType, form, initialData]);

    const onSubmit = async (data: GatePassSchema) => {
        try {
            await saveGatePass(data);
            form.reset({
                gatePassType: data.gatePassType, // Keep the selected type
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
                {/* Type Selection */}
                <FormField
                    control={form.control}
                    name='gatePassType'
                    render={({ field }) => (
                        <FormItem className='space-y-3'>
                            <FormLabel>Gate Pass Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                    className='flex flex-row space-x-4'>
                                    <FormItem className='flex items-center space-x-3 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='student' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Student Gate Pass</FormLabel>
                                    </FormItem>
                                    <FormItem className='flex items-center space-x-3 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='employee' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Employee Gate Pass</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {gatePassType === 'student' && (
                        <FormField
                            control={form.control}
                            name='studentId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Student <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Student' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {students.map((stu) => (
                                                <SelectItem key={stu.amsT_Id} value={stu.amsT_Id.toString()}>
                                                    {stu.amsT_FirstName}: {stu.amsT_AdmNo}: {stu.asmcL_ClassName}: {stu.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {gatePassType === 'employee' && (
                        <FormField
                            control={form.control}
                            name='employeeId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Employee <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Employee' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()}>
                                                    {emp.hrmE_EmployeeFirstName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name='remarks'
                        render={({ field }) => (
                            <FormItem className='col-span-1 md:col-span-2'>
                                <FormLabel>
                                    Remarks <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter Remarks' maxLength={250} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' className='w-40'>
                        {initialData ? 'Update' : 'Generate'} Gate Pass
                    </Button>
                    <Button type='button' variant='outline' className='w-40' onClick={() => onSuccess()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
