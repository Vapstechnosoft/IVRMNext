'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportListProps {
    reportData: any;
    reportParams: any;
}

export const ReportList = ({ reportData, reportParams }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        examlist = [],
        subjectlist = [],
        student_list = [],
        process_examdetails = [],
        work_attendence = [],
        present_attendence = [],
        exmConfig_PromotionFlag,
        emP_MarksPerFlg,
        temp_headers = [],
        promotion_stumarks = [],
        promotion_mainmarks = [],
        yearName = reportParams?.yearName || '',
        className = reportParams?.className || '',
        sectionName = reportParams?.sectionName || '',
        classteacher = []
    } = reportData ?? {};

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `BCEHS_Final_Promotion_Report_${yearName}_${className}`
    });

    const handleExcel = () => {
        const table = printRef.current?.querySelector('table');
        if (!table) return;
        const wb = XLSX.utils.table_to_book(table, { sheet: 'Report' });
        XLSX.writeFile(wb, `BCEHS_Promotion_Report_${yearName}.xlsx`);
    };

    if (!student_list || student_list.length === 0) {
        return (
            <Card>
                <CardContent className="flex h-40 items-center justify-center p-6">
                    <p className="text-gray-500">No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    const classTeacherName = classteacher?.[0]?.hrmE_EmployeeFirstName || '';

    // ── Format 1 (MarksPerFlg == 'P') ─────────────────────────────────────────
    const renderFormat1 = () => (
        <div className="space-y-10">
            {student_list.map((stud: any, sIdx: number) => (
                <div key={stud.amsT_Id} className="page-break-after-always p-2" style={{ pageBreakAfter: 'always' }}>
                    <div className="text-center font-bold">
                        <h4 className="text-lg">PROGRESS REPORT</h4>
                        <p className="text-md">ACADEMIC YEAR : {yearName}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm font-bold uppercase">
                        <div className="space-y-1">
                            <div>NAME : <span className="border-b border-black">{stud.amsT_FirstName}</span></div>
                            <div>CLASS TEACHER : <span className="border-b border-black">{classTeacherName}</span></div>
                        </div>
                        <div className="space-y-1">
                            <div>CLASS : <span className="border-b border-black">{className}</span></div>
                            <div>D.O.B : <span className="border-b border-black">{stud.amsT_DOB ? new Date(stud.amsT_DOB).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span></div>
                        </div>
                        <div className="space-y-1">
                            <div>SECTION : <span className="border-b border-black">{sectionName}</span></div>
                            <div>ADM. NO : <span className="border-b border-black">{stud.amsT_AdmNo}</span></div>
                        </div>
                    </div>

                    <table className="mt-6 w-full border-collapse border border-black text-center text-xs">
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan={2} className="border border-black p-1 w-40">SUBJECTS</th>
                                {examlist.map((exm: any) => !exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.emE_ExamName}</th>
                                ))}
                                {temp_headers.map((hdr: any, idx: number) => hdr.flag !== 'F' && (
                                    <th key={idx} rowSpan={2} className="border border-black p-1">{hdr.Per_val}%</th>
                                ))}
                                {examlist.map((exm: any) => exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.emE_ExamName}</th>
                                ))}
                                {temp_headers.map((hdr: any, idx: number) => (hdr.flag === 'F' && !hdr.equal_flag) && (
                                    <th key={idx} rowSpan={2} className="border border-black p-1">{hdr.Per_val}%</th>
                                ))}
                                <th className="border border-black p-1">GRAND TOTAL</th>
                                <th rowSpan={2} className="border border-black p-1">PERCENTAGE</th>
                                <th rowSpan={2} className="border border-black p-1">GRADE</th>
                                <th rowSpan={2} className="border border-black p-1 w-60">REMARKS</th>
                            </tr>
                            <tr className="bg-gray-100">
                                {examlist.map((exm: any) => !exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.marks}</th>
                                ))}
                                {examlist.map((exm: any) => exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.marks}</th>
                                ))}
                                <th className="border border-black p-1">100%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Subject Rows logic needs careful mapping. 
                                In legacy, it was stud.final_subj_marks which was mapped in JS. 
                                Since I did some transformation in server, I'll use it if available or map here.
                             */}
                            {stud.final_subj_marks?.map((sub: any, subIdx: number) => sub.sub_details.flag && (
                                <tr key={subIdx}>
                                    <td className="border border-black p-1 text-left font-bold">{sub.sub_details.ismS_SubjectName}</td>
                                    {sub.subj_marks_details.map((marks: any, mIdx: number) => (
                                        <td key={mIdx} className="border border-black p-1 font-bold">{marks.estmpS_ObtainedMarks}</td>
                                    ))}
                                    <td className="border border-black p-1 font-bold">{Math.round(sub.sub_details.estmppS_ObtainedMarks || 0)}</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1 text-xs">{sub.sub_details.estmppS_Remarks}</td>
                                </tr>
                            ))}
                            {/* Total, Percentage, Rank rows */}
                            <tr>
                                <td className="border border-black p-1 text-left font-bold">TOTAL</td>
                                {examlist.map((exm: any) => !exm.emE_FinalExamFlag && (
                                    <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                        {process_examdetails.find((tot: any) => tot.amsT_Id === stud.amsT_Id && tot.emE_Id === exm.emE_Id)?.estmP_TotalObtMarks}
                                    </td>
                                ))}
                                {temp_headers.map((hdr: any, idx: number) => hdr.flag !== 'F' && (
                                    <td key={idx} className="border border-black p-1 font-bold">
                                        {stud.stu_Total_Array_Grp?.[0]?.total_s_o ? Math.round(stud.stu_Total_Array_Grp[0].total_s_o) : ''}
                                    </td>
                                ))}
                                {examlist.map((exm: any) => exm.emE_FinalExamFlag && (
                                    <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                        {process_examdetails.find((tot: any) => tot.amsT_Id === stud.amsT_Id && tot.emE_Id === exm.emE_Id)?.estmP_TotalObtMarks}
                                    </td>
                                ))}
                                {temp_headers.map((hdr: any, idx: number) => (hdr.flag === 'F' && !hdr.equal_flag) && (
                                    <td key={idx} className="border border-black p-1 font-bold">
                                        {stud.stu_Total_Array_Grp?.[0]?.total_s_f ? Math.round(stud.stu_Total_Array_Grp[0].total_s_f) : ''}
                                    </td>
                                ))}
                                <td className="border border-black p-1 font-bold">{Math.round(stud.stu_Total_total_grp || 0)}</td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-left font-bold">PERCENTAGE</td>
                                {examlist.map((exm: any) => !exm.emE_FinalExamFlag && (
                                    <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                        {process_examdetails.find((per: any) => per.amsT_Id === stud.amsT_Id && per.emE_Id === exm.emE_Id)?.estmP_Percentage}%
                                    </td>
                                ))}
                                {temp_headers.map((hdr: any, idx: number) => hdr.flag !== 'F' && (
                                    <td key={idx} className="border border-black p-1 font-bold"></td>
                                ))}
                                {examlist.map((exm: any) => exm.emE_FinalExamFlag && (
                                    <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                        {process_examdetails.find((per: any) => per.amsT_Id === stud.amsT_Id && per.emE_Id === exm.emE_Id)?.estmP_Percentage}%
                                    </td>
                                ))}
                                {temp_headers.map((hdr: any, idx: number) => (hdr.flag === 'F' && !hdr.equal_flag) && (
                                    <td key={idx} className="border border-black p-1 font-bold"></td>
                                ))}
                                <td className="border border-black p-1 font-bold">{stud.total_percentage}%</td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                            </tr>
                            {!reportParams?.dontShowRank && (
                                <>
                                    <tr>
                                        <td className="border border-black p-1 text-left font-bold">RANK IN SECTION</td>
                                        {examlist.map((exm: any) => (
                                            (!exm.emE_FinalExamFlag || exm.emE_FinalExamFlag) && (
                                                <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                                    {process_examdetails.find((r: any) => r.amsT_Id === stud.amsT_Id && r.emE_Id === exm.emE_Id)?.estmP_SectionRank}
                                                </td>
                                            )
                                        ))}
                                        {/* empty cells for temp_headers... */}
                                        <td colSpan={temp_headers.length + 3} className="border border-black"></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>

                    {/* Attendance Table */}
                    <table className="mt-4 w-full border-collapse border border-black text-center text-xs font-bold uppercase">
                        <thead>
                            <tr className="bg-gray-100"><th colSpan={14} className="border border-black p-1">ATTENDANCE</th></tr>
                            <tr>
                                <th className="border border-black p-1" colSpan={2}>MONTH</th>
                                {['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'TOTAL', 'TOTAL%'].map(m => (
                                    <th key={m} className="border border-black p-1">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-1" colSpan={2}>WORKING DAYS</td>
                                {(() => {
                                    const att = work_attendence.find((a: any) => a.AMST_Id === stud.amsT_Id);
                                    return ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April', 'TotalWorkingDays', 'Total_Percentage'].map(k => (
                                        <td key={k} className="border border-black p-1">{att?.[k] || 0}{k === 'Total_Percentage' ? '%' : ''}</td>
                                    ));
                                })()}
                            </tr>
                            <tr>
                                <td className="border border-black p-1" colSpan={2}>PRESENT DAYS</td>
                                {(() => {
                                    const att = present_attendence.find((a: any) => a.AMST_Id === stud.amsT_Id);
                                    return ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April', 'TotalPresentDays', 'Total_Percentage'].map(k => (
                                        <td key={k} className="border border-black p-1">{att?.[k] || 0}{k === 'Total_Percentage' ? '%' : ''}</td>
                                    ));
                                })()}
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-bold uppercase">
                        <div className="col-span-2">CLASS TEACHER&apos;S REMARKS : <span className="border-b border-black inline-block w-full"></span></div>
                    </div>

                    <div className="mt-12 flex justify-between text-xs font-bold uppercase">
                        <div className="border-t border-black pt-1 w-40 text-center">PARENT&apos;S SIGNATURE</div>
                        <div className="border-t border-black pt-1 w-48 text-center">CLASS TEACHER&apos;S SIGNATURE</div>
                        <div className="border-t border-black pt-1 w-40 text-center">PRINCIPAL&apos;S SIGNATURE</div>
                    </div>
                </div>
            ))}
        </div>
    );

    // ── Format 2 (MarksPerFlg == 'F' or 'T') ───────────────────────────────────
    const renderFormat2 = () => (
        <div className="space-y-10">
            {student_list.map((stud: any, sIdx: number) => (
                <div key={stud.amsT_Id} className="page-break-after-always p-2" style={{ pageBreakAfter: 'always' }}>
                    <div className="text-center font-bold">
                        <h4 className="text-lg">PROGRESS REPORT</h4>
                        <p className="text-md">ACADEMIC YEAR : {yearName}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm font-bold uppercase">
                        <div className="space-y-1">
                            <div>NAME : <span className="border-b border-black">{stud.amsT_FirstName}</span></div>
                            <div>CLASS TEACHER : <span className="border-b border-black">{classTeacherName}</span></div>
                        </div>
                        <div className="space-y-1">
                            <div>CLASS : <span className="border-b border-black">{className}</span></div>
                            <div>D.O.B : <span className="border-b border-black">{stud.amsT_DOB ? new Date(stud.amsT_DOB).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span></div>
                        </div>
                        <div className="space-y-1">
                            <div>SECTION : <span className="border-b border-black">{sectionName}</span></div>
                            <div>ADM. NO : <span className="border-b border-black">{stud.amsT_AdmNo}</span></div>
                        </div>
                    </div>

                    <table className="mt-6 w-full border-collapse border border-black text-center text-xs">
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan={2} className="border border-black p-1 w-40">SUBJECTS</th>
                                {examlist.map((exm: any) => !exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.emE_ExamName}</th>
                                ))}
                                {examlist.map((exm: any) => exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.emE_ExamName}</th>
                                ))}
                                <th className="border border-black p-1">GRAND TOTAL</th>
                                <th rowSpan={2} className="border border-black p-1">PERCENTAGE</th>
                                <th rowSpan={2} className="border border-black p-1">GRADE</th>
                                <th rowSpan={2} className="border border-black p-1 w-60">REMARKS</th>
                            </tr>
                            <tr className="bg-gray-100">
                                {examlist.map((exm: any) => !exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.marks}</th>
                                ))}
                                {examlist.map((exm: any) => exm.emE_FinalExamFlag && (
                                    <th key={exm.emE_Id} className="border border-black p-1">{exm.marks}</th>
                                ))}
                                <th>{reportData.total_max_sub_marks}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stud.stu_subjects?.map((sub: any, subIdx: number) => sub.flag && (
                                <tr key={subIdx}>
                                    <td className="border border-black p-1 text-left font-bold">{sub.ismS_SubjectName}</td>
                                    {examlist.map((exm: any) => (
                                        <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                            {stud.stu_student_marks?.find((m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id)?.estmpS_ObtainedMarks}
                                        </td>
                                    ))}
                                    <td className="border border-black p-1 font-bold">{promotion_stumarks.find((pm: any) => pm.amsT_Id === stud.amsT_Id && pm.ismS_Id === sub.ismS_Id)?.estmppS_ObtainedMarks}</td>
                                    <td className="border border-black p-1 font-bold">
                                        {(() => {
                                            const pm = promotion_stumarks.find((pm: any) => pm.amsT_Id === stud.amsT_Id && pm.ismS_Id === sub.ismS_Id);
                                            return pm ? ((pm.estmppS_ObtainedMarks * 100) / pm.estmppS_MaxMarks).toFixed(2) : '';
                                        })()}
                                    </td>
                                    <td className="border border-black p-1 font-bold">{promotion_stumarks.find((pm: any) => pm.amsT_Id === stud.amsT_Id && pm.ismS_Id === sub.ismS_Id)?.estmppS_ObtainedGrade}</td>
                                    <td className="border border-black p-1 font-bold">{promotion_stumarks.find((pm: any) => pm.amsT_Id === stud.amsT_Id && pm.ismS_Id === sub.ismS_Id)?.estmppS_Remarks}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="border border-black p-1 text-left font-bold">TOTAL</td>
                                {examlist.map((exm: any) => (
                                    <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                        {process_examdetails.find((tot: any) => tot.amsT_Id === stud.amsT_Id && tot.emE_Id === exm.emE_Id)?.estmP_TotalObtMarks}
                                    </td>
                                ))}
                                <td className="border border-black p-1 font-bold">{stud.total_Exams}</td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-left font-bold">PERCENTAGE</td>
                                {examlist.map((exm: any) => (
                                    <td key={exm.emE_Id} className="border border-black p-1 font-bold">
                                        {process_examdetails.find((per: any) => per.amsT_Id === stud.amsT_Id && per.emE_Id === exm.emE_Id)?.estmP_Percentage}%
                                    </td>
                                ))}
                                <td className="border border-black p-1 font-bold">{stud.overall_percentage}%</td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Attendance and Signatures same as Format 1 */}
                    <table className="mt-4 w-full border-collapse border border-black text-center text-xs font-bold uppercase">
                        <thead>
                            <tr className="bg-gray-100"><th colSpan={14} className="border border-black p-1">ATTENDANCE</th></tr>
                            <tr>
                                <th className="border border-black p-1" colSpan={2}>MONTH</th>
                                {['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'TOTAL', 'TOTAL%'].map(m => (
                                    <th key={m} className="border border-black p-1">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-1" colSpan={2}>WORKING DAYS</td>
                                {(() => {
                                    const att = work_attendence.find((a: any) => a.AMST_Id === stud.amsT_Id);
                                    return ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April', 'TotalWorkingDays', 'Total_Percentage'].map(k => (
                                        <td key={k} className="border border-black p-1">{att?.[k] || 0}{k === 'Total_Percentage' ? '%' : ''}</td>
                                    ));
                                })()}
                            </tr>
                            <tr>
                                <td className="border border-black p-1" colSpan={2}>PRESENT DAYS</td>
                                {(() => {
                                    const att = present_attendence.find((a: any) => a.AMST_Id === stud.amsT_Id);
                                    return ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April', 'TotalPresentDays', 'Total_Percentage'].map(k => (
                                        <td key={k} className="border border-black p-1">{att?.[k] || 0}{k === 'Total_Percentage' ? '%' : ''}</td>
                                    ));
                                })()}
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-bold uppercase">
                        <div className="col-span-2">CLASS TEACHER&apos;S REMARKS : <span className="border-b border-black inline-block w-full"></span></div>
                    </div>

                    <div className="mt-12 flex justify-between text-xs font-bold uppercase">
                        <div className="border-t border-black pt-1 w-40 text-center">PARENT&apos;S SIGNATURE</div>
                        <div className="border-t border-black pt-1 w-48 text-center">CLASS TEACHER&apos;S SIGNATURE</div>
                        <div className="border-t border-black pt-1 w-40 text-center">PRINCIPAL&apos;S SIGNATURE</div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Card className="mt-6">
            <div className="flex items-center justify-between border-b px-6 py-3 no-print">
                <h3 className="font-semibold text-lg">Promotion Report</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExcel} className="flex items-center gap-2">
                        <FileDown className="h-4 w-4" /> Excel
                    </Button>
                    <Button variant="default" size="sm" onClick={handlePrint} className="flex items-center gap-2">
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            <CardContent className="p-6">
                <div ref={printRef} className="bg-white overflow-auto max-h-[800px]">
                    {emP_MarksPerFlg === 'P' ? renderFormat1() : renderFormat2()}
                </div>
            </CardContent>
        </Card>
    );
};
