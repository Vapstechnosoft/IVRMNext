'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
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
    const session = await auth();

    let response: ApiResponse<IUserAccessibleModules[]>;

    if (session?.role.toUpperCase() === 'ADMIN') {
        response = {
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
                                        },
                                        {
                                            id: 8,
                                            name: 'Master Document',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/document',
                                            title: 'Master Document',
                                            description: 'Manage Master Document Details'
                                        },
                                        {
                                            id: 9,
                                            name: 'Master Reference',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/reference',
                                            title: 'Master Reference',
                                            description: 'Manage Master Reference Details'
                                        },
                                        {
                                            id: 10,
                                            name: 'Master Source',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/source',
                                            title: 'Master Source',
                                            description: 'Manage Master Source Details'
                                        },
                                        {
                                            id: 11,
                                            name: 'Master Religion Caste Category',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/religion-caste-category',
                                            title: 'Master Religion Caste Category',
                                            description: 'Manage Master Religion Caste Category Details'
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
                                            name: 'Preadmission Form',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/application-form',
                                            title: 'Preadmission Form',
                                            description: 'Apply for Preadmission'
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
                                        },
                                        {
                                            id: 5,
                                            name: 'Document View',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/document-view',
                                            title: 'Document View',
                                            description: ' Document View'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Academic Year Master',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/academic-year',
                                            title: 'Academic Year Master',
                                            description: 'Academic Year Master'
                                        },
                                        {
                                            id: 2,
                                            name: 'Master Configuration',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/master-configuration',
                                            title: 'Master Configuration',
                                            description: 'Master Configuration'
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
                                        // {
                                        //     id: 20,
                                        //     name: 'Master Fee Concession Details',
                                        //     icon: 'Settings',
                                        //     url: '/fees/masters/masterfeeconcessiondetails',
                                        //     title: 'Master Fee Concession Details',
                                        //     description: 'Manage Master Fee Concession Details'
                                        // },
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
                                        },
                                        {
                                            id: 21,
                                            name: 'Group wise  Auto Receipt',
                                            icon: 'Settings',
                                            url: '/fees/masters/groupwiseautoreceipt',
                                            title: 'Yearly Groups Mapping',
                                            description: 'Yearly Groups Mapping'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Fee configuration',
                                            icon: 'Settings',
                                            url: '/fees/configuration/masterfeeconfig',
                                            title: 'Fee configuration',
                                            description: 'Fee configuration'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 3,
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
    } else
        response = {
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
