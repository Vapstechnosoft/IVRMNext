'use client';

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import NDAReportCardForm from './_components/report-form';
import NDAReportCardView from './_components/report-list';

export default function NDAReportCardPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='NDA Report Card' defaultOpen>
                <NDAReportCardForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <NDAReportCardView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
