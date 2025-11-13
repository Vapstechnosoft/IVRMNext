'use client';

import { useEmployeeShiftMapping, useSaveEmployeeShiftMapping } from '@/hooks/hrms/attendance-management/useMasters';
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

    const editingMapping: EmployeeShiftMappingForm = {
        type: Array.isArray(row.type) ? row.type : row.type ? [row.type] : [],
        department: Array.isArray(row.department) ? row.department : row.department ? [row.department] : [],
        designation: Array.isArray(row.designation) ? row.designation : row.designation ? [row.designation] : [],
        dayType: Array.isArray(row.dayType) ? row.dayType : row.dayType ? [row.dayType] : [],
        shiftName: row.shiftName || '',
        applicableDate: row.applicableDate || '',
        employees: row.employees || [],
        shiftStartTime: row.shiftStartTime || '',
        lunchStartTime: row.lunchStartTime || '',
        shiftEndTime: row.shiftEndTime || '',
        lunchEndTime: row.lunchEndTime || '',
        totalWorkingHours: row.totalWorkingHours || '',
        delayPerShift: row.delayPerShift || '',
        halfDayWorkingHours: row.halfDayWorkingHours || '',
        earlyPerShift: row.earlyPerShift || '',
        lunchHours: row.lunchHours || ''
    };

    const handleSubmit = (data: EmployeeShiftMappingForm) => {
        const dayTypeValue = Array.isArray(data.dayType) ? data.dayType[0] || '' : data.dayType || '';
        const mappingData = {
            id: row.id,
            type: data.type || [],
            department: data.department || [],
            designation: data.designation || [],
            dayType: data.dayType || [],
            shiftName: data.shiftName,
            applicableDate: data.applicableDate,
            employees: data.employees || [],
            employee: row.employee || 'Sample Employee',
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
            isActive: row.isActive ?? true
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
            <ShiftMappingForm editingMapping={editingMapping} onSubmit={handleSubmit} onCancel={() => onSuccess?.()} />
        </div>
    );
}
