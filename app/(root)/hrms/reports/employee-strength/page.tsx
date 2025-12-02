'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectItem } from '@/components/ui/select';
import { useMasterDepartments, useMasterDesignations, useMasterGroupTypes } from '@/hooks/hrms/useReports';
import { cn } from '@/lib/utils';
import { type EmployeeStrengthReportFormFields, EmployeeStrengthReportSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof EmployeeStrengthReportSchema>;

const mockApiResponse = {
    employeeSalaryslipDetails: [
        {
            hrmD_Id: 80,
            hrmD_Group: 'Non Teaching',
            hrmD_Designation: 'Assistant',
            hrmD_DepartmentName: 'Teaching',
            hrmd_ToNoEmployee: 22
        },
        {
            hrmD_Id: 84,
            hrmD_Group: 'Non Teaching',
            hrmD_Designation: 'Assistant',
            hrmD_DepartmentName: 'Non Teaching',
            hrmd_ToNoEmployee: 31
        },
        {
            hrmD_Id: 517,
            hrmD_Group: 'Non Teaching',
            hrmD_Designation: 'Watch Man',
            hrmD_DepartmentName: 'STATE',
            hrmd_ToNoEmployee: 30
        },
        {
            hrmD_Id: 518,
            hrmD_Group: 'Teaching',
            hrmD_Designation: 'OFFICE STAFF',
            hrmD_DepartmentName: 'ICSE',
            hrmd_ToNoEmployee: 28
        },
        {
            hrmD_Id: 519,
            hrmD_Group: 'Teaching',
            hrmD_Designation: 'Ashwini',
            hrmD_DepartmentName: 'assistant',
            hrmd_ToNoEmployee: 26
        }
    ],
    total: 137,
    TotalWorkingEmployees: 127,
    TotalLeftEmployees: 10
};

export default function DepartmentSalaryReportPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedRangeTypes, setSelectedRangeTypes] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const { data: masterGroupTypes, isLoading: masterGroupTypesLoading, isError: masterGroupTypesError } = useMasterGroupTypes();
    const { data: masterDepartments, isLoading: masterDepartmentsLoading, isError: masterDepartmentsError } = useMasterDepartments();

    const { data: masterDesignations, isLoading: masterDesignationsLoading, isError: masterDesignationsError } = useMasterDesignations();

    const groupTypeOptions =
        masterGroupTypes?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const DeaparmentsOptions =
        masterDepartments?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const DesignationOptions =
        masterDesignations?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(EmployeeStrengthReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            all_employees: false,
            department_wise: false,
            left_employee: false
        },
        mode: 'onChange'
    });

    const onSearch = async (data: EmployeeStrengthReportFormFields) => {
        setIsSearching(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success('Report generated successfully!');
            setReportData(mockApiResponse.employeeSalaryslipDetails);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        reset({
            groupType: [],
            department: [],
            designation: []
        });
        setReportData([]);
        setSelectedRangeTypes([]);
        setFromDate('');
        setToDate('');
        toast.info('Form has been reset');
    };

    // Calculate totals
    const calculateTotals = () => {
        if (reportData.length === 0) return null;

        const totals = {
            basicPay: 0,
            hra: 0,
            da: 0,
            otherAllowance: 0,
            grossEarning: 0,
            pfCont: 0,
            esicCont: 0,
            pt: 0,
            tds: 0,
            grossDeduction: 0,
            netSalary: 0
        };

        totals.netSalary = totals.grossEarning - totals.grossDeduction;

        return totals;
    };

    const totals = calculateTotals();

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='ESI Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            <div className='space-y-2'>
                                <Label htmlFor='group-type' className='font-medium text-sm text-white-900'>
                                    Group Type: <span className='text-red-500'>*</span>
                                </Label>
                                {masterGroupTypesLoading ? (
                                    <div className='h-10 w-full animate-pulse rounded-md bg-white-200' />
                                ) : groupTypeOptions.length === 0 ? (
                                    <div className='text-sm text-white-500'>No group types available</div>
                                ) : masterGroupTypesError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading data
                                    </SelectItem>
                                ) : (
                                    <>
                                        <Controller
                                            name='groupType'
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={groupTypeOptions}
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Select Group Types'
                                                    className='w-full'
                                                    maxHeight={240}
                                                />
                                            )}
                                        />
                                        {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                                    </>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='department' className='font-medium text-sm text-white-900'>
                                    Department: <span className='text-red-500'>*</span>
                                </Label>
                                {masterDepartmentsLoading ? (
                                    <div className='h-10 w-full animate-pulse rounded-md bg-white-200' />
                                ) : DeaparmentsOptions.length === 0 ? (
                                    <div className='text-sm text-white-500'>No departments available</div>
                                ) : masterDepartmentsError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading data
                                    </SelectItem>
                                ) : (
                                    <>
                                        <Controller
                                            name='department'
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={DeaparmentsOptions}
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Select Departments'
                                                    className='w-full'
                                                    maxHeight={240}
                                                />
                                            )}
                                        />
                                        {errors.department && <FormError>{errors.department.message}</FormError>}
                                    </>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='designation' className='font-medium text-sm text-white-900'>
                                    Designation: <span className='text-red-500'>*</span>
                                </Label>
                                {masterDesignationsLoading ? (
                                    <div className='h-10 w-full animate-pulse rounded-md bg-white-200' />
                                ) : DesignationOptions.length === 0 ? (
                                    <div className='text-sm text-white-500'>No designations available</div>
                                ) : masterDesignationsError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading data
                                    </SelectItem>
                                ) : (
                                    <>
                                        <Controller
                                            name='designation'
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={DesignationOptions}
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Select Designations'
                                                    className='w-full'
                                                    maxHeight={240}
                                                />
                                            )}
                                        />
                                        {errors.designation && <FormError>{errors.designation.message}</FormError>}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className='flex items-center justify-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={selectedRangeTypes.includes('all Employees')}
                                    onCheckedChange={(checked) => {
                                        setSelectedRangeTypes((prev) =>
                                            checked ? [...prev, 'all Employees'] : prev.filter((x) => x !== 'all Employees')
                                        );
                                        if (checked) {
                                            setFromDate('');
                                            setToDate('');
                                        }
                                    }}
                                />
                                <Label htmlFor='all_employees' className='cursor-pointer font-normal'>
                                    All Employees
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={selectedRangeTypes.includes('Department wise')}
                                    onCheckedChange={(checked) =>
                                        setSelectedRangeTypes((prev) =>
                                            checked ? [...prev, 'Department wise'] : prev.filter((x) => x !== 'Department wise')
                                        )
                                    }
                                />
                                <Label htmlFor='department_wise' className='cursor-pointer font-normal'>
                                    Department wise
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={selectedRangeTypes.includes('Left Employee')}
                                    onCheckedChange={(checked) =>
                                        setSelectedRangeTypes((prev) =>
                                            checked ? [...prev, 'Left Employee'] : prev.filter((x) => x !== 'Left Employee')
                                        )
                                    }
                                />
                                <Label htmlFor='left_employee' className='cursor-pointer font-normal'>
                                    Left Employee
                                </Label>
                            </div>
                        </div>
                        {!selectedRangeTypes.includes('all Employees') && (
                            <div className='flex justify-center gap-2 '>
                                <div>
                                    <Label className='font-medium text-sm text-white-900'>
                                        From Date<span className='text-red-600'>*</span>
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !fromDate && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {fromDate ? format(new Date(fromDate), 'dd/MM/yyyy') : 'From date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={fromDate ? new Date(fromDate) : undefined}
                                                onSelect={(date: Date | undefined) => setFromDate(date?.toISOString() ?? '')}
                                                captionLayout='dropdown'
                                                fromYear={2000}
                                                toYear={2050}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label className='font-medium text-sm text-white-900'>
                                        To Date<span className='text-red-600'>*</span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !toDate && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {toDate ? format(new Date(toDate), 'dd/MM/yyyy') : 'To date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={toDate ? new Date(toDate) : undefined}
                                                onSelect={(date: Date | undefined) => setToDate(date?.toISOString() ?? '')}
                                                captionLayout='dropdown'
                                                fromYear={2000}
                                                toYear={2050}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSearching || isSubmitting}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                Reset
                            </Button>
                            <Button
                                type='button'
                                onClick={handleSubmit(onSearch)}
                                disabled={isSearching || isSubmitting}
                                className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                {isSearching ? (
                                    <>
                                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                        Searching...
                                    </>
                                ) : (
                                    <div className='flex items-center'>
                                        <Search className='mr-2 h-4 w-4' />
                                        Search
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {reportData.length > 0 && (
                    <CollapsibleSection
                        title='ESI Report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='mt-2 space-x-4'>
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr className='border-white-300 border-b-2 bg-white-100'>
                                            <th className='border border-white-300 px-3 py-3 text-center font-semibold text-sm' rowSpan={2}>
                                                S.No
                                            </th>
                                            <th className='border border-white-300 px-3 py-3 text-center font-semibold text-sm' rowSpan={2}>
                                                Group Type
                                            </th>
                                            <th className='border border-white-300 px-3 py-3 text-center font-semibold text-sm' rowSpan={2}>
                                                Department
                                            </th>
                                            {selectedRangeTypes.includes('all Employees') ? (
                                                <th
                                                    className='border border-white-300 px-3 py-3 text-center font-semibold text-sm'
                                                    rowSpan={2}>
                                                    Designation
                                                </th>
                                            ) : null}
                                            <th className='border border-white-300 px-3 py-3 text-center font-semibold text-sm' rowSpan={2}>
                                                Total No. of Emp
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((dept, index) => (
                                            <tr key={index} className='hover:bg-white-50'>
                                                <td className='border border-white-300 px-3 py-2 text-center text-sm'>{index + 1}</td>
                                                <td className='border border-white-300 px-3 py-2 text-left font-medium text-sm'>
                                                    {dept.hrmD_Group}
                                                </td>
                                                {selectedRangeTypes.includes('all Employees') ? (
                                                    <td className='border border-white-300 px-3 py-2 text-left font-medium text-sm'>
                                                        {dept.hrmD_Designation}
                                                    </td>
                                                ) : null}
                                                <td className='border border-white-300 px-3 py-2 text-left font-medium text-sm'>
                                                    {dept.hrmD_DepartmentName}
                                                </td>
                                                <td className='border border-white-300 px-3 py-2 text-left font-medium text-sm'>
                                                    {dept.hrmd_ToNoEmployee}
                                                </td>
                                            </tr>
                                        ))}
                                        {((selectedRangeTypes.includes('Left Employee') ||
                                            !selectedRangeTypes.includes('Department wise')) &&
                                            !selectedRangeTypes.includes('Left Employee')) ||
                                        (selectedRangeTypes.includes('all Employees') && selectedRangeTypes.includes('Left Employee')) ||
                                        selectedRangeTypes.includes('Department wise') ? (
                                            <>
                                                <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                                    <td
                                                        colSpan={selectedRangeTypes.includes('all Employees') ? 4 : 3}
                                                        className='border border-white-300 px-4 py-3 text-left text-sm'>
                                                        Total
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                        {mockApiResponse.total}
                                                    </td>
                                                </tr>
                                                <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                                    <td
                                                        colSpan={selectedRangeTypes.includes('all Employees') ? 4 : 3}
                                                        className='border border-white-300 px-4 py-3 text-left text-sm'>
                                                        Total No. of Working Employees
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                        {mockApiResponse.TotalWorkingEmployees}
                                                    </td>
                                                </tr>
                                                <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                                    <td
                                                        colSpan={selectedRangeTypes.includes('all Employees') ? 4 : 3}
                                                        className='border border-white-300 px-4 py-3 text-left text-sm'>
                                                        Total No. of Left Employees
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                        {mockApiResponse.TotalLeftEmployees}
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                                <td
                                                    colSpan={selectedRangeTypes.includes('all Employees') ? 4 : 3}
                                                    className='border border-white-300 px-4 py-3 text-left text-sm'>
                                                    Total
                                                </td>
                                                <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                    {mockApiResponse.total}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
