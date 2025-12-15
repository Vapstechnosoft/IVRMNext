'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDepartmentDropdown,
    useDesignationDropdown,
    useGroupTypeDropdown,
    useMonthDropdown,
    useYearDropdown,
    useSalaryApprovalList
} from '@/hooks/hrms/useTransactions';
import type { EmployeeDetail } from '@/types/hrms/hrms-config/transaction';
import type { SalaryApprovalRequest } from '@/types/hrms/salary-approval';
import { CheckCircle, RefreshCw, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getSalaryApprovalColumns } from './_components/columns';
interface SearchForm {
    groupType: string[];
    department: string[];
    designation: string[];
    salaryMonth: string;
    salaryYear: string;
}
export default function SalaryApprovalPage() {
    const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(null);
    const { handleSubmit, reset, watch, control, setValue } = useForm<SearchForm>({
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            salaryMonth: '',
            salaryYear: new Date().getFullYear().toString()
        }
    });
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    // Dropdown hooks - individual APIs following preadmission pattern
    const { data: groupTypeData, isLoading: isLoadingGroupType } = useGroupTypeDropdown();
    
    // Extract Group Type IDs from selected group types for cascading department dropdown
    const selectedGroupTypeIds = useMemo(() => {
        if (!watchedGroupType || !Array.isArray(watchedGroupType) || watchedGroupType.length === 0) {
            return undefined;
        }
        // Map selected group type values (names) to their IDs (keys)
        const rawData = Array.isArray(groupTypeData) ? groupTypeData : (groupTypeData as any)?.data || [];
        const ids = watchedGroupType
            .map((selectedValue: string) => {
                const groupType = rawData.find((item: any) => 
                    item.value === selectedValue || 
                    item.HRMGT_EmployeeGroupType === selectedValue ||
                    (item.key !== undefined && item.value === selectedValue)
                );
                return groupType?.key || groupType?.HRMGT_Id;
            })
            .filter((id: number | undefined): id is number => id !== undefined && id > 0);
        return ids.length > 0 ? ids : undefined;
    }, [watchedGroupType, groupTypeData]);
    
    const { data: departmentData, isLoading: isLoadingDepartment } = useDepartmentDropdown(selectedGroupTypeIds);
    
    // Extract Department IDs from selected departments for cascading designation dropdown
    const selectedDepartmentIds = useMemo(() => {
        if (!watchedDepartment || !Array.isArray(watchedDepartment) || watchedDepartment.length === 0) {
            return undefined;
        }
        // Map selected department values (names) to their IDs (keys)
        const rawData = Array.isArray(departmentData) ? departmentData : (departmentData as any)?.data || [];
        const ids = watchedDepartment
            .map((selectedValue: string) => {
                const department = rawData.find((item: any) => 
                    item.value === selectedValue || 
                    item.HRMD_DepartmentName === selectedValue ||
                    (item.key !== undefined && item.value === selectedValue)
                );
                return department?.key || department?.HRMD_Id;
            })
            .filter((id: number | undefined): id is number => id !== undefined && id > 0);
        return ids.length > 0 ? ids : undefined;
    }, [watchedDepartment, departmentData]);
    
    const { data: designationData, isLoading: isLoadingDesignation } = useDesignationDropdown(selectedDepartmentIds);
    const { data: monthData, isLoading: isLoadingMonth } = useMonthDropdown();
    const { data: yearData, isLoading: isLoadingYear } = useYearDropdown();

    const isLoading = isLoadingGroupType || isLoadingDepartment || isLoadingDesignation || isLoadingMonth || isLoadingYear;

    // Memoize arrays to prevent unnecessary re-renders
    // Transform GroupType dropdown from { key, value } format
    const groupTypeOptions = useMemo(() => {
        const rawData = Array.isArray(groupTypeData) ? groupTypeData : (groupTypeData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMGT_Id: item.key,
                    HRMGT_EmployeeGroupType: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [groupTypeData]);
    
    // Transform Department dropdown from { key, value } format
    const departmentOptions = useMemo(() => {
        const rawData = Array.isArray(departmentData) ? departmentData : (departmentData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMD_Id: item.key,
                    HRMD_DepartmentName: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [departmentData]);
    
    // Transform Designation dropdown from { key, value } format
    const designationOptions = useMemo(() => {
        const rawData = Array.isArray(designationData) ? designationData : (designationData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMDES_Id: item.key,
                    HRMDES_DesignationName: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [designationData]);
    
    // Transform Month dropdown from { key, value } format
    const monthOptions = useMemo(() => {
        const rawData = Array.isArray(monthData) ? monthData : (monthData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value.trim(), // Trim whitespace from month names
                    // For backward compatibility with existing code
                    IVRM_Month_Id: item.key,
                    IVRM_Month_Name: item.value.trim()
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [monthData]);
    
    // Transform Year dropdown from { key, value } format
    const yearOptions = useMemo(() => {
        const rawData = Array.isArray(yearData) ? yearData : (yearData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMLY_LeaveYear: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [yearData]);

    // Reset department selection when group types change
    useEffect(() => {
        if (watchedGroupType && Array.isArray(watchedGroupType) && watchedGroupType.length > 0) {
            // Department dropdown will be refetched with new group type IDs
            // Optionally reset department selection when group types change
            // Uncomment if you want to auto-reset department on group type change:
            // setValue('department', []);
        } else if (!watchedGroupType || (Array.isArray(watchedGroupType) && watchedGroupType.length === 0)) {
            // Reset department when no group types selected
            setValue('department', []);
        }
    }, [watchedGroupType, setValue]);
    
    // Reset designation selection when departments change
    useEffect(() => {
        if (watchedDepartment && Array.isArray(watchedDepartment) && watchedDepartment.length > 0) {
            // Designation dropdown will be refetched with new department IDs
            // Optionally reset designation selection when departments change
            // Uncomment if you want to auto-reset designation on department change:
            // setValue('designation', []);
        } else if (!watchedDepartment || (Array.isArray(watchedDepartment) && watchedDepartment.length === 0)) {
            // Reset designation when no departments selected
            setValue('designation', []);
        }
    }, [watchedDepartment, setValue]);
    
    // TODO: Add search and approve/reject functionality
    const searchMutation = { mutate: (_payload: any, _options?: any) => {}, isPending: false };
    const approveMutation = { mutate: (_payload: any, _options?: any) => {}, isPending: false };
    // Memoize filterEmployees to prevent infinite loops
    const filterEmployees = useCallback(() => {
        let filtered = employees;
        if (watchedGroupType && watchedGroupType.length > 0) {
            // watchedGroupType contains the value (group type name) from MultiSelect
            const groupTypeNames = new Set(watchedGroupType);
            filtered = filtered.filter((emp) => groupTypeNames.has(emp.HRMGT_EmployeeGroupType));
        }
        if (watchedDepartment && watchedDepartment.length > 0) {
            const departmentNames = new Set(watchedDepartment);
            filtered = filtered.filter((emp) => departmentNames.has(emp.HRMD_DepartmentName));
        }
        if (watchedDesignation && watchedDesignation.length > 0) {
            const designationNames = new Set(watchedDesignation);
            filtered = filtered.filter((emp) => designationNames.has(emp.HRMDES_DesignationName));
        }
        setFilteredEmployees(filtered);
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees]);
    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [hasSearched, filterEmployees]);
    const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
        // TODO: Implement search functionality with new pattern
        const payload: any = {
            MI_Id: 30,
            HRES_Year: data.salaryYear || '',
            HRES_Month: data.salaryMonth || '',
            groupTypeIdList:
                (data.groupType || []).length > 0
                    ? (data.groupType || []).map((v) => {
                          // v is the value (group type name) from MultiSelect
                          const groupType = groupTypeOptions.find((g: any) => g.value === v || g.HRMGT_EmployeeGroupType === v);
                          // Return the key (ID) from the { key, value } format
                          return groupType?.key || groupType?.HRMGT_Id || 0;
                      })
                    : [0],
            hrmD_IdList:
                (data.department || []).length > 0
                    ? (data.department || []).map((v) => {
                          // v is the value (department name) from MultiSelect
                          const dept = departmentOptions.find((d: any) => d.value === v || d.HRMD_DepartmentName === v);
                          // Return the key (ID) from the { key, value } format
                          return dept?.key || dept?.HRMD_Id || 0;
                      })
                    : [0],
            hrmdeS_IdList:
                (data.designation || []).length > 0
                    ? (data.designation || []).map((v) => {
                          // v is the value (designation name) from MultiSelect
                          const desg = designationOptions.find((d: any) => d.value === v || d.HRMDES_DesignationName === v);
                          // Return the key (ID) from the { key, value } format
                          return desg?.key || desg?.HRMDES_Id || 0;
                      })
                    : [0],
            LogInUserId: 0
        };
        searchMutation.mutate(payload, {
            onSuccess: (responseData: any) => {
                const employeeList = responseData.ReportData || [];
                setEmployees(employeeList);
                setFilteredEmployees(employeeList);
                setHasSearched(true);
                setCurrentSearchData(data);
                if (data.salaryMonth && data.salaryYear) {
                    // Find month data - assuming monthdropdown has similar structure
                    const monthData = monthOptions.find((m: any) => m.IVRM_Month_Name === data.salaryMonth || m.label === data.salaryMonth);
                    if (monthData) {
                        const year = Number.parseInt(data.salaryYear);
                        const monthIndex = (monthData.IVRM_Month_Id || (monthData as any).value || 1) - 1;
                        const fromDate = new Date(year, monthIndex, 1);
                        const toDate = new Date(year, monthIndex + 1, 0);
                        const fromDateStr = `${String(fromDate.getDate()).padStart(2, '0')}/${String(fromDate.getMonth() + 1).padStart(2, '0')}/${fromDate.getFullYear()}`;
                        const toDateStr = `${String(toDate.getDate()).padStart(2, '0')}/${String(toDate.getMonth() + 1).padStart(2, '0')}/${toDate.getFullYear()}`;
                        setFromDate(fromDateStr);
                        setToDate(toDateStr);
                    }
                }
                toast.success(`Search completed successfully. Found ${employeeList.length} employees`);
            },
            onError: (_error: any) => {
                setEmployees([]);
                setFilteredEmployees([]);
                setHasSearched(true);
            }
        });
    };
    const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
        if (selected) {
            setSelectedEmployees([...selectedEmployees, employeeId]);
        } else {
            setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
        }
    };
    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedEmployees(filteredEmployees.map((emp) => emp.HRME_Id));
        } else {
            setSelectedEmployees([]);
        }
    };
    const handleApprove = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee to approve');
            return;
        }
        if (!currentSearchData) {
            toast.error('Please perform a search first before approving');
            return;
        }
        const payload: SalaryApprovalRequest = {
            MI_Id: 30,
            HRES_Year: currentSearchData.salaryYear,
            HRES_Month: currentSearchData.salaryMonth,
            employeeIdList: selectedEmployees,
            LogInUserId: 0,
            approvalStatus: 'Approved'
        };
        approveMutation.mutate(payload, {
            onSuccess: (data: any) => {
                if (data.approvedCount > 0) {
                    toast.success(`Successfully approved ${data.approvedCount} employee(s)`);
                }
                setSelectedEmployees([]);
            },
            onError: (_error: any) => {
                toast.error('Failed to approve employees');
            }
        });
    };
    const handleReject = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee to reject');
            return;
        }
        if (!currentSearchData) {
            toast.error('Please perform a search first before rejecting');
            return;
        }
        const payload: SalaryApprovalRequest = {
            MI_Id: 30,
            HRES_Year: currentSearchData.salaryYear,
            HRES_Month: currentSearchData.salaryMonth,
            employeeIdList: selectedEmployees,
            LogInUserId: 0,
            approvalStatus: 'Rejected'
        };
        approveMutation.mutate(payload, {
            onSuccess: (data: any) => {
                if (data.approvedCount > 0) {
                    toast.success(`Successfully rejected ${data.approvedCount} employee(s)`);
                }
                setSelectedEmployees([]);
            },
            onError: (_error: any) => {
                toast.error('Failed to reject employees');
            }
        });
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Search Form */}
                <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg' headerClassName=''>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                            {/* Group Type */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Group Type</Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions.map((g: any) => ({
                                                label: g.value || g.HRMGT_EmployeeGroupType || '',
                                                value: g.value || g.HRMGT_EmployeeGroupType || ''
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder='Select Group Types'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>
                            {/* Department */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Department</Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentOptions.map((d: any) => ({
                                                label: d.value || d.HRMD_DepartmentName || '',
                                                value: d.value || d.HRMD_DepartmentName || ''
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={
                                                selectedGroupTypeIds && selectedGroupTypeIds.length > 0
                                                    ? 'Select Departments'
                                                    : 'Select Group Types first'
                                            }
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={!selectedGroupTypeIds || selectedGroupTypeIds.length === 0}
                                        />
                                    )}
                                />
                            </div>
                            {/* Designation */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Designation</Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationOptions.map((d: any) => ({
                                                label: d.value || d.HRMDES_DesignationName || '',
                                                value: d.value || d.HRMDES_DesignationName || ''
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={
                                                selectedDepartmentIds && selectedDepartmentIds.length > 0
                                                    ? 'Select Designations'
                                                    : 'Select Departments first'
                                            }
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={!selectedDepartmentIds || selectedDepartmentIds.length === 0}
                                        />
                                    )}
                                />
                            </div>
                            {/* Month */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Month</Label>
                                <Controller
                                    name='salaryMonth'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(monthOptions) && monthOptions.length > 0
                                                    ? monthOptions.map((month: any) => (
                                                          <SelectItem
                                                              key={month.key || month.IVRM_Month_Id || month.value}
                                                              value={month.value || month.IVRM_Month_Name || month.label || ''}>
                                                              {month.value || month.IVRM_Month_Name || month.label || ''}
                                                          </SelectItem>
                                                      ))
                                                    : null}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            {/* Year */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Year</Label>
                                <Controller
                                    name='salaryYear'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(yearOptions) && yearOptions.length > 0
                                                    ? yearOptions.map((year: any) => (
                                                          <SelectItem
                                                              key={year.key || year.HRMLY_LeaveYear || year.value}
                                                              value={year.value || year.HRMLY_LeaveYear || ''}>
                                                              {year.value || year.HRMLY_LeaveYear || ''}
                                                          </SelectItem>
                                                      ))
                                                    : null}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        {/* Search and Cancel Buttons */}
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
                                    setFromDate('');
                                    setToDate('');
                                }}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
                {/* Employee List Table */}
                {hasSearched && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        headerClassName=''>
                        <SalaryApprovalTable
                            employees={filteredEmployees}
                            isLoading={isLoading || searchMutation.isPending || approveMutation.isPending}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </CollapsibleSection>
                )}
                {/* Initial State Message */}
                {!hasSearched && (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>
                                Please use the search form above to find employee salary records for approval
                            </div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
interface SalaryApprovalTableProps {
    employees: EmployeeDetail[];
    isLoading: boolean;
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onApprove: () => void;
    onReject: () => void;
    fromDate: string;
    toDate: string;
}
function SalaryApprovalTable({
    employees,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onApprove,
    onReject,
    fromDate,
    toDate
}: SalaryApprovalTableProps) {
    // Prepare table response format for useDataTableProps
    const tableResponse = useMemo(() => {
        return {
            success: true,
            data: employees,
            total: employees.length,
            page: 1,
            page_size: employees.length
        };
    }, [employees]);
    const tableProps = useDataTableProps(tableResponse);
    // Get columns with selection handlers
    const columns = useMemo(
        () =>
            getSalaryApprovalColumns({
                employees,
                selectedEmployees,
                onEmployeeSelect,
                onSelectAll
            }),
        [employees, selectedEmployees, onEmployeeSelect, onSelectAll]
    );
    return (
        <div className='space-y-4'>
            {/* Date Range Display */}
            {fromDate && toDate && (
                <div className='rounded-lg bg-muted/50 p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='text-muted-foreground text-sm'>
                            Date From: {fromDate} to {toDate}
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type='text' placeholder='search here...' className='w-48 rounded-md border px-3 py-1 text-sm' />
                            <RefreshCw className='h-4 w-4 cursor-pointer text-muted-foreground' />
                        </div>
                    </div>
                </div>
            )}
            <GenericDataTable<EmployeeDetail>
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                error={null}
                showViewOptions={true}
                columnPinning={{ left: ['select'] }}
                loadingMessage='Loading employees...'
                noDataTitle='No Employees Found'
                noDataDescription='No employee records match your search criteria'
                errorTitle='Error Loading Employees'
            />
            {/* Action Buttons */}
            <div className='flex justify-end gap-2'>
                <Button
                    onClick={onApprove}
                    disabled={selectedEmployees.length === 0}
                    className='w-fit transition-all duration-200 hover:scale-105'>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    APPROVE SELECTED
                </Button>
                <Button
                    onClick={onReject}
                    disabled={selectedEmployees.length === 0}
                    variant='destructive'
                    className='w-fit transition-all duration-200 hover:scale-105'>
                    <XCircle className='mr-2 h-4 w-4' />
                    REJECT SELECTED
                </Button>
                <Button variant='outline' className='w-fit transition-all duration-200 hover:scale-105'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
