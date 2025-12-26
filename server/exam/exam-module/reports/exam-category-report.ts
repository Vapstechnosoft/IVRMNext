'use server';

import { api } from '@/lib/apiService';

export const getInitialData = async () => {
    const url = 'ExamCategoryReport/getdetails/';
    try {
        const response = await api.get<any>('exam', url);
        // Ensure we return the data object similar to fallback structure
        if (response.success && response.data) {
            return response.data; 
        }
        // If API call success=false but no error thrown, or data missing, return fallback or empty
        console.warn("API returned success=false or no data, using fallback");
        throw new Error("API Data missing");
    } catch (error) {
        console.error('API Failed → Returning static fallback data', error);
        
        // Mock data for dropdowns
        const yearlist = [
            { asmaY_Id: 1, asmaY_Year: '2023-2024', Selected: true },
            { asmaY_Id: 2, asmaY_Year: '2024-2025', Selected: false },
        ];

        const grlist = [
            { emcA_Id: 10, emcA_CategoryName: 'Primary' },
            { emcA_Id: 11, emcA_CategoryName: 'High School' },
            { emcA_Id: 12, emcA_CategoryName: 'Higher Primary' },
        ];

        return {
            yearlist,
            grlist,
        };
    }
};

export const getReportData = async (data: any) => {
    const url = 'ExamCategoryReport/getAttendetails';
    console.log('Fetching Exam Category Report for:', data);
    try {
        const response = await api.post<any>('exam', url, data);
         if (response.success && response.data) {
            return response.data;
        }
        throw new Error("API Data missing");
    } catch (error) {
        console.error('API Failed → Returning static fallback data', error);

        // Mock response mimicking the API return
        const studentAttendanceList = [
            { emcA_Id: 10, emcA_CategoryName: 'Primary', emG_Id: 101, emG_GroupName: 'Languages', ismS_Id: 1001, ismS_SubjectName: 'English' },
            { emcA_Id: 10, emcA_CategoryName: 'Primary', emG_Id: 101, emG_GroupName: 'Languages', ismS_Id: 1002, ismS_SubjectName: 'Kannada' },
            { emcA_Id: 10, emcA_CategoryName: 'Primary', emG_Id: 102, emG_GroupName: 'Core Subjects', ismS_Id: 1003, ismS_SubjectName: 'Mathematics' },
            { emcA_Id: 10, emcA_CategoryName: 'Primary', emG_Id: 102, emG_GroupName: 'Core Subjects', ismS_Id: 1004, ismS_SubjectName: 'Science' },
            
            { emcA_Id: 11, emcA_CategoryName: 'High School', emG_Id: 201, emG_GroupName: 'Languages', ismS_Id: 1001, ismS_SubjectName: 'English' },
            { emcA_Id: 11, emcA_CategoryName: 'High School', emG_Id: 201, emG_GroupName: 'Languages', ismS_Id: 1005, ismS_SubjectName: 'Hindi' },
            { emcA_Id: 11, emcA_CategoryName: 'High School', emG_Id: 202, emG_GroupName: 'Science Group', ismS_Id: 1006, ismS_SubjectName: 'Physics' },
            { emcA_Id: 11, emcA_CategoryName: 'High School', emG_Id: 202, emG_GroupName: 'Science Group', ismS_Id: 1007, ismS_SubjectName: 'Chemistry' },
        ];

        const masterinstitution = [
            { mI_Name: 'Baldwin Boys High School', mI_Address1: 'Richmond Town, Bangalore', asC_Logo_Path: '' }
        ];

        // Filter if "Individual" (type=2) and category is selected
        let filteredList = studentAttendanceList;
        if (data.type === "2" && data.EMCA_Id) {
            filteredList = studentAttendanceList.filter(item => String(item.emcA_Id) === String(data.EMCA_Id));
        }

        return {
            studentAttendanceList: filteredList,
            masterinstitution
        };
    }
};
