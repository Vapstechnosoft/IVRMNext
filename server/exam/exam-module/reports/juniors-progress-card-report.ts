'use server';

const ACADEMIC_YEARS = [
    { asmaY_Id: 2023, asmaY_Year: '2023-2024' },
];

const CLASSES = [
    { asmcL_Id: 10, asmcL_ClassName: 'I' },
    { asmcL_Id: 11, asmcL_ClassName: 'II' }
];

const SECTIONS = [
    { asmS_Id: 100, asmC_SectionName: 'A' },
    { asmS_Id: 101, asmC_SectionName: 'B' }
];

const EXAMS = [
    { emE_Id: 50, emE_ExamName: 'Mid Term' },
];

const STUDENTS = [
    { amsT_Id: 1, studentname: 'John Doe', amsT_AdmNo: 'A001' },
    { amsT_Id: 2, studentname: 'Jane Smith', amsT_AdmNo: 'A002' }
];

export async function getDetails() {
    return {
        acdlist: ACADEMIC_YEARS
    };
}

export async function getClasses(yearId: any) {
    return {
        ctlist: CLASSES
    };
}

export async function getSections(classId: any) {
    return {
        seclist: SECTIONS
    };
}

export async function getExamsAndStudents(sectionId: any) {
    return {
        examlist: EXAMS,
        studentlist: STUDENTS
    };
}

export async function getReportDetails(data: any) {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
          year: '2023-2024',
          class: 'I',
          section: 'A',
          exam: 'Mid Term',
          students: (data.selectedStudents || []).map((id: string) => {
              const student = STUDENTS.find(s => String(s.amsT_Id) === String(id));
              return {
                  ...student,
                  subjects: [
                      { name: 'English', marks: 85, grade: 'A' },
                      { name: 'Maths', marks: 92, grade: 'A+' },
                      { name: 'Science', marks: 78, grade: 'B' }
                  ],
                  total: 255,
                  percentage: 85
              };
          })
      };
}
