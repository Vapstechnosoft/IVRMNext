'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useGenerateSalary } from '@/hooks/hrms/useSalaryCalculation';
import { salaryCalculationSchema } from '@/schemas/hrms/salary-calculation-schemas';
import type { SalaryCalculationOnloadResponse } from '@/types/hrms/salary-calculation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof salaryCalculationSchema.generate>;

interface SearchFormProps {
    onloadData: SalaryCalculationOnloadResponse | undefined;
    isLoading: boolean;
    className?: string;
}

export default function SearchForm({ onloadData, isLoading, className = '' }: SearchFormProps) {
    const { mutate: generateSalary, isPending } = useGenerateSalary();
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(salaryCalculationSchema.generate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: HRMS_MI_ID,
            HRES_Year: '',
            HRES_Month: '',
            employeeIdList: [],
            LogInUserId: 5
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            generateSalary(data, {
                onSuccess: (response) => {
                    if (response?.success) {
                        toast.success(response.message || 'Salary calculated successfully');
                        reset();
                        setSelectedEmployeeIds([]);
                    } else {
                        toast.error(response?.message || 'Failed to calculate salary');
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'An error occurred');
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
        setSelectedEmployeeIds([]);
    };

    const leaveYears = onloadData?.leaveyeardropdown || [];
    const months = onloadData?.monthdropdown || [];
    const employees = onloadData?.employeedropdown || [];

    const employeeOptions = employees.map((emp) => ({
        value: emp.HRME_Id.toString(),
        label: `${emp.HRME_EmployeeCode} - ${emp.HRME_EmployeeFirstName} ${
            emp.HRME_EmployeeMiddleName || ''
        } ${emp.HRME_EmployeeLastName || ''}`.trim()
    }));

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Year */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRES_Year'>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRES_Year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='HRES_Year' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveYears.map((year) => (
                                                <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                                    {year.HRMLY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRES_Year && <FormError>{errors.HRES_Year.message}</FormError>}
                        </div>

                        {/* Month */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRES_Month'>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRES_Month'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='HRES_Month' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name}>
                                                    {month.IVRM_Month_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRES_Month && <FormError>{errors.HRES_Month.message}</FormError>}
                        </div>
                    </div>

                    {/* Employees Multi-Select */}
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='employeeIdList'>
                            Select Employees <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='employeeIdList'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={employeeOptions}
                                    defaultValue={selectedEmployeeIds.map((id) => id.toString())}
                                    onValueChange={(values) => {
                                        const ids = values.map((v) => Number.parseInt(v));
                                        setSelectedEmployeeIds(ids);
                                        field.onChange(ids);
                                    }}
                                    placeholder='Select employees'
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                        {errors.employeeIdList && <FormError>{errors.employeeIdList.message}</FormError>}
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isPending || isLoading}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending || isLoading}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Calculating...'>
                        <div className='flex items-center'>
                            <Calculator className='mr-2 h-4 w-4' />
                            Calculate Salary
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
