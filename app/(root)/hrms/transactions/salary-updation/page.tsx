'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useFilterSalaryUpdationEmployees,
    useGetSalaryUpdationDepartments,
    useGetSalaryUpdationDesignations,
    useGetSalaryUpdationEmployeeDetailsBySelection,
    useSalaryUpdationList
} from '@/hooks/hrms/useTransactions';
import type {
    DeductionResultItem,
    DepartmentDropdown,
    DesignationDropdown,
    EarningResultItem,
    EmployeeDropdown,
    SalaryUpdationItem
} from '@/types/hrms/salary-updation';
import { Plus, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import FormSections from './_components/form-sections';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SalaryUpdationPage(_props: { searchParams: SearchParams }) {
    const { listQuery } = useSalaryUpdationList({
        page: 1,
        page_size: 10,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: false,
        MIID: HRMS_MI_ID,
        LoginUserId: 0,
        UserRole: ''
    });

    return (
        <FormProvider<SalaryUpdationItem>>
            <SalaryUpdationPageContent
                response={listQuery.data}
                isLoading={listQuery.isLoading}
                error={listQuery.error}
                refetch={listQuery.refetch}
            />
        </FormProvider>
    );
}

function SalaryUpdationPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<SalaryUpdationItem>();
    const [hasSearched, setHasSearched] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDropdown[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [cascadingDepartments, setCascadingDepartments] = useState<DepartmentDropdown[]>([]);
    const [cascadingDesignations, setCascadingDesignations] = useState<DesignationDropdown[]>([]);
    const { mutate: filterEmployees, isPending: isFiltering } = useFilterSalaryUpdationEmployees();
    const { mutate: getEmployeeDetails, isPending: isGettingDetails } = useGetSalaryUpdationEmployeeDetailsBySelection();
    const { mutate: getDepartments, isPending: isGettingDepartments } = useGetSalaryUpdationDepartments();
    const { mutate: getDesignations, isPending: isGettingDesignations } = useGetSalaryUpdationDesignations();

    // Safely extract data with proper defaults to prevent hydration mismatches
    // Use useMemo to prevent unnecessary re-renders and infinite loops
    // Support both new format (groupTypedropdown) and legacy format (groupTypedropdownlist)
    const groupTypes = useMemo(
        () => response?.groupTypedropdown || response?.groupTypedropdownlist || [],
        [response?.groupTypedropdown, response?.groupTypedropdownlist]
    );
    // Use cascading departments if available, otherwise fall back to onload data
    const departments = useMemo(
        () =>
            cascadingDepartments.length > 0 ? cascadingDepartments : response?.departmentdropdown || response?.departmentdropdownlist || [],
        [cascadingDepartments, response?.departmentdropdown, response?.departmentdropdownlist]
    );
    // Use cascading designations if available, otherwise fall back to onload data
    const designations = useMemo(
        () =>
            cascadingDesignations.length > 0
                ? cascadingDesignations
                : response?.designationdropdown || response?.designationdropdownlist || [],
        [cascadingDesignations, response?.designationdropdown, response?.designationdropdownlist]
    );
    const _employees = useMemo(() => response?.employeedropdown || [], [response?.employeedropdown]);
    // Support multiple possible field names for earning/deduction heads
    const earningHeads = useMemo(
        () => response?.headdropdown || response?.earningdropdown || response?.detectiondropdown || response?.earningdeductiondetails || [],
        [response?.headdropdown, response?.earningdropdown, response?.detectiondropdown, response?.earningdeductiondetails]
    );
    const monthOptions = useMemo(() => response?.monthdropdown || [], [response?.monthdropdown]);
    const leaveYearOptions = useMemo(() => response?.leaveyeardropdown || [], [response?.leaveyeardropdown]);

    // Initialize date values client-side only to prevent hydration mismatches
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            groupType: 'All',
            department: 'All',
            designation: 'All',
            year: '',
            month: '',
            earningDeduction: 'All Earning & Deduction',
            amountType: 'All',
            heads: 'All'
        }
    });

    // Set date values only on client side after hydration
    useEffect(() => {
        if (isClient) {
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = (now.getMonth() + 1).toString();

            reset(
                {
                    groupType: 'All',
                    department: 'All',
                    designation: 'All',
                    year,
                    month,
                    earningDeduction: 'All Earning & Deduction',
                    amountType: 'All',
                    heads: 'All'
                },
                { keepDefaultValues: false }
            );
        }
    }, [isClient, reset]);

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const _watchedDesignation = watch('designation');
    const _watchedHeads = watch('heads');

    // Cascading dropdown: Fetch departments when group type changes
    useEffect(() => {
        if (watchedGroupType && watchedGroupType !== 'All' && isClient) {
            const groupType = groupTypes.find((g: any) => g.HRMGT_EmployeeGroupType === watchedGroupType);
            if (groupType) {
                getDepartments(
                    {
                        MI_Id: HRMS_MI_ID,
                        hrmgT_IdList: [groupType.HRMGT_Id]
                    },
                    {
                        onSuccess: (data) => {
                            setCascadingDepartments(data.departmentdropdown || []);
                            // Reset department and designation when group type changes
                            reset({
                                ...watch(),
                                department: 'All',
                                designation: 'All'
                            });
                            setCascadingDesignations([]);
                        },
                        onError: () => {
                            setCascadingDepartments([]);
                        }
                    }
                );
            } else {
                setCascadingDepartments([]);
                setCascadingDesignations([]);
            }
        } else if (watchedGroupType === 'All' && isClient) {
            // Reset to onload data when "All" is selected
            setCascadingDepartments([]);
            setCascadingDesignations([]);
            reset({
                ...watch(),
                department: 'All',
                designation: 'All'
            });
        }
    }, [watchedGroupType, isClient, groupTypes, getDepartments, reset, watch]);

    // Cascading dropdown: Fetch designations when department changes
    useEffect(() => {
        if (watchedDepartment && watchedDepartment !== 'All' && watchedGroupType && watchedGroupType !== 'All' && isClient) {
            const groupType = groupTypes.find((g: any) => g.HRMGT_EmployeeGroupType === watchedGroupType);
            const department = departments.find((d: any) => d.HRMD_DepartmentName === watchedDepartment);

            if (groupType && department) {
                getDesignations(
                    {
                        MI_Id: HRMS_MI_ID,
                        hrmgT_IdList: [groupType.HRMGT_Id],
                        hrmD_IdList: [department.HRMD_Id]
                    },
                    {
                        onSuccess: (data) => {
                            setCascadingDesignations(data.designationdropdown || []);
                            // Reset designation when department changes
                            reset({
                                ...watch(),
                                designation: 'All'
                            });
                        },
                        onError: () => {
                            setCascadingDesignations([]);
                        }
                    }
                );
            } else {
                setCascadingDesignations([]);
            }
        } else if (watchedDepartment === 'All' && isClient) {
            // Reset to onload data when "All" is selected
            setCascadingDesignations([]);
            reset({
                ...watch(),
                designation: 'All'
            });
        }
    }, [watchedDepartment, watchedGroupType, isClient, groupTypes, departments, getDesignations, reset, watch]);

    const onSubmit = async (formData: any) => {
        try {
            // Map form values to API request format
            const groupTypeIds: number[] = [];
            if (formData.groupType && formData.groupType !== 'All') {
                const groupType = groupTypes.find((g: any) => g.HRMGT_EmployeeGroupType === formData.groupType);
                if (groupType) {
                    groupTypeIds.push(groupType.HRMGT_Id);
                }
            }

            const departmentIds: number[] = [];
            if (formData.department && formData.department !== 'All') {
                const department = departments.find((d: any) => d.HRMD_DepartmentName === formData.department);
                if (department) {
                    departmentIds.push(department.HRMD_Id);
                }
            }

            const designationIds: number[] = [];
            if (formData.designation && formData.designation !== 'All') {
                const designation = designations.find((d: any) => d.HRMDES_DesignationName === formData.designation);
                if (designation) {
                    designationIds.push(designation.HRMDES_Id);
                }
            }

            const headIds: number[] = [];
            if (formData.heads && formData.heads !== 'All') {
                const head = earningHeads.find((h: any) => h.hrmeD_Name === formData.heads || h.HRMED_Name === formData.heads);
                if (head) {
                    headIds.push(head.hrmeD_Id || head.HRMED_Id);
                }
            }

            // Call API to filter employees
            filterEmployees(
                {
                    MI_Id: HRMS_MI_ID,
                    LogInUserId: 0,
                    designationselected: designationIds,
                    departmentselected: departmentIds,
                    groupTypeselected: groupTypeIds,
                    headselected: headIds
                },
                {
                    onSuccess: (data) => {
                        setFilteredEmployees(data.employeedropdown || []);
                        setHasSearched(true);
                        toast.success('Search completed successfully');
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Search failed');
                    }
                }
            );
        } catch (error: any) {
            toast.error(error.message || 'Search failed');
        }
    };

    const handleUpdate = () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        // Get current form values
        const formValues = watch();

        // Build earning and deduction arrays based on form selections
        // This is a basic implementation - can be extended when full UI for earnings/deductions is added
        const earningresult: EarningResultItem[] = [];
        const deductionresult: DeductionResultItem[] = [];

        // If a head is selected and it's an earning type, add it to earningresult
        if (formValues.heads && formValues.heads !== 'All') {
            const selectedHead = earningHeads.find((h: any) => h.hrmeD_Name === formValues.heads || h.HRMED_Name === formValues.heads);
            if (selectedHead) {
                const headId = selectedHead.hrmeD_Id || selectedHead.HRMED_Id;
                const isEarning =
                    formValues.earningDeduction === 'Earning' ||
                    (formValues.earningDeduction === 'All Earning & Deduction' && selectedHead.HRMED_EarnDedFlag === 'Earning');

                const item = {
                    HREED_Id: 0,
                    MI_Id: HRMS_MI_ID,
                    HRME_Id: 0, // Will be set per employee
                    HRMED_Id: headId,
                    HREED_Amount: formValues.amountType === 'Amount' ? 0 : 0, // TODO: Get from form
                    HREED_Percentage: formValues.amountType === 'Percentage' ? '0' : '0', // TODO: Get from form
                    HREED_ActiveFlag: true,
                    HREED_MaxApplicableFlg: true,
                    HREED_ApplicableMaxValue: 0
                };

                if (isEarning) {
                    earningresult.push(item as EarningResultItem);
                } else {
                    deductionresult.push(item as DeductionResultItem);
                }
            }
        }

        // Call API to get employee details
        getEmployeeDetails(
            {
                earningresult: earningresult.length > 0 ? earningresult : undefined,
                deductionresult: deductionresult.length > 0 ? deductionresult : undefined,
                LogInUserId: 0
            },
            {
                onSuccess: (data) => {
                    // Update filtered employees with the response
                    if (data.employeedropdown && data.employeedropdown.length > 0) {
                        setFilteredEmployees(data.employeedropdown);
                        toast.success('Employee details updated successfully');
                    } else {
                        toast.info('No employee details found for the selected criteria');
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'Failed to get employee details');
                }
            }
        );
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Forms Section */}
                <FormSections onloadData={response} onSuccess={refetch} />

                {/* Search Form */}
                <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg'>
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
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isGettingDepartments}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue
                                                    placeholder={isGettingDepartments ? 'Loading departments...' : 'Select Department'}
                                                />
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
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isGettingDesignations || (watchedDepartment === 'All' && watchedGroupType !== 'All')}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue
                                                    placeholder={isGettingDesignations ? 'Loading designations...' : 'Select Designation'}
                                                />
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
                            <Button type='submit' className='w-fit transition-all duration-200 hover:scale-105' disabled={isFiltering}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isFiltering ? 'animate-spin' : ''}`} />
                                {isFiltering ? 'SEARCHING...' : 'SEARCH'}
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
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4'>
                            {/* Add Button */}
                            <div className='flex justify-end'>
                                <Button
                                    type='button'
                                    onClick={openAddForm}
                                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                    <Plus className='h-4 w-4' />
                                    Add Salary Updation
                                </Button>
                            </div>

                            <GenericDataTable<EmployeeDropdown>
                                data={filteredEmployees}
                                totalItems={filteredEmployees.length}
                                columns={[
                                    {
                                        accessorKey: 'HRME_EmployeeCode',
                                        header: 'Employee Code',
                                        cell: ({ row }) => <div className='font-medium'>{row.original.HRME_EmployeeCode}</div>
                                    },
                                    {
                                        accessorKey: 'employeeName',
                                        header: 'Employee Name',
                                        cell: ({ row }) => {
                                            const fullName = [
                                                row.original.HRME_EmployeeFirstName,
                                                row.original.HRME_EmployeeMiddleName,
                                                row.original.HRME_EmployeeLastName
                                            ]
                                                .filter(Boolean)
                                                .join(' ');
                                            return <div className='font-medium'>{fullName}</div>;
                                        }
                                    }
                                ]}
                                isLoading={isFiltering || isLoading}
                                error={error}
                                showViewOptions={true}
                                loadingMessage='Filtering employees...'
                                noDataTitle='No Employees Found'
                                noDataDescription='No employees match your search criteria'
                                errorTitle='Error Loading Employees'
                            />

                            <div className='flex justify-end gap-2'>
                                <Button
                                    onClick={handleUpdate}
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    disabled={isGettingDetails || selectedEmployees.length === 0}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isGettingDetails ? 'animate-spin' : ''}`} />
                                    {isGettingDetails ? 'UPDATING...' : 'UPDATE'}
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
