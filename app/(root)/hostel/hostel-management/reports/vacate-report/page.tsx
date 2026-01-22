'use client';

import { useEffect, useState } from 'react';
import { getVacateReportLoadData } from '@/server/hostel/reports/vacate-report';
import VacateReportForm from './_components/report-form';
import VacateReportList from './_components/report-list';
import { toast } from 'sonner';
import ReportActions from '@/components/hostel/report-actions';

export default function VacateReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<any>('student');
    const [loadData, setLoadData] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const res = await getVacateReportLoadData('student');
            if (res) setLoadData(res);
        })();
    }, []);

    const handleReportGenerated = (data: any[], type: string) => {
        setReportData(data);
        setReportType(type);
    };

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Hostel Vacate Report</h2>

            {loadData && (
                <VacateReportForm
                    initialData={loadData}
                    onReportGenerated={handleReportGenerated}
                />
            )}

            {reportData.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-700">Report Results</h3>
                        <ReportActions
                            data={reportData}
                            fileName="Vacate_Report"
                            columns={
                                reportType === 'student'
                                    ? [
                                        { label: 'Student Name', value: 'studentname' },
                                        { label: 'Class', value: 'ASMCL_ClassName' },
                                        { label: 'Hostel', value: 'HLMH_Name' },
                                        { label: 'Room', value: 'HRMRM_RoomNo' },
                                        { label: 'Vacate Date', value: 'HLHSV_VacateDate' }
                                    ]
                                    : [
                                        { label: 'Staff Name', value: 'empname' },
                                        { label: 'Dept', value: 'HRMD_DepartmentName' },
                                        { label: 'Hostel', value: 'HLMH_Name' },
                                        { label: 'Room', value: 'HRMRM_RoomNo' },
                                        { label: 'Vacate Date', value: 'HLHSTV_VacateDate' }
                                    ]
                            }
                        />
                    </div>
                    <VacateReportList data={reportData} type={reportType} />
                </div>
            )}
        </div>
    );
}
