'use client';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeLateInEarlyOutReportList, useEmployeeLateInEarlyOutReportOnload } from '@/hooks/hrms/useReports';
import type { ApiSearchparams } from '@/types';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { employeeLateInEarlyOutReportColumns } from './_components/columns';
import { EmployeeLateInEarlyOutReportFilters, type EmployeeLateInEarlyOutReportFilters as ReportFilters } from './_components/filters';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function EmployeeLateInEarlyOutReportPage(props: { searchParams: SearchParams }) {
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
    const LoginUserId = 0;
    const UserRole = '';
    const fromDate =
        typeof rawSearchParams?.fromDate === 'string'
            ? rawSearchParams.fromDate
            : Array.isArray(rawSearchParams?.fromDate)
              ? rawSearchParams.fromDate[0]
              : '';
    const toDate =
        typeof rawSearchParams?.toDate === 'string'
            ? rawSearchParams.toDate
            : Array.isArray(rawSearchParams?.toDate)
              ? rawSearchParams.toDate[0]
              : '';
    const type =
        typeof rawSearchParams?.type === 'string'
            ? rawSearchParams.type.split(',').map(Number).filter(Boolean)
            : Array.isArray(rawSearchParams?.type)
              ? rawSearchParams.type.flatMap((t) => (typeof t === 'string' ? t.split(',').map(Number).filter(Boolean) : []))
              : [];
    const department =
        typeof rawSearchParams?.department === 'string'
            ? rawSearchParams.department.split(',').map(Number).filter(Boolean)
            : Array.isArray(rawSearchParams?.department)
              ? rawSearchParams.department.flatMap((d) => (typeof d === 'string' ? d.split(',').map(Number).filter(Boolean) : []))
              : [];
    const designation =
        typeof rawSearchParams?.designation === 'string'
            ? rawSearchParams.designation.split(',').map(Number).filter(Boolean)
            : Array.isArray(rawSearchParams?.designation)
              ? rawSearchParams.designation.flatMap((d) => (typeof d === 'string' ? d.split(',').map(Number).filter(Boolean) : []))
              : [];
    const allOrIndividual =
        typeof rawSearchParams?.allOrIndividual === 'string'
            ? (rawSearchParams.allOrIndividual as 'All' | 'Individual')
            : Array.isArray(rawSearchParams?.allOrIndividual)
              ? (rawSearchParams.allOrIndividual[0] as 'All' | 'Individual')
              : 'All';
    const employeeCode =
        typeof rawSearchParams?.employeeCode === 'string'
            ? rawSearchParams.employeeCode
            : Array.isArray(rawSearchParams?.employeeCode)
              ? rawSearchParams.employeeCode[0]
              : '';
    const mode =
        typeof rawSearchParams?.mode === 'string'
            ? (rawSearchParams.mode as 'Late By' | 'Early Out' | 'Late In Early Out')
            : Array.isArray(rawSearchParams?.mode)
              ? (rawSearchParams.mode[0] as 'Late By' | 'Early Out' | 'Late In Early Out')
              : 'Late By';
    // Check if we have search criteria (fromDate and toDate are required)
    const hasSearchCriteria = !!(fromDate && toDate);
    // React Query hook for dropdowns - always enabled to get filter options
    const {
        data: onloadData,
        isLoading: onloadLoading,
        isError: onloadError,
        error: onloadErrorObj
    } = useEmployeeLateInEarlyOutReportOnload(MI_Id, LoginUserId, UserRole);
    // Debug logging for onload data
    useEffect(() => {
        if (onloadErrorObj) {
        }
        if (onloadData) {
            if (onloadData?.data?.types && onloadData.data.types.length > 0) {
            }
            if (onloadData?.data?.employees && onloadData.data.employees.length > 0) {
            }
        }
    }, [onloadData, onloadLoading, onloadError, onloadErrorObj]);
    // Memoize arrays to prevent unnecessary re-renders
    const groupTypesData = useMemo(() => {
        const types = onloadData?.data?.types || [];
        return types;
    }, [onloadData?.data?.types]);
    const employeesData = useMemo(() => {
        const employees = onloadData?.data?.employees || [];
        return employees;
    }, [onloadData?.data?.employees]);
    const groupTypesOptions = useMemo(() => {
        const options = groupTypesData.map((gt) => ({
            label: gt.hrmgT_EmployeeGroupType,
            value: String(gt.hrmgT_Id)
        }));
        return options;
    }, [groupTypesData]);
    const employeesOptions = useMemo(() => {
        const options = employeesData.map((emp) => ({
            label: `${emp.ename} (${emp.hrmE_EmployeeCode})`,
            value: String(emp.hrmE_Id)
        }));
        return options;
    }, [employeesData]);
    // React Query hook for report data - only enabled when search criteria are present
    const reportListQuery = useEmployeeLateInEarlyOutReportList(
        searchParams,
        {
            MIID: MI_Id,
            LoginUserId,
            UserRole,
            is_export: false,
            fromDate,
            toDate,
            typeIdList: type.length > 0 ? type : undefined,
            departmentIdList: department.length > 0 ? department : undefined,
            designationIdList: designation.length > 0 ? designation : undefined,
            employeeIdList:
                allOrIndividual === 'Individual' && employeeCode ? [Number.parseInt(employeeCode, 10)].filter(Boolean) : undefined,
            allOrIndividual: allOrIndividual === 'All' ? 'All' : 'Individual',
            employeeCode: allOrIndividual === 'Individual' && employeeCode ? employeeCode : undefined,
            mode
        },
        hasSearchCriteria // Only fetch when fromDate and toDate are selected
    );
    // Form for filters
    const { handleSubmit, reset, watch, control, setValue } = useForm<ReportFilters>({
        mode: 'onChange',
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            fromDate: '',
            toDate: '',
            mode: 'Late By'
        }
    });
    // Sync form with URL params - use useEffect instead of useMemo to avoid render issues
    // Only update when URL params actually change, not on every render
    useEffect(() => {
        setValue('type', type.map(String), { shouldDirty: false, shouldValidate: false });
        setValue('department', department.map(String), { shouldDirty: false, shouldValidate: false });
        setValue('designation', designation.map(String), { shouldDirty: false, shouldValidate: false });
        setValue('allOrIndividual', allOrIndividual, { shouldDirty: false, shouldValidate: false });
        setValue('query', employeeCode, { shouldDirty: false, shouldValidate: false });
        setValue('fromDate', fromDate, { shouldDirty: false, shouldValidate: false });
        setValue('toDate', toDate, { shouldDirty: false, shouldValidate: false });
        setValue('mode', mode, { shouldDirty: false, shouldValidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type.join(','), department.join(','), designation.join(','), allOrIndividual, employeeCode, fromDate, toDate, mode]);
    const onSubmit = (data: ReportFilters) => {
        if (!data.fromDate || !data.toDate) {
            toast.error('Please select from date and to date to generate report');
            return;
        }
        // Build URL params
        const params = new URLSearchParams();
        // Add filter params
        if (data.fromDate) params.set('fromDate', data.fromDate);
        if (data.toDate) params.set('toDate', data.toDate);
        if (data.type && data.type.length > 0) {
            params.set('type', data.type.join(','));
        }
        if (data.department && data.department.length > 0) {
            params.set('department', data.department.join(','));
        }
        if (data.designation && data.designation.length > 0) {
            params.set('designation', data.designation.join(','));
        }
        if (data.allOrIndividual) {
            params.set('allOrIndividual', data.allOrIndividual);
        }
        if (data.allOrIndividual === 'Individual' && data.query) {
            params.set('employeeCode', data.query);
        }
        if (data.mode) {
            params.set('mode', data.mode);
        }
        // Reset pagination when filters change
        params.set('page', '1');
        // Navigate with new params
        router.push(`/hrms/attendance-management/reports/employee-lateInEarlyOut-report?${params.toString()}`);
    };
    const handleCancel = () => {
        reset();
        router.push('/hrms/attendance-management/reports/employee-lateInEarlyOut-report');
    };
    // Transform API response to table data
    const transformedData = useMemo(() => {
        const responseData = reportListQuery.data?.data;
        if (!responseData || !Array.isArray(responseData?.rows)) {
            return [];
        }
        // TODO: Map API response rows to LIEORow format when search endpoint is available
        // For now, return empty array
        return [];
    }, [reportListQuery.data]);
    // Prepare data table props
    const tableProps = useDataTableProps({
        data: transformedData,
        columns: employeeLateInEarlyOutReportColumns,
        totalItems: reportListQuery.data?.data?.total || 0,
        searchParams,
        onSearchParamsChange: (newParams: any) => {
            const params = new URLSearchParams();
            // Preserve existing filter params
            if (fromDate) params.set('fromDate', fromDate);
            if (toDate) params.set('toDate', toDate);
            if (type.length > 0) params.set('type', type.join(','));
            if (department.length > 0) params.set('department', department.join(','));
            if (designation.length > 0) params.set('designation', designation.join(','));
            if (allOrIndividual) params.set('allOrIndividual', allOrIndividual);
            if (employeeCode) params.set('employeeCode', employeeCode);
            if (mode) params.set('mode', mode);
            // Add/update pagination and sort params
            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value));
                }
            });
            router.push(`/hrms/attendance-management/reports/employee-lateInEarlyOut-report?${params.toString()}`);
        }
    });
    // Determine if we should show the report
    const showReport = hasSearchCriteria && reportListQuery.data?.success && transformedData.length > 0;
    // Memoize filters object to prevent unnecessary re-renders
    const filtersForComponent = useMemo(
        () => ({
            type: type.map(String),
            department: department.map(String),
            designation: designation.map(String),
            allOrIndividual: allOrIndividual,
            codeOrName: 'Code' as const,
            query: employeeCode,
            fromDate: fromDate,
            toDate: toDate,
            mode: mode
        }),
        [type, department, designation, allOrIndividual, employeeCode, fromDate, toDate, mode]
    );
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {onloadLoading ? (
                    <div className='py-8 text-center'>Loading filter options...</div>
                ) : onloadError ? (
                    <div className='py-8 text-center text-red-500'>
                        <p>Error loading filter options: {onloadErrorObj?.message || 'Unknown error'}</p>
                        <p className='mt-2 text-muted-foreground text-sm'>Please check the console for detailed error information.</p>
                    </div>
                ) : (
                    (() => {
                        return (
                            <EmployeeLateInEarlyOutReportFilters
                                filters={filtersForComponent}
                                departments={[]} // TODO: Update when department dropdown is available in API
                                designations={[]} // TODO: Update when designation dropdown is available in API
                                types={[]} // Will be replaced by groupTypes prop
                                groupTypes={groupTypesOptions}
                                employees={employeesOptions}
                                onFilterChange={() => {
                                    // No-op: Form is controlled by URL params, filters component manages its own state
                                    // Only onSubmit will update the URL and trigger a re-render
                                }}
                                onSearch={handleSubmit(onSubmit)}
                                onCancel={handleCancel}
                                onExport={() => {
                                    toast.info('Export functionality will be implemented when search endpoint is available');
                                }}
                                onPrint={() => window.print()}
                            />
                        );
                    })()
                )}
                {showReport && (
                    <CollapsibleSection
                        title='Employee Late In Early Out Report'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            {...tableProps}
                            columns={employeeLateInEarlyOutReportColumns}
                            isLoading={reportListQuery.isLoading}
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
