import { clientEnv } from '@/env';
import type {
    ApiResponse,
    CumulativeSalaryReportOnloadResponse,
    CumulativeSalaryReportSearchRequest,
    CumulativeSalaryReportSearchResponse
} from '@/types/hrms/reports/cumulative-salary-report';
import axios from 'axios';

export async function getCumulativeSalaryReportOnload(MI_Id = 30): Promise<ApiResponse<CumulativeSalaryReportOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${MI_Id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<CumulativeSalaryReportOnloadResponse>(
            url,
            {}, // Empty body for POST request
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                validateStatus: (status) => status < 500
            }
        );

        // Log individual dropdown arrays
        if (axiosResponse.data) {
        }

        // Manually wrap the response in ApiResponse format
        const response: ApiResponse<CumulativeSalaryReportOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Data loaded successfully' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error fetching cumulative salary report onload data ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }

        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to load cumulative salary report data',
            data: undefined
        };
    }
}

export async function searchCumulativeSalaryReport(
    data: CumulativeSalaryReportSearchRequest
): Promise<ApiResponse<CumulativeSalaryReportSearchResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<CumulativeSalaryReportSearchResponse>(url, data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<CumulativeSalaryReportSearchResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Search completed successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error searching cumulative salary report ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to search cumulative salary report',
            data: undefined
        };
    }
}

export async function testCumulativeSalaryReportAPI(MI_Id = 30): Promise<ApiResponse<CumulativeSalaryReportOnloadResponse>> {
    try {
        const response = await getCumulativeSalaryReportOnload(MI_Id);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}
