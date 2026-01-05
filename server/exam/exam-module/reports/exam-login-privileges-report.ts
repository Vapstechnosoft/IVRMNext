'use server';

const ACADEMIC_YEARS = [
    { asmaY_Id: 2023, asmaY_Year: '2023-2024' },
    { asmaY_Id: 2024, asmaY_Year: '2024-2025' }
];

const CATEGORIES = [
    { emcA_Id: 1, emcA_CategoryName: 'Primary' },
    { emcA_Id: 2, emcA_CategoryName: 'Calculated' }
];

const CLASSES = [
    { asmcL_Id: 10, asmcL_ClassName: 'I' },
    { asmcL_Id: 11, asmcL_ClassName: 'II' }
];

const SECTIONS = [
    { asmS_Id: 100, asmC_SectionName: 'A' },
    { asmS_Id: 101, asmC_SectionName: 'B' }
];

const EMPLOYEES = [
    { hrmE_Id: 500, hrmE_EmployeeFirstName: 'John Doe' },
    { hrmE_Id: 501, hrmE_EmployeeFirstName: 'Jane Smith' }
];

export async function getDetails() {
    return {
        acdlist: ACADEMIC_YEARS
    };
}

export async function getCategories(yearId: any) {
    return {
        catlist: CATEGORIES
    };
}

export async function getClasses(categoryId: any) {
    return {
        ctlist: CLASSES
    };
}

export async function getSections(classId: any) {
    return {
        seclist: SECTIONS
    };
}

export async function getEmployees(sectionId: any) {
    return {
        emplist: EMPLOYEES
    };
}

export async function getReportDetails(data: any) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock response based on logic
    const mockData = [
          {
            ASMCL_ClassName: 'I',
            ASMC_SectionName: 'A',
            Employeename: 'John Doe',
            subjectlist: [
                { ISMS_SubjectName: 'Mathematics' },
                { ISMS_SubjectName: 'English' }
            ]
          },
          {
            ASMCL_ClassName: 'I',
            ASMC_SectionName: 'B',
            Employeename: 'Jane Smith',
            subjectlist: [
                { ISMS_SubjectName: 'Science' },
                 { ISMS_SubjectName: 'Social' }
            ]
          }
      ];

    return {
        datareport: mockData
    };
}
