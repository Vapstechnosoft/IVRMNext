'use server';

import { createLocalCrud } from '@/lib/localdb';

export interface EmployeeShiftMapping {
    id: number;
    type: string | string[];
    department: string | string[];
    designation: string | string[];
    dayType: string | string[];
    shiftName: string;
    applicableDate: string;
    employees: string[];
    employee: string;
    holidayType: string;
    totalWork: string;
    halfDayWork: string;
    morningLogin: string;
    morningLogout: string;
    afternoonLogin: string;
    afternoonLogout: string;
    delayShift: string;
    earlyShift: string;
    lunchHour: string;
    shiftStartTime?: string;
    lunchStartTime?: string;
    shiftEndTime?: string;
    lunchEndTime?: string;
    totalWorkingHours?: string;
    delayPerShift?: string;
    halfDayWorkingHours?: string;
    earlyPerShift?: string;
    lunchHours?: string;
    isActive: boolean;
    createdAt: Date;
}

const store = createLocalCrud<EmployeeShiftMapping>('master:employeeShiftMapping');

export async function getEmployeeShiftMapping() {
    return {
        success: true,
        data: store.list(),
        message: 'Employee shift mapping retrieved successfully'
    };
}

export async function addOrUpdateEmployeeShiftMapping(data: {
    id?: number;
    type: string | string[];
    department: string | string[];
    designation: string | string[];
    dayType: string | string[];
    shiftName: string;
    applicableDate: string;
    employees: string[];
    employee: string;
    holidayType: string;
    totalWork: string;
    halfDayWork: string;
    morningLogin: string;
    morningLogout: string;
    afternoonLogin: string;
    afternoonLogout: string;
    delayShift: string;
    earlyShift: string;
    lunchHour: string;
    shiftStartTime?: string;
    lunchStartTime?: string;
    shiftEndTime?: string;
    lunchEndTime?: string;
    totalWorkingHours?: string;
    delayPerShift?: string;
    halfDayWorkingHours?: string;
    earlyPerShift?: string;
    lunchHours?: string;
    isActive: boolean;
}) {
    try {
        if (data.id) {
            const updated = store.update(data.id, data);
            if (updated) {
                return {
                    success: true,
                    data: updated,
                    message: 'Employee shift mapping updated successfully'
                };
            }
            return {
                success: false,
                message: 'Employee shift mapping not found'
            };
        } else {
            const created = store.create(data);
            return {
                success: true,
                data: created,
                message: 'Employee shift mapping created successfully'
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to save employee shift mapping'
        };
    }
}

export async function deleteEmployeeShiftMapping(id: number) {
    try {
        const removed = store.remove(id);
        if (removed) {
            return {
                success: true,
                message: 'Employee shift mapping deleted successfully'
            };
        }
        return {
            success: false,
            message: 'Employee shift mapping not found'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to delete employee shift mapping'
        };
    }
}

