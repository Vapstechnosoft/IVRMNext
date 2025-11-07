'use client';

import { Heading } from '@/components/layout/heading';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CandidateReportFilters, type CandidateReportFilters as CandidateFilters } from './_components/filters';

interface Candidate extends BaseEntity {
    firstName: string;
    middleName?: string;
    lastName: string;
    emailId: string;
    mobileNo: string;
    currentCompany?: string;
    lastCTC?: string;
    expectedCTC?: string;
    resumeCV?: string; // url
}

export default function CandidateReportPage() {
    const [institutions] = useState<string[]>(['Global Quality Training & Assessors Pvt LTD', 'VAPS Technologies', 'ANI Technologies']);
    const [filters, setFilters] = useState<CandidateFilters>({
        institution: '',
        candidateId: ''
    });

    const candidateDB = createLocalCrud<Candidate>('recruitment:candidate');
    const candidates = useMemo(() => candidateDB.list(), []);
    const selected = useMemo(() => candidates.find((c) => c.id.toString() === filters.candidateId), [candidates, filters.candidateId]);

    useEffect(() => {
        if (!filters.candidateId && candidates.length > 0) {
            setFilters((prev) => ({ ...prev, candidateId: candidates[0].id.toString() }));
        }
    }, [candidates, filters.candidateId]);

    const handleReport = () => {
        if (!filters.institution || !selected) {
            toast.error('Please select institution and candidate');
            return;
        }
        toast.success('Report generated');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Candidate Report' description='Generate a report for selected candidate' />
                    </div>
                </div>

                <CandidateReportFilters
                    filters={filters}
                    institutions={institutions}
                    candidates={candidates}
                    onFilterChange={setFilters}
                    onReport={handleReport}
                    onPrint={handlePrint}
                />

                <CollapsibleSection
                    title='Candidate Details View'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {selected ? (
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            <div className='space-y-2 md:col-span-2'>
                                <div className='grid grid-cols-2 gap-2 text-sm'>
                                    <div className='font-medium'>Candidate Name</div>
                                    <div>{`${selected.firstName} ${selected.middleName || ''} ${selected.lastName}`.trim()}</div>
                                    <div className='font-medium'>Mobile No</div>
                                    <div>{selected.mobileNo}</div>
                                    <div className='font-medium'>Email Id</div>
                                    <div>{selected.emailId}</div>
                                    <div className='font-medium'>Current Company</div>
                                    <div>{selected.currentCompany || '-'}</div>
                                    <div className='font-medium'>Last CTC</div>
                                    <div>{selected.lastCTC || '-'}</div>
                                    <div className='font-medium'>Expected CTC</div>
                                    <div>{selected.expectedCTC || '-'}</div>
                                </div>
                            </div>
                            <div className='flex flex-col items-center justify-start gap-3'>
                                <div className='flex h-48 w-40 items-center justify-center rounded border bg-muted text-muted-foreground text-xs'>
                                    Resume
                                </div>
                                {selected.resumeCV && (
                                    <a className='text-primary underline' href={selected.resumeCV} target='_blank' rel='noreferrer'>
                                        Download Resume
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='text-muted-foreground text-sm'>Select a candidate to view details.</div>
                    )}
                </CollapsibleSection>
            </div>
        </div>
    );
}
