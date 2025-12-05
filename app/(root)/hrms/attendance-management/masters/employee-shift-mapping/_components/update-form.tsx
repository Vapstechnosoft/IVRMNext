'use client';
import {
    useEmployeeShiftMapping,
    useEmployeeShiftMappingEditData,
    useSaveEmployeeShiftMapping
} from '@/hooks/hrms/attendance-management/useMasters';
import { useMemo } from 'react';
import type { EmployeeShiftMapping } from './columns';
import { ShiftMappingForm } from './shift-mapping-form';
import type { EmployeeShiftMappingForm } from './shift-mapping-form';
interface UpdateEmployeeShiftMappingFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: EmployeeShiftMapping;
}
export default function UpdateEmployeeShiftMappingForm({
    onSuccess,
    className = '',
    selectedRow: row
}: UpdateEmployeeShiftMappingFormProps) {
    const { refetchAll } = useEmployeeShiftMapping();
    const { mutate: saveMapping } = useSaveEmployeeShiftMapping();
    // Fetch edit data from API
    const { data: editDataResponse, isLoading: isLoadingEditData } = useEmployeeShiftMappingEditData(row.id);
    const editData = editDataResponse?.data;
    // Use API data if available, otherwise fallback to row data
    const editingMapping: EmployeeShiftMappingForm | null = useMemo(() => {
        if (isLoadingEditData) {
            return null; // Show loading state
        }
        const sourceData = editData || row;
        return {
            type: Array.isArray(sourceData.type) ? sourceData.type : sourceData.type ? [sourceData.type] : [],
            department: Array.isArray(sourceData.department) ? sourceData.department : sourceData.department ? [sourceData.department] : [],
            designation: Array.isArray(sourceData.designation)
                ? sourceData.designation
                : sourceData.designation
                  ? [sourceData.designation]
                  : [],
            dayType: Array.isArray(sourceData.dayType) ? sourceData.dayType : sourceData.dayType ? [sourceData.dayType] : [],
            shiftName: sourceData.shiftName || '',
            applicableDate: sourceData.applicableDate || '',
            employees: sourceData.employees || [],
            shiftStartTime: sourceData.shiftStartTime || '',
            lunchStartTime: sourceData.lunchStartTime || '',
            shiftEndTime: sourceData.shiftEndTime || '',
            lunchEndTime: sourceData.lunchEndTime || '',
            totalWorkingHours: sourceData.totalWorkingHours || '',
            delayPerShift: sourceData.delayPerShift || '',
            halfDayWorkingHours: sourceData.halfDayWorkingHours || '',
            earlyPerShift: sourceData.earlyPerShift || '',
            lunchHours: sourceData.lunchHours || ''
        };
    }, [editData, row, isLoadingEditData]);
    const handleSubmit = (data: EmployeeShiftMappingForm) => {
        // Similar to add-form, we need to map the form data to API format
        // This will be handled in the save function which already has the logic
        const dayTypeValue = Array.isArray(data.dayType) ? data.dayType[0] || '' : data.dayType || '';
        const mappingData = {
            id: row.id, // Include ID for update
            type: data.type || [],
            department: data.department || [],
            designation: data.designation || [],
            dayType: data.dayType || [],
            shiftName: data.shiftName,
            applicableDate: data.applicableDate,
            employees: data.employees || [],
            employee: editData?.employee || row.employee || 'Sample Employee',
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
            isActive: editData?.isActive ?? row.isActive ?? true
        };
        saveMapping(mappingData, {
            onSuccess: () => {
                refetchAll();
                onSuccess?.();
            }
        });
    };
    // Show loading state while fetching edit data
    if (isLoadingEditData || !editingMapping) {
        return (
            <div className={className}>
                <div className='flex items-center justify-center p-8'>
                    <p>Loading edit data...</p>
                </div>
            </div>
        );
    }
    return (
        <div className={className}>
            <ShiftMappingForm editingMapping={editingMapping} onSubmit={handleSubmit} onCancel={() => onSuccess?.()} />
        </div>
    );
}
