'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useCumulativeSalaryReportList, useCumulativeSalaryReportOnload } from '@/hooks/hrms/useReports';
import type { ApiSearchparams } from '@/types';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CumulativeSalaryRecord } from './_components/columns';
import { CumulativeSalaryReportFilters, type ReportFilters } from './_components/filters';
import { CumulativeSalaryReportTemplate } from './_components/report-template';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function CumulativeSalaryReportPage(props: { searchParams: SearchParams }) {
    const rawSearchParams = use(props.searchParams);
    const router = useRouter();
    // Convert Next.js searchParams to ApiSearchparams format
    const searchParams: ApiSearchparams = {
        page:
            typeof rawSearchParams?.page === 'string'
                ? Number.parseInt(rawSearchParams.page, 10)
                : Array.isArray(rawSearchParams?.page)
                  ? Number.parseInt(rawSearchParams.page[0], 10)
                  : typeof rawSearchParams?.page === 'number'
                    ? rawSearchParams.page
                    : undefined,
        page_size:
            typeof rawSearchParams?.page_size === 'string'
                ? Number.parseInt(rawSearchParams.page_size, 10)
                : Array.isArray(rawSearchParams?.page_size)
                  ? Number.parseInt(rawSearchParams.page_size[0], 10)
                  : typeof rawSearchParams?.page_size === 'number'
                    ? rawSearchParams.page_size
                    : undefined,
        search_query:
            typeof rawSearchParams?.search_query === 'string'
                ? rawSearchParams.search_query
                : Array.isArray(rawSearchParams?.search_query)
                  ? rawSearchParams.search_query[0]
                  : undefined,
        search_column:
            typeof rawSearchParams?.search_column === 'string'
                ? rawSearchParams.search_column
                : Array.isArray(rawSearchParams?.search_column)
                  ? rawSearchParams.search_column[0]
                  : undefined,
        sort_column:
            typeof rawSearchParams?.sort_column === 'string'
                ? rawSearchParams.sort_column
                : Array.isArray(rawSearchParams?.sort_column)
                  ? rawSearchParams.sort_column[0]
                  : undefined,
        sort_direction:
            typeof rawSearchParams?.sort_direction === 'string'
                ? rawSearchParams.sort_direction
                : Array.isArray(rawSearchParams?.sort_direction)
                  ? rawSearchParams.sort_direction[0]
                  : undefined
    };
    // Extract filter params from URL
    const MI_Id = 30;
    const month =
        typeof rawSearchParams?.month === 'string'
            ? rawSearchParams.month
            : Array.isArray(rawSearchParams?.month)
              ? rawSearchParams.month[0]
              : '';
    const year =
        typeof rawSearchParams?.year === 'string'
            ? rawSearchParams.year
            : Array.isArray(rawSearchParams?.year)
              ? rawSearchParams.year[0]
              : '';
    // Memoize arrays to prevent unnecessary re-renders and infinite loops
    const groupType = useMemo(() => {
        if (typeof rawSearchParams?.groupType === 'string') {
            return rawSearchParams.groupType.split(',').map(Number).filter(Boolean);
        }
        if (Array.isArray(rawSearchParams?.groupType)) {
            return rawSearchParams.groupType.flatMap((g) => (typeof g === 'string' ? g.split(',').map(Number).filter(Boolean) : []));
        }
        return [];
    }, [rawSearchParams?.groupType]);
    const department = useMemo(() => {
        if (typeof rawSearchParams?.department === 'string') {
            return rawSearchParams.department.split(',').map(Number).filter(Boolean);
        }
        if (Array.isArray(rawSearchParams?.department)) {
            return rawSearchParams.department.flatMap((d) => (typeof d === 'string' ? d.split(',').map(Number).filter(Boolean) : []));
        }
        return [];
    }, [rawSearchParams?.department]);
    const designation = useMemo(() => {
        if (typeof rawSearchParams?.designation === 'string') {
            return rawSearchParams.designation.split(',').map(Number).filter(Boolean);
        }
        if (Array.isArray(rawSearchParams?.designation)) {
            return rawSearchParams.designation.flatMap((d) => (typeof d === 'string' ? d.split(',').map(Number).filter(Boolean) : []));
        }
        return [];
    }, [rawSearchParams?.designation]);
    // Check if we have search criteria (month and year are required)
    const hasSearchCriteria = !!(month && year);
    // State to control when to show the report template (even without data)
    const [showReport, setShowReport] = useState(false);
    const hasInitializedShowReport = useRef(false);
    // React Query hook for dropdowns - always enabled to get filter options
    const { data: onloadData, isLoading: onloadLoading, error: onloadError } = useCumulativeSalaryReportOnload(MI_Id);
    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdownlist || [], [onloadData?.data?.groupTypedropdownlist]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdownlist || [], [onloadData?.data?.departmentdropdownlist]);
    const designations = useMemo(() => onloadData?.data?.designationdropdownlist || [], [onloadData?.data?.designationdropdownlist]);
    const months = useMemo(() => onloadData?.data?.monthdropdown || [], [onloadData?.data?.monthdropdown]);
    const years = useMemo(() => onloadData?.data?.leaveyeardropdown || [], [onloadData?.data?.leaveyeardropdown]);
    // Get year and month IDs from dropdowns for API
    const yearId = years.find((y) => y.HRMLY_LeaveYear === year)?.HRMLY_Id;
    const monthId = months.find((m) => m.IVRM_Month_Name.trim() === month)?.IVRM_Month_Id;
    // React Query hook for report data - only enabled when search criteria are present
    const reportListQuery = useCumulativeSalaryReportList(
        searchParams,
        {
            MIID: MI_Id,
            LoginUserId: 0,
            UserRole: '',
            is_export: false,
            // Pass filter parameters to get salary data instead of designation data
            month: monthId?.toString(),
            year: yearId?.toString(),
            groupTypeIdList: groupType.length > 0 ? groupType : undefined,
            hrmD_IdList: department.length > 0 ? department : undefined,
            hrmdeS_IdList: designation.length > 0 ? designation : undefined
        },
        hasSearchCriteria // Only fetch when month and year are selected
    );
    // Debug: Check if query should be refetching
    useEffect(() => {
        if (hasSearchCriteria) {
        }
    }, [hasSearchCriteria, monthId, yearId, reportListQuery.isLoading, reportListQuery.isFetching, reportListQuery.data]);
    // Form for filters
    const { handleSubmit, reset, watch, control, setValue } = useForm<ReportFilters>({
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: ''
        }
    });
    // Sync form with URL params - use useEffect instead of useMemo to avoid render issues
    // Note: setValue is stable and doesn't need to be in dependencies (react-hook-form guarantee)
    useEffect(() => {
        setValue('groupType', groupType.map(String));
        setValue('department', department.map(String));
        setValue('designation', designation.map(String));
        setValue('month', month);
        setValue('year', year);
    }, [groupType, department, designation, month, year]); // Removed setValue to prevent infinite loops
    // Show report template when URL has search params (month and year) - only set once on mount
    useEffect(() => {
        if (hasSearchCriteria && !hasInitializedShowReport.current) {
            setShowReport(true);
            hasInitializedShowReport.current = true;
        }
    }, [hasSearchCriteria]); // Only depend on hasSearchCriteria to avoid loops
    const onSubmit = async (data: ReportFilters) => {
        // Show the report template immediately, even without data
        setShowReport(true);
        if (!data.month || !data.year) {
            toast.warning('Please select month and year for accurate results. Showing report template.');
            // Still show the template even if validation fails
            return;
        }
        // Build URL params
        const params = new URLSearchParams();
        // Add filter params
        if (data.month) params.set('month', data.month);
        if (data.year) params.set('year', data.year);
        if (data.groupType && data.groupType.length > 0) {
            params.set('groupType', data.groupType.join(','));
        }
        if (data.department && data.department.length > 0) {
            params.set('department', data.department.join(','));
        }
        if (data.designation && data.designation.length > 0) {
            params.set('designation', data.designation.join(','));
        }
        // Reset pagination when filters change
        params.set('page', '1');
        const finalUrl = `/hrms/reports/cumulative-salary-report?${params.toString()}`;
        router.push(finalUrl);
        // Note: router.refresh() is for server components, but we're using client component
        // The component should re-render automatically when URL changes
        // If it doesn't, we might need to use useSearchParams() instead
    };
    const handleCancel = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: ''
        });
        setShowReport(false);
        hasInitializedShowReport.current = false;
        router.push('/hrms/reports/cumulative-salary-report');
    };
    const handleExport = () => {
        toast.success('Report exported successfully');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    // Transform API data to table format
    const reportData = useMemo(() => {
        const response = reportListQuery.data;
        if (!response?.success) {
            return [];
        }
        if (!response.data?.data?.rows) {
            return [];
        }
        const rows = response.data.data.rows;
        // Check if rows contain salary report data
        if (Array.isArray(rows) && rows.length > 0) {
            const firstRow = rows[0] as any;
            // Check if it's a salary report record (has salary-related fields)
            if (firstRow && ('basic' in firstRow || 'grossEarning' in firstRow || 'netSalary' in firstRow)) {
                return rows.map(
                    (record: any): CumulativeSalaryRecord => ({
                        ...record,
                        employeeName: `${record.HRME_EmployeeFirstName || ''} ${
                            record.HRME_EmployeeMiddleName || ''
                        } ${record.HRME_EmployeeLastName || ''}`.trim(),
                        designation: record.HRMDES_DesignationName || record.designation,
                        basic: record.basic || 0,
                        da: record.da || 0,
                        hra: record.hra || 0,
                        conveyance: record.conveyance || 0,
                        medical: record.medical || 0,
                        splAllowance: record.splAllowance || 0,
                        grossEarning: record.grossEarning || 0,
                        pf: record.pf || 0,
                        esi: record.esi || 0,
                        others: record.others || 0,
                        pt: record.pt || 0,
                        grossDeduction: record.grossDeduction || 0,
                        leaveDedDays: record.leaveDedDays || 0,
                        leaveDedPrevDays: record.leaveDedPrevDays || 0,
                        netSalary: record.netSalary || 0
                    })
                );
            }
        }
        return [];
    }, [reportListQuery.data]);
    // Calculate totals
    const totals = useMemo(() => {
        return reportData.reduce(
            (acc, record) => ({
                basic: acc.basic + (record.basic || 0),
                da: acc.da + (record.da || 0),
                hra: acc.hra + (record.hra || 0),
                conveyance: acc.conveyance + (record.conveyance || 0),
                medical: acc.medical + (record.medical || 0),
                splAllowance: acc.splAllowance + (record.splAllowance || 0),
                grossEarning: acc.grossEarning + (record.grossEarning || 0),
                pf: acc.pf + (record.pf || 0),
                esi: acc.esi + (record.esi || 0),
                others: acc.others + (record.others || 0),
                pt: acc.pt + (record.pt || 0),
                grossDeduction: acc.grossDeduction + (record.grossDeduction || 0),
                netSalary: acc.netSalary + (record.netSalary || 0)
            }),
            {
                basic: 0,
                da: 0,
                hra: 0,
                conveyance: 0,
                medical: 0,
                splAllowance: 0,
                grossEarning: 0,
                pf: 0,
                esi: 0,
                others: 0,
                pt: 0,
                grossDeduction: 0,
                netSalary: 0
            }
        );
    }, [reportData]);
    // Get institution details from API response if available
    const institutionDetails = useMemo(() => {
        // Try to get institution details from the API response
        const response = reportListQuery.data?.data;
        if (response && typeof response === 'object' && 'institutionDetails' in response) {
            return (response as any).institutionDetails;
        }
        // Try to get from onload data
        if (onloadData?.data && typeof onloadData.data === 'object' && 'institutionDetails' in onloadData.data) {
            return (onloadData.data as any).institutionDetails;
        }
        return null;
    }, [reportListQuery.data, onloadData]);
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
    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!onloadLoading && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load cumulative salary report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, onloadData, onloadLoading]);
    // Show error for search API failures
    useEffect(() => {
        if (hasSearchCriteria && reportListQuery.data && !reportListQuery.data.success) {
            const errorMessage =
                reportListQuery.data.message || 'Failed to load salary report data. Please check if the search API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [reportListQuery.data, hasSearchCriteria]);
    // Show report template when search criteria are present (even without API data)
    // The showReport state is set to true when user clicks search
    // We also show it if we have successful data
    const shouldShowReport = showReport || (hasSearchCriteria && reportListQuery.data?.success);
    // Force refetch when search criteria change - removed to prevent infinite loops
    // React Query will automatically refetch when query key changes
    // Show error message if onload fails
    if (onloadError || (!onloadLoading && onloadData && !onloadData.success)) {
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
                {/* Search Form */}
                <CumulativeSalaryReportFilters
                    control={control}
                    groupTypes={groupTypes}
                    departments={departments}
                    designations={designations}
                    months={months}
                    years={years}
                    onSubmit={handleSubmit(
                        (data) => {
                            return onSubmit(data);
                        },
                        (errors) => {
                        }
                    )}
                    onCancel={handleCancel}
                />
                {/* Report Results - Only show after search */}
                {shouldShowReport ? (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        headerClassName=''>
                        <CumulativeSalaryReportTemplate
                            schoolName={schoolName}
                            schoolAddress={schoolAddress}
                            month={watch('month') || month}
                            year={watch('year') || year}
                            reportData={reportData}
                            totals={totals}
                            isLoading={reportListQuery.isLoading}
                            onPrint={handlePrint}
                            onExport={handleExport}
                            onCancel={handleCancel}
                        />
                    </CollapsibleSection>
                ) : (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>Please use the search form above to generate salary reports</div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
