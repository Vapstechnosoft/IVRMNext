'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type { IDropdown, IUserAccessibleModules, UserNotification } from '@/types';

export async function getCommonDropdown(name: string) {
    const url = `/v1/common/common_drop_down_list/${name}`;
    return await api.get<IDropdown[]>('default', url);
}

export async function getUserNotificationList(_priority?: string) {
    // const url = `/v1/user_notification?priority=${priority ?? 'normal'}`;

    // return await api.get<UserNotification[]>('admission', url);

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
    return await api.put<any>('default', url);
}

export async function markAllReadUserNotification() {
    const url = '/v1/user_notification/mark_all_read';
    return await api.put<any>('default', url);
}

export async function getUserAccessibleModules() {
    const url = '/v1/login/user_accessible_pages';

    // return await api.get<IUserAccessibleModules[]>('default', url);

    const response: ApiResponse<IUserAccessibleModules[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                name: 'Admission',
                icon: 'UserRoundPlus',
                menu: [
                    {
                        id: 1,
                        name: 'Preadmission',
                        icon: 'UserCog',
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
                                        url: '/admission/preadmission/masters/class',
                                        title: 'Master Class',
                                        description: 'Manage Master Class Details'
                                    },
                                    {
                                        id: 2,
                                        name: 'Master Category',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/category',
                                        title: 'Master Category',
                                        description: 'Manage Master Category Details'
                                    },
                                    {
                                        id: 3,
                                        name: 'Master Section',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/section',
                                        title: 'Master Section',
                                        description: 'Manage Master Section Details'
                                    },
                                    {
                                        id: 4,
                                        name: 'Master Class Category',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/class-category',
                                        title: 'Master Class Category',
                                        description: 'Manage Master Class Category Details'
                                    },
                                    {
                                        id: 5,
                                        name: 'Master Religion',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/religion',
                                        title: 'Master Religion',
                                        description: 'Manage Master Religion Details'
                                    },
                                    {
                                        id: 6,
                                        name: 'Master Caste Category',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/caste-category',
                                        title: 'Master Caste Category',
                                        description: 'Manage Master Caste Category Details'
                                    },
                                    {
                                        id: 7,
                                        name: 'Master Caste',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/masters/caste',
                                        title: 'Master Caste',
                                        description: 'Manage Master Caste Details'
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
                                        name: 'Admission Form',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/transactions/application-form',
                                        title: 'Admission Form',
                                        description: 'Apply for Admission'
                                    },
                                    {
                                        id: 2,
                                        name: 'Transfer Application Status',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/transactions/transfer-application-status',
                                        title: 'Transfer Application Status',
                                        description: 'Manage Transfer Application Status Details'
                                    },
                                    {
                                        id: 3,
                                        name: 'Transfer Admission Status',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/transactions/transfer-admission-status',
                                        title: 'Transfer Admission Status',
                                        description: 'Manage Transfer Admission Status Details'
                                    },
                                    {
                                        id: 4,
                                        name: 'Transfer to Admission',
                                        icon: 'Settings',
                                        url: '/admission/preadmission/transactions/export-preadmission-to-admission',
                                        title: 'Transfer to Admission',
                                        description: 'Transfer confirmed preadmission applications to admission'
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
            },
            {
                id: 2,
                name: 'Exam',
                icon: 'BookOpen',
                menu: [
                    {
                        id: 1,
                        name: 'Exam Module',
                        icon: 'BookOpen',
                        sub_menu: [
                            {
                                id: 1,
                                name: 'Masters',
                                icon: 'Settings',
                                pages: [
                                    {
                                        id: 1,
                                        name: 'Master Subject',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/master-subject',
                                        title: 'Master Subject',
                                        description: 'Manage Master Subject Details'
                                    },
                                    {
                                        id: 2,
                                        name: 'Master Sub-Subject',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/master-sub-subject',
                                        title: 'Master Sub-Subject',
                                        description: 'Manage Master Sub-Subject Details'
                                    },
                                    {
                                        id: 3,
                                        name: 'Master Exam',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/exam-master',
                                        title: 'Master Exam',
                                        description: 'Manage Master Exam Details'
                                    },
                                    {
                                        id: 4,
                                        name: 'Master Sub-Exam',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/sub-exam-master',
                                        title: 'Master Sub-Exam',
                                        description: 'Manage Master Sub-Exam Details'
                                    },
                                    {
                                        id: 5,
                                        name: 'Master Exam Paper',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/exam-paper-master'
                                    },
                                    {
                                        id: 6,
                                        name: 'Master Grade',
                                        icon: 'Settings',
                                        url: '/Exam/exam-module/masters/master-grade'
                                    },
                                    {
                                        id: 7,
                                        name: 'Master Subject Group',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/master-group'
                                    },
                                    {
                                        id: 8,
                                        name: 'Master Category',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/master-category'
                                    },
                                    {
                                        id: 9,
                                        name: 'Category Class Mapping',
                                        icon: 'BookOpen',
                                        url: '/Exam/exam-module/masters/category-class-mapping'
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
