'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type { IDropdown, IUserAccessibleModules, UserNotification } from '@/types';

export async function getCommonDropdown(name: string) {
    const url = `/v1/common/common_drop_down_list/${name}`;
    return await api.get<IDropdown[]>(url);
}

export async function getUserNotificationList(priority?: string) {
    // const url = `/v1/user_notification?priority=${priority ?? 'normal'}`;

    // return await api.get<UserNotification[]>(url);

    const response: ApiResponse<UserNotification[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                title: 'New Admission',
                message: 'New Admission added successfully!!',
                link: null,
                created_timestamp: new Date(-1).toISOString(),
                priority: 'normal',
                user_code: 'Admin_001',
                user_name: 'AdminVV'
            }
        ]
    };

    return await response;
}

export async function markReadUserNotification(id: number) {
    const url = `/v1/user_notification/mark_read/${id}`;
    return await api.put<any>(url);
}

export async function markAllReadUserNotification() {
    const url = '/v1/user_notification/mark_all_read';
    return await api.put<any>(url);
}

export async function getUserAccessibleModules() {
    const url = '/v1/login/user_accessible_pages';

    // return await api.get<IUserAccessibleModules[]>(url);

    const response: ApiResponse<IUserAccessibleModules[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                name: 'Admission',
                icon: 'Settings',
                menu: [
                    {
                        id: 1,
                        name: 'Preadmission',
                        icon: 'Settings',
                        sub_menu: [
                            {
                                id: 1,
                                name: 'Masters',
                                icon: 'Settings',
                                pages: [
                                    {
                                        id: 1,
                                        name: 'Master Class',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/class'
                                    },
                                    {
                                        id: 2,
                                        name: 'Master Category',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/category'
                                    },
                                    {
                                        id: 3,
                                        name: 'Master Section',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/section'
                                    },
                                    {
                                        id: 4,
                                        name: 'Master Class Category',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/class-category'
                                    },
                                    {
                                        id: 5,
                                        name: 'Master Religion',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/religion'
                                    },
                                    {
                                        id: 6,
                                        name: 'Master Caste Category',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/caste-category'
                                    },
                                    {
                                        id: 7,
                                        name: 'Master Caste',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/caste'
                                    }
                                ]
                            },
                            {
                                id: 2,
                                name: 'Transactions',
                                icon: 'Settings',
                                pages: [
                                    {
                                        id: 1,
                                        name: 'Master Class',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/transactions/class'
                                    },
                                    {
                                        id: 2,
                                        name: 'Master Section',
                                        icon: 'Settings',
                                        url: '/admission/transactions/section'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 2,
                        name: 'Enrollment',
                        icon: 'Settings',
                        sub_menu: [
                            {
                                id: 2,
                                name: 'Transactions',
                                icon: 'Settings',
                                pages: [
                                    {
                                        id: 3,
                                        name: 'Student Enrollment',
                                        icon: 'Settings',
                                        url: '/enrollment/transactions/student'
                                    },
                                    {
                                        id: 4,
                                        name: 'Student TC',
                                        icon: 'Settings',
                                        url: '/enrollment/transactions/student_tc'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return response;
}
