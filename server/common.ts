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
                    id: 1001,
                    name: 'Preadmission',
                    icon: 'UserRoundPlus',
                    menu: [
                        {
                            id: 1,
                            name: 'Preadmission',
                            icon: 'UserCog',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Pre-Registration Numbering',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/pre-registration-numbering',
                                            title: 'Pre-Registration Numbering',
                                            description: 'Pre-Registration Numbering'
                                        }
                                    ]
                                },

                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 2,
                                            name: 'Preadmission Form',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/application-form',
                                            title: 'Preadmission Form',
                                            description: 'Apply for Preadmission'
                                        },
                                        // {
                                        //     id: 20000000,
                                        //     name: 'Registration Form',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/transactions/registration-form',
                                        //     title: 'Registration Form',
                                        //     description: 'Apply for Registration'
                                        // },

                                        // {
                                        //     id: 3,
                                        //     name: 'Transfer Application Status',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/transactions/transfer-application-status',
                                        //     title: 'Transfer Application Status',
                                        //     description: 'Manage Transfer Application Status Details'
                                        // },
                                        // {
                                        //     id: 4,
                                        //     name: 'Transfer Admission Status',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/transactions/transfer-admission-status',
                                        //     title: 'Transfer Admission Status',
                                        //     description: 'Manage Transfer Admission Status Details'
                                        // },
                                        {
                                            id: 3,
                                            name: 'Transfer Application Status',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/status',
                                            title: 'Transfer Application Status',
                                            description: 'Manage Transfer Application Status Details'
                                        },
                                        {
                                            id: 5,
                                            name: 'Transfer to Admission',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/transactions/export-preadmission-to-admission',
                                            title: 'Transfer to Admission',
                                            description: 'Transfer confirmed preadmission applications to admission'
                                        },
                                        // {
                                        //     id: 6,
                                        //     name: 'Document View',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/transactions/document-view',
                                        //     title: 'Document View',
                                        //     description: ' Document View'
                                        // },
                                        {
                                            id: 7,
                                            name: 'Document View',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/document-view-report',
                                            title: 'Document View',
                                            description: 'Document View'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 3,
                            name: 'Reports',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 7,
                                            name: 'Student Count Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/student-count-report',
                                            title: 'Student Count Report',
                                            description: 'Student Count Report'
                                        },
                                        {
                                            id: 8,
                                            name: 'Registration Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/registration-report',
                                            title: 'Registration Report',
                                            description: 'Registration Report'
                                        },
                                        {
                                            id: 9,
                                            name: 'EMAIL SMS Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/email-sms',
                                            title: 'EMAIL SMS Report',
                                            description: 'EMAIL SMS Report'
                                        },
                                        {
                                            id: 10,
                                            name: 'PreAdmission Month End Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/preadmission-month-end-report',
                                            title: 'PreAdmission Month End Report',
                                            description: 'PreAdmission Month End Report'
                                        },
                                        {
                                            id: 11,
                                            name: 'Schedule Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/schedule-report',
                                            title: 'Schedule Report',
                                            description: 'Schedule Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                {
                    id: 900900,
                    name: 'Admission',
                    icon: 'UserRoundPlus',
                    menu: [
                        {
                            id: 2,
                            name: 'Admission',
                            icon: 'UserCog',
                            sub_menu: [
                                {
                                    id: 3,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 11,
                                            name: 'Master Configuration',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/master-configuration',
                                            title: 'Master Configuration',
                                            description: 'Master Configuration'
                                        },
                                        {
                                            id: 12,
                                            name: 'Registration Numbering',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/registration-numbering',
                                            title: 'Registration Numbering',
                                            description: 'Registration Numbering'
                                        }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Masters',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 13,
                                            name: 'Master Academic Year',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/configuration/academic-year',
                                            title: 'Master Academic Year ',
                                            description: 'Master Academic Year '
                                        },
                                        {
                                            id: 14,
                                            name: 'Master Class',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/class',
                                            title: 'Master Class',
                                            description: 'Manage Master Class Details'
                                        },
                                        {
                                            id: 15,
                                            name: 'Master Category',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/category',
                                            title: 'Master Category',
                                            description: 'Manage Master Category Details'
                                        },
                                        {
                                            id: 16,
                                            name: 'Master Section',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/section',
                                            title: 'Master Section',
                                            description: 'Manage Master Section Details'
                                        },
                                        {
                                            id: 17,
                                            name: 'Master Class Category',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/class-category',
                                            title: 'Master Class Category',
                                            description: 'Manage Master Class Category Details'
                                        },
                                        {
                                            id: 18,
                                            name: 'Master Religion',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/religion',
                                            title: 'Master Religion',
                                            description: 'Manage Master Religion Details'
                                        },
                                        {
                                            id: 19,
                                            name: 'Master Caste Category',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/caste-category',
                                            title: 'Master Caste Category',
                                            description: 'Manage Master Caste Category Details'
                                        },
                                        {
                                            id: 20,
                                            name: 'Master Caste',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/caste',
                                            title: 'Master Caste',
                                            description: 'Manage Master Caste Details'
                                        },
                                        {
                                            id: 21,
                                            name: 'Master Document',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/document',
                                            title: 'Master Document',
                                            description: 'Manage Master Document Details'
                                        },
                                        {
                                            id: 22,
                                            name: 'Master Reference',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/reference',
                                            title: 'Master Reference',
                                            description: 'Manage Master Reference Details'
                                        },
                                        {
                                            id: 23,
                                            name: 'Master Source',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/source',
                                            title: 'Master Source',
                                            description: 'Manage Master Source Details'
                                        },
                                        {
                                            id: 24,
                                            name: 'Master Religion Caste Category',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/religion-caste-category',
                                            title: 'Master Religion Caste Category',
                                            description: 'Manage Master Religion Caste Category Details'
                                        },
                                        {
                                            id: 25,
                                            name: 'Master Class Teacher',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/class-teacher',
                                            title: 'Master Class Teacher',
                                            description: 'Manage Master Class Teacher Details'
                                        },
                                        {
                                            id: 26,
                                            name: 'Master Class Held',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/class-held',
                                            title: 'Master Class Held',
                                            description: 'Manage Master Class Held '
                                        },
                                        {
                                            id: 27,
                                            name: 'Active Deactive Students',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/active-deactive-students',
                                            title: 'Active Deactive Students',
                                            description: 'Active Deactive Students'
                                        }
                                    ]
                                },

                                {
                                    id: 6,
                                    name: 'Section Allotment',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 29,
                                            name: 'New Section',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/new-section',
                                            title: 'New Section ',
                                            description: 'New Section'
                                        },
                                        {
                                            id: 30,
                                            name: 'Change Section',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/change-section',
                                            title: 'Change Section',
                                            description: 'Change Section'
                                        },
                                        {
                                            id: 31,
                                            name: 'Delete Student Section',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/delete-student-section',
                                            title: 'Delete Student Section',
                                            description: 'Delete Student Section'
                                        },
                                        {
                                            id: 32,
                                            name: 'Promotion Section',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/promotion-section',
                                            title: 'Promotion Section',
                                            description: 'Promotion Section'
                                        },
                                        {
                                            id: 33,
                                            name: 'Year Loss Section',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/year-loss-section',
                                            title: 'Year Loss Section',
                                            description: 'Year Loss Section'
                                        },
                                        {
                                            id: 34,
                                            name: 'Update Roll Number',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/update-roll-number',
                                            title: 'Update Roll Number',
                                            description: 'Update Roll Number'
                                        },
                                        {
                                            id: 35,
                                            name: 'Change Class',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/section/change-class',
                                            title: 'Change Class',
                                            description: 'Change Class'
                                        }
                                    ]
                                },
                                {
                                    id: 7,
                                    name: 'Attendance Entry',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 36,
                                            name: 'Entry Type',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/attendance-entry/attendance_entry_type',
                                            title: 'Attendance Entry Type',
                                            description: 'Manage attendance entry types'
                                        },
                                        {
                                            id: 37,
                                            name: 'Login Privileges',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/attendance-entry/login-privileges',
                                            title: 'Login Privileges',
                                            description: 'Manage attendance login privileges'
                                        },
                                        {
                                            id: 38,
                                            name: 'Student Attendance',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/attendance-entry/student-attendance',
                                            title: 'Student Attendance',
                                            description: 'Enter student attendance'
                                        }
                                    ]
                                },
                                {
                                    id: 8,
                                    name: 'Student TC',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 39,
                                            name: 'Apply TC',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/student-transfer-certificate/apply',
                                            title: 'Apply TC',
                                            description: 'Apply for Student Transfer Certificate'
                                        },
                                        {
                                            id: 40,
                                            name: 'Cancel TC',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/student-transfer-certificate/cancel',
                                            title: 'Cancel TC',
                                            description: 'Cancel Student Transfer Certificate'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: 'Form and Reports',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 5,
                                    name: 'Admission Form',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 28,
                                            name: 'Admission Form',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/admission-form',
                                            title: 'Admission Form',
                                            description: 'Apply For Admission'
                                        }
                                    ]
                                },
                                {
                                    id: 9,
                                    name: 'Reports',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 41,
                                            name: 'Class Teacher Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/class-teacher-report',
                                            title: 'Class Teacher Report',
                                            description: 'Class Teacher Report'
                                        },
                                        {
                                            id: 42,
                                            name: 'Student Yearly Attendance Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/students-yearly-attendence-report',
                                            title: 'Student Yearly Attendance Report',
                                            description: 'Student Yearly Attendance Report'
                                        },
                                        {
                                            id: 43,
                                            name: 'Student TC Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/student-tc-report',
                                            title: 'Student TC Report',
                                            description: 'Student TC Report'
                                        },
                                        {
                                            id: 44,
                                            name: 'class-wise student details',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/class-wise-student-details',
                                            title: 'class-wise student details',
                                            description: 'class-wise student details'
                                        },

                                        {
                                            id: 45,
                                            name: 'Total Strength Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/total-strength',
                                            title: 'Total Strength Report',
                                            description: 'Total Strength Report'
                                        },
                                        {
                                            id: 46,
                                            name: 'Admission Register Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/admission-register',
                                            title: 'Admission Register Report',
                                            description: 'Admission Register Report '
                                        },
                                        {
                                            id: 47,
                                            name: 'Attendance Absentees Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/attendance-absent-sms',
                                            title: 'Attendance Absentees Report',
                                            description: 'Attendance Absentees Report'
                                        },
                                        {
                                            id: 48,
                                            name: 'Student Search',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/student-search',
                                            title: 'Student Search',
                                            description: 'Student Search'
                                        },
                                        {
                                            id: 49,
                                            name: 'Month End Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/month-end-report',
                                            title: 'Month End Report',
                                            description: 'Month End Report'
                                        },

                                        {
                                            id: 50,
                                            name: 'Study Certificate Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/study-certificate-report',
                                            title: 'Study Certificate Report',
                                            description: 'Study Certificate Report'
                                        },
                                        {
                                            id: 51,
                                            name: 'Date Of Birth Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/date-of-birth-report',
                                            title: 'Date Of Birth Report',
                                            description: 'Date Of Birth Report'
                                        },
                                        // {
                                        //     id: 12,
                                        //     name: 'Overall Daily Attendance Report',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/overall-daily-attendance-report',
                                        //     title: 'Overall Daily Attendance Report',
                                        //     description: 'Overall Daily Attendance Report'
                                        // },
                                        {
                                            id: 52,
                                            name: 'Student Attendance Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/student-attendance-report',
                                            title: 'Student Attendance Report',
                                            description: 'Student Attendance Report'
                                        }
                                        //,
                                        // {
                                        //     id: 53,
                                        //     name: 'Student Birthday Report',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/student-birthday-report',
                                        //     title: 'Student Birthday Report',
                                        //     description: 'Student Birthday Report'
                                        // },
                                        // {
                                        //     id: 54,
                                        //     name: '100% Attendance Report',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/100attendance-report',
                                        //     title: '100% Attendance Report',
                                        //     description: '100% Attendance Report'
                                        // },
                                        // {
                                        //     id: 55,
                                        //     name: 'St.James TC Custom Report',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/stjames-tc-customreport',
                                        //     title: 'St.James TC Custom Report',
                                        //     description: 'St.James TC Custom Report'
                                        // },
                                        // {
                                        //     id: 56,
                                        //     name: 'Study Certificate GMVPS Report',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/study-certificate-gmvps-report',
                                        //     title: 'Study Certificate GMVPS Report',
                                        //     description: 'Study Certificate GMVPS Report'
                                        // }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                {
                    id: 9000,
                    name: 'Admission Client',
                    icon: 'UserRoundPlus',
                    menu: [
                        {
                            id: 5,
                            name: 'Client Specific Reports',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 11,
                                    name: 'Calcutta Boys School',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 60,
                                            name: 'CBS Bonafied Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/CBS_Bonafied_Cert',
                                            title: 'CBS Bonafied Certificate',
                                            description: 'CBS Bonafied Certificate'
                                        },
                                        {
                                            id: 61,
                                            name: 'CBS Bonafied Certificate CEA',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/CBS_CEA_Cert',
                                            title: 'CBS Bonafied Certificate CEA',
                                            description: 'CBS Bonafied Certificate CEA'
                                        },
                                        {
                                            id: 62,
                                            name: 'Download Student Photos',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/DownloadStudentPhotos',
                                            title: 'Download Student Photos',
                                            description: 'Download Student Photos'
                                        },
                                        {
                                            id: 64,
                                            name: 'CBS No Objection Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/CBS_NoObjection_Cert',
                                            title: 'CBS No Objection Certificate',
                                            description: 'CBS No Objection Certificate'
                                        },
                                        {
                                            id: 65,
                                            name: 'CBS Student TC',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/cbs-Student-Tc',
                                            title: 'CBS Student TC',
                                            description: 'CBS Student TC'
                                        },
                                        {
                                            id: 66,
                                            name: 'CBS Study Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/cbs-Study-Certificate',
                                            title: 'CBS Study Certificate',
                                            description: 'CBS Study Certificate'
                                        }
                                    ]
                                },
                                {
                                    id: 9,
                                    name: 'New Shared Host',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 12,
                                            name: 'Overall Daily Attendance Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/overall-daily-attendance-report',
                                            title: 'Overall Daily Attendance Report',
                                            description: 'Overall Daily Attendance Report'
                                        },

                                        {
                                            id: 53,
                                            name: 'Student Birthday Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/student-birthday-report',
                                            title: 'Student Birthday Report',
                                            description: 'Student Birthday Report'
                                        },
                                        {
                                            id: 54,
                                            name: '100% Attendance Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/100attendance-report',
                                            title: '100% Attendance Report',
                                            description: '100% Attendance Report'
                                        },

                                        {
                                            id: 56,
                                            name: 'Study Certificate GMVPS Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/study-certificate-gmvps-report',
                                            title: 'Study Certificate GMVPS Report',
                                            description: 'Study Certificate GMVPS Report'
                                        },

                                        {
                                            id: 67,
                                            name: 'GM Custom Tc',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/custom-tc',
                                            title: 'GM Custom Tc',
                                            description: 'GM Custom Tc'
                                        },

                                        {
                                            id: 68,
                                            name: 'Little Anns Certificate For Appreciation',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/little-anns-certificate-for-appreciation',
                                            title: 'Little Anns Certificate  For Appreciation',
                                            description: 'Little Anns Certificate  For Appreciation'
                                        },
                                        {
                                            id: 69,
                                            name: 'Little Anns Certificate Of Promotion',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/little-anns-certificate-of-promotion',
                                            title: 'Little Anns Certificate Of Promotion',
                                            description: 'Little Anns Certificate Of Promotion'
                                        },
                                        {
                                            id: 70,
                                            name: 'St.Anns Certificate For Appreciation',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/st-anns-certificate-for-appreciation',
                                            title: 'St.Anns Certificate For Appreciation',
                                            description: 'St.Anns Certificate For Appreciation'
                                        },
                                        {
                                            id: 71,
                                            name: 'St.Anns Certificate For Merit',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/st-anns-certificate-for-merit',
                                            title: 'St.Anns Certificate For Merit',
                                            description: 'St.Anns Certificate For Merit'
                                        },
                                        {
                                            id: 72,
                                            name: 'Nagarjuna Tc custom Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/tc-custom-report-nagarjuna',
                                            title: 'Nagarjuna Tc custom Report',
                                            description: 'Nagarjuna Tc custom Report'
                                        },
                                        {
                                            id: 73,
                                            name: 'Tun Bridge Study Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/Tun-Bridge-Study-Certificate',
                                            title: 'Tun Bridge Study Certificate',
                                            description: 'Tun Bridge Study Certificate'
                                        },
                                        {
                                            id: 74,
                                            name: 'TunBridge',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/newsharedhost/reports/TunBridge',
                                            title: 'TunBridge',
                                            description: 'TunBridge'
                                        }
                                    ]
                                },
                                {
                                    id: 10,
                                    name: 'stjames',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 55,
                                            name: 'St.James TC Custom Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/stjames-tc-customreport',
                                            title: 'St.James TC Custom Report',
                                            description: 'St.James TC Custom Report'
                                        },

                                        {
                                            id: 57,
                                            name: 'St.James Bonafied Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/stjamesbonafiedreport',
                                            title: 'St.James Bonafied Report',
                                            description: 'St.James Bonafied Report'
                                        },
                                        {
                                            id: 58,
                                            name: 'St.James Migration Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/stjamesmigrationcertificate',
                                            title: 'St.James Migration Report',
                                            description: 'St.James Migration Report'
                                        },
                                        {
                                            id: 59,
                                            name: 'St.James Character Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/stjcharactercertificate',
                                            title: 'St.James Character Report',
                                            description: 'St.James Character Report'
                                        }
                                    ]
                                },
                                {
                                    id: 13,
                                    name: 'NDA',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 61,
                                            name: 'NDA Transfer Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/reports/nda-transfer-certificate',
                                            title: 'NDA Transfer Certificate',
                                            description: 'NDA Transfer Certificate'
                                        },
                                        {
                                            id: 62,
                                            name: 'NDA Student TC',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/transactions/nda-student-tc',
                                            title: 'NDA Student TC',
                                            description: 'NDA Student TC'
                                        },
                                        {
                                            id: 63,
                                            name: 'NDA Student Profile Update',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/reports/nda-student-profile-report',
                                            title: 'NDA Student Profile Update',
                                            description: 'NDA Student Profile Update'
                                        },
                                        {
                                            id: 64,
                                            name: 'Notredame Custom TC Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/reports/notredame-custom-tc-report',
                                            title: 'Notredame Custom TC Report',
                                            description: 'Notredame Custom TC Report'
                                        },
                                        {
                                            id: 66,
                                            name: 'NDA Student Id Card Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/reports/student-id-card-report-nda',
                                            title: 'NDA Student Id Card Report',
                                            description: 'NDA Student Id Card Report'
                                        },
                                        {
                                            id: 65,
                                            name: 'NDA Student Photo Approval',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/masters/nda-student-photo-approval',
                                            title: 'NDA Student Photo Approval',
                                            description: 'NDA Student Photo Approval'
                                        },
                                        {
                                            id: 67,
                                            name: 'NDA Student Profile Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/nda/reports/nda-student-profile-report',
                                            title: 'NDA Student Profile Report',
                                            description: 'NDA Student Profile Report'
                                        }
                                    ]
                                },
                                {
                                    id: 14,
                                    name: 'Baldwin',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 61,
                                            name: 'BBHS Study Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/bbhs-study-certificate',
                                            title: 'BBHS Study Certificate',
                                            description: 'BBHS Study Certificate'
                                        },
                                        {
                                            id: 62,
                                            name: 'BBHS Student Custom TC',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/bbhs-student-tc-report-custom',
                                            title: 'BBHS Student Custom TC',
                                            description: 'BBHS Student Custom TC'
                                        },
                                        {
                                            id: 63,
                                            name: 'BCEH Study Certificate',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/BCEH-Study-Certificate',
                                            title: 'BCEH Study Certificate',
                                            description: 'BCEH Study Certificate'
                                        },

                                        {
                                            id: 65,
                                            name: 'Student tc custom report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/student-tc-report-custom',
                                            title: 'Student tc custom report',
                                            description: 'Student tc custom report'
                                        }
                                    ]
                                },
                                {
                                    id: 15,
                                    name: 'Sophia',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 590,
                                            name: 'Smart Card Details',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/Sophia/Smartcarddetails',
                                            title: 'Smartcarddetails',
                                            description: 'Smartcarddetails'
                                        },
                                        {
                                            id: 591,
                                            name: 'Import',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/sophia/masters/import',
                                            title: 'Import',
                                            description: 'Import'
                                        },
                                        {
                                            id: 592,
                                            name: 'Master Activities',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/masters/Sophia/MasterActivities',
                                            title: 'Master Activities',
                                            description: 'Master Activities'
                                        },

                                        {
                                            id: 594,
                                            name: 'CategoryWise Attendance',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/Sophia/CategoryWiseAttendance',
                                            title: 'CategoryWise Attendance',
                                            description: 'CategoryWise Attendance'
                                        },
                                        {
                                            id: 595,
                                            name: 'ClassWise Daily Attendance',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/Sophia/ClassWiseDailyAttendance',
                                            title: 'ClassWise Daily Attendance',
                                            description: 'ClassWise Daily Attendance'
                                        }
                                        // {
                                        //     id: 596,
                                        //     name: 'Student Search',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/Sophia/StudentSearch',
                                        //     title: 'Student Search',
                                        //     description: 'Student Search'
                                        // },
                                        // {
                                        //     id: 597,
                                        //     name: 'Students Search Report',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/Sophia/StudentsSearchReport',
                                        //     title: 'Students Search Report',
                                        //     description: 'Students Search Report'
                                        // },
                                        // {
                                        //     id: 598,
                                        //     name: 'Date Of Birth Certificate',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/reports/Sophia/DateOfBirthCertificate',
                                        //     title: 'Date Of Birth Certificate',
                                        //     description: 'Date Of Birth Certificate'
                                        // },
                                        // {
                                        //     id: 599,
                                        //     name: 'Sophia study certificate',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/sophia/reports/SophiaStudyCertificate',
                                        //     title: 'Sophia study certificate',
                                        //     description: 'Sophia study certificate'
                                        // },
                                        // {
                                        //     id: 600,
                                        //     name: 'SophiaRegistrationXI',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/SophiaRegistrationXI',
                                        //     title: 'SophiaRegistrationXI',
                                        //     description: 'SophiaRegistrationXI'
                                        // },
                                        // {
                                        //     id: 600,
                                        //     name: 'SophiaRegistration',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/SophiaRegistration',
                                        //     title: 'SophiaRegistration',
                                        //     description: 'SophiaRegistration'
                                        // },
                                        // {
                                        //     id: 601,
                                        //     name: 'OverallDailyAttendanceReport',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/OverallDailyAttendanceReport',
                                        //     title: 'OverallDailyAttendanceReport',
                                        //     description: 'OverallDailyAttendanceReport'
                                        // },
                                        // {
                                        //     id: 602,
                                        //     name: 'Studenttcapply',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/Studenttcapply',
                                        //     title: 'Studenttcapply',
                                        //     description: 'Studenttcapply'
                                        // },
                                        // {
                                        //     id: 603,
                                        //     name: 'StudentTcApproval',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/StudentTcApproval',
                                        //     title: 'StudentTcApproval',
                                        //     description: 'StudentTcApproval'
                                        // },
                                        // {
                                        //     id: 604,
                                        //     name: 'SophiaMultiTransferCertificate',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/SophiaMultiTransferCertificate',
                                        //     title: 'SophiaMultiTransferCertificate',
                                        //     description: 'SophiaMultiTransferCertificate'
                                        // },
                                        // {
                                        //     id: 605,
                                        //     name: 'Attendanceentry',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/Attendanceentry',
                                        //     title: 'Attendanceentry',
                                        //     description: 'Attendanceentry'
                                        // },
                                        // {
                                        //     id: 606,
                                        //     name: 'SophiaStudentParticulars',
                                        //     icon: 'Settings',
                                        //     url: '/admission/preadmission/Sophia/reports/SophiaStudentParticulars',
                                        //     title: 'SophiaStudentParticulars',
                                        //     description: 'SophiaStudentParticulars'
                                        // }
                                    ]
                                },
                                {
                                    id: 16,
                                    name: 'St. Thomas Church School',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 61,
                                            name: 'St. Thomas Admission Form',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/stthomas/admission-form',
                                            title: 'St. Thomas Admission Form',
                                            description: 'St. Thomas Admission Form'
                                        },
                                        {
                                            id: 62,
                                            name: 'Total Strength',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/reports/STCS/total-strength',
                                            title: 'Total Strength',
                                            description: 'Total Strength'
                                        },
                                        {
                                            id: 63,
                                            name: 'St. Thomas TC Custom Report',
                                            icon: 'Settings',
                                            url: '/admission/preadmission/stthomas/reports/stthomas-tc-custom-report',
                                            title: 'St. Thomas TC Custom Report',
                                            description: 'St. Thomas TC Custom Report'
                                        }
                                    ]
                                },

                                {
                                    id: 17,
                                    name: 'Samartha',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 71,
                                            name: 'SamarthaBonafideCertificate',
                                            icon: 'Settings',
                                            url: '/admission/samartha/reports/SamarthaBonafideCertificate',
                                            title: 'Samartha Bonafide Certificate',
                                            description: 'Samartha Bonafide Certificate'
                                        },
                                        {
                                            id: 72,
                                            name: 'SamarthaTC',
                                            icon: 'Settings',
                                            url: '/admission/samartha/reports/SamarthaTC',
                                            title: 'SamarthaTC',
                                            description: 'SamarthaTC'
                                        },
                                        {
                                            id: 73,
                                            name: 'OverAllViewReportt',
                                            icon: 'Settings',
                                            url: '/admission/samartha/reports/Over-All-View-Reportt',
                                            title: 'OverAllViewReportt',
                                            description: 'OverAllViewReportt'
                                        }
                                    ]
                                },

                                {
                                    id: 18,
                                    name: 'Danvantari Phisiotheraphy',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 71,
                                            name: 'DCPS Bonified Certificate',
                                            icon: 'Settings',
                                            url: '/admission/Danvantari/reports/DCPS_BonifiedCertificate',
                                            title: 'DCPS Bonified Certificate',
                                            description: 'Bonified Certificate'
                                        },
                                        {
                                            id: 72,
                                            name: 'DCPS Transfer Certificate',
                                            icon: 'Settings',
                                            url: '/admission/Danvantari/reports/DCPS_TransferCertificate',
                                            title: 'DCPS Transfer Certificate',
                                            description: 'DCPS Transfer Certificate'
                                        }
                                    ]
                                },
                                {
                                    id: 19,
                                    name: 'SRKVS',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 74,
                                            name: 'SRKVS Student Address Book',
                                            icon: 'Settings',
                                            url: '/admission/srkvs/reports/SRKVSStudentAddressBook',
                                            title: 'SRKVSStudentAddressBook',
                                            description: 'SRKVSStudentAddressBook'
                                        }
                                    ]
                                },
                                {
                                    id: 20,
                                    name: 'St. Peters School Durgapur',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 74,
                                            name: 'Employee IDcard Report STpeter',
                                            icon: 'Settings',
                                            url: '/admission/stpeter/reports/EmployeeIDcardReportSTpeter',
                                            title: 'EmployeeIDcardReportSTpeter',
                                            description: 'EmployeeIDcardReportSTpeter'
                                        },

                                        {
                                            id: 75,
                                            name: 'Student IDcard Report STPeter',
                                            icon: 'Settings',
                                            url: '/admission/stpeter/reports/StudentIDcardReportSTPeter',
                                            title: 'StudentIDcardReportSTPeter',
                                            description: 'StudentIDcardReportSTPeter'
                                        }
                                    ]
                                },
                                {
                                    id: 21,
                                    name: 'GNANA DEEPA ACADEMY RESIDENTIAL SCHOOL',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 74,
                                            name: 'GDARSStudyCertificate',
                                            icon: 'Settings',
                                            url: '/admission/gnanadeepa/reports/GDARSStudyCertificate',
                                            title: 'GDARSStudyCertificate',
                                            description: 'GDARSStudyCertificate'
                                        }
                                    ]
                                },
                                {
                                    id: 22,
                                    name: 'SMS degree college',
                                    icon: 'Settings',
                                    pages: [
                                        //Need to create UI
                                        // {
                                        //     id: 74,
                                        //     name: 'SMSCollegeStudentTc',
                                        //     icon: 'Settings',
                                        //     url: '/admission/sms/transaction/SMSCollegeStudentTc',
                                        //     title: 'SMSCollegeStudentTc',
                                        //     description: 'SMSCollegeStudentTc'
                                        // },

                                        {
                                            id: 75,
                                            name: 'SMSCConductCertificate',
                                            icon: 'Settings',
                                            url: '/admission/sms/reports/SMSCConductCertificate',
                                            title: 'SMSCConductCertificate',
                                            description: 'SMSCConductCertificate'
                                        }
                                    ]
                                },
                                {
                                    id: 23,
                                    name: 'GM Vidya Nikethan School',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 75,
                                            name: 'Smartcarddetails',
                                            icon: 'Settings',
                                            url: '/admission/GMVPS/reports/Smartcarddetails',
                                            title: 'Smartcarddetails',
                                            description: 'Smartcarddetails'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 20002,
                    name: 'Fees Management',
                    icon: 'BadgeIndianRupee',
                    menu: [
                        {
                            id: 2,
                            name: 'Fees',
                            icon: 'BadgeIndianRupee',
                            sub_menu: [
                                {
                                    id: 4,
                                    name: 'Configuration',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        {
                                            id: 21,
                                            name: 'Fee configuration',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/configuration/masterfeeconfig',
                                            title: 'Fee configuration',
                                            description: 'Fee configuration'
                                        }
                                    ]
                                },
                                {
                                    id: 5,
                                    name: 'Masters',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        {
                                            id: 22,
                                            name: 'Master Fee Head',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feehead',
                                            title: 'Master Fee Head',
                                            description: 'Manage Master Fee Head Details'
                                        },
                                        {
                                            id: 23,
                                            name: 'Master Mode Of Payment',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/modeofpayment',
                                            title: 'Master Mode Of Payment',
                                            description: 'Manage Master Mode Of Payment Details'
                                        },
                                        {
                                            id: 24,
                                            name: 'Master Payment Gateway Details',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/paymentGatewayDetails',
                                            title: 'Master Payment Gateway Details',
                                            description: 'Manage Master Payment Gateway Details'
                                        },
                                        {
                                            id: 25,
                                            name: 'Master Fine Slab',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/masterfineslab',
                                            title: 'Master Fine Slab',
                                            description: 'Manage Master Fine Slab Details'
                                        },
                                        {
                                            id: 26,
                                            // name: 'Master Fee Concession',
                                            name: 'Concession Category',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/masterfeeconcession',
                                            title: 'Concession Category',
                                            description: 'Manage Concession Category Details'
                                        },

                                        {
                                            id: 600,
                                            name: 'Master Concession Category Details',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/masterfeeconcessiondetails',
                                            title: 'Master Concession Category Details',
                                            description: 'Manage Master Concession Category Details'
                                        },
                                        {
                                            id: 650,
                                            name: 'Master Concession Category Group Head Mapping',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/concessioncategorygroupheadmapping',
                                            title: 'Master Concession Category Group Head Mapping',
                                            description: 'Manage Master Concession Category Group Head Mapping'
                                        },
                                        {
                                            id: 27,
                                            name: 'Master Fee Terms',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feemasterterms',
                                            title: 'Master Fee Terms',
                                            description: 'Manage Master Fee Terms Details'
                                        },
                                        {
                                            id: 28,
                                            name: 'Master Term Fee Head',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/mastertermfeehead',
                                            title: 'Master Term Fee Head',
                                            description: 'Manage Master Term Fee Head Details'
                                        },
                                        {
                                            id: 601,
                                            name: 'Master Term Fee Head Due Date',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/mastertermfeeheadduedate',
                                            title: 'Master Term Fee Head Due Date',
                                            description: 'Manage Master Term Fee Head Due Date'
                                        },
                                        {
                                            id: 2001,
                                            name: 'Master Terms Period',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/masterTermsPeriod',
                                            title: 'Master Terms Period',
                                            description: 'Manage Master Terms Period'
                                        },
                                        {
                                            id: 29,
                                            name: 'Master Class Category',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/classcategory',
                                            title: ' Master Class Category',
                                            description: 'Manage Master Class Category'
                                        },
                                        {
                                            id: 30,
                                            name: 'Master Yearly Class Category',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/category',
                                            title: 'Master Yearly Class Category',
                                            description: 'Manage Master Yearly Class Category'
                                        },
                                        {
                                            id: 31,
                                            name: 'Master Fee Installment',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feesinstallment',
                                            title: 'Master Fee Installment',
                                            description: 'Manage Master Fee Installment'
                                        },
                                        {
                                            id: 32,
                                            name: 'Master Installment due date',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feesinstallmentduedate',
                                            title: 'Master Installment due date',
                                            description: 'Manage Master Installment due date'
                                        },
                                        {
                                            id: 33,
                                            name: 'Master Fee Group Grouping',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/groupsgrouping',
                                            title: 'Master Fee Group Grouping',
                                            description: 'Manage Master Fee Group Grouping'
                                        },
                                        {
                                            id: 34,
                                            name: 'Master Fee Groups',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/mastergroup',
                                            title: 'Master Fee Groups',
                                            description: 'Manage Master Fee Groups'
                                        },
                                        {
                                            id: 35,
                                            name: 'Master Fee Yearly Groups',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/yearlygroup',
                                            title: 'Master Fee Yearly Groups',
                                            description: 'Manage Master Fee Yearly Groups'
                                        },

                                        {
                                            id: 36,
                                            name: 'Master Fee Yearly Groups Mapping',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/yearlygroupmapping',
                                            title: 'Master Fee Yearly Groups Mapping',
                                            description: 'Manage Master Fee Yearly Groups Mapping'
                                        },
                                        {
                                            id: 37,
                                            name: 'Master Fee Group wise Auto Receipt',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/groupwiseautoreceipt',
                                            title: 'Master Fee Group wise Auto Receipt',
                                            description: 'Manage Master Fee Group wise Auto Receipt'
                                        },
                                        {
                                            id: 38,
                                            name: 'Master Fee Yearly Rebate Settings',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/yearlyrebatesetting',
                                            title: 'Master Yearly Rebate Settings',
                                            description: 'Manage Master Yeary Rebate Settings'
                                        },
                                        {
                                            id: 39,
                                            name: 'Master Fee Privilege',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feeprevilege',
                                            title: 'Master Fee Privilege',
                                            description: 'Manage Master Fee Privilege Details'
                                        },
                                        {
                                            id: 40,
                                            name: 'Master Online Payment Head Group',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/onlinepaymentheadgroupmapping',
                                            title: 'Master Online Payment Head Group',
                                            description: 'Manage Master Online Payment Head Group Mapping Details'
                                        },
                                        {
                                            id: 900,
                                            name: 'Master Student Fee Group Mapping',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/studentfeegroupmapping',
                                            title: 'Master Student Fee Group Mapping',
                                            description: 'Manage Master Student Fee Group Mapping Details'
                                        },
                                        {
                                            id: 501,
                                            name: 'Master Fee Other Student',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feeotherstudent',
                                            title: 'Master Fee Other Student',
                                            description: 'Manage Master Fee Other Student Details'
                                        },
                                        {
                                            id: 502,
                                            name: 'Master Special Fee Head',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/specialFeeHead',
                                            title: 'Master Special Fee Head',
                                            description: 'Manage Master Special Fee Head Details'
                                        },
                                        {
                                            id: 506,
                                            name: 'Master Fee Tally Master',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/feecompanygroupmapping',
                                            title: 'Master Fee Tally Master',
                                            description: 'Manage Fee Tally  Details'
                                        }
                                    ]
                                },
                                {
                                    id: 6,
                                    name: 'Transactions',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        {
                                            id: 40,
                                            name: 'Fee Amount Entry',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feeamountentry',
                                            title: 'Fee Amount Entry',
                                            description: 'Manage Fee Amount Entry Details'
                                        },
                                        {
                                            id: 41,
                                            name: 'Third Party Transaction',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/thirdPartyTransaction',
                                            title: 'Third Party Transaction',
                                            description: 'Manage Third Party Transaction'
                                        },
                                        {
                                            id: 42,
                                            name: 'Fee Opening Balance',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feeopeningbalance',
                                            title: 'Fee Opening Balance',
                                            description: 'Manage Fee Opening Balance'
                                        },
                                        {
                                            id: 43,
                                            name: 'Fee Waivedoff',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/waivedoff',
                                            title: 'Fee Waivedoff',
                                            description: 'Manage Fee Waivedoff'
                                        },
                                        {
                                            id: 500,
                                            name: 'Fee Preadmission Transaction',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feepreadmissiontrasaction',
                                            title: 'Fee Preadmission Transaction',
                                            description: 'Manage Fee Preadmission Transaction'
                                        },
                                        {
                                            id: 508,
                                            name: 'Fee Refundable',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feerefundable',
                                            title: 'Fee Refundable',
                                            description: 'Manage Fee Refundable'
                                        },
                                        // {
                                        //     id: 511,
                                        //     name: 'Fee OnlinePayment',
                                        //     icon: 'BadgeIndianRupee',
                                        //     url: '/fees/transactions/feeOnlinePayment',
                                        //     title: 'Fee OnlinePayment',
                                        //     description: 'Manage Fee OnlinePayment'
                                        // }
                                        // ,
                                        {
                                            id: 505,
                                            name: 'Fee Transaction',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feetransaction',
                                            title: 'Fee Transaction',
                                            description: 'Fee Transaction'
                                        },
                                        {
                                            id: 506,
                                            name: 'Fee Adjustment',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feeadjustment',
                                            title: 'Fee Adjustment',
                                            description: 'Manage Fee Adjustment'
                                        },
                                        {
                                            id: 507,
                                            name: 'Fee Master Concession',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feeconcession',
                                            title: 'Fee Master Concession',
                                            description: 'Manage Fee Master Concession'
                                        },
                                        {
                                            id: 515,
                                            name: 'Fee Receipt Import Delete',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feesreceiptimportdelete',
                                            title: 'Fee Receipt Import Delete',
                                            description: 'Manage Fee Receipt Import Delete'
                                        },
                                        {
                                            id: 516,
                                            name: 'Fee Receipt Import',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feesreceiptimportstthomas',
                                            title: 'Fee Receipt Import',
                                            description: 'Manage Fee Receipt Import'
                                        },
                                        {
                                            id: 520,
                                            name: 'Fee Receipt Import Common',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feereceiptimportCommon',
                                            title: 'Fee Receipt Import Common',
                                            description: 'Manage Fee Receipt Import Common'
                                        },
                                        {
                                            id: 517,
                                            name: 'Bank Payment Import',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/bankpaymentimportstthomas',
                                            title: 'Bank Payment Import',
                                            description: 'Manage Bank Payment Import'
                                        },
                                        {
                                            id: 518,
                                            name: 'Fee Staff Other Transaction',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/stafftransaction',
                                            title: 'Fee Staff Other Transaction',
                                            description: 'Fee Staff Other Transaction'
                                        }
                                        // {
                                        //     id: 519,
                                        //     name: 'Fee Transaction',
                                        //     icon: 'BadgeIndianRupee',
                                        //     url: '/fees/transactions/feetransactionstthomas',
                                        //     title: 'Fee Transaction',
                                        //     description: 'Fee Transaction'
                                        // }
                                    ]
                                },
                                {
                                    id: 2001,
                                    name: 'Reports',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        {
                                            id: 10011,
                                            name: 'Fee Defaulter report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feedefaulterreport',
                                            title: 'Fee Defaulter Report',
                                            description: 'Fee Defaulter Report'
                                        },
                                        {
                                            id: 10012,
                                            name: 'Daily Fee Collection Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/dailyfeecollectionreport',
                                            title: 'Daily Fee Collection Report',
                                            description: 'Manage Daily Fee Collection Report Details'
                                        },
                                        {
                                            id: 10013,
                                            name: 'Yearly Fee Collection Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/yearlyfeecollectionreport',
                                            title: 'Yearly Fee Collection Report',
                                            description: 'Manage Yearly Fee Collection Report Details'
                                        },
                                        {
                                            id: 10014,
                                            name: 'Audit Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/auditreport',
                                            title: 'Audit Report',
                                            description: 'Manage Audit Report Details'
                                        },
                                        {
                                            id: 10015,
                                            name: 'Fee Concession Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feeconcessionreport',
                                            title: 'Fee Concession Report',
                                            description: 'Manage Fee Concession Report Details'
                                        },
                                        {
                                            id: 10016,
                                            name: 'Fee Head Wise Report ',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/headwisereport',
                                            title: 'Fee Head Wise Report',
                                            description: 'Manage Fee Head Wise Report Details'
                                        },
                                        {
                                            id: 10017,
                                            name: 'Fee Due Date Report ',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feeduedatereport',
                                            title: 'Fee Due Date Report',
                                            description: 'Manage Fee Due Date Report Details'
                                        },
                                        {
                                            id: 10018,
                                            name: 'Fee Month End Report ',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feemonthendreport',
                                            title: 'Fee Month End Report',
                                            description: 'Manage Fee Month End Report Details'
                                        },
                                        {
                                            id: 10019,
                                            name: 'Fee Class Category Report ',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/classcategoryreport',
                                            title: 'Fee Class Category Report',
                                            description: 'Manage Fee Class Category Report Details'
                                        },
                                        {
                                            id: 10020,
                                            name: 'Fee Consolidated Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feeconsolidatedreport',
                                            title: 'Fee Consolidated Report',
                                            description: 'Manage Fee Consolidated Report Details'
                                        },
                                        {
                                            id: 10021,
                                            name: 'Fee Installment Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feesinstallmentreport',
                                            title: 'Fee Installment Report',
                                            description: 'Manage Fee Installment Report Details'
                                        },
                                        {
                                            id: 10022,
                                            name: 'Fee Receipt Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feereceiptreport',
                                            title: 'Fee Receipt Report',
                                            description: 'Manage Fee Receipt Report Details'
                                        },
                                        {
                                            id: 10023,
                                            name: 'Fee Accounts Position Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feeaccountspositionReport',
                                            title: 'Fee Accounts Position Report',
                                            description: 'Manage Fee Accounts Position Report Details'
                                        },
                                        {
                                            id: 10024,
                                            name: 'Fee Student Term Wise Paid Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feestudenttermwisepaidreport',
                                            title: 'Fee Student Term Wise Paid Report',
                                            description: 'Manage Fee Student Term Wise Paid Report Details'
                                        },
                                        {
                                            id: 10025,
                                            name: 'Excel Not Imported Student Details Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/excelnotimportedstudentdetailsreport',
                                            title: 'Excel Not Imported Student Details Report',
                                            description: 'Manage Excel Not Imported Student Details Report'
                                        },
                                        {
                                            id: 10026,
                                            name: 'Fee Group Wise Student Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feegroupwisestudentreport',
                                            title: 'Fee Group Wise Student Report',
                                            description: 'Manage Fee Group Wise Student Report Details'
                                        },
                                        {
                                            id: 10027,
                                            name: 'Fee Defaulter Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feedefaulterreportstthomas',
                                            title: 'Fee Defaulter Report',
                                            description: 'Manage Fee Defaulter Report Details'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                {
                    id: 90001,
                    name: 'Fees Client',
                    icon: 'UserRoundPlus',
                    menu: [
                        {
                            id: 51,
                            name: 'Client Specific Fee Reports',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 111,
                                    name: 'Fee Reports',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 601,
                                            name: 'Fee ClassWise Due List Report Sophia',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feeclasswiseduelistreportsophia',
                                            title: 'Fee ClassWise Due List Report Sophia',
                                            description: 'Fee ClassWise Due List Report Sophia'
                                        },
                                        {
                                            id: 602,
                                            name: 'Fee Item Wise Report Sophia',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feeitemwisereportsophia',
                                            title: 'Fee Item Wise Report Sophia',
                                            description: 'Fee Item Wise Report Sophia'
                                        },
                                        {
                                            id: 603,
                                            name: 'Fee Student and Account Wise Report Sophia',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feestudentandaccountwisereportsophia',
                                            title: 'Fee Student and Account Wise Report Sophia',
                                            description: 'Fee Student and Account Wise Report Sophia'
                                        },
                                        {
                                            id: 604,
                                            name: 'Fee Collection Report VVVS',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feecollectionreportvvvs',
                                            title: 'Fee Collection Report VVVS',
                                            description: 'Fee Collection Report VVVS'
                                        },
                                        {
                                            id: 605,
                                            name: 'Fee IT Report UK Public School',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feeitreportukschool',
                                            title: 'Fee IT Report UK Public School',
                                            description: 'Fee IT Report UK Public School'
                                        },
                                        {
                                            id: 606,
                                            name: 'Fee Refund Report GMVPS',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feerefundreportgmvps',
                                            title: 'Fee Refund Report GMVPS',
                                            description: 'Fee Refund Report GMVPS'
                                        },
                                        {
                                            id: 607,
                                            name: 'Fee Defaulter Report STTHOMAS',
                                            icon: 'Settings',
                                            url: '/fees/feereports/feedefaulterreportstthomas',
                                            title: 'Fee Defaulter Report STTHOMAS',
                                            description: 'Fee Defaulter Report STTHOMAS'
                                        },
                                        {
                                            id: 519,
                                            name: 'Fee Transaction STTHOMAS',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feetransactionstthomas',
                                            title: 'Fee Transaction STTHOMAS',
                                            description: 'Fee Transaction STTHOMAS'
                                        },
                                        {
                                            id: 55555,
                                            name: 'Fee Amount Entry STTHOMAS',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feeamountentrystthomas',
                                            title: 'Fee Amount Entry STTHOMAS',
                                            description: 'Manage Fee Amount Entry Details STTHOMAS'
                                        },
                                        {
                                            id: 519,
                                            name: 'Fee Head Wise Report Calcaltta',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/headwisereport',
                                            title: 'Fee Head Wise Report Calcaltta',
                                            description: 'Fee Head Wise Report Calcaltta'
                                        },
                                        {
                                            id: 507,
                                            name: 'Master Student Fee Group Mapping (Vishwadarshana Society)',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/masters/StudentFeeGroupMappingVishwa',
                                            title: 'Master Student Fee Group Mapping (Vishwadarshana Society)',
                                            description: 'Manage Master Student Fee Group Mapping Details'
                                        },
                                        {
                                            id: 10028,
                                            name: 'Fee IncomeTax Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feeIncomeTax_Report',
                                            title: 'Fee IncomeTax Report',
                                            description: 'Manage Fee IncomeTax Report Details'
                                        },
                                        {
                                            id: 10029,
                                            name: 'Fee User Wise Daily Collection Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/FeeUserWiseDailyCollectionReport',
                                            title: 'Fee User Wise Daily Collection Report',
                                            description: 'Manage Fee User Wise Daily Collection Report Details'
                                        },
                                        {
                                            id: 399,
                                            name: 'Fee Cheque Bounce',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feeChequeBounce',
                                            title: 'Fee Cheque Bounce',
                                            description: 'Manage Fee Cheque Bounce Details'
                                        },
                                        {
                                            id: 519,
                                            name: 'Third Party TransactionGM',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/thirdPartyTransactionGM',
                                            title: 'Third Party TransactionGM',
                                            description: 'Manage Third Party TransactionGM'
                                        },
                                        {
                                            id: 520,
                                            name: 'Fee Transaction Vishwadarshana Society',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feetransactionvishwa',
                                            title: 'Fee Transaction Vishwadarshana Society',
                                            description: 'Manage Fee Transaction Vishwadarshana Society'
                                        },
                                        {
                                            id: 521,
                                            name: 'Fee Receipt Import ST THOMAS',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/feesreceiptimportstthomas',
                                            title: 'Fee Receipt Import ST THOMAS',
                                            description: 'Manage Fee Receipt Import ST THOMAS'
                                        },
                                        {
                                            id: 522,
                                            name: 'Fee Trail Audit Reoport ST JAMES',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feetrailauditreport',
                                            title: 'Fee Trail Audit Reoport ST JAMES',
                                            description: 'Manage Fee Trail Audit Reoport ST JAMES'
                                        },
                                        {
                                            id: 522,
                                            name: 'Fee Demand Register Report GMVPS',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/feereports/feedemandregisterreportgmvps',
                                            title: 'Fee Demand Register Report GMVPS',
                                            description: 'Manage Fee Demand Register Report GMVPS'
                                        },
                                        {
                                            id: 43,
                                            name: 'Fee Waivedoff Sophia',
                                            icon: 'BadgeIndianRupee',
                                            url: '/fees/transactions/waivedoff',
                                            title: 'Fee Waivedoff Sophia',
                                            description: 'Manage Fee Waivedoff Sophia'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                {
                    id: 30003,
                    name: 'Exam',
                    icon: 'BookOpen',
                    menu: [
                        {
                            id: 3,
                            name: 'Exam Module',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 999,
                                    name: 'OMR EVALUATION',
                                    icon: 'BookOpen',
                                    pages: [
                                        {
                                            id: 300,
                                            name: 'OMR Sheet Evaluator',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/omr-evaluation/omr-mark-sheet-evaluation',
                                            title: 'OMR Sheet Evaluator',
                                            description: 'Evaluate OMR mark sheets'
                                        }
                                    ]
                                },
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
                                        },
                                        {
                                            id: 204,
                                            name: 'Baldwin Master Time Table Session',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/masters/exam-tt-session-master',
                                            title: 'Baldwin Master Time Table Session',
                                            description: 'Manage Baldwin Master Time Table Session Details'
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
                                        {
                                            id: 54,
                                            name: 'Exam Login Privilages',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/exam-mapping/exam-login-privilages',
                                            title: 'Exam Login Privilages',
                                            description: 'Manage Exam Login Privilages Details'
                                        },
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
                                            name: 'Student Subject Mapping',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/student-subject-mapping',
                                            title: 'Student Subject Mapping',
                                            description: 'Manage Student Subject Mapping Details'
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
                                        },
                                        {
                                            id: 61,
                                            name: 'Exam Marks Process Condition',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/exam-marks-process-condition',
                                            title: 'Exam Marks Process Condition',
                                            description: 'Manage Exam Marks Process Condition Details'
                                        },
                                        {
                                            id: 62,
                                            name: 'Hall Ticket Generation',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/exam-hall-ticket-generation',
                                            title: 'Hall Ticket Generation',
                                            description: 'Manage Hall Ticket Generation Details'
                                        },
                                        {
                                            id: 63,
                                            name: 'Yearly Category Date Mapping',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/exam-mapping/yearly-category-dates-mapping',
                                            title: 'Yearly Category Date Mapping',
                                            description: 'Manage Yearly Category Date Mapping Details'
                                        },
                                        {
                                            id: 64,
                                            name: 'Promotion Setting',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/promotion-setting',
                                            title: 'Promotion Setting',
                                            description: 'Manage Promotion Setting Details'
                                        },
                                        {
                                            id: 95,
                                            name: 'Student Transaction',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/exam-mapping/student-transactioncce',
                                            title: 'Student Transaction',
                                            description: 'Manage Student Transaction Details'
                                        },
                                        {
                                            id: 96,
                                            name: 'Exam TT Session',
                                            icon: 'Clock',
                                            url: '/Exam/exam-module/exam-mapping/ExamTTsession',
                                            title: 'Exam TT Session Master',
                                            description: 'Manage Exam Time Table Sessions'
                                        },
                                        {
                                            id: 97,
                                            name: 'Exam TT Trans Settings',
                                            icon: 'CalendarClock',
                                            url: '/Exam/exam-module/exam-mapping/ExamTTTransSettings',
                                            title: 'Exam TT Transaction Settings',
                                            description: 'Manage Exam Time Table Transaction Settings'
                                        },
                                        {
                                            id: 98,
                                            name: 'Baldwin Exam TT Trans Settings',
                                            icon: 'CalendarClock',
                                            url: '/Exam/exam-module/exam-mapping/ExamTTTransSettings',
                                            title: 'Baldwin Exam Time Table Settings',
                                            description: 'Manage Baldwin Exam Time Table Settings'
                                        },
                                        {
                                            id: 99,
                                            name: 'Amrutha Bharathi Exam TT Trans Settings',
                                            icon: 'CalendarClock',
                                            url: '/Exam/exam-module/exam-mapping/ExamTTTransSettings',
                                            title: 'Amrutha Bharathi School Exam Time Table Settings',
                                            description: 'Manage Amrutha Bharathi School Exam Time Table Settings'
                                        },
                                        {
                                            id: 100,
                                            name: 'Hithachinthana School Exam TT Trans Settings',
                                            icon: 'CalendarClock',
                                            url: '/Exam/exam-module/exam-mapping/ExamTTTransSettings',
                                            title: 'Hithachinthana School Exam Time Table Settings',
                                            description: 'Manage Hithachinthana School Exam Time Table Settings'
                                        }
                                    ]
                                },
                                {
                                    id: 400,
                                    name: 'Marks Entry',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 63,
                                            name: 'Exam Wise Student Remarks Entry',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/marks-entry/exam-wise-student-remarks-entry',
                                            title: 'Exam Wise Student Remarks Entry',
                                            description: 'Manage Exam Wise Student Remarks Entry Details'
                                        },
                                        {
                                            id: 64,
                                            name: 'Promotion Remarks',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/marks-entry/exam-promotion-remarks',
                                            title: 'PROMOTION REMARKS',
                                            description: ''
                                        },
                                        {
                                            id: 65,
                                            name: 'Marks Entry',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/marks-entry/exam-marks-entry',
                                            title: 'Marks Entry',
                                            description: 'Manage Marks Entry Details'
                                        },
                                        {
                                            id: 66,
                                            name: 'Student Wise Publish Marks',
                                            icon: 'CalendarDays',
                                            url: '/Exam/exam-module/marks-entry/student-wise-publish-marks',
                                            title: 'Student Marks Publish',
                                            description: 'Manage Student Marks Publish Details'
                                        }
                                    ]
                                },

                                {
                                    id: 11,
                                    name: 'Marks Calculation',
                                    icon: 'BookOpen',
                                    pages: [
                                        {
                                            id: 72,
                                            name: 'Exam Marks Calculation',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/calculation/marks-calculation',
                                            title: 'Exam Marks Calculation',
                                            description: 'Manage Exam Marks Calculation Details'
                                        },
                                        {
                                            id: 93,
                                            name: 'Promotion Calculation',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/calculation/promotion-calculation',
                                            title: 'Promotion Calculation',
                                            description: 'Manage Promotion Calculation Details'
                                        }
                                    ]
                                },
                                {
                                    id: 10,
                                    name: 'Reports',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 70,
                                            name: 'Cumulative Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/cumulative-report',
                                            title: 'Cumulative Report',
                                            description: 'Manage Cumulative Report Details'
                                        },
                                        {
                                            id: 71,
                                            name: 'Progress Card Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/vvehpc_exam-report-card',
                                            title: 'Progress Card Report',
                                            description: 'Manage Progress Card Report Details'
                                        },
                                        {
                                            id: 65,
                                            name: 'Elective Subject Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/exam-electives-report',
                                            title: 'Elective Subject Report',
                                            description: 'Manage Elective Subject Report Details'
                                        },
                                        {
                                            id: 73,
                                            name: 'Exam Month End Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/exam-month-end-report',
                                            title: 'Exam Month End Report',
                                            description: 'Manage Exam Month End Report Details'
                                        },
                                        {
                                            id: 74,
                                            name: 'Exam Category Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/exam-category-report',
                                            title: 'Exam Category Report',
                                            description: 'Manage Exam Category Report Details'
                                        },
                                        // {
                                        //     id: 75,
                                        //     name: 'TBS Report School',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/tbs-report-school',
                                        //     title: 'TBS Report School',
                                        //     description: 'Manage TBS Report School Details'
                                        // },
                                        {
                                            id: 77,
                                            name: 'Percentagewise Details Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/percentagewise-details-report',
                                            title: 'Percentagewise Details Report',
                                            description: 'Manage Percentagewise Student Details Report'
                                        },
                                        {
                                            id: 78,
                                            name: 'Grade Slab Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/grade-slab-report',
                                            title: 'Grade Slab Report',
                                            description: 'View Grade Slab Details'
                                        },
                                        {
                                            id: 79,
                                            name: 'Toppers List Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/toppers-list-report',
                                            title: 'Toppers List Report',
                                            description: 'View Toppers List Details'
                                        },
                                        {
                                            id: 80,
                                            name: 'Exam Login Privileges Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/exam-login-privileges-report',
                                            title: 'Exam Login Privileges Report',
                                            description: 'View Exam Login Privileges Details'
                                        },
                                        {
                                            id: 81,
                                            name: 'Marks Entry Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/marks-entry-report',
                                            title: 'Marks Entry Report',
                                            description: 'View Marks Entry Report Details'
                                        },
                                        {
                                            id: 82,
                                            name: 'Tabulation Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/promotion-details-report',
                                            title: 'Tabulation Report',
                                            description: 'View Tabulation Report'
                                        },
                                        {
                                            id: 83,
                                            name: 'Juniors Progress Card Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/juniors-progress-card-report',
                                            title: 'Juniors Progress Card Report',
                                            description: 'View Juniors Progress Card Report'
                                        },
                                        // {
                                        //     id: 84,
                                        //     name: 'Report Card VI_VIII',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/StThomos/Report_Card_VI_VIII',
                                        //     title: 'Report Card VI_VIII',
                                        //     description: 'Report Card VI_VIII'
                                        // },
                                        // {
                                        //     id: 85,
                                        //     name: 'Report Card X_XII',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/StThomos/Report_Card_X_XII',
                                        //     title: 'Report Card X_XII',
                                        //     description: 'Report Card X_XII'
                                        // },
                                        // {
                                        //     id: 86,
                                        //     name: 'Report Card XI',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/Report_Card_XI',
                                        //     title: 'Report Card XI',
                                        //     description: 'Report Card XI'
                                        // },
                                        // {
                                        //     id: 87,
                                        //     name: 'Report Card_IX',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/StThomos/Report_Card_IX',
                                        //     title: 'Report Card_IX',
                                        //     description: 'Report Card_IX'
                                        // },
                                        // {
                                        //     id: 88,
                                        //     name: 'Report Card_X',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/StThomos/Report_Card_X',
                                        //     title: 'Report Card_X',
                                        //     description: 'Report Card_X'
                                        // },
                                        {
                                            id: 100,
                                            name: 'Hall Ticket Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Baldwin/hall-ticket-report',
                                            title: 'Hall Ticket Report',
                                            description: 'Generate Hall Ticket Report for students'
                                        },
                                        {
                                            id: 101,
                                            name: 'BCEHS Final Promotion Report',
                                            icon: 'Report',
                                            url: '/Exam/exam-module/reports/Baldwin/bcehs-final-promotion-report',
                                            title: 'BCEHS Final Promotion Report',
                                            description: 'Generate BCEHS Final Promotion Report'
                                        },
                                        {
                                            id: 102,
                                            name: 'Multiple Exam Progress Card Report 2',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Baldwin/MultipleExamProgressCardReport2',
                                            title: 'Multiple Exam Progress Card Report 2',
                                            description: 'Generate Multiple Exam Progress Card Report 2 for Baldwin'
                                        },
                                        // ,
                                        // {
                                        //     id: 90,
                                        //     name: 'Stella Progress Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/stella_prograss_report',
                                        //     title: 'Stella Progress Report',
                                        //     description: 'Manage Stella Progress Card Report Details'
                                        // },
                                        // {
                                        //     id: 91,
                                        //     name: 'Stella Marks Entry Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/stella_marks_entry_report',
                                        //     title: 'Stella Marks Entry Report',
                                        //     description: 'Manage Stella Marks Entry Report Details'
                                        // },
                                        // {
                                        //     id: 92,
                                        //     name: 'Vidyaniketan Performance Ananlysis Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/vidyaniketan-performance-analysis-report',
                                        //     title: 'Vidyaniketan Performance Ananlysis Report',
                                        //     description: 'Manage Vidyaniketan Performance Ananlysis Report Details'
                                        // },
                                        // {
                                        //     id: 93,
                                        //     name: 'Vidyaniketan Progress Card Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/vidyaniketan-progress-card-report',
                                        //     title: 'Vidyaniketan Progress Card Report',
                                        //     description: 'Manage Vidyaniketan Progress Card Report Details'
                                        // },
                                        // {
                                        //     id: 94,
                                        //     name: 'Vidyaniketan I-VIII Card Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/vidyaniketan-report-card-I-VIII',
                                        //     title: 'Vidyaniketan I-VIII Card Report',
                                        //     description: 'Manage Vidyaniketan I-VIII Card Report Details'
                                        // },
                                        // {
                                        //     id: 95,
                                        //     name: 'Sophia IX-X Card Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/sophia-report-card-IX-X',
                                        //     title: 'Sophia IX-X Card Report',
                                        //     description: 'Manage Sophia IX-X Card Report Details'
                                        // },
                                        // {
                                        //     id: 96,
                                        //     name: 'Sophia Pre-II Card Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/sophia-report-card-pre-II',
                                        //     title: 'Sophia Pre-II Card Report',
                                        //     description: 'Manage Sophia Pre-II Card Report Details'
                                        // },
                                        // {
                                        //     id: 97,
                                        //     name: 'Sophia Topper List Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/sophia-topper-list-report',
                                        //     title: 'Sophia Topper List Report',
                                        //     description: 'Manage Sophia Topper List Report Details'
                                        // },
                                        // {
                                        //     id: 98,
                                        //     name: 'St.James Consolidation Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/st-james-consolidation-report',
                                        //     title: 'St.James Consolidation Report',
                                        //     description: 'Manage St.James Consolidation Report Details'
                                        // },
                                        // {
                                        //     id: 99,
                                        //     name: 'St.James IX_X Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/st-james-ix-x-report',
                                        //     title: 'St.James IX_X Report',
                                        //     description: 'Manage St.James IX_X Report Details'
                                        // },
                                        // {
                                        //     id: 21001,
                                        //     name: 'GMVPS_Vidyaniketan Performance Analysis Report',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/GMVPS/vidyaniketan-performance-analysis-report',
                                        //     title: 'GMVPS_Vidyaniketan Performance Analysis Report',
                                        //     description: 'GMVPS_Vidyaniketan Performance Analysis Report'
                                        // }
                                        {
                                            id: 21002,
                                            name: 'GMVPS_Vidyaniketan Progress Card Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/GMVPS/vidyaniketan-progress-card-report',
                                            title: 'GMVPS_Vidyaniketan Progress Card Report',
                                            description: 'GMVPS_Vidyaniketan Progress Card Report'
                                        },
                                        {
                                            id: 21003,
                                            name: 'GMVPS_Vidyaniketan I-VIII Report Card',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/GMVPS/vidyaniketan-report-card-I-VIII',
                                            title: 'GMVPS_Vidyaniketan I-VIII Report Card',
                                            description: 'GMVPS_Vidyaniketan I-VIII Report Card'
                                        },
                                        {
                                            id: 21100,
                                            name: 'GMVPS Report Card IX',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/GMVPS/gmvps-progresscard-IX',
                                            title: 'GMVPS Report Card IX',
                                            description: 'GMVPS Report Card IX'
                                        },
                                        {
                                            id: 21004,
                                            name: 'StThomos_Report Card IX',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/Report_Card_IX',
                                            title: 'StThomos_Report Card IX',
                                            description: 'StThomos_Report Card IX'
                                        },
                                        {
                                            id: 21005,
                                            name: 'StThomos_Report Card VI-VIII',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/Report_Card_VI_VIII',
                                            title: 'StThomos_Report Card VI-VIII',
                                            description: 'StThomos_Report Card VI-VIII'
                                        },
                                        {
                                            id: 21006,
                                            name: 'StThomos_Report Card X',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/Report_Card_X',
                                            title: 'StThomos_Report Card X',
                                            description: 'StThomos_Report Card X'
                                        },
                                        {
                                            id: 21007,
                                            name: 'StThomos_Report Card X-XII',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/Report_Card_X_XII',
                                            title: 'StThomos_Report Card X-XII',
                                            description: 'StThomos_Report Card X-XII'
                                        },
                                        {
                                            id: 21008,
                                            name: 'StThomos_Juniors Progress Card Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/juniors-progress-card-report',
                                            title: 'StThomos_Juniors Progress Card Report',
                                            description: 'StThomos_Juniors Progress Card Report'
                                        },
                                        {
                                            id: 21009,
                                            name: 'StThomos_Promotion Cumulative Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/promotion-cumulative-report',
                                            title: 'StThomos_Promotion Cumulative Report',
                                            description: 'StThomos_Promotion Cumulative Report'
                                        },
                                        {
                                            id: 21010,
                                            name: 'StThomos_Promotion Details Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StThomos/promotion-details-report',
                                            title: 'StThomos_Promotion Details Report',
                                            description: 'StThomos_Promotion Details Report'
                                        },
                                        {
                                            id: 21011,
                                            name: 'Stella_Marks Entry Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Stella/stella_marks_entry_report',
                                            title: 'Stella_Marks Entry Report',
                                            description: 'Stella_Marks Entry Report'
                                        },
                                        {
                                            id: 21012,
                                            name: 'Stella_Progress Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Stella/stella_prograss_report',
                                            title: 'Stella_Progress Report',
                                            description: 'Stella_Progress Report'
                                        },
                                        {
                                            id: 21013,
                                            name: 'Sophia_Report Card IX-X',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/sophia-report-card-IX-X',
                                            title: 'Sophia_Report Card IX-X',
                                            description: 'Sophia_Report Card IX-X'
                                        },
                                        // {
                                        //     id: 21014,
                                        //     name: 'Sophia_Report Card Pre-II',
                                        //     icon: 'BookOpen',
                                        //     url: '/Exam/exam-module/reports/Sophia/sophia-report-card-pre-II',
                                        //     title: 'Sophia_Report Card Pre-II',
                                        //     description: 'Sophia_Report Card Pre-II'
                                        // },
                                        {
                                            id: 21015,
                                            name: 'Sophia_Topper List Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/sophia-topper-list-report',
                                            title: 'Sophia_Topper List Report',
                                            description: 'Sophia_Topper List Report'
                                        },
                                        {
                                            id: 21099,
                                            name: 'Sophia_Promotion Report Card',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/PromotionReportCardSophia',
                                            title: 'Sophia_Promotion Report Card',
                                            description: 'Sophia_Promotion Report Card'
                                        },
                                        {
                                            id: 21100,
                                            name: 'Final Promotion VI_TO_VIII Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/FinalpromoreportVI_TO_VIII',
                                            title: 'Final Promotion VI_TO_VIII Report',
                                            description: 'Final Promotion VI_TO_VIII Report'
                                        },
                                        {
                                            id: 21016,
                                            name: 'StJames_Consolidation Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StJames/st-james-consolidation-report',
                                            title: 'StJames_Consolidation Report',
                                            description: 'StJames_Consolidation Report'
                                        },
                                        {
                                            id: 21017,
                                            name: 'StJames_IX-X Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StJames/st-james-ix-x-report',
                                            title: 'StJames_IX-X Report',
                                            description: 'StJames_IX-X Report'
                                        },
                                        {
                                            id: 21018,
                                            name: 'GMVNB_Marks Cumulative Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/GMVNB/MarksCumulativeReport',
                                            title: 'GMVNB_Marks Cumulative Report',
                                            description: 'GMVNB_Marks Cumulative Report'
                                        },
                                        {
                                            id: 21019,
                                            name: 'GMVNB_Progress Card Report GMVPS',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/GMVNB/ProgressCardReportGMVPS',
                                            title: 'GMVNB_Progress Card Report GMVPS',
                                            description: 'GMVNB_Progress Card Report GMVPS'
                                        },
                                        {
                                            id: 21020,
                                            name: 'CarmelPS_StJohns School Progress Card Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/CarmelPS/StJohns_SchoolProgressCardReport',
                                            title: 'CarmelPS_StJohns School Progress Card Report',
                                            description: 'CarmelPS_StJohns School Progress Card Report'
                                        },
                                        {
                                            id: 21021,
                                            name: 'Nagarjuna_Cumulative Report BB',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Nagarjuna/CumulativeReportBB',
                                            title: 'Nagarjuna_Cumulative Report BB',
                                            description: 'Nagarjuna_Cumulative Report BB'
                                        },
                                        {
                                            id: 21022,
                                            name: 'RainBow_Cumulative Report BB',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/RainBow/CumulativeReportBB',
                                            title: 'RainBow_Cumulative Report BB',
                                            description: 'RainBow_Cumulative Report BB'
                                        },
                                        {
                                            id: 21023,
                                            name: 'St_Anns_Promotion Senior Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/St_Anns/PromSeniorReport_STANNS',
                                            title: 'St_Anns_Promotion Senior Report',
                                            description: 'St_Anns_Promotion Senior Report'
                                        },
                                        {
                                            id: 21024,
                                            name: 'St_Anns_Promotion Senior Report Nursery',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/St_Anns/PromSeniorReport_STANNSNURSERY',
                                            title: 'St_Anns_Promotion Senior Report Nursery',
                                            description: 'St_Anns_Promotion Senior Report Nursery'
                                        },
                                        {
                                            id: 21025,
                                            name: 'VSPE_Cumulative Report VSP',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/VSPE/CumulativeReportvsp',
                                            title: 'VSPE_Cumulative Report VSP',
                                            description: 'VSPE_Cumulative Report VSP'
                                        },
                                        {
                                            id: 21026,
                                            name: 'VidhyaVikas_Cumulative Report BB New',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/VidhyaVikas/CumulativeReportBBNew',
                                            title: 'VidhyaVikas_Cumulative Report BB New',
                                            description: 'VidhyaVikas_Cumulative Report BB New'
                                        },
                                        {
                                            id: 21027,
                                            name: 'VidhyaVikas_Exam Report Card',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/VidhyaVikas/VVEHPC_ExamReportCard',
                                            title: 'VidhyaVikas_Exam Report Card',
                                            description: 'VidhyaVikas_Exam Report Card'
                                        },
                                        {
                                            id: 21028,
                                            name: 'VidhyaVikas_Exam Report Card ICSE',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/VidhyaVikas/VVEHPC_ExamReportCardICSE',
                                            title: 'VidhyaVikas_Exam Report Card ICSE',
                                            description: 'VidhyaVikas_Exam Report Card ICSE'
                                        },
                                        {
                                            id: 21029,
                                            name: 'Studentportal Exam Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/StudentportalExamReport',
                                            title: 'Studentportal Exam Report',
                                            description: 'Studentportal Exam Report'
                                        },
                                        {
                                            id: 21030,
                                            name: 'AI Performance Analysis',
                                            icon: 'BarChart',
                                            url: '/Exam/exam-module/ai-performance-analysis',
                                            title: 'AI Performance Analysis',
                                            description: 'AI Performance Analysis'
                                        },
                                        {
                                            id: 21031,
                                            name: 'TBS Report School',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/tbs-report-school',
                                            title: 'TBS Report School',
                                            description: 'TBS Report School'
                                        },
                                        {
                                            id: 21032,
                                            name: 'SRKVS Cumulative Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/SRKVS/CumulativeReportSRKVS',
                                            title: 'SRKVS Cumulative Report',
                                            description: 'SRKVS Cumulative Report'
                                        },
                                        {
                                            id: 21033,
                                            name: 'Calcutta Hall Ticket Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/hall-ticket-report',
                                            title: 'Calcutta Hall Ticket Report',
                                            description: 'Calcutta Hall Ticket Report'
                                        },
                                        {
                                            id: 21034,
                                            name: 'VVS Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/vvs-exam-hallticket',
                                            title: 'VVS Exam Hallticket',
                                            description: 'VVS Exam Hallticket'
                                        },
                                        {
                                            id: 21035,
                                            name: 'RRPS Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/rrps-exam-hallticket',
                                            title: 'RRPS Exam Hallticket',
                                            description: 'RRPS Exam Hallticket'
                                        },
                                        {
                                            id: 21036,
                                            name: 'ABV Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/abv-exam-hallticket',
                                            title: 'ABV Exam Hallticket',
                                            description: 'ABV Exam Hallticket'
                                        },
                                        {
                                            id: 21037,
                                            name: 'Carmel Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/cramel-exam-hallticket',
                                            title: 'Carmel Exam Hallticket',
                                            description: 'Carmel Exam Hallticket'
                                        },
                                        {
                                            id: 21038,
                                            name: 'GMVPS Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/gmvps-exam-hallticket',
                                            title: 'GMVPS Exam Hallticket',
                                            description: 'GMVPS Exam Hallticket'
                                        },
                                        {
                                            id: 21039,
                                            name: 'UKPS Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/ukps-exam-hallticket',
                                            title: 'UKPS Exam Hallticket',
                                            description: 'UKPS Exam Hallticket'
                                        },
                                        {
                                            id: 21040,
                                            name: 'Baldwin Exam Hallticket',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Calcatta/baldwin-exam-hallticket',
                                            title: 'Baldwin Exam Hallticket',
                                            description: 'Baldwin Exam Hallticket'
                                        },
                                        {
                                            id: 21050,
                                            name: 'NDS_Co_Scholasticreport',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/nds/NDS_Co_Scholasticreport',
                                            title: 'NDS_Co_Scholasticreport',
                                            description: 'NDS_Co_Scholasticreport'
                                        },
                                        {
                                            id: 21051,
                                            name: 'NDS_I_To_VIII_ReportCard',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/nds/NDS_I_To_VIII_ReportCard',
                                            title: 'NDS_I_To_VIII_ReportCard',
                                            description: 'NDS_I_To_VIII_ReportCard'
                                        },
                                        {
                                            id: 21041,
                                            name: 'BRS Progress Card Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Burnpur/brs_reportcard',
                                            title: 'BRS Progress Card Report',
                                            description: 'BRS Progress Card Report'
                                        },
                                        {
                                            id: 21042,
                                            name: 'BRS Progress Card IX Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Burnpur/brs_reportcardIX',
                                            title: 'BRS Progress Card IX Report',
                                            description: 'BRS Progress Card IX Report'
                                        },
                                        {
                                            id: 21043,
                                            name: 'BRS Progress Card X Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Burnpur/brs_reportcardX',
                                            title: 'BRS Progress Card X Report',
                                            description: 'BRS Progress Card X Report'
                                        },


                                        {
                                            id: 21044,
                                            name: 'St. James Consolidate Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/StJames/stjames-consolidated-report',
                                            title: 'St. James Consolidate Report',
                                            description: 'St. James Consolidate Report'
                                        },
                                        {
                                            id: 21045,
                                            name: 'MES Progress Card Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/MES/mes-progresscardreport',
                                            title: 'MES Progress Card Report',
                                            description: 'MES Progress Card Report'
                                        },
                                        {
                                            id: 21055,
                                            name: 'BRS Progress Card XII Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Burnpur/Burnpur_ProgressCardReportXII',
                                            title: 'BRS Progress Card XII Report',
                                            description: 'BRS Progress Card XII Report'
                                        },
                                        {
                                            id: 21056,
                                            name: 'BRS Progress Card XI Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Burnpur/Burnpur_ProgressCardReportXI',
                                            title: 'BRS Progress Card XI Report',
                                            description: 'BRS Progress Card XI Report'
                                        },
                                        {
                                            id: 21057,
                                            name: 'BRS Progress Card Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/Burnpur/Burnpur_ProgressCardReport',
                                            title: 'BRS Progress Card Report',
                                            description: 'BRS Progress Card Report'

                                        },
                                        {
                                            id: 21044,
                                            name: 'NDS_9_ProgressNewCardReport',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/nds/NDS_9_ProgressNewCardReport',
                                            title: 'NDS_9_ProgressNewCardReport',
                                            description: 'NDS_9_ProgressNewCardReport'
                                        },
                                        {
                                            id: 21046,
                                            name: 'NDS_9_ProgressCardReport',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/nds/NDS_9_ProgressCardReport',
                                            title: 'NDS_9_ProgressCardReport',
                                            description: 'NDS_9_ProgressCardReport'
                                        },
                                        {
                                            id: 21047,
                                            name: 'NDS_1_5_ProgressCardReport',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/nds/NDS_1_5_ProgressCardReport',
                                            title: 'NDS_1_5_ProgressCardReport',
                                            description: 'NDS_1_5_ProgressCardReport'
                                        },
                                        {
                                            id: 21045,
                                            name: 'NDS Promotion Report Card',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/nds/NDS_Promotionreportcard',
                                            title: 'NDS Promotion Report Card',
                                            description: 'NDS Promotion Report Card'
                                        },
                                        {
                                            id: 21046,
                                            name: 'Chinmaya_Final Promotion Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Chinmaya/FinalPromReportSChinmaya',
                                            title: 'Chinmaya_Final Promotion Report',
                                            description: 'Chinmaya Final Promotion Report Card'
                                        },
                                        {
                                            id: 21047,
                                            name: 'NDS_9 Progress Card Report',
                                            icon: 'FileText',
                                            url: '/Exam/exam-module/reports/nds/NDS9ProgressCardReport',
                                            title: 'NDS_9 Progress Card Report',
                                            description: 'NDS 9 Progress Card Report'
                                        },
                                        {
                                            id: 21048,
                                            name: 'Sophia Exam Report',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SopiaExamReport',
                                            title: 'Sophia Exam Report',
                                            description: 'Sophia Exam Report'
                                        },
                                        {
                                            id: 21049,
                                            name: 'Sophia Exam Report Term Exam',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SopiaExamReportTermExam',
                                            title: 'Sophia Exam Report Term Exam',
                                            description: 'Sophia Exam Report Term Exam'
                                        },
                                        {
                                            id: 21200,
                                            name: 'Sophia Exam Report I to IV',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SopiaExamReportItoIV',
                                            title: 'Sophia Exam Report I to IV',
                                            description: 'Sophia Exam Report I to IV'

                                        },
                                        {
                                            id: 21201,
                                            name: 'Sophia Exam Report IV Term',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SopiaExamReportIVTerm',
                                            title: 'Sophia Exam Report IV Term',
                                            description: 'Sophia Exam Report IV Term'
                                        },
                                        {
                                            id: 21202,
                                            name: 'Sophia Report Card Pre',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SophiaReportCardPre',
                                            title: 'Sophia Report Card Pre',
                                            description: 'Sophia Report Card Pre'
                                        },
                                        {
                                            id: 21203,
                                            name: 'Sophia Exam Report V to VIII',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SopiaExamReportVtoVIII',
                                            title: 'Sophia Exam Report V to VIII',
                                        },
                                        {
                                            id: 21204,
                                            name: 'Sophia Report Card Pre III',
                                            icon: 'BookOpen',
                                            url: '/Exam/exam-module/reports/Sophia/SophiaReportCardPreIII',
                                            title: 'Sophia Report Card Pre III',
                                            description: 'Sophia Report Card Pre III'

                                        },
                                          {
                                            id: 21205,
                                            name: 'St. James IV Progress Card',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/StJames/st-james-iv-report',
                                            title: 'St. James IV Progress Card',
                                            description: 'St. James IV Progress Card'
                                        },
                                        {
                                            id: 21206,
                                            name: 'IX-X St. James  Report',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/StJames/ix-x_st-jamesreport',
                                            title: 'IX-X St. James  Report',
                                            description: 'IX-X St. James  Report'
                                        },
                                        {
                                            id: 21207,
                                            name: 'St.James Progress Card New',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/StJames/progresscard-stjames-new',
                                            title: 'St.James Progress Card New',
                                            description: 'St.James  Progress Card New'
                                        },
                                        {
                                            id: 21208,
                                            name: 'St.James Progress Card',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/StJames/progresscard-st-james',
                                            title: 'St.James Progress Card',
                                            description: 'St.James Progress Card'
                                        },
                                        {
                                            id: 21209,
                                            name: 'XI-XII St.James Progress Card',
                                            icon: 'Ticket',
                                            url: '/Exam/exam-module/reports/StJames/xi-xii-progresscard-st-james',
                                            title: 'XI-XII St.James Progress Card',
                                            description: 'XI-XII St.James Progress Card'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 40004,
                    name: 'HRMS',
                    icon: 'Users',
                    menu: [
                        {
                            id: 1,
                            name: 'HRMS Config',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 401,
                                    name: 'HRMS Config',
                                    icon: 'Users',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Numbering',
                                            icon: 'CheckSquare',
                                            url: '/hrms/config/numbering',
                                            title: 'Numbering',
                                            description: 'Manage numbering Details'
                                        }
                                    ]
                                },
                                {
                                    id: 101,
                                    name: 'AI ATS',
                                    icon: 'BrainCircuit',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'AI Resume checker',
                                            icon: 'FileSearch',
                                            url: '/hrms/ai-ats/resume-checker',
                                            title: 'AI Resume checker',
                                            description:
                                                'Upload resumes and job descriptions for AI-powered ATS scoring and skill gap analysis.'
                                        }
                                    ]
                                },
                                {
                                    id: 402,
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
                                            name: 'Marital Status',
                                            icon: 'Heart',
                                            url: '/hrms/masters/marital-status',
                                            title: 'Marital Status Master',
                                            description: 'Manage Marital Status'
                                        },
                                        {
                                            id: 6,
                                            name: 'Specialization',
                                            icon: 'GraduationCap',
                                            url: '/hrms/masters/specialization',
                                            title: 'Specialization Master',
                                            description: 'Manage Specialization Details'
                                        },
                                        {
                                            id: 7,
                                            name: 'Employee Type',
                                            icon: 'Users',
                                            url: '/hrms/masters/employee-type',
                                            title: 'Employee Type Master',
                                            description: 'Manage Employee Types'
                                        },
                                        {
                                            id: 8,
                                            name: 'Group Type',
                                            icon: 'Layers',
                                            url: '/hrms/masters/group-type',
                                            title: 'Group Type Master',
                                            description: 'Manage Group Types'
                                        },
                                        {
                                            id: 9,
                                            name: 'Department',
                                            icon: 'Building2',
                                            url: '/hrms/masters/department',
                                            title: 'Department Master',
                                            description: 'Manage Departments'
                                        },
                                        {
                                            id: 10,
                                            name: 'Designation',
                                            icon: 'Award',
                                            url: '/hrms/masters/designation',
                                            title: 'Designation Master',
                                            description: 'Manage Designations'
                                        },
                                        {
                                            id: 11,
                                            name: 'Grade',
                                            icon: 'Trophy',
                                            url: '/hrms/masters/grade',
                                            title: 'Grade Master',
                                            description: 'Manage Grades'
                                        },
                                        {
                                            id: 1288,
                                            name: 'Group-Dept-Desig Mapping',
                                            icon: 'Network',
                                            url: '/hrms/masters/group-dept-dessg-mapping',
                                            title: 'Group-Dept-Desig Mapping',
                                            description: 'Map Group, Department & Designation'
                                        },
                                        {
                                            id: 13,
                                            name: 'Leave Year',
                                            icon: 'Calendar',
                                            url: '/hrms/masters/leave-year',
                                            title: 'Leave Year Master',
                                            description: 'Manage Leave Year'
                                        },
                                        {
                                            id: 14,
                                            name: 'Professional Tax',
                                            icon: 'FileText',
                                            url: '/hrms/masters/professional-tax',
                                            title: 'Professional Tax Slab',
                                            description: 'Manage Professional Tax'
                                        },
                                        {
                                            id: 15,
                                            name: 'Loan',
                                            icon: 'CreditCard',
                                            url: '/hrms/masters/loan',
                                            title: 'Loan Master',
                                            description: 'Manage Loan Types'
                                        },
                                        {
                                            id: 16,
                                            name: 'Payroll Standard',
                                            icon: 'Calculator',
                                            url: '/hrms/masters/payroll-standard',
                                            title: 'Payroll Standard',
                                            description: 'Manage Payroll Standards'
                                        },
                                        {
                                            id: 17,
                                            name: 'Religion-Category Mapping',
                                            icon: 'Link',
                                            url: '/hrms/masters/religion-category-mapping',
                                            title: 'Religion-Category Mapping',
                                            description: 'Map Religion & Category'
                                        }
                                    ]
                                },
                                {
                                    id: 406,
                                    name: 'User Creation',
                                    icon: 'UserPlus',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Staff User Creation',
                                            icon: 'UserPlus',
                                            url: '/SuperAdmin/super-admin-module/user-creation/staff-user-creation',
                                            title: 'Staff User Creation',
                                            description: 'Manage Institution Staff User Details'
                                        }
                                    ]
                                },
                                {
                                    id: 403,
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
                                    id: 408,
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
                                        // {
                                        //     id: 3,
                                        //     name: 'Salary Increment Process',
                                        //     icon: 'TrendingUp',
                                        //     url: '/hrms/transactions/salary-increment',
                                        //     title: 'Salary Increment Process',
                                        //     description: 'Manage Salary Increments'
                                        // },
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
                                        },
                                        {
                                            id: 8,
                                            name: 'Employee Salary Increment Details',
                                            icon: 'CreditCard',
                                            url: '/hrms/transactions/employee-increment-salary',
                                            title: 'Employee Salary Increment Details',
                                            description: 'Manage Employee Salary Increment Deatails'
                                        }
                                    ]
                                },
                                {
                                    id: 407,
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
                                            id: 23,

                                            name: 'Employee Details Report',

                                            icon: 'FileText',

                                            url: '/hrms/reports/employeeDetailsReport',

                                            title: 'Employee Details Report',

                                            description: 'Detailed Employee Information Report'
                                        },

                                        //,
                                        // {
                                        //     id: 2,
                                        //     name: 'Employee Details',
                                        //     icon: 'UserCheck',
                                        //     url: '/hrms/reports/employee-details',
                                        //     title: 'Employee Details',
                                        //     description: 'Detailed Employee Information'
                                        // },
                                        // {
                                        //     id: 3,
                                        //     name: 'Employee Profile',
                                        //     icon: 'User',
                                        //     url: '/hrms/reports/employee-profile',
                                        //     title: 'Employee Profile',
                                        //     description: 'Employee Profile Report'
                                        // },
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
                                            name: 'E-PF Contribution Register',
                                            icon: 'Coins',
                                            url: '/hrms/reports/e-pf-contribution-register',
                                            title: 'E-PF Contribution Register',
                                            description: 'E-PF Contribution Register Report'
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
                                            icon: 'FileText',
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
                                        // {
                                        //     id: 11,
                                        //     name: 'Employee Service Report',
                                        //     icon: 'Briefcase',
                                        //     url: '/hrms/reports/employee-service-report',
                                        //     title: 'Employee Service Report',
                                        //     description: 'Employee Service Summary'
                                        // },
                                        {
                                            id: 1289,
                                            name: 'Salary Certificate',
                                            icon: 'Award',
                                            url: '/hrms/reports/employeeSalaryCertificateBGHS',
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

                                        // {
                                        //     id: 17,
                                        //     name: 'PF Form3A',
                                        //     icon: 'FileType',
                                        //     url: '/hrms/reports/pf-form3a',
                                        //     title: 'PF Form3A',
                                        //     description: 'Provident Fund Form 3A'
                                        // },
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
                                        //,
                                        // {
                                        //     id: 21,
                                        //     name: 'Advance Report',
                                        //     icon: 'FileSearch',
                                        //     url: '/hrms/reports/advance-report',
                                        //     title: 'Advance Report',
                                        //     description: 'View Advance Reports'
                                        // }
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
                                        },
                                        {
                                            id: 24,
                                            name: 'Employee Profile Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/reports/employee-profile-report',
                                            title: 'Employee Profile Report',
                                            description: 'Employee Profile Report'
                                        },
                                        {
                                            id: 25,
                                            name: 'Salary Increment Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/reports/SalaryIncreementReport',
                                            title: 'Salary Increment Report',
                                            description: 'Salary Increment Report'
                                        },
                                        {
                                            id: 26,
                                            name: 'Form 5 stop Pension ST James Report',
                                            icon: 'FileType',
                                            url: '/hrms/reports/PFForm5stopPensionSTJamesReport',
                                            title: 'Form 5 stop Pension ST James Report',
                                            description: 'Provident Fund Form 5'
                                        },
                                        {
                                            id: 27,
                                            name: 'Employee Salary Slip ST James Report',
                                            icon: 'FileType',
                                            url: '/hrms/reports/employeeSalarySlipStJames',
                                            title: 'Employee Salary Slip ST James Report',
                                            description: 'Employee Salary Slips'
                                        },
                                        {
                                            id: 28,
                                            name: 'Employee Salary Slip Calcutta Boys Report',
                                            icon: 'FileType',
                                            url: '/hrms/reports/CBSSalarySlip',
                                            title: 'Employee Salary Slip Calcutta Boys Report',
                                            description: 'Employee Salary Slips'
                                        },
                                        {
                                            id: 29,
                                            name: 'Employee Contribution Report',
                                            icon: 'Clock',
                                            url: '/hrms/reports/contribution-report',
                                            title: 'Employee Contribution Report',
                                            description: 'Manage Employee Contribution Report'
                                        },
                                        {
                                            id: 30,
                                            name: 'PS7 Form Report',
                                            icon: 'Clock',
                                            url: '/hrms/reports/PS7FromReportStJames',
                                            title: 'PS7 Form Report',
                                            description: 'Manage PS7 Form Report'
                                        },
                                        {
                                            id: 31,
                                            name: 'MONTH WISE REPORT(st.james)',
                                            icon: 'Clock',
                                            url: '/hrms/reports/PS8_MonthWiseReportStjames',
                                            title: 'PS8 Month Wise Report',
                                            description: 'Manage Month Wise Report (st.james)'
                                        },
                                        {
                                            id: 32,
                                            name: 'PS8 Form Report(st.james)',
                                            icon: 'Clock',
                                            url: '/hrms/reports/PS8_ReportStjames',
                                            title: 'PS8 Form Report',
                                            description: 'Manage PS8 Form Report (st.james)'
                                        },
                                        {
                                            id: 33,
                                            name: 'VPF YEARLY REPORT',
                                            icon: 'Calandar',
                                            url: '/hrms/reports/VPFYearlyReport',
                                            title: 'VPF Yearly Report',
                                            description: 'Manage VPF Yearly Report'
                                        },
                                        {
                                            id: 34,
                                            name: 'VPF SUMMARY REPORT',
                                            icon: 'Calandar',
                                            url: '/hrms/reports/VPFSummaryReport',
                                            title: 'VPF Summary Report',
                                            description: 'Manage VPF Summary Report'
                                        },
                                        {
                                            id: 35,
                                            name: 'PF SUMMARY REPORT',
                                            icon: 'Calandar',
                                            url: '/hrms/reports/PFSummaryReport',
                                            title: 'PF Summary Report',
                                            description: 'Manage PF Summary Report'
                                        },
                                        {
                                            id: 36,
                                            name: 'PF YEARLY REPORT',
                                            icon: 'Calandar',
                                            url: '/hrms/reports/PFYearlyReport',
                                            title: 'PF Yearly Report',
                                            description: 'Manage PF Yearly Report'
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
                                            name: 'Add Candidate Interview',
                                            icon: 'Calendar',
                                            url: '/hrms/recruitment/transaction/add-candidate-interview',
                                            title: 'Add Candidate Interview',
                                            description: 'Add Candidate Interview'
                                        },
                                        //         {
                                        //             id: 3,
                                        //             name: 'Candidate Interview List',
                                        //             icon: 'List',
                                        //             url: '/hrms/recruitment/transaction/candidate-interview-list',
                                        //             title: 'Candidate Interview List',
                                        //             description: 'View All Candidate Interviews'
                                        //         },
                                        //         {
                                        //             id: 4,
                                        //             name: 'Interviewer Feedback',
                                        //             icon: 'MessageSquare',
                                        //             url: '/hrms/recruitment/transaction/interviewer-feedback',
                                        //             title: 'Interviewer Feedback',
                                        //             description: 'Manage Interviewer Feedback'
                                        //         },
                                        //         {
                                        //             id: 5,
                                        //             name: 'Job List',
                                        //             icon: 'Briefcase',
                                        //             url: '/hrms/recruitment/transaction/job-list',
                                        //             title: 'Job List',
                                        //             description: 'View All Jobs'
                                        //         },
                                        //         {
                                        //             id: 6,
                                        //             name: 'Job Posting List',
                                        //             icon: 'FileText',
                                        //             url: '/hrms/recruitment/transaction/job-posting-list',
                                        //             title: 'Job Posting List',
                                        //             description: 'View All Job Postings'
                                        //         }
                                    ]
                                },
                                // {
                                //     id: 3,
                                //     name: 'MRF Approval',
                                //     icon: 'CheckSquare',
                                //     pages: [
                                //         {
                                //             id: 1,
                                //             name: 'MRF Requisition Form',
                                //             icon: 'FileCheck',
                                //             url: '/hrms/recruitment/mrf-approval/mrf-requisition-form',
                                //             title: 'MRF Requisition Form',
                                //             description: 'Approve MRF Requests'
                                //         }
                                //     ]
                                // },
                                // {
                                //     id: 4,
                                //     name: 'Feedback',
                                //     icon: 'MessageSquare',
                                //     pages: [
                                //         {
                                //             id: 1,
                                //             name: 'Candidate Feedback',
                                //             icon: 'Star',
                                //             url: '/hrms/recruitment/feedback/candidate-feedback',
                                //             title: 'Candidate Feedback',
                                //             description: 'Record Candidate Feedback'
                                //         }
                                //     ]
                                // },
                                // {
                                //     id: 5,
                                //     name: 'Reports',
                                //     icon: 'FileText',
                                //     pages: [
                                //         {
                                //             id: 1,
                                //             name: 'Candidate Report',
                                //             icon: 'Users',
                                //             url: '/hrms/recruitment/reports/candidate-report',
                                //             title: 'Candidate Report',
                                //             description: 'Candidate Summary Report'
                                //         },
                                //         {
                                //             id: 2,
                                //             name: 'Interview Report',
                                //             icon: 'ClipboardList',
                                //             url: '/hrms/recruitment/reports/interview-report',
                                //             title: 'Interview Report',
                                //             description: 'Interview Summary Report'
                                //         }
                                //     ]
                                // }
                            ]
                        },
                        {
                            id: 404,
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
                                        },
                                        // {
                                        //     id: 7,
                                        //     name: 'GPS Location Attendance',
                                        //     icon: 'MapPin',
                                        //     url: '/hrms/attendance-management/masters/gps-location-attendance',
                                        //     title: 'GPS Location Attendance',
                                        //     description: 'GPS-based Attendance'
                                        // },
                                        {
                                            id: 8,
                                            name: 'Master Time Setting',
                                            icon: 'Clock',
                                            url: '/hrms/attendance-management/masters/master-time-setting',
                                            title: 'Master Time Setting',
                                            description: 'Configure Time Settings'
                                        },
                                        {
                                            id: 9,
                                            name: 'Front Office Addlogs',
                                            icon: 'ClipboardList',
                                            url: '/hrms/attendance-management/masters/front-office-addlogs',
                                            title: 'Front Office Addlogs',
                                            description: 'Front Office Addlogs'
                                        },
                                        {
                                            id: 10,
                                            name: 'Employee Log Insertion',
                                            icon: 'ClipboardList',
                                            url: '/hrms/attendance-management/masters/FrontOfficeAddlogsCBS',
                                            title: 'Employee Log Insertion',
                                            description: 'Manage Employee Log Insertion'
                                        }
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
                                        // {
                                        //     id: 6,
                                        //     name: 'Month End Report',
                                        //     icon: 'CalendarCheck',
                                        //     url: '/hrms/attendance-management/reports/fo-monthend-report',
                                        //     title: 'Month End Report',
                                        //     description: 'Monthly Attendance Summary'
                                        // },
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
                                        },
                                        {
                                            id: 8,
                                            name: 'Employee Month End Report',
                                            icon: 'CalendarCheck',
                                            url: '/hrms/attendance-management/reports/employee-month-end-report',
                                            title: 'Employee Month End Report',
                                            description: 'Employee End Report'
                                        }
                                    ]
                                }
                            ]
                        },

                        // , {
                        //     id: 4,
                        //     name: 'Leave Management',
                        //     icon: 'Calendar',
                        //     sub_menu: [
                        //         {
                        //             id: 1,
                        //             name: 'Masters',
                        //             icon: 'Database',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Master Leave',
                        //                     icon: 'Calendar',
                        //                     url: '/hrms/leave-management/masters/master-leave',
                        //                     title: 'Master Leave',
                        //                     description: 'Manage Leave Types'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Leave Authorization',
                        //                     icon: 'Shield',
                        //                     url: '/hrms/leave-management/masters/leave-authorization',
                        //                     title: 'Leave Authorization',
                        //                     description: 'Configure Leave Approvers'
                        //                 }
                        //                 // {
                        //                 //     id: 3,
                        //                 //     name: 'Master Leave Year',
                        //                 //     icon: 'CalendarRange',
                        //                 //     url: '/hrms/leave-management/masters/master-leaveYear',
                        //                 //     title: 'Master Leave Year',
                        //                 //     description: 'Manage Leave Year'
                        //                 // }
                        //             ]
                        //         },
                        //         {
                        //             id: 2,
                        //             name: 'Apply Leave',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Apply Leave',
                        //                     icon: 'FilePlus',
                        //                     url: '/hrms/leave-management/apply-leave',
                        //                     title: 'Apply Leave',
                        //                     description: 'Submit Leave Application'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Leave Approval',
                        //                     icon: 'CheckCircle',
                        //                     url: '/hrms/leave-management/leave-approval',
                        //                     title: 'Leave Approval',
                        //                     description: 'Approve or Reject Leave Requests'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 3,
                        //             name: 'Transaction',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Leave Transfer',
                        //                     icon: 'Plus',
                        //                     url: '/hrms/leave-management/transaction/leave-transfer',
                        //                     title: 'Leave Transfer',
                        //                     description: 'Transfer Leave'
                        //                 },
                        //                 // {
                        //                 //     id: 2,
                        //                 //     name: 'Comp Off Approval',
                        //                 //     icon: 'CheckSquare',
                        //                 //     url: '/hrms/leave-management/transaction/comp-off-approval',
                        //                 //     title: 'Comp Off Approval',
                        //                 //     description: 'Approve Compensatory Off'
                        //                 // },
                        //                 // {
                        //                 //     id: 3,
                        //                 //     name: 'Comp Off Request',
                        //                 //     icon: 'FileText',
                        //                 //     url: '/hrms/leave-management/transaction/comp-off-request',
                        //                 //     title: 'Comp Off Request',
                        //                 //     description: 'Request Compensatory Off'
                        //                 // },
                        //                 {
                        //                     id: 4,
                        //                     name: 'Leave Credit Details',
                        //                     icon: 'Info',
                        //                     url: '/hrms/leave-management/transaction/leave-credit-details',
                        //                     title: 'Leave  Details',
                        //                     description: 'View Leave Credit Details'
                        //                 },
                        //                 {
                        //                     id: 5,
                        //                     name: 'Leave Transaction',
                        //                     icon: 'List',
                        //                     url: '/hrms/leave-management/transaction/leave-credit-transaction',
                        //                     title: 'Leave Transaction',
                        //                     description: 'Leave Transaction'
                        //                 },
                        //                 {
                        //                     id: 6,
                        //                     name: 'Leave Opening Balance',
                        //                     icon: 'Database',
                        //                     url: '/hrms/leave-management/transaction/leave-opening-balance',
                        //                     title: 'Leave Opening Balance',
                        //                     description: 'Manage Leave Opening Balance'
                        //                 },
                        //                 {
                        //                     id: 7,
                        //                     name: 'Admin On Duty Apply',
                        //                     icon: 'Briefcase',
                        //                     url: '/hrms/leave-management/transaction/admin-on-duty-apply',
                        //                     title: 'Admin On Duty Apply',
                        //                     description: 'Apply for On Duty Leave'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 4,
                        //             name: 'Report',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Leave Report',
                        //                     icon: 'FileSearch',
                        //                     url: '/hrms/leave-management/reports/leave-report',
                        //                     title: 'Leave Report',
                        //                     description: 'Leave Summary Report'
                        //                 }
                        //                 // {
                        //                 //     id: 2,
                        //                 //     name: 'Overall Report',
                        //                 //     icon: 'BarChart3',
                        //                 //     url: '/hrms/leave-management/reports/overAll-report',
                        //                 //     title: 'Overall Report',
                        //                 //     description: 'Overall Leave Analysis'
                        //                 // },
                        //                 // {
                        //                 //     id: 3,
                        //                 //     name: 'Unauthorized Leave Report',
                        //                 //     icon: 'AlertTriangle',
                        //                 //     url: '/hrms/leave-management/reports/unauthorizedLeaveCount-report',
                        //                 //     title: 'Unauthorized Leave Report',
                        //                 //     description: 'Unauthorized Leave Count'
                        //                 // }
                        //             ]
                        //         }
                        //     ]
                        // }

                        {
                            id: 405,
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
                                    id: 4,
                                    name: 'Leave Config',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Leave Configuration',
                                            icon: 'CheckSquare',
                                            url: '/hrms/leave-management/leave-Configuration',
                                            title: 'Leave Configuration',
                                            description: 'Leave Configuration'
                                        }
                                    ]
                                },
                                // {
                                //     id: 2,
                                //     name: 'Apply Leave',
                                //     icon: 'FileText',
                                //     pages: [
                                //         {
                                //             id: 1,
                                //             name: 'Apply Leave',
                                //             icon: 'FilePlus',
                                //             url: '/hrms/leave-management/apply-leave',
                                //             title: 'Apply Leave',
                                //             description: 'Submit Leave Application'
                                //         }
                                //         // {
                                //         //     id: 2,
                                //         //     name: 'Leave Approval',
                                //         //     icon: 'CheckCircle',
                                //         //     url: '/hrms/leave-management/leave-approval',
                                //         //     title: 'Leave Approval',
                                //         //     description: 'Approve or Reject Leave Requests'
                                //         // }
                                //     ]
                                // },
                                // {
                                //     id: 2,
                                //     name: 'Apply Leave',
                                //     icon: 'FileText',
                                //     pages: [
                                //         {
                                //             id: 1,
                                //             name: 'Apply Leave',
                                //             icon: 'FilePlus',
                                //             url: '/hrms/leave-management/apply-leave',
                                //             title: 'Apply Leave',
                                //             description: 'Submit Leave Application'
                                //         },
                                //         // {
                                //         //     id: 2,
                                //         //     name: 'Leave Approval',
                                //         //     icon: 'CheckCircle',
                                //         //     url: '/hrms/leave-management/leave-approval',
                                //         //     title: 'Leave Approval',
                                //         //     description: 'Approve or Reject Leave Requests'
                                //         // }
                                //     ]
                                // },
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
                                        // {
                                        //     id: 4,
                                        //     name: 'Leave Credit Details',
                                        //     icon: 'Info',
                                        //     url: '/hrms/leave-management/transaction/leave-credit-details',
                                        //     title: 'Leave  Details',
                                        //     description: 'View Leave Credit Details'
                                        // },
                                        {
                                            id: 4,
                                            name: 'Leave Credit Details',
                                            icon: 'Info',
                                            url: '/hrms/leave-management/transaction/leave-details',
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
                                        },
                                        {
                                            id: 7,
                                            name: 'Admin On Duty Apply',
                                            icon: 'Briefcase',
                                            url: '/hrms/leave-management/transaction/admin-on-duty-apply',
                                            title: 'Admin On Duty Apply',
                                            description: 'Apply for On Duty Leave'
                                        },
                                        {
                                            id: 8,
                                            name: 'Online Admin Leave',
                                            icon: 'Briefcase',
                                            url: '/hrms/leave-management/transaction/online-admin-leave',
                                            title: 'Online Admin Leave',
                                            description: 'Apply for On Duty Leave'
                                        }
                                    ]
                                },
                                {
                                    id: 5,
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
                                        },
                                        {
                                            id: 2,
                                            name: 'Leave Status Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/leave-management/reports/leave-status-report',
                                            title: 'Leave Status Report',
                                            description: 'Leave Status Report'
                                        },
                                        {
                                            id: 3,
                                            name: 'Late Leave Report',
                                            icon: 'FileSearch',
                                            url: '/hrms/leave-management/reports/LateLeave',
                                            title: 'Late Leave Report',
                                            description: 'Late Leave Report'
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
                        //     id: 4,
                        //     name: 'Leave Management',
                        //     icon: 'Calendar',
                        //     sub_menu: [
                        //         {
                        //             id: 1,
                        //             name: 'Masters',
                        //             icon: 'Database',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Master Leave',
                        //                     icon: 'Calendar',
                        //                     url: '/hrms/leave-management/masters/master-leave',
                        //                     title: 'Master Leave',
                        //                     description: 'Manage Leave Types'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Leave Authorization',
                        //                     icon: 'Shield',
                        //                     url: '/hrms/leave-management/masters/leave-authorization',
                        //                     title: 'Leave Authorization',
                        //                     description: 'Configure Leave Approvers'
                        //                 }
                        //                 // {
                        //                 //     id: 3,
                        //                 //     name: 'Master Leave Year',
                        //                 //     icon: 'CalendarRange',
                        //                 //     url: '/hrms/leave-management/masters/master-leaveYear',
                        //                 //     title: 'Master Leave Year',
                        //                 //     description: 'Manage Leave Year'
                        //                 // }
                        //             ]
                        //         },
                        //         {
                        //             id: 4,
                        //             name: 'Leave Config',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Leave Configuration',
                        //                     icon: 'CheckSquare',
                        //                     url: '/hrms/leave-management/leave-Configuration',
                        //                     title: 'Leave Configuration',
                        //                     description: 'Leave Configuration'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 2,
                        //             name: 'Apply Leave',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Apply Leave',
                        //                     icon: 'FilePlus',
                        //                     url: '/hrms/leave-management/apply-leave',
                        //                     title: 'Apply Leave',
                        //                     description: 'Submit Leave Application'
                        //                 },
                        //                 {
                        //                     id: 2,
                        //                     name: 'Leave Approval',
                        //                     icon: 'CheckCircle',
                        //                     url: '/hrms/leave-management/leave-approval',
                        //                     title: 'Leave Approval',
                        //                     description: 'Approve or Reject Leave Requests'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 3,
                        //             name: 'Transaction',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Leave Transfer',
                        //                     icon: 'Plus',
                        //                     url: '/hrms/leave-management/transaction/leave-transfer',
                        //                     title: 'Leave Transfer',
                        //                     description: 'Transfer Leave'
                        //                 },
                        //                 // {
                        //                 //     id: 2,
                        //                 //     name: 'Comp Off Approval',
                        //                 //     icon: 'CheckSquare',
                        //                 //     url: '/hrms/leave-management/transaction/comp-off-approval',
                        //                 //     title: 'Comp Off Approval',
                        //                 //     description: 'Approve Compensatory Off'
                        //                 // },
                        //                 // {
                        //                 //     id: 3,
                        //                 //     name: 'Comp Off Request',
                        //                 //     icon: 'FileText',
                        //                 //     url: '/hrms/leave-management/transaction/comp-off-request',
                        //                 //     title: 'Comp Off Request',
                        //                 //     description: 'Request Compensatory Off'
                        //                 // },
                        //                 // {
                        //                 //     id: 4,
                        //                 //     name: 'Leave Credit Details',
                        //                 //     icon: 'Info',
                        //                 //     url: '/hrms/leave-management/transaction/leave-credit-details',
                        //                 //     title: 'Leave  Details',
                        //                 //     description: 'View Leave Credit Details'
                        //                 // },
                        //                 {
                        //                     id: 5,
                        //                     name: 'Leave Transaction',
                        //                     icon: 'List',
                        //                     url: '/hrms/leave-management/transaction/leave-credit-transaction',
                        //                     title: 'Leave Transaction',
                        //                     description: 'Leave Transaction'
                        //                 },
                        //                 {
                        //                     id: 6,
                        //                     name: 'Leave Opening Balance',
                        //                     icon: 'Database',
                        //                     url: '/hrms/leave-management/transaction/leave-opening-balance',
                        //                     title: 'Leave Opening Balance',
                        //                     description: 'Manage Leave Opening Balance'
                        //                 },
                        //                 {
                        //                     id: 7,
                        //                     name: 'Admin On Duty Apply',
                        //                     icon: 'Briefcase',
                        //                     url: '/hrms/leave-management/transaction/admin-on-duty-apply',
                        //                     title: 'Admin On Duty Apply',
                        //                     description: 'Apply for On Duty Leave'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             id: 5,
                        //             name: 'Report',
                        //             icon: 'FileText',
                        //             pages: [
                        //                 {
                        //                     id: 1,
                        //                     name: 'Leave Report',
                        //                     icon: 'FileSearch',
                        //                     url: '/hrms/leave-management/reports/leave-report',
                        //                     title: 'Leave Report',
                        //                     description: 'Leave Summary Report'
                        //                 }
                        //                 // {
                        //                 //     id: 2,
                        //                 //     name: 'Overall Report',
                        //                 //     icon: 'BarChart3',
                        //                 //     url: '/hrms/leave-management/reports/overAll-report',
                        //                 //     title: 'Overall Report',
                        //                 //     description: 'Overall Leave Analysis'
                        //                 // },
                        //                 // {
                        //                 //     id: 3,
                        //                 //     name: 'Unauthorized Leave Report',
                        //                 //     icon: 'AlertTriangle',
                        //                 //     url: '/hrms/leave-management/reports/unauthorizedLeaveCount-report',
                        //                 //     title: 'Unauthorized Leave Report',
                        //                 //     description: 'Unauthorized Leave Count'
                        //                 // }
                        //             ]
                        //         }
                        //     ]
                        // }

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
                },
                {
                    id: 50005,
                    name: 'AI Edge',
                    icon: 'Sparkles',
                    menu: [
                        {
                            id: 1,
                            name: 'AI Edge',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'AI Tools',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Question Paper Generator',
                                            icon: 'FileText',
                                            url: '/iframe/ai-question-paper-generator',
                                            title: 'AI Question Paper Generator',
                                            description: 'Generate question papers from textbooks using AI'
                                        },
                                        {
                                            id: 2,
                                            name: 'AI Notemaker',
                                            icon: 'FileText',
                                            url: '/iframe/ai-notemaker',
                                            title: 'AI Notemaker',
                                            description: 'Summarize and create structured notes from textbooks using AI'
                                        },
                                        {
                                            id: 3,
                                            name: 'AI Performance Analysis',
                                            icon: 'BarChart',
                                            url: '/Exam/exam-module/ai-performance-analysis',
                                            title: 'AI Performance Analysis',
                                            description: 'Analyze performance metrics and AI-driven insights'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 9001,
                    name: 'Visual Insights',
                    icon: 'bar-chart-3',
                    menu: [
                        {
                            id: 1,
                            name: 'Visual Insights',
                            icon: 'bar-chart-3',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Visual Insights Tools',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Custom Templates',
                                            icon: 'FileText',
                                            url: '/visual-insights/custom-templates',
                                            title: 'Custom Templates',
                                            description: 'Create and manage custom templates for visual insights'
                                        },
                                        {
                                            id: 2,
                                            name: 'Statistical Analysis',
                                            icon: 'FileText',
                                            url: '/visual-insights/statistics-graphs',
                                            title: 'Statistical Analysis',
                                            description: 'Analyze data and generate statistical insights'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 120012,
                    name: 'Alumni',
                    icon: 'GraduationCap',
                    menu: [
                        {
                            id: 1,
                            name: 'Alumni Module',
                            icon: 'School',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Transactions',
                                    icon: 'ArrowRightLeft',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Alumni Dashboard',
                                            icon: 'LayoutDashboard',
                                            url: '/alumni/alumni-module/transactions/alumni-dashboard',
                                            title: 'Alumni Dashboard',
                                            description: 'Alumni Portal Dashboard'
                                        },
                                        {
                                            id: 13,
                                            name: 'Alumni Details',
                                            icon: 'UserRoundCog',
                                            url: '/alumni/alumni-module/transactions/alumni-details',
                                            title: 'Alumni Details',
                                            description: 'Manage Alumni Details and Profile'
                                        },
                                        {
                                            id: 2,
                                            name: 'Alumni NoticeBoard',
                                            icon: 'Megaphone',
                                            url: '/alumni/alumni-module/transactions/alumni-noticeboard',
                                            title: 'Alumni NoticeBoard',
                                            description: 'Manage Alumni NoticeBoard Details'
                                        },
                                        {
                                            id: 3,
                                            name: 'Alumni Gallery',
                                            icon: 'Images',
                                            url: '/alumni/alumni-module/transactions/alumni-gallery',
                                            title: 'Alumni Gallery',
                                            description: 'Manage Alumni Gallery Details'
                                        },
                                        // {
                                        //     id: 4,
                                        //     name: 'Alumni Interactions',
                                        //     icon: 'MessagesSquare',
                                        //     url: '/alumni/alumni-module/transactions/alumni-interactions',
                                        //     title: 'Alumni Interactions',
                                        //     description: 'Manage Alumni Interaction Details'
                                        // },
                                        {
                                            id: 5,
                                            name: 'Alumni Friend Request',
                                            icon: 'UserRoundPlus',
                                            url: '/alumni/alumni-module/transactions/alumni-friend-request',
                                            title: 'Alumni Friend Request',
                                            description: 'Manage Alumni Friend Request Details'
                                        },
                                        {
                                            id: 6,
                                            name: 'Alumni Friend Request Accept',
                                            icon: 'UserRoundCheck',
                                            url: '/alumni/alumni-module/transactions/alumni-friend-request-accept',
                                            title: 'Alumni Friend Request Accept',
                                            description: 'Manage Alumni Friend Request Accept Details'
                                        },
                                        // {
                                        //     id: 7,
                                        //     name: 'Alumni Donation',
                                        //     icon: 'HeartHandshake',
                                        //     url: '/alumni/alumni-module/transactions/alumni-donation',
                                        //     title: 'Alumni Donation',
                                        //     description: 'Manage Alumni Donation Details'
                                        // },
                                        {
                                            id: 8,
                                            name: 'Alumni Letters',
                                            icon: 'MailOpen',
                                            url: '/alumni/alumni-module/transactions/alumni-letters',
                                            title: 'Alumni Letters',
                                            description: 'Generate Alumni Letters'
                                        },
                                        // {
                                        //     id: 9,
                                        //     name: 'CLG Alumni Approval',
                                        //     icon: 'UserCheck',
                                        //     url: '/alumni/alumni-module/transactions/clg-alumni-approval',
                                        //     title: 'CLG Alumni Approval',
                                        //     description: 'Approve College Alumni Registrations'
                                        // },
                                        // {
                                        //     id: 10,
                                        //     name: 'CLG Student Search',
                                        //     icon: 'Search',
                                        //     url: '/alumni/alumni-module/transactions/clg-alumni-student-search',
                                        //     title: 'CLG Student Search',
                                        //     description: 'Search College Alumni Students'
                                        // },
                                        {
                                            id: 11,
                                            name: 'User Password Creation',
                                            icon: 'KeyRound',
                                            url: '/alumni/alumni-module/transactions/user-password-creation',
                                            title: 'User Password Creation',
                                            description: 'Generate Usernames and Passwords'
                                        },
                                        {
                                            id: 12,
                                            name: 'Student Password Creation',
                                            icon: 'LockKeyhole',
                                            url: '/alumni/alumni-module/transactions/student-password-creation',
                                            title: 'Student Password Creation',
                                            description: 'Student Credentials Management'
                                        },
                                        {
                                            id: 14,
                                            name: 'COE Events',
                                            icon: 'CalendarClock',
                                            url: '/alumni/alumni-module/transactions/coe-events',
                                            title: 'COE Events',
                                            description: 'COE Events Management'
                                        }
                                        // ,
                                        // {
                                        //     id: 15,
                                        //     name: 'Student Birthday Wishes',
                                        //     icon: 'Cake',
                                        //     url: '/alumni/alumni-module/transactions/student-birthday-wishes',
                                        //     title: 'Student Birthday Wishes',
                                        //     description: 'Student Birthday Wishes Management'
                                        // }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Reports',
                                    icon: 'BarChart3',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Alumni Search',
                                            icon: 'UserSearch',
                                            url: '/alumni/alumni-module/reports/alumni-search',
                                            title: 'Alumni Search',
                                            description: 'Dynamic Alumni Search Report'
                                        },
                                        {
                                            id: 2,
                                            name: 'Alumni Report',
                                            icon: 'FilePieChart',
                                            url: '/alumni/alumni-module/reports/alumni-report',
                                            title: 'Alumni Report',
                                            description: 'Comprehensive Alumni Report and Address Book'
                                        }
                                        // ,
                                        // {
                                        //     id: 3,
                                        //     name: 'Alumni Student Birthday Report',
                                        //     icon: 'Cake',
                                        //     url: '/alumni/alumni-module/reports/alumni-student-birthday-report',
                                        //     title: 'Alumni Student Birthday Report',
                                        //     description: 'Report of student birthdays in alumni community'
                                        // }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 80008,
                    name: 'Hostel Management',
                    icon: 'Home',
                    menu: [
                        {
                            id: 1,
                            name: 'Master',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Facility',
                                            icon: 'Wifi',
                                            url: '/hostel/hostel-management/masters/master-facility',
                                            title: 'Master Facility',
                                            description: 'Manage Hostel Facilities'
                                        },
                                        {
                                            id: 7,
                                            name: 'Master Mess',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/master-mess',
                                            title: 'Master Mess',
                                            description: 'Manage Mess Details'
                                        },
                                        {
                                            id: 3,
                                            name: 'Master Mess Category',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/master-mess-category',
                                            title: 'Master Mess Category',
                                            description: 'Manage Mess Category Mapping'
                                        },
                                        {
                                            id: 2,
                                            name: 'Master Hostel',
                                            icon: 'Building',
                                            url: '/hostel/hostel-management/masters/master-hostel',
                                            title: 'Master Hostel',
                                            description: 'Manage Hostel Details'
                                        },
                                        {
                                            id: 4,
                                            name: 'Master Floor',
                                            icon: 'Layers',
                                            url: '/hostel/hostel-management/masters/master-floor',
                                            title: 'Master Floor',
                                            description: 'Manage Floor Details'
                                        },
                                        {
                                            id: 5,
                                            name: 'Master Room',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/master-room',
                                            title: 'Master Room',
                                            description: 'Manage Room Details'
                                        },
                                        {
                                            id: 6,
                                            name: 'Master Bed',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/master-bed',
                                            title: 'Master Bed',
                                            description: 'Manage Bed Details'
                                        },

                                        {
                                            id: 8,
                                            name: 'Mess Menu',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/mess-menu',
                                            title: 'Mess Menu',
                                            description: 'Manage Mess Menu Details'
                                        },
                                        {
                                            id: 9,
                                            name: 'Room Category',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/room-category',
                                            title: 'Room Category',
                                            description: 'Manage Room Categories'
                                        },
                                        {
                                            id: 10,
                                            name: 'Room Tariff',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/masters/room-tariff',
                                            title: 'Room Tariff',
                                            description: 'Manage Room Tariffs'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'Repeat',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Student Request',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/transactions/student-request',
                                            title: 'Student Request',
                                            description: 'Student Hostel Request'
                                        },
                                        {
                                            id: 2,
                                            name: 'Student Request Confirm',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/transactions/student-request-confirm',
                                            title: 'Student Request Confirm',
                                            description: 'Confirm Student Requests'
                                        },
                                        {
                                            id: 3,
                                            name: 'Hostel Allotment For Student',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/transactions/student-allotment',
                                            title: 'Hostel Allotment For Student',
                                            description: 'Allot Hostel for Student'
                                        },
                                        {
                                            id: 4,
                                            name: 'Hostel Vacate',
                                            icon: 'LogOut',
                                            url: '/hostel/hostel-management/transactions/vacate-room',
                                            title: 'Hostel Vacate',
                                            description: 'Vacate Hostel Room'
                                        },
                                        // {
                                        //     id: 5,
                                        //     name: 'College Hostel Allotment',
                                        //     icon: 'Building',
                                        //     url: '/hostel/hostel-management/transactions/college-student-allotment',
                                        //     title: 'College Hostel Allotment',
                                        //     description: 'Allot Hostel for College Student'
                                        // },
                                        // {
                                        //     id: 6,
                                        //     name: 'College Hostel Vacate',
                                        //     icon: 'LogOut',
                                        //     url: '/hostel/hostel-management/transactions/college-vacate-room',
                                        //     title: 'College Hostel Vacate',
                                        //     description: 'Vacate College Hostel Room'
                                        // },
                                        // {
                                        //     id: 7,
                                        //     name: 'College Gate Pass',
                                        //     icon: 'CreditCard',
                                        //     url: '/hostel/hostel-management/transactions/college-gatepass',
                                        //     title: 'College Gate Pass',
                                        //     description: 'Manage College Gate Pass'
                                        // },
                                        {
                                            id: 8,
                                            name: 'Staff Request',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/transactions/staff-request',
                                            title: 'Staff Request',
                                            description: 'Staff Hostel Request'
                                        },
                                        // {
                                        //     id: 9,
                                        //     name: 'Staff Request Confirm',
                                        //     icon: 'CheckSquare',
                                        //     url: '/hostel/hostel-management/transactions/staff-request-confirm',
                                        //     title: 'Staff Request Confirm',
                                        //     description: 'Confirm Staff Requests'
                                        // },
                                        {
                                            id: 10,
                                            name: 'Hostel Allotment For Staff',
                                            icon: 'User',
                                            url: '/hostel/hostel-management/transactions/staff-allotment',
                                            title: 'Hostel Allotment For Staff',
                                            description: 'Allot Hostel for Staff'
                                        },
                                        {
                                            id: 11,
                                            name: 'Hostel Allotment For Guest',
                                            icon: 'UserPlus',
                                            url: '/hostel/hostel-management/transactions/guest-allotment',
                                            title: 'Hostel Allotment For Guest',
                                            description: 'Allot Hostel for Guest'
                                        },
                                        {
                                            id: 12,
                                            name: 'Room Transfer',
                                            icon: 'Home',
                                            url: '/hostel/hostel-management/transactions/room-transfer',
                                            title: 'Room Transfer',
                                            description: 'Transfer Room'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'BarChart',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Hostel Allotment Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/allotment-report',
                                            title: 'Hostel Allotment Report',
                                            description: 'View Alotment Report'
                                        },
                                        {
                                            id: 2,
                                            name: 'Hostel Confirm Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/confirm-report',
                                            title: 'Hostel Confirm Report',
                                            description: 'View Confirm Report'
                                        },
                                        {
                                            id: 3,
                                            name: 'Hostel Request Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/request-report',
                                            title: 'Hostel Request Report',
                                            description: 'View Request Report'
                                        },
                                        {
                                            id: 4,
                                            name: 'Hostel Vacate Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/vacate-report',
                                            title: 'Hostel Vacate Report',
                                            description: 'View Vacate Report'
                                        },
                                        {
                                            id: 5,
                                            name: 'Student Gatepass Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/student-gatepass-report',
                                            title: 'Student Gatepass Report',
                                            description: 'View Student Gatepass Report'
                                        },
                                        {
                                            id: 6,
                                            name: 'Student Attendance Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/student-attendance-report',
                                            title: 'Student Attendance Report',
                                            description: 'View Student Attendance Report'
                                        },
                                        {
                                            id: 7,
                                            name: 'Food Conveyance Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/food-conveyance-report',
                                            title: 'Food Conveyance Report',
                                            description: 'View Food Conveyance Report'
                                        },
                                        {
                                            id: 8,
                                            name: 'College Allotment Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/college-allotment-report',
                                            title: 'College Allotment Report',
                                            description: 'View College Allotment Report'
                                        },
                                        {
                                            id: 9,
                                            name: 'College Confirm Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/college-confirm-report',
                                            title: 'College Confirm Report',
                                            description: 'View College Confirm Report'
                                        },
                                        {
                                            id: 10,
                                            name: 'College Request Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/college-request-report',
                                            title: 'College Request Report',
                                            description: 'View College Request Report'
                                        },
                                        {
                                            id: 11,
                                            name: 'College Vacate Report',
                                            icon: 'FileText',
                                            url: '/hostel/hostel-management/reports/college-vacate-report',
                                            title: 'College Vacate Report',
                                            description: 'View College Vacate Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                {
                    id: 150015,
                    name: 'Visitor Management',
                    icon: 'Users',
                    menu: [
                        {
                            id: 1,
                            name: 'Transactions',
                            icon: 'FileText',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Visitor Transactions',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Add Visitor',
                                            icon: 'UserPlus',
                                            url: '/visitors-management/transactions/add-visitor',
                                            title: 'Add Visitor',
                                            description: 'Add New Visitor'
                                        },
                                        {
                                            id: 2,
                                            name: 'Visitor Appointment',
                                            icon: 'CalendarDays',
                                            url: '/visitors-management/transactions/visitor-appointment',
                                            title: 'Visitor Appointment',
                                            description: 'Schedule Visitor Appointment'
                                        },
                                        {
                                            id: 3,
                                            name: 'Inward Entry',
                                            icon: 'ArrowDownLeft',
                                            url: '/visitors-management/transactions/inward',
                                            title: 'Inward Entry',
                                            description: 'Manage Visitor Inward Entry'
                                        },
                                        {
                                            id: 4,
                                            name: 'Outward Entry',
                                            icon: 'ArrowUpRight',
                                            url: '/visitors-management/transactions/outward',
                                            title: 'Outward Entry',
                                            description: 'Manage Visitor Outward Entry'
                                        },
                                        {
                                            id: 5,
                                            name: 'Gate Pass',
                                            icon: 'Ticket',
                                            url: '/visitors-management/transactions/gate-pass',
                                            title: 'Gate Pass',
                                            description: 'Generate Visitor Gate Pass'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 2,
                            name: 'Masters',
                            icon: 'Database',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Visitor Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Location',
                                            icon: 'MapPin',
                                            url: '/visitors-management/masters/location',
                                            title: 'Master Location',
                                            description: 'Manage Visitor Locations'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Reports',
                            icon: 'BarChart3',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Visitor Reports',
                                    icon: 'BarChart3',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Visitor Report',
                                            icon: 'FileBarChart',
                                            url: '/visitors-management/reports/visitor-report',
                                            title: 'Visitor Report',
                                            description: 'View Visitor Reports'
                                        },
                                        {
                                            id: 2,
                                            name: 'Gate Pass Report',
                                            icon: 'FileText',
                                            url: '/visitors-management/reports/gate-pass-report',
                                            title: 'Gate Pass Report',
                                            description: 'View Gate Pass Reports'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // {
                //     id: 25,
                //     name: 'COE',
                //     icon: 'Settings',
                //     menu: [
                //         {
                //             id: 1,
                //             name: 'Calendar of Events',
                //             icon: 'Settings',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Master',
                //                     icon: 'Settings',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Master Event',
                //                             icon: 'Settings',
                //                             url: '/coe/master/masterevent',
                //                             title: 'Master Event',
                //                             description: 'Manage Master Event Details'
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     id: 2,
                //                     name: 'Report',
                //                     icon: 'Settings',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'COE Report',
                //                             icon: 'Settings',
                //                             url: '/coe/report/coereport',
                //                             title: 'COE Report',
                //                             description: 'Manage COE Report'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'COE Month End Report',
                //                             icon: 'Settings',
                //                             url: '/coe/report/coemonthendreport',
                //                             title: 'COE Month End Report',
                //                             description: 'Manage COE Month End Report'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // },

                {
                    id: 26,
                    name: 'UPLOAD',
                    icon: 'Upload',
                    menu: [
                        {
                            id: 1,
                            name: 'Upload',
                            icon: 'Upload',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Transaction',
                                    icon: 'Repeat',
                                    pages: [
                                        {
                                            id: 221,
                                            name: 'ClassWork',
                                            icon: 'BookOpen',
                                            url: '/upload/transactions/ivrm-classwork',
                                            title: 'ClassWork',
                                            description: 'Manage ClassWork'
                                        },
                                        {
                                            id: 222,
                                            name: 'Verify Class Work',
                                            icon: 'CheckCircle',
                                            url: '/upload/transactions/ClassWork_Marks_Enter',
                                            title: 'Verify Class Work',
                                            description: 'Verify and Enter Class Work Marks'
                                        },
                                        {
                                            id: 223,
                                            name: 'HomeWork',
                                            icon: 'BookOpen',
                                            url: '/upload/transactions/ivrm-homework',
                                            title: 'HomeWork',
                                            description: 'Manage IVRM HomeWork'
                                        },
                                        {
                                            id: 224,
                                            name: 'HomeWork Marks Update',
                                            icon: 'CheckCircle',
                                            url: '/upload/transactions/HomeWork_Marks_Enter',
                                            title: 'Verify HomeWork',
                                            description: 'Verify HomeWork Marks'
                                        },
                                        {
                                            id: 225,
                                            name: 'Upload Notice Board',
                                            icon: 'BookOpen',
                                            url: '/upload/transactions/notice-board',
                                            title: 'Upload Notice Board',
                                            description: 'Upload Notice Board'
                                        },
                                        {
                                            id: 226,
                                            name: 'Push Notification',
                                            icon: 'BookOpen',
                                            url: '/upload/transactions/push-notification',
                                            title: 'Push Notification',
                                            description: 'Push Notification'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Report',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'ClassWork Upload Report',
                                            icon: 'FileText',
                                            url: '/upload/reports/classwork-upload-report',
                                            title: 'ClassWork Upload Report',
                                            description: 'ClassWork Upload Report Details'
                                        },
                                        {
                                            id: 2,
                                            name: 'HomeWork Upload Report',
                                            icon: 'FileText',
                                            url: '/upload/reports/homework-upload-report',
                                            title: 'HomeWork Upload Report',
                                            description: 'HomeWork Upload Report Details'
                                        },
                                        {
                                            id: 3,
                                            name: 'NoticeBoard Report',
                                            icon: 'FileText',
                                            url: '/upload/reports/noticeboard-report',
                                            title: 'NoticeBoard Report',
                                            description: 'NoticeBoard Report Details'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // {
                //     id: 27,

                //     name: 'BirthDay',

                //     icon: 'Settings',

                //     menu: [
                //         {
                //             id: 1,

                //             name: 'BirthDay',

                //             icon: 'Settings',

                //             sub_menu: [
                //                 {
                //                     id: 1,

                //                     name: 'Master',

                //                     icon: 'Settings',

                //                     pages: [
                //                         {
                //                             id: 1,

                //                             name: 'BirthDay',

                //                             icon: 'Settings',

                //                             url: '/birthday/master/masterbirthday',

                //                             title: 'Master BirthDay',

                //                             description: 'Manage Master BirthDay Details'
                //                         }
                //                     ]
                //                 },

                //                 {
                //                     id: 2,

                //                     name: 'Report',

                //                     icon: 'Settings',

                //                     pages: [
                //                         {
                //                             id: 1,

                //                             name: 'Student BirthDay Report',

                //                             icon: 'Settings',

                //                             url: '/birthday/report/studentbirthdayreport',

                //                             title: 'Student BirthDay Report',

                //                             description: 'Manage Student BirthDay Report'
                //                         },

                //                         {
                //                             id: 2,

                //                             name: 'Staff BirthDay Report',

                //                             icon: 'Settings',

                //                             url: '/birthday/report/staffbirthdayreport',

                //                             title: 'Staff BirthDay Report',

                //                             description: 'Manage Staff BirthDay Report'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // },

                {
                    id: 60006,
                    name: 'Time Table',
                    icon: 'Clock',
                    menu: [
                        {
                            id: 1,
                            name: 'Time Table',
                            icon: 'Clock',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Clock',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Day',
                                            icon: 'Clock',
                                            url: '/timetable/masters/masterday',
                                            title: 'Master Day',
                                            description: 'Manage Master Day Details'
                                        },
                                        {
                                            id: 9,
                                            name: 'Master Day Class Wise',
                                            icon: 'Clock',
                                            url: '/timetable/masters/masterdayclasswise',
                                            title: 'Master Day Class Wise',
                                            description: 'Manage Master Day Class Wise Details'
                                        },
                                        {
                                            id: 2,
                                            name: 'Master Building',
                                            icon: 'Clock',
                                            url: '/timetable/masters/masterbuilding',
                                            title: 'Master Building',
                                            description: 'Manage Master Building Details'
                                        },
                                        {
                                            id: 11111111,
                                            name: 'Master Building Class Section',
                                            icon: 'Clock',
                                            url: '/timetable/masters/masterbuildingclasssection',
                                            title: 'Master Building Class Section',
                                            description: 'Manage Master Building Class Section Details'
                                        },
                                        {
                                            id: 3,
                                            name: 'Staff Abbreviation',
                                            icon: 'Clock',
                                            url: '/timetable/masters/staffabbreviations',
                                            title: 'Staff Abbreviation',
                                            description: 'Manage Staff Abbreviation Details'
                                        },
                                        {
                                            id: 4,
                                            name: 'Subject Abbreviation',
                                            icon: 'Clock',
                                            url: '/timetable/masters/subjectabbreviations',
                                            title: 'Subject Abbreviation',
                                            description: 'Manage Subject Abbreviation Details'
                                        },
                                        {
                                            id: 5,
                                            name: 'Category Class Mapping',
                                            icon: 'Clock',
                                            url: '/timetable/masters/categoryclassmapping',
                                            title: 'Category Class Mapping',
                                            description: 'Manage Category Class Mapping Details'
                                        },
                                        {
                                            id: 6,
                                            name: 'Master Category',
                                            icon: 'Clock',
                                            url: '/timetable/masters/mastercategory',
                                            title: 'Master Category',
                                            description: 'Manage Master Category Details'
                                        },
                                        {
                                            id: 7,
                                            name: 'Master Break Time Settings',
                                            icon: 'Clock',
                                            url: '/timetable/masters/breaktimesettings',
                                            title: 'Master Break Time Settings',
                                            description: 'Manage Master Break Time Settings Details'
                                        },
                                        {
                                            id: 8,
                                            name: 'Master Period',
                                            icon: 'Clock',
                                            url: '/timetable/masters/masterperiod',
                                            title: 'Master Period',
                                            description: 'Manage Master Period Details'
                                        },

                                        {
                                            id: 10,
                                            name: 'Period Distribution',
                                            icon: 'Clock',
                                            url: '/timetable/masters/perioddistribution',
                                            title: 'Period Distribution',
                                            description: 'Manage Period Distribution Details'
                                        },
                                        {
                                            id: 11,
                                            name: 'Period Allocation Master Period',
                                            icon: 'Clock',
                                            url: '/timetable/masters/periodallocationmasterperiod',
                                            title: 'Period Allocation Master Period',
                                            description: 'Manage Period Allocation Master Period Details'
                                        },
                                        {
                                            id: 12,
                                            name: 'Master Period Class',
                                            icon: 'Clock',
                                            url: '/timetable/masters/masterperiodclass',
                                            title: 'Master Period Class',
                                            description: 'Manage Master Period Class Details'
                                        },

                                        {
                                            id: 13,
                                            name: 'Period Time Setting',
                                            icon: 'Clock',
                                            url: '/timetable/masters/periodtimesetting',
                                            title: 'Period Time Setting',
                                            description: 'Manage Period Time Settings'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Constraints',
                                    icon: 'Clock',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Bifurcation Constraints',
                                            icon: 'Clock',
                                            url: '/timetable/constraints/bifurcationconstraints',
                                            title: 'Bifurcation Constraints',
                                            description: 'Manage Bifurcation Constraints Details'
                                        },
                                        {
                                            id: 2,
                                            name: 'consecutive',
                                            icon: 'Clock',
                                            url: '/timetable/constraints/consecutive',
                                            title: 'Consecutive Constraints',
                                            description: 'Manage Consecutive Constraints Details'
                                        },
                                        {
                                            id: 3,
                                            name: 'Fixing',
                                            icon: 'Clock',
                                            url: '/timetable/constraints/fixing',
                                            title: 'Fixing Constraints',
                                            description: 'Manage Fixing Constraints Details'
                                        },
                                        {
                                            id: 4,
                                            name: 'Lab Constraints',
                                            icon: 'Clock',
                                            url: '/timetable/constraints/labconstraints',
                                            title: 'Lab Constraints',
                                            description: 'Manage Lab Constraints Details'
                                        },
                                        {
                                            id: 5,
                                            name: 'Subject Restrictions',
                                            icon: 'Clock',
                                            url: '/timetable/constraints/subjectrestriction',
                                            title: 'Subject Restrictions',
                                            description: 'Manage Subject Restrictions Details'
                                        }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Transactions',
                                    icon: 'Clock',
                                    pages: [
                                        {
                                            id: 2,
                                            name: 'Deputation',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/deputation',
                                            title: 'Deputation',
                                            description: 'ABSENT STAFF ALLOTMENT DETAILS'
                                        },
                                        {
                                            id: 3,
                                            name: 'Manual Period Insertion',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/manual-Period-insersion',
                                            title: 'Manual Period Insertion',
                                            description: 'ABSENT STAFF ALLOTMENT DETAILS'
                                        },
                                        {
                                            id: 4,
                                            name: 'Staff Period Transfer',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/staff-Periods-Transfer',
                                            title: 'Staff Period Transfer',
                                            description: 'Transfer Staff Periods Between Classes and Sections'
                                        },
                                        {
                                            id: 5,
                                            name: 'Staff Replacement Existing To New',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/staff-replacement-existing-to-new',
                                            title: 'Staff Replacement Existing To New',
                                            description: 'Replacing staff Existing To New'
                                        },
                                        {
                                            id: 6,
                                            name: 'Staff Replacement In Their TimeTable',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/staff-replacement-In-their-timeTable',
                                            title: 'Staff Replacement In Their TimeTable',
                                            description: 'Staff Replacement In Their TimeTable'
                                        },
                                        {
                                            id: 7,
                                            name: 'Staff Replacement In Unallocated Period',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/staff-replacement-in-unallocated-period',
                                            title: 'Staff Replacement In Unallocated Period',
                                            description: 'Staff Replacement In Unallocated Period'
                                        },
                                        {
                                            id: 8,
                                            name: 'Time Table Generation',
                                            icon: 'Clock',
                                            url: '/timetable/transactions/time-table-generation',
                                            title: 'Time Table Generation',
                                            description: 'Time Table Generation'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Reports',
                                    icon: 'Clock',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Consolidated Report',
                                            icon: 'Clock',
                                            url: '/timetable/reports/consolidated',
                                            title: 'Consolidated Report',
                                            description: 'TimeTable Consolidated Report'
                                        },
                                        // this is added form transaction to report
                                        {
                                            id: 2,
                                            name: 'Class Section Timetable Replacement',
                                            icon: 'Clock',
                                            url: '/timetable/reports/class-section-report',
                                            title: 'Staff Replacement For Class And Section',
                                            description: 'View and generate class-wise timetable grids'
                                        },
                                        {
                                            id: 3,
                                            name: 'Class Wise TimeTable',
                                            icon: 'Clock',
                                            url: '/timetable/reports/classwisett',
                                            title: 'Class Wise TimeTable',
                                            description: 'Class Wise TimeTable Report'
                                        },
                                        {
                                            id: 4,
                                            name: 'Subject Wise TimeTable',
                                            icon: 'Clock',
                                            url: '/timetable/reports/subjectwisett',
                                            title: 'Subject Wise TimeTable',
                                            description: 'Subject Wise TimeTable Report'
                                        },
                                        {
                                            id: 5,
                                            name: 'Staff Wise TimeTable',
                                            icon: 'Clock',
                                            url: '/timetable/reports/staffwisett',
                                            title: 'Staff Wise TimeTable',
                                            description: 'Staff Wise TimeTable Report'
                                        },
                                        {
                                            id: 6,
                                            name: 'Deputation Report',
                                            icon: 'Clock',
                                            url: '/timetable/reports/deputationreport',
                                            title: 'Deputation Report',
                                            description: 'Deputation Report'
                                        },
                                        {
                                            id: 7,
                                            name: 'Staff Wise Working Hours',
                                            icon: 'Clock',
                                            url: '/timetable/reports/stafWiseWorkingHours',
                                            title: 'Staff Wise Working Hours',
                                            description: 'Staff Wise Working Hours Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 70007,
                    name: 'Library',
                    icon: 'BookOpen',
                    menu: [
                        {
                            id: 1,
                            name: 'Library',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 3000,
                                    name: 'masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 30001,
                                            name: 'Master Library',
                                            icon: 'BookOpen',
                                            url: '/library/masters/masterlibrary',
                                            title: 'Master Library',
                                            description: 'Master Library  Details'
                                        },
                                        {
                                            id: 30002,
                                            name: 'Master Vendor',
                                            icon: 'BookOpen',
                                            url: '/library/masters/libraryvendor',
                                            title: 'Master Library Vendor',
                                            description: 'Library Vendor Details'
                                        },
                                        {
                                            id: 30003,
                                            name: 'Master Publisher',
                                            icon: 'BookOpen',
                                            url: '/library/masters/librarypublisher',
                                            title: 'Master Library Publisher',
                                            description: 'Library Master Publisher Details'
                                        },
                                        {
                                            id: 30004,
                                            name: 'Master Author',
                                            icon: 'BookOpen',
                                            url: '/library/masters/masterauthor',
                                            title: 'Master Author',
                                            description: 'Library Master Author Details'
                                        },

                                        {
                                            id: 30005,
                                            name: 'Master Subject',
                                            icon: 'BookOpen',
                                            url: '/library/masters/mastersubject',
                                            title: 'Add Master Subject',
                                            description: 'Add Master Subject'
                                        },

                                        {
                                            id: 30010,
                                            name: 'MASTER BOOKS CATEGORY ',
                                            icon: 'BookOpen',
                                            url: '/library/masters/mastercategory',
                                            title: 'MASTER BOOKS CATEGORY ',
                                            description: 'MASTER BOOKS CATEGORY '
                                        },

                                        {
                                            id: 30006,
                                            name: 'Master Language',
                                            icon: 'BookOpen',
                                            url: '/library/masters/masterlanguage',
                                            title: 'Master Language',
                                            description: 'Library Master Language Details'
                                        },

                                        {
                                            id: 30007,
                                            name: 'Master Accessories',
                                            icon: 'BookOpen',
                                            url: '/library/masters/accessories-master',
                                            title: 'Master Accessories',
                                            description: 'Master Accessories Details'
                                        },
                                        {
                                            id: 30008,
                                            name: 'Master Class Category',
                                            icon: 'BookOpen',
                                            url: '/library/masters/master-class-category',
                                            title: 'Master Class Category',
                                            description: 'Master Class Category Entry'
                                        },

                                        {
                                            id: 30009,
                                            name: 'Master Book Category',
                                            icon: 'BookOpen',
                                            url: '/library/masters/mastercategory',
                                            title: 'Master Book Category',
                                            description: 'Master Book Category Details'
                                        },

                                        {
                                            id: 30010,
                                            name: 'Master Department',
                                            icon: 'BookOpen',
                                            url: '/library/masters/department-master',
                                            title: 'Master Department',
                                            description: 'Master Department Details'
                                        },

                                        {
                                            id: 30011,
                                            name: 'Master Rack Details',
                                            icon: 'BookOpen',
                                            url: '/library/masters/master-rack-details',
                                            title: 'Master Rack Details',
                                            description: 'Master Rack Details Entry'
                                        },
                                        {
                                            id: 30012,
                                            name: 'Master Time Slab',
                                            icon: 'Clock',
                                            url: '/library/masters/master-time-slab',
                                            title: 'Master Time Slab',
                                            description: 'Master Time Slab Details'
                                        }
                                        // ,

                                        // {
                                        //     id: 30010,
                                        //     name: 'Master Category',
                                        //     icon: 'BookOpen',
                                        //     url: '/library/masters/category',
                                        //     title: 'Library Category',
                                        //     description: 'Library Category Details'
                                        // }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'BookOpen',

                                    pages: [
                                        {
                                            id: 30013,
                                            name: 'Book Register',
                                            icon: 'BookOpen',
                                            url: '/library/transactions/book-register',
                                            title: 'Book Register',
                                            description: 'Book Register Details'
                                        },

                                        {
                                            id: 30014,
                                            name: 'Book Return',
                                            icon: 'BookOpen',
                                            url: '/library/transactions/book-return',
                                            title: 'Book Return',
                                            description: 'Book Return Transaction Details'
                                        },
                                        {
                                            id: 30015,
                                            name: 'Circulation Parameter',
                                            icon: 'Settings',
                                            url: '/library/transactions/circulation-parameter',
                                            title: 'Circulation Parameter',
                                            description: 'Manage Circulation Parameters'
                                        },

                                        {
                                            id: 30016,
                                            name: 'Book Transaction',
                                            icon: 'BookOpen',
                                            url: '/library/transactions/lib-book-transaction',
                                            title: 'Book Transaction',
                                            description: 'Lib Book Transaction Details'
                                        },
                                        {
                                            id: 30017,
                                            name: 'LOST BOOK',
                                            icon: 'BookOpen',
                                            url: '/library/transactions/lostbook',
                                            title: 'LOST BOOK',
                                            description: 'LOST BOOK Details'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'BookOpen',

                                    pages: [
                                        {
                                            id: 30018,
                                            name: 'Available Books Report',
                                            icon: 'FileText',
                                            url: '/library/reports/available-books-report',
                                            title: 'Available Books Report',
                                            description: 'View Available Books Report'
                                        },
                                        {
                                            id: 30019,
                                            name: 'Book Arrival Report',
                                            icon: 'FileText',
                                            url: '/library/reports/book-arrival-report',
                                            title: 'Book Arrival Report',
                                            description: 'View Book Arrival Report'
                                        },
                                        {
                                            id: 30020,
                                            name: 'Rack Report',
                                            icon: 'FileText',
                                            url: '/library/reports/rack-report',
                                            title: 'Rack Report',
                                            description: 'View Rack Report'
                                        },
                                        {
                                            id: 30021,
                                            name: 'Book Circulation Report',
                                            icon: 'FileText',
                                            url: '/library/reports/book-circulation-report',
                                            title: 'Book Circulation Report',
                                            description: 'View Book Circulation Report'
                                        },
                                        {
                                            id: 30022,
                                            name: 'Purchase/Donate/New Arrival Report',
                                            icon: 'FileText',
                                            url: '/library/reports/purchase-donate-report',
                                            title: 'Purchase/Donate/New Arrival Report',
                                            description: 'View Purchase Donate Report'
                                        },
                                        {
                                            id: 30023,
                                            name: 'Transaction Count Report',
                                            icon: 'FileText',
                                            url: '/library/reports/lib-transaction-report',
                                            title: 'Transaction Count Report',
                                            description: 'View Lib Transaction Report'
                                        },
                                        {
                                            id: 30024,
                                            name: 'Lost Book Report',
                                            icon: 'FileText',
                                            url: '/library/reports/lib-lost-book-report',
                                            title: 'Lost Book Report',
                                            description: 'View Lost Book Report'
                                        },
                                        {
                                            id: 30025,
                                            name: 'Student Transaction Count Report',
                                            icon: 'FileText',
                                            url: '/library/reports/clg-transaction-count-report',
                                            title: 'Student Transaction Count Report',
                                            description: 'View Student Transaction Count Report'
                                        },
                                        {
                                            id: 30026,
                                            name: 'Book Register Report',
                                            icon: 'FileText',
                                            url: '/library/reports/book-register-report',
                                            title: 'Book Register Report',
                                            description: 'View Book Register Report'
                                        },
                                        {
                                            id: 30027,
                                            name: 'Library Month End Report',
                                            icon: 'FileText',
                                            url: '/library/reports/library-month-end-report',
                                            title: 'Library Month End Report',
                                            description: 'View Library Month End Report'
                                        },
                                        {
                                            id: 30028,
                                            name: 'Import Library Data',
                                            icon: 'Upload',
                                            url: '/library/reports/importlibrarydata',
                                            title: 'Import Library Data',
                                            description: 'Import Bulk Library Data'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                {
                    id: 25,
                    name: 'COE',
                    icon: 'Settings',
                    menu: [
                        {
                            id: 1,
                            name: 'Calendar of Events',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Master',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Event',
                                            icon: 'Settings',
                                            url: '/coe/master/masterevent',
                                            title: 'Master Event',
                                            description: 'Manage Master Event Details'
                                        },
                                        {
                                            id: 2,
                                            name: 'Mapping',
                                            icon: 'Settings',
                                            url: '/coe/master/master-coe',
                                            title: 'Mapping',
                                            description: 'Manage Mapping Details'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Report',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'COE Report',
                                            icon: 'Settings',
                                            url: '/coe/report/coereport',
                                            title: 'COE Report',
                                            description: 'Manage COE Report'
                                        },
                                        {
                                            id: 2,
                                            name: 'COE Month End Report',
                                            icon: 'Settings',
                                            url: '/coe/report/coemonthendreport',
                                            title: 'COE Month End Report',
                                            description: 'Manage COE Month End Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 100010,
                    name: 'Inventory Management',
                    icon: 'Package',
                    menu: [
                        {
                            id: 1,
                            name: 'Inventory Module',
                            icon: 'Package',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 101,
                                            name: 'Tax',
                                            icon: 'Percent',
                                            url: '/inventory/inventory-module/masters/inv-master-tax',
                                            title: 'Inventory Master Tax',
                                            description: 'Manage Inventory Master Tax'
                                        },
                                        {
                                            id: 102,
                                            name: 'Store',
                                            icon: 'Store',
                                            url: '/inventory/inventory-module/masters/inv-master-store',
                                            title: 'Inventory Master Store',
                                            description: 'Manage Inventory Master Store'
                                        },
                                        {
                                            id: 103,
                                            name: 'Supplier',
                                            icon: 'Truck',
                                            url: '/inventory/inventory-module/masters/inv-master-supplier',
                                            title: 'Inventory Master Supplier',
                                            description: 'Manage Inventory Master Supplier'
                                        },
                                        {
                                            id: 104,
                                            name: 'Customer',
                                            icon: 'Users',
                                            url: '/inventory/inventory-module/masters/inv-master-customer',
                                            title: 'Inventory Master Customer',
                                            description: 'Manage Inventory Master Customer'
                                        },
                                        {
                                            id: 105,
                                            name: 'Main Group',
                                            icon: 'Grid',
                                            url: '/inventory/inventory-module/masters/inv-master-main-group',
                                            title: 'Main Group',
                                            description: 'Manage Inventory Main Group Details'
                                        },
                                        {
                                            id: 106,
                                            name: 'User Group',
                                            icon: 'UserCog',
                                            url: '/inventory/inventory-module/masters/inv-master-user-group',
                                            title: 'User Group',
                                            description: 'Manage Inventory User Group Details'
                                        },
                                        {
                                            id: 107,
                                            name: 'Item Group',
                                            icon: 'Boxes',
                                            url: '/inventory/inventory-module/masters/inv-master-item-group',
                                            title: 'Item Group',
                                            description: 'Manage Inventory Item Group Details'
                                        },
                                        {
                                            id: 108,
                                            name: 'UOM',
                                            icon: 'Ruler',
                                            url: '/inventory/inventory-module/masters/inv-master-uom',
                                            title: 'Inventory Master UOM',
                                            description: 'Manage Unit of Measurement Details'
                                        },
                                        {
                                            id: 109,
                                            name: 'Master Item',
                                            icon: 'Box',
                                            url: '/inventory/inventory-module/masters/inv-master-item',
                                            title: 'Master Item',
                                            description: 'Manage Inventory Master Item Details'
                                        },
                                        {
                                            id: 110,
                                            name: 'Master Product',
                                            icon: 'Package',
                                            url: '/inventory/inventory-module/masters/inv-master-product',
                                            title: 'Master Product',
                                            description: 'Manage Inventory Master Product Details'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'ArrowRightLeft',
                                    pages: [
                                        {
                                            id: 201,
                                            name: 'GRN',
                                            icon: 'ClipboardList',
                                            url: '/inventory/inventory-module/transactions/inv-t-grn',
                                            title: 'Inventory GRN',
                                            description: 'Manage Inventory Goods Receipt Note'
                                        },
                                        {
                                            id: 202,
                                            name: 'Sales',
                                            icon: 'ShoppingCart',
                                            url: '/inventory/inventory-module/transactions/inv-t-sales',
                                            title: 'Inventory Sales',
                                            description: 'Manage Inventory Sales'
                                        },
                                        {
                                            id: 203,
                                            name: 'Item Consumption',
                                            icon: 'PackageMinus',
                                            url: '/inventory/inventory-module/transactions/inv-t-item-consumption',
                                            title: 'Item Consumption',
                                            description: 'Manage Item Consumption'
                                        },
                                        {
                                            id: 204,
                                            name: 'Opening Balance',
                                            icon: 'Wallet',
                                            url: '/inventory/inventory-module/transactions/inv-opening-balance',
                                            title: 'Opening Balance',
                                            description: 'Manage Inventory Opening Balance'
                                        },
                                        {
                                            id: 205,
                                            name: 'Stock Updation',
                                            icon: 'Layers',
                                            url: '/inventory/inventory-module/transactions/inv-stock',
                                            title: 'Stock Updation',
                                            description: 'Manage Inventory Stock Updation'
                                        },
                                        {
                                            id: 206,
                                            name: 'Vendor Payment',
                                            icon: 'CreditCard',
                                            url: '/inventory/inventory-module/transactions/inv-vendor-payment',
                                            title: 'Vendor Payment',
                                            description: 'Manage Vendor Payments'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'BarChart3',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'GRN Report',
                                            icon: 'FileText',
                                            url: '/inventory/inventory-module/reports/inv-r-grn',
                                            title: 'GRN Report',
                                            description: 'Generate Goods Receipt Note Reports'
                                        },
                                        {
                                            id: 2,
                                            name: 'Sales Report',
                                            icon: 'FileText',
                                            url: '/inventory/inventory-module/reports/inv-r-sales',
                                            title: 'Sales Report',
                                            description: 'Generate Sales Reports'
                                        },
                                        {
                                            id: 3,
                                            name: 'Stock Report',
                                            icon: 'FileText',
                                            url: '/inventory/inventory-module/reports/inv-r-stock',
                                            title: 'Stock Report',
                                            description: 'Generate Inventory Stock Reports'
                                        },
                                        {
                                            id: 4,
                                            name: 'Item Consumption Report',
                                            icon: 'FileText',
                                            url: '/inventory/inventory-module/reports/inv-r-item-consumption',
                                            title: 'Item Consumption Report',
                                            description: 'Generate Item Consumption Reports'
                                        },
                                        {
                                            id: 5,
                                            name: 'Inventory Month End Report',
                                            icon: 'FileText',
                                            url: '/inventory/inventory-module/reports/inv-r-month-end-report',
                                            title: 'Inventory Month End Report',
                                            description: 'Generate Inventory Month End Reports'
                                        },
                                        {
                                            id: 6,
                                            name: 'Vendor Payment Report',
                                            icon: 'FileText',
                                            url: '/inventory/inventory-module/reports/inv-r-vendor-payment',
                                            title: 'Vendor Payment Report',
                                            description: 'Generate Vendor Payment Reports'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                //         {
                //             id: 3,
                //             name: 'Interaction',
                //             icon: 'MessageSquare',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Interaction',
                //                     icon: 'MessageSquare',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Interactions',
                //                             icon: 'MessageSquare',
                //                             url: '/StudentPortal/student-dashboard/Interaction/IVRM_Interaction/Interaction',
                //                             title: 'Interactions',
                //                             description: 'Interact with Staff and Students'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },
                //         {
                //             id: 4,
                //             name: 'Exam',
                //             icon: 'BookOpen',
                //             sub_menu: [
                //                 {
                //             ]
                //         },
                //         {
                //             id: 5,
                //             name: 'Fees',
                //             icon: 'Banknote',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Transaction',
                //                     icon: 'CreditCard',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Fee Details',
                //                             icon: 'FileText',
                //                             url: '/StudentPortal/student-dashboard/Fees/FeeDetails',
                //                             title: 'Fee Details',
                //                             description: 'View Fee Details'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Fee Online Payment',
                //                             icon: 'CreditCard',
                //                             url: '/StudentPortal/student-dashboard/Fees/FeeOnlinePayment',
                //                             title: 'Fee Online Payment',
                //                             description: 'Pay Fees Online'
                //                         },
                //                         {
                //                             id: 3,
                //                             name: 'CumulativeFeeAnalysis',
                //                             icon: 'CreditCard',
                //                             url: '/StudentPortal/masters/cumulative-fee-analysis',
                //                             title: 'Fee Online Payment',
                //                             description: 'Pay Fees Online'
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     id: 2,
                //                     name: 'Reports',
                //                     icon: 'FileText',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Portal Fee Receipt',
                //                             icon: 'FileText',
                //                             url: '/StudentPortal/student-dashboard/Fees/Reports/PortalFeeReceipt',
                //                             title: 'Portal Fee Receipt',
                //                             description: 'View and Download Fee Receipts'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },
                //         {
                //             id: 6,
                //             name: 'COE',
                //             icon: 'Calendar',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'COE',
                //                     icon: 'Calendar',
                //                     pages: [
                //                         // {
                //                         //     id: 1,
                //                         //     name: 'Calendar of Events',
                //                         //     icon: 'Calendar',
                //                         //     url: '/StudentPortal/student-dashboard/COE/COE',
                //                         //     title: 'Calendar of Events',
                //                         //     description: 'View Calendar of Events'
                //                         // },
                //                         {
                //                             id: 1,
                //                             name: 'Calendar of Events',
                //                             icon: 'Calendar',
                //                             url: '/StudentPortal/coe/',
                //                             title: 'Calendar of Events',
                //                             description: 'View Calendar of Events'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },
                //         {
                //             id: 7,
                //             name: 'FEEDBACK',
                //             icon: 'Calendar',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'COE',
                //                     icon: 'Calendar',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Feedback College Parent Transaction',
                //                             icon: 'MessageSquare',
                //                             url: '/StudentPortal/student-dashboard/Feedback/Transaction/FeedbackCollegeParentTransaction',
                //                             title: 'Feedback College Parent Transaction',
                //                             description: 'Provide Feedback'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Student Feedback',
                //                             icon: 'MessageSquare',
                //                             url: '/StudentPortal/feedback/studentfeedback',
                //                             title: 'Student Feedback Details',
                //                             description: 'Provide Feedback'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // },
                {
                    id: 111111,
                    name: 'Transport',
                    icon: 'BookOpen',
                    menu: [
                        {
                            id: 1,
                            name: 'Transport',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 3000,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 30001,
                                            name: 'Master Area',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-area',
                                            title: 'Master Area / Zone',
                                            description: 'Master Area / Zone Details'
                                        },
                                        {
                                            id: 30002,
                                            name: 'Master Driver',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-driver',
                                            title: 'Master Driver',
                                            description: 'Master Driver Details'
                                        },
                                        {
                                            id: 30003,
                                            name: 'Master Fuel Type',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-fuel-type',
                                            title: 'Master Fuel Type',
                                            description: 'Master Fuel Type Details'
                                        },
                                        {
                                            id: 30004,
                                            name: 'Master Location',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-location',
                                            title: 'Master Location',
                                            description: 'Master Location Details'
                                        },
                                        {
                                            id: 30005,
                                            name: 'Master Route',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-route',
                                            title: 'Master Route',
                                            description: 'Master Route Details'
                                        },
                                        {
                                            id: 30006,
                                            name: 'Route Area Mapping',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/route-area-mapping',
                                            title: 'Route Area Mapping',
                                            description: 'Route Area Mapping Details'
                                        },
                                        {
                                            id: 30007,
                                            name: 'Master Service Station',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-service-station',
                                            title: 'Master Service Station',
                                            description: 'Master Service Station Details'
                                        },
                                        {
                                            id: 30008,
                                            name: 'Master Session',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-session',
                                            title: 'Master Session',
                                            description: 'Master Session Details'
                                        },
                                        {
                                            id: 30009,
                                            name: 'Master Vehicle Type',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-vehicle-type',
                                            title: 'Master Vehicle Type',
                                            description: 'Master Vehicle Type Details'
                                        },
                                        {
                                            id: 30010,
                                            name: 'Master Route Schedule',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-route-schedule',
                                            title: 'Master Route Schedule',
                                            description: 'Master Route Schedule Details'
                                        },
                                        {
                                            id: 30011,
                                            name: 'Master Vehicle',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/master-vehicle',
                                            title: 'Master Vehicle',
                                            description: 'Master Vehicle Details'
                                        },
                                        {
                                            id: 30012,
                                            name: 'Expiry Settings',
                                            icon: 'BookOpen',
                                            url: '/Transport/transport-module/masters/expiry-settings',
                                            title: 'Expiry Settings',
                                            description: 'Transport Expiry Settings'
                                        }
                                    ]
                                },
                                {
                                    id: 3001,
                                    name: 'Transactions',
                                    icon: 'BookOpen',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Route Location Mapping',
                                            icon: 'Settings',
                                            url: '/Transport/transport-module/transaction/route-location-mapping',
                                            title: 'Route Location Mapping',
                                            description: 'Manage Route Location Mapping'
                                        },
                                        {
                                            id: 2,
                                            name: 'Vehicle Driver Mapping',
                                            icon: 'Settings',
                                            url: '/Transport/transport-module/transaction/vehicle-driver-mapping',
                                            title: 'Vehicle Driver Mapping',
                                            description: 'Manage Vehicle Driver Mapping'
                                        },
                                        {
                                            id: 3,
                                            name: 'Vehicle Route Mapping',
                                            icon: 'Settings',
                                            url: '/Transport/transport-module/transaction/vehicle-route-mapping',
                                            title: 'Vehicle Route Mapping',
                                            description: 'Manage Vehicle Route Mapping'
                                        },
                                        {
                                            id: 4,
                                            name: 'Transport Approve',
                                            icon: 'Settings',
                                            url: '/Transport/transport-module/transaction/transport-approve',
                                            title: 'Transport Approve',
                                            description: 'Manage Transport Approve'
                                        }
                                    ]
                                },
                                {
                                    id: 3002,
                                    name: 'Reports',
                                    icon: 'BookOpen',
                                    pages: [
                                        {
                                            id: 30201,
                                            name: 'Month End Report',
                                            icon: 'FileText',
                                            url: '/Transport/transport-module/reports/month-end-report',
                                            title: 'Month End Report',
                                            description: 'Transport Month End Report'
                                        },
                                        {
                                            id: 30202,
                                            name: 'Transport Report',
                                            icon: 'FileText',
                                            url: '/Transport/transport-module/reports/transport-report',
                                            title: 'Transport Report',
                                            description: 'Transport Report'
                                        },
                                        {
                                            id: 30203,
                                            name: 'Fee Student Route Mapping Report',
                                            icon: 'FileText',
                                            url: '/Transport/transport-module/reports/fee-student-route-mapping-report',
                                            title: 'Fee Student Route Mapping Report',
                                            description: 'Fee Student Route Mapping Report'
                                        },
                                        {
                                            id: 30204,
                                            name: 'Student Route Mapping Report',
                                            icon: 'FileText',
                                            url: '/Transport/transport-module/reports/student-route-mapping-report',
                                            title: 'Student Route Mapping Report',
                                            description: 'Student Route Mapping Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 140014,
                    name: 'Lesson Planner',
                    icon: 'GraduationCap',
                    menu: [
                        {
                            id: 1,
                            name: 'Lesson Planner Module',
                            icon: 'FileStack',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Master',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master School Topic',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/master/master-school-topic',
                                            title: 'Master School Topic',
                                            description: 'Manage Master School Topic'
                                        },
                                        {
                                            id: 2,
                                            name: 'Master School Unit',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/master/master-school-unit',
                                            title: 'Master School Unit',
                                            description: 'Manage Master School Unit'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'School Staff Period Mapping',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/transactions/school-staff-period-mapping',
                                            title: 'School Staff Period Mapping',
                                            description: 'School Staff Period Mapping'
                                        },
                                        {
                                            id: 2,
                                            name: 'School Master Unit Topic Mapping',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/transactions/school-master-unit-topic-mapping',
                                            title: 'School Master Unit Topic Mapping',
                                            description: 'School Master Unit Topic Mapping'
                                        },
                                        {
                                            id: 3,
                                            name: 'School Subject Master Topic Mapping',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/transactions/school-subject-master-topic-mapping',
                                            title: 'School Subject Master Topic Mapping',
                                            description: 'School Subject Master Topic Mapping'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'School Staff Period Transaction Deviation Report',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/reports/school-staff-period-transaction-deviation-report',
                                            title: 'School Staff Period Transaction Deviation Report',
                                            description: 'School Staff Period Transaction Deviation Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 110011,
                    name: 'Sports Management',
                    icon: 'Trophy',
                    menu: [
                        {
                            id: 1,
                            name: 'Sports Management',
                            icon: 'Activity',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Events',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/Events',
                                            title: 'Sports Events',
                                            description: 'Manage Sports Events'
                                        },
                                        {
                                            id: 2,
                                            name: 'Venue',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/Venue',
                                            title: 'Sports Venue',
                                            description: 'Manage Sports Venue'
                                        },
                                        {
                                            id: 3,
                                            name: 'Program Master',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/ProgramMaster',
                                            title: 'Program Master',
                                            description: 'Manage Program Master'
                                        },
                                        {
                                            id: 4,
                                            name: 'Master Sponsor',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/Sponsors',
                                            title: 'Master Sponsor',
                                            description: 'Manage Master Sponsor'
                                        },
                                        {
                                            id: 5,
                                            name: 'Master Division',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/Division',
                                            title: 'Master Division',
                                            description: 'Manage Master Division'
                                        },
                                        {
                                            id: 6,
                                            name: 'Competition Level',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/CompetitionLevel',
                                            title: 'Master Competition Level',
                                            description: 'Manage Master Competition Level'
                                        },
                                        {
                                            id: 7,
                                            name: 'Master UOM',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/UOM',
                                            title: 'Master UOM',
                                            description: 'Manage Master UOM'
                                        },
                                        {
                                            id: 8,
                                            name: 'Master House',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/House',
                                            title: 'Master House',
                                            description: 'Manage Master House'
                                        },
                                        {
                                            id: 9,
                                            name: 'Master House Designation',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/HouseDesignation',
                                            title: 'Master House Designation',
                                            description: 'Manage Master House Designation'
                                        },
                                        {
                                            id: 10,
                                            name: 'Master Sports CC Group',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/MasterSportsCCGroup',
                                            title: 'Master Sports CC Group',
                                            description: 'Manage Master Sports CC Group'
                                        },
                                        {
                                            id: 11,
                                            name: 'Master Competition Category',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/CompetitionCategory',
                                            title: 'Master Competition Category',
                                            description: 'Manage Master Competition Category'
                                        },
                                        {
                                            id: 12,
                                            name: 'Master Sports CC Name UOM',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/SportsCCNameUOM',
                                            title: 'Master Sports CC Name UOM',
                                            description: 'Manage Master Sports CC Name UOM'
                                        },
                                        {
                                            id: 13,
                                            name: 'Student House Mapping',
                                            icon: 'Trophy',
                                            url: '/Sports/Masters/StudentHouseMapping',
                                            title: 'Student House Mapping',
                                            description: 'Map Students to Houses'
                                        },
                                        {
                                            id: 14,
                                            name: 'Master SportsCC Name',
                                            icon: 'Settings',
                                            url: '/Sports/Masters/SportsCCName',
                                            title: 'Master SportsCC Name',
                                            description: 'Manage Master SportsCC Name'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transactions',
                                    icon: 'Activity',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Events Sponsor Mapping',
                                            icon: 'Activity',
                                            url: '/Sports/Transactions/EventsSponsorMapping',
                                            title: 'Events Sponsor Mapping',
                                            description: 'Manage Events Sponsor Mapping'
                                        },
                                        {
                                            id: 2,
                                            name: 'BMI Calculation',
                                            icon: 'Activity',
                                            url: '/Sports/Transactions/BMICalculation',
                                            title: 'BMI Calculation',
                                            description: 'Manage BMI Calculation'
                                        },
                                        {
                                            id: 3,
                                            name: 'Student Age Calculation',
                                            icon: 'Activity',
                                            url: '/Sports/Transactions/StudentAgeCalculation',
                                            title: 'Student Age Calculation',
                                            description: 'Manage Student Age Calculation'
                                        },
                                        {
                                            id: 4,
                                            name: 'Sport Venuewise Participation Report',
                                            icon: 'Activity',
                                            url: '/Sports/Transactions/SportVenuewiseParticipationReport',
                                            title: 'Sport Venuewise Participation Report',
                                            description: 'Manage Sport Venuewise Participation Report'
                                        },
                                        {
                                            id: 5,
                                            name: 'Events Mapping',
                                            icon: 'Activity',
                                            url: '/Sports/Transactions/EventsMapping',
                                            title: 'Events Mapping',
                                            description: 'Manage Events Mapping'
                                        },
                                        // {
                                        //     id: 6,
                                        //     name: 'Events Student Mapping',
                                        //     icon: 'Activity',
                                        //     url: '/Sports/Transactions/EventsStudentMapping',
                                        //     title: 'Events Student Mapping',
                                        //     description: 'Manage Events Student Mapping'
                                        // },
                                        {
                                            id: 7,
                                            name: 'Events Student SRKVS Mapping',
                                            icon: 'Activity',
                                            url: '/Sports/Transactions/EventsStudentSRKVS',
                                            title: 'Events Student SRKVS Mapping',
                                            description: 'Events Student SRKVS Mapping'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'FileText',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Student Eligible Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/StudentEligbleReport',
                                            title: 'Student Eligible Report',
                                            description: 'Generate Student Eligible Report'
                                        },

                                        {
                                            id: 2,
                                            name: 'Student Age Calculation Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/StudentAgeCalculationReport',
                                            title: 'Student Age Calculation Report',
                                            description: 'Student Age Calculation Report'
                                        },
                                        {
                                            id: 3,
                                            name: 'BMI Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/BMIReport',
                                            title: 'BMI Report',
                                            description: 'BMI Report'
                                        },
                                        {
                                            id: 4,
                                            name: 'Sport House Committee Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/SportHouseCommitteeReport',
                                            title: 'Sport House Committee Report',
                                            description: 'Sport House Committee Report'
                                        },
                                        {
                                            id: 5,
                                            name: 'House Incharge Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/HouseInchargeReport',
                                            title: 'House Incharge Report',
                                            description: 'House Incharge Report'
                                        },
                                        {
                                            id: 6,
                                            name: 'Sport House Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/SportHouseReport',
                                            title: 'Sport House Report',
                                            description: 'Sport House Report'
                                        },
                                        // {
                                        //     id: 7,
                                        //     name: 'Sport Student Participation Report',
                                        //     icon: 'FileText',
                                        //     url: '/Sports/Reports/SportStudentParticipationReport',
                                        //     title: 'Sport Student Participation Report',
                                        //     description: 'Sport Student Participation Report'
                                        // },
                                        {
                                            id: 8,
                                            name: 'Sport Topper List Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/SportTopperListReport',
                                            title: 'Sport Topper List Report',
                                            description: 'Sport Topper List Report'
                                        },
                                        {
                                            id: 9,
                                            name: 'Sports Year End Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/SportsYearEndReport',
                                            title: 'Sports Year End Report',
                                            description: 'Sports Year End Report'
                                        },
                                        {
                                            id: 10,
                                            name: 'SRKVS Sports Report Record',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/SRKVSSportsReportRecord',
                                            title: 'SRKVS Sports Report Record',
                                            description: 'View SRKVS Sports Report Record'
                                        },
                                        {
                                            id: 11,
                                            name: 'Venue Wise Participation',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/VenueWiseParticipationReport',
                                            title: 'Venue Wise Participation',
                                            description: 'View Venue Wise Participation Report'
                                        },
                                        {
                                            id: 12,
                                            name: 'Month End Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/MonthEndReport',
                                            title: 'Month End Report',
                                            description: 'View Month End Report'
                                        },
                                        {
                                            id: 13,
                                            name: 'Points Record Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/PointsRecordReport',
                                            title: 'Points Record Report',
                                            description: 'View Points Record Report'
                                        },
                                        {
                                            id: 14,
                                            name: 'Sport Points And Record Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/SportPointsAndRecordReport',
                                            title: 'Sport Points And Record Report',
                                            description: 'View Sport Points And Record Report'
                                        },
                                        {
                                            id: 15,
                                            name: 'Eligibility Certificate Report',
                                            icon: 'FileText',
                                            url: '/Sports/Reports/EligibilityCertificateReport',
                                            title: 'Eligibility Certificate Report',
                                            description: 'Generate Eligibility Certificate Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // {
                //     id: 8,
                //     name: 'Hostel Management',
                //     icon: 'Home',
                //     menu: [
                //         {
                //             id: 1,
                //             name: 'Master',
                //             icon: 'Settings',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Masters',
                //                     icon: 'Database',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Master Facility',
                //                             icon: 'Wifi',
                //                             url: '/hostel/hostel-management/masters/master-facility',
                //                             title: 'Master Facility',
                //                             description: 'Manage Hostel Facilities'
                //                         },
                //                         {
                //                             id: 7,
                //                             name: 'Master Mess',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/master-mess',
                //                             title: 'Master Mess',
                //                             description: 'Manage Mess Details'
                //                         },
                //                         {
                //                             id: 3,
                //                             name: 'Master Mess Category',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/master-mess-category',
                //                             title: 'Master Mess Category',
                //                             description: 'Manage Mess Category Mapping'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Master Hostel',
                //                             icon: 'Building',
                //                             url: '/hostel/hostel-management/masters/master-hostel',
                //                             title: 'Master Hostel',
                //                             description: 'Manage Hostel Details'
                //                         },
                //                         {
                //                             id: 4,
                //                             name: 'Master Floor',
                //                             icon: 'Layers',
                //                             url: '/hostel/hostel-management/masters/master-floor',
                //                             title: 'Master Floor',
                //                             description: 'Manage Floor Details'
                //                         },
                //                         {
                //                             id: 5,
                //                             name: 'Master Room',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/master-room',
                //                             title: 'Master Room',
                //                             description: 'Manage Room Details'
                //                         },
                //                         {
                //                             id: 6,
                //                             name: 'Master Bed',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/master-bed',
                //                             title: 'Master Bed',
                //                             description: 'Manage Bed Details'
                //                         },

                //                         {
                //                             id: 8,
                //                             name: 'Mess Menu',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/mess-menu',
                //                             title: 'Mess Menu',
                //                             description: 'Manage Mess Menu Details'
                //                         },
                //                         {
                //                             id: 9,
                //                             name: 'Room Category',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/room-category',
                //                             title: 'Room Category',
                //                             description: 'Manage Room Categories'
                //                         },
                //                         {
                //                             id: 10,
                //                             name: 'Room Tariff',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/masters/room-tariff',
                //                             title: 'Room Tariff',
                //                             description: 'Manage Room Tariffs'
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     id: 2,
                //                     name: 'Transactions',
                //                     icon: 'Repeat',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Student Request',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/transactions/student-request',
                //                             title: 'Student Request',
                //                             description: 'Student Hostel Request'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Student Request Confirm',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/transactions/student-request-confirm',
                //                             title: 'Student Request Confirm',
                //                             description: 'Confirm Student Requests'
                //                         },
                //                         {
                //                             id: 3,
                //                             name: 'Hostel Allotment For Student',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/transactions/student-allotment',
                //                             title: 'Hostel Allotment For Student',
                //                             description: 'Allot Hostel for Student'
                //                         },
                //                         {
                //                             id: 4,
                //                             name: 'Hostel Vacate',
                //                             icon: 'LogOut',
                //                             url: '/hostel/hostel-management/transactions/vacate-room',
                //                             title: 'Hostel Vacate',
                //                             description: 'Vacate Hostel Room'
                //                         },
                //                         // {
                //                         //     id: 5,
                //                         //     name: 'College Hostel Allotment',
                //                         //     icon: 'Building',
                //                         //     url: '/hostel/hostel-management/transactions/college-student-allotment',
                //                         //     title: 'College Hostel Allotment',
                //                         //     description: 'Allot Hostel for College Student'
                //                         // },
                //                         // {
                //                         //     id: 6,
                //                         //     name: 'College Hostel Vacate',
                //                         //     icon: 'LogOut',
                //                         //     url: '/hostel/hostel-management/transactions/college-vacate-room',
                //                         //     title: 'College Hostel Vacate',
                //                         //     description: 'Vacate College Hostel Room'
                //                         // },
                //                         // {
                //                         //     id: 7,
                //                         //     name: 'College Gate Pass',
                //                         //     icon: 'CreditCard',
                //                         //     url: '/hostel/hostel-management/transactions/college-gatepass',
                //                         //     title: 'College Gate Pass',
                //                         //     description: 'Manage College Gate Pass'
                //                         // },
                //                         {
                //                             id: 8,
                //                             name: 'Staff Request',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/transactions/staff-request',
                //                             title: 'Staff Request',
                //                             description: 'Staff Hostel Request'
                //                         },
                //                         // {
                //                         //     id: 9,
                //                         //     name: 'Staff Request Confirm',
                //                         //     icon: 'CheckSquare',
                //                         //     url: '/hostel/hostel-management/transactions/staff-request-confirm',
                //                         //     title: 'Staff Request Confirm',
                //                         //     description: 'Confirm Staff Requests'
                //                         // },
                //                         {
                //                             id: 10,
                //                             name: 'Hostel Allotment For Staff',
                //                             icon: 'User',
                //                             url: '/hostel/hostel-management/transactions/staff-allotment',
                //                             title: 'Hostel Allotment For Staff',
                //                             description: 'Allot Hostel for Staff'
                //                         },
                //                         {
                //                             id: 11,
                //                             name: 'Hostel Allotment For Guest',
                //                             icon: 'UserPlus',
                //                             url: '/hostel/hostel-management/transactions/guest-allotment',
                //                             title: 'Hostel Allotment For Guest',
                //                             description: 'Allot Hostel for Guest'
                //                         },
                //                         {
                //                             id: 12,
                //                             name: 'Room Transfer',
                //                             icon: 'Home',
                //                             url: '/hostel/hostel-management/transactions/room-transfer',
                //                             title: 'Room Transfer',
                //                             description: 'Transfer Room'
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     id: 3,
                //                     name: 'Reports',
                //                     icon: 'BarChart',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Hostel Allotment Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/allotment-report',
                //                             title: 'Hostel Allotment Report',
                //                             description: 'View Alotment Report'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Hostel Confirm Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/confirm-report',
                //                             title: 'Hostel Confirm Report',
                //                             description: 'View Confirm Report'
                //                         },
                //                         {
                //                             id: 3,
                //                             name: 'Hostel Request Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/request-report',
                //                             title: 'Hostel Request Report',
                //                             description: 'View Request Report'
                //                         },
                //                         {
                //                             id: 4,
                //                             name: 'Hostel Vacate Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/vacate-report',
                //                             title: 'Hostel Vacate Report',
                //                             description: 'View Vacate Report'
                //                         },
                //                         {
                //                             id: 5,
                //                             name: 'Student Gatepass Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/student-gatepass-report',
                //                             title: 'Student Gatepass Report',
                //                             description: 'View Student Gatepass Report'
                //                         },
                //                         {
                //                             id: 6,
                //                             name: 'Student Attendance Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/student-attendance-report',
                //                             title: 'Student Attendance Report',
                //                             description: 'View Student Attendance Report'
                //                         },
                //                         {
                //                             id: 7,
                //                             name: 'Food Conveyance Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/food-conveyance-report',
                //                             title: 'Food Conveyance Report',
                //                             description: 'View Food Conveyance Report'
                //                         },
                //                         {
                //                             id: 8,
                //                             name: 'College Allotment Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/college-allotment-report',
                //                             title: 'College Allotment Report',
                //                             description: 'View College Allotment Report'
                //                         },
                //                         {
                //                             id: 9,
                //                             name: 'College Confirm Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/college-confirm-report',
                //                             title: 'College Confirm Report',
                //                             description: 'View College Confirm Report'
                //                         },
                //                         {
                //                             id: 10,
                //                             name: 'College Request Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/college-request-report',
                //                             title: 'College Request Report',
                //                             description: 'View College Request Report'
                //                         },
                //                         {
                //                             id: 11,
                //                             name: 'College Vacate Report',
                //                             icon: 'FileText',
                //                             url: '/hostel/hostel-management/reports/college-vacate-report',
                //                             title: 'College Vacate Report',
                //                             description: 'View College Vacate Report'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // }

                //         //    ,
                //         //        {
                //         //         id: 8,
                //         //         name: 'HRMS',
                //         //         icon: 'Wallet',
                //         //         sub_menu: [
                //         //             {
                //         //                 id: 1,
                //         //                 name: 'Report',
                //         //                 icon: 'Currency',
                //         //                 pages: [
                //         //                     {
                //         //                         id: 1,
                //         //                         name: 'Generate Employee Salary Slip',
                //         //                         icon: 'FileText',
                //         //                         url: '/StaffPortal/salary/staff-salary-slip',
                //         //                         title: 'Staff Salary Slip',
                //         //                         description: 'View and Download Pay Slips'
                //         //                     }

                //         //                 ]
                //         //             }
                //         //         ]
                //         //     },
                //     ]
                // }

                {
                    id: 201,
                    name: 'Petty Cash',
                    icon: 'BadgeIndianRupee',
                    menu: [
                        {
                            id: 1,
                            name: 'Petty Cash',
                            icon: 'BadgeIndianRupee',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Masters',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        {
                                            id: 600,
                                            name: 'Master particulars',
                                            icon: 'BadgeIndianRupee',
                                            url: '/pettycash/masterparticulars',
                                            title: 'Master Particulars',
                                            description: 'Manage Master Particulars Details'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Transaction',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        // {
                                        //     id: 603,
                                        //     name: 'PC Indent',
                                        //     icon: 'BadgeIndianRupee',
                                        //     url: '/pettycash/Transaction/pcIndent',
                                        //     title: 'PC Indent',
                                        //     description: 'Manage PC Indent Details'
                                        // },
                                        // {
                                        //     id: 604,
                                        //     name: 'PC INDENT APPROVAL',
                                        //     icon: 'BadgeIndianRupee',
                                        //     url: '/pettycash/Transaction/pcIndentApproval',
                                        //     title: 'PC Indent Approval',
                                        //     description: 'Manage PC Indent Approval Details'
                                        // },
                                        {
                                            id: 61105,
                                            name: 'PC PARTICULARS REQUISITION',
                                            icon: 'BadgeIndianRupee',
                                            url: '/pettycash/Transaction/pcREQUISITION',
                                            title: 'PC Particulars Requisition',
                                            description: 'Manage PC Particulars Requisition Details'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'Reports',
                                    icon: 'BadgeIndianRupee',
                                    pages: [
                                        {
                                            id: 60321230,
                                            name: 'Pc Requisition Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/pettycash/PcRequisitionReport',
                                            title: 'Pc Requisition Report',
                                            description: 'View Pc Requisition Reports'
                                        },
                                        {
                                            id: 60321231,
                                            name: 'Income Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/pettycash/incomereport',
                                            title: 'Income Report',
                                            description: 'View Income Reports'
                                        },
                                        {
                                            id: 60321232,
                                            name: 'Bank Credit And Debit Report',
                                            icon: 'BadgeIndianRupee',
                                            url: '/pettycash/BankCopyReportVVVS',
                                            title: 'Bank Credit And Debit Report',
                                            description: 'View Bank Credit And Debit Reports'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } else if (session?.role.toUpperCase() === 'STAFF') {
        response = {
            success: true,
            message: 'Data fetched successfully!!',
            data: [
                {
                    id: 30,
                    name: 'Staff Portal',
                    icon: 'Settings',
                    menu: [
                        // {
                        //     id: 1,
                        //     name: 'Dashboard',
                        //     icon: 'LayoutDashboard',
                        //     sub_menu: [
                        //         {
                        //             id: 8000,
                        //             name: 'Dashboard',
                        //             icon: 'LayoutDashboard',
                        //             pages: [
                        //                 {
                        //                     id: 8000,
                        //                     name: 'Staff Dashboard',
                        //                     icon: 'LayoutDashboard',
                        //                     url: '/StaffPortal/staff-dashboard',
                        //                     title: 'Staff Dashboard',
                        //                     description: 'Overall Staff Statistics'
                        //                 }
                        //             ]
                        //         }
                        //     ]
                        // },
                        {
                            id: 2,
                            name: 'Attendance',
                            icon: 'Clock',
                            sub_menu: [
                                {
                                    id: 8001,
                                    name: 'Transaction',
                                    icon: 'CalendarCheck',
                                    pages: [
                                        {
                                            id: 8001,
                                            name: 'Attendance Entry',
                                            icon: 'UserCheck',
                                            // url: '/StaffPortal/attendance/attendance-entry',
                                            url: '/admission/preadmission/attendance-entry/student-attendance',
                                            title: 'Attendance Entry',
                                            description: 'Daily Student Attendance'
                                        },
                                        {
                                            id: 8002,
                                            name: 'Mess Attendance Entry',
                                            icon: 'UserCheck',
                                            url: '/admission/preadmission/newsharedhost/transactions/mess-attendance-entry',
                                            title: 'Mess Attendance Entry',
                                            description: 'Daily Student Attendance'
                                        }
                                    ]
                                },
                                {
                                    id: 8002,
                                    name: 'Report',
                                    icon: 'CalendarCheck',
                                    pages: [
                                        // {
                                        //     id: 8002,
                                        //     name: '100% Attendance Report',
                                        //     icon: 'UserCheck',
                                        //     //url: '/StaffPortal/attendance/100_attendance-entry',
                                        //     url: '/admission/preadmission/reports/student-attendance-report',
                                        //     title: '100% Attendance Report ',
                                        //     description: '100% Attendance Report '
                                        // },
                                        {
                                            id: 8003,
                                            name: 'Student Attendance Report ',
                                            icon: 'FilePieChart',
                                            //url: '/StaffPortal/attendance/student-attendance-report',
                                            url: '/admission/preadmission/reports/student-attendance-report',
                                            title: 'Student Attendance Report',
                                            description: 'View Attendance History'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 701,
                            name: 'Exam',
                            icon: 'GraduationCap',
                            sub_menu: [
                                {
                                    id: 9000,
                                    name: 'Exam',
                                    icon: 'Trophy',
                                    pages: [
                                        {
                                            id: 9001,
                                            name: 'AI MCQ QUIZ',
                                            icon: 'Trophy',
                                            url: '/StaffPortal/ai-mcq-quiz',
                                            title: 'AI MCQ QUIZ',
                                            description: 'Conduct and manage online MCQ quizzes'
                                        },
                                        {
                                            id: 9002,
                                            name: 'OMR Sheet Evaluator',
                                            icon: 'ClipboardCheck',
                                            url: '/StaffPortal/omr-sheet-evaluator',
                                            title: 'OMR Sheet Evaluator',
                                            description: 'Evaluate scanned OMR mark sheets using AI'
                                        }
                                    ]
                                },
                                {
                                    id: 8004,
                                    name: 'Marks Entry',
                                    icon: 'ClipboardEdit',
                                    pages: [
                                        {
                                            id: 8004,
                                            name: 'Marks Entry',
                                            icon: 'PenSquare',
                                            //url: '/StaffPortal/exam/marks-entry',
                                            url: '/Exam/exam-module/marks-entry/exam-marks-entry',
                                            title: 'Marks Entry',
                                            description: 'Direct Marks Entry'
                                        },
                                        {
                                            id: 8005,
                                            name: 'Promotion Remarks',
                                            icon: 'Layers',
                                            //url: '/StaffPortal/exam/promotion-remarks',
                                            url: '/Exam/exam-module/exam-mapping/promotion-setting',
                                            title: 'Promotion Remarks',
                                            description: 'Promotion Remarks'
                                        }
                                    ]
                                },
                                {
                                    id: 8006,
                                    name: 'CCE',
                                    icon: 'ClipboardEdit',
                                    pages: [
                                        {
                                            id: 8006,
                                            name: 'Student Transaction',
                                            icon: 'Layers',
                                            //url: '/StaffPortal/exam/student-transaction-cce',
                                            url: '/Exam/exam-module/exam-mapping/student-transactioncce',
                                            title: 'Student Transaction CCE',
                                            description: 'CCE Transaction Entry'
                                        }
                                    ]
                                },

                                {
                                    id: 8007,
                                    name: 'Transaction ',
                                    icon: 'ClipboardEdit',
                                    pages: [
                                        {
                                            id: 8007,
                                            name: 'Exam Student Wise Remarks Entry',
                                            icon: 'Layers',
                                            //url: '/StaffPortal/exam/transaction/examwise-student-remarks',
                                            url: '/Exam/exam-module/marks-entry/exam-wise-student-remarks-entry',
                                            title: 'Exam Student Wise Remarks Entry',
                                            description: 'Exam Student Wise Remarks Entry'
                                        }
                                    ]
                                },
                                {
                                    id: 8008,
                                    name: 'Report ',
                                    icon: 'ClipboardEdit',
                                    pages: [
                                        {
                                            id: 8008,
                                            name: 'Cumulative Report',
                                            icon: 'Layers',
                                            //url: '/StaffPortal/exam/report/cumulative-report',
                                            url: '/Exam/exam-module/reports/cumulative-report',
                                            title: 'Cumulative Report',
                                            description: 'Cumulative Report BB'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 8009,
                            name: 'Upload',
                            icon: 'MessageSquare',
                            sub_menu: [
                                {
                                    id: 8009,
                                    name: 'Transaction',
                                    icon: 'MessagesSquare',
                                    pages: [
                                        {
                                            id: 8009,
                                            name: 'Homework',
                                            icon: 'MessageSquare',
                                            url: '/StaffPortal/Upload/ivrm-homework',
                                            title: 'Home Work',
                                            description: 'Home Work'
                                        },
                                        {
                                            id: 80010,
                                            name: 'Homework Marks Entry',
                                            icon: 'MessageSquare',
                                            url: '/StaffPortal/Upload/HomeWork_Marks_Enter',
                                            title: 'Homework Marks Entry',
                                            description: 'Homework Marks Entry'
                                        },
                                        // {
                                        //     id: 80011,
                                        //     name: 'Homework Upload Report',
                                        //     icon: 'MessageSquare',
                                        //     url: '/StaffPortal/Upload/homework-upload-report',
                                        //     title: 'Home Work Upload Report',
                                        //     description: 'Homework Upload Report'
                                        // },

                                        {
                                            id: 80013,
                                            name: 'Notice Board',
                                            icon: 'MessageSquare',
                                            url: '/StaffPortal/Upload/notice-board',
                                            title: 'Notice Board',
                                            description: 'Notice Board'
                                        },
                                        {
                                            id: 80014,
                                            name: 'Classwork',
                                            icon: 'MessageSquare',
                                            url: '/StaffPortal/Upload/ivrm-classwork',
                                            title: 'Classwork',
                                            description: 'Classwork'
                                        },

                                        {
                                            id: 80015,
                                            name: 'Class Work Marks Entry',
                                            icon: 'MessageSquare',
                                            url: '/StaffPortal/Upload/ClassWork_Marks_Enter',
                                            title: 'Class Work Marks Entry',
                                            description: 'Class Work Marks Entry'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 80016,
                            name: 'Leave',
                            icon: 'CalendarRange',
                            sub_menu: [
                                {
                                    id: 80016,
                                    name: 'Leave Management',
                                    icon: 'CalendarDays',
                                    pages: [
                                        {
                                            id: 80016,
                                            name: 'Leave Application',
                                            icon: 'FilePlus',
                                            url: '/StaffPortal/leave-management/online-leave-application',
                                            title: 'Online Leave Application',
                                            description: 'Apply for leaves'
                                        },

                                        {
                                            id: 80019,
                                            name: 'Leave Approval',
                                            icon: 'CheckCircle',
                                            url: '/StaffPortal/leave-management/leave-approval',
                                            title: 'Leave Approval',
                                            description: 'Approve or Reject Leave Requests'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 80017,
                            name: 'Biometric Report  ',
                            icon: 'Wallet',
                            sub_menu: [
                                {
                                    id: 80017,
                                    name: 'Report ',
                                    icon: 'Currency',
                                    pages: [
                                        {
                                            id: 80017,
                                            name: 'Employee Punch Report ',
                                            icon: 'FileText',
                                            url: '/StaffPortal/BiometricReport/employeePunchAttendence',
                                            title: 'Employee Punch Report ',
                                            description: 'Employee Punch Report '
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 80018,
                            name: 'Fees',
                            icon: 'BadgeIndianRupee',
                            sub_menu: [
                                {
                                    id: 80018,
                                    name: 'Reports',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 80018,
                                            name: 'Defaulter Report',
                                            icon: 'UserX',
                                            // url: '/StaffPortal/fees/staff-fee-defaulter-report',
                                            url: '/fees/feereports/feedefaulterreport',
                                            title: 'Fee Defaulter Report',
                                            description: 'Monitor Fee Defaulters'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 80019,
                            name: 'Lesson Planner',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 80019,
                                    name: 'Transaction',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 4,
                                            name: 'School Staff Period Transaction',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/transactions/school-staff-period-transaction',
                                            title: 'School Staff Period Transaction',
                                            description: 'School Staff Period Transaction'
                                        }
                                    ]
                                },
                                {
                                    id: 80019,
                                    name: 'Reports',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 2,
                                            name: 'School Staff Period Transaction Report',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/reports/school-staff-period-transaction-report',
                                            title: 'School Staff Period Transaction Report',
                                            description: 'School Staff Period Transaction Report'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 800267,
                            name: 'Interaction',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 800267,
                                    name: 'Transaction',
                                    icon: 'FileBarChart',
                                    pages: [
                                        // {
                                        //     id: 1,
                                        //     name: 'IVRM Interaction',
                                        //     icon: 'BookOpenText',
                                        //     url: '/StaffPortal/Interactions/IVRM_Interactions',
                                        //     title: 'IVRM Interaction',
                                        //     description: 'IVRM Interaction'
                                        // },
                                        // {
                                        //     id: 2,
                                        //     name: 'NDA IVRM Interaction',
                                        //     icon: 'BookOpenText',
                                        //     url: '/StaffPortal/Interactions/NDA_IVRM_Interactions',
                                        //     title: 'NDA IVRM Interaction',
                                        //     description: 'NDA IVRM Interaction'
                                        // },
                                        {
                                            id: 3,
                                            name: 'SCS Interaction',
                                            icon: 'BookOpenText',
                                            url: '/StaffPortal/Interactions/SCS_IVRM_Interactions',
                                            title: 'SCS Interaction',
                                            description: 'SCS Interaction'
                                        }
                                    ]
                                },
                                {
                                    id: 80019,
                                    name: 'Reports',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 2,
                                            name: 'School Staff Period Transaction Report',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/reports/school-staff-period-transaction-report',
                                            title: 'School Staff Period Transaction Report',
                                            description: 'School Staff Period Transaction Report'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 80020,
                            name: 'Client Spcefic pages',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 80020,
                                    name: 'Sophia',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 80020,
                                            name: 'Sophia',
                                            icon: 'BookOpenText',
                                            url: '/admission/preadmission/reports/Sophia/ClassWiseDailyAttendance',
                                            title: 'Sophia Classwise Report',
                                            description: 'Sophia Classwise Report'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 5,
                    name: 'AI Edge',
                    icon: 'Sparkles',
                    menu: [
                        {
                            id: 1,
                            name: 'AI Edge',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'AI Tools',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'AI Question Paper Generator',
                                            icon: 'FileText',
                                            url: '/StaffPortal/ai-question-paper-generator',
                                            title: 'AI Question Paper Generator',
                                            description: 'Generate question papers from textbooks using AI'
                                        },
                                        {
                                            id: 2,
                                            name: 'AI Notemaker',
                                            icon: 'FileText',
                                            url: '/StaffPortal/ai-notemaker',
                                            title: 'AI Notemaker',
                                            description: 'Summarize and create structured notes from textbooks using AI'
                                        },
                                        {
                                            id: 3,
                                            name: 'AI Performance Analysis',
                                            icon: 'BarChart',
                                            url: '/StaffPortal/ai-performance-analysis',
                                            title: 'AI Performance Analysis',
                                            description: 'Analyze performance metrics and AI-driven insights'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } else if (session?.role.toUpperCase() === 'STUDENT') {
        response = {
            success: true,
            message: 'Data fetched successfully!!',
            data: [
                {
                    id: 40000,
                    name: 'Student Portal',
                    icon: 'Users',
                    menu: [
                        {
                            id: 40000,
                            name: 'Home',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 40000,
                                    name: 'Home',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 40000,
                                            name: 'Dashboard',
                                            icon: 'LayoutDashboard',
                                            url: '/StudentPortal/student-dashboard',
                                            title: 'StudentDashboard',
                                            description: 'Main Dashboard'
                                        }

                                        // {
                                        //     id: 402000,
                                        //     name: 'Dashboard Demo',
                                        //     icon: 'LayoutDashboard',
                                        //     url: '/StudentPortal/StudentPortalDashboard',
                                        //     title: 'StudentDashboard',
                                        //     description: 'Main Dashboard'
                                        // }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 800267,
                            name: 'Interaction',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 800267,
                                    name: 'Transaction',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'IVRM Interaction',
                                            icon: 'BookOpenText',
                                            url: '/StudentPortal/Interactions/IVRM_Interactions',
                                            title: 'IVRM Interaction',
                                            description: 'IVRM Interaction'
                                        },
                                        {
                                            id: 2,
                                            name: 'NDA IVRM Interaction',
                                            icon: 'BookOpenText',
                                            url: '/StudentPortal/Interactions/NDA_IVRM_Interactions',
                                            title: 'NDA IVRM Interaction',
                                            description: 'NDA IVRM Interaction'
                                        }
                                        // {
                                        //     id: 3,
                                        //     name: 'SCS Interaction',
                                        //     icon: 'BookOpenText',
                                        //     url: '/StudentPortal/Interactions/SCS_IVRM_Interactions',
                                        //     title: 'SCS Interaction',
                                        //     description: 'SCS Interaction'
                                        // },
                                    ]
                                },
                                {
                                    id: 80019,
                                    name: 'Reports',
                                    icon: 'FileBarChart',
                                    pages: [
                                        {
                                            id: 2,
                                            name: 'School Staff Period Transaction Report',
                                            icon: 'BookOpenText',
                                            url: '/lesson-planner/lesson-planner-module/reports/school-staff-period-transaction-report',
                                            title: 'School Staff Period Transaction Report',
                                            description: 'School Staff Period Transaction Report'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Admission',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 2,
                                    name: 'Admission',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 40002,
                                            name: 'Attendance Details',
                                            icon: 'ClipboardList',
                                            url: '/StudentPortal/masters/attendance-details',
                                            title: 'Attendance Details'
                                        },

                                        {
                                            id: 40003,
                                            name: 'Online Leave Apply',
                                            icon: 'FilePlus',
                                            url: '/StudentPortal/student-dashboard/Admission/OnlineLeaveApp',
                                            title: 'Online Leave Application',
                                            description: 'Apply for Leave'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 4,
                            name: 'Fees',
                            icon: 'Banknote',
                            sub_menu: [
                                {
                                    id: 40004,
                                    name: 'Transaction',
                                    icon: 'CreditCard',
                                    pages: [
                                        {
                                            id: 40004,
                                            name: 'Cumulative Fee Analysis',
                                            icon: 'CreditCard',
                                            url: '/StudentPortal/masters/feecumulative',
                                            title: 'Cumulative Fee Analysis',
                                            description: 'View Fee Details'
                                        },
                                        {
                                            id: 40005,
                                            name: 'Fee Receipt',
                                            icon: 'FileText',
                                            url: '/StudentPortal/student-dashboard/Fees/Reports/PortalFeeReceipt',
                                            title: 'Portal Fee Receipt',
                                            description: 'View and Download Fee Receipts'
                                        },
                                        {
                                            id: 40006,
                                            name: 'Online Payment',
                                            icon: 'CreditCard',
                                            url: '/StudentPortal/masters/feeonlinpayment',
                                            title: 'Fee Online Payment',
                                            description: 'Pay Fees Online'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 5,
                            name: 'Exam',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 40007,
                                    name: 'Exam Module',
                                    icon: 'BookOpen',
                                    pages: [
                                        {
                                            id: 40007,
                                            name: 'Cumulative Subject',
                                            icon: 'BarChart3',
                                            url: '/StudentPortal/student-dashboard/Exam/CumulativeSubject',
                                            title: 'Cumulative Subject',
                                            description: 'View Cumulative Subject Performance'
                                        },

                                        {
                                            id: 40008,
                                            name: 'ExamReport( Report Card) ',
                                            icon: 'BarChart3',
                                            url: '/StudentPortal/student-dashboard/Exam/ExamReport',
                                            title: 'Exam Report',
                                            description: 'View Exam Report Performance'
                                        },
                                        {
                                            id: 40015,
                                            name: 'AI MCQ Quiz',
                                            icon: 'FileQuestion',
                                            url: '/StudentPortal/student-dashboard/Exam/OnlineMcqQuiz',
                                            title: 'AI MCQ Quiz',
                                            description: 'Take and view results of online MCQ assessments'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 6,
                            name: 'COE',
                            icon: 'Calendar',
                            sub_menu: [
                                {
                                    id: 40009,
                                    name: 'COE',
                                    icon: 'Calendar',
                                    pages: [
                                        {
                                            id: 40009,
                                            name: 'School Events',
                                            icon: 'Calendar',
                                            url: '/StudentPortal/coe/',
                                            title: 'Calendar of Events',
                                            description: 'View Calendar of Events'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 7,
                            name: 'Feedback',
                            icon: 'MessageSquare',
                            sub_menu: [
                                {
                                    id: 40010,
                                    name: 'Transaction',
                                    icon: 'List',
                                    pages: [
                                        {
                                            id: 40010,
                                            name: 'Student Complaints',
                                            icon: 'List',
                                            url: '/StudentPortal/student-dashboard/Feedback/Transaction/StudentCompliantsView',
                                            title: 'Student Complaints',
                                            description: 'View Student Complaints'
                                        },
                                        {
                                            id: 40011,
                                            name: 'Student Feedback',
                                            icon: 'List',
                                            url: '/StudentPortal/feedback/studentfeedback',
                                            title: 'Student Feedback Details',
                                            description: 'Provide Feedback'
                                        }
                                    ]
                                }
                            ]
                        }
                        //,
                        // {
                        //     id: 8,
                        //     name: 'User Password Creation',
                        //     icon: 'MessageSquare',
                        //     sub_menu: [
                        //         {
                        //             id: 40010,
                        //             name: 'Transaction',
                        //             icon: 'List',
                        //             pages: [
                        //                 {
                        //                     id: 40012,
                        //                     name: 'User Password Creation',
                        //                     icon: 'KeyRound',
                        //                     url: '/StudentPortal/transactions/user-password-creation',
                        //                     title: 'User Password Creation',
                        //                     description: 'Generate Usernames and Passwords'
                        //                 },
                        //                 {
                        //                     id: 40013,
                        //                     name: 'Student Password Creation',
                        //                     icon: 'LockKeyhole',
                        //                     url: '/StudentPortal/transactions/student-password-creation',
                        //                     title: 'Student Password Creation',
                        //                     description: 'Student Credentials Management'
                        //                 }
                        //             ]
                        //         }
                        //     ]
                        // }
                    ]
                },
                {
                    id: 5,
                    name: 'AI Edge',
                    icon: 'Sparkles',
                    menu: [
                        {
                            id: 1,
                            name: 'AI Edge',
                            icon: 'BookOpen',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'AI Tools',
                                    icon: 'Database',
                                    pages: [
                                        {
                                            id: 2,
                                            name: 'AI Notemaker',
                                            icon: 'FileText',
                                            url: '/StudentPortal/ai-notemaker',
                                            title: 'AI Notemaker',
                                            description: 'Summarize and create structured notes from textbooks using AI'
                                        },
                                        {
                                            id: 3,
                                            name: 'AI Performance Analysis',
                                            icon: 'BarChart',
                                            url: '/StudentPortal/ai-performance-analysis',
                                            title: 'AI Performance Analysis',
                                            description: 'Analyze performance metrics and AI-driven insights'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } else if (session?.role.toUpperCase() === 'SUPER ADMIN') {
        response = {
            success: true,
            message: 'Data fetched successfully!!',
            data: [
                {
                    id: 13,
                    name: 'Super Admin',
                    icon: 'Settings',
                    menu: [
                        {
                            id: 1,
                            name: 'Super Admin Module',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Master Trust',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Trust',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/masters/trust-master',
                                            title: 'Master Trust',
                                            description: 'Manage Master Trust Details'
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    name: 'Institution',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Master Institution',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/institution/master-institution',
                                            title: 'Master Institution',
                                            description: 'Manage Master Institution'
                                        },
                                        {
                                            id: 2,
                                            name: 'Institution Subscription',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/institution/institution-subscription',
                                            title: 'Institution Subscription',
                                            description: 'Manage Institution Subscription'
                                        },
                                        {
                                            id: 3,
                                            name: 'Auto Mapping',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/institution/auto-mapping',
                                            title: 'Auto Mapping',
                                            description: 'Manage Institution Auto Mapping'
                                        }
                                    ]
                                },
                                {
                                    id: 3,
                                    name: 'General Setting',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'General Setting Wizard',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/wizard',
                                            title: 'General Setting Wizard',
                                            description: 'General Setting Wizard'
                                        },
                                        {
                                            id: 2,
                                            name: 'Modules',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/module',
                                            title: 'Modules',
                                            description: 'Manage Master Modules'
                                        },
                                        {
                                            id: 7,
                                            name: 'Master Page',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-page',
                                            title: 'Master Page',
                                            description: 'Manage Master Page'
                                        },
                                        {
                                            id: 8,
                                            name: 'Page Mapping',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/page-mapping',
                                            title: 'Page Mapping',
                                            description: 'Map Pages to Modules'
                                        },
                                        {
                                            id: 9,
                                            name: 'Master Role',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-role',
                                            title: 'Master Role',
                                            description: 'Manage Master Role'
                                        },
                                        {
                                            id: 10,
                                            name: 'Master Role Type',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-role-type',
                                            title: 'Master Role Type',
                                            description: 'Manage Master Role Type'
                                        },
                                        {
                                            id: 11,
                                            name: 'Privileges',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/privileges',
                                            title: 'Privileges',
                                            description: 'Privileges'
                                        },
                                        {
                                            id: 3,
                                            name: 'Master Main Menu',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-main-menu',
                                            title: 'Master Main Menu',
                                            description: 'Manage Master Main Menu'
                                        },
                                        {
                                            id: 4,
                                            name: 'Master Sub Menu',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-sub-menu',
                                            title: 'Master Sub Menu',
                                            description: 'Manage Master Sub Menu'
                                        },
                                        {
                                            id: 5,
                                            name: 'Master Menu Page Mapping',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping',
                                            title: 'Master Menu Page Mapping',
                                            description: 'Manage Master Menu Page Mapping'
                                        },

                                        {
                                            id: 6,
                                            name: 'Master School Type',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/general-setting/master-school-type',
                                            title: 'Master School Type',
                                            description: 'Manage Master School Type'
                                        }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Configuration Setting',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Institution Module Page',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/configuration-setting/institution-module-page',
                                            title: 'Institution Module Page',
                                            description: 'Master Institution Role and Module Mapping'
                                        },

                                        {
                                            id: 2,
                                            name: 'Master Main Menu INS',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/configuration-setting/master-main-menu-ins',
                                            title: 'Master Main Menu INS',
                                            description: 'Master Main Menu Institution Mapping'
                                        },
                                        {
                                            id: 3,
                                            name: 'Master Sub Menu INS',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/configuration-setting/master-sub-menu-ins',
                                            title: 'Master Sub Menu INS',
                                            description: 'Master Sub Menu Institution Mapping'
                                        },
                                        {
                                            id: 4,
                                            name: 'Master Menu Page Mapping Institutionwise',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/configuration-setting/master-menu-page-mapping-institutionwise',
                                            title: 'Master Menu Page Mapping Institutionwise',
                                            description: 'Master Menu Page Mapping Institutionwise'
                                        }
                                    ]
                                },
                                {
                                    id: 5,
                                    name: 'Mobile Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 1,
                                            name: 'Mobile Master Page',
                                            icon: 'Settings',
                                            url: '/SuperAdmin/super-admin-module/configuration-setting/mobilemasterpage',
                                            title: 'Mobile Master Page',
                                            description: 'Mobile Master Page'
                                        },
                                        //  {
                                        //      id: 40007,
                                        //     name: 'Progress Card Report( Report Card) ',
                                        //     icon: 'BarChart3',
                                        //    url: '/StudentPortal/student-dashboard/Exam/ExamReport',
                                        //     title: 'Exam Report',
                                        //     description: 'View Exam Report Performance'
                                        // },
                                        {
                                            id: 40011,
                                            name: 'Cumulative Subject',
                                            icon: 'BarChart3',
                                            url: '/StudentPortal/student-dashboard/Exam/CumulativeSubject',
                                            title: 'Cumulative Subject',
                                            description: 'View Cumulative Subject Details'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 5,
                            name: 'COE',
                            icon: 'Calendar',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'COE',
                                    icon: 'Calendar',
                                    pages: [
                                        {
                                            id: 40008,
                                            name: 'School Events',
                                            icon: 'Calendar',
                                            url: '/StudentPortal/coe/',
                                            title: 'Calendar of Events',
                                            description: 'View Calendar of Events'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 6,
                            name: 'Feedback',
                            icon: 'MessageSquare',
                            sub_menu: [
                                {
                                    id: 1,
                                    name: 'Transaction',
                                    icon: 'List',
                                    pages: [
                                        {
                                            id: 40009,
                                            name: 'Student Complaints',
                                            icon: 'List',
                                            url: '/StudentPortal/student-dashboard/Feedback/Transaction/StudentCompliantsView',
                                            title: 'Student Complaints',
                                            description: 'View Student Complaints'
                                        },
                                        {
                                            id: 40010,
                                            name: 'Student Feedback',
                                            icon: 'List',
                                            url: '/StudentPortal/feedback/studentfeedback',
                                            title: 'Student Feedback Details',
                                            description: 'Provide Feedback'
                                            // id: 2,
                                            // name: 'Mobile Role Privileges',
                                            // icon: 'Settings',
                                            // url: '/SuperAdmin/super-admin-module/configuration-setting/mobileroleprivileges',
                                            // title: 'Mobile Role Privileges',
                                            // description: 'Mobile Role Privileges'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } else {
        response = {
            success: true,
            message: 'Data fetched successfully!!',
            data: [
                {
                    id: 1,
                    name: 'Preadmission',
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
                                            name: 'Pre Admission Form',
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
                // ,
                // {
                //     id: 9,
                //     name: 'Student Portal',
                //     icon: 'Users',
                //     menu: [
                //         {
                //             id: 1,
                //             name: 'Enrolled Students',
                //             icon: 'BookOpen',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Enrolled Students',
                //                     icon: 'Database',
                //                     pages: [
                //                         {
                //                             id: 0,
                //                             name: 'Dashboard',
                //                             icon: 'LayoutDashboard',
                //                             url: '/StudentPortal/student-dashboard',
                //                             title: 'StudentDashboard',
                //                             description: 'Main Dashboard'
                //                         },
                //                         {
                //                             id: 1,
                //                             name: 'Online Transfer Certificate',
                //                             icon: 'FileText',
                //                             url: '/StudentPortal/student-dashboard/EnrolledStudents/Transaction/OnlineTransferCertificate',
                //                             title: 'Online Transfer Certificate',
                //                             description: 'Apply for Transfer Certificate'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },

                //         {
                //             id: 2,
                //             name: 'Admission',
                //             icon: 'BookOpen',
                //             sub_menu: [
                //                 {
                //                     id: 2,
                //                     name: 'Admission',
                //                     icon: 'Database',
                //                     pages: [
                //                         // {
                //                         //     id: 40001,
                //                         //     name: 'Attendance Details',
                //                         //     icon: 'ClipboardList',
                //                         //     url: '/StudentPortal/student-dashboard/EnrolledStudents/Transaction/AttendanceDetails',
                //                         //     title: 'Attendance Details'
                //                         // },
                //                         {
                //                             id: 40001,
                //                             name: 'Attendance Details',
                //                             icon: 'ClipboardList',
                //                             url: '/StudentPortal/masters/attendance-details',
                //                             title: 'Attendance Details'
                //                         },
                //                         {
                //                             id: 40002,
                //                             name: 'Online Leave Application',
                //                             icon: 'FilePlus',
                //                             url: '/StudentPortal/student-dashboard/Admission/OnlineLeaveApp',
                //                             title: 'Online Leave Application',
                //                             description: 'Apply for Leave'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },

                //         {
                //             id: 3,
                //             name: 'Interaction',
                //             icon: 'MessageSquare',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Interaction',
                //                     icon: 'MessageSquare',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Interactions',
                //                             icon: 'MessageSquare',
                //                             url: '/StudentPortal/student-dashboard/Interaction/IVRM_Interaction/Interaction',
                //                             title: 'Interactions',
                //                             description: 'Interact with Staff and Students'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },

                //         // Duplicate Exam Module Removed
                //         {
                //             id: 5,
                //             name: 'Fees',
                //             icon: 'Banknote',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'Transaction',
                //                     icon: 'CreditCard',
                //                     pages: [
                //                         // {
                //                         //     id: 1,
                //                         //     name: 'Fee Details',
                //                         //     icon: 'FileText',
                //                         //     url: '/StudentPortal/student-dashboard/Fees/FeeDetails',
                //                         //     title: 'Fee Details',
                //                         //     description: 'View Fee Details'
                //                         // },
                //                         {
                //                             id: 2,
                //                             name: 'Fee Online Payment',
                //                             icon: 'CreditCard',
                //                             url: '/StudentPortal/student-dashboard/Fees/FeeOnlinePayment',
                //                             title: 'Fee Online Payment',
                //                             description: 'Pay Fees Online'
                //                         },
                //                         // {
                //                         //     id: 3,
                //                         //     name: 'CumulativeFeeAnalysis',
                //                         //     icon: 'CreditCard',
                //                         //     url: '/StudentPortal/masters/cumulative-fee-analysis',
                //                         //     title: 'Fee Online Payment',
                //                         //     description: 'Pay Fees Online'
                //                         // },

                //                         {
                //                             id: 4,
                //                             name: 'Cumulative Fee Analysis',
                //                             icon: 'CreditCard',
                //                             url: '/StudentPortal/masters/feecumulative',
                //                             title: 'Cumulative Fee Analysis',
                //                             description: 'View Fee Details'
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     id: 2,
                //                     name: 'Reports',
                //                     icon: 'FileText',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Portal Fee Receipt',
                //                             icon: 'FileText',
                //                             url: '/StudentPortal/student-dashboard/Fees/Reports/PortalFeeReceipt',
                //                             title: 'Portal Fee Receipt',
                //                             description: 'View and Download Fee Receipts'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },
                //         {
                //             id: 6,
                //             name: 'COE',
                //             icon: 'Calendar',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'COE',
                //                     icon: 'Calendar',
                //                     pages: [
                //                         // {
                //                         //     id: 1,
                //                         //     name: 'Calendar of Events',
                //                         //     icon: 'Calendar',
                //                         //     url: '/StudentPortal/student-dashboard/COE/COE',
                //                         //     title: 'Calendar of Events',
                //                         //     description: 'View Calendar of Events'
                //                         // },
                //                         {
                //                             id: 1,
                //                             name: 'Calendar of Events',
                //                             icon: 'Calendar',
                //                             url: '/StudentPortal/coe/',
                //                             title: 'Calendar of Events',
                //                             description: 'View Calendar of Events'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },
                //         {
                //             id: 8,
                //             name: 'FEEDBACK',
                //             icon: 'Calendar',
                //             sub_menu: [
                //                 {
                //                     id: 1,
                //                     name: 'COE',
                //                     icon: 'Calendar',
                //                     pages: [
                //                         {
                //                             id: 1,
                //                             name: 'Feedback College Parent Transaction',
                //                             icon: 'MessageSquare',
                //                             url: '/StudentPortal/student-dashboard/Feedback/Transaction/FeedbackCollegeParentTransaction',
                //                             title: 'Feedback College Parent Transaction',
                //                             description: 'Provide Feedback'
                //                         },
                //                         {
                //                             id: 2,
                //                             name: 'Student Feedback',
                //                             icon: 'MessageSquare',
                //                             url: '/StudentPortal/feedback/studentfeedback',
                //                             title: 'Student Feedback Details',
                //                             description: 'Provide Feedback'
                //                         },
                //                         {
                //                             id: 3,
                //                             name: 'Student Complaints',
                //                             icon: 'List',
                //                             url: '/StudentPortal/student-dashboard/Feedback/Transaction/StudentCompliantsView',
                //                             title: 'Student Complaints',
                //                             description: 'View Student Complaints'
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // }
            ]
        };
    }

    return response;
}
