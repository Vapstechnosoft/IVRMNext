import type { z } from 'zod';
import { employeeLateInEarlyOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';

export type EmployeeLateInEarlyOutReportFilters = z.infer<typeof employeeLateInEarlyOutReportFilterSchema>;

