'use server';
import { api, type ApiResponse } from '@/lib/apiService';
import type { IUserAccessibleMenus } from '@/types';

export async function getUserAccessiblePages() {
    const url = '/v1/login/user_accessible_pages';

    // return await api.get<IUserAccessibleMenus[]>(url);

    const response: ApiResponse<IUserAccessibleMenus[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                menu_name: 'N.A',
                icon: 'N.A',
                pages: [
                    { name: 'Class', url: '/admission/masters/class' },
                    { name: 'Section', url: '/admission/masters/section' },
                    { name: 'Subject', url: '/admission/masters/subject' }
                ]
            }
        ]
    };

    return response;
}
