// app/components/StudentProfileModal.tsx
'use client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: any;
    loading?: boolean;
}

const tabs = [
    { id: 'academic', label: 'Academic Details' },
    { id: 'parents', label: 'Parents Details' },
    { id: 'attendance', label: 'Attendance Details' },
    { id: 'subject', label: 'Subject Details' },
    { id: 'fee', label: 'Fee Detail' }
];

const academicYears = [
    { year: '2025-2026', isCurrent: true },
    { year: '2024-2025', isCurrent: false },
    { year: '2023-2024', isCurrent: false }
];

export default function StudentProfileModal({ isOpen, onClose, loading = false }: StudentProfileModalProps): JSX.Element | null {
    const [activeTab, setActiveTab] = useState('academic');

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (loading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                <div className='w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl'>
                    <div className='flex items-center justify-center p-8'>
                        <div className='text-gray-600'>Loading student details...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isOpen) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'academic':
                return (
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-lg text-primary'>Academic Years</h3>
                        <div className='space-y-3'>
                            {academicYears.map((item, idx) => (
                                <div key={idx} className='rounded-lg border border-gray-200 p-4'>
                                    <div className='flex items-center justify-between'>
                                        <span className='font-medium'>{item.year}</span>
                                        {item.isCurrent && (
                                            <span className='rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-xs'>
                                                CURRENT YEAR
                                            </span>
                                        )}
                                    </div>
                                    {item.year === '2025-2026' && (
                                        <div className='mt-2 space-y-1 text-sm'>
                                            <div>
                                                <strong>Class / Section :</strong> I I ICSE / B
                                            </div>
                                            <div>
                                                <strong>Roll No. :</strong> 12
                                            </div>
                                        </div>
                                    )}
                                    {item.year === '2024-2025' && (
                                        <div className='mt-2 space-y-1 text-sm'>
                                            <div>
                                                <strong>Class / Section :</strong> I ICSE / B
                                            </div>
                                            <div>
                                                <strong>Roll No. :</strong> 3
                                            </div>
                                        </div>
                                    )}
                                    {item.year === '2023-2024' && (
                                        <div className='mt-2 space-y-1 text-sm'>
                                            <div>
                                                <strong>Class / Section :</strong> UKG / A
                                            </div>
                                            <div>
                                                <strong>Roll No. :</strong> 1
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'parents':
                return (
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-lg text-primary'>Parents Information</h3>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='rounded-lg border border-gray-200 p-4'>
                                <h4 className='mb-3 font-medium text-primary'>Father's Details</h4>
                                <div className='flex items-center gap-6'>
                                    <div className='space-y-2'>
                                        <p>
                                            <strong>Name:</strong> REVANASIDDESHA S
                                        </p>
                                        <p>
                                            <strong>Mobile:</strong> 0
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {}
                                        </p>
                                        <p>
                                            <strong>Occupation:</strong>
                                        </p>
                                    </div>
                                    <div className='flex-shrink-0'>
                                        <div className='h-28 w-28 overflow-hidden rounded-lg border-2 border-primary/20'>
                                            <img
                                                src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                                                alt='Profile'
                                                className='h-full w-full object-cover'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='rounded-lg border border-gray-200 p-4'>
                                <h4 className='mb-3 font-medium text-primary'>Mother's Details</h4>
                                <div className='flex items-center gap-6'>
                                    <div className='space-y-2'>
                                        <p>
                                            <strong>Name:</strong> BHAVYA M B
                                        </p>
                                        <p>
                                            <strong>Mobile:</strong> 0
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {}
                                        </p>
                                        <p>
                                            <strong>Occupation:</strong>
                                        </p>
                                    </div>
                                    <div className='flex-shrink-0'>
                                        <div className='h-28 w-28 overflow-hidden rounded-lg border-2 border-primary/20'>
                                            <img
                                                src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                                                alt='Profile'
                                                className='h-full w-full object-cover'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'attendance':
                return (
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-lg text-primary'>Attendance Records</h3>
                        <div className='space-y-3'>
                            {academicYears.map((item, idx) => (
                                <div key={idx} className='rounded-lg border border-gray-200 p-4'>
                                    <div className='flex items-center justify-between'>
                                        <span className='font-medium'>{item.year}</span>
                                        {item.isCurrent && (
                                            <span className='rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-xs'>
                                                CURRENT
                                            </span>
                                        )}
                                    </div>
                                    <div className='mt-3 grid grid-cols-2 gap-4 md:grid-cols-4'>
                                        <div className='text-center'>
                                            <div className='font-bold text-2xl text-green-600'>95%</div>
                                            <div className='text-gray-500 text-xs'>Attendance</div>
                                        </div>
                                        <div className='text-center'>
                                            <div className='font-bold text-2xl text-gray-700'>5</div>
                                            <div className='text-gray-500 text-xs'>Days Present</div>
                                        </div>
                                        <div className='text-center'>
                                            <div className='font-bold text-2xl text-red-600'>2</div>
                                            <div className='text-gray-500 text-xs'>Days Absent</div>
                                        </div>
                                        <div className='text-center'>
                                            <div className='font-bold text-2xl text-amber-600'>0</div>
                                            <div className='text-gray-500 text-xs'>Leaves</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'subject':
                return (
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-lg text-primary'>Subject Details</h3>
                        <div className='rounded-lg border border-gray-200 p-4'>
                            <div className='mb-4'>
                                <h4 className='font-medium text-gray-700'>Current Subjects (2025-2026)</h4>
                                <p className='text-gray-500 text-sm'>Class: I I ICSE / B</p>
                            </div>
                            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                                {[
                                    'English',
                                    'Mathematics',
                                    'Science',
                                    'Social Studies',
                                    'Hindi',
                                    'Computer Science',
                                    'General Knowledge',
                                    'Arts'
                                ].map((subject, idx) => (
                                    <div
                                        key={idx}
                                        className='flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-3'>
                                        <span className='font-medium'>{subject}</span>
                                        <span className='rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs'>
                                            Compulsory
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'fee':
                return (
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-lg text-primary'>Fee Details</h3>
                        {academicYears.map((item, idx) => (
                            <div key={idx} className='rounded-lg border border-gray-200 p-4'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-medium'>{item.year}</span>
                                    <span
                                        className={`rounded-full px-3 py-1 font-medium text-xs ${item.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {item.isCurrent ? 'Current' : 'Completed'}
                                    </span>
                                </div>
                                <div className='mt-3 space-y-2'>
                                    <div className='flex justify-between'>
                                        <span>Tuition Fee:</span>
                                        <span className='font-medium'>₹25,000</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Transport Fee:</span>
                                        <span className='font-medium'>₹5,000</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Other Charges:</span>
                                        <span className='font-medium'>₹2,500</span>
                                    </div>
                                    <div className='border-t pt-2'>
                                        <div className='flex justify-between font-bold'>
                                            <span>Total:</span>
                                            <span>₹32,500</span>
                                        </div>
                                    </div>
                                    <div className='flex justify-between text-sm'>
                                        <span>Status:</span>
                                        <span className={`font-medium ${item.isCurrent ? 'text-amber-600' : 'text-green-600'}`}>
                                            {item.isCurrent ? 'Partially Paid' : 'Fully Paid'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='relative flex h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl'>
                <div className='flex items-center justify-between bg-primary px-4 py-2 text-white'>
                    <h2 className='font-semibold text-lg'>STUDENT DETAILS</h2>
                    <button type='button' onClick={onClose} className='rounded-full p-1 transition-colors hover:bg-white/20'>
                        <X size={24} />
                    </button>
                </div>

                <div className='m-3 flex flex-1 overflow-hidden rounded-lg border border-gray-200'>
                    <div className='flex w-1/3 flex-col border-gray-200 border-r'>
                        <div className='overflow-y-auto p-4'>
                            <div className='mb-6'>
                                <div className='flex justify-center'>
                                    <div className='rounded-full border-4 border-primary/10 p-1'>
                                        <img
                                            src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                                            alt='Student'
                                            className='h-28 w-28 rounded-full object-cover'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <p>
                                        <strong>AVIK SHA R</strong>
                                    </p>

                                    <p>
                                        <strong>Admno:</strong> <span>127</span>
                                    </p>
                                    <p>
                                        <strong>Date Of Admission:</strong>
                                        <span>12/06/2023</span>
                                    </p>

                                    <p>
                                        <strong>Date Of Birth:</strong>
                                        <span>21/08/2018</span>
                                    </p>
                                    <p>
                                        <strong>Admitted Year:</strong>
                                        <span>2023-2024</span>
                                    </p>
                                    <p>
                                        <strong>Admitted Class:</strong>
                                        <span>UKG</span>
                                    </p>
                                    <p>
                                        <strong>Gender:</strong>
                                        <span>Female</span>
                                    </p>
                                    <p>
                                        <strong>Mobile:</strong>
                                        <span>0</span>
                                    </p>
                                    <p>
                                        <strong>Email:</strong>
                                        <span>{}</span>
                                    </p>
                                    <p>
                                        <strong>Tpln:</strong>
                                        <span>180821001</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex w-2/3 flex-col'>
                        <div className='border-gray-200 border-b bg-white'>
                            <nav className='flex space-x-1 px-6 pt-4'>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type='button'
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`rounded-t-lg px-4 py-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-primary border-b-2 bg-primary/10 text-primary'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className='flex-1 overflow-y-auto p-6'>{renderTabContent()}</div>
                    </div>
                </div>
                <div className='border-gray-200 border-t bg-gray-50 p-3'>
                    <div className='flex justify-end'>
                        <Button variant='secondary' onClick={onClose} className='w-70'>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
