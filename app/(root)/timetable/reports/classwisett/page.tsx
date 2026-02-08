'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getClassWiseReport, getClassWiseReportDetails } from '@/server/timetable/reports/classwisett';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ClassWiseForm from './_components/classwise-form';
import ClassWiseReportGrid from './_components/classwise-report-grid';
import ClassWiseReportPrintable from './_components/classwise-report-printable';

export default function ClassWiseReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getClassWiseReportDetails({});
                if (data) {
                    setInitialData(data);
                }
            } catch (error: any) {
                console.error('Error fetching initial details', error);
            }
        };
        fetchDetails();
    }, []);

    const handleFormSubmit = async (payload: any) => {
        setLoading(true);
        try {
            const response = await getClassWiseReport(payload);
            if ((response as AnalyserOptions) && response.tt) {
                //&& response.tt.length > 0
                processReportData(response, payload.classarray, payload.sectionarray);
                setIsReportVisible(true);
                toast.success('Report generated successfully');
            } else {
                toast.error('TimeTable is Not Generated For Selected Details !!!!');
                setReportData([]);
                setIsReportVisible(false);
            }
        } catch (error: any) {
            console.error('Error generating report', error);
            toast.error(error.message || 'Failed to generate report.');
            setReportData([]);
            setIsReportVisible(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setReportData([]);
        setIsReportVisible(false);
    };

    const processReportData = (data: any, selectedClasses: any[], selectedSections: any[]) => {
        const processedList: any[] = [];
        const periodList = data.periodslst || [];
        const breakList = data.tT_Break_list || [];
        const allBreakList = data.tT_Break_list_all || [];
        const gridWeeks = data.gridweeks || [];
        const timetable = data.tt || [];

        selectedClasses.forEach((cls: any) => {
            const classPeriodList: any[] = [];
            periodList.forEach((period: any) => {
                const breakItem = breakList.find(
                    (b: any) => b.asmcL_Id === cls.asmcL_Id && Number.parseFloat(period.ttmP_PeriodName) === b.ttmB_AfterPeriod
                );

                classPeriodList.push({ ped_id: period.ttmP_Id, ped_name: period.ttmP_PeriodName, is_break: false });

                if (breakItem) {
                    classPeriodList.push({ ped_id: 0, ped_name: 'Break', brk_name: breakItem.ttmB_BreakName, is_break: true });
                }
            });

            selectedSections.forEach((sec: any) => {
                const tableRows: any[] = [];

                gridWeeks.forEach((day: any) => {
                    const rowCells: any[] = [];
                    classPeriodList.forEach((periodCol: any, pIdx: number) => {
                        let cellContent = '';
                        let cellColor = 'black';

                        if (!periodCol.is_break) {
                            const entries = timetable.filter(
                                (t: any) =>
                                    t.ttmP_Id === periodCol.ped_id &&
                                    t.ttmD_Id === day.ttmD_Id &&
                                    t.asmcL_Id === cls.asmcL_Id &&
                                    t.asmS_Id === sec.asmS_Id
                            );

                            if (entries.length > 0) {
                                cellContent = entries.map((t: any) => `${t.ismS_SubjectName} : ${t.staffName}`).join(' && ');
                            }
                        } else {
                            // Break Handling logic from Angular
                            // Previous period ped_id
                            const prevPeriodId = pIdx > 0 ? classPeriodList[pIdx - 1].ped_id : -1;

                            const daySpecificBreak = allBreakList.find(
                                (b: any) =>
                                    b.ttmD_Id === day.ttmD_Id &&
                                    b.asmcL_Id === cls.asmcL_Id &&
                                    // Match by AfterPeriod float
                                    periodList.find(
                                        (p: any) =>
                                            p.ttmP_Id === prevPeriodId && Number.parseFloat(p.ttmP_PeriodName) === b.ttmB_AfterPeriod
                                    )
                            );

                            if (daySpecificBreak) {
                                cellContent = daySpecificBreak.ttmB_BreakName;
                                cellColor = 'red';
                            } else {
                                cellContent = periodCol.brk_name || 'Break';
                                cellColor = 'red';
                            }
                        }

                        rowCells.push({
                            ...periodCol,
                            dayId: day.ttmD_Id,
                            content: cellContent,
                            color: cellColor
                        });
                    });
                    tableRows.push({ dayName: day.ttmD_DayName, cells: rowCells });
                });

                processedList.push({
                    header: `Class : ${cls.asmcL_ClassName} & Section : ${sec.asmC_SectionName}`,
                    periodList: classPeriodList,
                    rows: tableRows
                });
            });
        });

        setReportData(processedList);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Class Wise TimeTable Report' defaultOpen={true}>
                <ClassWiseForm initialData={initialData} onSubmit={handleFormSubmit} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Grid View' defaultOpen={true}>
                    <ClassWiseReportGrid reportData={reportData} onPrint={handlePrint} />

                    <ClassWiseReportPrintable ref={printRef} reportData={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
