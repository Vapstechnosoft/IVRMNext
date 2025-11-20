'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, X } from 'lucide-react';
import { type Control, Controller } from 'react-hook-form';

// Report filters
export interface ReportFilters {
    groupType: string[]; // multi-select of Group Types (store ids as strings)
    department: string[]; // multi-select of Departments (store ids as strings)
    designation: string[]; // multi-select of Designations (store ids as strings)
    month: string;
    year: string;
}

interface CumulativeSalaryReportFiltersProps {
    control: Control<ReportFilters>;
    groupTypes: Array<{ HRMGT_Id: number; HRMGT_EmployeeGroupType: string }>;
    departments: Array<{ HRMD_Id: number; HRMD_DepartmentName: string }>;
    designations: Array<{ HRMDES_Id: number; HRMDES_DesignationName: string }>;
    months: Array<{ IVRM_Month_Id: number; IVRM_Month_Name: string }>;
    years: Array<{ HRMLY_Id: number; HRMLY_LeaveYear: string }>;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    onCancel: () => void;
}

export function CumulativeSalaryReportFilters({
    control,
    groupTypes,
    departments,
    designations,
    months,
    years,
    onSubmit,
    onCancel
}: CumulativeSalaryReportFiltersProps) {
    return (
        <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg' headerClassName=''>
            <form
                onSubmit={(e) => {
                    console.log('🔵 [CUMULATIVE SALARY] Form onSubmit triggered', {
                        event: e,
                        type: e.type,
                        target: e.target,
                        currentTarget: e.currentTarget,
                        formData: new FormData(e.currentTarget as HTMLFormElement),
                        timestamp: new Date().toISOString()
                    });
                    console.log('🔵 [CUMULATIVE SALARY] Calling onSubmit handler (react-hook-form handleSubmit)...');
                    // Call the onSubmit handler (which is handleSubmit from react-hook-form)
                    // It will handle preventDefault internally
                    const result = onSubmit(e);
                    if (result instanceof Promise) {
                        result.catch((error) => {
                            console.error('🔴 [CUMULATIVE SALARY] Error in onSubmit:', error);
                        });
                    }
                }}
                className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                    {/* Group Type (MultiSelect) */}
                    <div className='space-y-3'>
                        <Label className='font-semibold'>Group Type</Label>
                        <Controller
                            name='groupType'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={groupTypes.map((g) => ({
                                        label: g.HRMGT_EmployeeGroupType,
                                        value: String(g.HRMGT_Id)
                                    }))}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    placeholder='Select Group Types'
                                    className='w-full'
                                    maxHeight={240}
                                />
                            )}
                        />
                    </div>

                    {/* Department (MultiSelect) */}
                    <div className='space-y-3'>
                        <Label className='font-semibold'>Department</Label>
                        <Controller
                            name='department'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={departments.map((d) => ({
                                        label: d.HRMD_DepartmentName,
                                        value: String(d.HRMD_Id)
                                    }))}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    placeholder='Select Departments'
                                    className='w-full'
                                    maxHeight={240}
                                />
                            )}
                        />
                    </div>

                    {/* Designation (MultiSelect) */}
                    <div className='space-y-3'>
                        <Label className='font-semibold'>Designation</Label>
                        <Controller
                            name='designation'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={designations.map((d) => ({
                                        label: d.HRMDES_DesignationName,
                                        value: String(d.HRMDES_Id)
                                    }))}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    placeholder='Select Designations'
                                    className='w-full'
                                    maxHeight={240}
                                />
                            )}
                        />
                    </div>

                    {/* Month */}
                    <div className='space-y-3'>
                        <Label className='font-semibold'>Month</Label>
                        <Controller
                            name='month'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Month' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name.trim()}>
                                                {month.IVRM_Month_Name.trim()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Year */}
                    <div className='space-y-3'>
                        <Label className='font-semibold'>Year</Label>
                        <Controller
                            name='year'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                                {year.HRMLY_LeaveYear}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>

                {/* Search and Cancel Buttons */}
                <div className='flex gap-2 pt-4'>
                    <Button
                        type='submit'
                        className='w-fit transition-all duration-200 hover:scale-105'
                        onClick={(e) => {
                            console.log('🔵 [CUMULATIVE SALARY] SEARCH button clicked', {
                                event: e,
                                type: e.type,
                                target: e.target,
                                currentTarget: e.currentTarget,
                                buttonType: (e.target as HTMLButtonElement)?.type,
                                form: e.currentTarget?.form,
                                timestamp: new Date().toISOString()
                            });
                        }}>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        SEARCH
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                        CANCEL
                    </Button>
                </div>
            </form>
        </CollapsibleSection>
    );
}
