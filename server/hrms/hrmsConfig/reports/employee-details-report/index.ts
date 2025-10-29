import type {
    ApiResponse,
    EmployeeDetailsReportFilterRequest,
    EmployeeDetailsReportFilterResponse,
    EmployeeDetailsReportOnloadRequest,
    EmployeeDetailsReportOnloadResponse,
    EmployeeDetailsReportSearchRequest,
    EmployeeDetailsReportSearchResponse
} from '@/types/hrms/employee-details-report';
import axios from 'axios';

const API_BASE_URL =
    process.clientEnv.NEXT_PUBLIC_API_BASE_URL || 'https://hrmsservicehub-bwfuevcrhyeaccgv.canadacentral-01.azurewebsites.net';

export async function getEmployeeDetailsReportOnload(
    MI_Id = 30,
    LogInUserId = 2
): Promise<ApiResponse<EmployeeDetailsReportOnloadResponse>> {
    try {
        const requestBody: EmployeeDetailsReportOnloadRequest = {
            MI_Id,
            LogInUserId
        };

        const response = await axios.post(`${API_BASE_URL}/api/EmployeeDetailsReportFacade/onloadgetdetailsNew`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            message: 'Data loaded successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error in getEmployeeDetailsReportOnload:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function filterEmployeeDetailsReport(
    requestBody: EmployeeDetailsReportFilterRequest
): Promise<ApiResponse<EmployeeDetailsReportFilterResponse>> {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/EmployeeDetailsReportFacade/FilterEmployeeDataNew`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            message: 'Data filtered successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error in filterEmployeeDetailsReport:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function searchEmployeeDetailsReport(
    requestBody: EmployeeDetailsReportSearchRequest
): Promise<ApiResponse<EmployeeDetailsReportSearchResponse>> {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/EmployeeDetailsReportFacade/getEmployeedetailsBySelectionNew`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            message: 'Search completed successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error in searchEmployeeDetailsReport:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
