'use client';

import { useEmployeeShiftMapping, useSaveEmployeeShiftMapping } from '@/hooks/hrms/attendance-management/useMasters';
import { ShiftMappingForm } from './shift-mapping-form';
import type { EmployeeShiftMappingForm } from './shift-mapping-form';

interface AddEmployeeShiftMappingFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddEmployeeShiftMappingForm({ onSuccess, className = '' }: AddEmployeeShiftMappingFormProps) {
    const { refetchAll } = useEmployeeShiftMapping();
    const { mutate: saveMapping } = useSaveEmployeeShiftMapping();

    const handleSubmit = (data: EmployeeShiftMappingForm) => {
        const dayTypeValue = Array.isArray(data.dayType) ? data.dayType[0] || '' : data.dayType || '';
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
            isActive: true
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
