'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterMonths, useMasterYears, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { useCalculateEmployeeSalary, useSearchEmployeesBySelection } from '@/hooks/hrms/useTransactions';
import type { MasterDropdown } from '@/server/hrms/master';
import type {
    ApiResponse,
    NewSalaryCalculationGenerateRequest,
    NewSalaryCalculationSearchRequest,
    SelectionEmployee
} from '@/types/hrms/salary-calculation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Loader2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { type Employee, getSalaryCalculationColumns } from './_components/columns';
import { useQueryState, parseAsString } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
interface SearchForm {
    groupType: string[];
    department: string[];
    designation: string[];
    salaryMonth: string;
    salaryYear: string;
}

const searchSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Please select at least one group type'),
    department: z.array(z.string()).min(1, 'Please select at least one department'),
    designation: z.array(z.string()).min(1, 'Please select at least one designation'),
    salaryMonth: z.string().min(1, 'Please select a salary month'),
    salaryYear: z.string().min(1, 'Please select a salary year')
});

export default function SalaryCalculationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(null);
    const {
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { isValid }
    } = useForm<SearchForm>({
        resolver: zodResolver(searchSchema),
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            salaryMonth: '',
            salaryYear: ''
        }
    });
    const [resetkey, setResetKey] = useState(0); // For resetting the form
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedSalaryMonth = watch('salaryMonth');
    const watchedSalaryYear = watch('salaryYear');
    const { data: monthOptionsData } = useMasterMonths();
    const { data: yearOptionsData } = useMasterYears();
    const searchMutation = useSearchEmployeesBySelection();
    const calculateMutation = useCalculateEmployeeSalary();

    // Report-based cascading queries
    const { data: groupTypesData, isLoading: isLoadingGroupTypes } = useReportGroupTypes();
    const groupTypeIds = watchedGroupType?.join(',') || '';
    console.log('groupTypeIds', groupTypeIds);
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(groupTypeIds);
    const deptIds = watchedDepartment?.join(',') || '';
    console.log('departmentsData', departmentsData);
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIds, deptIds);

    useEffect(() => {
        setHasSearched(false);
    }, [watchedGroupType, watchedDepartment, watchedDesignation]);
    // Memoized options for Select/MultiSelect components
    const groupTypeOptions = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                label: gt.value,
                value: gt.key.toString()
            })) || []
        );
    }, [groupTypesData]);

    const departmentOptions = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                label: d.hrmD_DepartmentName,
                value: d.hrmD_Id.toString()
            })) || []
        );
    }, [departmentsData]);

    const designationOptions = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                label: d.hrmdeS_DesignationName,
                value: d.hrmdeS_Id.toString()
            })) || []
        );
    }, [designationsData]);

    const monthOptions = useMemo<MasterDropdown[]>(() => (monthOptionsData?.data || []) as MasterDropdown[], [monthOptionsData]);
    const yearOptions = useMemo<MasterDropdown[]>(() => (yearOptionsData?.data || []) as MasterDropdown[], [yearOptionsData]);

    const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
        const payload: NewSalaryCalculationSearchRequest = {
            hreS_Year: data.salaryYear,
            hreS_Month: data.salaryMonth,
            groupTypeIdList: (data.groupType || []).map((v) => Number(v)),
            hrmD_IdList: (data.department || []).map((v) => Number(v)),
            hrmdeS_IdList: (data.designation || []).map((v) => Number(v))
        };
        console.log('Search Payload:', payload);

        searchMutation.mutate(payload, {
            onSuccess: (responseData: ApiResponse<SelectionEmployee[]>) => {
                const employeeList = responseData.data || [];
                const employeesWithStatus: Employee[] = employeeList.map((emp: SelectionEmployee) => {
                    return {
                        ...emp,
                        HRME_Id: emp.hrmE_Id,
                        HRME_EmployeeFirstName: emp.hrmE_FirstName,
                        HRME_EmployeeMiddleName: emp.hrmE_MiddleName,
                        HRME_EmployeeLastName: emp.hrmE_LastName,
                        HRME_EmployeeCode: emp.hrmE_EmployeeCode,
                        HRME_DateOfJoining: emp.hrmE_DOJ,
                        HRME_MobileNo: emp.hrmE_MobileNo || '',
                        HRME_EmailID: emp.hrmE_EmailID || '',
                        MI_Id: 0,
                        HRMGT_Id: emp.hrmgT_Id,
                        HRMD_Id: emp.hrmD_Id,
                        HRMDES_Id: emp.hrmdeS_Id,
                        calculationStatus: 'Not Calculated' as const,
                        basicSalary: 0,
                        allowances: 0,
                        deductions: 0,
                        netSalary: 0
                    } as Employee;
                });

                setEmployees(employeesWithStatus);
                setHasSearched(true);
                setCurrentSearchData(data);

                if (data.salaryMonth && data.salaryYear) {
                    setFromDate(`01/${data.salaryMonth}/${data.salaryYear}`);
                    setToDate(`Last of ${data.salaryMonth}/${data.salaryYear}`);
                }
                if (employeesWithStatus.length === 0) {
                    toast.info('No employees found matching criteria');
                } else {
                    toast.success(`Search completed successfully. Found ${employeesWithStatus.length} employees`);
                }
            },
            onError: () => {
                setEmployees([]);
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
            setSelectedEmployees(employees.map((emp) => emp.HRME_Id));
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
        console.log('selected employees', selectedEmployees);
        const payload: NewSalaryCalculationGenerateRequest = {
            hreS_Year: currentSearchData.salaryYear,
            hreS_Month: currentSearchData.salaryMonth,
            comm: 'cashbank', //"cashbank",
            masterEmployeeList: selectedEmployees.map((empId) => ({
                hrmE_Id: empId,
                type: 'cashbank',
                imC_Id: 0
            }))
        };
        calculateMutation.mutate(payload, {
            onSuccess: () => {
                setEmployees((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        selectedEmployees.includes(emp.HRME_Id) ? { ...emp, calculationStatus: 'Calculated' as const } : emp
                    )
                );
                setSelectedEmployees([]);
            }
        });
    };

    const handleReset = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            salaryMonth: '',
            salaryYear: ''
        });
        setResetKey((prev) => prev + 1); // Reset form
        setEmployees([]);
        setSelectedEmployees([]);
        setHasSearched(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Search Form */}
                <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg' headerClassName=''>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                            {/* Group Type */}
                            <div className='space-y-2'>
                                <Label htmlFor='groupType' className='font-medium text-foreground text-sm'>
                                    Group Type: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Group Types'}
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingGroupTypes || !groupTypeOptions?.length}
                                        />
                                    )}
                                />
                            </div>
                            {/* Department */}
                            <div className='space-y-2'>
                                <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                                    Department: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingDepartments || !departmentOptions?.length}
                                        />
                                    )}
                                />
                            </div>
                            {/* Designation */}
                            <div className='space-y-2'>
                                <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                                    Designation: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingDesignations || !designationOptions?.length}
                                        />
                                    )}
                                />
                            </div>
                            {/* Month */}
                            <div className='space-y-2'>
                                <Label htmlFor='salaryMonth' className='font-medium text-foreground text-sm'>
                                    Month: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='salaryMonth'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} key={field.value || 'empty'} value={field.value || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map((month) => (
                                                    <SelectItem key={month.key} value={month.value}>
                                                        {month.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            {/* Year */}
                            <div className='space-y-2'>
                                <Label htmlFor='salaryYear' className='font-medium text-foreground text-sm'>
                                    Year: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    key={resetkey} // Reset select when resetKey changes
                                    name='salaryYear'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((year) => (
                                                    <SelectItem key={year.key} value={year.value}>
                                                        {year.value}
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
                            <Button type='submit' disabled={!isValid} className='w-fit transition-all duration-200 hover:scale-105'>
                                {searchMutation.isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        SEARCHING...
                                    </>
                                ) : (
                                    <>
                                        <Search className='mr-2 h-4 w-4' />
                                        SEARCH
                                    </>
                                )}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-fit transition-all duration-200 hover:scale-105'
                                onClick={handleReset}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
                {/* Employee List Table */}
                {hasSearched && employees.length > 0 && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        headerClassName=''>
                        <SalaryCalculationTable
                            employees={employees}
                            isLoading={searchMutation.isPending || calculateMutation.isPending}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            onGenerateSalary={handleGenerateSalary}
                            fromDate={fromDate}
                            toDate={toDate}
                            handleReset={handleReset}
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
    handleReset: () => void;
}
function SalaryCalculationTable({
    employees,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onGenerateSalary,
    fromDate,
    toDate,
    handleReset
}: SalaryCalculationTableProps) {
    const [searchTerm, setSearchTerm] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    // Local filtering logic for search
    const filteredBySearch = useMemo(() => {
        if (!searchTerm) return employees;
        const lowerSearch = searchTerm.toLowerCase();
        return employees.filter((emp) => {
            const fullName =
                `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.toLowerCase();
            const code = (emp.HRME_EmployeeCode || '').toLowerCase();
            return fullName.includes(lowerSearch) || code.includes(lowerSearch);
        });
    }, [employees, searchTerm]);

    // Prepare table response format for useDataTableProps
    const tableResponse = useMemo(() => {
        return {
            success: true,
            data: filteredBySearch,
            total: filteredBySearch.length,
            page: 1,
            page_size: filteredBySearch.length
        };
    }, [filteredBySearch]);

    const tableProps = useDataTableProps(tableResponse);

    // Get columns with selection handlers
    const columns = useMemo(
        () =>
            getSalaryCalculationColumns({
                employees: filteredBySearch,
                selectedEmployees,
                onEmployeeSelect,
                onSelectAll
            }),
        [filteredBySearch, selectedEmployees, onEmployeeSelect, onSelectAll]
    );

    return (
        <div className='space-y-4'>
            {/* Date Range and Search Display */}
            {/* <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-muted-foreground text-sm">
            {fromDate && toDate
              ? `Date From: ${fromDate} to ${toDate}`
              : "Employee List"}
          </div>
          <div className='flex items-center gap-2'>
                        <div className='relative flex items-center'>
                            <Mic className='absolute left-3 h-4 w-4 text-muted-foreground' />
                            <input
                                type='text'
                                placeholder='Search code or name...'
                                className='w-64 rounded-md border bg-background pl-9 pr-9 py-1.5 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <X
                                    className='absolute right-3 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground'
                                    onClick={() => setSearchTerm('')}
                                />
                            )}
                        </div>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => setSearchTerm('')}
                            title='Refresh/Reset'
                        >
                            <RefreshCw className='h-4 w-4' />
                        </Button>
                    </div>
        </div>
      </div> */}

            {/* Employee Data Table - Display All Records */}
            <div className=' rounded-md '>
                <GenericDataTable
                    {...tableProps}
                    columns={columns}
                    isLoading={isLoading}
                    error={null}
                    showViewOptions={false}
                    isSearchRequired={true}
                    isPaginationRequired={false}
                    columnPinning={{ left: ['select'] }}
                />
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-2'>
                <Button
                    onClick={onGenerateSalary}
                    disabled={selectedEmployees.length === 0}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                    <Calculator className='mr-2 h-4 w-4' />
                    GENERATE PAY
                </Button>
                <Button variant='outline' className='w-fit shadow-sm transition-all duration-200 hover:scale-105' onClick={handleReset}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
