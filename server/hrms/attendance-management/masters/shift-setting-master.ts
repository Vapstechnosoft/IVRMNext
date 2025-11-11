'use server';

import { createLocalCrud } from '@/lib/localdb';

export interface ShiftSetting {
    id: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
    createdAt: Date;
}

const store = createLocalCrud<ShiftSetting>('master:shiftSetting');

export async function getShiftSettingMaster() {
    return {
        success: true,
        data: store.list(),
        message: 'Shift setting master retrieved successfully'
    };
}

export async function addOrUpdateShiftSettingMaster(data: {
    id?: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
}) {
    try {
        if (data.id) {
            const updated = store.update(data.id, {
                shiftName: data.shiftName,
                shiftStartTime: data.shiftStartTime,
                shiftEndTime: data.shiftEndTime,
                lunchStartTime: data.lunchStartTime,
                lunchEndTime: data.lunchEndTime,
                totalWorkingHours: data.totalWorkingHours,
                halfDayWorkingHours: data.halfDayWorkingHours,
                lunchHours: data.lunchHours,
                delayPerShift: data.delayPerShift,
                earlyPerShift: data.earlyPerShift,
                isActive: data.isActive
            });
            if (updated) {
                return {
                    success: true,
                    data: updated,
                    message: 'Shift setting updated successfully'
                };
            }
            return {
                success: false,
                message: 'Shift setting not found'
            };
        } else {
            const created = store.create({
                shiftName: data.shiftName,
                shiftStartTime: data.shiftStartTime,
                shiftEndTime: data.shiftEndTime,
                lunchStartTime: data.lunchStartTime,
                lunchEndTime: data.lunchEndTime,
                totalWorkingHours: data.totalWorkingHours,
                halfDayWorkingHours: data.halfDayWorkingHours,
                lunchHours: data.lunchHours,
                delayPerShift: data.delayPerShift,
                earlyPerShift: data.earlyPerShift,
                isActive: data.isActive
            });
            return {
                success: true,
                data: created,
                message: 'Shift setting created successfully'
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to save shift setting'
        };
    }
}

export async function deleteShiftSettingMaster(id: number) {
    try {
        const removed = store.remove(id);
        if (removed) {
            return {
                success: true,
                message: 'Shift setting deleted successfully'
            };
        }
        return {
            success: false,
            message: 'Shift setting not found'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to delete shift setting'
        };
    }
}

