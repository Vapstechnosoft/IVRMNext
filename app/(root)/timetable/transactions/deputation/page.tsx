'use client';

import { useState } from 'react';
import { useDeputationViewRecords, usePeriodAlloted } from '@/hooks/timetable/useTransactions';
import { Loader2 } from 'lucide-react';
import DeputationAssignmentTable from './_components/deputationAssignmentTable';
import DeputationForm from './_components/deputationForm';
import DeputationReport from './_components/deputationReport';

export default function DeputationPage() {
    const [selection, setSelection] = useState<{
        date: Date | null;
        dateStr: string;
        dayId: number;
        dayName: string;
        absentStaffId: number;
        absflag: boolean;
        remarks: string;
        smsflag: boolean;
        mailflag: boolean;
        noT_Flag: boolean;
        masters: any;
    } | null>(null);

    // Fetch period allotments when absent staff and date are selected
    const {
        data: periodData,
        isLoading: periodsLoading,
        refetch: refetchPeriods
    } = usePeriodAlloted(
        {
            hrmE_Id: selection?.absentStaffId || 0,
            ttmD_Id: selection?.dayId || 0,
            ttsD_Date: selection?.dateStr || ''
        },
        !!selection?.absentStaffId && !!selection?.dateStr
    );

    // Fetch view records / statistics for the selected date and staff
    const { data: viewRecordsData, isLoading: recordsLoading } = useDeputationViewRecords(
        {
            ttsD_Date: selection?.dateStr || '',
            absflag: selection?.absflag ?? true,
            ttmD_Id: selection?.dayId || 0,
            ttmP_Id: 0,
            hrmE_Id: selection?.absentStaffId || 0
        },
        !!selection?.dateStr
    );

    return (
        <div className='container mx-auto max-w-7xl space-y-8 p-4'>
            <DeputationForm onFetch={setSelection} />

            {selection && (periodsLoading || recordsLoading) && (
                <div className='flex items-center justify-center p-8 text-purple-700 font-semibold gap-2 bg-white rounded-xl border border-purple-100 shadow-sm'>
                    <Loader2 className='h-5 w-5 animate-spin' /> Loading allotted periods & staff statistics...
                </div>
            )}

            {selection && periodData && (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-8 duration-500'>
                    <DeputationReport data={periodData} popupData={viewRecordsData} />
                    <DeputationAssignmentTable
                        periodsData={periodData}
                        selection={selection}
                        onSaveSuccess={() => refetchPeriods()}
                    />
                </div>
            )}
        </div>
    );
}



