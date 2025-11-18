'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LeaveCreditTransaction } from '@/app/(root)/hrms/leave-management/transaction/leave-credit-transaction/_components/columns';

export async function getLeaveCreditTransaction() {
    const db = createLocalCrud<LeaveCreditTransaction>('leaveCreditTransaction');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function addOrUpdateLeaveCreditTransaction(transaction: LeaveCreditTransaction) {
    const db = createLocalCrud<LeaveCreditTransaction>('leaveCreditTransaction');

    if (transaction.id) {
        db.update(transaction.id, transaction);
        return {
            success: true,
            data: transaction,
            message: 'Leave credit transaction updated successfully'
        };
    }
    const newTransaction = db.create(transaction);
    return {
        success: true,
        data: newTransaction,
        message: 'Leave credit transaction created successfully'
    };
}

export async function deleteLeaveCreditTransaction(id: number) {
    const db = createLocalCrud<LeaveCreditTransaction>('leaveCreditTransaction');
    db.remove(id);

    return {
        success: true,
        message: 'Leave credit transaction deleted successfully'
    };
}

