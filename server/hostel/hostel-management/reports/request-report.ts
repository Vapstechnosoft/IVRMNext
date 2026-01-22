'use client';

import { api } from '@/lib/apiService';
import { format } from 'date-fns';

export async function getRequestReport(values: any) {
    try {
        const payload = {
            "type": values.type,
            "frmdate": format(values.fromDate, 'yyyy-MM-dd'),
            "todate": format(values.toDate, 'yyyy-MM-dd'),
        };
        const res = await api.post('/Hostel_Request_Report/getreport', payload);
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching request report:', error);
    }
    return null;
}
