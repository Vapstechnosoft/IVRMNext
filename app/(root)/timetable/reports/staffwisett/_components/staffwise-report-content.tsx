'use client';

import { useRef, useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import StaffWiseForm from './staffwise-form';
import StaffWiseReportGrid from './staffwise-report-grid';
import { toast } from 'sonner';

export default function StaffWiseReportContent() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (response: any, payload: any) => {
        const data = response.data || response;
        // Check for tt or timetable or TT
        const hasData =
            data &&
            ((data.tt && data.tt.length > 0) ||
                (data.timetable && data.timetable.length > 0) ||
                (data.TT && data.TT.length > 0));

        if (hasData) {
            processReportData(data, payload.staffarray, payload.rpttyp);
            toast.success('Report generated successfully');
        } else {
            toast.error('TimeTable is Not Generated For Selected Details !!!!');
            setReportData([]);
        }
    };

    const processReportData = (response: any, selectedStaff: any[], rptTyp: string) => {
        // Helper to find the object containing TimeTable data
        const findRoot = (obj: any): any => {
            if (!obj) return null;
            const hasData = (o: any) =>
                o &&
                ((o.tt && Array.isArray(o.tt)) ||
                    (o.TT && Array.isArray(o.TT)) ||
                    (o.timetable && Array.isArray(o.timetable)) ||
                    (o.periodslst && Array.isArray(o.periodslst)) ||
                    (o.gridweeks && Array.isArray(o.gridweeks)) ||
                    (o.allperiods && Array.isArray(o.allperiods)));

            if (hasData(obj)) return obj;
            if (obj.data) return findRoot(obj.data);
            return obj;
        };

        const root = findRoot(response);

        // Helper for case-insensitive and alternative key access
        const getList = (obj: any, ...keys: string[]): any[] => {
            if (!obj) return [];
            for (const k of keys) {
                if (obj[k] && Array.isArray(obj[k])) return obj[k];
                const lowerK = k.toLowerCase();
                const foundKey = Object.keys(obj).find((key) => key.toLowerCase() === lowerK);
                if (foundKey && Array.isArray(obj[foundKey])) return obj[foundKey];
            }
            return [];
        };

        const processedList: any[] = [];
        const timetable = getList(root, 'tt', 'TT', 'timetable', 'Table4');
        const periodList = getList(root, 'periodslst', 'periodList', 'periodsLst', 'allperiods', 'allPeriods', 'all_periods', 'Table1');
        const gridWeeks = getList(root, 'gridweeks', 'gridWeeks', 'grid_weeks', 'grid_Weeks', 'day_list', 'day_List', 'Table');
        const subjectNames = getList(root, 'nameswithclas', 'subjectNames', 'namesWithClas', 'nameswithclas_');
        const staffNames = getList(root, 'staffnameswithclas', 'staffNames', 'staffNamesWithClas', 'staffnameswithclas_');

        selectedStaff.forEach((staff: any) => {
            const hrmE_Id = staff.hrmE_Id || staff.HRME_Id;
            const staffName = staff.staffName || '';
            const tableRows: any[] = [];

            // Find complementary names for header
            const subNameEntry = subjectNames.find((s: any) => (s.hrmE_Id || s.HRME_Id) === hrmE_Id);
            const stfNameEntry = staffNames.find((s: any) => (s.hrmE_Id || s.HRME_Id) === hrmE_Id);

            const displaySubNames = subNameEntry?.names || '';
            const displayStfNames = stfNameEntry?.names || '';

            gridWeeks.forEach((day: any) => {
                const rowCells: any[] = [];
                const dayId = day.ttmD_Id || day.TTMD_Id || day.day_id;
                const dayName = day.ttmD_DayName || day.dayName || day.day_name || day.ttmD_DayCode || '';

                periodList.forEach((period: any) => {
                    const pedId = period.ttmP_Id || period.TTMP_Id || period.ped_id;
                    const pedName = period.ttmP_PeriodName || period.periodName || period.ped_name;

                    const entries = timetable.filter((t: any) => {
                        const tPedId = t.ttmP_Id || t.TTMP_Id || t.ped_id;
                        const tDayId = t.ttmD_Id || t.TTMD_Id || t.day_id;
                        const tStfId = t.hrmE_Id || t.HRME_Id || t.hrme_id;
                        return (
                            Number(tPedId) === Number(pedId) &&
                            Number(tDayId) === Number(dayId) &&
                            Number(tStfId) === Number(hrmE_Id)
                        );
                    });

                    let cellContent = '';
                    const cellColor = 'black';

                    if (entries.length > 0) {
                        if (rptTyp === 'SAWC') {
                            cellContent = entries
                                .map((t: any) => {
                                    const cls = t.asmcL_ClassName || t.className || '';
                                    const sec = t.asmC_SectionName || t.sectionName || '';
                                    const sub = t.ismS_SubjectName || t.subjectName || '';
                                    return `${sub} : ${cls} : ${sec}`;
                                })
                                .join(' && ');
                        } else {
                            cellContent = entries.map((t: any) => t.ismS_SubjectName || t.subjectName || '').join(' && ');
                        }
                    }

                    rowCells.push({
                        ped_id: pedId,
                        ped_name: String(pedName),
                        content: cellContent,
                        color: cellColor
                    });
                });
                tableRows.push({ dayName: String(dayName), cells: rowCells });
            });

            processedList.push({
                header: staffName,
                subHeader: displaySubNames,
                stfHeader: displayStfNames,
                periodList: periodList.map((p: any) => ({
                    ped_name: String(p.ttmP_PeriodName || p.periodName || p.ped_name),
                    is_break: false
                })),
                rows: tableRows
            });
        });

        setReportData(processedList);
    };

    const handleCancel = () => {
        setReportData([]);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Staff Wise TimeTable Report' defaultOpen={true}>
                <StaffWiseForm
                    onReportGenerated={handleReportGenerated}
                    onCancel={handleCancel}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true}>
                    <div ref={componentRef}>
                        <StaffWiseReportGrid reportData={reportData} onPrint={handlePrint} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
