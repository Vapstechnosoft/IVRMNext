'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { getExamTTTransViewRecords, toggleExamTTTransRecord } from '@/server/exam/exam-module/exam-mapping/exam-tt-trans-settings';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ViewRecord {
    examname: string;
    subjectName: string;
    slotname: string;
    slotdate: string;
    exttS_ActiveFlag: boolean;
}

interface Props {
    rowData: IExamTTTransSettings;
    onClose: () => void;
}

export default function ExamTTTransSettingsViewDetails({ rowData, onClose }: Props) {
    const [records, setRecords] = useState<ViewRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getExamTTTransViewRecords(rowData.extT_Id);
                setRecords(res?.data?.viewdata ?? []);
            } catch {
                toast.error('Failed to load records');
            } finally {
                setLoading(false);
            }
        })();
    }, [rowData.extT_Id]);

    async function handleToggle(record: ViewRecord, idx: number) {
        try {
            const res = await toggleExamTTTransRecord(record);
            if (res?.data?.returnval === true) {
                toast.success('Status updated successfully');
                setRecords(prev => prev.map((r, i) => i === idx ? { ...r, exttS_ActiveFlag: !r.exttS_ActiveFlag } : r));
            } else {
                toast.error('Failed to update status');
            }
        } catch {
            toast.error('Error toggling status');
        }
    }

    return (
        <AdaptiveDialog title='Exam TT Records' isOpen={true} onClose={onClose}>
            <AdaptiveBody>
                {loading ? (
                    <div className='py-8 text-center text-muted-foreground'>Loading records...</div>
                ) : records.length === 0 ? (
                    <div className='py-8 text-center text-muted-foreground'>No records found</div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full border-separate border-spacing-0 text-sm'>
                            <thead>
                                <tr className='bg-primary text-primary-foreground'>
                                    <th className='rounded-tl-md px-3 py-2 text-left font-medium'>Sl.No</th>
                                    <th className='px-3 py-2 text-left font-medium'>Exam Name</th>
                                    <th className='px-3 py-2 text-left font-medium'>Subject</th>
                                    <th className='px-3 py-2 text-left font-medium'>Time Slot</th>
                                    <th className='px-3 py-2 text-left font-medium'>Date</th>
                                    <th className='rounded-tr-md px-3 py-2 text-center font-medium'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r, i) => (
                                    <tr key={i} className='border-t border-gray-200 hover:bg-accent/30 transition-colors'>
                                        <td className='px-3 py-2'>{i + 1}</td>
                                        <td className='px-3 py-2'>{r.examname}</td>
                                        <td className='px-3 py-2'>{r.subjectName}</td>
                                        <td className='px-3 py-2'>{r.slotname}</td>
                                        <td className='px-3 py-2'>
                                            {r.slotdate ? new Date(r.slotdate).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                            <button
                                                type='button'
                                                onClick={() => handleToggle(r, i)}
                                                className={
                                                    r.exttS_ActiveFlag
                                                        ? 'font-medium text-red-500 hover:underline'
                                                        : 'font-medium text-green-600 hover:underline'
                                                }>
                                                {r.exttS_ActiveFlag ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button variant='outline' onClick={onClose}>Close</Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
