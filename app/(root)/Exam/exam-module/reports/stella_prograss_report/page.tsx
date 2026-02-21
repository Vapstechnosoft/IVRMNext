'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard, getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IExamReportCard, IMasterInstitution, Institution, ISubject } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import StellaProgressReportForm from './_components/add-form';
import { StellaReportView } from './_components/stella-report-view';
import { MOCK_STELLA_REPORT_DATA } from './_components/mock-data';

export default function StellaProgressReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    })

    const handleReportSuccess = async (payload: any) => {
        try {
            console.log('Progress Card Report payload:', payload);

            // Bypass API for now and use MOCK DATA as requested
            // const res = await getExamReportCard(payload);

            const data = MOCK_STELLA_REPORT_DATA;

            if (!data || data.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            console.log('Using MOCK DATA:', data);
            setReportData(data);
            setIsReportVisible(true);
            toast.success(`${data.length} progress card(s) generated generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institution_res = await getMasterInstitution();
                const { data: institution_data } = institution_res;
                setInstitution(institution_data);
            } catch (error) {
                console.error("Error fetching institution:", error);
            }
        };

        fetchInstitution();
    }, []);

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Stella Progress Card Report' defaultOpen>
                <StellaProgressReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StellaReportView data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
