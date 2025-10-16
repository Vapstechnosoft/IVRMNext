'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type { IDropdown, IUserAccessibleModules, UserNotification } from '@/types';

export async function getCommonDropdown(name: string) {
    const url = `/v1/common/common_drop_down_list/${name}`;
    return await api.get<IDropdown[]>(url);
}

export async function getUserNotificationList(_priority?: string) {
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
    const _url = '/v1/login/user_accessible_pages';

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
            },
            {
                id: 2,
                name: 'Fees Manageent',
                icon: 'Settings',
                menu: [
                    {
                        id: 2,
                        name: 'Fees',
                        icon: 'Settings',
                        sub_menu: [
                            {
                                id: 2,
                                name: 'Masters',
                                icon: 'Settings',
                                pages: [
                                    {
                                        id: 5,
                                        name: 'Fee Head',
                                        icon: 'Settings',
                                        url: '/fees/masters/feehead',
                                        title: 'Fee Head',
                                        description: 'Manage Fee Head Details'
                                    },
                                    {
                                        id: 6,
                                        name: 'Mode Of Payment',
                                        icon: 'Settings',
                                        url: '/fees/masters/modeofpayment',
                                        title: 'Mode Of Payment',
                                        description: 'Manage Mode Of Payment Details'
                                    },

                                    {
                                        id: 7,
                                        name: 'Payment Gateway Details',
                                        icon: 'Settings',
                                        url: '/fees/masters/paymentGatewayDetails',
                                        title: 'Payment Gateway Details',
                                        description: 'Manage Payment Gateway Details'
                                    },
                                    {
                                        id: 8,
                                        name: 'Master Fine Slab',
                                        icon: 'Settings',
                                        url: '/fees/masters/masterfineslab',
                                        title: 'Master Fine Slab',
                                        description: 'Manage Master Fine Slab Details'
                                    },
                                    {
                                        id: 9,
                                        name: 'Master Fee Concession',
                                        icon: 'Settings',
                                        url: '/fees/masters/masterfeeconcession',
                                        title: 'Master Fee Concession',
                                        description: 'Manage Master Fee Concession Details'
                                    },
                                    {
                                        id: 20,
                                        name: 'Master Fee Concession Details',
                                        icon: 'Settings',
                                        url: '/fees/masters/masterfeeconcessiondetails',
                                        title: 'Master Fee Concession Details',
                                        description: 'Manage Master Fee Concession Details'
                                    },
                                    {
                                        id: 10,
                                        name: 'Master Fee Terms',
                                        icon: 'Settings',
                                        url: '/fees/masters/feemasterterms',
                                        title: 'Master Fee Terms',
                                        description: 'Manage Master Fee Terms Details'
                                    },
                                    {
                                        id: 11,
                                        name: 'Master Term Fee Head',
                                        icon: 'Settings',
                                        url: '/fees/masters/mastertermfeehead',
                                        title: 'Master Term Fee Head',
                                        description: 'Manage Master Term Fee Head Details'
                                    },
                                    {
                                        id: 12,
                                        name: 'Class Category',
                                        icon: 'Settings',
                                        url: '/fees/masters/classcategory',
                                        title: 'Class Category',
                                        description: 'Class Category'
                                    },
                                    {
                                        id: 13,
                                        name: 'Category',
                                        icon: 'Settings',
                                        url: '/fees/masters/category',
                                        title: 'Category',
                                        description: 'Category'
                                    },
                                    {
                                        id: 14,
                                        name: 'Installment',
                                        icon: 'Settings',
                                        url: '/fees/masters/feesinstallment',
                                        title: 'Installment',
                                        description: 'Installment'
                                    },
                                    {
                                        id: 15,
                                        name: 'Installment due date',
                                        icon: 'Settings',
                                        url: '/fees/masters/feesinstallmentduedate',
                                        title: 'Installment due date',
                                        description: 'Installment due date'
                                    },
                                    {
                                        id: 16,
                                        name: 'Group Grouping',
                                        icon: 'Settings',
                                        url: '/fees/masters/groupsgrouping',
                                        title: 'Group Grouping',
                                        description: 'Group Grouping'
                                    },
                                    {
                                        id: 17,
                                        name: 'Groups',
                                        icon: 'Settings',
                                        url: '/fees/masters/mastergroup',
                                        title: 'Groups',
                                        description: 'Groups'
                                    },
                                    {
                                        id: 19,
                                        name: 'Yearly Groups',
                                        icon: 'Settings',
                                        url: '/fees/masters/yearlygroup',
                                        title: 'Yearly Groups',
                                        description: 'Yearly Groups'
                                    },
                                    {
                                        id: 18,
                                        name: 'Yearly Groups Mapping',
                                        icon: 'Settings',
                                        url: '/fees/masters/yearlyfeegroupmapping',
                                        title: 'Yearly Groups Mapping',
                                        description: 'Yearly Groups Mapping'
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
