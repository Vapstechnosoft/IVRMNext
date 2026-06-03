'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import { getExamReportCard, getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import MESProgressCardForm from './_components/add-form';
import MESProgressCardReport from './_components/mes-progresscard-report';

export default function MESProgressCardReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [saveList, setSaveList] = useState<any[]>([]);
    const [workAttendance, _setWorkAttendance] = useState<any[]>([]);
    const [presentAttendance, _setPresentAttendance] = useState<any[]>([]);
    const [promotionRemarks, _setPromotionRemarks] = useState<any[]>([]);
    const [examName, setExamName] = useState<string>('');
    const [examCode, setExamCode] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institution_res = await getMasterInstitution();
                const { data: institution_data } = institution_res;
                setInstitution(institution_data);
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, []);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isReportVisible]);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getExamReportCard(payload);

            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);

            if (!res || !flatRows || flatRows.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            // Extract report list (unique students)
            const reportList: any[] = [];
            flatRows.forEach((dev: any) => {
                if (!reportList.find((emp: any) => emp.amsT_Id === dev.amsT_Id)) {
                    reportList.push(dev);
                }
            });

            // Calculate min marks for each student
            reportList.forEach((stu: any) => {
                let estmpS_MinMarks = 0;
                flatRows.forEach((dev: any) => {
                    if (stu.amsT_Id === dev.amsT_Id && dev.eyceS_AplResultFlg === true) {
                        estmpS_MinMarks += Number(dev.eyceS_MinMarks);
                    }
                });
                stu.estmP_MinMarks = estmpS_MinMarks;
            });

            setSaveList(flatRows);
            setReportData(reportList);
            // setWorkAttendance(res.work_attendence || []);
            // setPresentAttendance(res.present_attendence || []);
            // setPromotionRemarks(res.promotion_remarks || []);

            // Set exam name, code and year from the first record or payload
            if (flatRows.length > 0) {
                const first = flatRows[0];
                setExamName(first.emE_ExamName || '');
                setYear(first.asmaY_Year || '');
                setExamCode(payload.examCode || '');
            }

            setIsReportVisible(true);
            toast.success(`${reportList.length} progress card(s) generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <MESProgressCardForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <div ref={printRef}>
                    <CollapsibleSection title='Progress Cards Report' defaultOpen>
                        <MESProgressCardReport
                            reportData={reportData}
                            saveList={saveList}
                            workAttendance={workAttendance}
                            presentAttendance={presentAttendance}
                            promotionRemarks={promotionRemarks}
                            examName={examName}
                            examCode={examCode}
                            year={year}
                            institution={institution}
                        />
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
