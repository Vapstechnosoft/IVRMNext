import type {
    IAssessmentTrend,
    IClassSectionPerformance,
    IFilterParams,
    IGradeDistribution,
    IKeyHighlight,
    IMetricComparison,
    IScoreRangeDistribution,
    ISubjectPerformance,
    ITeacherOverallTopPerformer,
    ITeacherOverviewStats,
    ITeacherProfile,
    ITopPerformer
} from './types';

export const defaultFilterParams: IFilterParams = {
    academicYear: '2025-26',
    exam: 'Term 1',
    subject: 'Mathematics',
    comparisonType: 'section_vs_section',
    selectedClass: 'VIII',
    sectionA: 'VIII-A (Teacher A)',
    sectionB: 'VIII-B (Teacher B)',
    teacherA: 'Ms. Ramesh Kumar',
    teacherB: 'Mrs. Anitha S',
    fromPeriod: 'Unit Test 1',
    toPeriod: 'Term 1 Exam'
};

export const schoolInfo = {
    name: 'SRI RAMAKRISHNA VIDYASHALA',
    address: '# 12, Temple Road, Yadavagiri, Mysuru – 570 020',
    generatedOn: '18-Jul-2025 10:30 AM'
};

export const keyHighlights: IKeyHighlight[] = [
    { title: 'Higher Average', group: 'VIII-A', value: '72.45', type: 'higher_avg' },
    { title: 'Higher Pass %', group: 'VIII-A', value: '92%', type: 'higher_pass' },
    { title: 'Highest Marks', group: 'VIII-A', value: '98', type: 'highest_marks' },
    { title: 'Lowest Marks', group: 'VIII-B', value: '22', type: 'lowest_marks' }
];

export const summaryMetrics: IMetricComparison[] = [
    {
        metric: 'Average Marks',
        groupAVal: '72.45',
        groupBVal: '64.32',
        difference: '+8.13',
        remarks: 'VIII-A is higher',
        highlightA: true
    },
    {
        metric: 'Pass Percentage',
        groupAVal: '92%',
        groupBVal: '78%',
        difference: '+14%',
        remarks: 'VIII-A is higher',
        highlightA: true
    },
    {
        metric: 'Highest Marks',
        groupAVal: '98',
        groupBVal: '95',
        difference: '+3',
        remarks: 'VIII-A is higher',
        highlightA: true
    },
    {
        metric: 'Lowest Marks',
        groupAVal: '28',
        groupBVal: '22',
        difference: '+6',
        remarks: 'VIII-A is higher',
        highlightA: true
    },
    {
        metric: 'Standard Deviation',
        groupAVal: '12.35',
        groupBVal: '14.67',
        difference: '-2.32',
        remarks: 'VIII-A is more consistent',
        highlightA: true
    }
];

export const gradeDistributions: IGradeDistribution[] = [
    { gradeLabel: 'A (80% & Above)', groupAPercent: 28, groupBPercent: 17 },
    { gradeLabel: 'B (60% - 79%)', groupAPercent: 42, groupBPercent: 31 },
    { gradeLabel: 'C (40% - 59%)', groupAPercent: 21, groupBPercent: 33 },
    { gradeLabel: 'D (33% - 39%)', groupAPercent: 6, groupBPercent: 11 },
    { gradeLabel: 'E (Below 33%)', groupAPercent: 3, groupBPercent: 8 }
];

export const assessmentTrends: IAssessmentTrend[] = [
    { assessment: 'Unit Test 1', groupAScore: 68.12, groupBScore: 59.2 },
    { assessment: 'Unit Test 2', groupAScore: 71.28, groupBScore: 62.1 },
    { assessment: 'Term 1 Exam', groupAScore: 74.8, groupBScore: 66.9 },
    { assessment: 'Term 1 Overall', groupAScore: 72.45, groupBScore: 64.32 }
];

export const scoreRangeDistributions: IScoreRangeDistribution[] = [
    { range: '90 - 100', groupACount: 10, groupAPercent: 26, groupBCount: 6, groupBPercent: 17, difference: 4 },
    { range: '80 - 89', groupACount: 8, groupAPercent: 21, groupBCount: 6, groupBPercent: 17, difference: 2 },
    { range: '70 - 79', groupACount: 12, groupAPercent: 32, groupBCount: 8, groupBPercent: 22, difference: 4 },
    { range: '60 - 69', groupACount: 5, groupAPercent: 13, groupBCount: 6, groupBPercent: 17, difference: -1 },
    { range: 'Below 60', groupACount: 3, groupAPercent: 8, groupBCount: 11, groupBPercent: 30, difference: -8 }
];

export const topPerformersGroupA: ITopPerformer[] = [
    { rank: 1, rollNo: '12', studentName: 'Rohan K', marksPercent: 98 },
    { rank: 2, rollNo: '27', studentName: 'Sneha M', marksPercent: 95 },
    { rank: 3, rollNo: '05', studentName: 'Arjun R', marksPercent: 94 }
];

export const topPerformersGroupB: ITopPerformer[] = [
    { rank: 1, rollNo: '09', studentName: 'Dev P', marksPercent: 95 },
    { rank: 2, rollNo: '18', studentName: 'Pooja S', marksPercent: 93 },
    { rank: 3, rollNo: '31', studentName: 'Karthik U', marksPercent: 91 }
];

export const teacherProfile: ITeacherProfile = {
    name: 'Ms. Ramesh Kumar',
    employeeId: 'TCH021',
    department: 'Mathematics',
    designation: 'PGT - Mathematics',
    joiningDate: '12-Jun-2018'
};

export const teacherOverviewStats: ITeacherOverviewStats = {
    totalClasses: 4,
    totalStudents: 142,
    averageMarks: 71.85,
    passPercentage: 91.55,
    highestMarks: 98,
    lowestMarks: 22
};

export const subjectPerformances: ISubjectPerformance[] = [
    {
        subject: 'Mathematics',
        totalStudents: 142,
        averageMarks: 71.85,
        passPercentage: 91.55,
        highestMarks: 98,
        lowestMarks: 22,
        avgGrade: 'B+'
    },
    {
        subject: 'Science',
        totalStudents: 140,
        averageMarks: 68.42,
        passPercentage: 89.29,
        highestMarks: 97,
        lowestMarks: 24,
        avgGrade: 'B'
    },
    { subject: 'Physics', totalStudents: 86, averageMarks: 72.1, passPercentage: 93.02, highestMarks: 98, lowestMarks: 25, avgGrade: 'B+' },
    {
        subject: 'Chemistry',
        totalStudents: 86,
        averageMarks: 69.34,
        passPercentage: 88.37,
        highestMarks: 95,
        lowestMarks: 23,
        avgGrade: 'B'
    },
    {
        subject: 'Computer Science',
        totalStudents: 56,
        averageMarks: 76.12,
        passPercentage: 96.43,
        highestMarks: 100,
        lowestMarks: 28,
        avgGrade: 'A-'
    }
];

export const classSectionPerformances: IClassSectionPerformance[] = [
    {
        className: 'VIII',
        section: 'A',
        subject: 'Mathematics',
        totalStudents: 38,
        averageMarks: 72.5,
        passPercentage: 91.67,
        highestMarks: 98,
        lowestMarks: 23
    },
    {
        className: 'VIII',
        section: 'B',
        subject: 'Mathematics',
        totalStudents: 36,
        averageMarks: 68.41,
        passPercentage: 88.24,
        highestMarks: 95,
        lowestMarks: 24
    },
    {
        className: 'IX',
        section: 'A',
        subject: 'Mathematics',
        totalStudents: 35,
        averageMarks: 73.6,
        passPercentage: 94.29,
        highestMarks: 97,
        lowestMarks: 22
    },
    {
        className: 'X',
        section: 'B',
        subject: 'Mathematics',
        totalStudents: 33,
        averageMarks: 72.89,
        passPercentage: 91.89,
        highestMarks: 96,
        lowestMarks: 22
    }
];

export const teacherOverallTopPerformers: ITeacherOverallTopPerformer[] = [
    { rank: 1, studentName: 'Rohan K', classSection: 'VIII - A', subject: 'Mathematics', marksPercent: 98 },
    { rank: 2, studentName: 'Rohan K', classSection: 'IX - A', subject: 'Mathematics', marksPercent: 97 },
    { rank: 3, studentName: 'Arjun R', classSection: 'VIII - A', subject: 'Science', marksPercent: 96 },
    { rank: 4, studentName: 'Divya S', classSection: 'IX - A', subject: 'Physics', marksPercent: 95 },
    { rank: 5, studentName: 'Karthik U', classSection: 'X - B', subject: 'Mathematics', marksPercent: 95 }
];
