import { z } from 'zod';

/**
 * Zod schema for Leave Configuration form validation
 */
export const leaveConfigurationSchema = z.object({
    id: z.number().default(0),
    spOrGenFlg: z.string().min(1, 'SP or General flag is required'),
    punchGapTime: z.string().min(1, 'Punch GAP time is required'),
    absentFlag: z.string().min(1, 'Absent flag is required'),
    lateInEarlyOutFlag: z.string().min(1, 'Late In/Early Out flag is required'),
    lateInRelaxFlag: z.boolean().default(false),
    lateInEarlyOut: z.string().min(1, 'Late In/Early Out selection is required'),
    lateInTime: z.string().min(1, 'Late In time is required'),
    earlyOutRelaxFlag: z.boolean().default(false),
    earlyOutTime: z.string().min(1, 'Early Out time is required'),
    cummulativeTimeFlag: z.boolean().default(false),
    cummulativeTime: z.coerce.number().min(0, 'Cumulative time must be positive'),
    afterCummulativeTime: z.string().min(1, 'After cumulative time is required'),
    noOfLatesFlag: z.boolean().default(false),
    noofMonthlyLateInExempted: z.coerce.number().min(0, 'Monthly late exempted must be positive').default(0),
    noOfLates: z.coerce.number().min(0, 'Number of lates must be positive'),
    noOfLatesCFFlag: z.boolean().default(false),
    leavePrefixSuffixFlag: z.boolean().default(false),
    includeHolidayFlag: z.boolean().default(false),
    activeFlag: z.boolean().default(true)
});

export type LeaveConfigurationFormValues = z.infer<typeof leaveConfigurationSchema>;
