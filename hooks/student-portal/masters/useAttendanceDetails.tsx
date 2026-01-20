import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { type AttendanceDetailsSchema, attendanceDetailsSchema } from '@/schemas/student-portal/masters/attendance-details.schema';
import { getAttendanceData, getAttendanceInitialData } from '@/server/student-portal/masters/attendance-details';
import type { IApiResponse, IAttendanceYear } from '@/types/student-portal/masters/attendance-details';

export function useAttendanceDetails() {
    const form = useForm<AttendanceDetailsSchema>({
        resolver: zodResolver(attendanceDetailsSchema),
        defaultValues: {
            asmaY_Id: ''
        }
    });

    const { data: initialData, isLoading: isInitialLoading } = useQuery<IApiResponse<IAttendanceYear[]>>({
        queryKey: ['attendanceInitialData'],
        queryFn: async () => {
            try {
                const response = await getAttendanceInitialData();
                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    form.setValue('asmaY_Id', response.data[0].asmaY_Id.toString());
                }
                return response;
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch initial data');
                // Return fallback resembling empty response structure instead of null to avoid type errors
                return { success: false, message: error.message, data: [], total: 0, page: 0, page_size: 0 } as any;
            }
        }
    });

    return {
        form,
        initialData,
        isInitialLoading,
        getAttendanceData
    };
}
