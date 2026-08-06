'use client';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportListProps {
    data: any;
    academicYearName: string;
    classNameVal: string;
    sectionNameVal: string;
    reOpenDate: Date | null;
}

export const ReportList = ({
    data,
    academicYearName,
    classNameVal,
    sectionNameVal,
    reOpenDate
}: ReportListProps) => {
    const studentList = data?.studentDetails || data?.stu_details || [];
    const stuDetails = studentList[0] || {};
    const stuname = stuDetails.stuname || '';
    const asmcL_ClassName = stuDetails.asmcL_ClassName || classNameVal || '';
    const amsT_DOB = stuDetails.amsT_DOB || '';
    const AMST_Photoname = stuDetails.amsT_Photoname || '';

    const exm_sub_mrks_list = data?.subjectMarks || data?.eam_sub_mrks_list || data?.exm_sub_mrks_list || [];
    const Present_attendence = data?.attendance || data?.present_attendence || data?.Present_attendence || [];
    const grade_detailslist = data?.gradeDetails || data?.grade_detailslist || data?.grade_details || [];
    const examwiseremarks = data?.examRemarks || data?.examwiseremarks || [];

    const EPRD_PromotionName = data?.eprD_PromotionName || data?.EPRD_PromotionName || stuDetails.eprD_PromotionName || stuDetails.EPRD_PromotionName || '';
    const EPRD_ClassPromoted = data?.eprD_ClassPromoted || data?.EPRD_ClassPromoted || stuDetails.eprD_ClassPromoted || stuDetails.EPRD_ClassPromoted || '';

    const { exam_list, subject_list } = useMemo(() => {
        const exams: any[] = [];
        const subjects: any[] = [];

        exm_sub_mrks_list.forEach((st: any) => {
            if (st.emeid && st.examname && !exams.some((ex) => ex.emE_Id === st.emeid)) {
                exams.push({ emE_Id: st.emeid, emE_ExamName: st.examname, maxmarks: st.maxmarks });
            }

            if (st.subid && st.subjectname && !subjects.some((sub) => sub.ISMS_Id === st.subid)) {
                subjects.push({
                    ISMS_Id: st.subid,
                    subjectname: st.subjectname,
                    flag: st.flag
                });
            }
        });

        const subjectsWithSub = subjects.map((subj) => {
            const subsubjects: any[] = [];
            exm_sub_mrks_list.forEach((main: any) => {
                if (main.subid === subj.ISMS_Id && main.ssubj && main.SubsubjectName) {
                    if (!subsubjects.some((ssub) => ssub.EMSS_Id === main.ssubj)) {
                        subsubjects.push({
                            EMSS_Id: main.ssubj,
                            SubSbuject: main.SubsubjectName
                        });
                    }
                }
            });
            return {
                ...subj,
                subsubjects
            };
        });

        return {
            exam_list: exams,
            subject_list: subjectsWithSub
        };
    }, [exm_sub_mrks_list]);

    const getMarks = (subId: number, examId: number, subSubId?: number) => {
        const markRecord = exm_sub_mrks_list.find((m: any) =>
            m.subid === subId &&
            m.emeid === examId &&
            (!subSubId || m.ssubj === subSubId)
        );
        if (!markRecord) return '';
        if (markRecord.passfailflag === 'AB') return 'AB';
        if (markRecord.passfailflag === 'OD') return 'OD';
        if (markRecord.passfailflag === 'M') return 'M';
        return markRecord.obtainmarks;
    };

    const getGrade = (subId: number, examId: number, subSubId?: number) => {
        const markRecord = exm_sub_mrks_list.find((m: any) =>
            m.subid === subId &&
            m.emeid === examId &&
            (!subSubId || m.ssubj === subSubId)
        );
        if (!markRecord) return '';
        if (markRecord.passfailflag === 'AB') return 'AB';
        if (markRecord.passfailflag === 'OD') return 'OD';
        if (markRecord.passfailflag === 'M') return 'M';
        return markRecord.grade || '';
    };

    const getStudentData = (examId: number) => {
        return studentList.find((s: any) => s.emeid === examId) || {};
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDateVal = (dateStr: any) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return String(dateStr);
            return format(date, 'dd/MM/yyyy');
        } catch {
            return String(dateStr);
        }
    };

    return (
        <div className="w-full space-y-4">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #hhs-report-5to7-print-area,
                    #hhs-report-5to7-print-area * {
                        visibility: visible !important;
                    }
                    #hhs-report-5to7-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Page Break Handling */
                    tr, .page-break-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid black !important;
                        padding: 3px 4px !important;
                        font-size: 10px !important;
                    }
                    .table td {
                        padding: 3px 4px !important;
                        font-size: 10px !important;
                    }
                    h1.Monotype { font-size: 26px !important; margin: 0 !important; line-height: 1 !important; }
                    h4 { font-size: 11px !important; margin: 0 !important; }
                    .report-logo { height: 60px !important; }
                    .report-student-photo { width: 90px !important; height: 100px !important; }
                    .box { padding: 2px 10px !important; font-size: 12px !important; }
                    .box1 { padding: 4px !important; margin-top: 4px !important; }
                    .grade-box { padding: 4px !important; }
                    .ProgressReport-HH5to7 section { padding: 0 !important; border: none !important; margin-bottom: 0 !important; }
                }
                .ProgressReport-HH5to7 {
                    background: #fff;
                    font-family: 'Times New Roman', Times, serif;
                    color: #000;
                    margin: 0 auto;
                    max-width: 900px;
                }
                .ProgressReport-HH5to7 section {
                    padding: 20px;
                    border: 1px solid #ccc;
                    margin-bottom: 15px;
                    background: #fff;
                }
                .ProgressReport-HH5to7 .Monotype {
                    font-family: 'Monotype Corsiva', 'Apple Chancery', cursive, serif;
                    font-size: 32px;
                    font-weight: bold;
                    color: #1a365d;
                    line-height: 1.1;
                }
                .ProgressReport-HH5to7 h4 {
                    font-size: 13px;
                    font-style: italic;
                    color: #555;
                    margin-top: 2px;
                }
                .ProgressReport-HH5to7 table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ProgressReport-HH5to7 td, .ProgressReport-HH5to7 th {
                    padding: 4px 6px;
                }
                .ProgressReport-HH5to7 .table-bordered {
                    border: 1px solid #000;
                }
                .ProgressReport-HH5to7 .table-bordered th, .ProgressReport-HH5to7 .table-bordered td {
                    border: 1px solid #000;
                }
                .ProgressReport-HH5to7 .box {
                    border: 1.5px solid #000;
                    padding: 4px 15px;
                    font-size: 14px;
                    font-weight: bold;
                    display: inline-block;
                }
                .ProgressReport-HH5to7 .box1 {
                    border: 1px solid #000;
                    padding: 6px;
                    margin-top: 4px;
                }
                .ProgressReport-HH5to7 .grade-box {
                    border: 1px solid #000;
                    padding: 8px;
                }
                `
            }} />

            {/* Print trigger bar */}
            <div className="flex justify-end p-2 border-b bg-gray-50 rounded-lg no-print">
                <Button onClick={handlePrint} className="bg-primary text-white flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print Report
                </Button>
            </div>

            {/* Report view container */}
            <div id="hhs-report-5to7-print-area" className="ProgressReport-HH5to7 print:!border-none print:!shadow-none">

                <section className="!p-4 print:!p-0 print:!border-none">
                    <div className="w-full flex flex-col gap-2">

                        {/* Header */}
                        <div className="image text-center space-y-2">
                            <div className="header text-center">
                                <h1 className="Monotype">Hutchings High School & Junior College</h1>
                                <h4>(Affiliated to the Council for the Indian School Certificate Examination, New Delhi)</h4>
                            </div>

                            <div className="flex justify-center py-1">
                                <img
                                    src="/images/Clients/Hutchings/ProgressReports/hhlogo.png"
                                    alt="Hutchings Logo"
                                    className="report-logo h-[70px] w-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/assets/tunbridge_logo.png';
                                    }}
                                />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-base font-bold tracking-wider m-0">ACADEMIC YEAR</h3>
                                <div className="mt-0">
                                    <span className="box">{academicYearName || '2025-2026'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Student Info & Photo */}
                        <div className="flex flex-row items-center justify-between gap-4 px-4 my-2">
                            <div className="flex-1">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold text-sm w-1/3">My Name is / NAME:</td>
                                            <td className="text-sm text-blue-900 font-bold px-2">{stuname}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold text-sm">I Study in Class / STANDARD:</td>
                                            <td className="text-sm text-blue-900 font-bold px-2">{asmcL_ClassName}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold text-sm">I was born on / D.O.B:</td>
                                            <td className="text-sm text-blue-900 font-bold px-2">{formatDateVal(amsT_DOB)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-shrink-0">
                                {AMST_Photoname ? (
                                    <img
                                        src={AMST_Photoname}
                                        alt="Student"
                                        className="report-student-photo w-[110px] h-[120px] border border-gray-300 object-cover bg-white"
                                    />
                                ) : (
                                    <div className="report-student-photo w-[110px] h-[120px] border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 text-[10px]">
                                        No Photo
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-gray-500 font-medium">
                            7, Phayre Road, Pune-411040. Tel.: 020-26352764 | website: www.hutchingsschoolpune.in
                        </div>

                        {/* Academic Record Table */}
                        <div className="mt-2">
                            <table className="table-bordered w-full text-[10px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-center font-bold py-1" style={{ width: '25%' }}>SUBJECT</th>
                                        {exam_list.map((exam, idx) => (
                                            <th key={idx} className="text-center font-bold py-1" style={{ width: `${55 / exam_list.length}%` }}>
                                                {exam.emE_ExamName} <br />
                                                <span className="font-normal text-[9px]">({exam.maxmarks?.toFixed(2) || '100.00'})</span>
                                            </th>
                                        ))}
                                        <th className="text-center font-bold py-1" style={{ width: '10%' }}>Grand Total <br /><span className="font-normal text-[9px]">(200)</span></th>
                                        <th className="text-center font-bold py-1" style={{ width: '10%' }}>Average <br /><span className="font-normal text-[9px]">(100)</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subject_list.map((subj, index) => {
                                        const isGradeSubj = subj.flag === 2 || ['moral science', 'art', 'craft'].includes(subj.subjectname.toLowerCase());
                                        return (
                                            <tr key={index}>
                                                <td className="font-semibold align-middle py-1 px-2 border-b border-black text-left">{subj.subjectname}</td>
                                                {exam_list.map((exam, eIdx) => (
                                                    <td key={eIdx} className="border-r border-b border-black text-center align-middle font-bold text-gray-800 bg-white">
                                                        {isGradeSubj ? getGrade(subj.ISMS_Id, exam.emE_Id) || '-' : getMarks(subj.ISMS_Id, exam.emE_Id)}
                                                    </td>
                                                ))}
                                                <td className="border-r border-b border-black text-center align-middle font-bold text-gray-800 bg-white">
                                                    {!isGradeSubj ? studentList.find((s: any) => s.emeid === 9999)?.estmP_TotalObtMarks : ''}
                                                </td>
                                                <td className="border-r border-b border-black text-center align-middle font-bold text-gray-800 bg-white">
                                                    {!isGradeSubj ? studentList.find((s: any) => s.emeid === 9999)?.estmP_Percentage : ''}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="font-bold bg-gray-50/50">
                                        <td className="text-left py-1 px-2">Total</td>
                                        {exam_list.map((exam, eIdx) => (
                                            <td key={eIdx} className="text-center">{getStudentData(exam.emE_Id).estmP_TotalObtMarks || ''}</td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr className="font-bold bg-gray-50/50">
                                        <td className="text-left py-1 px-2">Percentage</td>
                                        {exam_list.map((exam, eIdx) => (
                                            <td key={eIdx} className="text-center">{getStudentData(exam.emE_Id).estmP_Percentage || ''}</td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td className="text-left py-1 px-2">Rank</td>
                                        {exam_list.map((exam, eIdx) => (
                                            <td key={eIdx} className="text-center">{getStudentData(exam.emE_Id).estmP_SectionRank || ''}</td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td className="text-left py-1 px-2">Grade</td>
                                        {exam_list.map((exam, eIdx) => (
                                            <td key={eIdx} className="text-center">{getStudentData(exam.emE_Id).estmP_TotalGrade || 'B'}</td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="font-semibold py-1.5 px-2 text-left">Teacher's Sign</td>
                                        {exam_list.map((_, idx) => <td key={idx}></td>)}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-1.5 px-2 text-left">Parent's/Guardian's Sign</td>
                                        {exam_list.map((_, idx) => <td key={idx}></td>)}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Internal Assessment Table */}
                        {exam_list.length >= 2 && (
                            <div className="mt-2 page-break-avoid">
                                <div className="text-center font-bold text-xs bg-gray-100 border border-black p-1 uppercase">INTERNAL ASSESSMENT (IA)</div>
                                <table className="table-bordered w-full text-[9px]">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th rowSpan={2} className="text-center font-bold py-1 w-[20%]">SUBJECT</th>
                                            <th colSpan={3} className="text-center font-bold py-1 w-[40%]">Terminal Examination</th>
                                            <th colSpan={3} className="text-center font-bold py-1 w-[40%]">Final Examination</th>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <th className="font-semibold py-1">Project/Practical (10)</th>
                                            <th className="font-semibold py-1">Theory (80)</th>
                                            <th className="font-semibold py-1">Total (100)</th>
                                            <th className="font-semibold py-1">Project/Practical (10)</th>
                                            <th className="font-semibold py-1">Theory (80)</th>
                                            <th className="font-semibold py-1">Total (100)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subject_list.filter(s => s.flag !== 2 && !['moral science', 'art', 'craft'].includes(s.subjectname.toLowerCase())).map((subj, sIdx) => (
                                            <tr key={sIdx}>
                                                <td className="font-bold py-1 px-2 text-left">{subj.subjectname}</td>
                                                <td></td>
                                                <td></td>
                                                <td className="font-semibold text-center">{getMarks(subj.ISMS_Id, exam_list[0]?.emE_Id)}</td>
                                                <td></td>
                                                <td></td>
                                                <td className="font-semibold text-center">{getMarks(subj.ISMS_Id, exam_list[1]?.emE_Id) || '0'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer Data (Attendance, Remarks, Grades) */}
                        <div className="flex flex-row justify-between gap-4 mt-2 page-break-avoid">
                            {/* Left Side: Attendance & Remarks & Promotion */}
                            <div className="w-1/2 flex flex-col gap-2">
                                {/* Attendance */}
                                <table className="table-bordered w-full text-[10px]">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left font-bold py-1 px-2 w-[40%]">Attendance</th>
                                            {exam_list.map((exam) => (
                                                <th key={exam.emE_Id} className="text-center font-bold py-1">{exam.emE_ExamName}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="text-left py-1 px-2 font-medium">Total No. of working days</td>
                                            {exam_list.map((exam) => {
                                                const att = Present_attendence.find((dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id));
                                                return <td key={exam.emE_Id} className="text-center py-1 font-semibold text-gray-700">{att ? att.TOTALWORKINGDAYS : ''}</td>;
                                            })}
                                        </tr>
                                        <tr>
                                            <td className="text-left py-1 px-2 font-medium">Total No. of Days Present</td>
                                            {exam_list.map((exam) => {
                                                const att = Present_attendence.find((dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id));
                                                return <td key={exam.emE_Id} className="text-center py-1 font-semibold text-gray-700">{att ? att.PRESENTDAYS : ''}</td>;
                                            })}
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Promotion & Reopen */}
                                <div className="box1 rounded-sm border-2 border-black w-full text-[10px]">
                                    <table className="table w-full">
                                        <tbody>
                                            <tr className="border-b border-black">
                                                <td className="font-bold border-r border-black py-1 px-2 w-1/2">PROMOTED / DETAINED</td>
                                                <td className="py-1 px-2 font-bold text-blue-900">
                                                    {EPRD_PromotionName ? `${EPRD_PromotionName.toUpperCase()} ${EPRD_ClassPromoted.toUpperCase()}` : 'N/A'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold border-r border-black py-1 px-2">SCHOOL RE-OPENS ON</td>
                                                <td className="py-1 px-2 font-bold text-blue-900">
                                                    {reOpenDate ? format(new Date(reOpenDate), 'dd-MM-yyyy') : 'N/A'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks */}
                                <div className="flex flex-row flex-wrap gap-2 w-full">
                                    {examwiseremarks.map((remarks: any, i: number) => (
                                        <div key={i} className="flex-1 min-w-[120px] box1 rounded-sm border border-black">
                                            <div className="font-bold text-[9px] text-gray-800 uppercase border-b border-gray-200 pb-1 mb-1">
                                                REMARKS: {remarks.emE_ExamName}
                                            </div>
                                            <div className="text-blue-900 font-semibold text-[10px] pb-4">{remarks.emeR_Remarks}</div>
                                            <div className="text-right font-medium italic pt-2 text-gray-600 text-[9px] border-t border-gray-200">Principal's Sign</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Grades */}
                            <div className="w-1/2">
                                <div className="grade-box rounded-md text-[10px]">
                                    <table className="table w-full">
                                        <tbody>
                                            {grade_detailslist.map((gg: any, idx: number) => (
                                                <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                                                    <td className="text-left font-bold py-1 w-[25%]">{gg.emgD_Name}</td>
                                                    <td className="text-gray-400 py-1 text-center w-[10%]">---</td>
                                                    <td className="text-left font-semibold py-1 w-[40%]">{String(gg.emgD_Remarks || '').toUpperCase()}</td>
                                                    <td className="text-gray-400 py-1 text-center w-[10%]">---</td>
                                                    <td className="text-left text-gray-700 py-1 w-[15%]">{gg.emgD_From}-{gg.emgD_To}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
};
