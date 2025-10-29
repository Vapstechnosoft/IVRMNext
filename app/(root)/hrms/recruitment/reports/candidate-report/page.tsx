// Refactored by automation script on 2025-10-28T15:40:36.169Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/filters.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Printer, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    const [institution, setInstitution] = useState<string>('');
    const [candidateId, setCandidateId] = useState<string>('');

    const candidateDB = createLocalCrud<Candidate>('recruitment:candidate');
    const candidates = useMemo(() => candidateDB.list(), []);
    const selected = useMemo(() => candidates.find((c) => c.id.toString() === candidateId), [candidates, candidateId]);

    useEffect(() => {
        if (!candidateId && candidates.length > 0) setCandidateId(candidates[0].id.toString());
    }, [candidates, candidateId]);

    const handleReport = () => {
        if (!institution || !selected) {
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

                <CollapsibleSection
                    title='Candidate Report Generation'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Institution <span className='text-red-500'>*</span>
                            </label>
                            <Select onValueChange={setInstitution}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((i) => (
                                        <SelectItem key={i} value={i}>
                                            {i}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                            <label className='font-medium text-sm'>
                                Candidate Name <span className='text-red-500'>*</span>
                            </label>
                            <Select onValueChange={setCandidateId} value={candidateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Candidate' />
                                </SelectTrigger>
                                <SelectContent>
                                    {candidates.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {`${c.firstName} ${c.middleName || ''} ${c.lastName}`.trim()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='mt-4 flex gap-3'>
                        <Button type='button' onClick={handleReport}>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handlePrint}>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </CollapsibleSection>

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
