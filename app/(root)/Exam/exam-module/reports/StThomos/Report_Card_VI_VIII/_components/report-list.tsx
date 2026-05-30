'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };
    console.log('report-list data', data);

    // Main Data Sources – using correct camelCase property names
    const rawExamWiseMarks = data.examwiseremarks ?? data.getstudent_examwisemarks ?? data.savelisttot ?? [];
    const studentDetails = (data.getstudentdetails || []).map((stu: any) => {
        const amsT_Id = stu.amsT_Id ?? stu.AMST_Id;
        const studentMarks = rawExamWiseMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        return {
            ...stu,
            student_marks: studentMarks,
            student_Marks: studentMarks,
        };
    });
    const groupDetails = data.getgroupdetails || [];

    // Dynamically build groupWiseExamList from the groups' groupewiseexam lists to ensure AVG columns are properly bound
    let groupWiseExamList: any[] = [];
    if (groupDetails.length > 0) {
        groupDetails.forEach((grp: any) => {
            const list = grp.groupewiseexam ?? grp.groupeWiseExam ?? [];
            list.forEach((exa: any) => {
                groupWiseExamList.push({
                    ...exa,
                    examId: exa.emE_Id ?? exa.EME_Id ?? exa.examId,
                    displayName: exa.examnamedisplay ?? exa.emE_ExamName ?? exa.displayName,
                    maxMarks: exa.empsgE_ForMaxMarkrs ?? exa.EMPSGE_ForMaxMarkrs ?? exa.maxMarks,
                    groupName: exa.empG_DistplayName ?? exa.EMPG_DistplayName ?? grp.empG_DistplayName ?? grp.EMPG_DistplayName ?? grp.empG_GroupName ?? grp.EMPG_GroupName ?? '',
                });
            });
        });
    }

    if (groupWiseExamList.length === 0) {
        groupWiseExamList = (data.groupwiseexamlist || []).map((exa: any) => ({
            ...exa,
            examId: exa.emE_Id ?? exa.EME_Id ?? exa.examId,
            displayName: exa.examnamedisplay ?? exa.emE_ExamName ?? exa.displayName,
            maxMarks: exa.empsgE_ForMaxMarkrs ?? exa.EMPSGE_ForMaxMarkrs ?? exa.maxMarks,
            groupName: exa.empG_DistplayName ?? exa.EMPG_DistplayName ?? exa.groupName ?? '',
        }));
    }
    const _institution = data.institutionList?.[0] || data.masterinstitution || data.institution || data.getinstitution;
    const gradeDetails = data.getallgrade || [];
    const skillDetails = data.getstudentwiseskillslist || data.getskill || [];
    const examWiseTotalDetails = data.getstudentwiseexamwisetotaldetails || data.getexamwisetotaldetails || [];
    const promotionRemarks = data.getpromotionremarksdetails || [];
    const studentGraphDetails = data.studentdetailsgraph || [];

    // Attendance Sources
    const presentAttendance = data.present_attendence || [];

    // Config Flags
    const showLogo = params.printLogo;
    const showSuperAverage = params.superAverage;
    const examName = params.exmname;

    // Helpers to resolve case mismatch and property variations from API
    const getExamDisplayName = (exa: any) => {
        return exa?.displayName ?? exa?.examnamedisplay ?? exa?.emE_ExamName ?? exa?.EME_ExamName ?? '';
    };

    const getExamMaxMarks = (exa: any) => {
        return exa?.maxMarks ?? exa?.empsgE_ForMaxMarkrs ?? exa?.EMPSGE_ForMaxMarkrs ?? '';
    };

    const getExamGroupName = (exa: any) => {
        return exa?.groupName ?? exa?.empG_DistplayName ?? exa?.EMPG_DistplayName ?? '';
    };

    const getExamId = (exa: any) => {
        return exa?.examId ?? exa?.emE_Id ?? exa?.EME_Id ?? 0;
    };

    const isScholasticSubject = (s: any) => {
        if (!s) return false;
        const name = String(s?.ismS_SubjectName ?? s?.ISMS_SubjectName ?? '').trim().toUpperCase();
        if (
            name.includes('MORAL SCIENCE') ||
            name.includes('GENERAL KNOWLEDGE') ||
            name.includes('3RD LANGUAGE') ||
            name.includes('BENGALI') ||
            name.includes('CO-SCHOLASTIC')
        ) {
            return false;
        }
        return true;
    };

    const getSubjectSortIndex = (name: string) => {
        const uName = name.trim().toUpperCase();
        if (uName === 'ENGLISH') return 10;
        if (uName === 'ENGLISH LANGUAGE') return 20;
        if (uName === 'ENGLISH LITERATURE') return 30;
        if ((uName.includes('2ND LANGUAGE') || uName.includes('HINDI') || uName.includes('BENGALI')) && !uName.includes('3RD')) {
            return 40;
        }
        if (uName === 'SOCIAL STUDIES') return 50;
        if (uName === 'HISTORY & CIVICS' || uName === 'HISTORY' || uName === 'CIVICS') return 60;
        if (uName === 'GEOGRAPHY') return 70;
        if (uName === 'MATHEMATICS' || uName === 'MATHS' || uName === 'MATH') return 80;
        if (uName === 'SCIENCE') return 90;
        if (uName === 'PHYSICS') return 100;
        if (uName === 'CHEMISTRY') return 110;
        if (uName === 'BIOLOGY') return 120;
        if (uName === 'COMPUTER STUDIES' || uName === 'COMPUTER') return 130;
        if (uName.includes('3RD LANGUAGE') || (uName.includes('BENGALI') && uName.includes('3RD'))) return 140;
        if (uName === 'MORAL SCIENCE') return 150;
        if (uName === 'GENERAL KNOWLEDGE' || uName === 'G.K.' || uName === 'GK') return 160;
        return 200;
    };

    const formatNumberValue = (val: any, decimals: number) => {
        if (val === null || val === undefined || val === '' || val === '-') return '';
        const num = Number(val);
        if (isNaN(num)) return '';
        if (num % 1 === 0) return num.toFixed(0);
        return num.toFixed(decimals);
    };

    const isParentSubject = (subj: any) => {
        const name = String(subj?.ismS_SubjectName ?? subj?.ISMS_SubjectName ?? '').trim().toUpperCase();
        return name === 'ENGLISH' || name === 'SOCIAL STUDIES' || name === 'SCIENCE';
    };

    const isChildSubject = (subj: any) => {
        const name = String(subj?.ismS_SubjectName ?? subj?.ISMS_SubjectName ?? '').trim().toUpperCase();
        return [
            'ENGLISH LANGUAGE',
            'ENGLISH LITERATURE',
            'HISTORY & CIVICS',
            'GEOGRAPHY',
            'PHYSICS',
            'CHEMISTRY',
            'BIOLOGY'
        ].includes(name);
    };

    const isResultSubject = (subj: any) => {
        const name = String(subj?.ismS_SubjectName ?? subj?.ISMS_SubjectName ?? '').trim().toUpperCase();
        if (
            name.includes('MORAL SCIENCE') ||
            name.includes('GENERAL KNOWLEDGE') ||
            name.includes('3RD LANGUAGE') ||
            name.includes('BENGALI') ||
            name.includes('CO-SCHOLASTIC')
        ) {
            return false;
        }
        return true;
    };

    const getUniqueSubjects = (report: any) => {
        const uniqueSubjectsMap = new Map<string, any>();

        // 1. First add from report.studentsubjects
        const rawSubjects = report.studentsubjects || [];
        rawSubjects.forEach((subj: any) => {
            const ismS_Id = subj.ismS_Id ?? subj.ISMS_Id;
            const ismS_SubjectName = subj.ismS_SubjectName ?? subj.ISMS_SubjectName;
            if (!ismS_Id) return;

            const key = `${ismS_Id}_${ismS_SubjectName}`;
            if (!uniqueSubjectsMap.has(key)) {
                uniqueSubjectsMap.set(key, {
                    ismS_Id: ismS_Id,
                    ismS_SubjectName: ismS_SubjectName,
                    empS_SubjOrder: subj.empS_SubjOrder ?? subj.EMPS_SubjOrder,
                    emps_AppToResultFlg: subj.emps_AppToResultFlg ?? subj.EMPS_AppToResultFlg ?? subj.appToResultFlg ?? subj.AppToResultFlg,
                    esG_Id: subj.esG_Id ?? subj.ESG_Id,
                    grouporder: subj.grouporder ?? subj.Grouporder,
                    estmppsG_GroupObtMarks: subj.estmppsG_GroupObtMarks ?? subj.ESTMPPSG_GroupObtMarks,
                    estmppsG_GroupAVGMarks: subj.estmppsG_GroupAVGMarks ?? subj.ESTMPPSG_GroupAVGMarks ?? subj.groupAVGMarks,
                    estmppsG_GroupObtGrade: subj.estmppsG_GroupObtGrade ?? subj.ESTMPPSG_GroupObtGrade,
                    groupAVGMarks: subj.groupAVGMarks ?? subj.groupAVGMarks,
                });
            }
        });

        // 2. Next, add any subjects from studentmarks/getstudentmarksdetails that might be missing (e.g. sub-subjects like Biology, Physics)
        let marksArray = report.studentmarks || report.marks || [];
        if (!marksArray || marksArray.length === 0) {
            const amsT_Id = report.amsT_Id ?? report.AMST_Id;
            const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? data.studentMarks ?? data.marks ?? [];
            marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        }

        marksArray.forEach((mrk: any) => {
            const ismS_Id = mrk.ismS_Id ?? mrk.ISMS_Id;
            const ismS_SubjectName = mrk.ismS_SubjectName ?? mrk.ISMS_SubjectName;
            if (!ismS_Id) return;

            const key = `${ismS_Id}_${ismS_SubjectName}`;
            if (!uniqueSubjectsMap.has(key)) {
                uniqueSubjectsMap.set(key, {
                    ismS_Id: ismS_Id,
                    ismS_SubjectName: ismS_SubjectName,
                    empS_SubjOrder: mrk.empS_SubjOrder ?? mrk.EMPS_SubjOrder,
                    emps_AppToResultFlg: mrk.emps_AppToResultFlg ?? mrk.EMPS_AppToResultFlg ?? mrk.empS_AppToResultFlg ?? mrk.EMPS_AppToResultFlg,
                    esG_Id: mrk.esG_Id ?? mrk.ESG_Id,
                    grouporder: mrk.grouporder ?? mrk.Grouporder,
                    estmppsG_GroupObtMarks: mrk.estmppsG_GroupObtMarks ?? mrk.ESTMPPSG_GroupObtMarks,
                    estmppsG_GroupAVGMarks: mrk.estmppsG_GroupAVGMarks ?? mrk.ESTMPPSG_GroupAVGMarks ?? mrk.groupAVGMarks,
                    estmppsG_GroupObtGrade: mrk.estmppsG_GroupObtGrade ?? mrk.ESTMPPSG_GroupObtGrade,
                    groupAVGMarks: mrk.groupAVGMarks ?? mrk.groupAVGMarks,
                });
            }
        });

        // Convert map values to array
        let subjectsList = Array.from(uniqueSubjectsMap.values());

        // Sort by custom subject sort weight
        subjectsList.sort((a, b) => {
            const nameA = a.ismS_SubjectName ?? a.ISMS_SubjectName ?? '';
            const nameB = b.ismS_SubjectName ?? b.ISMS_SubjectName ?? '';
            return getSubjectSortIndex(nameA) - getSubjectSortIndex(nameB);
        });

        return subjectsList;
    };

    // Helper to get attendance
    const getAttendance = (amsT_Id: number) => {
        const present = presentAttendance.find((a: any) => (a.amsT_Id ?? a.AMST_Id) === amsT_Id);
        return present ? (present.attendancePercentage ?? present.ATTENDANCEPERCENTAGE ?? 0) : 0;
    };

    // Helper to get mark for a cell
    const getMarkValue = (report: any, subj: any, examId: number, groupDisplayName: string, examNameDisplay: string, isResultSubj = true) => {
        const subjectId = Number(subj?.ismS_Id ?? subj?.ISMS_Id ?? 0);

        const isAvgExam = examNameDisplay === 'AVG';

        // 1. If parent subject and not AVG exam, must be empty cell!
        if (isParentSubject(subj) && !isAvgExam) {
            return "";
        }

        // 2. If child subject and AVG exam, must be empty cell!
        if (isChildSubject(subj) && isAvgExam) {
            return "";
        }

        let marksArray = report.studentmarks || report.marks || [];
        if (!marksArray || marksArray.length === 0) {
            const amsT_Id = report.amsT_Id ?? report.AMST_Id;
            const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? data.studentMarks ?? data.marks ?? [];
            marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        }

        const mark = marksArray.find((m: any) => {
            const mSubId = m.ismS_Id ?? m.ISMS_Id;
            const mExamId = m.emE_Id ?? m.EME_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mSubId) === subjectId && Number(mExamId) === Number(examId) && String(mGroupDispName) === String(groupDisplayName);
        });

        if (mark) {
            const passFailFlag = mark.passFailFlag ?? mark.PassFailFlag;
            if (['AB', 'M', 'L'].includes(passFailFlag)) {
                return passFailFlag;
            }

            const isAvgExam = examNameDisplay === 'AVG';
            const obtainedGrade = mark.obtainedGrade ?? mark.ObtainedGrade;


            const esG_Id = mark.esG_Id ?? mark.ESG_Id;
            const grouporder = mark.grouporder ?? mark.Grouporder;
            const isEsgZero = esG_Id === undefined || esG_Id === null || String(esG_Id) === '' || Number(esG_Id) === 0;
            const isGrouporderZero = grouporder === undefined || grouporder === null || String(grouporder) === '' || Number(grouporder) === 0;

            // AngularJS condition: mrks.ESG_Id == 0 && mrks.Grouporder==0 for non-AVG
            if (!isAvgExam) {
                if (!isEsgZero || !isGrouporderZero) {
                    return "";
                }
            } else {
                // AngularJS condition: mrks.ESG_Id == 0 for AVG
                if (!isEsgZero && Number(esG_Id) > 0) {
                    const obtainedMarks = mark.obtainedMarks ?? mark.ObtainedMarks;
                    return <b>{obtainedMarks}</b>;
                }
            }

            const obtainedMarks = mark.obtainedMarks ?? mark.ObtainedMarks;

            if (obtainedMarks >= 0 && !['AB', 'M', 'L'].includes(passFailFlag)) {
                if (isAvgExam) {
                    return <b>{obtainedMarks}</b>;
                }
                return obtainedMarks;
            }

            if (obtainedGrade && isAvgExam) {
                return obtainedGrade;
            }

            return '';
        }

        return '';
    };

    // Get total/avg marks for total row (looks in overall student_marks / student_Marks first)
    const getTotalMarkValue = (report: any, examId: number, groupDisplayName: string, examNameDisplay?: string) => {
        // First look in examWiseTotalDetails
        const studentTotal = examWiseTotalDetails.find((t: any) => {
            const tAmstId = t.amsT_Id ?? t.AMST_Id;
            const tAmstMatch = Number(tAmstId) === Number(report.amsT_Id ?? report.AMST_Id);
            if (!tAmstMatch) return false;

            const tGroupDispName = t.empsG_DisplayName ?? t.EMPSG_DisplayName ?? t.empsG_GroupName ?? t.EMPSG_GroupName;
            return tGroupDispName && String(tGroupDispName).trim().toLowerCase() === String(groupDisplayName).trim().toLowerCase();
        });

        if (studentTotal) {
            if (examNameDisplay === 'AVG') {
                const avg = studentTotal.estmppsG_GroupAvgMarks ?? studentTotal.ESTMPPSG_GroupAvgMarks ?? studentTotal.estmppsG_GroupAVGMarks ?? studentTotal.ESTMPPSG_GroupAVGMarks ?? studentTotal.totaver ?? studentTotal.TOTAVER ?? studentTotal.totAver;
                if (avg !== undefined && avg !== null && avg !== '' && avg !== '-') return avg;
            } else {
                const obt = studentTotal.estmppsG_GroupObtMarks ?? studentTotal.ESTMPPSG_GroupObtMarks ?? studentTotal.obtainedMarks ?? studentTotal.ObtainedMarks;
                if (obt !== undefined && obt !== null && obt !== '' && obt !== '-') return obt;
            }
        }

        let marksArray = report.student_marks ?? report.student_Marks ?? report.studentmarks ?? report.marks ?? [];
        if (!marksArray || marksArray.length === 0) {
            const amsT_Id = report.amsT_Id ?? report.AMST_Id;
            const rawMarks = data.examwiseremarks ?? data.getstudent_examwisemarks ?? data.savelisttot ?? data.getstudentmarksdetails ?? data.student_marks ?? data.student_Marks ?? data.studentmarks ?? data.marks ?? [];
            marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        }

        let mark = marksArray.find((m: any) => {
            const mExamId = m.emE_Id ?? m.EME_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mExamId) === Number(examId) && String(mGroupDispName).trim().toLowerCase() === String(groupDisplayName).trim().toLowerCase();
        });

        // Fuzzy Fallback
        if (!mark) {
            mark = marksArray.find((m: any) => {
                const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
                if (String(mGroupDispName).trim().toLowerCase() !== String(groupDisplayName).trim().toLowerCase()) return false;
                const mExamName = String(m.emE_ExamName ?? m.EME_ExamName ?? '').toLowerCase();
                if (examNameDisplay === 'AVG') {
                    return mExamName.includes('avg') || mExamName.includes('average');
                } else {
                    return mExamName.includes('total');
                }
            });
        }

        if (mark) {
            return mark.obtainedMarks ?? mark.ObtainedMarks ?? mark.obtainedmarks ?? mark.ESTMPS_ObtainedMarks ?? mark.obtainedMarksValue ?? null;
        }

        return null;
    };

    const getTotalPercentageValue = (report: any, examId: number, groupDisplayName: string, examNameDisplay?: string) => {
        // First look in examWiseTotalDetails
        const studentTotal = examWiseTotalDetails.find((t: any) => {
            const tAmstId = t.amsT_Id ?? t.AMST_Id;
            const tAmstMatch = Number(tAmstId) === Number(report.amsT_Id ?? report.AMST_Id);
            if (!tAmstMatch) return false;

            const tGroupDispName = t.empsG_DisplayName ?? t.EMPSG_DisplayName ?? t.empsG_GroupName ?? t.EMPSG_GroupName;
            return tGroupDispName && String(tGroupDispName).trim().toLowerCase() === String(groupDisplayName).trim().toLowerCase();
        });

        if (studentTotal) {
            const pct = studentTotal.totalPercentage ?? studentTotal.TotalPercentage ?? studentTotal.percentage ?? studentTotal.Percentage;
            if (pct !== undefined && pct !== null && pct !== '' && pct !== '-') return pct;
        }

        let marksArray = report.student_marks ?? report.student_Marks ?? report.studentmarks ?? report.marks ?? [];
        if (!marksArray || marksArray.length === 0) {
            const amsT_Id = report.amsT_Id ?? report.AMST_Id;
            const rawMarks = data.examwiseremarks ?? data.getstudent_examwisemarks ?? data.savelisttot ?? data.getstudentmarksdetails ?? data.student_marks ?? data.student_Marks ?? data.studentmarks ?? data.marks ?? [];
            marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        }

        let mark = marksArray.find((m: any) => {
            const mExamId = m.emE_Id ?? m.EME_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mExamId) === Number(examId) && String(mGroupDispName).trim().toLowerCase() === String(groupDisplayName).trim().toLowerCase();
        });

        // Fuzzy Fallback
        if (!mark) {
            mark = marksArray.find((m: any) => {
                const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
                if (String(mGroupDispName).trim().toLowerCase() !== String(groupDisplayName).trim().toLowerCase()) return false;
                const mExamName = String(m.emE_ExamName ?? m.EME_ExamName ?? '').toLowerCase();
                if (examNameDisplay === 'AVG') {
                    return mExamName.includes('avg') || mExamName.includes('average');
                } else {
                    return mExamName.includes('total');
                }
            });
        }

        if (mark) {
            return mark.totalPercentage ?? mark.TotalPercentage ?? mark.percentage ?? mark.estmppS_TotalPercentage ?? mark.ESTMPPS_TotalPercentage ?? null;
        }

        return null;
    };

    const getRankValue = (report: any, examId: number, groupDisplayName: string) => {
        // First look in examWiseTotalDetails
        const studentTotal = examWiseTotalDetails.find((t: any) => {
            const tAmstId = t.amsT_Id ?? t.AMST_Id;
            const tAmstMatch = Number(tAmstId) === Number(report.amsT_Id ?? report.AMST_Id);
            if (!tAmstMatch) return false;

            const tGroupDispName = t.empsG_DisplayName ?? t.EMPSG_DisplayName ?? t.empsG_GroupName ?? t.EMPSG_GroupName;
            return tGroupDispName && String(tGroupDispName).trim().toLowerCase() === String(groupDisplayName).trim().toLowerCase();
        });

        if (studentTotal) {
            const rVal = studentTotal.estmppS_SectionRank ?? studentTotal.ESTMPP_SectionRank ?? studentTotal.estmppS_ClassRank ?? studentTotal.ESTMPP_ClassRank ?? studentTotal.sectionrank ?? studentTotal.classrank ?? studentTotal.rank ?? studentTotal.Rank;
            if (rVal !== undefined && rVal !== null && rVal !== '' && rVal !== '-') return rVal;
        }

        let marksArray = report.student_marks ?? report.student_Marks ?? report.studentmarks ?? report.marks ?? [];
        if (!marksArray || marksArray.length === 0) {
            const amsT_Id = report.amsT_Id ?? report.AMST_Id;
            const rawMarks = data.examwiseremarks ?? data.getstudent_examwisemarks ?? data.savelisttot ?? data.getstudentmarksdetails ?? data.student_marks ?? data.student_Marks ?? data.studentmarks ?? data.marks ?? [];
            marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        }

        let mark = marksArray.find((m: any) => {
            const mExamId = m.emE_Id ?? m.EME_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mExamId) === Number(examId) && String(mGroupDispName).trim().toLowerCase() === String(groupDisplayName).trim().toLowerCase();
        });

        // Fuzzy fallback for rank matching
        if (!mark) {
            mark = marksArray.find((m: any) => {
                const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
                if (String(mGroupDispName).trim().toLowerCase() !== String(groupDisplayName).trim().toLowerCase()) return false;
                const mExamName = String(m.emE_ExamName ?? m.EME_ExamName ?? '').toLowerCase();
                return mExamName.includes('total');
            });
        }

        if (mark) {
            return mark.estmppS_SectionRank ?? mark.ESTMPP_SectionRank ?? mark.estmppS_ClassRank ?? mark.ESTMPP_ClassRank ?? mark.sectionrank ?? mark.classrank ?? null;
        }

        return null;
    };

    // Helper to get obtained marks for performance graph
    const getSubjectGraphObtained = (report: any, subj: any) => {
        const direct = subj.estmppsG_GroupObtMarks ?? subj.ESTMPPSG_GroupObtMarks;
        if (direct !== undefined && direct !== null && Number(direct) > 0) {
            return Number(direct);
        }

        const amsT_Id = report.amsT_Id ?? report.AMST_Id;
        const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? data.studentMarks ?? data.marks ?? [];
        const marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));

        const subjMarks = marksArray.filter((m: any) =>
            Number(m.ismS_Id ?? m.ISMS_Id) === Number(subj.ismS_Id ?? subj.ISMS_Id)
        );

        const examMarks = subjMarks.filter((m: any) => {
            const mExamName = m.emE_ExamName ?? m.EME_ExamName ?? '';
            return !mExamName.toLowerCase().includes('total') && !mExamName.toLowerCase().includes('avg');
        });

        if (examMarks.length > 0) {
            return examMarks.reduce((acc: number, curr: any) => acc + Number(curr.obtainedMarks ?? curr.ObtainedMarks ?? 0), 0);
        }
        return 0;
    };

    // Helper to get average marks for performance graph
    const getSubjectGraphAverage = (report: any, subj: any) => {
        const direct = subj.groupAVGMarks ?? subj.ESTMPPSG_GroupAVGMarks ?? subj.estmppsG_GroupAvgMarks ?? subj.ESTMPPSG_GroupAvgMarks;
        if (direct !== undefined && direct !== null && Number(direct) > 0) {
            return Number(direct);
        }

        const amsT_Id = report.amsT_Id ?? report.AMST_Id;
        const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? data.studentMarks ?? data.marks ?? [];
        const marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));

        const subjMarks = marksArray.filter((m: any) =>
            Number(m.ismS_Id ?? m.ISMS_Id) === Number(subj.ismS_Id ?? subj.ISMS_Id)
        );

        const examMarks = subjMarks.filter((m: any) => {
            const mExamName = m.emE_ExamName ?? m.EME_ExamName ?? '';
            return !mExamName.toLowerCase().includes('total') && !mExamName.toLowerCase().includes('avg');
        });

        if (examMarks.length > 0) {
            const sum = examMarks.reduce((acc: number, curr: any) => acc + Number(curr.obtainedMarks ?? curr.ObtainedMarks ?? 0), 0);
            return Number((sum / examMarks.length).toFixed(1));
        }
        return 0;
    };

    // Personality Profile Questions
    const personalityQuestions = [
        'IS SELF-MOTIVATED AND COMPLETES TASK',
        'WORKS WELL WITH MINIMUM DIRECTION',
        'ORIGINATES IDEAS BUT NEEDS CONSTANT GUIDANCE',
        'CONTRIBUTES READILY',
        'SOMETIMES TAKES PART',
        'EASILY DISTRACTED',
        'VERY CAREFUL WORKER',
        'USUALLY NEAT',
        'ACCEPTS RESPONSIBILITY FOR LEARNING'
    ];

    return (
        <div className='printable-content space-y-6'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} className='print-area'>
                {studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        // Use all subjects from studentsubjects (no filtering based on missing flag)
                        const allSubjects = getUniqueSubjects(report);
                        console.log('allSubjects', allSubjects);

                        // Remarks for this student
                        const remarks = promotionRemarks.filter((r: any) => r.amsT_Id === report.amsT_Id);

                        // Graph data (if any)
                        const _graphData = studentGraphDetails.find((g: any) => g.amsT_Id === report.amsT_Id);

                        return (
                            <div
                                key={index}
                                className='page-break-before-always mb-8 border border-gray-300 bg-white p-4 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                                {/* Header with logo */}
                                {showLogo && (
                                    <div className='mb-4 flex flex-row items-center justify-between'>
                                        <div className='w-32'>
                                            <img
                                                src='https://dcampusstrg.blob.core.windows.net/files/17/Trnsportdocuments/7115f492-3955-47e6-97d9-187413d0f3a5.jpg'
                                                className='h-[100px] w-[100px] object-cover'
                                                alt='Transport Logo'
                                            />
                                        </div>
                                        <div className='flex-1 text-center'>
                                            <img
                                                src='https://sthomashowrah.blob.core.windows.net/files/Logo Header stt.jpg'
                                                className='mx-auto h-[70px] w-auto object-contain'
                                                alt='Header Logo'
                                            />
                                            <div className='mt-1 space-y-1 text-center text-[9px] leading-tight'>
                                                <p>(Diocese of Calcutta, CNI)</p>
                                                <p>
                                                    A Christian Minority Co-Educational English Medium School under Article 30 of the Indian
                                                    Constitution)
                                                </p>
                                                <p>3, Church Road, Howrah-711101 West Bengal, India</p>
                                                <p>Phone No: +91 33 2641 2138,+91 33 2641 3590 Email ID: stesh1860@gmail.com</p>
                                            </div>
                                        </div>
                                        <div className='w-32'>&nbsp;</div>
                                    </div>
                                )}
                                {!showLogo && <div className='mt-[130px]'>&nbsp;</div>}

                                <div className='relative'>
                                    {/* Watermark */}
                                    <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-20 print:opacity-20'>
                                        <img
                                            src='https://sthomashowrah.blob.core.windows.net/files/4/stthomos.jpeg'
                                            className='h-[417px] w-[420px] object-contain'
                                            alt='Watermark'
                                        />
                                    </div>

                                    <div className='relative z-10'>
                                        {/* Exam Title */}
                                        <table className='mb-2 w-full bg-transparent'>
                                            <tbody>
                                                <tr>
                                                    <th className='w-full border-none text-center text-lg uppercase'>
                                                        <span>
                                                            {examName} REPORT CARD {report.academicYear || ''}
                                                        </span>
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Student Details */}
                                        <table className='mb-2 w-full border-collapse border border-gray-400 bg-transparent text-sm'>
                                            <tbody>
                                                <tr>
                                                    <td className='w-1/4 border border-gray-400 border-t-0 border-r-0 border-b-0 p-2 align-top'>
                                                        <div className='mb-1 flex gap-2'>
                                                            <span className='font-bold'>NAME :</span>
                                                            <span className='font-bold'>{report.studentname}</span>
                                                        </div>
                                                        <div className='flex gap-2'>
                                                            <span className='font-bold'>CLASS :</span>
                                                            <span className='font-bold'>
                                                                {report.classname || params.classs}-
                                                                {report.sectionname || params.clasection}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='w-1/4 border-none p-2 text-center align-middle'>
                                                        <b>
                                                            NO. IN CLASS: <span>{studentDetails.length}</span>
                                                        </b>
                                                    </td>
                                                    <td className='w-1/4 border-none p-2 text-center align-middle'>
                                                        <b>
                                                            ATTENDANCE: <span>{getAttendance(report.amsT_Id).toFixed(0)}%</span>
                                                        </b>
                                                    </td>
                                                    <td className='w-1/4 border-none p-2 pr-4 text-right align-middle'>
                                                        <b>STUDENT&apos;S ID: {report.admno}</b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th
                                                        colSpan={4}
                                                        className='border border-gray-400 border-r-0 border-l-0 pt-2 text-center font-bold text-[13px] uppercase'>
                                                        STATEMENT OF MARKS
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Marks Table */}
                                        <table className='w-full border-collapse border border-gray-400 bg-transparent text-[12px]'>
                                            <thead>
                                                <tr className='border-[0.5px] border-gray-500'>
                                                    <th className='w-[250px] border-[0.5px] border-gray-500 p-1 text-[13px]'>SUBJECTS</th>
                                                    {groupDetails.map((grp: any, i: number) => (
                                                        <th
                                                            key={i}
                                                            colSpan={(grp.groupewiseexam ?? grp.groupeWiseExam ?? grp.groupwiseexam)?.length || 0}
                                                            className='border-[0.5px] border-gray-500 p-1 text-[13px] uppercase'>
                                                            {grp.empG_DistplayName}
                                                        </th>
                                                    ))}
                                                    <th
                                                        colSpan={groupDetails.length + 1}
                                                        className='border-[0.5px] border-gray-500 p-1 text-[13px] uppercase'>
                                                        SUPER AVERAGE
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className='border-[0.5px] border-gray-500 p-1' />
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const dispName = getExamDisplayName(exa);
                                                        const maxMarks = getExamMaxMarks(exa);
                                                        return (
                                                            <th
                                                                key={i}
                                                                className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center font-normal text-[13px]'>
                                                                {dispName !== 'Total' && dispName !== 'AVG' && (
                                                                    <span>{maxMarks}</span>
                                                                )}
                                                                {dispName === 'Total' && <span>{maxMarks}/50</span>}
                                                                {dispName === 'AVG' && <span>{dispName}</span>}
                                                            </th>
                                                        );
                                                    })}
                                                    <th className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center text-[13px]'>
                                                        100/50
                                                    </th>
                                                    <th className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center text-[13px]'>
                                                        <b>AVG</b>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* All Subjects (Scholastic & Co-Scholastic) in a single loop */}
                                                {allSubjects.map((subj: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className='border-[0.5px] border-gray-500 p-1 pl-2 text-left'>
                                                            {isParentSubject(subj) ? (
                                                                <span className='font-semibold'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ismS_SubjectName ?? subj.ISMS_SubjectName}
                                                                </span>
                                                            ) : isChildSubject(subj) ? (
                                                                <span className='font-normal'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                    {subj.ismS_SubjectName ?? subj.ISMS_SubjectName}
                                                                </span>
                                                            ) : (
                                                                <span className='font-normal'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ismS_SubjectName ?? subj.ISMS_SubjectName}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {groupWiseExamList.map((exa: any, j: number) => {
                                                            const groupDisplayName = getExamGroupName(exa);
                                                            const val = getMarkValue(
                                                                report,
                                                                subj,
                                                                getExamId(exa),
                                                                groupDisplayName,
                                                                getExamDisplayName(exa),
                                                                true
                                                            );
                                                            return (
                                                                <td
                                                                    key={j}
                                                                    className='w-[50px] border-[0.5px] border-gray-500 p-1 text-center'>
                                                                    {val}
                                                                </td>
                                                            );
                                                        })}
                                                        {/* Super Average Columns */}
                                                        <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                            {!isChildSubject(subj) && showSuperAverage && (
                                                                <span>{subj.estmppsG_GroupObtMarks ?? subj.ESTMPPSG_GroupObtMarks ?? ''}</span>
                                                            )}
                                                        </td>
                                                        <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                            {!isChildSubject(subj) && showSuperAverage && (
                                                                <span className='font-semibold'>
                                                                    {subj.groupAVGMarks ?? subj.ESTMPPSG_GroupAVGMarks ?? subj.estmppsG_GroupAvgMarks ?? subj.ESTMPPSG_GroupAvgMarks ?? ''}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Total Row */}
                                                <tr>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-left font-semibold'>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOTAL
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const dispName = getExamDisplayName(exa);
                                                        const groupDisplayName = getExamGroupName(exa);

                                                        const mVal = getTotalMarkValue(report, getExamId(exa), groupDisplayName, dispName);
                                                        const formatted = formatNumberValue(mVal, 0);
                                                        const val = formatted !== '' ? <span className='font-bold'>{formatted}</span> : null;

                                                        return (
                                                            <td key={i} className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    {/* Super Average Totals */}
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {(() => {
                                                                    const studentTotal = examWiseTotalDetails.find((t: any) => Number(t.amsT_Id ?? t.AMST_Id) === Number(report.amsT_Id ?? report.AMST_Id));
                                                                    const obt = studentTotal?.estmppsG_GroupObtMarks ?? studentTotal?.ESTMPPSG_GroupObtMarks;
                                                                    if (obt !== undefined && obt !== null && obt !== '' && obt !== '-') return formatNumberValue(obt, 0);
                                                                    return '';
                                                                })()}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {(() => {
                                                                    const studentTotal = examWiseTotalDetails.find((t: any) => Number(t.amsT_Id ?? t.AMST_Id) === Number(report.amsT_Id ?? report.AMST_Id));
                                                                    const avg = studentTotal?.estmppsG_GroupAvgMarks ?? studentTotal?.ESTMPPSG_GroupAvgMarks ?? studentTotal?.estmppsG_GroupAVGMarks ?? studentTotal?.ESTMPPSG_GroupAVGMarks;
                                                                    if (avg !== undefined && avg !== null && avg !== '' && avg !== '-') return formatNumberValue(avg, 0);
                                                                    return '';
                                                                })()}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Percentage Row */}
                                                <tr>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-left font-semibold'>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PERCENTAGE
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const dispName = getExamDisplayName(exa);
                                                        const groupDisplayName = getExamGroupName(exa);

                                                        const pVal = getTotalPercentageValue(report, getExamId(exa), groupDisplayName, dispName);
                                                        const formatted = formatNumberValue(pVal, 0);
                                                        const val = formatted !== '' ? <span className='font-bold'>{formatted}</span> : null;

                                                        return (
                                                            <td key={i} className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {(() => {
                                                                    const studentTotal = examWiseTotalDetails.find((t: any) => Number(t.amsT_Id ?? t.AMST_Id) === Number(report.amsT_Id ?? report.AMST_Id));
                                                                    const pct = studentTotal?.totalPercentage ?? studentTotal?.TotalPercentage;
                                                                    if (pct !== undefined && pct !== null && pct !== '' && pct !== '-') return formatNumberValue(pct, 0);
                                                                    return '';
                                                                })()}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {(() => {
                                                                    const studentTotal = examWiseTotalDetails.find((t: any) => Number(t.amsT_Id ?? t.AMST_Id) === Number(report.amsT_Id ?? report.AMST_Id));
                                                                    const avgPct = studentTotal?.totaver ?? studentTotal?.TOTAVER ?? studentTotal?.totAver;
                                                                    if (avgPct !== undefined && avgPct !== null && avgPct !== '' && avgPct !== '-') return formatNumberValue(avgPct, 0);
                                                                    return '';
                                                                })()}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Rank Row */}
                                                <tr>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-left font-semibold'>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RANK
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const groupDisplayName = getExamGroupName(exa);

                                                        const rVal = getRankValue(report, getExamId(exa), groupDisplayName);
                                                        const val = (rVal !== null && rVal !== undefined && String(rVal) !== '' && String(rVal) !== '-')
                                                            ? <span className='font-bold'>{rVal}</span>
                                                            : null;

                                                        return (
                                                            <td key={i} className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    <td colSpan={2} className='border-[0.5px] border-gray-500 p-1 text-center' />
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Bottom Section: Co-Scholastic & Personality */}
                                        <div className='flex border-[0.5px] border-gray-500 border-t-0'>
                                            {/* Left Column: Graded Subjects & Personality */}
                                            <div className='w-[60%] border-gray-500 border-r-[0.5px]'>
                                                {/* Graded Subjects */}
                                                <table className='w-full bg-transparent text-[13px]'>
                                                    <thead>
                                                        <tr>
                                                            <th className='w-[180px] border-[0.5px] border-gray-500 border-t-0 border-l-0 p-1 text-left'>
                                                                GRADED SUBJECTS
                                                            </th>
                                                            <th className='w-[70px] border-[0.5px] border-gray-500 border-t-0 p-1 text-center'>
                                                                HALF YEARLY
                                                            </th>
                                                            <th className='w-[70px] border-[0.5px] border-gray-500 border-t-0 border-r-0 p-1 text-center'>
                                                                FINAL
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {skillDetails.map((skill: any, i: number) => (
                                                            <tr key={i} className='border-gray-500 border-b-[0.5px] last:border-b-0'>
                                                                <td className='border-gray-500 border-r-[0.5px] p-1 pl-4 text-left font-normal text-[13px]'>
                                                                    &nbsp;&nbsp;&nbsp;{skill.ecactA_SkillArea || skill.skillName}
                                                                </td>
                                                                <td className='border-gray-500 border-r-[0.5px] p-1 text-center text-[11px]'>
                                                                    {gradeDetails
                                                                        .filter(
                                                                            (g: any) =>
                                                                                g.amsT_Id === report.amsT_Id &&
                                                                                g.ecacT_SkillName === skill.ecactA_SkillArea &&
                                                                                g.emE_ExamName === 'First Unit Test'
                                                                        )
                                                                        .map((g: any) => g.emgD_Name)
                                                                        .join(', ')}
                                                                </td>
                                                                <td className='p-1 text-center text-[11px]'>
                                                                    {gradeDetails
                                                                        .filter(
                                                                            (g: any) =>
                                                                                g.amsT_Id === report.amsT_Id &&
                                                                                g.ecacT_SkillName === skill.ecactA_SkillArea &&
                                                                                g.emE_ExamName === 'FINAL EXAMINATION'
                                                                        )
                                                                        .map((g: any) => g.emgD_Name)
                                                                        .join(', ')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                {/* Personality Profile */}
                                                <table className='mt-2 w-full bg-transparent text-[13px]'>
                                                    <thead>
                                                        <tr>
                                                            <th className='border-[0.5px] border-gray-500 border-l-0 p-1 text-left font-medium text-[10px]'>
                                                                &nbsp;&nbsp;&nbsp;PERSONALITY PROFILE
                                                            </th>
                                                            <th className='w-[100px] border-[0.5px] border-gray-500 p-1 text-center'>
                                                                HALF YEARLY
                                                            </th>
                                                            <th className='w-[100px] border-[0.5px] border-gray-500 border-r-0 p-1 text-center'>
                                                                FINAL
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {personalityQuestions.map((q, idx) => (
                                                            <tr key={idx} className='border-gray-500 border-b-[0.5px] last:border-b-0'>
                                                                <td className='border-gray-500 border-r-[0.5px] p-0.5 pl-2 text-left text-[11px]'>
                                                                    &middot; &nbsp;{q}
                                                                </td>
                                                                <td className='border-gray-500 border-r-[0.5px] p-0.5 text-center'>
                                                                    <input type='checkbox' className='h-3 w-3' />
                                                                </td>
                                                                <td className='p-0.5 text-center'>
                                                                    <input type='checkbox' className='h-3 w-3' />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Right Column: Chart */}
                                            <div className='w-[40%] p-2'>
                                                <table className='w-full'>
                                                    <thead>
                                                        <tr>
                                                            <th className='border-[0.5px] border-gray-500 border-t-0 border-r-0 border-l-0 pb-2 text-center text-[13px]'>
                                                                PERFORMANCE ANALYSIS(TOTAL)
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className='flex h-[252px] justify-center pt-4'>
                                                                <div className='relative h-[280px] w-[400px]'>
                                                                    {/* Bar Chart representing Performance Analysis */}
                                                                    <Bar
                                                                        key={index}
                                                                        data={{
                                                                            labels: allSubjects
                                                                                .filter(isScholasticSubject)
                                                                                .map((s: any) => s.ismS_SubjectName ?? s.ISMS_SubjectName),
                                                                            datasets: [
                                                                                {
                                                                                    label: 'Marks Obtained',
                                                                                    data: allSubjects
                                                                                        .filter(isScholasticSubject)
                                                                                        .map((s: any) => getSubjectGraphObtained(report, s)),
                                                                                    backgroundColor: 'rgb(63,81,181)',
                                                                                    borderColor: 'black',
                                                                                    borderWidth: 1
                                                                                },
                                                                                {
                                                                                    label: 'Average Marks',
                                                                                    data: allSubjects
                                                                                        .filter(isScholasticSubject)
                                                                                        .map((s: any) => getSubjectGraphAverage(report, s)),
                                                                                    backgroundColor: 'rgb(255,87,34)',
                                                                                    borderColor: 'black',
                                                                                    borderWidth: 0
                                                                                }
                                                                            ]
                                                                        }}
                                                                        options={{
                                                                            responsive: true,
                                                                            maintainAspectRatio: false,
                                                                            plugins: { legend: { position: 'top' } }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        <table className='w-full border-collapse border border-gray-400 border-t-0 bg-transparent text-[12px]'>
                                            <tbody>
                                                <tr>
                                                    <td className='h-[70px] w-[183px] border-r-0 p-2 align-top font-bold'>REMARKS :</td>
                                                    <td className='border-l-0 p-2 align-top'>
                                                        {remarks.map((r: any, idx: number) => (
                                                            <span key={idx} className='block'>
                                                                {r.remarks}
                                                            </span>
                                                        ))}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Signatures */}
                                        <table className='w-full border-collapse border border-gray-400 border-t-0 bg-transparent text-[12px]'>
                                            <thead>
                                                <tr>
                                                    <th className='h-[70px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        DATE
                                                    </th>
                                                    <th className='h-[70px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        PRINCIPAL&apos;S SIGNATURE
                                                    </th>
                                                    <th className='h-[70px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        CLASS TEACHER&apos;S SIGNATURE
                                                    </th>
                                                    <th className='h-[70px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        PARENT&apos;S SIGNATURE
                                                    </th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='p-10 text-center text-gray-500'>No student details found to display report.</div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-area {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break-before-always {
                        page-break-before: always !important;
                    }
                }
            `}</style>
        </div>
    );
};
