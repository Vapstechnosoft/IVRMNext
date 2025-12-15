'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDepartmentDropdownForCalculation,
    useDesignationDropdownForCalculation,
    useGenerateSalary,
    useGroupTypeDropdownForCalculation,
    useLeaveYearDropdownForCalculation,
    useMonthDropdownForCalculation,
    useSalaryCalculationList
} from '@/hooks/hrms/useTransactions';
import type { SalaryCalculationGenerateRequest } from '@/types/hrms/salary-calculation';
import { Calculator, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type Employee, getSalaryCalculationColumns } from './_components/columns';
interface SearchForm {
    groupType: string[];
    department: string[];
    designation: string[];
}
export default function SalaryCalculationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(null);
    const { handleSubmit, reset, watch, control, setValue } = useForm<SearchForm>({
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: []
        }
    });
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    // Dropdown hooks - individual APIs following salary-approval pattern
    const { data: groupTypeData, isLoading: isLoadingGroupType } = useGroupTypeDropdownForCalculation();
    
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
    
    const { data: departmentData, isLoading: isLoadingDepartment } = useDepartmentDropdownForCalculation(selectedGroupTypeIds);
    
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
    
    const { data: designationData, isLoading: isLoadingDesignation } = useDesignationDropdownForCalculation(selectedDepartmentIds);
    const { data: monthData, isLoading: isLoadingMonth } = useMonthDropdownForCalculation();
    const { data: leaveYearData, isLoading: isLoadingLeaveYear } = useLeaveYearDropdownForCalculation();

    const isLoading = isLoadingGroupType || isLoadingDepartment || isLoadingDesignation || isLoadingMonth || isLoadingLeaveYear;

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
    const monthOptions = useMemo(() => (monthData?.data || []) as any[], [monthData]);
    const leaveYearOptions = useMemo(() => (leaveYearData?.data || []) as any[], [leaveYearData]);

    // Reset department selection when group types change
    useEffect(() => {
        if (watchedGroupType && Array.isArray(watchedGroupType) && watchedGroupType.length > 0) {
            // Department dropdown will be refetched with new group type IDs
        } else if (!watchedGroupType || (Array.isArray(watchedGroupType) && watchedGroupType.length === 0)) {
            // Reset department when no group types selected
            setValue('department', []);
        }
    }, [watchedGroupType, setValue]);
    
    // Reset designation selection when departments change
    useEffect(() => {
        if (watchedDepartment && Array.isArray(watchedDepartment) && watchedDepartment.length > 0) {
            // Designation dropdown will be refetched with new department IDs
        } else if (!watchedDepartment || (Array.isArray(watchedDepartment) && watchedDepartment.length === 0)) {
            // Reset designation when no departments selected
            setValue('designation', []);
        }
    }, [watchedDepartment, setValue]);

    const generateMutation = useGenerateSalary();
    // Memoize filterEmployees to prevent infinite loops
    const filterEmployees = useCallback(() => {
        let filtered = employees;
        if (watchedGroupType && watchedGroupType.length > 0) {
            // watchedGroupType contains the value (group type name) from MultiSelect
            const groupTypeNames = new Set(watchedGroupType);
            filtered = filtered.filter((emp) => emp.HRMGT_EmployeeGroupType && groupTypeNames.has(emp.HRMGT_EmployeeGroupType));
        }
        if (watchedDepartment && watchedDepartment.length > 0) {
            // watchedDepartment contains the value (department name) from MultiSelect
            const departmentNames = new Set(watchedDepartment);
            filtered = filtered.filter((emp) => emp.HRMD_DepartmentName && departmentNames.has(emp.HRMD_DepartmentName));
        }
        if (watchedDesignation && watchedDesignation.length > 0) {
            // watchedDesignation contains the value (designation name) from MultiSelect
            const designationNames = new Set(watchedDesignation);
            filtered = filtered.filter((emp) => emp.HRMDES_DesignationName && designationNames.has(emp.HRMDES_DesignationName));
        }
        setFilteredEmployees(filtered);
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees]);
    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [hasSearched, filterEmployees]);
    const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
        // TODO: Implement search with new pattern - search without year/month
        // For now, simulate search with filtered employees
        const filtered = groupTypeOptions.filter((g: any) => 
            data.groupType.length === 0 || data.groupType.includes(String(g.HRMGT_Id))
        );
        // This is a placeholder - actual search will be implemented with the new API
        toast.success('Search completed successfully');
        setHasSearched(true);
        setCurrentSearchData(data);
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
    const handleGenerateSalary = async (salaryMonth: string, salaryYear: string) => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee to generate salary');
            return;
        }
        if (!salaryMonth || !salaryYear) {
            toast.error('Please select both month and year to generate salary');
            return;
        }
        const payload: SalaryCalculationGenerateRequest = {
            MI_Id: 0,
            HRES_Year: salaryYear,
            HRES_Month: salaryMonth,
            employeeIdList: selectedEmployees,
            LogInUserId: 0
        };
        generateMutation.mutate(payload, {
            onSuccess: () => {
                setEmployees((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        selectedEmployees.includes(emp.HRME_Id) ? { ...emp, calculationStatus: 'Calculated' as const } : emp
                    )
                );
                setFilteredEmployees((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        selectedEmployees.includes(emp.HRME_Id) ? { ...emp, calculationStatus: 'Calculated' as const } : emp
                    )
                );
                setSelectedEmployees([]);
            }
        });
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Search Form */}
                <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg' headerClassName=''>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
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
                        <SalaryCalculationTable
                            employees={filteredEmployees}
                            isLoading={isLoading || generateMutation.isPending}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            onGenerateSalary={handleGenerateSalary}
                            monthOptions={monthOptions}
                            leaveYearOptions={leaveYearOptions}
                        />
                    </CollapsibleSection>
                )}
                {/* Initial State Message */}
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
interface SalaryCalculationTableProps {
    employees: Employee[];
    isLoading: boolean;
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onGenerateSalary: (salaryMonth: string, salaryYear: string) => void;
    monthOptions: any[];
    leaveYearOptions: any[];
}
function SalaryCalculationTable({
    employees,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onGenerateSalary,
    monthOptions,
    leaveYearOptions
}: SalaryCalculationTableProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
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
            getSalaryCalculationColumns({
                employees,
                selectedEmployees,
                onEmployeeSelect,
                onSelectAll
            }),
        [employees, selectedEmployees, onEmployeeSelect, onSelectAll]
    );
    return (
        <div className='space-y-4'>
            {/* Month and Year Selection for Generate Pay */}
            <div className='rounded-lg bg-muted/50 p-4'>
                <div className='flex items-center gap-4'>
                    <div className='space-y-2 flex-1'>
                        <Label className='font-semibold'>Month: *</Label>
                        <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Month' />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((month: any) => (
                                    <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name}>
                                        {month.IVRM_Month_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='space-y-2 flex-1'>
                        <Label className='font-semibold'>Year: *</Label>
                        <Select onValueChange={setSelectedYear} value={selectedYear}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveYearOptions.map((year: any) => (
                                    <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                        {year.HRMLY_LeaveYear}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <GenericDataTable<Employee>
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
                    onClick={() => onGenerateSalary(selectedMonth, selectedYear)}
                    disabled={selectedEmployees.length === 0 || !selectedMonth || !selectedYear}
                    className='w-fit transition-all duration-200 hover:scale-105'>
                    <Calculator className='mr-2 h-4 w-4' />
                    GENERATE PAY
                </Button>
                <Button variant='outline' className='w-fit transition-all duration-200 hover:scale-105'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
