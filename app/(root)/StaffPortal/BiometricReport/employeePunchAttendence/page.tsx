'use client';
import { useState } from 'react';
import { useEmployeePunchAttendanceOnload } from '@/hooks/staff-portal/useEmployeePunchAttendance';
import { EmployeePunchAttendanceFilter } from './_components/employee-punch-attendance-filter';
import { EmployeePunchAttendanceView } from './_components/employee-punch-attendance-view';

export default function EmployeePunchAttendancePage() {
    const { employeeDetails } = useEmployeePunchAttendanceOnload();
    const [reportData, setReportData] = useState<any>([]);

    return (
        <div className='container mx-auto p-4 max-w-5xl'>
            <EmployeePunchAttendanceFilter
                employeeDetails={employeeDetails}
                setReportData={setReportData}
            />
            {reportData && reportData.length > 0 && (
                <EmployeePunchAttendanceView data={reportData} />
            )}
        </div>
    );
}
