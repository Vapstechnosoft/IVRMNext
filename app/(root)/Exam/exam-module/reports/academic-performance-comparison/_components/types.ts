export interface IFilterParams {
    academicYear: string;
    exam: string;
    subject: string;
    comparisonType: 'section_vs_section' | 'teacher_vs_teacher' | 'class_vs_class';
    selectedClass: string;
    sectionA: string;
    sectionB: string;
    teacherA: string;
    teacherB: string;
    fromPeriod?: string;
    toPeriod?: string;
}

export interface IKeyHighlight {
    title: string;
    group: string;
    value: string;
    type: 'higher_avg' | 'higher_pass' | 'highest_marks' | 'lowest_marks';
}

export interface IMetricComparison {
    metric: string;
    groupAVal: string | number;
    groupBVal: string | number;
    difference: string;
    remarks: string;
    highlightA?: boolean;
    highlightB?: boolean;
}

export interface IGradeDistribution {
    gradeLabel: string;
    groupAPercent: number;
    groupBPercent: number;
}

export interface IAssessmentTrend {
    assessment: string;
    groupAScore: number;
    groupBScore: number;
}

export interface IScoreRangeDistribution {
    range: string;
    groupACount: number;
    groupAPercent: number;
    groupBCount: number;
    groupBPercent: number;
    difference: number;
}

export interface ITopPerformer {
    rank: number;
    rollNo: string;
    studentName: string;
    marksPercent: number;
}

export interface ITeacherProfile {
    name: string;
    employeeId: string;
    department: string;
    designation: string;
    joiningDate: string;
    photoUrl?: string;
}

export interface ITeacherOverviewStats {
    totalClasses: number;
    totalStudents: number;
    averageMarks: number;
    passPercentage: number;
    highestMarks: number;
    lowestMarks: number;
}

export interface ISubjectPerformance {
    subject: string;
    totalStudents: number;
    averageMarks: number;
    passPercentage: number;
    highestMarks: number;
    lowestMarks: number;
    avgGrade: string;
}

export interface IClassSectionPerformance {
    className: string;
    section: string;
    subject: string;
    totalStudents: number;
    averageMarks: number;
    passPercentage: number;
    highestMarks: number;
    lowestMarks: number;
}

export interface ITeacherOverallTopPerformer {
    rank: number;
    studentName: string;
    classSection: string;
    subject: string;
    marksPercent: number;
}
