'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LeaveAuthorization } from '@/app/(root)/hrms/leave-management/masters/leave-authorization/_components/columns';

export async function getLeaveAuthorization() {
    const db = createLocalCrud<LeaveAuthorization>('leaveAuthorization');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function addOrUpdateLeaveAuthorization(authorization: LeaveAuthorization) {
    const db = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

    if (authorization.id) {
        db.update(authorization.id, authorization);
        return {
            success: true,
            data: authorization,
            message: 'Leave authorization updated successfully'
        };
    } else {
        const newAuthorization = db.create(authorization);
        return {
            success: true,
            data: newAuthorization,
            message: 'Leave authorization created successfully'
        };
    }
}

export async function deleteLeaveAuthorization(id: number) {
    const db = createLocalCrud<LeaveAuthorization>('leaveAuthorization');
    db.remove(id);

    return {
        success: true,
        message: 'Leave authorization deleted successfully'
    };
}

