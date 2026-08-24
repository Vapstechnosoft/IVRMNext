'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportViewProps {
    data: any;
    params: any;
}

export const ReportView = ({ data, params }: ReportViewProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef
    });

    if (!data || (!data.getstudentdetails && !data.getStudentDetails)) return null;

    const {
        getstudentdetails = data.getstudentdetails || data.getStudentDetails || [],
        getexammaxmarks = data.getexammaxmarks || data.getExamMaxMarks || [],
        getgroupdetails = data.getgroupdetails || data.getGroupDetails || [],
        getgroupexamdetails = data.getgroupexamdetails || data.getGroupExamDetails || [],
        gettermdetails = data.gettermdetails || data.getTermDetails || [],
        getstudentwiseskillslist = data.getstudentwiseskillslist || data.getStudentWiseSkillsList || [],
        getstudentwiseactiviteslist = data.getstudentwiseactiviteslist || data.getStudentWiseActivitesList || [],
        getstudentwiseattendancedetails = data.getstudentwiseattendancedetails || data.getStudentWiseAttendanceDetails || [],
        getstudentwisesportsdetails = data.getstudentwisesportsdetails || data.getStudentWiseSportsDetails || [],
        getsudentwisehousedetails = data.getsudentwisehousedetails || data.getSudentWiseHouseDetails || [],
        getsubjectwisetotaldetails = data.getsubjectwisetotaldetails || data.getSubjectWiseTotalDetails || [],
        getpromotionremarksdetails = data.getpromotionremarksdetails || data.getPromotionRemarksDetails || [],
        examwiseremarks = data.examwiseremarks || data.examWiseRemarks || [],
        getparticipatedetails = data.getparticipatedetails || data.getParticipateDetails || [],
        getstudentwisesubjectlist = data.getstudentwisesubjectlist || data.getStudentWiseSubjectList || [],
        clstchname = data.clstchname || data.clstChName || [],
        getinstitution = data.getinstitution || data.getInstitution || []
    } = data;

    // Deduplicate marks to handle repetitive backend data
    const rawMarks = data.getstudentmarksdetails || data.getStudentMarksDetails || data.studentwisemarks || [];
    const scholasticMarks = rawMarks.reduce((acc: any[], current: any) => {
        const student = current.AMST_Id || current.amsT_Id;
        const subject = current.ISMS_Id || current.ismS_Id;
        const exam = current.EME_Id || current.emE_Id;
        const existingIndex = acc.findIndex(
            (m) => (m.AMST_Id || m.amsT_Id) === student && (m.ISMS_Id || m.ismS_Id) === subject && (m.EME_Id || m.emE_Id) === exam
        );
        if (existingIndex > -1) {
            acc[existingIndex] = current;
        } else {
            acc.push(current);
        }
        return acc;
    }, []);

    // Helper for ordinal suffix
    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };

    const formatDob = (dobString: any) => {
        if (!dobString) return '';
        const date = new Date(dobString);
        if (isNaN(date.getTime())) return dobString || '';
        const day = date.getDate();
        const month = format(date, 'MMMM').toUpperCase();
        const year = date.getFullYear();
        return (
            <span>
                {day}
                <sup>{getOrdinalSuffix(day)}</sup> {month} {year}
            </span>
        );
    };

    // Process group exams
    const groupwiseexamlist: any[] = [];
    getgroupdetails.forEach((grp: any) => {
        let counttotal = 0;
        const subExams: any[] = [];
        getgroupexamdetails.forEach((ex: any) => {
            const groupName = grp.empG_GroupName || grp.empG_DistplayName || grp.EMPG_DistplayName;
            const exGroupName = ex.empG_GroupName || ex.empG_DistplayName || ex.EMPG_DistplayName;

            if (groupName === exGroupName) {
                const maxMarks = ex.empsgE_ForMaxMarkrs || ex.EMPSGE_ForMaxMarkrs || 0;
                counttotal += maxMarks;
                const examObj = {
                    ...ex,
                    EMPSGE_ForMaxMarkrs: maxMarks,
                    examnamedisplay: ex.emE_ExamCode || ex.EME_ExamCode || ex.emE_ExamName || ex.EME_ExamName
                };
                subExams.push(examObj);
                groupwiseexamlist.push(examObj);
            }
        });

        // Add Grade column for each group
        const gradeCol = {
            EME_Id: 9800001,
            EME_ExamName: 'Grade',
            EMPG_DistplayName: grp.empG_DistplayName || grp.empG_GroupName,
            EMPSGE_ForMaxMarkrs: 0,
            examnamedisplay: 'Grade'
        };
        subExams.push(gradeCol);
        groupwiseexamlist.push(gradeCol);

        grp.groupewiseexam = subExams;
        grp.empsG_MarksValue = counttotal;
    });

    // Skill & Activities grouping
    const skillList: any[] = [];
    getstudentwiseskillslist.forEach((s: any) => {
        if (!skillList.find((x) => x.ECS_SkillName === s.ECS_SkillName)) {
            const areas = getstudentwiseskillslist
                .filter((x: any) => x.ECS_SkillName === s.ECS_SkillName)
                .reduce((acc: any[], curr: any) => {
                    if (!acc.find((a) => a.ECSA_SkillArea === curr.ECSA_SkillArea)) {
                        acc.push({ ECSA_SkillArea: curr.ECSA_SkillArea, ECSA_SkillOrder: curr.ECSA_SkillOrder });
                    }
                    return acc;
                }, []);
            skillList.push({ ECS_SkillName: s.ECS_SkillName, skillarea: areas });
        }
    });

    const activityList: any[] = [];
    getstudentwiseactiviteslist.forEach((a: any) => {
        if (!activityList.find((x) => x.ECACT_SkillName === a.ECACT_SkillName)) {
            const areas = getstudentwiseactiviteslist
                .filter((x: any) => x.ECACT_SkillName === a.ECACT_SkillName)
                .reduce((acc: any[], curr: any) => {
                    if (!acc.find((a) => a.ECACTA_SkillArea === curr.ECACTA_SkillArea)) {
                        acc.push({ ECACTA_SkillArea: curr.ECACTA_SkillArea, ECACTA_SkillOrder: curr.ECACTA_SkillOrder });
                    }
                    return acc;
                }, []);
            activityList.push({ ECACT_SkillName: a.ECACT_SkillName, activites_list_area_list: areas });
        }
    });

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex justify-end pr-4'>
                <Button onClick={() => handlePrint()} className='flex gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={componentRef} className='print-container bg-white p-4 font-serif text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4; margin: 10mm; }
                        .pagelayout { border: 1px solid black !important; padding: 10px !important; min-height: 270mm; margin-bottom: 20px; page-break-after: always; }
                        .table-bordered { border-collapse: collapse; width: 100%; border: 1px solid black !important; }
                        .table-bordered th, .table-bordered td { border: 1px solid black !important; padding: 4px; font-size: 10px; }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .font-bold { font-weight: bold; }
                        .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; text-align: center; }
                        .h3class { font-size: 18px; font-weight: bold; margin: 10px 0; }
                        .margin-top-10 { margin-top: 10px; }
                        .margin-top-20 { margin-top: 20px; }
                        .margin-top-30 { margin-top: 30px; }
                        .margin-top-50 { margin-top: 50px; }
                        .margin-top-80 { margin-top: 80px; }
                    }
                    .pagelayout { border: 1px solid black; padding: 20px; background: white; margin-bottom: 20px; max-width: 210mm; margin-left: auto; margin-right: auto; }
                    .table-bordered { border-collapse: collapse; width: 100%; border: 1px solid black; }
                    .table-bordered th, .table-bordered td { border: 1px solid black; padding: 8px; font-size: 12px; }
                    .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; text-align: center; }
                    .h3class { font-size: 20px; font-weight: bold; }
                `
                    }}
                />

                {getstudentdetails.map((student: any, index: number) => {
                    const studentId = student.AMST_Id || student.amsT_Id;
                    const studentHouse =
                        getsudentwisehousedetails.find((h: any) => (h.AMST_Id || h.amsT_Id) === studentId)?.spccmH_HouseName || '';
                    const studentSubjects = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
                    const studentMarks = scholasticMarks.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
                    const groupwiseexamlist = getgroupdetails.flatMap((g: any) => g.groupewiseexam || g.groupwiseexam || []);

                    return (
                        <div key={studentId} className='student-report'>
                            {/* Section 1: Profile */}
                            <section className='pagelayout'>
                                <div className='mb-6 text-center'>
                                    <div className='flex flex-col items-center gap-2'>
                                        <img
                                            src={
                                                getinstitution?.[0]?.mI_Logo ||
                                                getinstitution?.[0]?.MI_Logo ||
                                                getinstitution?.[0]?.mI_Logo_Path ||
                                                getinstitution?.[0]?.mI_LogoPath ||
                                                '/assets/logo1.png'
                                            }
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/assets/logo1.png';
                                            }}
                                            className='h-20 max-h-24 object-contain'
                                            alt={getinstitution?.[0]?.mI_Name || 'Institution Logo'}
                                        />
                                        {getinstitution?.[0]?.mI_Name && (
                                            <h2 className='font-bold text-2xl uppercase'>{getinstitution[0].mI_Name}</h2>
                                        )}
                                        {getinstitution?.[0]?.mI_Address1 && (
                                            <p className='text-sm'>
                                                {getinstitution[0].mI_Address1}, {getinstitution[0].ivrmmcT_Name} -{' '}
                                                {getinstitution[0].mI_Pincode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='my-10 flex justify-center'>
                                    <div className='flex h-32 w-32 items-center justify-center overflow-hidden border border-black'>
                                        {student.AMST_Photoname ? (
                                            <img src={student.AMST_Photoname} className='h-full w-full object-cover' alt='Student' />
                                        ) : (
                                            <span className='text-xs'>PHOTO</span>
                                        )}
                                    </div>
                                </div>
                                <div className='space-y-6 px-10'>
                                    <h3 className='h3class underline'>Student Profile :</h3>
                                    <div className='grid grid-cols-[200px_10px_1fr] items-center gap-2'>
                                        <div className='font-bold'>Student Name</div>
                                        <div>:</div>
                                        <div className='border-bottom'>{student.studentname || student.studentName}</div>

                                        <div className='font-bold'>Class</div>
                                        <div>:</div>
                                        <div className='flex items-center gap-4'>
                                            <span className='flex-1 border-bottom'>
                                                {student.classname || student.className} {student.sectionname || student.sectionName}
                                            </span>
                                            <span className='font-bold'>Roll No :</span>
                                            <span className='w-20 border-bottom'>
                                                {student.rollno || student.rollNo || student.AMAY_RollNo}
                                            </span>
                                        </div>

                                        <div className='font-bold'>Academic Session</div>
                                        <div>:</div>
                                        <div className='flex items-center gap-4'>
                                            <span className='flex-1 border-bottom'>{student.ASMAY_Year || params?.academicYear}</span>
                                            <span className='font-bold'>Adm No :</span>
                                            <span className='w-32 border-bottom'>{student.admissionNo || student.AMST_AdmNo || ''}</span>
                                        </div>

                                        <div className='font-bold'>House</div>
                                        <div>:</div>
                                        <div className='border-bottom'>{studentHouse}</div>

                                        <div className='font-bold'>Date of Birth</div>
                                        <div>:</div>
                                        <div className='border-bottom'>
                                            {formatDob(student.amst_dob || student.AMST_DOB || student.dob)}
                                        </div>

                                        <div className='font-bold'>Residential Address</div>
                                        <div>:</div>
                                        <div className='border-bottom'>
                                            {student.AMST_PerStreet || student.street
                                                ? (student.AMST_PerStreet || student.street) + ', '
                                                : ''}
                                        </div>

                                        <div></div>
                                        <div></div>
                                        <div className='border-bottom'>
                                            {student.AMST_PerArea || student.area ? (student.AMST_PerArea || student.area) + ', ' : ''}
                                            {student.AMST_PerCity || student.city ? (student.AMST_PerCity || student.city) + ', ' : ''}
                                        </div>

                                        <div className='font-bold'>and Telephone No</div>
                                        <div>:</div>
                                        <div className='border-bottom font-bold'>{student.mobileno || student.mobileNo}</div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Scholastic Areas */}
                            <section className='pagelayout'>
                                <h4 className='mb-4 font-bold'>Part-1 : Academic Performance : Scholastic Areas (9 points scale)</h4>
                                <table className='table-bordered text-center'>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} className='w-12'>
                                                Sl.No
                                            </th>
                                            <th rowSpan={2}>Subject Name</th>
                                            {getgroupdetails.map((grp: any, idx: number) => (
                                                <th key={idx} colSpan={grp.groupewiseexam.length}>
                                                    {grp.empG_DistplayName}
                                                </th>
                                            ))}
                                            <th rowSpan={2} className='w-20'>
                                                Total
                                            </th>
                                            <th rowSpan={2} className='w-20'>
                                                Grade Point
                                            </th>
                                        </tr>
                                        <tr>
                                            {groupwiseexamlist.map((ex: any, idx: number) => (
                                                <th key={idx}>
                                                    {ex.examnamedisplay}
                                                    <br />
                                                    {ex.examnamedisplay !== 'Grade' && <span>({ex.EMPSGE_ForMaxMarkrs})</span>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSubjects.map((subj: any, sIdx: number) => {
                                            const subjName = (subj.ISMS_SubjectName || subj.subjectName || '')
                                                .toString()
                                                .trim()
                                                .toUpperCase();
                                            const subjId = subj.ISMS_Id || subj.isms_id;

                                            const subjTotal = getsubjectwisetotaldetails.find((d: any) => {
                                                const dSubjId = d.ismS_Id || d.ISMS_Id;
                                                const dSubjName = (d.ISMS_SubjectName || d.subjectName || '')
                                                    .toString()
                                                    .trim()
                                                    .toUpperCase();
                                                const dAmstId = d.AMST_Id || d.amsT_Id;
                                                return dAmstId === studentId && (subjId ? dSubjId === subjId : dSubjName === subjName);
                                            });

                                            // Final marks/grade from the totals array or the subject list fallback
                                            const finalGrade =
                                                subjTotal?.estmppS_ObtainedGrade || subjTotal?.obtainedGrade || subj.subjectGrade || '';
                                            const finalPoints =
                                                subjTotal?.estmppS_GradePoints ||
                                                subjTotal?.obtainedGradePoints ||
                                                subj.subjectGradePoints ||
                                                '';

                                            return (
                                                <tr key={sIdx} className='h-16'>
                                                    <td>{sIdx + 1}</td>
                                                    <td className='text-left font-bold'>{subj.ISMS_SubjectName || subj.subjectName}</td>
                                                    {groupwiseexamlist.map((ex: any, eIdx: number) => {
                                                        const exGroupName = (
                                                            ex.EMPG_DistplayName ||
                                                            ex.empG_DistplayName ||
                                                            ex.empG_GroupName ||
                                                            ''
                                                        )
                                                            .toString()
                                                            .trim()
                                                            .toUpperCase();

                                                        const mark = studentMarks.find((m: any) => {
                                                            const mSubjId = m.ISMS_Id || m.isms_id;
                                                            const mSubjName = (m.ISMS_SubjectName || m.ismS_SubjectName || '')
                                                                .toString()
                                                                .trim()
                                                                .toUpperCase();
                                                            const mExamId = m.EME_Id || m.emE_Id;
                                                            const mGroupName = (
                                                                m.EMPSG_DisplayName ||
                                                                m.empsG_DisplayName ||
                                                                m.EMPG_DistplayName ||
                                                                m.empG_DistplayName ||
                                                                m.empsG_GroupName ||
                                                                ''
                                                            )
                                                                .toString()
                                                                .trim()
                                                                .toUpperCase();

                                                            const isSubjMatch = subjId ? mSubjId === subjId : mSubjName === subjName;
                                                            const isExamMatch = mExamId === (ex.EME_Id || ex.emE_Id);
                                                            const isGroupMatch = mGroupName === exGroupName;

                                                            return (
                                                                isSubjMatch &&
                                                                ((ex.EME_Id || ex.emE_Id) === 9800001 ? isGroupMatch : isExamMatch)
                                                            );
                                                        });

                                                        return (
                                                            <td key={eIdx}>
                                                                {mark ? (
                                                                    (mark.passFailFlag || mark.PassFailFlag) === 'AB' ||
                                                                    (mark.passFailFlag || mark.PassFailFlag) === 'M' ||
                                                                    (mark.passFailFlag || mark.PassFailFlag) === 'L' ? (
                                                                        <b>
                                                                            {mark.passFailFlag || mark.PassFailFlag}{' '}
                                                                            {(mark.obtainedMarks || mark.ObtainedMarks) > 0
                                                                                ? `(${mark.obtainedGrade || mark.ObtainedGrade})`
                                                                                : ''}
                                                                        </b>
                                                                    ) : ex.examnamedisplay === 'Grade' ? (
                                                                        <b>{mark.obtainedGrade || mark.ObtainedGrade}</b>
                                                                    ) : (
                                                                        <b>{mark.obtainedMarks || mark.ObtainedMarks}</b>
                                                                    )
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className='font-bold'>{finalGrade}</td>
                                                    <td className='font-bold'>{finalPoints}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    {getexammaxmarks.length > 0 && (
                                        <tfoot>
                                            <tr className='h-10 text-center font-bold'>
                                                <td colSpan={2} className='px-4 text-right'>
                                                    OVERALL SUMMARY
                                                </td>
                                                {groupwiseexamlist.map((_: any, i: number) => (
                                                    <td key={i}></td>
                                                ))}
                                                <td className='text-center font-bold'>
                                                    {getexammaxmarks[getexammaxmarks.length - 1]?.totalGrade || ''}
                                                </td>
                                                <td className='text-center font-bold'>
                                                    {getexammaxmarks[getexammaxmarks.length - 1]?.overallPercentage
                                                        ? `${getexammaxmarks[getexammaxmarks.length - 1].overallPercentage}%`
                                                        : ''}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </section>

                            {/* Section 3: Co-Scholastic & Personal Development */}
                            <section className='pagelayout'>
                                <h4 className='mb-4 font-bold text-lg'>A.Co-Scholastic Activites</h4>
                                {skillList.map((skill: any, skIdx: number) => (
                                    <div key={skIdx} className='mb-6'>
                                        <table className='table-bordered'>
                                            <thead>
                                                <tr>
                                                    <th className='w-1/2'>{skill.ECS_SkillName}</th>
                                                    {gettermdetails.map((term: any, tIdx: number) => (
                                                        <th key={tIdx}>{term.ecT_TermName}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {skill.skillarea.map((area: any, aIdx: number) => (
                                                    <tr key={aIdx}>
                                                        <td className='text-left font-bold'>{area.ECSA_SkillArea}</td>
                                                        {gettermdetails.map((term: any, tIdx: number) => {
                                                            const skillGrade = getstudentwiseskillslist.find(
                                                                (s: any) =>
                                                                    (s.ECS_SkillName || s.ecS_SkillName) === skill.ECS_SkillName &&
                                                                    (s.ECSA_SkillArea || s.ecsA_SkillArea) === area.ECSA_SkillArea &&
                                                                    (s.ECT_Id || s.ecT_Id) === term.ecT_Id &&
                                                                    (s.AMST_Id || s.amsT_Id) === studentId
                                                            );
                                                            return (
                                                                <td key={tIdx} className='text-center'>
                                                                    <b>{skillGrade?.EMGD_Name || ''}</b>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                <h4 className='mt-10 mb-4 font-bold text-lg'>B.Personal Development</h4>
                                {activityList.map((act: any, acIdx: number) => (
                                    <div key={acIdx} className='mb-6'>
                                        <table className='table-bordered'>
                                            <thead>
                                                <tr>
                                                    <th className='w-1/2'>{act.ECACT_SkillName}</th>
                                                    {gettermdetails.map((term: any, tIdx: number) => (
                                                        <th key={tIdx}>{term.ecT_TermName}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {act.activites_list_area_list.map((area: any, aIdx: number) => (
                                                    <tr key={aIdx}>
                                                        <td className='text-left font-bold'>{area.ECACTA_SkillArea}</td>
                                                        {gettermdetails.map((term: any, tIdx: number) => {
                                                            const actGrade = getstudentwiseactiviteslist.find(
                                                                (s: any) =>
                                                                    (s.ECACT_SkillName || s.ecacT_SkillName) === act.ECACT_SkillName &&
                                                                    (s.ECACTA_SkillArea || s.ecactA_SkillArea) === area.ECACTA_SkillArea &&
                                                                    (s.ECT_Id || s.ecT_Id) === term.ecT_Id &&
                                                                    (s.AMST_Id || s.amsT_Id) === studentId
                                                            );
                                                            return (
                                                                <td key={tIdx} className='text-center'>
                                                                    <b>{actGrade?.EMGD_Name || ''}</b>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                <h4 className='mt-10 mb-4 font-bold text-lg'>C.Health</h4>
                                <table className='table-bordered'>
                                    <thead>
                                        <tr>
                                            <th className='text-left'>ASPECTS</th>
                                            {gettermdetails.map((term: any, tIdx: number) => (
                                                <th key={tIdx}>{term.ecT_TermName}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='font-bold'>HEIGHT(CM)</td>
                                            {gettermdetails.map((term: any, tIdx: number) => {
                                                const health = getstudentwisesportsdetails.find(
                                                    (h: any) => h.ECT_Id === term.ecT_Id && (h.AMST_Id || h.amsT_Id) === studentId
                                                );
                                                return (
                                                    <td key={tIdx} className='text-center'>
                                                        <b>{health?.SPCCSHW_Height || ''}</b>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        <tr>
                                            <td className='font-bold'>WEIGHT(KG)</td>
                                            {gettermdetails.map((term: any, tIdx: number) => {
                                                const health = getstudentwisesportsdetails.find(
                                                    (h: any) => h.ECT_Id === term.ecT_Id && (h.AMST_Id || h.amsT_Id) === studentId
                                                );
                                                return (
                                                    <td key={tIdx} className='text-center'>
                                                        <b>{health?.SPCCSHW_Weight || ''}</b>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            {/* Section 4: Term Remarks & Promotion */}
                            <section className='pagelayout'>
                                {gettermdetails.map((term: any, tIdx: number) => {
                                    const remarks = examwiseremarks.find(
                                        (r: any) => r.ecT_Id === term.ecT_Id && (r.AMST_Id || r.amsT_Id) === studentId
                                    );
                                    const participate = getparticipatedetails.find(
                                        (p: any) => p.ecT_Id === term.ecT_Id && (p.AMST_Id || p.amsT_Id) === studentId
                                    );
                                    const attendance = getstudentwiseattendancedetails.find(
                                        (a: any) => a.ECT_Id === term.ecT_Id && (a.AMST_Id || a.amsT_Id) === studentId
                                    );

                                    return (
                                        <div key={tIdx} className='mb-10 border-black border-b pb-6 last:border-b-0'>
                                            <h4 className='mb-4 font-bold text-lg underline'>{term.ecT_TermName}</h4>
                                            <div className='space-y-4'>
                                                <div className='flex gap-2'>
                                                    <span className='font-bold'>Specific Participation :</span>
                                                    <span className='flex-1 border-bottom'>{participate?.esttA_Remarks || ''}</span>
                                                </div>
                                                <div className='grid grid-cols-[200px_1fr_100px] items-center gap-2'>
                                                    <span className='font-bold'>Attendance :</span>
                                                    <span>Total attendance of the students</span>
                                                    <span className='border-bottom'>{attendance?.PRESENTDAYS || ''}</span>

                                                    <span></span>
                                                    <span>Total working days</span>
                                                    <span className='border-bottom'>{attendance?.TOTALWORKINGDAYS || ''}</span>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <span className='font-bold'>General Remarks :</span>
                                                    <span className='flex-1 border-bottom'>{remarks?.ecterE_Remarks || ''}</span>
                                                </div>
                                                <div className='grid grid-cols-3 gap-10 pt-10 text-center font-bold text-xs'>
                                                    <div className='border-black border-t pt-1'>
                                                        <div className='mb-2'>
                                                            {clstchname
                                                                .map((t: any) => t.hrmE_EmployeeFirstName || t.hrmE_EmployeeName)
                                                                .filter(Boolean)
                                                                .join(' & ')}
                                                        </div>
                                                        Class Teacher
                                                    </div>
                                                    <div className='border-black border-t pt-1'>Principal</div>
                                                    <div className='border-black border-t pt-1'>Parent</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className='mt-10 space-y-6'>
                                    <div className='flex gap-2'>
                                        <span className='font-bold'>Congratulations : Promoted to Class :</span>
                                        <span className='flex-1 border-bottom'>
                                            {getpromotionremarksdetails[0]?.eprD_ClassPromoted || ''}
                                        </span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span className='font-bold'>New Session begins on :</span>
                                        <span className='flex-1 border-bottom'>
                                            {params.re_opendate ? format(new Date(params.re_opendate), 'dd/MM/yyyy') : ''}
                                        </span>
                                    </div>
                                    <div className='grid grid-cols-3 gap-10 pt-20 text-center font-bold text-xs'>
                                        <div className='border-black border-t pt-1'>Class Teacher</div>
                                        <div className='border-black border-t pt-1'>Principal</div>
                                        <div className='border-black border-t pt-1'>Parent</div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: Grading System */}
                            <section className='pagelayout'>
                                <h4 className='mb-4 text-center font-bold underline'>GRADING SYSTEM</h4>
                                <div className='grid grid-cols-2 gap-10'>
                                    <div>
                                        <h5 className='mb-2 text-center font-bold'>Scholastic Areas (9 point scale)</h5>
                                        <table className='table-bordered text-center text-[10px]'>
                                            <thead>
                                                <tr>
                                                    <th rowSpan={2}>Grade</th>
                                                    <th colSpan={2}>Marks Range</th>
                                                    <th rowSpan={2}>GP</th>
                                                </tr>
                                                <tr>
                                                    <th>100</th>
                                                    <th>50</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    ['A1', '91-100', '45-50', '10.0'],
                                                    ['A2', '81-90', '40-44', '9.0'],
                                                    ['B1', '71-80', '35-39', '8.0'],
                                                    ['B2', '61-70', '30-34', '7.0'],
                                                    ['C1', '51-60', '25-29', '6.0'],
                                                    ['C2', '41-50', '20-24', '5.0'],
                                                    ['D', '33-40', '17-19', '4.0'],
                                                    ['E1', '21-32', '10-16', '3.0'],
                                                    ['E2', '00-20', '0-9', '2.0']
                                                ].map((row, rIdx) => (
                                                    <tr key={rIdx}>
                                                        {row.map((cell, cIdx) => (
                                                            <td key={cIdx}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <h5 className='mb-2 text-center font-bold'>Co - Scholastic Areas (5 point scale)</h5>
                                        <table className='table-bordered text-center text-[10px]'>
                                            <thead>
                                                <tr>
                                                    <th>Grade</th>
                                                    <th>Grade Point</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    ['A', '5'],
                                                    ['B', '4'],
                                                    ['C', '3'],
                                                    ['D', '2'],
                                                    ['E', '1']
                                                ].map((row, rIdx) => (
                                                    <tr key={rIdx}>
                                                        <td>
                                                            <b>{row[0]}</b>
                                                        </td>
                                                        <td>
                                                            <b>{row[1]}</b>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className='mt-4 font-bold text-[10px]'>
                                            Student must obtain the qualifying grade (minimum grade D) in all subjects.
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-10 border-black border-t pt-4'>
                                    <h5 className='mb-4 text-center font-bold underline'>CONTINUOUS AND COMPREHENSIVE EVALUATION</h5>
                                    <div className='space-y-2 font-bold text-[10px]'>
                                        <p>
                                            1. CCE is intended to provide a holistic profile of the learner through assessment of both
                                            scholastic and non scholastic aspects.
                                        </p>
                                        <p>2. Promotion is based on day-to-day work and terminal examination performance.</p>
                                        <div className='grid grid-cols-[150px_1fr_50px] gap-2 pt-4'>
                                            <span>*First Term</span>
                                            <span>- FA1(10%) + FA2(10%) + SA1(30%)</span>
                                            <span className='text-right'>= 50%</span>
                                            <span>*Second Term</span>
                                            <span>- FA3(10%) + FA4(10%) + SA2(30%)</span>
                                            <span className='text-right'>= 50%</span>
                                            <span>Formative assessment</span>
                                            <span>- FA1(10%) + FA2(10%) + FA3(10%) + FA4(10%)</span>
                                            <span className='text-right'>= 40%</span>
                                            <span>Summative assessment</span>
                                            <span>- SA1(30%) + SA2(30%)</span>
                                            <span className='text-right'>= 60%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-10 border-black border-t pt-4'>
                                    <h5 className='mb-4 text-center font-bold uppercase underline'>For the Parents</h5>
                                    <div className='space-y-3 px-4 font-bold text-[10px]'>
                                        <p>
                                            1. The object of the Report Book is to facilitate holistic learning in a stress free
                                            environment.
                                        </p>
                                        <p>2. Keep informed of your child's progress. Sign the record every term.</p>
                                        <p>3. Report Book will not be issued if fees are in arrears.</p>
                                        <p>4. Preserve carefully. Loss fine Rs.50/-.</p>
                                        <p>5. We hope this system leads to greater co-operation between parents and teachers.</p>
                                    </div>
                                    <div className='mt-10 flex justify-center'>
                                        <img src='/images/NDSExamLogo.jpg' className='h-16' alt='Exam Logo' />
                                    </div>
                                </div>
                            </section>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
