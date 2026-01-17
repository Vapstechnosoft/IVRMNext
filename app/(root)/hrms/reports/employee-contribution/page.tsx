'use client';
import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterDepartments, useMasterDesignations, useMasterGroupTypes, useMasterMonths, useMasterYears } from '@/hooks/hrms/useReports';
import { cn } from '@/lib/utils';
import { type ReportFormFields, ReportSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Footer from '../footer/footer';

const EarningHeadOptions = [
    { value: 'basic', label: 'Basic Salary' },
    { value: 'hra', label: 'HRA' },
    { value: 'da', label: 'Dearness Allowance' },
    { value: 'ta', label: 'Transport Allowance' },
    { value: 'bonus', label: 'Bonus' }
];

const DeductionHeadOptions = [
    { value: 'pf', label: 'Provident Fund' },
    { value: 'esi', label: 'ESI' },
    { value: 'tds', label: 'TDS' },
    { value: 'loan', label: 'Loan Deduction' },
    { value: 'advance', label: 'Advance Deduction' }
];

const EmployeeOptions = [
    { value: 'emp1', label: 'ANNAPOORNESHWARI DODDAMANE C K' },
    { value: 'emp2', label: 'ABHISHEK C' },
    { value: 'emp3', label: 'ANURADHA SE' },
    { value: 'emp4', label: 'ANUSHA T' },
    { value: 'emp5', label: 'ARCHANA N G' }
];

const mockReportData = [
    {
        employeeCode: 'VVS014',
        employeeName: 'ANNAPOORNESHWARI DODDAMANE C K',
        department: 'Teaching',
        designationName: 'Asst. Teacher',
        basicPay: 8000.0,
        hra: 2400.0,
        da: 1600.0,
        otherAllowance: 1000.0
    },
    {
        employeeCode: 'VVS074',
        employeeName: 'ABHISHEK C',
        department: 'Teaching',
        designationName: 'Asst. Teacher',
        basicPay: 10000.0,
        hra: 3000.0,
        da: 2000.0,
        otherAllowance: 1000.0
    },
    {
        employeeCode: 'VVS101',
        employeeName: 'ANURADHA SE',
        department: 'Teaching',
        designationName: 'Asst. Teacher',
        basicPay: 11500.0,
        hra: 3450.0,
        da: 2300.0,
        otherAllowance: 1191.0
    },
    {
        employeeCode: 'VVS015',
        employeeName: 'ANUSHA T',
        department: 'Teaching',
        designationName: 'Asst. Teacher',
        basicPay: 8500.0,
        hra: 2550.0,
        da: 1700.0,
        otherAllowance: 750.0
    },
    {
        employeeCode: 'VVS102',
        employeeName: 'ARCHANA N G',
        department: 'Teaching',
        designationName: 'Asst. Teacher',
        basicPay: 7500.0,
        hra: 2250.0,
        da: 1500.0,
        otherAllowance: 740.0
    },
    {
        employeeCode: '139',
        employeeName: 'Dr SWAMY K N',
        department: 'Administration',
        designationName: 'ACADEMIC ADMINISTRATOR',
        basicPay: 35000.0,
        hra: 10500.0,
        da: 7000.0,
        otherAllowance: 2500.0
    },
    {
        employeeCode: 'VVS009',
        employeeName: 'PRUTHVISHA S M',
        department: 'Administration',
        designationName: 'Chairman',
        basicPay: 50000.0,
        hra: 15000.0,
        da: 10000.0,
        otherAllowance: 5000.0
    }
];

export default function EarningsDeductionsReport() {
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
        watch,
        reset,
        formState: { errors }
    } = useForm<ReportFormFields>({
        resolver: zodResolver(ReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            reportType: 'Earning',
            dateType: 'month',
            employeeType: 'all',
            month: '',
            year: '',
            fromDate: '',
            toDate: '',
            employee: '',
            earningHead: '',
            deductionHead: ''
        },
        mode: 'onChange'
    });

    const reportType = watch('reportType');
    const dateType = watch('dateType');
    const employeeType = watch('employeeType');

    const onSearch = async (data: ReportFormFields) => {
        setIsSearching(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Report generated successfully!');
            setReportData(mockReportData);
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
            reportType: 'Earning',
            dateType: 'month',
            employeeType: 'all',
            month: '',
            year: '',
            fromDate: '',
            toDate: '',
            employee: '',
            earningHead: '',
            deductionHead: ''
        });
        setReportData([]);
        toast.info('Form has been reset');
    };

    const calculateTotal = () => {
        return reportData.reduce((sum, emp) => sum + (emp.basicPay || 0) + (emp.hra || 0) + (emp.da || 0) + (emp.otherAllowance || 0), 0);
    };

    const calculateBasicPayTotal = () => {
        return reportData.reduce((sum, emp) => sum + (emp.basicPay || 0), 0);
    };

    const calculateHRATotal = () => {
        return reportData.reduce((sum, emp) => sum + (emp.hra || 0), 0);
    };

    const calculateDATotal = () => {
        return reportData.reduce((sum, emp) => sum + (emp.da || 0), 0);
    };

    const calculateOtherAllowanceTotal = () => {
        return reportData.reduce((sum, emp) => sum + (emp.otherAllowance || 0), 0);
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Employee Contribution Report'
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

                        <div className='flex items-center justify-center space-y-2'>
                            <Controller
                                name='reportType'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Earning' id='earning' />
                                            <Label htmlFor='earning' className='cursor-pointer font-normal'>
                                                Earning <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Deduction' id='deduction' />
                                            <Label htmlFor='deduction' className='cursor-pointer font-normal'>
                                                Deduction <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {reportType === 'Earning' && (
                            <div className='flex w-full justify-center gap-3'>
                                <Label htmlFor='earningHead' className='mt-2 font-medium text-sm text-white-900'>
                                    Earning Head: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='earningHead'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-[300px]'>
                                                <SelectValue placeholder='Select Earning Head' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EarningHeadOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.earningHead && <FormError>{errors.earningHead.message}</FormError>}
                            </div>
                        )}

                        {reportType === 'Deduction' && (
                            <div className='flex w-full justify-center gap-3'>
                                <Label htmlFor='deductionHead' className='mt-2 font-medium text-sm text-white-900'>
                                    Deduction Head: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='deductionHead'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-[300px]'>
                                                <SelectValue placeholder='Select Deduction Head' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DeductionHeadOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.deductionHead && <FormError>{errors.deductionHead.message}</FormError>}
                            </div>
                        )}

                        <div className='flex items-center justify-center space-y-2'>
                            <Controller
                                name='dateType'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='month' id='month' />
                                            <Label htmlFor='month' className='cursor-pointer font-normal'>
                                                Month <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='betweenDates' id='betweenDates' />
                                            <Label htmlFor='betweenDates' className='cursor-pointer font-normal'>
                                                Between Dates <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {dateType === 'month' && (
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
                        )}

                        {dateType === 'betweenDates' && (
                            <div className='flex justify-center'>
                                <div className='grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2'>
                                    {/* From Date */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='fromDate' className='font-medium text-sm text-white-900'>
                                            From Date: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='fromDate'
                                            control={control}
                                            render={({ field }) => {
                                                const selectedDate = field.value ? new Date(field.value) : undefined;

                                                return (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant='outline'
                                                                className={cn(
                                                                    'w-full justify-start text-left font-normal',
                                                                    !selectedDate && 'text-muted-foreground',
                                                                    errors.fromDate && 'border-red-500'
                                                                )}
                                                                type='button'>
                                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                                {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Enter date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className='w-auto p-0' align='start'>
                                                            <DatePickerWithYear
                                                                mode='single'
                                                                selected={selectedDate}
                                                                onDayClick={(day) => {
                                                                    if (day) {
                                                                        const dateStr = format(day, 'yyyy-MM-dd');
                                                                        field.onChange(dateStr);
                                                                    }
                                                                }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                );
                                            }}
                                        />
                                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                    </div>

                                    {/* To Date */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='toDate' className='font-medium text-sm text-white-900'>
                                            To Date: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='toDate'
                                            control={control}
                                            render={({ field }) => {
                                                const selectedDate = field.value ? new Date(field.value) : undefined;
                                                const toDateValue = watch('toDate');
                                                const minDate = toDateValue ? new Date(toDateValue) : undefined;
                                                if (minDate) {
                                                    minDate.setHours(0, 0, 0, 0);
                                                }

                                                return (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant='outline'
                                                                className={cn(
                                                                    'w-full justify-start text-left font-normal',
                                                                    !selectedDate && 'text-muted-foreground',
                                                                    errors.toDate && 'border-red-500'
                                                                )}
                                                                type='button'>
                                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                                {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Enter date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className='w-auto p-0' align='start'>
                                                            <DatePickerWithYear
                                                                mode='single'
                                                                selected={selectedDate}
                                                                onDayClick={(day) => {
                                                                    if (day) {
                                                                        const dateStr = format(day, 'yyyy-MM-dd');
                                                                        field.onChange(dateStr);
                                                                    }
                                                                }}
                                                                fromDate={minDate}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                );
                                            }}
                                        />
                                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className='flex items-center justify-center space-y-2'>
                            <Controller
                                name='employeeType'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='all' id='all' />
                                            <Label htmlFor='all' className='cursor-pointer font-normal'>
                                                All <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='individual' id='individual' />
                                            <Label htmlFor='individual' className='cursor-pointer font-normal'>
                                                Individual <span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {employeeType === 'individual' && (
                            <div className='flex w-full justify-center gap-3'>
                                <Label htmlFor='employee' className='mt-2 font-medium text-sm text-white-900'>
                                    Employee: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='employee'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-[300px]'>
                                                <SelectValue placeholder='Select Employee' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EmployeeOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.employee && <FormError>{errors.employee.message}</FormError>}
                            </div>
                        )}

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSearching}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                Reset
                            </Button>
                            <Button
                                type='button'
                                onClick={handleSubmit(onSearch)}
                                disabled={isSearching}
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
                        title='Employee Contribution Report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='mt-2'>
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr className='border-white-300 border-b-2 bg-white-100'>
                                            <th className='border border-white-300 px-4 py-3 text-center font-semibold text-sm'>S.No</th>
                                            <th className='border border-white-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Employee Code
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Employee Name
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Department
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Designation
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-right font-semibold text-sm'>
                                                BASIC PAY
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-right font-semibold text-sm'>HRA</th>
                                            <th className='border border-white-300 px-4 py-3 text-right font-semibold text-sm'>DA</th>
                                            <th className='border border-white-300 px-4 py-3 text-right font-semibold text-sm'>
                                                OTHER ALLOWANCE
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((employee, index) => (
                                            <tr key={index} className='hover:bg-white-50'>
                                                <td className='border border-white-300 px-4 py-2 text-center text-sm'>{index + 1}</td>
                                                <td className='border border-white-300 px-4 py-2 text-left text-sm'>
                                                    {employee.employeeCode}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-left font-medium text-sm'>
                                                    {employee.employeeName}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-left text-sm'>
                                                    {employee.department}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-left text-sm'>
                                                    {employee.designationName}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-right text-sm'>
                                                    ₹
                                                    {employee.basicPay.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-right text-sm'>
                                                    ₹
                                                    {employee.hra.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-right text-sm'>
                                                    ₹
                                                    {employee.da.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className='border border-white-300 px-4 py-2 text-right text-sm'>
                                                    ₹
                                                    {employee.otherAllowance.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                            </tr>
                                        ))}

                                        <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                            <td colSpan={5} className='border border-white-300 px-4 py-3 text-left text-sm'>
                                                Total
                                            </td>
                                            <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {calculateBasicPayTotal().toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {calculateHRATotal().toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {calculateDATotal().toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {calculateOtherAllowanceTotal().toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
                <Footer />
            </div>
        </div>
    );
}
