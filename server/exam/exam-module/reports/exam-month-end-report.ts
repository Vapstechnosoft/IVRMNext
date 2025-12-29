'use server';

export const getInitialData = async () => {
    // Mock data for initial dropdowns
    const acdlist = [
        { asmaY_Id: 1, asmaY_Year: '2023-2024', Selected: true },
        { asmaY_Id: 2, asmaY_Year: '2024-2025', Selected: false }
    ];

    const monthlist = [
        { ivrM_Month_Id: 1, ivrM_Month_Name: 'January', Selected: false },
        { ivrM_Month_Id: 2, ivrM_Month_Name: 'February', Selected: false },
        { ivrM_Month_Id: 3, ivrM_Month_Name: 'March', Selected: false },
        { ivrM_Month_Id: 10, ivrM_Month_Name: 'October', Selected: true }
    ];

    const examlist = [
        { emE_Id: 1, emE_ExamName: 'Mid Term Exam', Selected: false },
        { emE_Id: 2, emE_ExamName: 'Annual Exam', Selected: false },
        { emE_Id: 3, emE_ExamName: 'Monthly Test', Selected: true }
    ];

    return {
        acdlist,
        monthlist,
        examlist
    };
};

export const getReportData = async (_data: any) => {
    // Mock report data
    // Logic to return different data based on input if needed, but simple mock for now
    const datareport = [
        { asmcL_ClassName: 'Class 1 A', pass: 25, fail: 5 },
        { asmcL_ClassName: 'Class 2 A', pass: 28, fail: 2 },
        { asmcL_ClassName: 'Class 3 A', pass: 30, fail: 0 },
        { asmcL_ClassName: 'Class 4 A', pass: 20, fail: 10 },
        { asmcL_ClassName: 'Class 5 A', pass: 22, fail: 8 }
    ];

    return {
        datareport
    };
};
