import type { z } from 'zod';
import { employeeInOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';

export type EmployeeInOutReportFilters = z.infer<typeof employeeInOutReportFilterSchema>;

