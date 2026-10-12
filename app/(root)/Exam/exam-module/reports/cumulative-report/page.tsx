'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getCumulativeReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { ApiSearchparams } from '@/types';
import type { ICumulativeReport, IMasterInstitution, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CumulativeReportForm from './_components/add-form';
import CumulativeReportGridView from './_components/columns';
import CumulativeReportExcel from './_components/cumulative-report-excel';
import CumulativeReportPrintView from './_components/cumulative-report-printable';

export default function CumulativeReportPage() {
    const [reportData, setReportData] = useState<ICumulativeReport[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<Partial<IReportHeader>>({});
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [searchParams] = useState<ApiSearchparams>({});
    const [institution, setInstitution] = useState<IMasterInstitution | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [columnFlags, setColumnFlags] = useState({
        admno: true,
        regno: false,
        rollno: true,
        classrank: true,
        sectionrank: true,
        attendancedispaly: false,
        applicable: true,
        nonapplicable: false,
        readmit: false,
        grdaeDisply: false,
        marksdisplay: false,
        gradecolm: false,
        status: false
    });

    const handleReportSuccess = async (payload: any, setSearchParams: any) => {
        if (!payload) return;

        // Hide the active report and clear previous data state immediately before fetching new data
        setIsReportVisible(false);
        setReportData([]);
        setSubjects([]);

        try {
            const res = await getCumulativeReport(payload, setSearchParams);
            const institudtion_res = await getMasterInstitution();
            const { data: institudtion_data } = institudtion_res;
            setInstitution(institudtion_data);
            const _result = Array.isArray(res.data) ? res.data[0] : res.data;
            if (!res?.success) {
                toast.error(res?.message || 'Failed to generate report');
                return;
            }

            const responseData = res.data;
            const savelist =
                responseData?.savelist ||
                (Array.isArray(responseData)
                    ? responseData
                    : responseData?.cumulative_reportList || responseData?.studentlist || responseData?.data || []);
            const savenonsubjlist = responseData?.savenonsubjlist || [];
            const subjlist = responseData?.subjlist || [];
            const nonsubjlist = responseData?.nonsubjlist || [];
            const examSubjectWiseDetails = responseData?.examsubjectwise_details || [];
            const masterinst = responseData?.configuration || responseData?.exm_Configuration || [];

            if ((!Array.isArray(savelist) || savelist.length === 0) && (!Array.isArray(savenonsubjlist) || savenonsubjlist.length === 0)) {
                setReportData([]);
                setSubjects([]);
                setHeaderInfo({});
                toast.error('No records found');
                return;
            }

            // 1. Build Subjects List (Applicable & Non-Applicable)
            const subjMap = new Map<number, ISubject>();

            // If subjlist is provided by backend
            if (Array.isArray(subjlist) && subjlist.length > 0) {
                subjlist.forEach((s: any) => {
                    const ismsId = Number(s.ismS_Id ?? s.ISMS_Id ?? 0);
                    if (ismsId) {
                        const det = examSubjectWiseDetails.find((d: any) => d.ismS_Id === ismsId);
                        subjMap.set(ismsId, {
                            ismS_Id: ismsId,
                            ismS_SubjectName: s.ismS_SubjectName ?? s.ISMS_SubjectName ?? '',
                            eyceS_AplResultFlg: true,
                            type: (det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg) ? 'Grade' : 'Marks',
                            eyceS_MarksDisplayFlg: det?.eyceS_MarksDisplayFlg ?? s.eyceS_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg ?? true,
                            eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? 999
                        });
                    }
                });
            }

            // If nonsubjlist is provided by backend
            if (Array.isArray(nonsubjlist) && nonsubjlist.length > 0) {
                nonsubjlist.forEach((s: any) => {
                    const ismsId = Number(s.ismS_Id ?? s.ISMS_Id ?? 0);
                    if (ismsId) {
                        const det = examSubjectWiseDetails.find((d: any) => d.ismS_Id === ismsId);
                        subjMap.set(ismsId, {
                            ismS_Id: ismsId,
                            ismS_SubjectName: s.ismS_SubjectName ?? s.ISMS_SubjectName ?? '',
                            eyceS_AplResultFlg: false,
                            type: (det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg) ? 'Grade' : 'Marks',
                            eyceS_MarksDisplayFlg: det?.eyceS_MarksDisplayFlg ?? s.eyceS_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg ?? true,
                            eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? 999
                        });
                    }
                });
            }

            // Fallback subject discovery from student records if subjlist wasn't top-level
            if (subjMap.size === 0) {
                const combinedList = [...savelist, ...savenonsubjlist];
                combinedList.forEach((item: any) => {
                    const sList = item.subjectsList || item.sub_list || item.subjects || item.subject_list || [item];
                    sList.forEach((s: any) => {
                        const ismsId = Number(s.ismS_Id ?? s.ISMS_Id ?? s.subjectId ?? 0);
                        if (ismsId && !subjMap.has(ismsId)) {
                            const isApplicable =
                                s.eyceS_AplResultFlg ?? s.EYCES_AplResultFlg ?? savelist.some((x: any) => x.ismS_Id === ismsId);
                            subjMap.set(ismsId, {
                                ismS_Id: ismsId,
                                ismS_SubjectName: s.ismS_SubjectName ?? s.ISMS_SubjectName ?? s.subjectName ?? '',
                                eyceS_AplResultFlg: isApplicable,
                                type: (s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg) ? 'Grade' : 'Marks',
                                eyceS_MarksDisplayFlg: s.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? true,
                                eyceS_GradeDisplayFlg: s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? true,
                                eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? s.EYCES_SubjectOrder ?? 999
                            });
                        }
                    });
                });
            }

            const subjectsList: ISubject[] = Array.from(subjMap.values()).sort(
                (a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999)
            );

            // 2. Group Students and Map Subject Marks in exact column order (Matching AngularJS grouping)
            const studentMap = new Map<number, any>();

            // Process savelist
            savelist.forEach((row: any) => {
                const stuId = Number(row.amsT_Id ?? row.AMST_Id ?? row.student_id ?? 0);
                if (!stuId) return;

                if (!studentMap.has(stuId)) {
                    const fullName =
                        [
                            row.amsT_FirstName ?? row.AMST_FirstName,
                            row.amsT_MiddleName ?? row.AMST_MiddleName,
                            row.amsT_LastName ?? row.AMST_LastName
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .trim() ||
                        row.studentName ||
                        row.AMST_StudentName ||
                        row.studentname ||
                        row.amsT_StudentName ||
                        'Unknown';

                    studentMap.set(stuId, {
                        student_id: stuId,
                        amsT_FirstName: fullName,
                        amsT_AdmNo: row.amsT_AdmNo ?? row.AMST_AdmNo ?? row.amsT_Admno ?? row.admNo ?? null,
                        amsT_RegistrationNo: row.amsT_RegistrationNo ?? row.AMST_RegistrationNo ?? row.registrationNo ?? null,
                        amaY_RollNo: row.amaY_RollNo ?? row.AMAY_RollNo ?? row.rollNo ?? null,
                        classheld: row.classheld ?? row.asA_ClassHeld ?? row.ASA_ClassHeld ?? null,
                        classatt: row.classatt ?? row.asA_Class_Attended ?? row.ASA_Class_Attended ?? null,
                        estmP_TotalMaxMarks: row.estmP_TotalMaxMarks ?? row.ESTMP_TotalMaxMarks ?? null,
                        estmP_TotalObtMarks: row.estmP_TotalObtMarks ?? row.ESTMP_TotalObtMarks ?? null,
                        estmP_Percentage: row.estmP_Percentage ?? row.ESTMP_Percentage ?? null,
                        estmP_TotalGrade: row.estmP_TotalGrade ?? row.ESTMP_TotalGrade ?? null,
                        estmP_SectionRank: row.estmP_SectionRank ?? row.ESTMP_SectionRank ?? null,
                        estmP_ClassRank: row.estmP_ClassRank ?? row.ESTMP_ClassRank ?? null,
                        estmP_Result: row.estmP_Result ?? row.ESTMP_Result ?? 'Pass',
                        raw_subs: new Map<number, any>()
                    });
                }

                const sItem = studentMap.get(stuId);
                const sList = row.subjectsList || row.sub_list || row.subjects || row.subject_list || [row];
                sList.forEach((sub: any) => {
                    const subId = Number(sub.ismS_Id ?? sub.ISMS_Id ?? 0);
                    if (subId) {
                        const obt =
                            sub.hema_estmpS_ObtainedMarks ??
                            sub.estmpS_ObtainedMarks ??
                            sub.ESTMPS_ObtainedMarks ??
                            sub.obtainedMarks ??
                            null;
                        const grd =
                            sub.hema_estmpS_ObtainedGrade ??
                            sub.estmpS_ObtainedGrade ??
                            sub.ESTMPS_ObtainedGrade ??
                            sub.obtainedGrade ??
                            null;
                        sItem.raw_subs.set(subId, {
                            ismS_Id: subId,
                            estmpS_ObtainedMarks: obt === 1000 || obt === '1000' ? null : obt,
                            estmpS_ObtainedGrade: grd === '1000' || grd === 1000 ? null : grd,
                            estmpS_PassFailFlg: sub.estmpS_PassFailFlg ?? sub.ESTMPS_PassFailFlg ?? null,
                            eyceS_MarksDisplayFlg: sub.eyceS_MarksDisplayFlg ?? sub.EYCES_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: sub.eyceS_GradeDisplayFlg ?? sub.EYCES_GradeDisplayFlg ?? true,
                            empatY_PaperTypeName: sub.empatY_PaperTypeName ?? sub.EMPATY_PaperTypeName ?? '',
                            empatY_Color: sub.empatY_Color ?? sub.EMPATY_Color ?? ''
                        });
                    }
                });
            });

            // Process savenonsubjlist
            savenonsubjlist.forEach((row: any) => {
                const stuId = Number(row.amsT_Id ?? row.AMST_Id ?? row.student_id ?? 0);
                if (!stuId) return;

                if (!studentMap.has(stuId)) {
                    const fullName =
                        [
                            row.amsT_FirstName ?? row.AMST_FirstName,
                            row.amsT_MiddleName ?? row.AMST_MiddleName,
                            row.amsT_LastName ?? row.AMST_LastName
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .trim() ||
                        row.studentName ||
                        'Unknown';

                    studentMap.set(stuId, {
                        student_id: stuId,
                        amsT_FirstName: fullName,
                        amsT_AdmNo: row.amsT_AdmNo ?? row.AMST_AdmNo ?? null,
                        amsT_RegistrationNo: row.amsT_RegistrationNo ?? row.AMST_RegistrationNo ?? null,
                        amaY_RollNo: row.amaY_RollNo ?? row.AMAY_RollNo ?? null,
                        classheld: row.classheld ?? null,
                        classatt: row.classatt ?? null,
                        estmP_TotalMaxMarks: row.estmP_TotalMaxMarks ?? null,
                        estmP_TotalObtMarks: row.estmP_TotalObtMarks ?? null,
                        estmP_Percentage: row.estmP_Percentage ?? null,
                        estmP_TotalGrade: row.estmP_TotalGrade ?? null,
                        estmP_SectionRank: row.estmP_SectionRank ?? null,
                        estmP_ClassRank: row.estmP_ClassRank ?? null,
                        estmP_Result: row.estmP_Result ?? 'Pass',
                        raw_subs: new Map<number, any>()
                    });
                }

                const sItem = studentMap.get(stuId);
                const sList = row.subjectsList || row.sub_list_e || row.sub_list || row.subjects || [row];
                sList.forEach((sub: any) => {
                    const subId = Number(sub.ismS_Id ?? sub.ISMS_Id ?? 0);
                    if (subId) {
                        const obt = sub.hema_estmpS_ObtainedMarks ?? sub.estmpS_ObtainedMarks ?? sub.ESTMPS_ObtainedMarks ?? null;
                        const grd = sub.hema_estmpS_ObtainedGrade ?? sub.estmpS_ObtainedGrade ?? sub.ESTMPS_ObtainedGrade ?? null;
                        sItem.raw_subs.set(subId, {
                            ismS_Id: subId,
                            estmpS_ObtainedMarks: obt === 1000 || obt === '1000' ? null : obt,
                            estmpS_ObtainedGrade: grd === '1000' || grd === 1000 ? null : grd,
                            estmpS_PassFailFlg: sub.estmpS_PassFailFlg ?? sub.ESTMPS_PassFailFlg ?? null,
                            eyceS_MarksDisplayFlg: sub.eyceS_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: sub.eyceS_GradeDisplayFlg ?? true,
                            empatY_PaperTypeName: sub.empatY_PaperTypeName ?? '',
                            empatY_Color: sub.empatY_Color ?? ''
                        });
                    }
                });
            });

            // Convert to ICumulativeReport[]
            const formatted: ICumulativeReport[] = Array.from(studentMap.values()).map((s: any) => ({
                amsT_FirstName: s.amsT_FirstName,
                amaY_RollNo: s.amaY_RollNo,
                amsT_AdmNo: s.amsT_AdmNo,
                amsT_RegistrationNo: s.amsT_RegistrationNo,
                sub_list: Array.from(s.raw_subs.values()),
                estmP_TotalMaxMarks: s.estmP_TotalMaxMarks,
                estmP_TotalObtMarks: s.estmP_TotalObtMarks,
                estmP_Percentage: s.estmP_Percentage,
                estmP_TotalGrade: s.estmP_TotalGrade,
                estmP_Result: s.estmP_Result,
                estmP_ClassRank: s.estmP_ClassRank,
                estmP_SectionRank: s.estmP_SectionRank,
                classheld: s.classheld,
                classatt: s.classatt
            }));

            const first = { ...savelist[0], ...institudtion_data };
            const instNameFromPromise =
                Array.isArray(responseData.instname) && responseData.instname.length > 0
                    ? responseData.instname[0].mI_Name
                    : institudtion_data?.mI_Name;

            const header: Partial<IReportHeader> = {
                mI_Name: instNameFromPromise || institudtion_data?.mI_Name,
                yr: first?.asmaY_Year ?? '',
                cla: first?.asmcL_ClassName ?? '',
                sec: first?.asmC_SectionName ?? '',
                exmmid: first?.emE_ExamName ?? ''
            };

            const cfg = Array.isArray(masterinst) && masterinst.length > 0 ? masterinst[0] : {};

            setColumnFlags({
                admno: cfg.exmConfig_AdmnoColumnDisplay ?? true,
                regno: cfg.exmConfig_RegnoColumnDisplay ?? false,
                rollno: cfg.exmConfig_RollnoColumnDisplay ?? true,
                classrank: payload.classrank === true || payload.classrank === '1',
                sectionrank: payload.sectionrank === true || payload.sectionrank === '1',
                attendancedispaly: payload.attendancedispaly === true || payload.attendancedispaly === '1',
                applicable: payload.applicableFlag === '1' || payload.applicableFlag === true || payload.applicableFlag === undefined,
                nonapplicable: payload.nonApplicableFlag === '1' || payload.nonApplicableFlag === true,
                readmit: payload.Percentage_Flag === true || payload.Percentage_Flag === '1',
                grdaeDisply: payload.Grade_Flag === true || payload.Grade_Flag === '1',
                marksdisplay: payload.Marks_Flag === true || payload.Marks_Flag === '1',
                gradecolm: payload.OverallGrade_Flag === true || payload.OverallGrade_Flag === '1',
                status: payload.Status_Flag === true || payload.Status_Flag === '1'
            });

            setSubjects(subjectsList);
            setReportData(formatted);
            setIsReportVisible(true);
            setHeaderInfo(header);
            toast.success('Report generated successfully');
        } catch (e: any) {
            console.error('Report error:', e);
            toast.error(e?.message || 'Error generating report');
        }
    };

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isReportVisible]);

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Cumulative Report' defaultOpen>
                <CumulativeReportForm onSuccess={handleReportSuccess} apiSearchParams={searchParams} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Grid View' defaultOpen>
                    <div ref={printRef}>
                        {/* Print View */}
                        <CumulativeReportPrintView
                            reportData={reportData}
                            institution={institution || ({} as any)}
                            subjects={subjects}
                            headerInfo={headerInfo}
                            fontSize='medium'
                            columnFlags={columnFlags}
                        />

                        {/* Screen View */}
                        <CumulativeReportGridView
                            reportData={reportData}
                            institution={institution}
                            subjects={subjects}
                            headerInfo={headerInfo}
                            columnFlags={columnFlags}
                            onPrint={handlePrint}
                        />

                        <div className='mt-6 flex justify-end print:hidden'>
                            <CumulativeReportExcel
                                reportData={reportData}
                                subjects={subjects}
                                headerInfo={headerInfo}
                                columnFlags={columnFlags}
                            />
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
