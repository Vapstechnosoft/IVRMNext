import { getInitialData } from '@/server/college/CollegeAdmission/Transactions/attendance-subject-maxperiod';
import { AttendanceSubjectMaxPeriodWrapper } from './_components/attendance-subject-maxperiod-wrapper';

export const dynamic = 'force-dynamic';

export default async function AttendanceSubjectMaxPeriodPage() {
    const initialData = await getInitialData();

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-3xl tracking-tight'>Attendance Subject Max-Period</h1>
                <p className='text-muted-foreground'>Configure max periods for subjects based on course and semester.</p>
            </div>

            <AttendanceSubjectMaxPeriodWrapper initialData={initialData?.data || {}} />
        </div>
    );
}
