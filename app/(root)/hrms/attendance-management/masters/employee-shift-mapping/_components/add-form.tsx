'use client';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useEmployeeShiftMapping,
    useEmployeeShiftMappingDropdowns,
    useSaveEmployeeShiftMapping,
    useShiftSettingMaster
} from '@/hooks/hrms/attendance-management/useMasters';
import { useFilterEmployeesBySelection } from '@/hooks/hrms/useReports';
import { createLocalCrud } from '@/lib/localdb';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { MasterShift } from '../../master-shift/_components/columns';
import { ShiftMappingForm } from './shift-mapping-form';
import type { EmployeeShiftMappingForm } from './shift-mapping-form';

interface AddEmployeeShiftMappingFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddEmployeeShiftMappingForm({ onSuccess, className = '' }: AddEmployeeShiftMappingFormProps) {
    const { refetchAll } = useEmployeeShiftMapping();
    const { mutate: saveMapping } = useSaveEmployeeShiftMapping();

    // Fetch dropdown data from API
    const { data: dropdownData } = useEmployeeShiftMappingDropdowns();

    // Fetch shift master data from API to get fomS_Id
    const { data: shiftMasterData } = useShiftSettingMaster();
    const shiftMasterList = useMemo(() => {
        return shiftMasterData?.data?.report_list || [];
    }, [shiftMasterData]);

    // Get available shifts from local storage as fallback
    const shiftStore = createLocalCrud<MasterShift>('attendance:master-shift');
    const availableShifts = useMemo(() => shiftStore.list(), []);

    // Fetch employees with IDs for mapping
    const [employeesWithIds, setEmployeesWithIds] = useState<EmployeeDropdown[]>([]);
    const filterEmployeesMutation = useFilterEmployeesBySelection();

    // Fetch all employees on mount (with empty filters to get all)
    useEffect(() => {
        const request = {
            MI_Id: HRMS_MI_ID,
            LogInUserId: 0,
            hrmgT_IdList: [0], // Empty filter to get all employees
            hrmD_IdList: [0],
            hrmdeS_IdList: [0]
        };

        filterEmployeesMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data?.employeedropdown) {
                    const employees = response.data.employeedropdown || [];
                    setEmployeesWithIds(employees);
                    // Debug: Log sample employee data structure
                    if (employees.length > 0) {
                    }
                }
            },
            onError: (error) => {
                console.error('❌ [CLIENT] Error fetching employees:', error);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (data: EmployeeShiftMappingForm) => {
        const dayTypeValue = Array.isArray(data.dayType) ? data.dayType[0] || '' : data.dayType || '';

        // Find shift master ID from shift name
        // First try to find in API data (report_list), then fallback to local storage
        let fomS_Id = 0;

        // Try to find in API shift master data
        const apiShift = shiftMasterList.find((shift: any) => {
            // Try multiple field names that might contain the shift name
            const shiftNameMatch =
                shift.fomS_ShiftName?.toLowerCase() === data.shiftName.toLowerCase() ||
                shift.shiftName?.toLowerCase() === data.shiftName.toLowerCase() ||
                shift.name?.toLowerCase() === data.shiftName.toLowerCase();
            return shiftNameMatch;
        });

        if (apiShift) {
            // Get fomS_Id from API response (could be fomS_Id or id field)
            fomS_Id = apiShift.fomS_Id || apiShift.id || 0;
        } else {
            // Fallback to local storage (for backward compatibility)
            const selectedShift = availableShifts.find((shift) => shift.shiftName === data.shiftName);
            fomS_Id = selectedShift?.id || 0;
            console.warn('⚠️ [CLIENT] Shift not found in API, using local storage:', {
                shiftName: data.shiftName,
                selectedShift: selectedShift,
                fomS_Id: fomS_Id,
                availableApiShifts: shiftMasterList.map((s: any) => ({
                    name: s.fomS_ShiftName || s.shiftName || s.name,
                    id: s.fomS_Id || s.id
                }))
            });
        }

        // Convert employee strings to IDs
        // Map employee codes/names to HRME_Id from fetched employee data
        const employeeIds = (data.employees || [])
            .map((empString) => {
                // First, try to parse as number (if it's already an ID)
                const parsed = Number.parseInt(empString, 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    return parsed;
                }

                // Normalize the search string (lowercase, remove special chars)
                const normalizedSearch = empString.toLowerCase().trim();

                // Try multiple matching strategies
                const found = employeesWithIds.find((emp) => {
                    // Strategy 1: Exact match on employee code (case-insensitive)
                    if (emp.HRME_EmployeeCode) {
                        const codeNormalized = emp.HRME_EmployeeCode.toLowerCase().trim();
                        if (codeNormalized === normalizedSearch) return true;
                        // Also try without hyphens/spaces
                        if (codeNormalized.replace(/[-_\s]/g, '') === normalizedSearch.replace(/[-_\s]/g, '')) return true;
                    }

                    // Strategy 2: Match on full name (first + middle + last)
                    const fullName =
                        `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`
                            .trim()
                            .toLowerCase();
                    if (fullName === normalizedSearch) return true;

                    // Strategy 3: Match on name slug (replace spaces with hyphens)
                    const nameSlug = fullName.replace(/\s+/g, '-');
                    if (nameSlug === normalizedSearch) return true;

                    // Strategy 4: Match on first + last name only
                    const firstLast = `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim().toLowerCase();
                    const firstLastSlug = firstLast.replace(/\s+/g, '-');
                    if (firstLast === normalizedSearch || firstLastSlug === normalizedSearch) return true;

                    // Strategy 5: Partial match on employee code (contains)
                    if (emp.HRME_EmployeeCode?.toLowerCase().includes(normalizedSearch)) return true;
                    if (emp.HRME_EmployeeCode && normalizedSearch.includes(emp.HRME_EmployeeCode.toLowerCase())) return true;

                    // Strategy 6: Partial match on name
                    if (fullName.includes(normalizedSearch) || normalizedSearch.includes(fullName)) return true;

                    return false;
                });

                if (found) {
                    return found.HRME_Id;
                }

                // If not found, log detailed debug info
                console.warn('⚠️ [CLIENT] Could not find employee ID for:', empString, {
                    searchString: normalizedSearch,
                    availableCodes: employeesWithIds.map((e) => e.HRME_EmployeeCode).filter(Boolean),
                    availableNames: employeesWithIds
                        .map((e) => `${e.HRME_EmployeeFirstName || ''} ${e.HRME_EmployeeLastName || ''}`.trim())
                        .filter(Boolean)
                });
                return 0;
            })
            .filter((id) => id > 0);

        // Convert dayType strings/values to IDs from API dropdown data
        const dayTypeArray = Array.isArray(data.dayType) ? data.dayType : data.dayType ? [data.dayType] : [];
        const dayTypeIds = dayTypeArray
            .map((dayTypeValue) => {
                // Try to parse as number first (if it's already an ID)
                const parsed = Number.parseInt(String(dayTypeValue), 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    return parsed;
                }

                // Find in dropdown data by value or label
                const dayTypeItem = dropdownData?.data?.dayTypes?.find((item: any) => {
                    const itemValue = String(item.value || '');
                    const itemLabel = String(item.label || '').toUpperCase();
                    const searchValue = String(dayTypeValue).toUpperCase();
                    return itemValue === String(dayTypeValue) || itemLabel === searchValue;
                });

                if (dayTypeItem?.id) {
                    return dayTypeItem.id;
                }

                // Fallback: try to find by ID in the value
                return 0;
            })
            .filter((id) => id > 0);

        // Validate required fields for API
        if (fomS_Id === 0) {
            console.error('❌ [CLIENT] Shift Master ID is required but not found');
            toast.error('Shift Master ID is required. Please ensure the selected shift exists.');
            return;
        }
        if (employeeIds.length === 0) {
            console.error('❌ [CLIENT] Employee IDs are required but none found');
            toast.error('Employee IDs are required. Please ensure employees are selected correctly.');
            return;
        }
        if (dayTypeIds.length === 0) {
            console.error('❌ [CLIENT] Day Type IDs are required but none found');
            toast.error('Day Type IDs are required. Please ensure day types are selected correctly.');
            return;
        }

        const mappingData = {
            type: data.type || [],
            department: data.department || [],
            designation: data.designation || [],
            dayType: data.dayType || [],
            shiftName: data.shiftName,
            applicableDate: data.applicableDate,
            employees: data.employees || [],
            employee: 'Sample Employee',
            holidayType: dayTypeValue,
            totalWork: data.totalWorkingHours || '00:00',
            halfDayWork: data.halfDayWorkingHours || '00:00',
            morningLogin: data.shiftStartTime || '00:00',
            morningLogout: data.lunchStartTime || '00:00',
            afternoonLogin: data.lunchEndTime || '00:00',
            afternoonLogout: data.shiftEndTime || '00:00',
            delayShift: data.delayPerShift || '00:00',
            earlyShift: data.earlyPerShift || '00:00',
            lunchHour: data.lunchHours || '00:00',
            shiftStartTime: data.shiftStartTime,
            lunchStartTime: data.lunchStartTime,
            shiftEndTime: data.shiftEndTime,
            lunchEndTime: data.lunchEndTime,
            totalWorkingHours: data.totalWorkingHours,
            delayPerShift: data.delayPerShift,
            halfDayWorkingHours: data.halfDayWorkingHours,
            earlyPerShift: data.earlyPerShift,
            lunchHours: data.lunchHours,
            isActive: true,
            // API-specific fields
            fomS_Id: fomS_Id, // Shift Master ID
            employeeIds: employeeIds, // Employee IDs
            dayTypeIds: dayTypeIds // Day Type IDs
        };

        saveMapping(mappingData, {
            onSuccess: () => {
                refetchAll();
                onSuccess?.();
            }
        });
    };

    return (
        <div className={className}>
            <ShiftMappingForm editingMapping={null} onSubmit={handleSubmit} onCancel={() => onSuccess?.()} />
        </div>
    );
}
