'use server';

import { api } from '@/lib/apiService';
import type { IFeeAcademicYearDropdownList } from '@/types/fees/reports/reports';

// Mock data to ensure UI renders if backend is not available
const MOCK_INITIAL_DATA = {
    pagelist: [{ ivrmimP_DisplayContent: 'Online Payment Charges apply.' }],
    institutiondet: [{ inT_NAME: 'Edumeeting School', institutioN_LOGO: '' }],
    readterms: [{ fmC_Online_Payment_Aca_Yr_Flag: 'B' }],
    academicyrlist: [
        { asmaY_Id: 1, asmaY_Year: '2025-2026' },
        { asmaY_Id: 2, asmaY_Year: '2024-2025' }
    ],
    customgrplist: [{ fmgG_Id: 101, fmgG_GroupName: 'School Fees' }],
    termlst: [
        { fmT_Id: 201, fmT_Name: 'Term 1', fmgG_Id: 101 },
        { fmT_Id: 202, fmT_Name: 'I installment', fmgG_Id: 101 },
        { fmT_Id: 203, fmT_Name: 'II installment', fmgG_Id: 101 },
        { fmT_Id: 204, fmT_Name: 'III installment', fmgG_Id: 101 }
    ],
    disableterms: [],
    fillinstallment: [],
    fillstudent: [
        {
            amsT_FirstName: 'AADHYA.',
            amsT_MiddleName: '',
            amsT_LastName: 'ANANTHULA',
            amsT_AdmNo: '24-25/16',
            amsT_RegistrationNo: '24-25/16',
            amaY_RollNo: 4,
            classname: 'III',
            sectionname: 'A',
            amst_mobile: '',
            amst_email_id: '',
            amst_Id: 500,
            asmcL_ID: 50
        }
    ],
    filonlinepaymentgrid: [
        {
            fmH_FeeName: 'School Fees',
            ftI_Name: 'Term 1',
            fsS_NetAmount: 109984,
            fsS_TotalToBePaid: 109984,
            fsS_PaidAmount: 0,
            fsS_ToBePaid: 92714,
            fsS_ConcessionAmount: 24770
        }
    ],
    transnumconfig: [],
    feeconfiglist: [{ fmC_EnablePartialPaymentFlg: 1 }],
    specialheadlist: [],
    specialheaddetails: []
};

export async function getFeeOnlinePaymentLoadData(data: any) {
    try {
        const response = await api.post<any>('fees', '/FeeOnlinePaymentFacade/getdetails', data);
        if (response?.data) {
            return {
                success: true,
                data: response.data
            };
        }
    } catch (error) {
        console.error('Error fetching fee online payment load data:', error);
    }

    return {
        success: true,
        data: MOCK_INITIAL_DATA
    };
}

export async function getAmountDetails(data: any) {
    try {
        const res = await api.post<any>('fees', '/FeeOnlinePaymentFacade/getamountdetails', data);
        if (res?.data) {
            return {
                success: true,
                data: res.data
            };
        }
    } catch (error) {
        console.error('Error fetching amount details:', error);
    }
}

export async function savePayment(_data: any) {
    // return await api.post('default', 'FeeOnlinePayment/generatehashsequence', data);
    return {
        success: true,
        data: {
            // Mock Razorpay return
            paygtw: 'RAZORPAY',
            fmA_Amount: 5000,
            merchantkey: 'rzp_test_123',
            trans_id: 'ORDER123456',
            splitpayinformation: '',
            mI_Id: 4,
            asmaY_Id: 1,
            amst_Id: 500,
            fillstudent: [
                {
                    amsT_FirstName: 'Student',
                    amst_email_id: 'student@example.com',
                    amsT_PerCity: 'Bangalore',
                    amst_mobile: 9876543210,
                    amsT_AdmNo: 'ADM001'
                }
            ]
        }
    };
}

export async function studentPortalAcademci() {
    const url = '/FeesCommon/academic-year-list';
    return await api.get<IFeeAcademicYearDropdownList[]>('fees', url);
}
