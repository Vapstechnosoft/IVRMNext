'use client';

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import SophiaReportCardPreIIIView from './_components/report-list';
import SophiaReportCardPreIIIForm from './_components/report-form';


export default function SophiaReportCardPreIIIPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Sophia Report Card Pre III' defaultOpen>
                <SophiaReportCardPreIIIForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SophiaReportCardPreIIIView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
