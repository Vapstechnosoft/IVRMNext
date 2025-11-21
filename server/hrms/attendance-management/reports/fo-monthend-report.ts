'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type {
    FOMonthEndReportGetDataRequest,
    FOMonthEndReportGetDataResponse,
    FOMonthEndReportApiResponse
} from '@/types/hrms/reports/fo-monthend-report';

/**
 * Get month end report data (classes, sections, months, years)
 * POST /api/FrontOfficeMonthEndReportFacade/getdata
 */
export async function getFOMonthEndReportData(
    MI_Id = 30,
    LoginUserId = 0,
    UserRole = ''
): Promise<ApiResponse<FOMonthEndReportGetDataResponse>> {
    const url = '/api/FrontOfficeMonthEndReportFacade/getdata';
    
    // Build request body
    const requestBody: FOMonthEndReportGetDataRequest = {
        page: 1,
        page_size: 10,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: false,
        miid: MI_Id,
        loginUserId: LoginUserId,
        userRole: UserRole
    };
    
    console.log('🔄 [SERVER] Fetching Front Office Month End Report data');
    console.log('📤 [SERVER] Request URL:', url);
    console.log('📤 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<FOMonthEndReportApiResponse>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] Raw API Response:', JSON.stringify(response, null, 2));
        const responseData = (response?.data as unknown) as FOMonthEndReportGetDataResponse | undefined;
        console.log('📥 [SERVER] Response Analysis:', {
            hasResponse: !!response,
            success: response?.success,
            message: response?.message,
            hasData: !!responseData,
            classesCount: responseData?.classes?.length || 0,
            sectionsCount: responseData?.sections?.length || 0,
            monthsCount: responseData?.months?.length || 0,
            yearsCount: responseData?.years?.length || 0
        });
        
        // The API returns: { success: boolean, message: string, data: { classes, sections, months, years }, total: number, page: number, page_size: number }
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            const responseData = (response.data as unknown) as FOMonthEndReportGetDataResponse;
            
            if (responseData) {
                return {
                    success: response.success,
                    message: response.message || 'Data loaded successfully',
                    data: {
                        classes: responseData.classes || [],
                        sections: responseData.sections || [],
                        months: responseData.months || [],
                        years: responseData.years || []
                    }
                };
            }
        }
        
        console.log('❌ [SERVER] Unexpected response format');
        return {
            success: false,
            message: 'Failed to load data - unexpected response format',
            data: {
                classes: [],
                sections: [],
                months: [],
                years: []
            }
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Error fetching Front Office Month End Report data:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error.message,
            status: error.status,
            response: error.response
        });
        return {
            success: false,
            message: error.message || 'Failed to fetch month end report data',
            data: {
                classes: [],
                sections: [],
                months: [],
                years: []
            }
        };
    }
}

