'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LeaveYear } from '@/app/(root)/hrms/leave-management/masters/master-leaveYear/_components/columns';

export async function getMasterLeaveYear() {
    const db = createLocalCrud<LeaveYear>('leaveYear');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function addOrUpdateMasterLeaveYear(leaveYear: LeaveYear) {
    const db = createLocalCrud<LeaveYear>('leaveYear');

    if (leaveYear.id) {
        db.update(leaveYear.id, leaveYear);
        return {
            success: true,
            data: leaveYear,
            message: 'Leave year updated successfully'
        };
    } else {
        const newLeaveYear = db.create(leaveYear);
        return {
            success: true,
            data: newLeaveYear,
            message: 'Leave year created successfully'
        };
    }
}

export async function deleteMasterLeaveYear(id: number) {
    const db = createLocalCrud<LeaveYear>('leaveYear');
    db.remove(id);

    return {
        success: true,
        message: 'Leave year deleted successfully'
    };
}

