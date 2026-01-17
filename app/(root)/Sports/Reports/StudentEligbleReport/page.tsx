'use client';

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { columns, printTable, exportToExcel } from './_components/columns';
import ReportForm from './_components/report-form';
import { useStudentEligibleReport } from '@/hooks/sports/useStudentEligibleReport';
import { IStudentEligibleReportDetail } from '@/types/sports/reports/student-eligible-report';

export default function StudentEligibleReportPage() {
    const { data: loadGridData, isLoading, error } = useStudentEligibleReport();
    const [reportResponse, setReportResponse] = useState<any>(null);

    useEffect(() => {
        if (loadGridData) {
            setReportResponse(loadGridData);
        }
    }, [loadGridData]);

    const handleReport = (data: any) => {
        setReportResponse(data);
    };

    const handleReset = () => {
        if (loadGridData) {
            setReportResponse(loadGridData);
        }
    };

    const handlePrint = () => {
        const data = reportResponse?.data || [];
        const headers = ['Adm. No.', 'Student Name', 'Class', 'Section', 'Age', 'Father Name', 'Mother Name'];
        const rows = data.map((item: any) => ({
            'Adm. No.': item.adm_no,
            'Student Name': item.studentname,
            'Class': item.classname,
            'Section': item.sectionname,
            'Age': item.pasR_Age,
            'Father Name': item.amsT_FatherName,
            'Mother Name': item.amsT_MotherName
        }));
        printTable(headers, rows);
    };

    const handleExcel = () => {
        const data = reportResponse?.data || [];
        const rows = data.map((item: any) => ({
            'Adm. No.': item.adm_no,
            'Student Name': item.studentname,
            'Class': item.classname,
            'Section': item.sectionname,
            'Age': item.pasR_Age,
            'Father Name': item.amsT_FatherName,
            'Mother Name': item.amsT_MotherName,
            'Address': item.address
        }));
        exportToExcel(rows, 'Student_Eligible_Report');
    };

    const tableProps = useDataTableProps(reportResponse);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                <div className='flex justify-between items-center'>
                    <h2 className="text-2xl font-bold tracking-tight">Student Eligible Report</h2>
                </div>

                <CollapsibleSection
                    title='Report Filters'
                    defaultOpen={true}
                    variant='default'
                    className='shadow-lg'
                >
                    <ReportForm
                        onReport={handleReport}
                        onReset={handleReset}
                        onPrint={handlePrint}
                        onExcel={handleExcel}
                        hasData={!!reportResponse?.data?.length}
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title="STUDENT ELIGIBLE REPORT LIST"
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'
                >
                    <GenericDataTable<IStudentEligibleReportDetail>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        manualPagination={false}
                        showViewOptions={true}
                        loadingMessage='Loading report data...'
                        noDataTitle='No Records Found'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
