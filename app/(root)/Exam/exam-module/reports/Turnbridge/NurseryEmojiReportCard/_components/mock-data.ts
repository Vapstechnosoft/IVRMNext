/**
 * Mock Data for Nursery Emoji Report Card
 * Custom tailored for Pre Nursery, Lower Nursery, and Upper Nursery early development.
 */

export const getMockNurseryData = (classname?: string) => {
    const students = [
        {
            AMST_Id: 101,
            studentname: 'Aarav Sharma',
            admno: 'NUR/2024/001',
            rollno: 1,
            dob: '2021-04-15',
            AMST_Photoname: '',
            clastechname: 'Ms. Sarah Jenkins',
            asmcL_ClassName: classname || 'LOWER NURSERY',
            asmC_SectionName: 'A'
        },
        {
            AMST_Id: 102,
            studentname: 'Ananya Gupta',
            admno: 'NUR/2024/002',
            rollno: 2,
            dob: '2021-08-22',
            AMST_Photoname: '',
            clastechname: 'Ms. Sarah Jenkins',
            asmcL_ClassName: classname || 'LOWER NURSERY',
            asmC_SectionName: 'A'
        }
    ];

    const subjects = [
        { ISMS_Id: 1, ISMS_SubjectName: 'LITERACY SKILLS & PHONICS' },
        { ISMS_Id: 2, ISMS_SubjectName: 'NUMERACY & COGNITIVE SKILLS' },
        { ISMS_Id: 3, ISMS_SubjectName: 'PHYSICAL & MOTOR DEVELOPMENT' },
        { ISMS_Id: 4, ISMS_SubjectName: 'SOCIO-EMOTIONAL & HABITS' },
        { ISMS_Id: 5, ISMS_SubjectName: 'CREATIVE ARTS & MUSIC' }
    ];

    const allOutcomes = [
        // Literacy Skills & Phonics
        { ISMS_Id: 1, subExam: 'Phonics & Sound Identification', score: 1 },
        { ISMS_Id: 1, subExam: 'Letter Recognition (A-Z)', score: 1 },
        { ISMS_Id: 1, subExam: 'Pre-Writing Lines & Tracing', score: 2 },
        { ISMS_Id: 1, subExam: 'Listening & Rhyme Recitation', score: 1 },

        // Numeracy & Cognitive
        { ISMS_Id: 2, subExam: 'Number Recognition (1-20)', score: 1 },
        { ISMS_Id: 2, subExam: 'Counting & Quantifying Objects', score: 2 },
        { ISMS_Id: 2, subExam: 'Shape & Color Identification', score: 1 },
        { ISMS_Id: 2, subExam: 'Sorting & Pattern Matching', score: 2 },

        // Physical & Motor Development
        { ISMS_Id: 3, subExam: 'Fine Motor & Pincer Grip Control', score: 1 },
        { ISMS_Id: 3, subExam: 'Gross Motor Skills & Balance', score: 1 },
        { ISMS_Id: 3, subExam: 'Coloring Within Borders', score: 2 },

        // Socio-Emotional & Habits
        { ISMS_Id: 4, subExam: 'Sharing & Cooperative Play', score: 1 },
        { ISMS_Id: 4, subExam: 'Classroom Manners & Discipline', score: 1 },
        { ISMS_Id: 4, subExam: 'Self-Care & Hygiene Habits', score: 2 },

        // Creative Arts & Music
        { ISMS_Id: 5, subExam: 'Rhythm & Music Participation', score: 1 },
        { ISMS_Id: 5, subExam: 'Clay Work & Paper Crafting', score: 2 }
    ];

    const getstudentwisesubjectlist: any[] = [];
    students.forEach(stu => {
        subjects.forEach((sub) => {
            [1, 2].forEach(emeId => {
                const subOutcomes = allOutcomes.filter(o => o.ISMS_Id === sub.ISMS_Id);
                subOutcomes.forEach(out => {
                    // Slight variation for second student
                    const finalScore = stu.AMST_Id === 102 && out.score === 2 ? 1 : out.score;
                    getstudentwisesubjectlist.push({
                        AMST_Id: stu.AMST_Id,
                        ISMS_Id: sub.ISMS_Id,
                        ISMS_SubjectName: sub.ISMS_SubjectName,
                        EME_Id: emeId,
                        EMSE_SubExamName: out.subExam,
                        ESTMPSSS_ObtainedMarks: finalScore
                    });
                });
            });
        });
    });

    const uniqueSubjects: any[] = [];
    getstudentwisesubjectlist.forEach(item => {
        if (!uniqueSubjects.find(s => s.ISMS_Id === item.ISMS_Id && s.AMST_Id === item.AMST_Id)) {
            uniqueSubjects.push({
                AMST_Id: item.AMST_Id,
                ISMS_Id: item.ISMS_Id,
                ISMS_SubjectName: item.ISMS_SubjectName
            });
        }
    });

    const getstudentwiseattendancedetails = students.flatMap(stu => [
        { AMST_Id: stu.AMST_Id, EME_Id: 1, PRESENTDAYS: 48, TOTALWORKINGDAYS: 50, ATTENDANCEPERCENTAGE: 96 },
        { AMST_Id: stu.AMST_Id, EME_Id: 2, PRESENTDAYS: 49, TOTALWORKINGDAYS: 50, ATTENDANCEPERCENTAGE: 98 }
    ]);

    return {
        getstudentdetails: students,
        getstudentwisesubjectlist,
        uniqueSubjects,
        getstudentwiseattendancedetails,
        clstchname: 'Ms. Sarah Jenkins'
    };
};
