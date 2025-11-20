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
                                        },
                                        {
                                            id: 12,
                                            name: 'Master Class Teacher',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/class-teacher',
                                            title: 'Master Class Teacher',
                                            description: 'Manage Master Class Teacher Details'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 12,
                                            name: 'Preadmission Form',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/application-form',
                                            title: 'Preadmission Form',
                                            description: 'Apply for Preadmission'
                                        },
                                        {
                                            id: 13,
                                            name: 'Transfer Application Status',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/transfer-application-status',
                                            title: 'Transfer Application Status',
                                            description: 'Manage Transfer Application Status Details'
                                        },
                                        {
                                            id: 14,
                                            name: 'Transfer Admission Status',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/transfer-admission-status',
                                            title: 'Transfer Admission Status',
                                            description: 'Manage Transfer Admission Status Details'
                                        },
                                        {
                                            id: 15,
                                            name: 'Transfer to Admission',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/export-preadmission-to-admission',
                                            title: 'Transfer to Admission',
                                            description: 'Transfer confirmed preadmission applications to admission'
                                        },
                                        {
                                            id: 16,
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
                                            id: 17,
                                            name: ' Master Academic Year',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/academic-year',
                                            title: 'Master Academic Year ',
                                            description: 'Master Academic Year '
                                        },
                                        {
                                            id: 18,
                                            name: 'Master Configuration',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/master-configuration',
                                            title: 'Master Configuration',
                                            description: 'Master Configuration'
                                        },
                                        {
                                            id: 19,
                                            name: 'Registration Numbering',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/registration-numbering',
                                            title: 'Registration Numbering',
                                            description: 'Registration Numbering'
                                        },
                                        {
                                            id: 20,
                                            name: 'Pre-Registration Numbering',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/pre-registration-numbering',
                                            title: 'Pre-Registration Numbering',
                                            description: 'Pre-Registration Numbering'
                                        }
                                    ]
                                }
                                // {
                                //   id: 4,
                                //   name: "Reports",
                                //   icon: "Settings",
                                //   pages: [
                                //     {
                                //       id: 21,
                                //       name: "Student Count Report",
                                //       icon: "Settings",
                                //       url: "/admission/preadmission/reports/student-count-report",
                                //       title: "Student Count Report",
                                //       description: "Student Count Report",
                                //     },
                                //   ],
                                // },
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Fees Management',
                    icon: 'Settings',
                    menu: [
                        {
                            id: 2,
                            name: 'Fees',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 4,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 21,
                                            name: 'Fee configuration',
                                            icon: 'Settings',
                                            url: '/fees/configuration/masterfeeconfig',
                                            title: 'Fee configuration',
                                            description: 'Fee configuration'
                                        }
                                    ]
                                },
                                {
                                    id: 5,
                                    name: 'Masters',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 22,
                                            name: 'Fee Head',
                                            icon: 'Settings',
                                            url: '/fees/masters/feehead',
                                            title: 'Fee Head',
                                            description: 'Manage Fee Head Details'
                                        },
                                        {
                                            id: 23,
                                            name: 'Mode Of Payment',
                                            icon: 'Settings',
                                            url: '/fees/masters/modeofpayment',
                                            title: 'Mode Of Payment',
                                            description: 'Manage Mode Of Payment Details'
                                        },
                                        {
                                            id: 24,
                                            name: 'Payment Gateway Details',
                                            icon: 'Settings',
                                            url: '/fees/masters/paymentGatewayDetails',
                                            title: 'Payment Gateway Details',
                                            description: 'Manage Payment Gateway Details'
                                        },
                                        {
                                            id: 25,
                                            name: 'Master Fine Slab',
                                            icon: 'Settings',
                                            url: '/fees/masters/masterfineslab',
                                            title: 'Master Fine Slab',
                                            description: 'Manage Master Fine Slab Details'
                                        },
                                        {
                                            id: 26,
                                            name: 'Fee Master Concession',
                                            icon: 'Settings',
                                            url: '/fees/masters/masterfeeconcession',
                                            title: 'Fee Master Concession',
                                            description: 'Manage Fee Master Concession Details'
                                        },

                                        {
                                            id: 600,
                                            name: ' Concession Category Details',
                                            icon: 'Settings',
                                            url: '/fees/masters/masterfeeconcessiondetails',
                                            title: 'Concession Category Details',
                                            description: 'Concession Category Details'
                                        },
                                        //  {
                                        //     id: 650,
                                        //     name: ' Concession Category Group Head Mapping',
                                        //     icon: 'Settings',
                                        //     url: '/fees/masters/concessioncategorygroupheadmapping',
                                        //     title: 'Concession Category Group Head Mapping',
                                        //     description: 'Concession Category Group Head Mapping'
                                        // },
                                        {
                                            id: 27,
                                            name: 'Fee Terms',
                                            icon: 'Settings',
                                            url: '/fees/masters/feemasterterms',
                                            title: 'Fee Terms',
                                            description: 'Manage Fee Terms Details'
                                        },
                                        {
                                            id: 28,
                                            name: 'Master Term Fee Head',
                                            icon: 'Settings',
                                            url: '/fees/masters/mastertermfeehead',
                                            title: 'Master Term Fee Head',
                                            description: 'Manage Master Term Fee Head Details'
                                        },
                                        {
                                            id: 601,
                                            name: 'Master Term Fee Head Due Date',
                                            icon: 'Settings',
                                            url: '/fees/masters/mastertermfeeheadduedate',
                                            title: 'Master Term Fee Head Due Date',
                                            description: 'Manage Master Term Fee Head Due Date'
                                        },
                                        {
                                            id: 29,
                                            name: 'Class Category',
                                            icon: 'Settings',
                                            url: '/fees/masters/classcategory',
                                            title: 'Class Category',
                                            description: 'Manage Class Category'
                                        },
                                        {
                                            id: 30,
                                            name: 'Yearly Category',
                                            icon: 'Settings',
                                            url: '/fees/masters/category',
                                            title: 'Yearly Category',
                                            description: 'Manage Yearly Category'
                                        },
                                        {
                                            id: 31,
                                            name: 'Fee Installment',
                                            icon: 'Settings',
                                            url: '/fees/masters/feesinstallment',
                                            title: 'Fee Installment',
                                            description: ' Manage Fee Installment'
                                        },
                                        {
                                            id: 32,
                                            name: 'Installment due date',
                                            icon: 'Settings',
                                            url: '/fees/masters/feesinstallmentduedate',
                                            title: 'Installment due date',
                                            description: 'Installment due date'
                                        },
                                        {
                                            id: 33,
                                            name: 'Fee Group Grouping',
                                            icon: 'Settings',
                                            url: '/fees/masters/groupsgrouping',
                                            title: 'Group Grouping',
                                            description: 'Manage Group Grouping'
                                        },
                                        {
                                            id: 34,
                                            name: 'Fee Groups',
                                            icon: 'Settings',
                                            url: '/fees/masters/mastergroup',
                                            title: 'Groups',
                                            description: 'Manage Groups'
                                        },
                                        {
                                            id: 35,
                                            name: 'Fee Yearly Groups',
                                            icon: 'Settings',
                                            url: '/fees/masters/yearlygroup',
                                            title: 'Yearly Groups',
                                            description: 'Manage Yearly Groups'
                                        },

                                        {
                                            id: 36,
                                            name: 'Fee Yearly Groups Mapping',
                                            icon: 'Settings',
                                            url: '/fees/masters/yearlygroupmapping',
                                            title: 'Yearly Groups Mapping',
                                            description: 'Manage Yearly Groups Mapping'
                                        },
                                        {
                                            id: 37,
                                            name: 'Fee Group wise  Auto Receipt',
                                            icon: 'Settings',
                                            url: '/fees/masters/groupwiseautoreceipt',
                                            title: 'Group wise  Auto Receipt',
                                            description: 'Manage Group wise  Auto Receipt'
                                        },
                                        {
                                            id: 38,
                                            name: 'Fee Yearly Rebate Settings',
                                            icon: 'Settings',
                                            url: '/fees/masters/yearlyrebatesetting',
                                            title: 'Yearly Rebate Settings',
                                            description: 'Manage Yeary Rebate Settings'
                                        },
                                        {
                                            id: 39,
                                            name: 'Fee Privilege',
                                            icon: 'Settings',
                                            url: '/fees/masters/feeprevilege',
                                            title: 'Fee Privilege',
                                            description: 'Manage Fee Privilege Details'
                                        },
                                        {
                                            id: 40,
                                            name: 'Online Payment Head Group',
                                            icon: 'Settings',
                                            url: '/fees/masters/onlinepaymentheadgroupmapping',
                                            title: 'Online Payment Head Group',
                                            description: 'Manage Online Payment Head Group Mapping Details'
                                        }
                                    ]
                                },
                                {
                                    id: 6,
                                    name: 'Transactions',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 40,
                                            name: 'Fee Amount Entry',
                                            icon: 'Settings',
                                            url: '/fees/transactions/feeamountentry',
                                            title: 'Fee Amount Entry',
                                            description: 'Manage Fee Amount Entry Details'
                                        },
                                        {
                                            id: 41,
                                            name: 'Third Party Transaction',
                                            icon: 'Settings',
                                            url: '/fees/transactions/thirdPartyTransaction',
                                            title: 'Third Party Transaction',
                                            description: 'Third Party Transaction'
                                        },
                                        {
                                            id: 42,
                                            name: 'Fee Opening Balance',
                                            icon: 'Settings',
                                            url: '/fees/transactions/feeopeningbalance',
                                            title: 'Fee Opening Balance',
                                            description: 'Fee Opening Balance'
                                        },
                                        {
                                            id: 43,
                                            name: 'Fee waivedoff',
                                            icon: 'Settings',
                                            url: '/fees/transactions/waivedoff',
                                            title: 'Fee waivedoff',
                                            description: 'Fee waivedoff'
                                        },
                                        {
                                            id: 500,
                                            name: 'Fee Preadmission Transaction',
                                            icon: 'Settings',
                                            url: '/fees/transactions/feepreadmissiontrasaction',
                                            title: 'Fee Preadmission Transaction',
                                            description: 'Fee Preadmission Transaction'
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
                            id: 3,
                            name: 'Exam Module',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 9,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 58,
                                            name: 'Exam Standard',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/configurations/exam-standard',
                                            title: 'Exam Standard',
                                            description: 'Manage Exam Standard Details'
                                        }
                                    ]
                                },
                                {
                                    id: 7,
                                    name: 'Masters',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 44,
                                            name: 'Master Subject',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/master-subject',
                                            title: 'Master Subject',
                                            description: 'Manage Master Subject Details'
                                        },
                                        {
                                            id: 45,
                                            name: 'Master Sub-Subject',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/master-sub-subject',
                                            title: 'Master Sub-Subject',
                                            description: 'Manage Master Sub-Subject Details'
                                        },
                                        {
                                            id: 46,
                                            name: 'Master Exam',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/exam-master',
                                            title: 'Master Exam',
                                            description: 'Manage Master Exam Details'
                                        },
                                        {
                                            id: 47,
                                            name: 'Master Sub-Exam',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/sub-exam-master',
                                            title: 'Master Sub-Exam',
                                            description: 'Manage Master Sub-Exam Details'
                                        },
                                        {
                                            id: 48,
                                            name: 'Master Exam Paper',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/exam-paper-master',
                                            title: 'Master Exam Paper',
                                            description: 'Manage Master Exam Paper Details'
                                        },
                                        {
                                            id: 49,
                                            name: 'Master Grade',
                                            icon: 'Settings',
                                            url: '/Exam/exam-module/masters/master-grade',
                                            title: 'Master Grade',
                                            description: 'Manage Master Grade Details'
                                        },
                                        {
                                            id: 50,
                                            name: 'Master Subject Group',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/master-group',
                                            title: 'Master Subject Group',
                                            description: 'Manage Master Subject Group Details'
                                        },
                                        {
                                            id: 51,
                                            name: 'Master Category',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/master-category',
                                            title: 'Master Category',
                                            description: 'Manage Master Category Details'
                                        },
                                        {
                                            id: 52,
                                            name: 'Category Class Mapping',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/category-class-mapping',
                                            title: 'Category Class Mapping',
                                            description: 'Manage Category Class Mapping Details'
                                        },
                                        {
                                            id: 200,
                                            name: 'Co-Scholastic Activities',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/co-scholastic-activities',
                                            title: 'Co-Scholastic Activities',
                                            description: 'Manage Co-Scholastic Activities Details'
                                        },
                                        {
                                            id: 201,
                                            name: 'Co-Scholastic Area',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/co-scholastic-area',
                                            title: 'Co-Scholastic Area',
                                            description: 'Manage Co-Scholastic Area Details'
                                        },
                                        {
                                            id: 202,
                                            name: 'Life Skills',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/life-skills',
                                            title: 'Life Skills',
                                            description: 'Manage Life Skills Details'
                                        },
                                        {
                                            id: 203,
                                            name: 'Life-Skills Area',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/life-skills-area',
                                            title: 'Life Skills Area',
                                            description: 'Manage Life Skills Area Details'
                                        }
                                    ]
                                },
                                {
                                    id: 8,
                                    name: 'Exam Mapping',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 53,
                                            name: 'Exam Subject Wizard',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/exam-mapping/exam-subject-wizard',
                                            title: 'Exam Subject Wizard',
                                            description: 'Manage Exam Subject Wizard Details'
                                        },
                                        // {
                                        //     id: 54,
                                        //     name: 'Exam Login Privilages',
                                        //     icon: 'CalendarDays',
                                        //     url: '/Exam/exam-module/exam-mapping/exam-login-privilages',
                                        //     title: 'Exam Login Privilages',
                                        //     description: 'Manage Exam Login Privilages Details'
                                        // },
                                        {
                                            id: 55,
                                            name: 'Yearly category Subject Mapping',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/exam-mapping/yearly-category-subject-mapping',
                                            title: 'Yearly category Subject Mapping',
                                            description: 'Manage Yearly category Subject Mapping Details'
                                        },
                                        {
                                            id: 56,
                                            name: 'Yearly Category Date Mapping',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/exam-mapping/yearly-category-dates-mapping',
                                            title: 'Yearly Category Date Mapping',
                                            description: 'Manage Yearly Category Date Mapping Details'
                                        },
                                        {
                                            id: 57,
                                            name: 'Exam Subject Group Mapping',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/exam-subject-group-mapping',
                                            title: 'Subject Group Mapping',
                                            description: 'Manage Exam Subject Group Mapping Details'
                                        },
                                        {
                                            id: 58,
                                            name: 'Exam Term And Exam Mapping',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/exam-term-and-exam-mapping',
                                            title: 'Exam Term And Exam Mapping',
                                            description: 'Manage Exam Term And Exam Mapping Details'
                                        },
                                        {
                                            id: 59,
                                            name: 'Co-Scholastic Activity Area Mapping',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/co-scholastic-activitiy-area-mapping',
                                            title: 'Co-Scholastic Activity Area Mapping',
                                            description: 'Manage Co-Scholastic Activity Area Mapping Details'
                                        },
                                        {
                                            id: 60,
                                            name: 'Life Skill Area Mapping',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/lifeskill-area-mapping',
                                            title: 'Life Skill Area Mapping',
                                            description: 'Manage Life Skill Area Mapping Details'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 4,
                    name: 'HRMS',
                    icon: 'Users',
                    menu: [
                        {
                            id: 1,
                            name: 'HRMS Config',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Earnings & Deductions',
                                            icon: 'DollarSign',
                                            url: '/hrms/masters/earnings-deductions',
                                            title: 'Earnings & Deductions',
                                            description: 'Manage Salary Components'
                                        },
                                        {
                                            id: 2,
                                            name: 'Bank',
                                            icon: 'Building2',
                                            url: '/hrms/masters/bank',
                                            title: 'Bank Master',
                                            description: 'Manage Bank Details'
                                        },
                                        {
                                            id: 3,
                                            name: 'Gender',
                                            icon: 'Users',
                                            url: '/hrms/masters/gender',
                                            title: 'Gender Master',
                                            description: 'Manage Gender Details'
                                        },
                                        {
                                            id: 4,
                                            name: 'Course',
                                            icon: 'BookOpen',
                                            url: '/hrms/masters/course',
                                            title: 'Course Master',
                                            description: 'Manage Course Details'
                                        },
                                        {
                                            id: 5,
                                            name: 'Leave Year',
                                            icon: 'Calendar',
                                            url: '/hrms/masters/leave-year',
                                            title: 'Leave Year Master',
                                            description: 'Manage Leave Year'
                                        },
                                        {
                                            id: 6,
                                            name: 'Marital Status',
                                            icon: 'Heart',
                                            url: '/hrms/masters/marital-status',
                                            title: 'Marital Status Master',
                                            description: 'Manage Marital Status'
                                        },
                                        {
                                            id: 7,
                                            name: 'Professional Tax',
                                            icon: 'FileText',
                                            url: '/hrms/masters/professional-tax',
                                            title: 'Professional Tax Slab',
                                            description: 'Manage Professional Tax'
                                        },
                                        {
                                            id: 8,
                                            name: 'Employee Category',
                                            icon: 'Users',
                                            url: '/hrms/masters/employee-category',
                                            title: 'Employee Category Management',
                                            description: 'Manage Employee Categories and Classifications'
                                        },
                                        {
                                            id: 9,
                                            name: 'Group-Dept-Dessg Mapping',
                                            icon: 'Network',
                                            url: '/hrms/masters/group-dept-dessg-mapping',
                                            title: 'Group-Dept-Dessg Mapping',
                                            description: 'Map Group, Department & Designation'
                                        },
                                        {
                                            id: 10,
                                            name: 'Loan',
                                            icon: 'CreditCard',
                                            url: '/hrms/masters/loan',
                                            title: 'Loan Master',
                                            description: 'Manage Loan Types'
                                        },
                                        {
                                            id: 11,
                                            name: 'Payroll Standard',
                                            icon: 'Calculator',
                                            url: '/hrms/masters/payroll-standard',
                                            title: 'Payroll Standard',
                                            description: 'Manage Payroll Standards'
                                        },
                                        {
                                            id: 12,
                                            name: 'Religion-Category Mapping',
                                            icon: 'Link',
                                            url: '/hrms/masters/religion-category-mapping',
                                            title: 'Religion-Category Mapping',
                                            description: 'Map Religion & Category'
                                        },
                                        {
                                            id: 13,
                                            name: 'Specialization',
                                            icon: 'GraduationCap',
                                            url: '/hrms/masters/specialization',
                                            title: 'Specialization Master',
                                            description: 'Manage Specialization Details'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Employee',
                                    icon: 'User',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Employee Register',
                                            icon: 'UserPlus',
                                            url: '/hrms/employee',
                                            title: 'Employee Register',
                                            description: 'Manage Employee Registration'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Transactions',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Salary Approval',
                                            icon: 'CheckSquare',
                                            url: '/hrms/transactions/salary-approval',
                                            title: 'Salary Approval',
                                            description: 'Approve Calculated Salaries'
                                        },
                                        {
                                            id: 2,
                                            name: 'Salary Calculation',
                                            icon: 'Calculator',
                                            url: '/hrms/transactions/salary-calculation',
                                            title: 'Salary Calculation',
                                            description: 'Calculate Employee Salary'
                                        },
                                        {
                                            id: 3,
                                            name: 'Salary Increment Process',
                                            icon: 'TrendingUp',
                                            url: '/hrms/transactions/salary-increment',
                                            title: 'Salary Increment Process',
                                            description: 'Manage Salary Increments'
                                        },
                                        {
                                            id: 4,
                                            name: 'Salary Updation',
                                            icon: 'Edit',
                                            url: '/hrms/transactions/salary-updation',
                                            title: 'Salary Updation',
                                            description: 'Update Employee Salary'
                                        },
                                        {
                                            id: 5,
                                            name: 'Mass Updation',
                                            icon: 'RefreshCw',
                                            url: '/hrms/transactions/mass-updation',
                                            title: 'Mass Updation',
                                            description: 'Bulk Update Employee Data'
                                        },
                                        {
                                            id: 6,
                                            name: 'Salary Advance',
                                            icon: 'DollarSign',
                                            url: '/hrms/transactions/salary-advance',
                                            title: 'Salary Advance',
                                            description: 'Manage Salary Advances'
                                        },
                                        {
                                            id: 7,
                                            name: 'Employee Loan',
                                            icon: 'CreditCard',
                                            url: '/hrms/transactions/employee-loan',
                                            title: 'Employee Loan',
                                            description: 'Manage Employee Loans'
                                        }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Reports',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Cumulative Salary Report',
                                            icon: 'BarChart3',
                                            url: '/hrms/reports/cumulative-salary-report',
                                            title: 'Cumulative Salary Report',
                                            description: 'Cumulative Salary Analysis'
                                        },
                                        {
                                            id: 2,
                                            name: 'Employee Details',
                                            icon: 'UserCheck',
                                            url: '/hrms/reports/employee-details',
                                            title: 'Employee Details',
                                            description: 'Detailed Employee Information'
                                        },
                                        {
                                            id: 3,
                                            name: 'Employee Profile',
                                            icon: 'User',
                                            url: '/hrms/reports/employee-profile',
                                            title: 'Employee Profile',
                                            description: 'Employee Profile Report'
                                        },
                                        {
                                            id: 4,
                                            name: 'Salary Slip',
                                            icon: 'Receipt',
                                            url: '/hrms/reports/salary-slip',
                                            title: 'Salary Slip',
                                            description: 'Generate Salary Slips'
                                        },
                                        {
                                            id: 5,
                                            name: 'Employee Contribution',
                                            icon: 'Coins',
                                            url: '/hrms/reports/employee-contribution',
                                            title: 'Employee Contribution',
                                            description: 'Employee Contribution Report'
                                        },
                                        {
                                            id: 6,
                                            name: 'Employee Salary Details',
                                            icon: 'DollarSign',
                                            url: '/hrms/reports/employee-salary-details',
                                            title: 'Employee Salary Details',
                                            description: 'Detailed Salary Information'
                                        },
                                        {
                                            id: 7,
                                            name: 'Employee Strength',
                                            icon: 'Users',
                                            url: '/hrms/reports/employee-strength',
                                            title: 'Employee Strength',
                                            description: 'Employee Strength Report'
                                        },
                                        {
                                            id: 8,
                                            name: 'ESI Report',
                                            icon: 'Shield',
                                            url: '/hrms/reports/esi-report',
                                            title: 'ESI Report',
                                            description: 'ESI Contribution Report'
                                        },
                                        {
                                            id: 9,
                                            name: 'Head Wise Report',
                                            icon: 'List',
                                            url: '/hrms/reports/head-wise-report',
                                            title: 'Head Wise Report',
                                            description: 'Head-wise Analysis Report'
                                        },
                                        {
                                            id: 10,
                                            name: 'Bank Cash Report',
                                            icon: 'Banknote',
                                            url: '/hrms/reports/bank-cash-report',
                                            title: 'Bank Cash Report',
                                            description: 'Bank & Cash Summary'
                                        },
                                        {
                                            id: 11,
                                            name: 'Employee Service Report',
                                            icon: 'Briefcase',
                                            url: '/hrms/reports/employee-service-report',
                                            title: 'Employee Service Report',
                                            description: 'Employee Service Summary'
                                        },
                                        {
                                            id: 12,
                                            name: 'Salary Certificate',
                                            icon: 'Award',
                                            url: '/hrms/reports/salary-certificate',
                                            title: 'Salary Certificate',
                                            description: 'Generate Salary Certificates'
                                        },
                                        {
                                            id: 13,
                                            name: 'PF Challan',
                                            icon: 'FileCheck',
                                            url: '/hrms/reports/pf-challan',
                                            title: 'PF Challan',
                                            description: 'Provident Fund Challan'
                                        },
                                        {
                                            id: 14,
                                            name: 'Form 10',
                                            icon: 'FileType',
                                            url: '/hrms/reports/pf-form-10',
                                            title: 'Form 10',
                                            description: 'Provident Fund Form 10'
                                        },
                                        {
                                            id: 15,
                                            name: 'Form 5',
                                            icon: 'FileType',
                                            url: '/hrms/reports/pf-form-5',
                                            title: 'Form 5',
                                            description: 'Provident Fund Form 5'
                                        },
                                        {
                                            id: 16,
                                            name: 'PF Form6A',
                                            icon: 'FileType',
                                            url: '/hrms/reports/pf-form6a',
                                            title: 'PF Form6A',
                                            description: 'Provident Fund Form 6A'
                                        },
                                        {
                                            id: 17,
                                            name: 'PF Form3A',
                                            icon: 'FileType',
                                            url: '/hrms/reports/pf-form3a',
                                            title: 'PF Form3A',
                                            description: 'Provident Fund Form 3A'
                                        },
                                        {
                                            id: 18,
                                            name: 'HRMS Monthend Report',
                                            icon: 'CalendarCheck',
                                            url: '/hrms/reports/hrms-monthend-report',
                                            title: 'HRMS Monthend Report',
                                            description: 'Monthly Closure Report'
                                        },
                                        {
                                            id: 19,
                                            name: 'Retirement Report',
                                            icon: 'Clock',
                                            url: '/hrms/reports/retirement-report',
                                            title: 'Retirement Report',
                                            description: 'Employee Retirement Report'
                                        },
                                        {
                                            id: 20,
                                            name: 'Department Salary Report',
                                            icon: 'Building2',
                                            url: '/hrms/reports/department-salary-report',
                                            title: 'Department Salary Report',
                                            description: 'Department-wise Salary'
                                        },
                                        {
                                            id: 21,
                                            name: 'Advance Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/reports/advance-report',
                                            title: 'Advance Report',
                                            description: 'View Advance Reports'
                                        },
                                        {
                                            id: 22,
                                            name: 'Employee offer letter',
                                            icon: 'FileText',
                                            url: '/hrms/reports/employee-offer-letter',
                                            title: 'Employee offer letter',
                                            description: 'Generate Offer Letters'
                                        },
                                        {
                                            id: 23,
                                            name: 'Loan Report',
                                            icon: 'CreditCard',
                                            url: '/hrms/reports/loan-report',
                                            title: 'Loan Report',
                                            description: 'Employee Loan Report'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Recruitment',
                            icon: 'UserPlus',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Job',
                                            icon: 'Briefcase',
                                            url: '/hrms/recruitment/masters/master-job',
                                            title: 'Master Job',
                                            description: 'Manage Job Positions'
                                        },
                                        {
                                            id: 2,
                                            name: 'Master Location',
                                            icon: 'MapPin',
                                            url: '/hrms/recruitment/masters/master-location',
                                            title: 'Master Location',
                                            description: 'Manage Locations'
                                        },
                                        {
                                            id: 3,
                                            name: 'Master Position',
                                            icon: 'Target',
                                            url: '/hrms/recruitment/masters/master-position',
                                            title: 'Master Position',
                                            description: 'Manage Positions'
                                        },
                                        {
                                            id: 4,
                                            name: 'Master Position Type',
                                            icon: 'Tag',
                                            url: '/hrms/recruitment/masters/master-positionType',
                                            title: 'Master Position Type',
                                            description: 'Manage Position Types'
                                        },
                                        {
                                            id: 5,
                                            name: 'Master Priority',
                                            icon: 'Flag',
                                            url: '/hrms/recruitment/masters/master-priority',
                                            title: 'Master Priority',
                                            description: 'Manage Priority Levels'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Add Candidate',
                                            icon: 'UserPlus',
                                            url: '/hrms/recruitment/transaction/add-candidate',
                                            title: 'Add Candidate',
                                            description: 'Add New Candidates'
                                        },
                                        {
                                            id: 2,
                                            name: 'MRF',
                                            icon: 'FileText',
                                            url: '/hrms/recruitment/transaction/mrf',
                                            title: 'Manpower Requisition Form',
                                            description: 'Create MRF'
                                        },
                                        {
                                            id: 3,
                                            name: 'Job Posting',
                                            icon: 'Send',
                                            url: '/hrms/recruitment/transaction/job-posting',
                                            title: 'Job Posting',
                                            description: 'Post Job Openings'
                                        },
                                        {
                                            id: 4,
                                            name: 'Schedule Interview',
                                            icon: 'Calendar',
                                            url: '/hrms/recruitment/transaction/shedule-interview',
                                            title: 'Schedule Interview',
                                            description: 'Schedule Candidate Interviews'
                                        },
                                        {
                                            id: 5,
                                            name: 'Call Letter',
                                            icon: 'Mail',
                                            url: '/hrms/recruitment/transaction/call-letter',
                                            title: 'Call Letter',
                                            description: 'Generate Call Letters'
                                        },
                                        {
                                            id: 6,
                                            name: 'Appointment Letter',
                                            icon: 'FileCheck',
                                            url: '/hrms/recruitment/transaction/appointment-letter',
                                            title: 'Appointment Letter',
                                            description: 'Generate Appointment Letters'
                                        },
                                        {
                                            id: 7,
                                            name: 'Add to HRMS',
                                            icon: 'UserCheck',
                                            url: '/hrms/recruitment/transaction/addTo-hrms',
                                            title: 'Add to HRMS',
                                            description: 'Add Selected Candidates to HRMS'
                                        },
                                        {
                                            id: 8,
                                            name: 'Job Post List',
                                            icon: 'List',
                                            url: '/hrms/recruitment/transaction/jobPost-list',
                                            title: 'Job Post List',
                                            description: 'View All Job Postings'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'MRF Approval',
                                    icon: 'CheckSquare',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'MRF Requisition Form',
                                            icon: 'FileCheck',
                                            url: '/hrms/recruitment/mrf-approval/mrf-requisition-form',
                                            title: 'MRF Requisition Form',
                                            description: 'Approve MRF Requests'
                                        }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Feedback',
                                    icon: 'MessageSquare',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Candidate Feedback',
                                            icon: 'Star',
                                            url: '/hrms/recruitment/feedback/candidate-feedback',
                                            title: 'Candidate Feedback',
                                            description: 'Record Candidate Feedback'
                                        }
                                    ]
                                },
                                {
                                    id: 5,
                                    name: 'Reports',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Candidate Report',
                                            icon: 'Users',
                                            url: '/hrms/recruitment/reports/candidate-report',
                                            title: 'Candidate Report',
                                            description: 'Candidate Summary Report'
                                        },
                                        {
                                            id: 2,
                                            name: 'Interview Report',
                                            icon: 'ClipboardList',
                                            url: '/hrms/recruitment/reports/interview-report',
                                            title: 'Interview Report',
                                            description: 'Interview Summary Report'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Attendance Management',
                            icon: 'Clock',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        // {
                                        //     id: 1,
                                        //     name: 'Master Shift',
                                        //     icon: 'Clock',
                                        //     url: '/hrms/attendance-management/masters/master-shift',
                                        //     title: 'Master Shift',
                                        //     description: 'Manage Shift Definitions'
                                        // },
                                        // {
                                        //     id: 2,
                                        //     name: 'Employee Missing Logs',
                                        //     icon: 'AlertCircle',
                                        //     url: '/hrms/attendance-management/masters/employee-missing-logs',
                                        //     title: 'Employee Missing Logs',
                                        //     description: 'Track Missing Attendance Logs'
                                        // },
                                        {
                                            id: 3,
                                            name: 'Employee Shift Mapping',
                                            icon: 'UserCog',
                                            url: '/hrms/attendance-management/masters/employee-shift-mapping',
                                            title: 'Employee Shift Mapping',
                                            description: 'Map Employees to Shifts'
                                        },
                                        {
                                            id: 4,
                                            name: 'Master Holiday',
                                            icon: 'CalendarOff',
                                            url: '/hrms/attendance-management/masters/master-holiday',
                                            title: 'Master Holiday',
                                            description: 'Manage Holiday Calendar'
                                        },
                                        // {
                                        //     id: 5,
                                        //     name: 'Master Driver Shift',
                                        //     icon: 'Truck',
                                        //     url: '/hrms/attendance-management/masters/master-driver-shift',
                                        //     title: 'Master Driver Shift',
                                        //     description: 'Manage Driver Shifts'
                                        // },
                                        {
                                            id: 6,
                                            name: 'Shift Setting Master',
                                            icon: 'Settings',
                                            url: '/hrms/attendance-management/masters/shift-setting-master',
                                            title: 'Shift Setting Master',
                                            description: 'Configure Shift Settings'
                                        }
                                        // {
                                        //     id: 7,
                                        //     name: 'GPS Location Attendance',
                                        //     icon: 'MapPin',
                                        //     url: '/hrms/attendance-management/masters/gps-location-attendance',
                                        //     title: 'GPS Location Attendance',
                                        //     description: 'GPS-based Attendance'
                                        // }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Reports',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Employee In/Out Report',
                                            icon: 'ClipboardList',
                                            url: '/hrms/attendance-management/reports/employee-inout-report',
                                            title: 'Employee In/Out Report',
                                            description: 'In/Out Timing Report'
                                        },
                                        {
                                            id: 2,
                                            name: 'Late In Early Out Report',
                                            icon: 'Clock',
                                            url: '/hrms/attendance-management/reports/employee-lateInEarlyOut-report',
                                            title: 'Late In Early Out Report',
                                            description: 'Track Late/Early Attendance'
                                        },
                                        {
                                            id: 3,
                                            name: 'Employee Log Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/attendance-management/reports/employee-log-report',
                                            title: 'Employee Log Report',
                                            description: 'Detailed Log Report'
                                        },
                                        {
                                            id: 4,
                                            name: 'Employee Yearly Report',
                                            icon: 'Calendar',
                                            url: '/hrms/attendance-management/reports/employee-yearly-report',
                                            title: 'Employee Yearly Report',
                                            description: 'Annual Attendance Summary'
                                        },
                                        {
                                            id: 5,
                                            name: 'Employee Monthly Report',
                                            icon: 'CalendarDays',
                                            url: '/hrms/attendance-management/reports/employee-monthly-report',
                                            title: 'Employee Monthly Report',
                                            description: 'Monthly Attendance Report'
                                        },
                                        {
                                            id: 6,
                                            name: 'Month End Report',
                                            icon: 'CalendarCheck',
                                            url: '/hrms/attendance-management/reports/fo-monthend-report',
                                            title: 'Month End Report',
                                            description: 'Monthly Attendance Summary'
                                        },
                                        // {
                                        //     id: 6,
                                        //     name: 'GPS Location Report',
                                        //     icon: 'MapPin',
                                        //     url: '/hrms/attendance-management/reports/gps-location-report',
                                        //     title: 'GPS Location Report',
                                        //     description: 'GPS Attendance Report'
                                        // },
                                        {
                                            id: 7,
                                            name: 'Holiday Report',
                                            icon: 'Calendar',
                                            url: '/hrms/attendance-management/reports/holiday-report',
                                            title: 'Holiday Report',
                                            description: 'Holiday Report'
                                        },
                                        {
                                            id: 8,
                                            name: 'Employee Absent Report',
                                            icon: 'UserX',
                                            url: '/hrms/attendance-management/reports/employee-absent-report',
                                            title: 'Employee Absent Report',
                                            description: 'Employee Absent Detail Report'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 4,
                            name: 'Leave Management',
                            icon: 'Calendar',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Leave',
                                            icon: 'Calendar',
                                            url: '/hrms/leave-management/masters/master-leave',
                                            title: 'Master Leave',
                                            description: 'Manage Leave Types'
                                        },
                                        {
                                            id: 2,
                                            name: 'Leave Authorization',
                                            icon: 'Shield',
                                            url: '/hrms/leave-management/masters/leave-authorization',
                                            title: 'Leave Authorization',
                                            description: 'Configure Leave Approvers'
                                        }
                                        // {
                                        //     id: 3,
                                        //     name: 'Master Leave Year',
                                        //     icon: 'CalendarRange',
                                        //     url: '/hrms/leave-management/masters/master-leaveYear',
                                        //     title: 'Master Leave Year',
                                        //     description: 'Manage Leave Year'
                                        // }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Apply Leave',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Apply Leave',
                                            icon: 'FilePlus',
                                            url: '/hrms/leave-management/apply-leave',
                                            title: 'Apply Leave',
                                            description: 'Submit Leave Application'
                                        },
                                        {
                                            id: 2,
                                            name: 'Leave Approval',
                                            icon: 'CheckCircle',
                                            url: '/hrms/leave-management/leave-approval',
                                            title: 'Leave Approval',
                                            description: 'Approve or Reject Leave Requests'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Transaction',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Leave Transfer',
                                            icon: 'Plus',
                                            url: '/hrms/leave-management/transaction/leave-transfer',
                                            title: 'Leave Transfer',
                                            description: 'Transfer Leave'
                                        },
                                        // {
                                        //     id: 2,
                                        //     name: 'Comp Off Approval',
                                        //     icon: 'CheckSquare',
                                        //     url: '/hrms/leave-management/transaction/comp-off-approval',
                                        //     title: 'Comp Off Approval',
                                        //     description: 'Approve Compensatory Off'
                                        // },
                                        // {
                                        //     id: 3,
                                        //     name: 'Comp Off Request',
                                        //     icon: 'FileText',
                                        //     url: '/hrms/leave-management/transaction/comp-off-request',
                                        //     title: 'Comp Off Request',
                                        //     description: 'Request Compensatory Off'
                                        // },
                                        {
                                            id: 4,
                                            name: 'Leave Credit Details',
                                            icon: 'Info',
                                            url: '/hrms/leave-management/transaction/leave-credit-details',
                                            title: 'Leave  Details',
                                            description: 'View Leave Credit Details'
                                        },
                                        {
                                            id: 5,
                                            name: 'Leave Transaction',
                                            icon: 'List',
                                            url: '/hrms/leave-management/transaction/leave-credit-transaction',
                                            title: 'Leave Transaction',
                                            description: 'Leave Transaction'
                                        },
                                        {
                                            id: 6,
                                            name: 'Leave Opening Balance',
                                            icon: 'Database',
                                            url: '/hrms/leave-management/transaction/leave-opening-balance',
                                            title: 'Leave Opening Balance',
                                            description: 'Manage Leave Opening Balance'
                                        }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Report',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Leave Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/leave-management/reports/leave-report',
                                            title: 'Leave Report',
                                            description: 'Leave Summary Report'
                                        }
                                        // {
                                        //     id: 2,
                                        //     name: 'Overall Report',
                                        //     icon: 'BarChart3',
                                        //     url: '/hrms/leave-management/reports/overAll-report',
                                        //     title: 'Overall Report',
                                        //     description: 'Overall Leave Analysis'
                                        // },
                                        // {
                                        //     id: 3,
                                        //     name: 'Unauthorized Leave Report',
                                        //     icon: 'AlertTriangle',
                                        //     url: '/hrms/leave-management/reports/unauthorizedLeaveCount-report',
                                        //     title: 'Unauthorized Leave Report',
                                        //     description: 'Unauthorized Leave Count'
                                        // }
                                    ]
                                }
                            ]
                        }
                        // {
                        //     id: 5,
                        //     name: 'Exit Management',
                        //     icon: 'LogOut',
                        //     sub_menu: [
                        //         {
                        //             id: 1,
                        //             name: 'Exit',
                        //             icon: 'DoorOpen',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Checklist Master',
                        //                     icon: 'ListChecks',
                        //                     url: '/hrms/exit-management/exit/checklist-master',
                        //                     title: 'Checklist Master',
                        //                     description: 'Manage Exit Checklist'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Leaving Reason',
                        //                     icon: 'MessageSquare',
                        //                     url: '/hrms/exit-management/exit/leaving-reason',
                        //                     title: 'Leaving Reason',
                        //                     description: 'Manage Leaving Reasons'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 2,
                        //             name: 'Transaction',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Employee Resign',
                        //                     icon: 'UserMinus',
                        //                     url: '/hrms/exit-management/transaction/employee-resign',
                        //                     title: 'Employee Resign',
                        //                     description: 'Process Employee Resignation'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 3,
                        //             name: 'Reports',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Employee Exit Report',
                        //                     icon: 'FileSearch',
                        //                     url: '/hrms/exit-management/reports/employee-exit-report',
                        //                     title: 'Employee Exit Report',
                        //                     description: 'Exit Summary Report'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Relieving Letter',
                        //                     icon: 'FileCheck',
                        //                     url: '/hrms/exit-management/reports/relieving-letter',
                        //                     title: 'Relieving Letter',
                        //                     description: 'Generate Relieving Letter'
                        //                 }
                        //             ]
                        //         }
                        //     ]
                        // },
                        // {
                        //     id: 6,
                        //     name: 'Pre Config',
                        //     icon: 'Settings',
                        //     sub_menu: [
                        //         {
                        //             id: 1,
                        //             name: 'Configuration',
                        //             icon: 'Sliders',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'HR Authorisation',
                        //                     icon: 'Shield',
                        //                     url: '/hrms/pre-config/configuration/hr-authorisation',
                        //                     title: 'HR Authorisation',
                        //                     description: 'Configure HR Authorizations'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Staff User Creation',
                        //                     icon: 'UserPlus',
                        //                     url: '/hrms/pre-config/configuration/staff-user-creation',
                        //                     title: 'Staff User Creation',
                        //                     description: 'Create Staff Users'
                        //                 }
                        //             ]
                        //         }
                        //     ]
                        // }
                    ]
                }
                // {
                //     id: 5,
                //     name: 'IFrame',
                //     icon: 'Users',
                //     menu: [
                //         {
                //             id: 1,
                //             name: 'IFrame',
                //             icon: 'BookOpen',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'IFrame',
                //                     icon: 'Database',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'AI Assignment',
                //                             icon: 'BookOpen',
                //                             url: '/iframe/ai-assignment',
                //                             title: 'IFrame',
                //                             description: 'Manage AI Assignment Details'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Question Generator',
                //                             icon: 'BookOpen',
                //                             url: '/iframe/question-generator',
                //                             title: 'IFrame',
                //                             description: 'Manage Question Generator Details'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // }
            ]
        };
    } else {
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
    }

    return response;
}
