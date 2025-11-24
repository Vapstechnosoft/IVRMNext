'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useEmployeeInOutReportDepartments,
    useEmployeeInOutReportDesignations,
    useEmployeeInOutReportEmployees,
    useEmployeeInOutReportList,
    useEmployeeInOutReportOnload
} from '@/hooks/hrms/useReports';
import type { ApiSearchparams } from '@/types';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { employeeInOutReportColumns } from './_components/columns';
import { EmployeeInOutReportFilters, type EmployeeInOutReportFilters as ReportFilters } from './_components/filters';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeInOutReportPage(props: { searchParams: SearchParams }) {
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
    const timeInTimeOut =
        typeof rawSearchParams?.timeInTimeOut === 'string'
            ? (rawSearchParams.timeInTimeOut as 'Time In' | 'Time Out' | 'In Out')
            : Array.isArray(rawSearchParams?.timeInTimeOut)
              ? (rawSearchParams.timeInTimeOut[0] as 'Time In' | 'Time Out' | 'In Out')
              : undefined;

    // Check if we have search criteria (fromDate and toDate are required)
    const hasSearchCriteria = !!(fromDate && toDate);

    // React Query hook for dropdowns - always enabled to get filter options
    const { data: onloadData, isLoading: onloadLoading } = useEmployeeInOutReportOnload(MI_Id, LoginUserId, UserRole);

    // Memoize arrays to prevent unnecessary re-renders
    const groupTypesData = useMemo(() => onloadData?.data?.types || [], [onloadData?.data?.types]);
    const groupTypesOptions = useMemo(() => {
        if (!Array.isArray(groupTypesData) || groupTypesData.length === 0) {
            return [];
        }

        // Use a Set to track unique values and prevent duplicates
        const seenValues = new Set<string>();

        return groupTypesData
            .map((gt: any, _index: number) => {
                // Try different field name variations (API might return different cases)
                // Based on user's API response, it uses HRMGT_Id and HRMGT_EmployeeGroupType
                const id = gt.HRMGT_Id ?? gt.hrmgT_Id ?? gt.HRGT_Id ?? gt.id ?? gt.value;
                const name =
                    gt.HRMGT_EmployeeGroupType ??
                    gt.hrmgT_EmployeeGroupType ??
                    gt.HRGT_EmployeeGroupType ??
                    gt.label ??
                    gt.name ??
                    gt.employeeGroupType;

                // Ensure we have valid id and name
                if (id === undefined || id === null || name === undefined || name === null || name === '') {
                    return null;
                }

                const valueStr = String(id);
                const labelStr = String(name);

                // Skip if we've already seen this value (prevent duplicates)
                if (seenValues.has(valueStr)) {
                    return null;
                }
                seenValues.add(valueStr);

                return {
                    label: labelStr,
                    value: valueStr
                };
            })
            .filter(
                (item: any): item is { label: string; value: string } =>
                    item !== null &&
                    item !== undefined &&
                    item.value !== undefined &&
                    item.value !== null &&
                    item.value !== '' &&
                    item.label !== undefined &&
                    item.label !== null &&
                    item.label !== ''
            );
    }, [groupTypesData]);

    // Build comma-separated strings for API calls
    const multipletype = useMemo(() => type.join(','), [type]);
    const multipledep = useMemo(() => department.join(','), [department]);
    const multipledes = useMemo(() => designation.join(','), [designation]);

    // Cascading dropdown hooks
    const { data: departmentsData, isLoading: isLoadingDepartments } = useEmployeeInOutReportDepartments(
        MI_Id,
        LoginUserId,
        0, // IVRMRT_Id
        multipletype,
        multipletype.length > 0
    );

    const { data: designationsData, isLoading: isLoadingDesignations } = useEmployeeInOutReportDesignations(
        MI_Id,
        multipledep,
        multipledep.length > 0
    );

    const { data: employeesData, isLoading: isLoadingEmployees } = useEmployeeInOutReportEmployees(
        MI_Id,
        multipledes,
        multipledep,
        multipletype,
        (multipledes.length > 0 || multipledep.length > 0 || multipletype.length > 0) && allOrIndividual === 'Individual'
    );

    // Transform API responses to filter component format
    const departmentsOptions = useMemo(() => {
        if (!departmentsData?.data) {
            return [];
        }

        // Server function already extracts the departments array from response.data.departments
        const deptData = Array.isArray(departmentsData.data) ? departmentsData.data : [];

        if (deptData.length === 0) {
            return [];
        }

        // Use a Set to track unique values and prevent duplicates
        const seenValues = new Set<string>();

        // Transform to options format using correct field names
        return deptData
            .map((dept: any) => {
                // Use correct HRMS field names
                const id = dept.HRMD_Id ?? dept.hrmdT_Id ?? dept.id ?? dept.value ?? dept.departmentId;
                const name = dept.HRMD_DepartmentName ?? dept.hrmdT_DepartmentName ?? dept.label ?? dept.name ?? dept.departmentName;

                if (id === undefined || id === null || name === undefined || name === null || name === '') {
                    return null;
                }

                const valueStr = String(id);
                const labelStr = String(name);

                // Skip if we've already seen this value (prevent duplicates)
                if (seenValues.has(valueStr)) {
                    return null;
                }
                seenValues.add(valueStr);

                return {
                    label: labelStr,
                    value: valueStr
                };
            })
            .filter(
                (item: any): item is { label: string; value: string } =>
                    item !== null &&
                    item !== undefined &&
                    item.value !== undefined &&
                    item.value !== null &&
                    item.value !== '' &&
                    item.label !== undefined &&
                    item.label !== null &&
                    item.label !== ''
            );
    }, [departmentsData]);

    const designationsOptions = useMemo(() => {
        if (!designationsData?.data) {
            return [];
        }

        // Server function already extracts the designations array from response.data.designations
        const desgData = Array.isArray(designationsData.data) ? designationsData.data : [];

        if (desgData.length === 0) {
            return [];
        }

        // Use a Set to track unique values and prevent duplicates
        const seenValues = new Set<string>();

        // Transform to options format using correct field names
        return desgData
            .map((desg: any) => {
                // Use correct HRMS field names
                const id = desg.HRMDES_Id ?? desg.hrmdsT_Id ?? desg.id ?? desg.value ?? desg.designationId;
                const name = desg.HRMDES_DesignationName ?? desg.hrmdsT_DesignationName ?? desg.label ?? desg.name ?? desg.designationName;

                if (id === undefined || id === null || name === undefined || name === null || name === '') {
                    return null;
                }

                const valueStr = String(id);
                const labelStr = String(name);

                // Skip if we've already seen this value (prevent duplicates)
                if (seenValues.has(valueStr)) {
                    return null;
                }
                seenValues.add(valueStr);

                return {
                    label: labelStr,
                    value: valueStr
                };
            })
            .filter(
                (item: any): item is { label: string; value: string } =>
                    item !== null &&
                    item !== undefined &&
                    item.value !== undefined &&
                    item.value !== null &&
                    item.value !== '' &&
                    item.label !== undefined &&
                    item.label !== null &&
                    item.label !== ''
            );
    }, [designationsData]);

    const employeesOptions = useMemo(() => {
        if (!employeesData?.data) {
            return [];
        }

        // Server function already extracts the employees array from response.data.employees
        const empData = Array.isArray(employeesData.data) ? employeesData.data : [];

        if (empData.length === 0) {
            return [];
        }

        // Use a Set to track unique values and prevent duplicates
        const seenValues = new Set<string>();

        // Transform to options format
        return empData
            .map((emp: any) => {
                // Try common employee field patterns
                const code =
                    emp.HRME_EmployeeCode ??
                    emp.HREM_EmployeeCode ??
                    emp.employeeCode ??
                    emp.EmployeeCode ??
                    emp.code ??
                    emp.value ??
                    emp.id;
                const name =
                    emp.HRME_EmployeeName ??
                    emp.HRME_EmployeeFirstName ??
                    emp.HREM_EmployeeName ??
                    emp.employeeName ??
                    emp.EmployeeName ??
                    emp.name ??
                    emp.label;

                if (code === undefined || code === null || code === '') {
                    return null;
                }

                const valueStr = String(code);

                // Skip if we've already seen this value (prevent duplicates)
                if (seenValues.has(valueStr)) {
                    return null;
                }
                seenValues.add(valueStr);

                const displayName = name && code ? `${name} (${code})` : name || code || String(emp);

                return {
                    label: displayName,
                    value: valueStr
                };
            })
            .filter(
                (item: any): item is { label: string; value: string } =>
                    item !== null && item !== undefined && item.value !== undefined && item.value !== null && item.value !== ''
            );
    }, [employeesData]);

    // React Query hook for report data - only enabled when search criteria are present
    const reportListQuery = useEmployeeInOutReportList(
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
            allOrIndividual: allOrIndividual === 'All' ? 'All' : 'Individual',
            employeeCode: allOrIndividual === 'Individual' && employeeCode ? employeeCode : undefined,
            timeInTimeOut
        },
        hasSearchCriteria // Only fetch when fromDate and toDate are selected
    );

    // Form for filters
    const {
        handleSubmit,
        reset,
        watch: _watch,
        control: _control,
        setValue
    } = useForm<ReportFilters>({
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
            timeInTimeOut: undefined
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
        setValue('timeInTimeOut', timeInTimeOut, { shouldDirty: false, shouldValidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        type.join(','),
        department.join(','),
        designation.join(','),
        allOrIndividual,
        employeeCode,
        fromDate,
        toDate,
        timeInTimeOut,
        setValue
    ]);

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
        if (data.timeInTimeOut) {
            params.set('timeInTimeOut', data.timeInTimeOut);
        }

        // Reset pagination when filters change
        params.set('page', '1');

        // Navigate with new params
        router.push(`/hrms/attendance-management/reports/employee-inout-report?${params.toString()}`);
    };

    const handleCancel = () => {
        reset();
        router.push('/hrms/attendance-management/reports/employee-inout-report');
    };

    // Transform API response to table data
    const transformedData = useMemo(() => {
        const responseData = reportListQuery.data?.data;
        if (!responseData || !Array.isArray(responseData?.rows)) {
            return [];
        }

        // TODO: Map API response rows to InOutRow format when search endpoint is available
        // For now, return empty array
        return [];
    }, [reportListQuery.data]);

    // Prepare data table props
    const tableProps = useDataTableProps({
        data: transformedData,
        columns: employeeInOutReportColumns,
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
            if (timeInTimeOut) params.set('timeInTimeOut', timeInTimeOut);

            // Add/update pagination and sort params
            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value));
                }
            });

            router.push(`/hrms/attendance-management/reports/employee-inout-report?${params.toString()}`);
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
            timeInTimeOut: timeInTimeOut
        }),
        [type, department, designation, allOrIndividual, employeeCode, fromDate, toDate, timeInTimeOut]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {onloadLoading ? (
                    <div className='py-8 text-center'>Loading filter options...</div>
                ) : (
                    <EmployeeInOutReportFilters
                        filters={filtersForComponent}
                        branches={[]}
                        departments={departmentsOptions}
                        designations={designationsOptions}
                        groupTypes={groupTypesOptions}
                        employees={employeesOptions}
                        onFilterChange={() => {
                            // No-op: Form is controlled by URL params, filters component manages its own state
                            // Only onSubmit will update the URL and trigger a re-render
                        }}
                        onTypeChange={(types) => {
                            // When types change, update URL to trigger department fetch
                            const params = new URLSearchParams();
                            if (fromDate) params.set('fromDate', fromDate);
                            if (toDate) params.set('toDate', toDate);
                            if (types.length > 0) {
                                params.set('type', types.join(','));
                            }
                            // Clear dependent filters
                            params.set('department', '');
                            params.set('designation', '');
                            params.set('employeeCode', '');
                            if (allOrIndividual) params.set('allOrIndividual', allOrIndividual);
                            if (timeInTimeOut) params.set('timeInTimeOut', timeInTimeOut);
                            router.push(`/hrms/attendance-management/reports/employee-inout-report?${params.toString()}`);
                        }}
                        onDepartmentChange={(departments) => {
                            // When departments change, update URL to trigger designation fetch
                            const params = new URLSearchParams();
                            if (fromDate) params.set('fromDate', fromDate);
                            if (toDate) params.set('toDate', toDate);
                            if (type.length > 0) params.set('type', type.join(','));
                            if (departments.length > 0) {
                                params.set('department', departments.join(','));
                            }
                            // Clear dependent filters
                            params.set('designation', '');
                            params.set('employeeCode', '');
                            if (allOrIndividual) params.set('allOrIndividual', allOrIndividual);
                            if (timeInTimeOut) params.set('timeInTimeOut', timeInTimeOut);
                            router.push(`/hrms/attendance-management/reports/employee-inout-report?${params.toString()}`);
                        }}
                        onDesignationChange={(designations) => {
                            // When designations change, update URL to trigger employee fetch
                            const params = new URLSearchParams();
                            if (fromDate) params.set('fromDate', fromDate);
                            if (toDate) params.set('toDate', toDate);
                            if (type.length > 0) params.set('type', type.join(','));
                            if (department.length > 0) params.set('department', department.join(','));
                            if (designations.length > 0) {
                                params.set('designation', designations.join(','));
                            }
                            // Clear dependent filters
                            params.set('employeeCode', '');
                            if (allOrIndividual) params.set('allOrIndividual', allOrIndividual);
                            if (timeInTimeOut) params.set('timeInTimeOut', timeInTimeOut);
                            router.push(`/hrms/attendance-management/reports/employee-inout-report?${params.toString()}`);
                        }}
                        onSearch={handleSubmit(onSubmit)}
                        onCancel={handleCancel}
                        onExport={() => {
                            toast.info('Export functionality will be implemented when search endpoint is available');
                        }}
                        onPrint={() => window.print()}
                        isLoadingDepartments={isLoadingDepartments}
                        isLoadingDesignations={isLoadingDesignations}
                        isLoadingEmployees={isLoadingEmployees}
                    />
                )}

                {showReport && (
                    <CollapsibleSection
                        title='Employee In/Out Report'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable {...tableProps} columns={employeeInOutReportColumns} isLoading={reportListQuery.isLoading} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
