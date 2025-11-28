'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeLogReportList, useEmployeeLogReportOnload } from '@/hooks/hrms/useReports';
import type { ApiSearchparams } from '@/types';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { logReportColumns } from './_components/columns';
import { LogReportFilters, type LogReportFiltersState as ReportFilters } from './_components/filters';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeLogReportPage(props: { searchParams: SearchParams }) {
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
    const employeeName =
        typeof rawSearchParams?.employeeName === 'string'
            ? rawSearchParams.employeeName
            : Array.isArray(rawSearchParams?.employeeName)
              ? rawSearchParams.employeeName[0]
              : '';
    const codeOrName =
        typeof rawSearchParams?.codeOrName === 'string'
            ? (rawSearchParams.codeOrName as 'Code' | 'Name')
            : Array.isArray(rawSearchParams?.codeOrName)
              ? (rawSearchParams.codeOrName[0] as 'Code' | 'Name')
              : 'Code';
    const dateMode =
        typeof rawSearchParams?.dateMode === 'string'
            ? (rawSearchParams.dateMode as 'Date' | 'Monthly' | 'From Date')
            : Array.isArray(rawSearchParams?.dateMode)
              ? (rawSearchParams.dateMode[0] as 'Date' | 'Monthly' | 'From Date')
              : 'Date';
    const date =
        typeof rawSearchParams?.date === 'string'
            ? rawSearchParams.date
            : Array.isArray(rawSearchParams?.date)
              ? rawSearchParams.date[0]
              : '';
    const month =
        typeof rawSearchParams?.month === 'string'
            ? rawSearchParams.month
            : Array.isArray(rawSearchParams?.month)
              ? rawSearchParams.month[0]
              : '';
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
    const metric =
        typeof rawSearchParams?.metric === 'string'
            ? (rawSearchParams.metric as 'Punch Time' | 'Late In' | 'Early Out')
            : Array.isArray(rawSearchParams?.metric)
              ? (rawSearchParams.metric[0] as 'Punch Time' | 'Late In' | 'Early Out')
              : 'Punch Time';

    // Check if we have search criteria based on dateMode
    const hasSearchCriteria = dateMode === 'Date' ? !!date : dateMode === 'Monthly' ? !!month : !!(fromDate && toDate);

    // React Query hook for dropdowns - always enabled to get filter options
    const { data: onloadData, isLoading: onloadLoading } = useEmployeeLogReportOnload(MI_Id, LoginUserId, UserRole);

    // Memoize arrays to prevent unnecessary re-renders
    const groupTypesData = useMemo(() => onloadData?.data?.types || [], [onloadData?.data?.types]);
    const groupTypesOptions = useMemo(
        () =>
            groupTypesData.map((gt) => ({
                label: gt.hrmgT_EmployeeGroupType,
                value: String(gt.hrmgT_Id)
            })),
        [groupTypesData]
    );

    // React Query hook for report data - only enabled when search criteria are present
    const reportListQuery = useEmployeeLogReportList(
        searchParams,
        {
            MIID: MI_Id,
            LoginUserId,
            UserRole,
            is_export: false,
            typeIdList: type.length > 0 ? type : undefined,
            departmentIdList: department.length > 0 ? department : undefined,
            designationIdList: designation.length > 0 ? designation : undefined,
            allOrIndividual: allOrIndividual === 'All' ? 'All' : 'Individual',
            employeeCode: allOrIndividual === 'Individual' && codeOrName === 'Code' && employeeCode ? employeeCode : undefined,
            employeeName: allOrIndividual === 'Individual' && codeOrName === 'Name' && employeeName ? employeeName : undefined,
            codeOrName,
            dateMode,
            date: dateMode === 'Date' ? date : undefined,
            month: dateMode === 'Monthly' ? month : undefined,
            fromDate: dateMode === 'From Date' ? fromDate : undefined,
            toDate: dateMode === 'From Date' ? toDate : undefined,
            metric
        },
        hasSearchCriteria // Only fetch when search criteria are met
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
            dateMode: 'Date',
            date: '',
            month: '',
            fromDate: '',
            toDate: '',
            metric: 'Punch Time'
        }
    });

    // Sync form with URL params - use useEffect instead of useMemo to avoid render issues
    // Only update when URL params actually change, not on every render
    useEffect(() => {
        setValue('type', type.map(String), { shouldDirty: false, shouldValidate: false });
        setValue('department', department.map(String), { shouldDirty: false, shouldValidate: false });
        setValue('designation', designation.map(String), { shouldDirty: false, shouldValidate: false });
        setValue('allOrIndividual', allOrIndividual, { shouldDirty: false, shouldValidate: false });
        setValue('codeOrName', codeOrName, { shouldDirty: false, shouldValidate: false });
        setValue('query', codeOrName === 'Code' ? employeeCode : employeeName, { shouldDirty: false, shouldValidate: false });
        setValue('dateMode', dateMode, { shouldDirty: false, shouldValidate: false });
        setValue('date', date, { shouldDirty: false, shouldValidate: false });
        setValue('month', month, { shouldDirty: false, shouldValidate: false });
        setValue('fromDate', fromDate, { shouldDirty: false, shouldValidate: false });
        setValue('toDate', toDate, { shouldDirty: false, shouldValidate: false });
        setValue('metric', metric, { shouldDirty: false, shouldValidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        type.join(','),
        department.join(','),
        designation.join(','),
        allOrIndividual,
        employeeCode,
        employeeName,
        codeOrName,
        dateMode,
        date,
        month,
        fromDate,
        toDate,
        metric
    ]);

    const onSubmit = (data: ReportFilters) => {
        // Validate based on dateMode
        if (data.dateMode === 'Date' && !data.date) {
            toast.error('Please select a date to generate report');
            return;
        }
        if (data.dateMode === 'Monthly' && !data.month) {
            toast.error('Please select a month to generate report');
            return;
        }
        if (data.dateMode === 'From Date' && (!data.fromDate || !data.toDate)) {
            toast.error('Please select from date and to date to generate report');
            return;
        }

        // Build URL params
        const params = new URLSearchParams();

        // Add filter params
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
            if (data.codeOrName === 'Code') {
                params.set('employeeCode', data.query);
            } else {
                params.set('employeeName', data.query);
            }
        }
        if (data.codeOrName) {
            params.set('codeOrName', data.codeOrName);
        }
        if (data.dateMode) {
            params.set('dateMode', data.dateMode);
        }
        if (data.dateMode === 'Date' && data.date) {
            params.set('date', data.date);
        }
        if (data.dateMode === 'Monthly' && data.month) {
            params.set('month', data.month);
        }
        if (data.dateMode === 'From Date') {
            if (data.fromDate) params.set('fromDate', data.fromDate);
            if (data.toDate) params.set('toDate', data.toDate);
        }
        if (data.metric) {
            params.set('metric', data.metric);
        }

        // Reset pagination when filters change
        params.set('page', '1');

        // Navigate with new params
        router.push(`/hrms/attendance-management/reports/employee-log-report?${params.toString()}`);
    };

    const handleCancel = () => {
        reset();
        router.push('/hrms/attendance-management/reports/employee-log-report');
    };

    // Transform API response to table data
    const transformedData = useMemo(() => {
        const responseData = reportListQuery.data?.data;
        if (!responseData || !Array.isArray(responseData?.rows)) {
            return [];
        }

        // TODO: Map API response rows to LogRow format when search endpoint is available
        // For now, return empty array
        return [];
    }, [reportListQuery.data]);

    // Prepare data table props
    const tableProps = useDataTableProps({
        data: transformedData,
        columns: logReportColumns,
        totalItems: reportListQuery.data?.data?.total || 0,
        searchParams,
        onSearchParamsChange: (newParams: any) => {
            const params = new URLSearchParams();

            // Preserve existing filter params
            if (type.length > 0) params.set('type', type.join(','));
            if (department.length > 0) params.set('department', department.join(','));
            if (designation.length > 0) params.set('designation', designation.join(','));
            if (allOrIndividual) params.set('allOrIndividual', allOrIndividual);
            if (employeeCode) params.set('employeeCode', employeeCode);
            if (employeeName) params.set('employeeName', employeeName);
            if (codeOrName) params.set('codeOrName', codeOrName);
            if (dateMode) params.set('dateMode', dateMode);
            if (date) params.set('date', date);
            if (month) params.set('month', month);
            if (fromDate) params.set('fromDate', fromDate);
            if (toDate) params.set('toDate', toDate);
            if (metric) params.set('metric', metric);

            // Add/update pagination and sort params
            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value));
                }
            });

            router.push(`/hrms/attendance-management/reports/employee-log-report?${params.toString()}`);
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
            codeOrName: codeOrName,
            query: codeOrName === 'Code' ? employeeCode : employeeName,
            dateMode: dateMode,
            date: date,
            month: month,
            fromDate: fromDate,
            toDate: toDate,
            metric: metric
        }),
        [
            type,
            department,
            designation,
            allOrIndividual,
            employeeCode,
            employeeName,
            codeOrName,
            dateMode,
            date,
            month,
            fromDate,
            toDate,
            metric
        ]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {onloadLoading ? (
                    <div className='py-8 text-center'>Loading filter options...</div>
                ) : (
                    <LogReportFilters
                        filters={filtersForComponent}
                        branches={[]}
                        departments={[]} // TODO: Update when department dropdown is available in API
                        designations={[]} // TODO: Update when designation dropdown is available in API
                        groupTypes={groupTypesOptions}
                        employees={[]} // TODO: Update when employees data is available in API response
                        onFilterChange={() => {
                            // No-op: Form is controlled by URL params, filters component manages its own state
                            // Only onSubmit will update the URL and trigger a re-render
                        }}
                        onReport={handleSubmit(onSubmit)}
                        onCancel={handleCancel}
                        onExport={() => {
                            toast.info('Export functionality will be implemented when search endpoint is available');
                        }}
                        onPrint={() => window.print()}
                    />
                )}

                {showReport && (
                    <CollapsibleSection
                        title='Employee Log Report'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable {...tableProps} columns={logReportColumns} isLoading={reportListQuery.isLoading} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
