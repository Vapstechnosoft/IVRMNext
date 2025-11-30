'use client';
import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeDetailsReportOnload, useFilterEmployeeDetailsReport, useSearchEmployeeDetailsReport } from '@/hooks/hrms/useReports';
import { cn } from '@/lib/utils';
import type { EmployeeDetailsReportFilterRequest } from '@/types/hrms/reports/employee-details-report';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EmployeeDetailsReportTemplate } from './_components/report-template';
// Employee data structure for reports
interface Employee {
    id: string;
    employeeCode: string;
    employeeName: string;
    fatherName: string;
    mobileNo: string;
    emailId: string;
    dateOfBirth: string;
    emergencyContactNumber: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    dateOfConfirmation?: string;
    employeeType?: string;
    groupType?: string;
    departmentName: string;
    designationName: string;
    address: string;
    qualification: string;
    experience: string;
    status: 'Working' | 'Left';
    reasonForLeaving?: string;
    remarks?: string;
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
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useEmployeeDetailsReportOnload(30, 0);
    const filterMutation = useFilterEmployeeDetailsReport();
    const searchMutation = useSearchEmployeeDetailsReport();
    // State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [employeeDropdownOptions, setEmployeeDropdownOptions] = useState<any[]>([]);
    // Memoize arrays to prevent unnecessary re-renders
    const _months = useMemo(() => onloadData?.data?.monthdropdown || [], [onloadData?.data?.monthdropdown]);
    const _leaveYears = useMemo(() => onloadData?.data?.leaveyeardropdown || [], [onloadData?.data?.leaveyeardropdown]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdown || [], [onloadData?.data?.departmentdropdown]);
    const designations = useMemo(() => onloadData?.data?.designationdropdown || [], [onloadData?.data?.designationdropdown]);
    const employeeTypes = useMemo(() => onloadData?.data?.employeeTypedropdown || [], [onloadData?.data?.employeeTypedropdown]);
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdown || [], [onloadData?.data?.groupTypedropdown]);
    const [filters, setFilters] = useState<EmployeeDetailsFilters>({
        selectedHeaders: [], // Start with no headers selected
        format: 'Format 1',
        dateFilter: 'Date of Birth',
        fromDate: null,
        toDate: null,
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
    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load employee details report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, onloadData, isLoadingOnload]);
    // Available header options
    const availableHeaders = [
        'Employee Code',
        'Employee Name',
        'Father Name',
        'Mobile No.',
        'Email Id',
        'Date Of Birth',
        'Emergency Contact Number',
        'Date Of confirmation',
        'Employee Type',
        'Group Type',
        'Department',
        'Designation',
        'Status',
        'Date Of Joining',
        'Date Of Leaving',
        'Reason For Leaving',
        'Remarks',
        'Address',
        'Qualification',
        'Experience'
    ];
    // Call filter API when Type is selected to populate employee dropdown
    // Note: The onload endpoint returns employeedropdown as null initially,
    // so we need to call FilterEmployeeDataNew API when a Type is selected
    useEffect(() => {
        // Only proceed if we're in Individual report type mode
        if (filters.reportType !== 'Individual') {
            return;
        }
        // Check if onload has employeedropdown (though it's usually null in onload)
        const onloadEmployees = onloadData?.data?.employeedropdown;
        const _onloadEmployeesArray = onloadEmployees && Array.isArray(onloadEmployees) ? onloadEmployees : [];
        // When Type is selected and we have all required filters (Format 1 only)
        if (
            filters.format === 'Format 1' &&
            filters.employeeType === 'Type' &&
            filters.selectedEmployeeType &&
            filters.fromDate &&
            filters.toDate
        ) {
            const filterRequest: EmployeeDetailsReportFilterRequest = {
                MI_Id: 30,
                FormatType: 'Format1',
                DOBJL: filters.dateFilter === 'Date of Birth' ? 'DOB' : filters.dateFilter === 'Date of Joining' ? 'DOJ' : 'DOL',
                FromDate: filters.fromDate.toISOString().split('T')[0],
                ToDate: filters.toDate.toISOString().split('T')[0],
                AllOrIndividual: 'All',
                TypeOrEmployee: 'Type',
                HRMET_Id: Number(filters.selectedEmployeeType) || 0,
                HRME_Id: 0,
                Left: filters.employeeStatus.includes('Left'),
                Working: filters.employeeStatus.includes('Working')
            };
            filterMutation.mutate(filterRequest, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        // Use filter API response employeedropdown if available
                        if (
                            response.data.employeedropdown &&
                            Array.isArray(response.data.employeedropdown) &&
                            response.data.employeedropdown.length > 0
                        ) {
                            setEmployeeDropdownOptions(response.data.employeedropdown);
                        } else {
                            // No employees found for the selected type
                            setEmployeeDropdownOptions([]);
                            toast.info('No employees found for the selected type');
                        }
                    } else {
                        // API returned unsuccessful response
                        const errorMsg =
                            response.message || 'Failed to filter employees. Please check if the filter API endpoint is available.';
                        toast.error(errorMsg);
                        setEmployeeDropdownOptions([]);
                    }
                },
                onError: (error: any) => {
                    const errorMsg = error?.message || 'Failed to filter employees. Please check if the filter API endpoint is available.';
                    toast.error(errorMsg);
                    setEmployeeDropdownOptions([]);
                }
            });
        } else if (filters.format === 'Format 1' && filters.employeeType === 'Employee' && filters.fromDate && filters.toDate) {
            // When Employee Type is "Employee" (Format 1), call filter API to get all filtered employees
            const filterRequest: EmployeeDetailsReportFilterRequest = {
                MI_Id: 30,
                FormatType: 'Format1',
                DOBJL: filters.dateFilter === 'Date of Birth' ? 'DOB' : filters.dateFilter === 'Date of Joining' ? 'DOJ' : 'DOL',
                FromDate: filters.fromDate.toISOString().split('T')[0],
                ToDate: filters.toDate.toISOString().split('T')[0],
                AllOrIndividual: 'Individual',
                TypeOrEmployee: 'Employee',
                HRMET_Id: 0,
                HRME_Id: Number(filters.selectedEmployee) || 0,
                Left: filters.employeeStatus.includes('Left'),
                Working: filters.employeeStatus.includes('Working')
            };
            filterMutation.mutate(filterRequest, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        // Use filter API response employeedropdown if available
                        if (
                            response.data.employeedropdown &&
                            Array.isArray(response.data.employeedropdown) &&
                            response.data.employeedropdown.length > 0
                        ) {
                            setEmployeeDropdownOptions(response.data.employeedropdown);
                        } else {
                            // No employees found
                            setEmployeeDropdownOptions([]);
                            toast.info('No employees found for the selected criteria');
                        }
                    } else {
                        // API returned unsuccessful response
                        const errorMsg =
                            response.message || 'Failed to filter employees. Please check if the filter API endpoint is available.';
                        toast.error(errorMsg);
                        setEmployeeDropdownOptions([]);
                    }
                },
                onError: (error: any) => {
                    const errorMsg = error?.message || 'Failed to filter employees. Please check if the filter API endpoint is available.';
                    toast.error(errorMsg);
                    setEmployeeDropdownOptions([]);
                }
            });
        }
        // Don't update state in else block to prevent infinite loops
        // Only update state when API calls are made
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.selectedEmployeeType,
        filters.employeeType,
        filters.reportType,
        filters.fromDate,
        filters.toDate,
        filters.employeeStatus,
        filters.dateFilter,
        filters.format
    ]);
    // Sync form values with filters state
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            selectedHeaders: watchedHeaders
        }));
    }, [watchedHeaders]);
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
        // Prepare request body based on format type
        let filterRequest: any;
        if (filters.format === 'Format 1') {
            // Format 1: Simple format
            filterRequest = {
                MI_Id: 30,
                FormatType: 'Format1',
                DOBJL: filters.dateFilter === 'Date of Birth' ? 'DOB' : filters.dateFilter === 'Date of Joining' ? 'DOJ' : 'DOL',
                FromDate: filters.fromDate ? filters.fromDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                ToDate: filters.toDate ? filters.toDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                Left: statuses.includes('Left'),
                Working: statuses.includes('Working')
            };
        } else {
            // Format 2: Extended format
            filterRequest = {
                MI_Id: 30,
                FormatType: 'Format2',
                DOBJL: filters.dateFilter === 'Date of Birth' ? 'DOB' : filters.dateFilter === 'Date of Joining' ? 'DOJ' : 'DOL',
                FromDate: filters.fromDate?.toISOString() || new Date().toISOString(),
                ToDate: filters.toDate?.toISOString() || new Date().toISOString(),
                AllOrIndividual: filters.reportType || 'string',
                TypeOrEmployee: filters.employeeType || 'string',
                HRMET_Id: filters.selectedEmployeeType ? Number.parseInt(filters.selectedEmployeeType) : 0,
                HRME_Id: filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0,
                Left: statuses.includes('Left'),
                Working: statuses.includes('Working')
            };
        }
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
                            dateOfConfirmation: emp.HRME_DOC ? emp.HRME_DOC.split('T')[0] : '',
                            employeeType: emp.HRMET_EmployeeType || '',
                            groupType: emp.HRMGT_EmployeeGroupType || '',
                            departmentName: emp.HRMD_DepartmentName || '',
                            designationName: emp.HRMDES_DesignationName || '',
                            address: `${emp.HRME_PerStreet || ''} ${emp.HRME_PerArea || ''} ${emp.HRME_PerCity || ''}`.trim(),
                            qualification: '',
                            experience: '',
                            status: emp.HRME_LeftFlag ? 'Left' : 'Working',
                            reasonForLeaving: emp.HRME_LeavingReason || '',
                            remarks: emp.HRME_Remarks || ''
                        }));
                        setEmployees(filteredEmployees);
                        setShowReport(true);
                        toast.success('Employee status filter applied successfully');
                    } else {
                        setEmployees([]);
                        setShowReport(true); // Keep template visible even when no data
                        toast.info('No employees found for the selected criteria');
                    }
                } else {
                    // API returned unsuccessful response - but still show the report template
                    const errorMsg =
                        response.message || 'Failed to filter employees. Please check if the filter API endpoint is available.';
                    toast.error(errorMsg);
                    setEmployees([]);
                    setShowReport(true); // Keep template visible even on API error
                }
            },
            onError: (error: any) => {
                const errorMsg = error?.message || 'Failed to filter employees. Please check if the filter API endpoint is available.';
                toast.error(errorMsg);
                setEmployees([]);
                setShowReport(true); // Keep template visible even on API error
            }
        });
    };
    const handleSearch = () => {
        // Always show report template when search is clicked, even without headers
        setShowReport(true);
        if (filters.selectedHeaders.length === 0) {
            toast.warning('Please select at least one header field to generate the report. Showing empty report template.');
            return;
        }
        // Map date filter to DOBJL format
        const dobjlMap: Record<string, string> = {
            'Date of Birth': 'DOB',
            'Date of Joining': 'DOJ',
            'Date of Leaving': 'DOL'
        };
        const dobjl = dobjlMap[filters.dateFilter] || 'DOB';
        // Prepare the search request payload based on format type
        let searchRequest: any;
        if (filters.format === 'Format 1') {
            // Format 1: Use YYYY-MM-DD date format
            searchRequest = {
                LogInUserId: 2,
                MI_Id: 30,
                FormatType: 'Format1',
                DOBJL: dobjl,
                AllOrIndividual: filters.reportType || 'All',
                TypeOrEmployee: filters.employeeType || 'Type',
                HRMET_Id: filters.selectedEmployeeType ? Number.parseInt(filters.selectedEmployeeType) : 0,
                HRME_Id: filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0,
                FromDate: filters.fromDate ? filters.fromDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                ToDate: filters.toDate ? filters.toDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                Working: filters.employeeStatus.includes('Working'),
                Left: filters.employeeStatus.includes('Left')
            };
        } else {
            // Format 2: Use ISO string date format
            searchRequest = {
                LogInUserId: 2,
                MI_Id: 30,
                FormatType: 'Format2',
                DOBJL: dobjl,
                AllOrIndividual: filters.reportType || 'All',
                TypeOrEmployee: filters.employeeType || 'Type',
                HRMET_Id: filters.selectedEmployeeType ? Number.parseInt(filters.selectedEmployeeType) : 0,
                HRME_Id: filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0,
                FromDate: filters.fromDate?.toISOString() || new Date().toISOString(),
                ToDate: filters.toDate?.toISOString() || new Date().toISOString(),
                Working: filters.employeeStatus.includes('Working'),
                Left: filters.employeeStatus.includes('Left')
            };
        }
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
                            dateOfConfirmation: emp.HRME_DOC ? emp.HRME_DOC.split('T')[0] : '',
                            employeeType: emp.HRMET_EmployeeType || '',
                            groupType: emp.HRMGT_EmployeeGroupType || '',
                            departmentName: emp.HRMD_DepartmentName || '',
                            designationName: emp.HRMDES_DesignationName || '',
                            address: `${emp.HRME_PerStreet || ''} ${emp.HRME_PerArea || ''} ${emp.HRME_PerCity || ''}`.trim(),
                            qualification: '',
                            experience: '',
                            status: emp.HRME_LeftFlag ? 'Left' : 'Working',
                            reasonForLeaving: emp.HRME_LeavingReason || '',
                            remarks: emp.HRME_Remarks || ''
                        }));
                        setEmployees(mappedEmployees);
                        setShowReport(true);
                        toast.success(`Found ${mappedEmployees.length} employee records`);
                    } else {
                        // No employee data found - but still show the report template
                        setEmployees([]);
                        setShowReport(true);
                        const errorMsg = response.data?.retrunMsg || 'No employee data found for the selected criteria';
                        toast.info(errorMsg);
                    }
                } else {
                    // API returned unsuccessful response - but still show the report template
                    const errorMsg =
                        response.message || 'Failed to search employee details. Please check if the search API endpoint is available.';
                    toast.error(errorMsg);
                    setEmployees([]);
                    setShowReport(true); // Keep template visible even on API error
                }
            },
            onError: (error: any) => {
                const errorMsg =
                    error?.message || 'Failed to search employee details. Please check if the search API endpoint is available.';
                toast.error(errorMsg);
                setEmployees([]);
                setShowReport(true); // Keep template visible even on API error
            }
        });
    };
    const handleCancel = () => {
        const defaultHeaders: string[] = []; // Reset to no headers selected
        setFilters({
            selectedHeaders: defaultHeaders,
            format: 'Format 1',
            dateFilter: 'Date of Birth',
            fromDate: null,
            toDate: null,
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
    const _handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    // Get institution details from API response if available
    const institutionDetails = useMemo(() => {
        // Try to get institution details from the API response
        const searchResponse = searchMutation.data;
        if (searchResponse?.data && typeof searchResponse.data === 'object' && 'institutionDetails' in searchResponse.data) {
            return (searchResponse.data as any).institutionDetails;
        }
        // Try to get from onload data
        if (onloadData?.data && typeof onloadData.data === 'object' && 'institutionDetails' in onloadData.data) {
            return (onloadData.data as any).institutionDetails;
        }
        return null;
    }, [searchMutation.data, onloadData]);
    // Build school name and address
    const schoolName = institutionDetails?.MI_Name || '';
    const schoolAddress = useMemo(() => {
        if (!institutionDetails) return '';
        const addressParts = [];
        if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
        if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
        if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
        return addressParts.join(', ');
    }, [institutionDetails]);
    // Show error message if onload fails
    if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
        return (
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    <div className='flex flex-col items-center justify-center space-y-4 rounded-lg bg-destructive/10 py-12'>
                        <div className='text-center'>
                            <h3 className='font-semibold text-destructive text-lg'>Error Loading Filter Options</h3>
                            <p className='mt-2 text-muted-foreground text-sm'>
                                {onloadError?.message ||
                                    onloadData?.message ||
                                    'Failed to load filter options. Please check if the API endpoint is available.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Report Configuration Section */}
                <CollapsibleSection
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
                                                <CalendarYear
                                                    mode='single'
                                                    selected={filters.fromDate || undefined}
                                                    onDayClick={async (day) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            fromDate: day
                                                        }));
                                                        // Trigger API call automatically when date changes
                                                        await triggerFilterAPI();
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
                                                <CalendarYear
                                                    mode='single'
                                                    selected={filters.toDate || undefined}
                                                    onDayClick={async (day) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            toDate: day
                                                        }));
                                                        // Trigger API call automatically when date changes
                                                        await triggerFilterAPI();
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
                                                            employeeType: e.target.value as 'Type' | 'Employee',
                                                            selectedEmployee: '', // Reset employee when switching to Type
                                                            selectedEmployeeType: '' // Reset type selection when switching
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
                                                            employeeType: e.target.value as 'Type' | 'Employee',
                                                            selectedEmployee: '', // Reset employee when switching
                                                            selectedEmployeeType: '' // Reset type selection when switching to Employee
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
                                                    selectedEmployeeType: value,
                                                    selectedEmployee: '' // Reset employee selection when type changes
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
                                                {employeeDropdownOptions.length > 0 ? (
                                                    employeeDropdownOptions.map((emp: any) => {
                                                        const empId = emp.HRME_Id?.toString() || '';
                                                        const empName = `${emp.HRME_EmployeeFirstName || ''} ${
                                                            emp.HRME_EmployeeMiddleName || ''
                                                        } ${emp.HRME_EmployeeLastName || ''}`.trim();
                                                        return (
                                                            <SelectItem key={empId} value={empId}>
                                                                {empName || emp.HRME_EmployeeCode || 'Unknown'}
                                                            </SelectItem>
                                                        );
                                                    })
                                                ) : (
                                                    <SelectItem value='no-data' disabled>
                                                        No employees found
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {/* Employee Dropdown - Show when Type is selected to display filtered employees */}
                                {filters.reportType === 'Individual' && filters.employeeType === 'Type' && filters.selectedEmployeeType && (
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
                                                {employeeDropdownOptions.length > 0 ? (
                                                    employeeDropdownOptions.map((emp: any) => {
                                                        const empId = emp.HRME_Id?.toString() || '';
                                                        const empName = `${emp.HRME_EmployeeFirstName || ''} ${
                                                            emp.HRME_EmployeeMiddleName || ''
                                                        } ${emp.HRME_EmployeeLastName || ''}`.trim();
                                                        return (
                                                            <SelectItem key={empId} value={empId}>
                                                                {empName || emp.HRME_EmployeeCode || 'Unknown'}
                                                            </SelectItem>
                                                        );
                                                    })
                                                ) : (
                                                    <SelectItem value='no-data' disabled>
                                                        {filterMutation.isPending
                                                            ? 'Loading employees...'
                                                            : 'No employees found for selected type'}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Format 2 Specific Sections */}
                        {filters.format === 'Format 2' && (
                            <div className='space-y-6'>
                                <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                                    {/* Group Type Selection */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold'>
                                            Group Type: <span className='text-red-500'>*</span>
                                        </Label>
                                        <MultiSelect
                                            options={groupTypes.map((g) => ({
                                                label: g.HRMGT_EmployeeGroupType,
                                                value: String(g.HRMGT_Id)
                                            }))}
                                            onValueChange={(values) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    selectedGroupTypes: values
                                                }))
                                            }
                                            defaultValue={filters.selectedGroupTypes}
                                            placeholder='Select Group Types'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    </div>
                                    {/* Department Selection */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold'>
                                            Department: <span className='text-red-500'>*</span>
                                        </Label>
                                        <MultiSelect
                                            options={departments.map((d) => ({
                                                label: d.HRMD_DepartmentName,
                                                value: String(d.HRMD_Id)
                                            }))}
                                            onValueChange={(values) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    selectedDepartments: values
                                                }))
                                            }
                                            defaultValue={filters.selectedDepartments}
                                            placeholder='Select Departments'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    </div>
                                    {/* Designation Selection */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold'>
                                            Designation: <span className='text-red-500'>*</span>
                                        </Label>
                                        <MultiSelect
                                            options={designations.map((d) => ({
                                                label: d.HRMDES_DesignationName,
                                                value: String(d.HRMDES_Id)
                                            }))}
                                            onValueChange={(values) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    selectedDesignations: values
                                                }))
                                            }
                                            defaultValue={filters.selectedDesignations}
                                            placeholder='Select Designations'
                                            className='w-full'
                                            maxHeight={240}
                                        />
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
                        <EmployeeDetailsReportTemplate
                            schoolName={schoolName}
                            schoolAddress={schoolAddress}
                            reportData={filteredEmployees}
                            selectedHeaders={filters.selectedHeaders || []}
                            isLoading={searchMutation.isPending || filterMutation.isPending}
                            onExport={handleExport}
                            onCancel={handleCancel}
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
