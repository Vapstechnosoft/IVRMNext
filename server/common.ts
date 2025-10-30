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
                                        name: 'Bank',
                                        icon: 'Building2',
                                        url: '/hrms/masters/bank',
                                        title: 'Bank Master',
                                        description: 'Manage Bank Details'
                                    },
                                    {
                                        id: 2,
                                        name: 'Course',
                                        icon: 'BookOpen',
                                        url: '/hrms/masters/course',
                                        title: 'Course Master',
                                        description: 'Manage Course Details'
                                    },
                                    {
                                        id: 3,
                                        name: 'Employee Category',
                                        icon: 'Users',
                                        url: '/hrms/masters/employee-category',
                                        title: 'Employee Category Management',
                                        description: 'Manage Employee Categories and Classifications'
                                    },
                                    {
                                        id: 4,
                                        name: 'Gender',
                                        icon: 'Users',
                                        url: '/hrms/masters/gender',
                                        title: 'Gender Master',
                                        description: 'Manage Gender Details'
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
                                        name: 'Earnings & Deductions',
                                        icon: 'DollarSign',
                                        url: '/hrms/masters/earnings-deductions',
                                        title: 'Earnings & Deductions',
                                        description: 'Manage Salary Components'
                                    },
                                    {
                                        id: 8,
                                        name: 'Professional Tax',
                                        icon: 'FileText',
                                        url: '/hrms/masters/professional-tax',
                                        title: 'Professional Tax Slab',
                                        description: 'Manage Professional Tax'
                                    },
                                    {
                                        id: 9,
                                        name: 'Payroll Standard',
                                        icon: 'Calculator',
                                        url: '/hrms/masters/payroll-standard',
                                        title: 'Payroll Standard',
                                        description: 'Manage Payroll Standards'
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
                                        name: 'Leave Year',
                                        icon: 'Calendar',
                                        url: '/hrms/masters/leave-year',
                                        title: 'Leave Year Master',
                                        description: 'Manage Leave Year'
                                    },
                                    {
                                        id: 12,
                                        name: 'Group-Dept-Dessg Mapping',
                                        icon: 'Network',
                                        url: '/hrms/masters/group-dept-dessg-mapping',
                                        title: 'Group-Dept-Dessg Mapping',
                                        description: 'Map Group, Department & Designation'
                                    },
                                    {
                                        id: 13,
                                        name: 'Religion-Category Mapping',
                                        icon: 'Link',
                                        url: '/hrms/masters/religion-category-mapping',
                                        title: 'Religion-Category Mapping',
                                        description: 'Map Religion & Category'
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
                                        name: 'Salary Calculation',
                                        icon: 'Calculator',
                                        url: '/hrms/transactions/salary-calculation',
                                        title: 'Salary Calculation',
                                        description: 'Calculate Employee Salary'
                                    },
                                    {
                                        id: 2,
                                        name: 'Salary Approval',
                                        icon: 'CheckSquare',
                                        url: '/hrms/transactions/salary-approval',
                                        title: 'Salary Approval',
                                        description: 'Approve Calculated Salaries'
                                    },
                                    {
                                        id: 3,
                                        name: 'Salary Updation',
                                        icon: 'Edit',
                                        url: '/hrms/transactions/salary-updation',
                                        title: 'Salary Updation',
                                        description: 'Update Employee Salary'
                                    },
                                    {
                                        id: 4,
                                        name: 'Salary Increment',
                                        icon: 'TrendingUp',
                                        url: '/hrms/transactions/salary-increment',
                                        title: 'Salary Increment',
                                        description: 'Manage Salary Increments'
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
                                        name: 'Employee Loan',
                                        icon: 'CreditCard',
                                        url: '/hrms/transactions/employee-loan',
                                        title: 'Employee Loan',
                                        description: 'Manage Employee Loans'
                                    },
                                    {
                                        id: 7,
                                        name: 'Salary Advance',
                                        icon: 'DollarSign',
                                        url: '/hrms/transactions/salary-advance',
                                        title: 'Salary Advance',
                                        description: 'Manage Salary Advances'
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
                                        name: 'Advance Report',
                                        icon: 'FileSearch',
                                        url: '/hrms/reports/advance-report',
                                        title: 'Advance Report',
                                        description: 'View Advance Reports'
                                    },
                                    {
                                        id: 2,
                                        name: 'Bank Cash Report',
                                        icon: 'Banknote',
                                        url: '/hrms/reports/bank-cash-report',
                                        title: 'Bank Cash Report',
                                        description: 'Bank & Cash Summary'
                                    },
                                    {
                                        id: 3,
                                        name: 'Cumulative Salary Report',
                                        icon: 'BarChart3',
                                        url: '/hrms/reports/cumulative-salary-report',
                                        title: 'Cumulative Salary Report',
                                        description: 'Cumulative Salary Analysis'
                                    },
                                    {
                                        id: 4,
                                        name: 'Department Salary Report',
                                        icon: 'Building2',
                                        url: '/hrms/reports/department-salary-report',
                                        title: 'Department Salary Report',
                                        description: 'Department-wise Salary'
                                    },
                                    {
                                        id: 5,
                                        name: 'Employee Details',
                                        icon: 'UserCheck',
                                        url: '/hrms/reports/employee-details',
                                        title: 'Employee Details',
                                        description: 'Detailed Employee Information'
                                    },
                                    {
                                        id: 6,
                                        name: 'Salary Slip',
                                        icon: 'Receipt',
                                        url: '/hrms/reports/salary-slip',
                                        title: 'Salary Slip',
                                        description: 'Generate Salary Slips'
                                    },
                                    {
                                        id: 7,
                                        name: 'HRMS Month End Report',
                                        icon: 'CalendarCheck',
                                        url: '/hrms/reports/hrms-monthend-report',
                                        title: 'HRMS Month End Report',
                                        description: 'Monthly Closure Report'
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
                                    {
                                        id: 1,
                                        name: 'Master Shift',
                                        icon: 'Clock',
                                        url: '/hrms/attendance-management/masters/master-shift',
                                        title: 'Master Shift',
                                        description: 'Manage Shift Definitions'
                                    },
                                    {
                                        id: 2,
                                        name: 'Employee Missing Logs',
                                        icon: 'AlertCircle',
                                        url: '/hrms/attendance-management/masters/employee-missing-logs',
                                        title: 'Employee Missing Logs',
                                        description: 'Track Missing Attendance Logs'
                                    },
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
                                    {
                                        id: 5,
                                        name: 'Master Driver Shift',
                                        icon: 'Truck',
                                        url: '/hrms/attendance-management/masters/master-driver-shift',
                                        title: 'Master Driver Shift',
                                        description: 'Manage Driver Shifts'
                                    },
                                    {
                                        id: 6,
                                        name: 'Shift Setting Master',
                                        icon: 'Settings',
                                        url: '/hrms/attendance-management/masters/shift-setting-master',
                                        title: 'Shift Setting Master',
                                        description: 'Configure Shift Settings'
                                    },
                                    {
                                        id: 7,
                                        name: 'GPS Location Attendance',
                                        icon: 'MapPin',
                                        url: '/hrms/attendance-management/masters/gps-location-attendance',
                                        title: 'GPS Location Attendance',
                                        description: 'GPS-based Attendance'
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
                                        name: 'Month End Report',
                                        icon: 'CalendarCheck',
                                        url: '/hrms/attendance-management/reports/fo-monthend-report',
                                        title: 'Month End Report',
                                        description: 'Monthly Attendance Summary'
                                    },
                                    {
                                        id: 6,
                                        name: 'GPS Location Report',
                                        icon: 'MapPin',
                                        url: '/hrms/attendance-management/reports/gps-location-report',
                                        title: 'GPS Location Report',
                                        description: 'GPS Attendance Report'
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
                                    },
                                    {
                                        id: 3,
                                        name: 'Master Leave Year',
                                        icon: 'CalendarRange',
                                        url: '/hrms/leave-management/masters/master-leaveYear',
                                        title: 'Master Leave Year',
                                        description: 'Manage Leave Year'
                                    }
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
                                        name: 'Leave Credit',
                                        icon: 'Plus',
                                        url: '/hrms/leave-management/transaction/leave-credit',
                                        title: 'Leave Credit',
                                        description: 'Credit Leave Balance'
                                    },
                                    {
                                        id: 2,
                                        name: 'Leave Credit Addition',
                                        icon: 'PlusCircle',
                                        url: '/hrms/leave-management/transaction/leave-credit-addition',
                                        title: 'Leave Credit Addition',
                                        description: 'Add Leave Credits'
                                    },
                                    {
                                        id: 3,
                                        name: 'Leave Credit Deduction',
                                        icon: 'MinusCircle',
                                        url: '/hrms/leave-management/transaction/leave-credit-deduction',
                                        title: 'Leave Credit Deduction',
                                        description: 'Deduct Leave Credits'
                                    },
                                    {
                                        id: 4,
                                        name: 'Leave Carryforward',
                                        icon: 'ArrowRight',
                                        url: '/hrms/leave-management/transaction/leave-carryforward',
                                        title: 'Leave Carryforward',
                                        description: 'Carryforward Leave Balance'
                                    },
                                    {
                                        id: 5,
                                        name: 'Comp Off Approval',
                                        icon: 'CheckSquare',
                                        url: '/hrms/leave-management/transaction/comp-off-approval',
                                        title: 'Comp Off Approval',
                                        description: 'Approve Compensatory Off'
                                    },
                                    {
                                        id: 6,
                                        name: 'Leave Credit Details',
                                        icon: 'Info',
                                        url: '/hrms/leave-management/transaction/leave-credit-details',
                                        title: 'Leave Credit Details',
                                        description: 'View Leave Credit Details'
                                    },
                                    {
                                        id: 7,
                                        name: 'Leave Credit Transaction',
                                        icon: 'List',
                                        url: '/hrms/leave-management/transaction/leave-credit-transaction',
                                        title: 'Leave Credit Transaction',
                                        description: 'Leave Transaction History'
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
                                    },
                                    {
                                        id: 2,
                                        name: 'Overall Report',
                                        icon: 'BarChart3',
                                        url: '/hrms/leave-management/reports/overAll-report',
                                        title: 'Overall Report',
                                        description: 'Overall Leave Analysis'
                                    },
                                    {
                                        id: 3,
                                        name: 'Unauthorized Leave Report',
                                        icon: 'AlertTriangle',
                                        url: '/hrms/leave-management/reports/unauthorizedLeaveCount-report',
                                        title: 'Unauthorized Leave Report',
                                        description: 'Unauthorized Leave Count'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 5,
                        name: 'Exit Management',
                        icon: 'LogOut',
                        sub_menu: [
                            {
                                id: 1,
                                name: 'Exit',
                                icon: 'DoorOpen',
                                pages: [
                                    {
                                        id: 1,
                                        name: 'Checklist Master',
                                        icon: 'ListChecks',
                                        url: '/hrms/exit-management/exit/checklist-master',
                                        title: 'Checklist Master',
                                        description: 'Manage Exit Checklist'
                                    },
                                    {
                                        id: 2,
                                        name: 'Leaving Reason',
                                        icon: 'MessageSquare',
                                        url: '/hrms/exit-management/exit/leaving-reason',
                                        title: 'Leaving Reason',
                                        description: 'Manage Leaving Reasons'
                                    }
                                ]
                            },
                            {
                                id: 2,
                                name: 'Transaction',
                                icon: 'FileText',
                                pages: [
                                    {
                                        id: 1,
                                        name: 'Employee Resign',
                                        icon: 'UserMinus',
                                        url: '/hrms/exit-management/transaction/employee-resign',
                                        title: 'Employee Resign',
                                        description: 'Process Employee Resignation'
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
                                        name: 'Employee Exit Report',
                                        icon: 'FileSearch',
                                        url: '/hrms/exit-management/reports/employee-exit-report',
                                        title: 'Employee Exit Report',
                                        description: 'Exit Summary Report'
                                    },
                                    {
                                        id: 2,
                                        name: 'Relieving Letter',
                                        icon: 'FileCheck',
                                        url: '/hrms/exit-management/reports/relieving-letter',
                                        title: 'Relieving Letter',
                                        description: 'Generate Relieving Letter'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 6,
                        name: 'Pre Config',
                        icon: 'Settings',
                        sub_menu: [
                            {
                                id: 1,
                                name: 'Configuration',
                                icon: 'Sliders',
                                pages: [
                                    {
                                        id: 1,
                                        name: 'HR Authorisation',
                                        icon: 'Shield',
                                        url: '/hrms/pre-config/configuration/hr-authorisation',
                                        title: 'HR Authorisation',
                                        description: 'Configure HR Authorizations'
                                    },
                                    {
                                        id: 2,
                                        name: 'Staff User Creation',
                                        icon: 'UserPlus',
                                        url: '/hrms/pre-config/configuration/staff-user-creation',
                                        title: 'Staff User Creation',
                                        description: 'Create Staff Users'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 3,
                name: 'Fees Management',
                icon: 'DollarSign',
                menu: [
                        {
                            id: 2,
                            name: 'Fees',
                            icon: 'Settings',
                            sub_menu: [
                                {
                                    id: 3,
                                    name: 'Configuration',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 25,
                                            name: 'Fee configuration',
                                            icon: 'Settings',
                                            url: '/fees/configuration/masterfeeconfig',
                                            title: 'Fee configuration',
                                            description: 'Fee configuration'
                                        }
                                    ]
                                },
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
                                            description: 'Manage Class Category'
                                        },
                                        {
                                            id: 13,
                                            name: 'Category',
                                            icon: 'Settings',
                                            url: '/fees/masters/category',
                                            title: 'Category',
                                            description: 'Manage Category'
                                        },
                                        {
                                            id: 14,
                                            name: 'Installment',
                                            icon: 'Settings',
                                            url: '/fees/masters/feesinstallment',
                                            title: 'Installment',
                                            description: ' Manage Installment'
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
                                            description: 'Manage Group Grouping'
                                        },
                                        {
                                            id: 17,
                                            name: 'Groups',
                                            icon: 'Settings',
                                            url: '/fees/masters/mastergroup',
                                            title: 'Groups',
                                            description: 'Manage Groups'
                                        },
                                        {
                                            id: 19,
                                            name: 'Yearly Groups',
                                            icon: 'Settings',
                                            url: '/fees/masters/yearlygroup',
                                            title: 'Yearly Groups',
                                            description: 'Manage Yearly Groups'
                                        },
                                        {
                                            id: 18,
                                            name: 'Yearly Groups Mapping',
                                            icon: 'Settings',
                                            url: '/fees/masters/yearlyfeegroupmapping',
                                            title: 'Yearly Groups Mapping',
                                            description: 'Manage Yearly Groups Mapping'
                                        },
                                        {
                                            id: 21,
                                            name: 'Group wise  Auto Receipt',
                                            icon: 'Settings',
                                            url: '/fees/masters/groupwiseautoreceipt',
                                            title: 'Yearly Groups Mapping',
                                            description: 'Manage Yearly Groups Mapping'
                                        },
                                        {
                                            id: 22,
                                            name: 'Yearly Rebate Settings',
                                            icon: 'Settings',
                                            url: '/fees/masters/yearlyrebatesetting',
                                            title: 'Yearly Rebate Settings',
                                            description: 'Manage Yeary Rebate Settings'
                                        },
                                        {
                                            id: 24,
                                            name: 'Fee Privilege',
                                            icon: 'Settings',
                                            url: '/fees/masters/feeprevilege',
                                            title: 'Fee Privilege',
                                            description: 'Manage Fee Privilege Details'
                                        }
                                        // {
                                        //     id: 25,
                                        //     name: 'Online Payment Head Group Mapping',
                                        //     icon: 'Settings',
                                        //     url: '/fees/masters/onlinepaymentheadgroupmapping',
                                        //     title: 'Fee Privilege',
                                        //     description: 'Manage Online Payment Head GroupMapping Details'
                                        // }
                                    ]
                                },
                                {
                                    id: 4,
                                    name: 'Transactions',
                                    icon: 'Settings',
                                    pages: [
                                        {
                                            id: 26,
                                            name: 'Fee Amount Entry',
                                            icon: 'Settings',
                                            url: '/fees/transactions/feeamountentry',
                                            title: 'amount Entry',
                                            description: 'amount Entry'
                                        },
                                        {
                                            id: 27,
                                            name: 'Third Party Transaction',
                                            icon: 'Settings',
                                            url: '/fees/transactions/thirdPartyTransaction',
                                            title: 'Third Party Transaction',
                                            description: 'Third Party Transaction'
                                        },
                                        {
                                            id: 28,
                                            name: 'Fee Opening Balance',
                                            icon: 'Settings',
                                            url: '/fees/transactions/feeopeningbalance',
                                            title: 'Fee Opening Balance',
                                            description: 'Fee Opening Balance'
                                        },
                                        {
                                            id: 29,
                                            name: 'Fee waivedoff',
                                            icon: 'Settings',
                                            url: '/fees/transactions/waivedoff',
                                            title: 'Fee Transactions',
                                            description: 'Fee Transactions'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
            },
            {
                id: 4,
                name: 'Exam',
                icon: 'GraduationCap',
                menu: []
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
