// app/pf-form10/page.tsx  OR  wherever your page is
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PFForm10Filters } from './_components/filters';
import { PFForm10Template } from './_components/pf-form10-template';

interface MemberLeavingService {
    serialNo: number;
    accountNo: string;
    memberName: string;
    fatherOrHusbandName: string;
    dateOfLeaving: string;
    reasonForLeaving: string;
    remarks: string;
}

export default function Form10Page() {
    const [filters, setFilters] = useState({ month: '', year: '' });
    const [showForm, setShowForm] = useState(false);
    const [members, setMembers] = useState<MemberLeavingService[]>([]);

    // Hardcoded institution details from your JSON
    const establishmentName = 'Vidya Vikasa Vidya Samsthe (R)';
    const establishmentCode = 'PF';
    const establishmentAddress = 'Basaveshwara Talkies rd, Gayatri circle, karantaka, 577501';

    // Mock data - replace with real API later if needed
    const mockMembers: MemberLeavingService[] = [
        {
            serialNo: 1,
            accountNo: 'MH/56789/123',
            memberName: 'RAHUL KUMAR SHARMA',
            fatherOrHusbandName: 'Suresh Sharma',
            dateOfLeaving: '2025-01-15',
            reasonForLeaving: 'Resigned',
            remarks: ''
        },
        {
            serialNo: 2,
            accountNo: 'MH/56789/456',
            memberName: 'PRIYA SINGH',
            fatherOrHusbandName: 'Rajesh Singh',
            dateOfLeaving: '2025-01-20',
            reasonForLeaving: 'Retired',
            remarks: 'Completed 60 years'
        }
    ];

    const handleGenerate = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select both Month and Year');
            return;
        }

        // Simulate API call delay

        setTimeout(() => {
            setMembers(mockMembers);
            setShowForm(true);
            toast.success(`PF Form 10 generated for ${filters.month} ${filters.year}`);
        }, 800);
    };

    const handleCancel = () => {
        setFilters({ month: '', year: '' });
        setShowForm(false);
        setMembers([]);
        toast.info('Form cleared');
    };

    const handlePrint = () => {
        window.print();
    };

    // Generate years (current + last 5 years)
    const years = Array.from({ length: 6 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { HRMLY_LeaveYear: year.toString() };
    });

    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            <div className='mx-auto max-w-6xl space-y-8'>
                {/* Filters */}
                <PFForm10Filters
                    filters={filters}
                    years={years}
                    onFilterChange={setFilters}
                    onGenerate={handleGenerate}
                    onCancel={handleCancel}
                />

                {/* Form appears instantly on Generate */}
                {showForm && (
                    <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                        <PFForm10Template
                            establishmentName={establishmentName}
                            establishmentCode={establishmentCode}
                            establishmentAddress={establishmentAddress}
                            month={filters.month}
                            year={filters.year}
                            membersLeavingService={members}
                            onPrint={handlePrint}
                            onCancel={handleCancel}
                        />
                    </div>
                )}

                {/* Empty state */}
                {!showForm && (
                    <div className='py-20 text-center text-gray-500'>
                        <div className='mx-auto mb-6 h-32 w-32 rounded-xl border-2 border-dashed bg-gray-200' />
                        <p className='font-medium text-lg'>Select Month & Year, then click GENERATE</p>
                        <p className='mt-2 text-sm'>PF Form 10 will appear here instantly</p>
                    </div>
                )}
            </div>
        </div>
    );
}
