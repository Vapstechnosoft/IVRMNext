'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getHostelFoodConveyanceReportInitialDetails,
    getHostelFoodConveyanceReport
} from '@/server/admission/oldsharehost/reports/hostel_food_conveyance_report';

export const useHostelFoodConveyanceReportInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'hostel_food_conveyance_report_initial_details'],
        queryFn: getHostelFoodConveyanceReportInitialDetails
    });
};

export const useHostelFoodConveyanceReport = () => {
    return useMutation({
        mutationFn: (payload: any) => getHostelFoodConveyanceReport(payload)
    });
};
