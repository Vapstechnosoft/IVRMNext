'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useEmployeeDetailsReportOnload,
    useFilterEmployeeDetailsReport,
    useSearchEmployeeDetailsReport
} from '@/hooks/hrms/reports/useEmployeeDetailsReport';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, Download, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Employee data structure for reports
interface Employee extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    fatherName: string;
    mobileNo: string;
    emailId: string;
    dateOfBirth: string;
    emergencyContactNumber: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    departmentName: string;
    designationName: string;
    address: string;
    qualification: string;
    experience: string;
    status: 'Working' | 'Left';
}

// Report filters and settings
interface EmployeeDetailsFilters {
    selectedHeaders: string[];
    format: 'Format 1' | 'Format 2';
    dateFilter: 'Date of Birth' | 'Date of Joining' | 'Date of Leaving';
    fromDate: Date | null;
    toDate: Date | null;
    employeeStatus: string[]; // Changed to array to support multiple selections
    reportType: 'All' | 'Individual';
    // Format 1 specific fields
    employeeType: 'Type' | 'Employee';
    selectedEmployeeType: string;
    selectedEmployee: string;
    // Format 2 specific fields
    selectedGroupTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
}

interface HeaderForm {
    selectedHeaders: string[];
}

export default function EmployeeDetailsReportPage() {
    // Database instances
    const employeeDB = createLocalCrud<Employee>('report:employee-details');

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload } = useEmployeeDetailsReportOnload(30, 2);
    const filterMutation = useFilterEmployeeDetailsReport();
    const searchMutation = useSearchEmployeeDetailsReport();

    // State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [showReport, setShowReport] = useState(false);

    // Extract API Data from onload response
    const _months = onloadData?.data?.monthdropdown || [];
    const _leaveYears = onloadData?.data?.leaveyeardropdown || [];
    const departments = onloadData?.data?.departmentdropdown || [];
    const designations = onloadData?.data?.designationdropdown || [];
    const employeeTypes = onloadData?.data?.employeeTypedropdown || [];
    const groupTypes = onloadData?.data?.groupTypedropdown || [];

    const [filters, setFilters] = useState<EmployeeDetailsFilters>({
        selectedHeaders: [], // Start with no headers selected
        format: 'Format 1',
        dateFilter: 'Date of Birth',
        fromDate: new Date('2025-09-17'),
        toDate: new Date('2025-09-17'),
        employeeStatus: ['Working'], // Default to Working only
        reportType: 'All',
        // Format 1 specific fields
        employeeType: 'Type',
        selectedEmployeeType: '',
        selectedEmployee: '',
        // Format 2 specific fields
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: []
    });

    // Form for header selection
    const { control, watch, reset } = useForm<HeaderForm>({
        defaultValues: {
            selectedHeaders: [] // Start with no headers selected
        }
    });

    // Watch form values
    const watchedHeaders = watch('selectedHeaders');

    // Load fallback mock data if API doesn't return data
    useEffect(() => {
        if (!isLoadingOnload && (!onloadData?.data || !onloadData.data.monthdropdown)) {
            // Load employees from local DB as fallback
            let empList = employeeDB.list();
            if (empList.length === 0) {
                const mockData = generateMockEmployees();
                mockData.forEach((emp) => employeeDB.create(emp));
                empList = employeeDB.list();
            }
            setEmployees(empList);
        }
    }, [isLoadingOnload, onloadData]);

    // Available header options
    const availableHeaders = [
        'Employee Code',
        'Employee Name',
        'Father Name',
        'Mobile No.',
        'Email Id',
        'Date Of Birth',
        'Emergency Contact Number',
        'Date Of Joining',
        'Date Of Leaving',
        'Department',
        'Designation',
        'Address',
        'Qualification',
        'Experience'
    ];

    // Mock data for Format 1 selections
    const employeeList = [
        'MR SUDIPTA RANJAN BHADURI',
        'MS RUPLEKHA CHATTERJEE',
        'MR JOHN SHAH',
        'MRS BHASWATI DAS',
        'MR SANTANU MUKHERJEE'
    ];

    // Sync form values with filters state
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            selectedHeaders: watchedHeaders
        }));
    }, [watchedHeaders]);

    // Generate mock employee data
    const generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
        return [
            {
                employeeCode: 'EMP001',
                employeeName: 'MR SUDIPTA RANJAN BHADURI',
                fatherName: 'MR RANJAN BHADURI',
                mobileNo: '9876543210',
                emailId: 'sudipta@vaps.com',
                dateOfBirth: '1985-05-15',
                emergencyContactNumber: '9876543211',
                dateOfJoining: '2020-01-15',
                departmentName: 'JUNIOR SCHOOL',
                designationName: 'Assistant Teacher',
                address: '123 Main Street, Kolkata',
                qualification: 'M.Ed',
                experience: '5 years',
                status: 'Working'
            },
            {
                employeeCode: 'EMP002',
                employeeName: 'MS RUPLEKHA CHATTERJEE',
                fatherName: 'MR CHATTERJEE',
                mobileNo: '9876543212',
                emailId: 'ruplekha@vaps.com',
                dateOfBirth: '1988-08-22',
                emergencyContactNumber: '9876543213',
                dateOfJoining: '2019-06-10',
                departmentName: 'OFFICE STAFF',
                designationName: 'Principal',
                address: '456 Park Avenue, Kolkata',
                qualification: 'M.A, B.Ed',
                experience: '8 years',
                status: 'Working'
            },
            {
                employeeCode: 'EMP003',
                employeeName: 'MR JOHN SHAH',
                fatherName: 'MR SHAH',
                mobileNo: '9876543214',
                emailId: 'john@vaps.com',
                dateOfBirth: '1990-12-03',
                emergencyContactNumber: '9876543215',
                dateOfJoining: '2021-03-20',
                dateOfLeaving: '2024-08-15',
                departmentName: 'OFFICE STAFF',
                designationName: 'Office Assistant',
                address: '789 Central Road, Kolkata',
                qualification: 'B.Com',
                experience: '3 years',
                status: 'Left'
            },
            {
                employeeCode: 'EMP004',
                employeeName: 'MRS BHASWATI DAS',
                fatherName: 'MR DAS',
                mobileNo: '9876543216',
                emailId: 'bhaswati@vaps.com',
                dateOfBirth: '1987-04-18',
                emergencyContactNumber: '9876543217',
                dateOfJoining: '2018-09-01',
                departmentName: 'SENIOR SCHOOL',
                designationName: 'Teacher Helper',
                address: '321 Lake View, Kolkata',
                qualification: 'B.A',
                experience: '6 years',
                status: 'Working'
            },
            {
                employeeCode: 'EMP005',
                employeeName: 'MR SANTANU MUKHERJEE',
                fatherName: 'MR MUKHERJEE',
                mobileNo: '9876543218',
                emailId: 'santanu@vaps.com',
                dateOfBirth: '1983-11-25',
                emergencyContactNumber: '9876543219',
                dateOfJoining: '2017-04-12',
                departmentName: 'SERVICE STAFF',
                designationName: 'System Manager',
                address: '654 Garden Street, Kolkata',
                qualification: 'MCA',
                experience: '10 years',
                status: 'Working'
            }
        ];
    };

    // Filter employees based on selected criteria
    useEffect(() => {
        let filtered = employees;

        // Filter by employee status
        if (filters.employeeStatus.length > 0) {
            filtered = filtered.filter((emp) => filters.employeeStatus.includes(emp.status));
        }

        // Filter by date range
        if (filters.fromDate && filters.toDate) {
            filtered = filtered.filter((emp) => {
                let dateToCheck: string;
                switch (filters.dateFilter) {
                    case 'Date of Birth':
                        dateToCheck = emp.dateOfBirth;
                        break;
                    case 'Date of Joining':
                        dateToCheck = emp.dateOfJoining;
                        break;
                    case 'Date of Leaving':
                        dateToCheck = emp.dateOfLeaving || '';
                        break;
                    default:
                        dateToCheck = emp.dateOfBirth;
                }

                if (!dateToCheck) return false;

                const checkDate = new Date(dateToCheck);
                return checkDate >= filters.fromDate! && checkDate <= filters.toDate!;
            });
        }

        setFilteredEmployees(filtered);
    }, [filters, employees]);

    const handleGroupTypeToggle = (groupType: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedGroupTypes: prev.selectedGroupTypes.includes(groupType)
                ? prev.selectedGroupTypes.filter((gt) => gt !== groupType)
                : [...prev.selectedGroupTypes, groupType]
        }));
    };

    const handleSelectAllGroupTypes = () => {
        setFilters((prev) => ({
            ...prev,
            selectedGroupTypes: prev.selectedGroupTypes.length === groupTypes.length ? [] : groupTypes.map((gt) => gt.HRMGT_Id.toString())
        }));
    };

    const handleDepartmentToggle = (department: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedDepartments: prev.selectedDepartments.includes(department)
                ? prev.selectedDepartments.filter((dept) => dept !== department)
                : [...prev.selectedDepartments, department]
        }));
    };

    const handleSelectAllDepartments = () => {
        setFilters((prev) => ({
            ...prev,
            selectedDepartments:
                prev.selectedDepartments.length === departments.length ? [] : departments.map((dept) => dept.HRMD_Id.toString())
        }));
    };

    const handleDesignationToggle = (designation: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedDesignations: prev.selectedDesignations.includes(designation)
                ? prev.selectedDesignations.filter((des) => des !== designation)
                : [...prev.selectedDesignations, designation]
        }));
    };

    const handleSelectAllDesignations = () => {
        setFilters((prev) => ({
            ...prev,
            selectedDesignations:
                prev.selectedDesignations.length === designations.length ? [] : designations.map((des) => des.HRMDES_Id.toString())
        }));
    };

    // Handle employee status change and trigger API automatically
    const handleEmployeeStatusChange = async (status: string, checked: boolean) => {
        const newStatuses = checked ? [...filters.employeeStatus, status] : filters.employeeStatus.filter((s) => s !== status);

        // Ensure at least one status is selected
        if (newStatuses.length === 0) {
            toast.error('Please select at least one employee status');
            return;
        }

        setFilters((prev) => ({
            ...prev,
            employeeStatus: newStatuses
        }));

        // Trigger API call automatically
        await triggerFilterAPI(newStatuses);
    };

    // Separate function to trigger the filter API
    const triggerFilterAPI = (statuses: string[] = filters.employeeStatus) => {
        const filterRequest = {
            MI_Id: 30,
            FormatType: filters.format,
            DOBJL: filters.dateFilter,
            FromDate: filters.fromDate?.toISOString() || new Date().toISOString(),
            ToDate: filters.toDate?.toISOString() || new Date().toISOString(),
            AllOrIndividual: filters.reportType,
            TypeOrEmployee: filters.employeeType,
            HRMET_Id: filters.selectedEmployeeType ? Number.parseInt(filters.selectedEmployeeType) : 0,
            HRME_Id: filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0,
            Left: statuses.includes('Left'),
            Working: statuses.includes('Working')
        };

        filterMutation.mutate(filterRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    if (response.data.employeedropdown && response.data.employeedropdown.length > 0) {
                        const filteredEmployees: Employee[] = response.data.employeedropdown.map((emp: any) => ({
                            id: emp.HRME_Id.toString(),
                            employeeCode: emp.HRME_EmployeeCode || '',
                            employeeName: `${emp.HRME_EmployeeFirstName || ''} ${
                                emp.HRME_EmployeeMiddleName || ''
                            } ${emp.HRME_EmployeeLastName || ''}`.trim(),
                            fatherName: emp.HRME_FatherName || '',
                            mobileNo: emp.HRME_MobileNo?.toString() || '',
                            emailId: emp.HRME_EmailId || '',
                            dateOfBirth: emp.HRME_DOB ? emp.HRME_DOB.split('T')[0] : '',
                            emergencyContactNumber: emp.HRME_SpouseMobileNo?.toString() || '',
                            dateOfJoining: emp.HRME_DOJ ? emp.HRME_DOJ.split('T')[0] : '',
                            dateOfLeaving: emp.HRME_DOL ? emp.HRME_DOL.split('T')[0] : '',
                            departmentName: '',
                            designationName: '',
                            address: `${emp.HRME_PerStreet || ''} ${emp.HRME_PerArea || ''} ${emp.HRME_PerCity || ''}`.trim(),
                            qualification: '',
                            experience: '',
                            status: emp.HRME_LeftFlag ? 'Left' : 'Working',
                            createdAt: new Date()
                        }));

                        setEmployees(filteredEmployees);
                    }

                    setShowReport(true);
                    toast.success('Employee status filter applied successfully');
                }
            }
        });
    };

    const handleSearch = () => {
        if (filters.selectedHeaders.length === 0) {
            toast.error('Please select at least one header field to generate the report');
            return;
        }

        // Prepare the search request payload
        const searchRequest = {
            LogInUserId: 2,
            MI_Id: 30,
            FormatType: filters.format,
            DOBJL: filters.dateFilter,
            AllOrIndividual: filters.reportType,
            TypeOrEmployee: filters.employeeType,
            HRMET_Id: filters.selectedEmployeeType ? Number.parseInt(filters.selectedEmployeeType) : 0,
            HRME_Id: filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0,
            FromDate: filters.fromDate?.toISOString() || new Date().toISOString(),
            ToDate: filters.toDate?.toISOString() || new Date().toISOString(),
            Working: filters.employeeStatus.includes('Working'),
            Left: filters.employeeStatus.includes('Left')
        };

        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Check if API returned any employee data
                    const hasEmployeeData =
                        response.data &&
                        ((Array.isArray(response.data.employeedropdown) && response.data.employeedropdown.length > 0) ||
                            (Array.isArray(response.data.employeeDetails) && response.data.employeeDetails.length > 0) ||
                            (Array.isArray(response.data.masterEmployeeList) && response.data.masterEmployeeList.length > 0));

                    if (hasEmployeeData) {
                        // Use the first available data array
                        const dataBlock: any[] =
                            Array.isArray(response.data.employeedropdown) && response.data.employeedropdown.length > 0
                                ? response.data.employeedropdown
                                : Array.isArray(response.data.employeeDetails) && response.data.employeeDetails.length > 0
                                  ? response.data.employeeDetails
                                  : Array.isArray(response.data.masterEmployeeList) && response.data.masterEmployeeList.length > 0
                                    ? response.data.masterEmployeeList
                                    : [];

                        const mappedEmployees: Employee[] = dataBlock.map((emp: any) => ({
                            id: emp.HRME_Id?.toString() || emp.hrmE_Id?.toString() || '',
                            employeeCode: emp.HRME_EmployeeCode || emp.hrmE_EmployeeCode || '',
                            employeeName: `${emp.HRME_EmployeeFirstName || ''} ${
                                emp.HRME_EmployeeMiddleName || ''
                            } ${emp.HRME_EmployeeLastName || ''}`.trim(),
                            fatherName: emp.HRME_FatherName || '',
                            mobileNo: emp.HRME_MobileNo?.toString() || '',
                            emailId: emp.HRME_EmailId || '',
                            dateOfBirth: emp.HRME_DOB ? emp.HRME_DOB.split('T')[0] : '',
                            emergencyContactNumber: emp.HRME_SpouseMobileNo?.toString() || '',
                            dateOfJoining: emp.HRME_DOJ ? emp.HRME_DOJ.split('T')[0] : '',
                            dateOfLeaving: emp.HRME_DOL ? emp.HRME_DOL.split('T')[0] : '',
                            departmentName: '',
                            designationName: '',
                            address: `${emp.HRME_PerStreet || ''} ${emp.HRME_PerArea || ''} ${emp.HRME_PerCity || ''}`.trim(),
                            qualification: '',
                            experience: '',
                            status: emp.HRME_LeftFlag ? 'Left' : 'Working',
                            createdAt: new Date()
                        }));

                        setEmployees(mappedEmployees);
                        setShowReport(true);
                        toast.success(`Found ${mappedEmployees.length} employee records`);
                    } else {
                        // No employee data found
                        setEmployees([]);
                        setShowReport(false);

                        const errorMsg = response.data?.retrunMsg || 'No employee data found for the selected criteria';
                        toast.error(errorMsg);
                    }
                }
            }
        });
    };

    const handleCancel = () => {
        const defaultHeaders: string[] = []; // Reset to no headers selected

        setFilters({
            selectedHeaders: defaultHeaders,
            format: 'Format 1',
            dateFilter: 'Date of Birth',
            fromDate: new Date('2025-09-17'),
            toDate: new Date('2025-09-17'),
            employeeStatus: ['Working'], // Reset to default
            reportType: 'All',
            // Format 1 specific fields
            employeeType: 'Type',
            selectedEmployeeType: '',
            selectedEmployee: '',
            // Format 2 specific fields
            selectedGroupTypes: [],
            selectedDepartments: [],
            selectedDesignations: []
        });

        // Reset form as well
        reset({
            selectedHeaders: defaultHeaders
        });

        setShowReport(false);
        toast.info('Filters reset');
    };

    const handleExport = () => {
        toast.success('Employee details exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Generate dynamic columns based on selected headers
    const dynamicColumns: ColumnDef<Employee>[] = useMemo(() => {
        const columns: ColumnDef<Employee>[] = [];

        if (filters.selectedHeaders.includes('Employee Code')) {
            columns.push({
                accessorKey: 'employeeCode',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
                cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeCode')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Employee Name')) {
            columns.push({
                accessorKey: 'employeeName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
                cell: ({ row }) => <div>{row.getValue('employeeName')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Father Name')) {
            columns.push({
                accessorKey: 'fatherName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Father Name' />,
                cell: ({ row }) => <div>{row.getValue('fatherName')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Mobile No.')) {
            columns.push({
                accessorKey: 'mobileNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile No.' />,
                cell: ({ row }) => <div>{row.getValue('mobileNo')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Email Id')) {
            columns.push({
                accessorKey: 'emailId',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Email Id' />,
                cell: ({ row }) => <div>{row.getValue('emailId')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Date Of Birth')) {
            columns.push({
                accessorKey: 'dateOfBirth',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Date Of Birth' />,
                cell: ({ row }) => <div>{new Date(row.getValue('dateOfBirth')).toLocaleDateString()}</div>
            });
        }

        if (filters.selectedHeaders.includes('Emergency Contact Number')) {
            columns.push({
                accessorKey: 'emergencyContactNumber',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Emergency Contact' />,
                cell: ({ row }) => <div>{row.getValue('emergencyContactNumber')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Date Of Joining')) {
            columns.push({
                accessorKey: 'dateOfJoining',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Date Of Joining' />,
                cell: ({ row }) => <div>{new Date(row.getValue('dateOfJoining')).toLocaleDateString()}</div>
            });
        }

        if (filters.selectedHeaders.includes('Date Of Leaving')) {
            columns.push({
                accessorKey: 'dateOfLeaving',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Date Of Leaving' />,
                cell: ({ row }) => (
                    <div>{row.getValue('dateOfLeaving') ? new Date(row.getValue('dateOfLeaving')).toLocaleDateString() : '-'}</div>
                )
            });
        }

        if (filters.selectedHeaders.includes('Department')) {
            columns.push({
                accessorKey: 'departmentName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
                cell: ({ row }) => <div>{row.getValue('departmentName')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Designation')) {
            columns.push({
                accessorKey: 'designationName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
                cell: ({ row }) => <div>{row.getValue('designationName')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Address')) {
            columns.push({
                accessorKey: 'address',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Address' />,
                cell: ({ row }) => <div>{row.getValue('address')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Qualification')) {
            columns.push({
                accessorKey: 'qualification',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Qualification' />,
                cell: ({ row }) => <div>{row.getValue('qualification')}</div>
            });
        }

        if (filters.selectedHeaders.includes('Experience')) {
            columns.push({
                accessorKey: 'experience',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Experience' />,
                cell: ({ row }) => <div>{row.getValue('experience')}</div>
            });
        }

        return columns;
    }, [filters.selectedHeaders]);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='space-y-1'>
                    <Heading title='Employee Details Report' description='Generate detailed employee reports with customizable fields' />
                </div>

                {/* Report Configuration Section */}
                <CollapsibleSection
                    title='EMPLOYEE DETAILS REPORT'
                    description='Configure report parameters and filters'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-6'>
                        {/* Format Selection */}
                        <div className='space-y-3'>
                            <Label>Format</Label>
                            <div className='flex items-center gap-6'>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='format'
                                        value='Format 1'
                                        checked={filters.format === 'Format 1'}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                format: e.target.value as 'Format 1' | 'Format 2'
                                            }))
                                        }
                                        className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                    />
                                    Format 1
                                </label>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='format'
                                        value='Format 2'
                                        checked={filters.format === 'Format 2'}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                format: e.target.value as 'Format 1' | 'Format 2'
                                            }))
                                        }
                                        className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                    />
                                    Format 2
                                </label>
                            </div>
                        </div>

                        {/* Header Selection */}
                        <div className='space-y-3'>
                            <Label className='font-semibold'>
                                Header: <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='selectedHeaders'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={availableHeaders.map((header) => ({
                                            label: header,
                                            value: header
                                        }))}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder='Select headers to include in report'
                                        className='w-full'
                                        maxHeight={240}
                                    />
                                )}
                            />
                        </div>

                        {/* Format 1 Specific Sections */}
                        {filters.format === 'Format 1' && (
                            <div className='space-y-6'>
                                {/* Date Filter Selection */}
                                <div className='space-y-3'>
                                    <Label>Date Filter</Label>
                                    <div className='flex items-center gap-6'>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='radio'
                                                name='dateFilter'
                                                value='Date of Birth'
                                                checked={filters.dateFilter === 'Date of Birth'}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        dateFilter: e.target.value as any
                                                    }))
                                                }
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            Date of Birth
                                        </label>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='radio'
                                                name='dateFilter'
                                                value='Date of Joining'
                                                checked={filters.dateFilter === 'Date of Joining'}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        dateFilter: e.target.value as any
                                                    }))
                                                }
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            Date of Joining
                                        </label>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='radio'
                                                name='dateFilter'
                                                value='Date of Leaving'
                                                checked={filters.dateFilter === 'Date of Leaving'}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        dateFilter: e.target.value as any
                                                    }))
                                                }
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            Date of Leaving
                                        </label>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            From: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !filters.fromDate && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : <span>Enter date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0'>
                                                <Calendar
                                                    mode='single'
                                                    selected={filters.fromDate || undefined}
                                                    onSelect={async (date) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            fromDate: date || null
                                                        }));
                                                        // Trigger API call automatically when date changes
                                                        if (date) {
                                                            await triggerFilterAPI();
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label>
                                            To: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !filters.toDate && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : <span>Enter date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0'>
                                                <Calendar
                                                    mode='single'
                                                    selected={filters.toDate || undefined}
                                                    onSelect={async (date) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            toDate: date || null
                                                        }));
                                                        // Trigger API call automatically when date changes
                                                        if (date) {
                                                            await triggerFilterAPI();
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Employee Status */}
                                <div className='space-y-3'>
                                    <Label>Employee Status</Label>
                                    <div className='flex items-center gap-6'>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='checkbox'
                                                checked={filters.employeeStatus.includes('Working')}
                                                onChange={(e) => handleEmployeeStatusChange('Working', e.target.checked)}
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            Working
                                        </label>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='checkbox'
                                                checked={filters.employeeStatus.includes('Left')}
                                                onChange={(e) => handleEmployeeStatusChange('Left', e.target.checked)}
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            Left
                                        </label>
                                    </div>
                                </div>

                                {/* Report Type */}
                                <div className='space-y-3'>
                                    <Label>Report Type</Label>
                                    <div className='flex items-center gap-6'>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='radio'
                                                name='reportType'
                                                value='All'
                                                checked={filters.reportType === 'All'}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        reportType: e.target.value as 'All' | 'Individual'
                                                    }))
                                                }
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            All
                                        </label>
                                        <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                            <input
                                                type='radio'
                                                name='reportType'
                                                value='Individual'
                                                checked={filters.reportType === 'Individual'}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        reportType: e.target.value as 'All' | 'Individual'
                                                    }))
                                                }
                                                className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                            />
                                            Individual
                                        </label>
                                    </div>
                                </div>

                                {/* Employee Type Selection - Only show when Report Type is Individual */}
                                {filters.reportType === 'Individual' && (
                                    <div className='space-y-3'>
                                        <Label>Employee Type</Label>
                                        <div className='flex items-center gap-6'>
                                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                                <input
                                                    type='radio'
                                                    name='employeeType'
                                                    value='Type'
                                                    checked={filters.employeeType === 'Type'}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            employeeType: e.target.value as 'Type' | 'Employee'
                                                        }))
                                                    }
                                                    className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                                />
                                                Type <span className='text-red-500'>*</span>
                                            </label>
                                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                                <input
                                                    type='radio'
                                                    name='employeeType'
                                                    value='Employee'
                                                    checked={filters.employeeType === 'Employee'}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            employeeType: e.target.value as 'Type' | 'Employee'
                                                        }))
                                                    }
                                                    className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
                                                />
                                                Employee <span className='text-red-500'>*</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Type Dropdown - Only show when Employee Type is "Type" and Report Type is "Individual" */}
                                {filters.reportType === 'Individual' && filters.employeeType === 'Type' && (
                                    <div className='space-y-2'>
                                        <Label>Type:</Label>
                                        <Select
                                            value={filters.selectedEmployeeType}
                                            onValueChange={(value) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    selectedEmployeeType: value
                                                }))
                                            }>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Employee Type' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employeeTypes.map((type) => (
                                                    <SelectItem key={type.HRMET_Id} value={type.HRMET_Id.toString()}>
                                                        {type.HRMET_EmployeeType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Employee Dropdown - Only show when Employee Type is "Employee" and Report Type is "Individual" */}
                                {filters.reportType === 'Individual' && filters.employeeType === 'Employee' && (
                                    <div className='space-y-2'>
                                        <Label>
                                            Employee: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            value={filters.selectedEmployee}
                                            onValueChange={(value) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    selectedEmployee: value
                                                }))
                                            }>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Employee' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employeeList.map((employee) => (
                                                    <SelectItem key={employee} value={employee}>
                                                        {employee}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Format 2 Specific Sections */}
                        {filters.format === 'Format 2' && (
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                                {/* Group Type Selection */}
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <label className='font-medium text-foreground text-sm'>
                                            Group Type: <span className='text-red-500'>*</span>
                                        </label>
                                        <Button variant='outline' size='sm' onClick={handleSelectAllGroupTypes} className='text-xs'>
                                            {filters.selectedGroupTypes.length === groupTypes.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    <div className='max-h-48 overflow-y-auto rounded-md border bg-background p-3'>
                                        <div className='space-y-2'>
                                            <label className='flex cursor-pointer items-center gap-2 font-medium text-sm'>
                                                <Checkbox
                                                    checked={filters.selectedGroupTypes.length === groupTypes.length}
                                                    onCheckedChange={handleSelectAllGroupTypes}
                                                />
                                                All
                                            </label>
                                            {groupTypes.map((groupType) => (
                                                <label key={groupType.HRMGT_Id} className='flex cursor-pointer items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        checked={filters.selectedGroupTypes.includes(groupType.HRMGT_Id.toString())}
                                                        onCheckedChange={() => handleGroupTypeToggle(groupType.HRMGT_Id.toString())}
                                                    />
                                                    {groupType.HRMGT_EmployeeGroupType}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Department Selection */}
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <label className='font-medium text-foreground text-sm'>
                                            Department: <span className='text-red-500'>*</span>
                                        </label>
                                        <Button variant='outline' size='sm' onClick={handleSelectAllDepartments} className='text-xs'>
                                            {filters.selectedDepartments.length === departments.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    <div className='max-h-48 overflow-y-auto rounded-md border bg-background p-3'>
                                        <div className='space-y-2'>
                                            <label className='flex cursor-pointer items-center gap-2 font-medium text-sm'>
                                                <Checkbox
                                                    checked={filters.selectedDepartments.length === departments.length}
                                                    onCheckedChange={handleSelectAllDepartments}
                                                />
                                                All
                                            </label>
                                            {departments.map((department) => (
                                                <label key={department.HRMD_Id} className='flex cursor-pointer items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        checked={filters.selectedDepartments.includes(department.HRMD_Id.toString())}
                                                        onCheckedChange={() => handleDepartmentToggle(department.HRMD_Id.toString())}
                                                    />
                                                    {department.HRMD_DepartmentName}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Designation Selection */}
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <label className='font-medium text-foreground text-sm'>
                                            Designation: <span className='text-red-500'>*</span>
                                        </label>
                                        <Button variant='outline' size='sm' onClick={handleSelectAllDesignations} className='text-xs'>
                                            {filters.selectedDesignations.length === designations.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    <div className='max-h-48 overflow-y-auto rounded-md border bg-background p-3'>
                                        <div className='space-y-2'>
                                            <label className='flex cursor-pointer items-center gap-2 font-medium text-sm'>
                                                <Checkbox
                                                    checked={filters.selectedDesignations.length === designations.length}
                                                    onCheckedChange={handleSelectAllDesignations}
                                                />
                                                All
                                            </label>
                                            {designations.map((designation) => (
                                                <label
                                                    key={designation.HRMDES_Id}
                                                    className='flex cursor-pointer items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        checked={filters.selectedDesignations.includes(designation.HRMDES_Id.toString())}
                                                        onCheckedChange={() => handleDesignationToggle(designation.HRMDES_Id.toString())}
                                                    />
                                                    {designation.HRMDES_DesignationName}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                            <Button variant='outline' onClick={handleCancel} className='w-fit transition-all duration-200 hover:scale-105'>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                            <Button onClick={handleSearch} className='w-fit transition-all duration-200 hover:scale-105'>
                                <Search className='mr-2 h-4 w-4' />
                                SEARCH
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Report Results */}
                {showReport && (
                    <CollapsibleSection
                        title='Employee Details Report'
                        description={`Total Records: ${filteredEmployees.length} employees | Date Filter: ${
                            filters.dateFilter
                        } | Selected Fields: ${filters.selectedHeaders.length > 0 ? filters.selectedHeaders.length : 'None selected'}`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='mb-4 flex justify-end gap-2'>
                            <Button variant='outline' onClick={handleExport} className='w-fit transition-all duration-200 hover:scale-105'>
                                <Download className='mr-2 h-4 w-4' />
                                Export
                            </Button>
                            <Button variant='outline' onClick={handlePrint} className='w-fit transition-all duration-200 hover:scale-105'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>

                        <div className='overflow-hidden rounded-lg bg-card'>
                            <DataTable
                                isLoading={searchMutation.isPending || filterMutation.isPending}
                                columns={dynamicColumns}
                                data={filteredEmployees}
                                totalItems={filteredEmployees.length}
                                showViewOptions={true}
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
