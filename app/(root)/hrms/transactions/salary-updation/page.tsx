'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useSalaryUpdationList } from '@/hooks/hrms/useTransactions';
import type { SalaryUpdationItem } from '@/types/hrms/salary-updation';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { salaryUpdationColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SalaryUpdationPage(_props: { searchParams: SearchParams }) {
    const { listQuery } = useSalaryUpdationList({ roleId: HRMS_MI_ID });

    return (
        <FormProvider<SalaryUpdationItem>>
            <SalaryUpdationPageContent 
                response={listQuery.data} 
                isLoading={listQuery.isLoading} 
                error={listQuery.error} 
            />
        </FormProvider>
    );
}

function SalaryUpdationPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const [hasSearched, setHasSearched] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<SalaryUpdationItem[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    
    const groupTypes = response?.groupTypedropdownlist || [];
    const departments = response?.departmentdropdownlist || [];
    const designations = response?.designationdropdownlist || [];
    const employees = response?.employeedropdown || [];
    const earningHeads = response?.earningdeductiondetails || [];
    const monthOptions = response?.monthdropdown || [];
    const leaveYearOptions = response?.leaveyeardropdown || [];

    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            groupType: 'All',
            department: 'All',
            designation: 'All',
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            earningDeduction: 'All Earning & Deduction',
            amountType: 'All',
            heads: 'All'
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');

    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees, hasSearched]);

    const filterEmployees = () => {
        let filtered = employees;

        if (watchedGroupType && watchedGroupType !== 'All') {
            const groupType = groupTypes.find((g: any) => g.HRMGT_EmployeeGroupType === watchedGroupType);
            if (groupType) {
                filtered = filtered.filter((emp: any) => emp.hrmgT_Id === groupType.HRMGT_Id);
            }
        }

        if (watchedDepartment && watchedDepartment !== 'All') {
            const department = departments.find((d: any) => d.HRMD_DepartmentName === watchedDepartment);
            if (department) {
                filtered = filtered.filter((emp: any) => emp.hrmD_Id === department.HRMD_Id);
            }
        }

        if (watchedDesignation && watchedDesignation !== 'All') {
            const designation = designations.find((d: any) => d.HRMDES_DesignationName === watchedDesignation);
            if (designation) {
                filtered = filtered.filter((emp: any) => emp.hrmdeS_Id === designation.HRMDES_Id);
            }
        }

        setFilteredEmployees(filtered);
    };

    const onSubmit = async (data: any) => {
        try {
            filterEmployees();
            setHasSearched(true);
            toast.success('Search completed successfully');
        } catch (error: any) {
            toast.error(error.message || 'Search failed');
        }
    };

    const handleUpdate = () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }
        toast.info('Update functionality to be implemented');
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='SALARY UPDATION'
                    description='Search and filter employee salary records'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-lg'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-6'>
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Group Type</Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Group Type' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Group Types</SelectItem>
                                                {groupTypes.map((groupType: any) => (
                                                    <SelectItem key={groupType.HRMGT_Id} value={groupType.HRMGT_EmployeeGroupType}>
                                                        {groupType.HRMGT_EmployeeGroupType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Department</Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Department' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Departments</SelectItem>
                                                {departments.map((department: any) => (
                                                    <SelectItem key={department.HRMD_Id} value={department.HRMD_DepartmentName}>
                                                        {department.HRMD_DepartmentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Designation</Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Designation' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Designations</SelectItem>
                                                {designations.map((designation: any) => (
                                                    <SelectItem key={designation.HRMDES_Id} value={designation.HRMDES_DesignationName}>
                                                        {designation.HRMDES_DesignationName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Month</Label>
                                <Controller
                                    name='month'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map((month: any) => (
                                                    <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Id.toString()}>
                                                        {month.IVRM_Month_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Year</Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveYearOptions.map((year: any) => (
                                                    <SelectItem key={year.HRMLY_Id} value={year.HRMLY_Id.toString()}>
                                                        {year.HRMLY_LeaveYear}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Head</Label>
                                <Controller
                                    name='heads'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Head' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Heads</SelectItem>
                                                {earningHeads.map((head: any) => (
                                                    <SelectItem key={head.hrmeD_Id} value={head.hrmeD_Name}>
                                                        {head.hrmeD_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='flex gap-2 pt-4'>
                            <Button type='submit' className='w-fit transition-all duration-200 hover:scale-105'>
                                <RefreshCw className='mr-2 h-4 w-4' />
                                SEARCH
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-fit transition-all duration-200 hover:scale-105'
                                onClick={() => {
                                    reset();
                                    setHasSearched(false);
                                    setSelectedEmployees([]);
                                }}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {hasSearched && (
                    <CollapsibleSection
                        title='EMPLOYEE SALARY UPDATION'
                        description={`View and update employee salary records (${selectedEmployees.length} selected)`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4'>
                            <GenericDataTable<SalaryUpdationItem>
                                data={filteredEmployees}
                                totalItems={filteredEmployees.length}
                                columns={salaryUpdationColumns}
                                isLoading={isLoading}
                                error={error}
                                showViewOptions={true}
                                columnPinning={{ right: ['actions'] }}
                                loadingMessage='Loading salary records...'
                                noDataTitle='No Records Found'
                                noDataDescription='No salary records match your search criteria'
                                errorTitle='Error Loading Records'
                            />

                            <div className='flex justify-end gap-2'>
                                <Button 
                                    onClick={handleUpdate}
                                    className='w-fit transition-all duration-200 hover:scale-105'>
                                    <RefreshCw className='mr-2 h-4 w-4' />
                                    UPDATE
                                </Button>
                                <Button 
                                    variant='outline' 
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    onClick={() => {
                                        reset();
                                        setHasSearched(false);
                                        setSelectedEmployees([]);
                                    }}>
                                    <X className='mr-2 h-4 w-4' />
                                    CANCEL
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}

                {!hasSearched && (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>
                                Please use the search form above to find employee salary records
                            </div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
