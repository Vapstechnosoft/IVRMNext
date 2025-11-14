'use client';

import type { BaseEntity } from '@/lib/localdb';

export interface LeaveCarryForward extends BaseEntity {
    leaveYear: string;
    leaveName: string;
    employeeName: string;
    leaveCredit: number;
    leaveBalance: number;
    type: string[];
    department: string[];
    designation: string[];
}

