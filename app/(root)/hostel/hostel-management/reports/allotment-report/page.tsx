import { getAllotmentReportLoadData } from '@/server/hostel/reports/allotment-report';
import AllotmentReportClient from './_components/report-client';

export default async function AllotmentReportPage() {
    const data = await getAllotmentReportLoadData();

    return (
        <div className="container mx-auto p-4">
            <AllotmentReportClient dropdowns={data} />
        </div>
    );
}
