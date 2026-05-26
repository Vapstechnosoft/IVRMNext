import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    dateInfo: any;
    institution: IMasterInstitution | Institution | null;
}

const CalcuttaPromotionReportView = ({ data, dateInfo, institution }: CalcuttaPromotionReportViewProps) => {
    const handleExport = () => {};
    const handlePrint = () => {
        window.print();
    };

    if (!data || !data.studentdetails || data.studentdetails.length === 0) {
        return (
            <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm'>
                <p className='font-medium text-gray-500 text-lg'>No data available. Please generate the report.</p>
            </div>
        );
    }

    const { getgroupdetails, groupwiseexamlist, studentdetails, examwiseremarkstemp } = data;

    return (
        <div>
            <style>
                {`
                @media print {
                    @page { margin: 10mm; }
                    body {
                        visibility: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                }
                `}
            </style>

            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExport}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
            </div>

            <div id='printable-area'>
                {studentdetails.map((student: any, index: number) => {
                    // Extract Semester-II remarks and conduct specifically
                    const semesterRemarks = examwiseremarkstemp?.find(
                        (r: any) => r.amsT_Id === student.amsT_Id || r.AMST_Id === student.amsT_Id
                    );

                    return (
                        <div
                            key={student.amsT_Id || index}
                            className={`mx-auto max-w-[1000px] bg-white p-4 font-sans text-black ${index < studentdetails.length - 1 ? 'page-break mb-8' : ''}`}>
                            {/* Academic Session Badge */}
                            <div className='mt-12 mb-2 flex justify-center'>
                                <div className='border border-black bg-white px-8 py-1'>
                                    <h2 className='font-bold text-[20px] uppercase tracking-wider'>
                                        ACADEMIC SESSION {student.asmaY_Year}
                                    </h2>
                                </div>
                            </div>

                            {/* Student Info Box */}
                            <div className='mb-2 flex border-[0.5px] border-black p-1'>
                                <div className='flex-1 pr-2'>
                                    <div className='mt-2 grid grid-cols-[120px_10px_1fr] gap-y-1 font-bold text-[14px]'>
                                        <div>Student's Name</div>
                                        <div>:</div>
                                        <div className='uppercase'>{student.amsT_FirstName || student.studentname}</div>
                                        <div>Scholar No.</div>
                                        <div>:</div>
                                        <div>{student.amsT_AdmNo || student.admno}</div>
                                        <div>Total Students</div>
                                        <div>:</div>
                                        <div>{studentdetails.length}</div>
                                    </div>
                                </div>
                                <div className='flex-1 px-2'>
                                    <div className='mt-2 grid grid-cols-[100px_10px_1fr] gap-y-1 font-bold text-[14px]'>
                                        <div>Class & sec</div>
                                        <div>:</div>
                                        <div className='uppercase'>
                                            {student.asmcL_ClassName} - {student.asmC_SectionName}
                                        </div>
                                        <div>Roll No</div>
                                        <div>:</div>
                                        <div>{student.amaY_RollNo || student.rollno || 1}</div>
                                    </div>
                                </div>
                                <div className='mt-2 mr-1 flex h-[100px] w-[100px] items-center justify-center'>
                                    {student.amsT_Photoname ? (
                                        <img src={student.amsT_Photoname} alt='Student' className='h-full w-full object-contain' />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center border border-black text-gray-400 text-xs'>
                                            Photo
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Subject Table */}
                            <div className='pt-2'>
                                <table className='mb-2 w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={2}
                                                className='w-[300px] break-words border-[0.5px] border-black p-2 text-center align-middle font-bold'>
                                                SUBJECTS
                                            </th>
                                            {getgroupdetails?.map((grp: any, idx: number) => (
                                                <th
                                                    key={idx}
                                                    colSpan={grp.groupewiseexam?.length || 1}
                                                    className='border-[0.5px] border-black bg-gray-400 p-2 text-center uppercase'>
                                                    {grp.empG_DistplayName}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            {groupwiseexamlist?.map((exam: any, idx: number) => (
                                                <th
                                                    key={idx}
                                                    className='w-[150px] break-words border-[0.5px] border-black p-2 text-center font-bold'>
                                                    {exam.examnamedisplay}
                                                    {exam.EMPSGE_ForMaxMarkrs && exam.examnamedisplay !== 'Highest in Class' ? (
                                                        <>
                                                            <br />[{exam.EMPSGE_ForMaxMarkrs}]
                                                        </>
                                                    ) : (
                                                        ''
                                                    )}
                                                    {!exam.EMPSGE_ForMaxMarkrs &&
                                                    exam.EME_Id === 9800000 &&
                                                    exam.examnamedisplay === 'Total' ? (
                                                        <>
                                                            <br />
                                                            [200]
                                                        </>
                                                    ) : (
                                                        ''
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.studentsubjects
                                            ?.filter((s: any) => s.EYCES_MarksDisplayFlg || s.eyceS_MarksDisplayFlg)
                                            .map((subj: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className='break-words border-[0.5px] border-black p-2 text-left'>
                                                        {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                    </td>
                                                    {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                        let cellValue: any = '-';
                                                        if (exam.EME_Id === 9800000) {
                                                            const mr1 = student.studentmarks?.find(
                                                                (t: any) =>
                                                                    t.emE_Id === 9800000 &&
                                                                    (t.ISMS_Id === subj.ISMS_Id || t.ismS_Id === subj.ismS_Id)
                                                            );
                                                            if (mr1) {
                                                                cellValue =
                                                                    mr1.obtainedMarks ||
                                                                    mr1.ObtainedMarks ||
                                                                    mr1.estmpS_ObtainedMarks ||
                                                                    cellValue;
                                                            } else {
                                                                cellValue = subj.estmppsG_GroupObtMarks || cellValue;
                                                            }
                                                        } else if (exam.EME_Id === 98000012) {
                                                            const mr1 = student.studentmarks?.find(
                                                                (t: any) =>
                                                                    t.emE_Id === 98000012 &&
                                                                    (t.ISMS_Id === subj.ISMS_Id || t.ismS_Id === subj.ismS_Id)
                                                            );
                                                            if (mr1) {
                                                                cellValue =
                                                                    mr1.estmppS_ClassHighest ||
                                                                    mr1.ESTMPPS_ClassHighest ||
                                                                    mr1.obtainedMarks ||
                                                                    cellValue;
                                                            }
                                                        } else {
                                                            const mr = student.studentmarks?.find(
                                                                (m: any) => m.emE_Id === exam.EME_Id && m.ismS_Id === subj.ismS_Id
                                                            );
                                                            if (mr) {
                                                                if (
                                                                    mr.passFailFlag !== 'AB' &&
                                                                    mr.passFailFlag !== 'M' &&
                                                                    mr.passFailFlag !== 'L'
                                                                ) {
                                                                    cellValue =
                                                                        mr.obtainedMarks ||
                                                                        mr.ObtainedMarks ||
                                                                        mr.GroupMarks ||
                                                                        mr.ObtainedGrade ||
                                                                        cellValue;
                                                                } else {
                                                                    cellValue = mr.passFailFlag;
                                                                }
                                                            }
                                                        }
                                                        return (
                                                            <td key={eIdx} className='border-[0.5px] border-black p-2 text-center'>
                                                                {cellValue}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                        <tr>
                                            <td className='border-[0.5px] border-black p-2 text-left uppercase'>TOTAL</td>
                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                let totalValue: any = '';
                                                if (exam.EME_Id === 9800000) {
                                                    const mr = student.studentmarks?.find(
                                                        (m: any) => m.emE_Id === exam.EME_Id && m.ismS_SubjectName === 'GRAND TOTAL'
                                                    );
                                                    if (mr)
                                                        totalValue = `${mr.obtainedMarks || mr.ESTMPS_ObtainedMarks} / ${mr.maxMarks || mr.maxmarks}`;
                                                }
                                                return (
                                                    <td key={eIdx} className='border-[0.5px] border-black p-2 text-center'>
                                                        {totalValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        <tr>
                                            <td className='border-[0.5px] border-black p-2 text-left uppercase'>PERCENTAGE</td>
                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                let percValue: any = '';
                                                if (exam.EME_Id === 9800000) {
                                                    const mr = student.studentmarks?.find(
                                                        (m: any) => m.emE_Id === exam.EME_Id && m.ismS_SubjectName === 'GRAND TOTAL'
                                                    );
                                                    if (mr?.totalPercentage) percValue = `${mr.totalPercentage.toFixed(2)}%`;
                                                }
                                                return (
                                                    <td key={eIdx} className='border-[0.5px] border-black p-2 text-center'>
                                                        {percValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        <tr>
                                            <td className='border-[0.5px] border-black p-2 text-left'>Attendance</td>
                                            {getgroupdetails?.map((grp: any, gIdx: number) => {
                                                const att = student.attendance?.find((a: any) => a.term === grp.empG_DistplayName);
                                                return (
                                                    <td
                                                        key={gIdx}
                                                        colSpan={grp.groupewiseexam?.length || 1}
                                                        className='border-[0.5px] border-black p-2 text-center'>
                                                        {att?.percentage ? `${att.percentage} %` : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>

                                    {/* Non-Applicable Subjects (Grades mostly) */}
                                    <tbody>
                                        {student.studentsubjects
                                            ?.filter((s: any) => !s.EYCES_MarksDisplayFlg && !s.eyceS_MarksDisplayFlg)
                                            .map((subj: any, idx: number) => (
                                                <tr key={`non-app-${idx}`}>
                                                    <td className='break-words border-[0.5px] border-black p-2 text-left font-bold'>
                                                        {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                    </td>
                                                    {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                        let cellValue: any = '';
                                                        const mr = student.studentmarks?.find(
                                                            (m: any) =>
                                                                m.EME_Id === exam.EME_Id &&
                                                                (m.ISMS_Id === subj.ISMS_Id || m.ismS_Id === subj.ismS_Id) &&
                                                                m.EMPSG_DisplayName === exam.EMPG_DistplayName
                                                        );
                                                        if (mr) {
                                                            if (
                                                                mr.ESTMPS_PassFailFlg !== 'AB' &&
                                                                mr.ESTMPS_PassFailFlg !== 'M' &&
                                                                mr.ESTMPS_PassFailFlg !== 'L' &&
                                                                mr.PassFailFlag !== 'AB' &&
                                                                mr.PassFailFlag !== 'M' &&
                                                                mr.PassFailFlag !== 'L'
                                                            ) {
                                                                if (exam.EME_ExamName === 'Grade') {
                                                                    cellValue = mr.ObtainedGrade || mr.ESTMPS_ObtainedGrade || '';
                                                                } else {
                                                                    cellValue =
                                                                        mr.ObtainedMarks ||
                                                                        mr.ESTMPS_ObtainedMarks ||
                                                                        mr.ObtainedGrade ||
                                                                        mr.ESTMPS_ObtainedGrade ||
                                                                        '';
                                                                }
                                                            } else {
                                                                cellValue = mr.ESTMPS_PassFailFlg || mr.PassFailFlag;
                                                            }
                                                        }
                                                        return (
                                                            <td key={eIdx} className='border-[0.5px] border-black p-2 text-center'>
                                                                {cellValue}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Remarks Box */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th className='bg-gray-400 p-2 text-center font-bold text-white uppercase'>SEMESTER-II</th>
                                        </tr>
                                        <tr>
                                            <td className='p-2 text-left font-bold'>
                                                {semesterRemarks?.ECTERE_Remarks || semesterRemarks?.ecterE_Remarks || ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className='row pt-2 pb-2'>
                                    <div className='col-sm-12'>
                                        <h5 className='font-bold text-[14px]'>
                                            Conduct :{' '}
                                            <span>{semesterRemarks?.ECTERE_Conduct || semesterRemarks?.ecterE_Conduct || ''}</span>
                                        </h5>
                                    </div>
                                </div>
                            </div>

                            {/* Graph Analysis Box */}
                            <div className='pt-2'>
                                <table className='mb-8 w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th colSpan={3} className='bg-gray-400 p-2 text-center uppercase'>
                                                GRAPHICAL ANALYSIS
                                            </th>
                                        </tr>
                                        <tr className='border-[0.5px] border-black'>
                                            <td colSpan={3} className='p-2'>
                                                <div className='mx-auto h-[250px] w-[98%]'>
                                                    <ResponsiveContainer width='100%' height='100%'>
                                                        <BarChart
                                                            data={student.chartData}
                                                            margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                            <XAxis
                                                                dataKey='subject'
                                                                tick={{ fontSize: 10 }}
                                                                tickLine={false}
                                                                axisLine={true}
                                                                interval={0}
                                                                angle={-25}
                                                                textAnchor='end'
                                                            />
                                                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />
                                                            <Bar dataKey='highest' fill='#3f51b5' barSize={20} />
                                                            <Bar dataKey='average' fill='#ff5722' barSize={20} />
                                                            <Bar dataKey='obtained' fill='#00ff00' barSize={20} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className='border-[0.5px] border-black'>
                                            <td className='p-2 text-center'>
                                                <span className='mr-2 inline-block h-3 w-3 bg-[#3f51b5]' /> Highest Marks
                                            </td>
                                            <td className='p-2 text-center'>
                                                <span className='mr-2 inline-block h-3 w-3 bg-[#ff5722]' /> Average Marks
                                            </td>
                                            <td className='p-2 text-center'>
                                                <span className='mr-2 inline-block h-3 w-3 bg-[#00ff00]' /> Obtained Marks
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures Box */}
                            <div className='mt-16'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-center text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th className='w-1/3 p-2 font-bold'>Principal's Signature</th>
                                            <th className='w-1/3 p-2 font-bold'>Class Teacher's Signature</th>
                                            <th className='w-1/3 p-2 font-bold'>Parent's Signature</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Issue Dates Box */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <tbody>
                                        <tr>
                                            <td className='p-2 text-left'>
                                                <b>Date of Issue: </b> &nbsp;
                                                {dateInfo?.issueDate ? new Date(dateInfo.issueDate).toLocaleDateString('en-GB') : ''}
                                                <br />
                                                <b>New Academic Session Commences on: </b> &nbsp;
                                                {dateInfo?.academicDate ? new Date(dateInfo.academicDate).toLocaleDateString('en-GB') : ''}
                                            </td>
                                            <td className='p-2 text-right'>
                                                <b>Report Card Printed On: </b> &nbsp;
                                                {dateInfo?.reportPrintedDate
                                                    ? new Date(dateInfo.reportPrintedDate).toLocaleDateString('en-GB')
                                                    : ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;
