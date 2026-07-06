'use client';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useMasterLeaveDropdown } from '@/hooks/hrms/useMasters';
import { useLeaveReport, usePeriodLeaveReportEmployees, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { useMemo, useState } from 'react';
import { type LeaveReportRow, leaveReportColumns } from './_components/columns';
import { type LeaveReportFilters as FiltersType, LeaveReportFilters } from './_components/filters';

export default function LeaveReportPage() {
    const [rows, setRows] = useState<LeaveReportRow[]>([]);
    const [filters, setFilters] = useState<FiltersType>({
        selectedTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        isIndividual: false,
        selectedEmployeeId: null,
        leave: '',
        fromDate: '',
        toDate: '',
        showEmployeeLeaveBalance: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const leaveReportMutation = useLeaveReport();

    // Fetch cascading dropdown data using the same hooks as salary calculation
    const { data: groupTypesData } = useReportGroupTypes();
    const groupTypeIds = filters.selectedTypes.join(',');
    const { data: departmentsData } = useReportDepartments(groupTypeIds);
    const deptIds = filters.selectedDepartments.join(',');
    const { data: designationsData } = useReportDesignations(groupTypeIds, deptIds);
    const { data: leavesData, isLoading: isLoadingLeaves } = useMasterLeaveDropdown();

    // Fetch employees based on selected departments and designations
    // NOTE: Using PeriodLeaveReportEmployees API which is specifically designed for leave reports
    // This API returns full employee details including employee code and name
    console.log('📊 [DEBUG] Filter state:', {
        departments: filters.selectedDepartments,
        designations: filters.selectedDesignations,
        willFetchEmployees: filters.selectedDepartments.length > 0 && filters.selectedDesignations.length > 0
    });

    const { data: employeesData, isLoading: isLoadingEmployees } = usePeriodLeaveReportEmployees(
        filters.selectedDepartments,
        filters.selectedDesignations
    );

    // Transform data to match the filters component interface
    const typesData = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key,
                name: gt.value
            })) || []
        );
    }, [groupTypesData]);

    const leavesDataTransformed = useMemo(() => {
        return (
            leavesData?.data?.map((lv: any) => ({
                id: lv.hrmL_Id || lv.key || lv.id,
                name: lv.hrmL_LeaveName || lv.value || lv.name
            })) || []
        ).filter((lv: any) => lv.id != null);
    }, [leavesData]);

    const departmentsDataTransformed = useMemo(() => {
        console.log('🔍 [DEBUG] Raw departmentsData:', departmentsData);
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        console.log('🔍 [DEBUG] Raw designationsData:', designationsData);
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    // Transform employees data
    // API returns full employee objects with HRME_Id, HRME_EmployeeCode, etc.
    // Enhanced to support multiple formats (Level 1: specialized, Level 2: MasterDropDown)
    const employeesDataTransformed = useMemo(() => {
        console.log('🔍 [DEBUG] Raw employeesData:', employeesData);

        if (!employeesData || !Array.isArray(employeesData)) {
            console.log('⚠️ [DEBUG] No employees data or not an array');
            return [];
        }

        const transformed = employeesData
            .map((emp: any) => {
                // Try to find the ID (HRME_Id, id, or key)
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;

                if (id == null) return null;

                // Try to find the name (Full Name fields, value, or employeeName)
                const firstName = emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '';
                const middleName = emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '';
                const lastName = emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '';
                const fullNameFromParts = `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');

                const employeeName = fullNameFromParts || emp.value || emp.employeeName || emp.hrmE_EmployeeFirstName || 'Unknown Employee';

                // Try to find the code (HRME_EmployeeCode, employeeCode, or id as string)
                const employeeCode = emp.HRME_EmployeeCode || emp.hrmE_EmployeeCode || emp.employeeCode || id.toString();

                return {
                    id: Number(id),
                    employeeCode: employeeCode,
                    employeeName: employeeName
                };
            })
            .filter((emp): emp is { id: number; employeeCode: string; employeeName: string } => emp !== null);

        console.log('✅ [DEBUG] Transformed employees:', transformed);
        return transformed;
    }, [employeesData]);

    const handleFilterChange = (key: keyof FiltersType, value: any) => {
        console.log(`🔄 [DEBUG] Filter changed: ${key} =`, value);
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReport = () => {
        const newErrors: Record<string, string> = {};

        if (!filters.selectedTypes || filters.selectedTypes.length === 0) {
            newErrors.selectedTypes = 'Please select at least one group type';
        }
        if (!filters.selectedDepartments || filters.selectedDepartments.length === 0) {
            newErrors.selectedDepartments = 'Please select at least one department';
        }
        if (!filters.selectedDesignations || filters.selectedDesignations.length === 0) {
            newErrors.selectedDesignations = 'Please select at least one designation';
        }
        if (!filters.showEmployeeLeaveBalance && filters.isIndividual && !filters.selectedEmployeeId) {
            newErrors.selectedEmployeeId = 'Please select an employee';
        }
        if (!filters.leave) {
            newErrors.leave = 'Please select a leave type';
        }
        if (!filters.fromDate) {
            newErrors.fromDate = 'Please select a from date';
        }
        if (!filters.toDate) {
            newErrors.toDate = 'Please select a to date';
        }
        if (filters.fromDate && filters.toDate && new Date(filters.fromDate) > new Date(filters.toDate)) {
            newErrors.toDate = 'To date cannot be earlier than from date';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsGenerating(true);
        var payload ;

        let selectedLeave = filters.leave;
        if (filters.leave === '999') {
            selectedLeave = leavesDataTransformed.map(l => l.id).join(',');
        }

        let selectedEmployee = '';
        if (!filters.isIndividual) {
            selectedEmployee = employeesDataTransformed.map(e => e.id).join(',');
        } else if (filters.selectedEmployeeId) {
            selectedEmployee = filters.selectedEmployeeId.toString();
        }
        if(filters.showEmployeeLeaveBalance === false) {
            payload = {
            selectedLeave,
            selectedEmployee,
            hreltD_FromDate: filters.fromDate
                ? new Date(filters.fromDate).toISOString().split('T')[0]
                : '',
            hrelT_ToDate: filters.toDate
                ? new Date(filters.toDate).toISOString().split('T')[0]
                : '',
            edit_flag: filters.showEmployeeLeaveBalance
        };
        }else{
            payload = {
                selectedEmployee: employeesDataTransformed.map(e => e.id).join(','),
                edit_flag: filters.showEmployeeLeaveBalance
            }
        }
         

        leaveReportMutation.mutate(payload, {
            onSuccess: (response) => {
                setIsGenerating(false);
                if (response?.success && response?.data) {
                    const mappedRows = response.data.map((item: any, index: number) => ({
                        slNo: index + 1,
                        employeeCode: item.hrmE_EmployeeCode || item.employeeCode || '',
                        employeeName: item.hrmE_EmployeeFirstName || item.employeeName || '',
                        leaveName: item.hrmL_LeaveName || item.leaveName || '',
                        fromDate: item.hreltD_FromDate || item.fromDate || '',
                        toDate: item.hrelT_ToDate || item.toDate || '',
                        appliedDays: item.hreltD_TotDays || item.appliedDays || 0,
                        leaveStatus: item.hreltD_LeaveStatus || item.leaveStatus || 'Pending',
                        leaveBalance: item.leaveBalance || 0
                    }));
                    setRows(mappedRows);
                } else {
                    setRows([]);
                }
            },
            onError: () => {
                setIsGenerating(false);
                setRows([]);
            }
        });
    };

    const handleClear = () => {
        setFilters({
            selectedTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            isIndividual: false,
            selectedEmployeeId: null,
            leave: '',
            fromDate: '',
            toDate: '',
            showEmployeeLeaveBalance: false
        });
        setErrors({});
        setRows([]);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <LeaveReportFilters
                    filters={filters}
                    types={typesData}
                    departments={departmentsDataTransformed}
                    designations={designationsDataTransformed}
                    employees={employeesDataTransformed}
                    leaves={leavesDataTransformed}
                    isLoadingTypes={false}
                    isLoadingDepartments={false}
                    isLoadingDesignations={false}
                    isLoadingEmployees={isLoadingEmployees}
                    isLoadingLeaves={isLoadingLeaves}
                    errors={errors}
                    isGenerating={isGenerating}
                    onFilterChange={handleFilterChange}
                    onReport={handleReport}
                    onCancel={handleClear}
                />
                {rows.length > 0 && (
                    <CollapsibleSection
                        title='Leave Report'
                        description=''
                        defaultOpen={rows.length > 0}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable data={rows} columns={leaveReportColumns} totalItems={rows.length} isLoading={false} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
