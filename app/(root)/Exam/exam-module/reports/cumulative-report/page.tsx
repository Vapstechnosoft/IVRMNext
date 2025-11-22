'use client';

import { Button } from '@/components/ui/button';
import { useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { getCumulativeReport } from '@/server/exam/exam-module/reports/cumulative-report';
import type { ApiSearchparams } from '@/types';
import type { ICumulativeReport, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CumulativeReportForm from './_components/add-form';
import { getCumulativeReportColumns } from './_components/columns';

export default function CumulativeReportPage() {
    const [reportData, setReportData] = useState<ICumulativeReport[]>([]);
    const [reportTableProsData, setReportTableProsData] = useState<any>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<Partial<IReportHeader>>({});
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [searchParams, setSearchParams] = useState<ApiSearchparams>({});
    const [currentPayload, setCurrentPayload] = useState<any>({});

    const tableProps = useDataTableProps(reportTableProsData);
    const printRef = useRef<HTMLDivElement>(null);

    const [columnFlags, setColumnFlags] = useState({
        admno: false,
        regno: false,
        rollno: true,
        classrank: true,
        sectionrank: true,
        attendancedispaly: false
    });

    const handleReportSuccess = async (payload: any, setSearchParams: any) => {
        if (!payload) return;
        try {
            setCurrentPayload(payload);
            const res = await getCumulativeReport(payload, setSearchParams);
            if (!res?.success) {
                toast.error(res?.message || 'Failed to generate report');
                return;
            }

            // Critical Fix: Extract the actual student array
            const responseData = res.data;
            const rawList = Array.isArray(responseData) ? responseData : responseData?.cumulative_reportList || responseData?.data || [];

            if (!Array.isArray(rawList) || rawList.length === 0) {
                setReportData([]);
                setSubjects([]);
                setHeaderInfo({});
                return;
            }

            // Extract subjects using Map
            const subjMap = new Map<number, ISubject>();
            rawList.forEach((student: any) => {
                student.subjectsList?.forEach((s: any) => {
                    if (!subjMap.has(s.ismS_Id)) {
                        subjMap.set(s.ismS_Id, {
                            ismS_Id: s.ismS_Id,
                            ismS_SubjectName: s.ismS_SubjectName,
                            eyceS_AplResultFlg: s.eyceS_AplResultFlg ?? true,
                            type: s.eyceS_GradeDisplayFlg ? 'Grade' : 'Marks',
                            eyceS_MarksDisplayFlg: s.eyceS_MarksDisplayFlg ?? false,
                            eyceS_GradeDisplayFlg: s.eyceS_GradeDisplayFlg ?? false,
                            eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? 999
                        });
                    }
                });
            });

            const subjectsList: ISubject[] = Array.from(subjMap.values()).sort(
                (a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999)
            );

            // Format student rows
            const formatted: ICumulativeReport[] = rawList.map((s: any) => {
                const fullName = [s.amsT_FirstName, s.amsT_MiddleName, s.amsT_LastName].filter(Boolean).join(' ').trim();

                return {
                    amsT_FirstName: fullName || 'Unknown',
                    amaY_RollNo: s.amaY_RollNo ?? null,
                    amsT_AdmNo: s.amsT_AdmNo ?? null,
                    amsT_RegistrationNo: s.amsT_RegistrationNo ?? null,
                    sub_list: (s.subjectsList ?? []).map((sub: any) => ({
                        ismS_Id: sub.ismS_Id,
                        estmpS_ObtainedMarks: sub.estmpS_ObtainedMarks ?? null,
                        estmpS_ObtainedGrade: sub.estmpS_ObtainedGrade ?? null,
                        estmpS_PassFailFlg: sub.estmpS_PassFailFlg ?? null
                    })),
                    estmP_TotalMaxMarks: s.estmP_TotalMaxMarks ?? null,
                    estmP_TotalObtMarks: s.estmP_TotalObtMarks ?? null,
                    estmP_Percentage: s.estmP_Percentage ?? null,
                    estmP_TotalGrade: s.estmP_TotalGrade ?? null,
                    estmP_Result: s.estmP_Result ?? 'Pass',
                    estmP_ClassRank: s.estmP_ClassRank ?? null,
                    estmP_SectionRank: s.estmP_SectionRank ?? null,
                    classheld: s.asA_ClassHeld ?? null,
                    classatt: s.asA_Class_Attended ?? null
                };
            });

            // Fix header
            const first = rawList[0];
            const header: Partial<IReportHeader> = {
                mI_name: first?.mI_Name ?? 'Vidya Vikasa Vidya Samsthe (R)',
                yr: first?.asmaY_Year ?? '',
                cla: first?.asmcL_ClassName ?? '',
                sec: first?.asmC_SectionName ?? '',
                exmmid: first?.emE_ExamName ?? ''
            };

            // Fix column flags
            const cfg = first?.exm_Configuration?.[0] ?? responseData.exm_Configuration?.[0] ?? {};

            setColumnFlags({
                admno: cfg.exmConfig_AdmnoColumnDisplay ?? false,
                regno: cfg.exmConfig_RegnoColumnDisplay ?? false,
                rollno: cfg.exmConfig_RollnoColumnDisplay ?? true,
                classrank: true,
                sectionrank: true,
                attendancedispaly: false
            });

            setSubjects(subjectsList);
            const formattedData = { ...res, data: formatted };
            setReportData(formatted);
            setReportTableProsData(formattedData);
            setIsReportVisible(true);
            setHeaderInfo(header);
            toast.success('Report generated successfully');
        } catch (e: any) {
            console.error('Report error:', e);
            toast.error(e?.message || 'Error generating report');
        }
    };
    /* --------------------------------------------------------------- */
    useEffect(() => {
        if (searchParams) {
            if (!currentPayload) {
                return;
            }
            handleReportSuccess(currentPayload, searchParams);
        }
    }, [searchParams]);

    const fontSizePx = fontSize === 'small' ? '11px' : fontSize === 'medium' ? '13px' : '15px';
    const sizeClass = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base'
    }[fontSize];

    const handlePrint = () => window.print();
    const handleApiSearchParms = (searchParams: ApiSearchparams) => {
        setSearchParams(searchParams);
    };

    return (
        <>
            {/* ────────────────────── PRINT CSS ────────────────────── */}
            <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-section, #print-section * { visibility: visible !important; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; }

          .no-print, .screen-only, nav, aside, footer,
          button, input, select, .data-table-pagination, .data-table-footer {
            display: none !important;
          }

          .print-table-container {
            overflow: visible !important;
            width: 100% !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: ${fontSizePx} !important;
            page-break-after: auto;
          }

          th, td {
            border: 1px solid #000 !important;
            padding: 4px 3px !important;
            text-align: center !important;
            vertical-align: middle !important;
            font-size: ${fontSizePx} !important;
          }

          th {
            background: #1e40af !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: bold !important;
          }

          th > div, td > div {
            white-space: normal !important;
            word-break: break-word !important;
            line-height: 1.2 !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          @page {
            size: A4 landscape;
            margin: 0.8cm;
          }
        }

        @media screen {
          .print-table-container {
            display: none !important;
          }
        }
      `}</style>

            <div className='container mx-auto space-y-6 p-4'>
                <CollapsibleSection title='Cumulative Report' defaultOpen>
                    <CumulativeReportForm onSuccess={handleReportSuccess} apiSearchParams={searchParams} />
                </CollapsibleSection>

                {isReportVisible && (
                    <CollapsibleSection title='Grid View' defaultOpen>
                        {/* Header bar – hidden on print */}
                        <div className='no-print flex items-center justify-between border-orange-300 border-b bg-orange-100 px-4 py-2'>
                            <span className='font-semibold text-orange-800'>GRID VIEW</span>
                            <div className='flex items-center space-x-2'>
                                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                <label className='font-medium'>Font Size :</label>
                                <select
                                    className='form-select rounded border-gray-300 text-sm'
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value as any)}>
                                    <option value='small'>Small</option>
                                    <option value='medium'>Medium</option>
                                    <option value='large'>Large</option>
                                </select>

                                <Button onClick={handlePrint} size='sm' className='bg-blue-600 hover:bg-blue-700'>
                                    <Printer className='mr-1 h-4 w-4' /> Print
                                </Button>
                            </div>
                        </div>

                        {/* PRINTABLE SECTION */}
                        <div id='print-section' ref={printRef}>
                            {/* Report Header */}
                            <div className='my-6 space-y-1 text-center'>
                                <h3 className='font-bold text-2xl text-blue-900'>{headerInfo.mI_name}</h3>
                                <h5 className='font-semibold text-lg'>CLASS WISE CUMULATIVE REPORT</h5>
                                <p>
                                    <strong>ACADEMIC YEAR :</strong> {headerInfo.yr}
                                </p>
                                <p>
                                    <strong>CLASS & SEC :</strong> {headerInfo.cla} - {headerInfo.sec}
                                </p>
                                <p>
                                    <strong>EXAM :</strong> {headerInfo.exmmid}
                                </p>
                            </div>

                            {/* === PRINT-ONLY FULL TABLE === */}
                            <div className='print-table-container'>
                                <table className={`w-full border-collapse ${sizeClass}`}>
                                    <thead>
                                        <tr className='bg-blue-800 text-white'>
                                            <th className='border border-black px-2 py-1 text-center'>Sl No</th>
                                            <th className='border border-black px-2 py-1 text-center'>Student Name</th>
                                            {columnFlags.rollno && <th className='border border-black px-2 py-1 text-center'>Roll No</th>}
                                            {columnFlags.admno && <th className='border border-black px-2 py-1 text-center'>Adm No</th>}
                                            {columnFlags.regno && <th className='border border-black px-2 py-1 text-center'>Reg No</th>}
                                            {subjects
                                                .filter((s) => s.eyceS_AplResultFlg)
                                                .map((subj) => (
                                                    <th key={subj.ismS_Id} className='border border-black px-2 py-1 text-center'>
                                                        <div className='break-words font-bold text-xs uppercase leading-tight'>
                                                            {subj.ismS_SubjectName}
                                                        </div>
                                                    </th>
                                                ))}
                                            <th className='border border-black px-2 py-1 text-center'>Total</th>
                                            <th className='border border-black px-2 py-1 text-center'>Obtained</th>
                                            <th className='border border-black px-2 py-1 text-center'>%</th>
                                            <th className='border border-black px-2 py-1 text-center'>Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className='border border-black py-8 text-center text-gray-500'>
                                                    No student records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            reportData.map((row, idx) => {
                                                const isAbsent = row.estmP_Result === 'AB';
                                                return (
                                                    <tr key={idx} className={isAbsent ? 'text-red-600' : ''}>
                                                        {/* Sl No */}
                                                        <td className='border border-black px-2 py-1 text-center text-sm'>{idx + 1}</td>

                                                        {/* Name */}
                                                        <td className='border border-black px-2 py-1 text-center font-medium text-sm'>
                                                            {row.amsT_FirstName}
                                                        </td>

                                                        {/* Roll No */}
                                                        {columnFlags.rollno && (
                                                            <td className='border border-black px-2 py-1 text-center text-sm'>
                                                                {row.amaY_RollNo ?? '-'}
                                                            </td>
                                                        )}

                                                        {/* Adm No */}
                                                        {columnFlags.admno && (
                                                            <td className='border border-black px-2 py-1 text-center text-sm'>
                                                                {row.amsT_AdmNo ?? '-'}
                                                            </td>
                                                        )}

                                                        {/* Reg No */}
                                                        {columnFlags.regno && (
                                                            <td className='border border-black px-2 py-1 text-center text-sm'>
                                                                {row.amsT_RegistrationNo ?? '-'}
                                                            </td>
                                                        )}

                                                        {/* Subjects */}
                                                        {subjects
                                                            .filter((s) => s.eyceS_AplResultFlg)
                                                            .map((subj) => {
                                                                const mark = row.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                                                                if (!mark || mark.estmpS_PassFailFlg === 'AB') {
                                                                    return (
                                                                        <td
                                                                            key={subj.ismS_Id}
                                                                            className='border border-black px-2 py-1 text-center font-bold text-red-600'>
                                                                            AB
                                                                        </td>
                                                                    );
                                                                }

                                                                const showMarks = subj.eyceS_MarksDisplayFlg && subj.type === 'Marks';
                                                                const showGrade = subj.eyceS_GradeDisplayFlg && subj.type === 'Grade';

                                                                return (
                                                                    <td
                                                                        key={subj.ismS_Id}
                                                                        className='border border-black px-2 py-1 text-center text-sm'>
                                                                        <div className='space-y-0 leading-tight'>
                                                                            <div>
                                                                                {showMarks ? (mark.estmpS_ObtainedMarks ?? '-') : '-'}
                                                                            </div>
                                                                            {showGrade && (
                                                                                <div className='text-blue-700 text-xs'>
                                                                                    {mark.estmpS_ObtainedGrade ?? '-'}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}

                                                        {/* Totals */}
                                                        <td className='border border-black px-2 py-1 text-center text-sm'>
                                                            {isAbsent ? '' : (row.estmP_TotalMaxMarks ?? '-')}
                                                        </td>
                                                        <td className='border border-black px-2 py-1 text-center text-sm'>
                                                            {isAbsent ? '' : (row.estmP_TotalObtMarks ?? '-')}
                                                        </td>
                                                        <td className='border border-black px-2 py-1 text-center text-sm'>
                                                            {isAbsent ? '' : `${row.estmP_Percentage ?? '-'}%`}
                                                        </td>
                                                        <td className='border border-black px-2 py-1 text-center font-medium text-sm'>
                                                            {isAbsent ? '' : (row.estmP_TotalGrade ?? '-')}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Screen-only: Interactive Table */}
                            <div className='screen-only mt-6'>
                                <GenericDataTable
                                    isLoading={false}
                                    {...tableProps}
                                    columns={getCumulativeReportColumns(subjects, columnFlags)}
                                    data={reportData}
                                    noDataTitle='No results.'
                                    noDataDescription='No student data matches the selected criteria.'
                                    showPagination={true}
                                    onSearchQueryChange={handleApiSearchParms}
                                    currentApiParams={searchParams}
                                />
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </>
    );
}
