'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { CompOffApproval } from '@/app/(root)/hrms/leave-management/transaction/comp-off-approval/_components/columns';

export async function getCompOffApproval() {
    const db = createLocalCrud<CompOffApproval>('compOffApproval');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function updateCompOffApprovalStatus(id: number, hrStatus: 'Approved' | 'Rejected', approverRemarks?: string) {
    const db = createLocalCrud<CompOffApproval>('compOffApproval');
    const existing = db.findById(id);
    
    if (existing) {
        db.update(id, { 
            ...existing, 
            hrStatus,
            approverRemarks: approverRemarks || existing.approverRemarks
        });
        return {
            success: true,
            message: `Comp off ${hrStatus.toLowerCase()} successfully`
        };
    }

    return {
        success: false,
        message: 'Record not found'
    };
}

