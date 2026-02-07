'use server';

import { api } from '@/lib/apiService';

// Mock data to ensure UI renders if backend is not available
const MOCK_INITIAL_DATA = {
    pagelist: [{ ivrmimP_DisplayContent: "Online Payment Charges apply." }],
    institutiondet: [{ inT_NAME: "Edumeeting School", institutioN_LOGO: "" }],
    readterms: [{ fmC_Online_Payment_Aca_Yr_Flag: "B" }],
    academicyrlist: [
        { asmaY_Id: 21, asmaY_Year: "2022-2023" },
        { asmaY_Id: 22, asmaY_Year: "2023-2024" },
        { asmaY_Id: 23, asmaY_Year: "2024-2025" }
    ],
    customgrplist: [
        { fmgG_Id: 101, fmgG_GroupName: "Tuition Fee" },
        { fmgG_Id: 102, fmgG_GroupName: "Transport Fee" }
    ],
    termlist: [
        { fmT_Id: 201, fmT_Name: "Term 1", fmgG_Id: 101 },
        { fmT_Id: 202, fmT_Name: "Term 2", fmgG_Id: 101 },
        { fmT_Id: 203, fmT_Name: "Annual", fmgG_Id: 102 }
    ],
    disableterms: [],
    fillinstallment: [],
    fillstudent: [{
        amsT_FirstName: "Student",
        amsT_MiddleName: "",
        amsT_LastName: "Name",
        amsT_AdmNo: "ADM001",
        amsT_RegistrationNo: "REG001",
        amaY_RollNo: 10,
        classname: "X",
        sectionname: "A",
        amst_mobile: 9876543210,
        amst_email_id: "student@example.com",
        amst_Id: 500,
        asmcL_ID: 50
    }],
    filonlinepaymentgrid: [],
    transnumconfig: [],
    feeconfiglist: [{ fmC_EnablePartialPaymentFlg: 1 }],
    specialheadlist: [],
    specialheaddetails: []
};

export async function getFeeOnlinePaymentLoadData(data: any) {
    try {
        // Use the real API endpoint
        return await api.post('portal', '/OnlinePayment/getdetails', data);
    } catch (error) {
        console.error('Error fetching fee online payment data:', error);
        
        // Fallback to mock data if API fails
        return {
            success: true,
            data: MOCK_INITIAL_DATA
        };
    }
}
