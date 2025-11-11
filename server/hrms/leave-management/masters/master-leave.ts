'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { MasterLeave } from '@/app/(root)/hrms/leave-management/masters/master-leave/_components/columns';

export async function getMasterLeave() {
    const db = createLocalCrud<MasterLeave>('masterLeave');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function addOrUpdateMasterLeave(leave: MasterLeave) {
    const db = createLocalCrud<MasterLeave>('masterLeave');

    if (leave.id) {
        db.update(leave.id, leave);
        return {
            success: true,
            data: leave,
            message: 'Master leave updated successfully'
        };
    } else {
        const newLeave = db.create(leave);
        return {
            success: true,
            data: newLeave,
            message: 'Master leave created successfully'
        };
    }
}

export async function deleteMasterLeave(id: number) {
    const db = createLocalCrud<MasterLeave>('masterLeave');
    db.remove(id);

    return {
        success: true,
        message: 'Master leave deleted successfully'
    };
}

