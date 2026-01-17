'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterDepartments, useMasterDesignations, useMasterGroupTypes, useMasterMonths, useMasterYears } from '@/hooks/hrms/useReports';
import { type DepartmentSalaryReportFormFields, departmentSalaryReportSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof departmentSalaryReportSchema>;

const mockApiResponse = {
    employeeSalaryslipDetails: [
        {
            hrmD_Id: 80,
            hrmD_DepartmentName: 'Teaching',
            earningresult: [
                { hrmeD_Name: 'BASIC PAY', hresD_Amount: 428658.0 },
                { hrmeD_Name: 'HRA', hresD_Amount: 85731.0 },
                { hrmeD_Name: 'DA', hresD_Amount: 171463.0 },
                { hrmeD_Name: 'OTHER ALLOWANCE', hresD_Amount: 138489.0 }
            ],
            deductionresult: [
                { hrmeD_Name: 'PF CONT', hresD_Amount: 41869.0 },
                { hrmeD_Name: 'ESIC CONT', hresD_Amount: 139.0 },
                { hrmeD_Name: 'PT', hresD_Amount: 1200.0 },
                { hrmeD_Name: 'TDS', hresD_Amount: 13500.0 }
            ],
            grossEarning: 824341.0,
            grossDeduction: 56708.0
        },
        {
            hrmD_Id: 84,
            hrmD_DepartmentName: 'Non Teaching',
            earningresult: [
                { hrmeD_Name: 'BASIC PAY', hresD_Amount: 69242.0 },
                { hrmeD_Name: 'HRA', hresD_Amount: 13848.0 },
                { hrmeD_Name: 'DA', hresD_Amount: 27697.0 },
                { hrmeD_Name: 'OTHER ALLOWANCE', hresD_Amount: 22371.0 }
            ],
            deductionresult: [
                { hrmeD_Name: 'PF CONT', hresD_Amount: 3329.0 },
                { hrmeD_Name: 'ESIC CONT', hresD_Amount: 222.0 },
                { hrmeD_Name: 'PT', hresD_Amount: 200.0 },
                { hrmeD_Name: 'TDS', hresD_Amount: 8000.0 }
            ],
            grossEarning: 133158.0,
            grossDeduction: 11751.0
        },
        {
            hrmD_Id: 517,
            hrmD_DepartmentName: 'STATE',
            earningresult: [
                { hrmeD_Name: 'BASIC PAY', hresD_Amount: 0.0 },
                { hrmeD_Name: 'HRA', hresD_Amount: 0.0 },
                { hrmeD_Name: 'DA', hresD_Amount: 0.0 },
                { hrmeD_Name: 'OTHER ALLOWANCE', hresD_Amount: 0.0 }
            ],
            deductionresult: [
                { hrmeD_Name: 'PF CONT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'ESIC CONT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'PT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'TDS', hresD_Amount: 0.0 }
            ],
            grossEarning: 0.0,
            grossDeduction: 0.0
        },
        {
            hrmD_Id: 518,
            hrmD_DepartmentName: 'ICSE',
            earningresult: [
                { hrmeD_Name: 'BASIC PAY', hresD_Amount: 0.0 },
                { hrmeD_Name: 'HRA', hresD_Amount: 0.0 },
                { hrmeD_Name: 'DA', hresD_Amount: 0.0 },
                { hrmeD_Name: 'OTHER ALLOWANCE', hresD_Amount: 0.0 }
            ],
            deductionresult: [
                { hrmeD_Name: 'PF CONT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'ESIC CONT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'PT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'TDS', hresD_Amount: 0.0 }
            ],
            grossEarning: 0.0,
            grossDeduction: 0.0
        },
        {
            hrmD_Id: 519,
            hrmD_DepartmentName: 'assistant',
            earningresult: [
                { hrmeD_Name: 'BASIC PAY', hresD_Amount: 0.0 },
                { hrmeD_Name: 'HRA', hresD_Amount: 0.0 },
                { hrmeD_Name: 'DA', hresD_Amount: 0.0 },
                { hrmeD_Name: 'OTHER ALLOWANCE', hresD_Amount: 0.0 }
            ],
            deductionresult: [
                { hrmeD_Name: 'PF CONT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'ESIC CONT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'PT', hresD_Amount: 0.0 },
                { hrmeD_Name: 'TDS', hresD_Amount: 0.0 }
            ],
            grossEarning: 0.0,
            grossDeduction: 0.0
        }
    ]
};

export default function DepartmentSalaryReportPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);

    const { data: masterGroupTypes, isLoading: masterGroupTypesLoading, isError: masterGroupTypesError } = useMasterGroupTypes();

    const { data: masterDepartments, isLoading: masterDepartmentsLoading, isError: masterDepartmentsError } = useMasterDepartments();

    const { data: masterDesignations, isLoading: masterDesignationsLoading, isError: masterDesignationsError } = useMasterDesignations();

    const { data: masterMonths, isLoading: masterMonthsLoading, isError: masterMonthsError } = useMasterMonths();

    const { data: masterYears, isLoading: masterYearsLoading, isError: masterYearsError } = useMasterYears();

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

    const MonthsOptions =
        masterMonths?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const YearsOptions =
        masterYears?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(departmentSalaryReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: ''
        },
        mode: 'onChange'
    });

    const onSearch = async (data: DepartmentSalaryReportFormFields) => {
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
            designation: [],
            month: '',
            year: ''
        });
        setReportData([]);
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

        reportData.forEach((dept) => {
            dept.earningresult.forEach((earning: any) => {
                if (earning.hrmeD_Name === 'BASIC PAY') totals.basicPay += earning.hresD_Amount;
                if (earning.hrmeD_Name === 'HRA') totals.hra += earning.hresD_Amount;
                if (earning.hrmeD_Name === 'DA') totals.da += earning.hresD_Amount;
                if (earning.hrmeD_Name === 'OTHER ALLOWANCE') totals.otherAllowance += earning.hresD_Amount;
            });

            dept.deductionresult.forEach((deduction: any) => {
                if (deduction.hrmeD_Name === 'PF CONT') totals.pfCont += deduction.hresD_Amount;
                if (deduction.hrmeD_Name === 'ESIC CONT') totals.esicCont += deduction.hresD_Amount;
                if (deduction.hrmeD_Name === 'PT') totals.pt += deduction.hresD_Amount;
                if (deduction.hrmeD_Name === 'TDS') totals.tds += deduction.hresD_Amount;
            });

            totals.grossEarning += dept.grossEarning;
            totals.grossDeduction += dept.grossDeduction;
        });

        totals.netSalary = totals.grossEarning - totals.grossDeduction;

        return totals;
    };

    const totals = calculateTotals();

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Department Salary Report'
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

                        <div className='flex justify-center'>
                            <div className='grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='month' className='font-medium text-sm text-white-900'>
                                        Month: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='month'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {masterMonthsLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : masterMonthsError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading data
                                                        </SelectItem>
                                                    ) : (
                                                        MonthsOptions?.map((opt: any) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.month && <FormError>{errors.month.message}</FormError>}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='year' className='font-medium text-sm text-white-900'>
                                        Year: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='year'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {masterYearsLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : masterYearsError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading data
                                                        </SelectItem>
                                                    ) : (
                                                        YearsOptions?.map((opt: any) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.year && <FormError>{errors.year.message}</FormError>}
                                </div>
                            </div>
                        </div>

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
                        title='Department Salary Report'
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
                                                Department Name
                                            </th>
                                            <th
                                                className='border border-white-300 bg-white-50 px-3 py-2 text-center font-semibold text-sm'
                                                colSpan={4}>
                                                Earnings
                                            </th>
                                            <th
                                                className='border border-white-300 bg-white-100 px-3 py-3 text-center font-semibold text-sm'
                                                rowSpan={2}>
                                                Gross Earning
                                            </th>
                                            <th
                                                className='border border-white-300 bg-white-50 px-3 py-2 text-center font-semibold text-sm'
                                                colSpan={4}>
                                                Deductions
                                            </th>
                                            <th
                                                className='border border-white-300 bg-white-100 px-3 py-3 text-center font-semibold text-sm'
                                                rowSpan={2}>
                                                Gross Deduction
                                            </th>
                                            <th
                                                className='border border-white-300 bg-white-100 px-3 py-3 text-center font-semibold text-sm'
                                                rowSpan={2}>
                                                Net Salary
                                            </th>
                                        </tr>
                                        <tr className='border-white-300 border-b-2 bg-white-50'>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                Basic Pay
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                HRA
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                DA
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                Other Allowance
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                PF Cont
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                ESIC Cont
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                PT
                                            </th>
                                            <th className='border border-white-300 bg-white-50 px-3 py-2 text-center font-medium text-xs'>
                                                TDS
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((dept, index) => {
                                            const basicPay =
                                                dept.earningresult.find((e: any) => e.hrmeD_Name === 'BASIC PAY')?.hresD_Amount || 0;
                                            const hra = dept.earningresult.find((e: any) => e.hrmeD_Name === 'HRA')?.hresD_Amount || 0;
                                            const da = dept.earningresult.find((e: any) => e.hrmeD_Name === 'DA')?.hresD_Amount || 0;
                                            const otherAllowance =
                                                dept.earningresult.find((e: any) => e.hrmeD_Name === 'OTHER ALLOWANCE')?.hresD_Amount || 0;

                                            const pfCont =
                                                dept.deductionresult.find((d: any) => d.hrmeD_Name === 'PF CONT')?.hresD_Amount || 0;
                                            const esicCont =
                                                dept.deductionresult.find((d: any) => d.hrmeD_Name === 'ESIC CONT')?.hresD_Amount || 0;
                                            const pt = dept.deductionresult.find((d: any) => d.hrmeD_Name === 'PT')?.hresD_Amount || 0;
                                            const tds = dept.deductionresult.find((d: any) => d.hrmeD_Name === 'TDS')?.hresD_Amount || 0;

                                            const netSalary = dept.grossEarning - dept.grossDeduction;

                                            return (
                                                <tr key={index} className='hover:bg-white-50'>
                                                    <td className='border border-white-300 px-3 py-2 text-center text-sm'>{index + 1}</td>
                                                    <td className='border border-white-300 px-3 py-2 text-left font-medium text-sm'>
                                                        {dept.hrmD_DepartmentName}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {basicPay.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {hra.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {da.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {otherAllowance.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 bg-white-50 px-3 py-2 text-right font-semibold text-sm'>
                                                        ₹
                                                        {dept.grossEarning.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {pfCont.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {esicCont.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {pt.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-3 py-2 text-right text-sm'>
                                                        ₹
                                                        {tds.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 bg-white-50 px-3 py-2 text-right font-semibold text-sm'>
                                                        ₹
                                                        {dept.grossDeduction.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 bg-white-50 px-3 py-2 text-right font-semibold text-sm'>
                                                        ₹
                                                        {netSalary.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {totals && (
                                            <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                                <td className='border border-white-300 px-3 py-3 text-center text-sm'>
                                                    {reportData.length}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-left text-sm'>Total</td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.basicPay.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.hra.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.da.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.otherAllowance.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 bg-white-50 px-3 py-3 text-right font-semibold text-sm'>
                                                    ₹
                                                    {totals.grossEarning.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.pfCont.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.esicCont.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.pt.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-3 py-3 text-right text-sm'>
                                                    ₹
                                                    {totals.tds.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 bg-white-50 px-3 py-3 text-right font-semibold text-sm'>
                                                    ₹
                                                    {totals.grossDeduction.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 bg-white-50 px-3 py-3 text-right font-semibold text-sm'>
                                                    ₹
                                                    {totals.netSalary.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
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
