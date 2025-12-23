'use server';

import { auth } from '@/lib/auth';
import axios from 'axios';

export async function getExcelMonthEndReport(data: {
    ASMAY_Id: number;
    month: string;
    year: number;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/monthendreport/ExportMonthEndReportToExcel?AcayId=${data.ASMAY_Id}&Month=${data.month}&Year=${data.year}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}
