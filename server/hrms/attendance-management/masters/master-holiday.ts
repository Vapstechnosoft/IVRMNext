'use server';

import { createLocalCrud } from '@/lib/localdb';

export interface MasterHoliday {
    id: number;
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
    createdAt: Date;
}

const store = createLocalCrud<MasterHoliday>('master:holiday');

export async function getMasterHoliday() {
    return {
        success: true,
        data: store.list(),
        message: 'Master holiday retrieved successfully'
    };
}

export async function addOrUpdateMasterHoliday(data: {
    id?: number;
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
}) {
    try {
        if (data.id) {
            const updated = store.update(data.id, {
                calendarYear: data.calendarYear,
                department: data.department,
                holidayType: data.holidayType,
                name: data.name,
                selectedDays: data.selectedDays,
                fromDate: data.fromDate,
                toDate: data.toDate,
                isActive: data.isActive
            });
            if (updated) {
                return {
                    success: true,
                    data: updated,
                    message: 'Master holiday updated successfully'
                };
            }
            return {
                success: false,
                message: 'Master holiday not found'
            };
        } else {
            const created = store.create({
                calendarYear: data.calendarYear,
                department: data.department,
                holidayType: data.holidayType,
                name: data.name,
                selectedDays: data.selectedDays,
                fromDate: data.fromDate,
                toDate: data.toDate,
                isActive: data.isActive
            });
            return {
                success: true,
                data: created,
                message: 'Master holiday created successfully'
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to save master holiday'
        };
    }
}

export async function deleteMasterHoliday(id: number) {
    try {
        const removed = store.remove(id);
        if (removed) {
            return {
                success: true,
                message: 'Master holiday deleted successfully'
            };
        }
        return {
            success: false,
            message: 'Master holiday not found'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to delete master holiday'
        };
    }
}

