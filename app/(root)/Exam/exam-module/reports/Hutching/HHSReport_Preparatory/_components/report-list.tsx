'use client';
// Triggering TS Server re-evaluation
import { useMemo } from 'react';
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
    const stuDetails = data?.stu_details?.[0] || {};
    const stuname = stuDetails.stuname || '';
    const asmcL_ClassName = stuDetails.asmcL_ClassName || classNameVal || '';
    const amsT_DOB = stuDetails.amsT_DOB || '';
    const AMST_Photoname = stuDetails.amsT_Photoname || '';

    const exm_sub_mrks_list = data?.eam_sub_mrks_list || data?.exm_sub_mrks_list || [];
    const Present_attendence = data?.present_attendence || data?.Present_attendence || [];
    const examwiseremarks = data?.examwiseremarks || [];
    const grade_detailslist = data?.grade_detailslist || data?.grade_details || [];

    const EPRD_PromotionName = data?.eprD_PromotionName || data?.EPRD_PromotionName || stuDetails.eprD_PromotionName || stuDetails.EPRD_PromotionName || '';
    const EPRD_ClassPromoted = data?.eprD_ClassPromoted || data?.EPRD_ClassPromoted || stuDetails.eprD_ClassPromoted || stuDetails.EPRD_ClassPromoted || '';

    // Extract dynamic list of exams and subjects
    const { exam_list, subject_list } = useMemo(() => {
        const exams: any[] = [];
        const subjects: any[] = [];

        exm_sub_mrks_list.forEach((st: any) => {
            if (st.emeid && st.examname && !exams.some((ex) => ex.emE_Id === st.emeid)) {
                exams.push({ emE_Id: st.emeid, emE_ExamName: st.examname });
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
        <div className="w-full space-y-6">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #hhs-report-preparatory-print-area,
                    #hhs-report-preparatory-print-area * {
                        visibility: visible !important;
                    }
                    #hhs-report-preparatory-print-area {
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
                }
                .ProgressReport-HH03 {
                    background: #fff;
                    font-family: 'Times New Roman', Times, serif;
                    color: #000;
                    margin: 0 auto;
                    max-width: 900px;
                }
                .ProgressReport-HH03 section {
                    padding: 40px;
                    border: 1px solid #ccc;
                    margin-bottom: 20px;
                    background: #fff;
                }
                .ProgressReport-HH03 .Monotype {
                    font-family: 'Monotype Corsiva', 'Apple Chancery', cursive, serif;
                    font-size: 38px;
                    font-weight: bold;
                    color: #1a365d;
                    line-height: 1.2;
                }
                .ProgressReport-HH03 h4 {
                    font-size: 15px;
                    font-style: italic;
                    color: #555;
                    margin-top: 5px;
                }
                .ProgressReport-HH03 table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ProgressReport-HH03 td, .ProgressReport-HH03 th {
                    padding: 8px;
                }
                .ProgressReport-HH03 .table-bordered {
                    border: 1px solid #000;
                }
                .ProgressReport-HH03 .table-bordered th, .ProgressReport-HH03 .table-bordered td {
                    border: 1px solid #000;
                }
                .ProgressReport-HH03 .border-bottom {
                    border-bottom: 1px solid #000;
                }
                .ProgressReport-HH03 .box {
                    border: 1.5px solid #000;
                    padding: 5px 25px;
                    font-size: 18px;
                    font-weight: bold;
                    display: inline-block;
                }
                .ProgressReport-HH03 .box1 {
                    border: 1.5px solid #000;
                    padding: 10px;
                    margin-top: 15px;
                }
                .ProgressReport-HH03 .grade-box {
                    border: 1px solid #000;
                    padding: 15px;
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
            <div id="hhs-report-preparatory-print-area" className="ProgressReport-HH03">
                {/* SECTION 1: Cover Page */}
                <section className="section01 page-break-after:always;">
                    <div className="image text-center space-y-6">
                        <div className="header text-center">
                            <h1 className="Monotype">Hutchings<br />High School & Junior College</h1>
                            <h4>(Affiliated to the Council for the Indian School Certificate Examination, New Delhi)</h4>
                        </div>

                        <div className="flex justify-center py-4">
                            <img
                                src="/images/Clients/Hutchings/ProgressReports/hhlogo.png"
                                alt="Hutchings Logo"
                                className="h-32 w-auto object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/tunbridge_logo.png'; // safe fallback
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold tracking-wider">ACADEMIC YEAR</h3>
                            <div className="mt-1">
                                <span className="box">{academicYearName || '2025-2026'}</span>
                            </div>
                        </div>

                        <div className="flex justify-center my-6">
                            {AMST_Photoname ? (
                                <img
                                    src={AMST_Photoname}
                                    alt="Student"
                                    className="w-[150px] h-[160px] border border-gray-300 object-cover bg-white"
                                />
                            ) : (
                                <div className="w-[150px] h-[160px] border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 text-xs">
                                    No Student Photo
                                </div>
                            )}
                        </div>

                        <div className="w-[80%] mx-auto text-left pt-6 space-y-4">
                            <table className="table">
                                <tbody>
                                    <tr className="border-bottom">
                                        <td className="font-semibold text-lg" style={{ width: '160px' }}>My Name is</td>
                                        <td className="text-lg text-blue-900 font-bold px-2">{stuname}</td>
                                    </tr>
                                    <tr className="border-bottom">
                                        <td className="font-semibold text-lg" style={{ width: '160px' }}>I Study in Class</td>
                                        <td className="text-lg text-blue-900 font-bold px-2">{asmcL_ClassName}</td>
                                    </tr>
                                    <tr className="border-bottom">
                                        <td className="font-semibold text-lg" style={{ width: '160px' }}>I was born on</td>
                                        <td className="text-lg text-blue-900 font-bold px-2">{formatDateVal(amsT_DOB)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-20 text-center text-xs text-gray-500 font-medium">
                            7, Phayre Road, Pune-411040. Tel.: 020-26352764
                            <br />
                            website: www.hutchingsschoolpune.in
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Academic Record */}
                <section className="section02 page-break-after:always;">
                    <div className="space-y-6">
                        <h2 className="text-center text-xl font-bold tracking-tight text-gray-900">
                            HUTCHINGS HIGH SCHOOL & JUNIOR COLLEGE
                        </h2>

                        <div className="border border-black p-4 rounded-md space-y-2">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold" style={{ width: '80px' }}>NAME:</td>
                                        <td className="border-bottom text-blue-900 font-bold px-2">{stuname}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold" style={{ width: '110px' }}>STANDARD :</td>
                                        <td className="border-bottom text-blue-900 font-bold px-2">{asmcL_ClassName}</td>
                                        <td className="font-semibold" style={{ width: '150px', textAlign: 'right' }}>DATE OF BIRTH :</td>
                                        <td className="border-bottom text-blue-900 font-bold px-2" style={{ width: '150px' }}>{formatDateVal(amsT_DOB)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center my-2">
                            <img
                                src="/images/Clients/Hutchings/ProgressReports/HHSReportCard/05.png"
                                alt="Academic Record Header"
                                className="h-10 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>

                        <table className="table-bordered w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th colSpan={2} className="text-center font-bold border-r border-b border-black py-2" style={{ width: '35%' }}>
                                        SUBJECT
                                    </th>
                                    {exam_list.map((exam) => (
                                        <th key={exam.emE_Id} className="text-center font-bold border-b border-black py-2" style={{ width: `${65 / exam_list.length}%` }}>
                                            {exam.emE_ExamName}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {subject_list.map((subj, index) => {
                                return (
                                    <tbody key={subj.ISMS_Id} className="border-b border-black">
                                        {/* Row 1: Subject name */}
                                        <tr>
                                            <td
                                                className="border-r border-black font-semibold bg-gray-50/50 align-middle py-2 px-3"
                                                rowSpan={subj.subsubjects.length + 2}
                                            >
                                                {subj.subjectname}
                                            </td>
                                        </tr>
                                        {/* Dynamic Rows for Subsubjects */}
                                        {subj.subsubjects.map((ssubj: any) => (
                                            <tr key={ssubj.EMSS_Id} className="border-b border-black last:border-b-0">
                                                <td className="border-r border-black py-2 px-3 align-middle bg-white">
                                                    {ssubj.SubSbuject}
                                                </td>
                                                {exam_list.map((y) => {
                                                    const marks = exm_sub_mrks_list.find((m: any) =>
                                                        Number(m.emeid) === Number(y.emE_Id) &&
                                                        Number(m.subid) === Number(subj.ISMS_Id) &&
                                                        Number(m.ssubj) === Number(ssubj.EMSS_Id)
                                                    );
                                                    if (!marks) return <td key={y.emE_Id} className="border-r border-black text-center align-middle bg-white"></td>;

                                                    const isAbnormal = ['AB', 'M', 'L'].includes(marks.PassFailFlg);
                                                    return (
                                                        <td key={y.emE_Id} className="border-r border-black text-center align-middle font-bold text-gray-800 bg-white">
                                                            {isAbnormal ? (
                                                                <span>{marks.PassFailFlg} ({marks.ObtainedGrade})</span>
                                                            ) : (
                                                                <span>{marks.ObtainedGrade}</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                );
                            })}

                            <tfoot>
                                <tr className="border-t border-black">
                                    <td colSpan={2} className="font-semibold py-3 px-3 border-r border-black">Teacher&apos;s Sign</td>
                                    {exam_list.map((key) => (
                                        <td key={key.emE_Id} className="border-r border-black"></td>
                                    ))}
                                </tr>
                                <tr className="border-t border-black">
                                    <td colSpan={2} className="font-semibold py-3 px-3 border-r border-black">Parent&apos;s/Guardian&apos;s Sign</td>
                                    {exam_list.map((key) => (
                                        <td key={key.emE_Id} className="border-r border-black"></td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>

                {/* SECTION 3: Attendance, Remarks and Grade reference */}
                <section className="section03">
                    <div className="space-y-6">
                        <div className="flex justify-center my-2">
                            <img
                                src="/images/Clients/Hutchings/ProgressReports/HHSReportCard/03.png"
                                alt="Attendance Header"
                                className="h-10 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>

                        {/* Attendance Table */}
                        <table className="table-bordered w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left font-bold py-2 px-3 border-r border-black" style={{ width: '40%' }}>
                                        Attendance
                                    </th>
                                    {exam_list.map((exam) => (
                                        <th key={exam.emE_Id} className="text-center font-bold py-2 border-r border-black last:border-r-0">
                                            {exam.emE_ExamName}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-left py-2 px-3 border-r border-black font-medium">
                                        Total No. of working days
                                    </td>
                                    {exam_list.map((exam) => {
                                        const att = Present_attendence.find((dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id));
                                        return (
                                            <td key={exam.emE_Id} className="text-center py-2 border-r border-black last:border-r-0 font-semibold text-gray-700">
                                                {att ? att.TOTALWORKINGDAYS : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="text-left py-2 px-3 border-r border-black font-medium">
                                        Total No. of Days Present
                                    </td>
                                    {exam_list.map((exam) => {
                                        const att = Present_attendence.find((dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id));
                                        return (
                                            <td key={exam.emE_Id} className="text-center py-2 border-r border-black last:border-r-0 font-semibold text-gray-700">
                                                {att ? att.PRESENTDAYS : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>

                        {/* Exam Wise Remarks */}
                        <div className="space-y-4">
                            {examwiseremarks.map((remarks: any, i: number) => (
                                <div key={i} className="space-y-1">
                                    <h5 className="font-bold text-sm text-gray-800 uppercase px-1">
                                        REMARKS : {remarks.emE_ExamName}
                                    </h5>
                                    <div className="box1 rounded-sm">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td className="py-2 text-blue-900 font-semibold">{remarks.emeR_Remarks}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-right font-medium italic pt-4 text-gray-600">Principal&apos;s Sign</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Promotion and Reopens info */}
                        <div className="box1 rounded-sm border-2 border-black max-w-[60%]">
                            <table className="table">
                                <tbody>
                                    <tr className="border-b border-black last:border-b-0">
                                        <td className="font-bold border-r border-black py-2 px-3" style={{ width: '50%' }}>PROMOTED / DETAINED</td>
                                        <td className="py-2 px-4 font-bold text-blue-900">
                                            {EPRD_PromotionName ? `${EPRD_PromotionName.toUpperCase()} ${EPRD_ClassPromoted.toUpperCase()}` : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold border-r border-black py-2 px-3">SCHOOL RE-OPENS ON</td>
                                        <td className="py-2 px-4 font-bold text-blue-900">
                                            {reOpenDate ? format(reOpenDate, 'dd-MM-yyyy') : 'N/A'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center my-2">
                            <img
                                src="/images/Clients/Hutchings/ProgressReports/HHSReportCard/04.png"
                                alt="Grade scaling Header"
                                className="h-10 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>

                        {/* Grade reference scales */}
                        <div className="grade-box border border-black p-4 rounded-md">
                            <table className="table text-sm">
                                <tbody>
                                    {grade_detailslist.map((gg: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                                            <td className="text-left font-bold py-1.5" style={{ width: '80px' }}>{gg.emgD_Name}</td>
                                            <td className="text-gray-400 py-1.5" style={{ width: '40px' }}>---</td>
                                            <td className="text-left font-semibold py-1.5" style={{ width: '150px' }}>{String(gg.emgD_Remarks || '').toUpperCase()}</td>
                                            <td className="text-gray-400 py-1.5" style={{ width: '40px' }}>---</td>
                                            <td className="text-left text-gray-700 py-1.5">{gg.emgD_From}&nbsp;&nbsp;----&nbsp;&nbsp;{gg.emgD_To}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
