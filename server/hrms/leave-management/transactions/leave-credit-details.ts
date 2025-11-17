'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LeaveCreditDetail } from '@/app/(root)/hrms/leave-management/transaction/leave-credit-details/_components/columns';

export async function getLeaveCreditDetails() {
    const db = createLocalCrud<LeaveCreditDetail>('leaveCreditDetails');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function addOrUpdateLeaveCreditDetails(detail: LeaveCreditDetail) {
    const db = createLocalCrud<LeaveCreditDetail>('leaveCreditDetails');

    if (detail.id) {
        db.update(detail.id, detail);
        return {
            success: true,
            data: detail,
            message: 'Leave credit detail updated successfully'
        };
    }
    const newDetail = db.create(detail);
        return {
            success: true,
            data: newDetail,
            message: 'Leave credit detail created successfully'
        };
    }
}

export async function deleteLeaveCreditDetails(id: number) {
    const db = createLocalCrud<LeaveCreditDetail>('leaveCreditDetails');
    db.remove(id);

    return {
        success: true,
        message: 'Leave credit detail deleted successfully'
    };
}

