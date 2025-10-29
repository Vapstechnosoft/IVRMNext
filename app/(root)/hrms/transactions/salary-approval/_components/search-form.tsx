'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { salaryApprovalSchema } from '@/schemas/hrms/salary-approval-schemas';
import type { SalaryApprovalOnloadResponse } from '@/types/hrms/salary-approval';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof salaryApprovalSchema.search>;

interface SearchFormProps {
    onloadData: SalaryApprovalOnloadResponse | undefined;
    isLoading: boolean;
    onSearch: (values: FormFields) => void;
    isPending: boolean;
    className?: string;
}

export default function SearchForm({ onloadData, isLoading, onSearch, isPending, className = '' }: SearchFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(salaryApprovalSchema.search),
        mode: 'onChange',
        defaultValues: {
            HRES_Year: '',
            HRES_Month: '',
            groupTypeIdList: [],
            hrmD_IdList: [],
            hrmdeS_IdList: []
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        onSearch(data);
    };

    const handleReset = () => {
        reset();
    };

    const leaveYears = onloadData?.leaveyeardropdown || [];
    const months = [
        { value: 'January', label: 'January' },
        { value: 'February', label: 'February' },
        { value: 'March', label: 'March' },
        { value: 'April', label: 'April' },
        { value: 'May', label: 'May' },
        { value: 'June', label: 'June' },
        { value: 'July', label: 'July' },
        { value: 'August', label: 'August' },
        { value: 'September', label: 'September' },
        { value: 'October', label: 'October' },
        { value: 'November', label: 'November' },
        { value: 'December', label: 'December' }
    ];

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRES_Month && <FormError>{errors.HRES_Month.message}</FormError>}
                        </div>
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
                        loadingText='Searching...'>
                        <div className='flex items-center'>
                            <Search className='mr-2 h-4 w-4' />
                            Search Employees
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
