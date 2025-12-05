'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGenerateSalary, useSalaryCalculationOnload, useSearchSalaryCalculation } from '@/hooks/hrms/useTransactions';
import type {
    DesignationDropdown,
    SalaryCalculationGenerateRequest,
    SalaryCalculationSearchRequest
} from '@/types/hrms/salary-calculation';
import { Calculator, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type Employee, getSalaryCalculationColumns } from './_components/columns';
interface SearchForm {
    groupType: string[];
    department: string[];
    designation: string[];
    salaryMonth: string;
    salaryYear: string;
}
export default function SalaryCalculationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(null);
    const { handleSubmit, reset, watch, control } = useForm<SearchForm>({
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
    const { data: onloadData, isLoading } = useSalaryCalculationOnload({
        MI_Id: 30,
        LogInUserId: 0
    });
    const searchMutation = useSearchSalaryCalculation();
    const generateMutation = useGenerateSalary();
    // Memoize arrays to prevent unnecessary re-renders
    const monthOptions = useMemo(() => onloadData?.monthdropdown || [], [onloadData?.monthdropdown]);
    const leaveYearOptions = useMemo(() => onloadData?.leaveyeardropdown || [], [onloadData?.leaveyeardropdown]);
    const departmentOptions = useMemo(
        () => onloadData?.departmentdropdown || onloadData?.departmentdropdownlist || [],
        [onloadData?.departmentdropdown, onloadData?.departmentdropdownlist]
    );
    const designationOptions = useMemo(
        () => onloadData?.designationdropdown || onloadData?.designationdropdownlist || [],
        [onloadData?.designationdropdown, onloadData?.designationdropdownlist]
    );
    const groupTypeOptions = useMemo(
        () => onloadData?.groupTypedropdownlist || onloadData?.groupTypedropdown || [],
        [onloadData?.groupTypedropdownlist, onloadData?.groupTypedropdown]
    );
    // Memoize filterEmployees to prevent infinite loops
    const filterEmployees = useCallback(() => {
        let filtered = employees;
        if (watchedGroupType && watchedGroupType.length > 0) {
            const groupTypeIds = new Set(watchedGroupType.map((v) => Number(v)));
            filtered = filtered.filter((emp) => groupTypeIds.has(emp.HRMGT_Id));
        }
        if (watchedDepartment && watchedDepartment.length > 0) {
            const departmentIds = new Set(watchedDepartment.map((v) => Number(v)));
            filtered = filtered.filter((emp) => departmentIds.has(emp.HRMD_Id));
        }
        if (watchedDesignation && watchedDesignation.length > 0) {
            const designationIds = new Set(watchedDesignation.map((v) => Number(v)));
            filtered = filtered.filter((emp) => designationIds.has(emp.HRMDES_Id));
        }
        setFilteredEmployees(filtered);
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees]);
    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [hasSearched, filterEmployees]);
    const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
        const payload: SalaryCalculationSearchRequest = {
            MI_Id: 30,
            HRES_Year: data.salaryYear || '',
            HRES_Month: data.salaryMonth || '',
            groupTypeIdList: (data.groupType || []).map((v) => Number(v)),
            hrmD_IdList: (data.department || []).map((v) => Number(v)),
            hrmdeS_IdList: (data.designation || []).map((v) => Number(v)),
            LogInUserId: 0
        };
        searchMutation.mutate(payload, {
            onSuccess: (responseData) => {
                const employeeList = responseData.employeedropdown || [];
                const employeesWithStatus: Employee[] = employeeList.map((emp: any) => {
                    const designation = designationOptions.find((d: DesignationDropdown) => d.HRMDES_Id === emp.HRMDES_Id);
                    const basicSalary = designation?.HRMDES_BasicAmount || 0;
                    return {
                        ...emp,
                        calculationStatus: 'Not Calculated' as const,
                        basicSalary,
                        allowances: 0,
                        deductions: 0,
                        netSalary: basicSalary
                    } as Employee;
                });
                setEmployees(employeesWithStatus);
                setFilteredEmployees(employeesWithStatus);
                setHasSearched(true);
                setCurrentSearchData(data);
                if (data.salaryMonth && data.salaryYear) {
                    const monthData = monthOptions.find((m) => m.IVRM_Month_Name === data.salaryMonth);
                    if (monthData) {
                        const year = Number.parseInt(data.salaryYear);
                        const monthIndex = monthData.IVRM_Month_Id - 1;
                        const fromDate = new Date(year, monthIndex, 1);
                        const toDate = new Date(year, monthIndex + 1, 0);
                        setFromDate(
                            `${String(fromDate.getDate()).padStart(2, '0')}/${String(fromDate.getMonth() + 1).padStart(2, '0')}/${fromDate.getFullYear()}`
                        );
                        setToDate(
                            `${String(toDate.getDate()).padStart(2, '0')}/${String(toDate.getMonth() + 1).padStart(2, '0')}/${toDate.getFullYear()}`
                        );
                    }
                }
                toast.success(`Search completed successfully. Found ${employeesWithStatus.length} employees`);
            },
            onError: () => {
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
    const handleGenerateSalary = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee to generate salary');
            return;
        }
        if (!currentSearchData) {
            toast.error('Please perform a search first before generating salary');
            return;
        }
        const payload: SalaryCalculationGenerateRequest = {
            MI_Id: 30,
            HRES_Year: currentSearchData.salaryYear,
            HRES_Month: currentSearchData.salaryMonth,
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
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                            {/* Group Type */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Group Type</Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions.map((g) => ({
                                                label: g.HRMGT_EmployeeGroupType,
                                                value: String(g.HRMGT_Id)
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
                                            options={departmentOptions.map((d) => ({
                                                label: d.HRMD_DepartmentName,
                                                value: String(d.HRMD_Id)
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder='Select Departments'
                                            className='w-full'
                                            maxHeight={240}
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
                                            options={designationOptions.map((d) => ({
                                                label: d.HRMDES_DesignationName,
                                                value: String(d.HRMDES_Id)
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
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
                                    name='salaryMonth'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map((month) => (
                                                    <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name}>
                                                        {month.IVRM_Month_Name}
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
                                    name='salaryYear'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveYearOptions.map((year) => (
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
                        <SalaryCalculationTable
                            employees={filteredEmployees}
                            isLoading={isLoading || searchMutation.isPending || generateMutation.isPending}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            onGenerateSalary={handleGenerateSalary}
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
    onGenerateSalary: () => void;
    fromDate: string;
    toDate: string;
}
function SalaryCalculationTable({
    employees,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onGenerateSalary,
    fromDate,
    toDate
}: SalaryCalculationTableProps) {
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
                    onClick={onGenerateSalary}
                    disabled={selectedEmployees.length === 0}
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
