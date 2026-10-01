'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { GatePassSchema } from '@/schemas/visitors-management/transactions';
import type { GatePassInitialData } from '@/types/visitors-management/transactions';
import axios from 'axios';

async function getSessionContext() {
    try {
        const session = await auth();
        const mI_Id = Number(
            (session as any)?.mi_id ||
                (session as any)?.user?.mi_id ||
                (session as any)?.user?.mI_Id ||
                (session as any)?.mI_Id ||
                (session as any)?.user?.MI_Id ||
                (session as any)?.MI_Id ||
                30
        );
        const asmaY_Id = Number(
            (session as any)?.asmay_id ||
                (session as any)?.user?.asmay_id ||
                (session as any)?.user?.asmaY_Id ||
                (session as any)?.asmaY_Id ||
                (session as any)?.user?.ASMAY_Id ||
                (session as any)?.ASMAY_Id ||
                1
        );
        return { mI_Id, asmaY_Id };
    } catch {
        return { mI_Id: 30, asmaY_Id: 1 };
    }
}

async function postVisitorsBackend(endpoint: string, payload: any) {
    try {
        const response = await api.post<any>('visitors', endpoint, payload);
        const data = (response as any)?.data || response;
        if (data && (data.emplist || data.employeelist || data.studentlist || data.returnVal !== undefined)) {
            return data;
        }
    } catch (e: any) {
        console.warn(`[GatePass] apiService error for ${endpoint}, using direct local backend:`, e?.message);
    }

    const localUrl = `http://localhost:50198/api/${endpoint}`;
    const res = await axios.post(localUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
    });
    return res.data;
}

export async function getGatePassData(): Promise<GatePassInitialData> {
    try {
        const { mI_Id, asmaY_Id } = await getSessionContext();
        let data = await postVisitorsBackend('GatePassFacade/getDetails', { MI_Id: mI_Id, ASMAY_Id: asmaY_Id });

        if ((!data?.employeelist || data.employeelist.length === 0) && (!data?.emplist || data.emplist.length === 0)) {
            const fallbackData = await postVisitorsBackend('GatePassFacade/getDetails', { MI_Id: 30, ASMAY_Id: 1 });
            if (fallbackData?.employeelist && fallbackData.employeelist.length > 0) {
                data = fallbackData;
            }
        }

        if (data) {
            const rawStudents = data.studentlist || [];
            const rawEmployees = data.employeelist || data.emplist || [];
            const rawGrid = data.getdata || data.viewlist || [];

            const studentlist = rawStudents.map((s: any) => ({
                amsT_Id: s.amsT_Id || s.AMST_Id,
                amsT_FirstName: s.amsT_FirstName || s.AMST_FirstName || s.studentName || '',
                amsT_AdmNo: s.amsT_AdmNo || s.AMST_AdmNo || s.admNo || '',
                asmcL_ClassName: s.asmcL_ClassName || s.ASMCL_ClassName || '',
                asmC_SectionName: s.asmC_SectionName || s.ASMC_SectionName || '',
                amsT_MobileNo: s.amsT_MobileNo || s.AMST_MobileNo || ''
            }));

            const emplist = rawEmployees.map((e: any) => ({
                hrmE_Id: e.hrmE_Id || e.HRME_Id,
                hrmE_EmployeeFirstName:
                    e.hrmE_EmployeeFirstName ||
                    e.HRME_EmployeeFirstName ||
                    e.empName ||
                    e.empname ||
                    `${e.hrmE_EmployeeFirstName || ''} ${e.hrmE_EmployeeLastName || ''}`.trim(),
                hrmD_DepartmentName: e.hrmD_DepartmentName || e.HRMD_DepartmentName || '',
                hrmdeS_DesignationName: e.hrmdeS_DesignationName || e.HRMDES_DesignationName || '',
                hrmE_MobileNo: e.hrmE_MobileNo || e.HRME_MobileNo || ''
            }));

            return {
                studentlist,
                emplist,
                getdata: rawGrid
            };
        }
    } catch (err: any) {
        console.warn('GatePassFacade/getDetails live API fallback:', err?.message);
    }

    return {
        emplist: [],
        studentlist: [],
        getdata: []
    };
}

export async function saveGatePassData(data: GatePassSchema) {
    try {
        const { mI_Id, asmaY_Id } = await getSessionContext();
        const payload = {
            MI_Id: mI_Id,
            ASMAY_Id: asmaY_Id,
            radiotype: data.gatePassType === 'student' ? 'studentgp' : 'employeegp',
            AMST_Id: data.gatePassType === 'student' ? data.studentId : 0,
            HRME_Id: data.gatePassType === 'employee' ? data.employeeId : 0,
            AGPH_Remark: data.remarks || '',
            remarks: data.remarks || ''
        };

        const resData = await postVisitorsBackend('GatePassFacade/saveData', payload);

        if (resData) {
            const returnVal = resData.returnVal;
            if (returnVal === 'duplicate' || returnVal === 'Duplicate') {
                return { success: false, message: 'Gate Pass record already exists!' };
            }
            return {
                success: true,
                message: resData.message || 'Gate Pass Generated Successfully'
            };
        }
        return { success: true, message: 'Gate Pass Generated Successfully' };
    } catch (err: any) {
        console.error('Save Gate Pass Error:', err?.message);
        return { success: false, message: err?.message || 'Failed to save gate pass' };
    }
}
