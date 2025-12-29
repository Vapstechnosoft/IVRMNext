// app/components/StudentProfileModal.tsx
'use client';
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

export default function StudentProfileModal({ isOpen, onClose, data, loading = false }: StudentProfileModalProps): JSX.Element | null {
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
                        <h3 className='font-semibold text-blue-700 text-lg'>Academic Years</h3>
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
                        <h3 className='font-semibold text-blue-700 text-lg'>Parents Information</h3>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='rounded-lg border border-gray-200 p-4'>
                                <h4 className='mb-3 font-medium text-gray-700'>Father's Details</h4>
                                <div className='space-y-2'>
                                    <p>
                                        <strong>Name:</strong> To be filled
                                    </p>
                                    <p>
                                        <strong>Mobile:</strong> To be filled
                                    </p>
                                    <p>
                                        <strong>Email:</strong> To be filled
                                    </p>
                                    <p>
                                        <strong>Occupation:</strong> To be filled
                                    </p>
                                </div>
                            </div>
                            <div className='rounded-lg border border-gray-200 p-4'>
                                <h4 className='mb-3 font-medium text-gray-700'>Mother's Details</h4>
                                <div className='space-y-2'>
                                    <p>
                                        <strong>Name:</strong> To be filled
                                    </p>
                                    <p>
                                        <strong>Mobile:</strong> To be filled
                                    </p>
                                    <p>
                                        <strong>Email:</strong> To be filled
                                    </p>
                                    <p>
                                        <strong>Occupation:</strong> To be filled
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'attendance':
                return (
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-blue-700 text-lg'>Attendance Records</h3>
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
                        <h3 className='font-semibold text-blue-700 text-lg'>Subject Details</h3>
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
                        <h3 className='font-semibold text-blue-700 text-lg'>Fee Details</h3>
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
            <div className='relative h-[90vh] w-full max-w-6xl rounded-lg bg-white shadow-xl'>
                {/* Close button */}
                <button type='button' onClick={onClose} className='absolute top-4 right-4 z-10 rounded-full p-1 hover:bg-gray-100'>
                    <X size={24} />
                </button>

                {/* Main Content Container */}
                <div className='flex h-full'>
                    {/* Left Panel - Student Info */}
                    <div className='w-1/3 border-gray-200 border-r p-6'>
                        <div className='sticky top-0'>
                            {/* Header */}
                            <div className='mb-6'>
                                {/* <h1 className='font-bold text-2xl text-gray-800'>STUDENT DETAILS</h1> */}
                                <div className='mt-2 flex items-center'>
                                    <h2 className='font-semibold text-gray-700 text-lg'>STUDENT DETAILS :</h2>
                                    <span className='ml-2 text-blue-600'>▲</span>
                                </div>
                            </div>

                            {/* Student Basic Info */}
                            <div className='mb-6 rounded-lg border border-gray-200 p-4'>
                                <h3 className='mb-2 font-bold text-blue-700 text-xl'>AVIK SHA R</h3>
                                <p className='text-gray-600'>
                                    <strong>Admno :</strong> 127
                                </p>
                            </div>

                            {/* Student Details */}
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <p>
                                        <strong>Date Of Admission :</strong> 12/06/2023
                                    </p>
                                    <p>
                                        <strong>Date Of Birth :</strong> 21/08/2018
                                    </p>
                                    <p>
                                        <strong>Admitted Year :</strong> 2023-2024
                                    </p>
                                </div>
                                <div className='space-y-2'>
                                    <p>
                                        <strong>Admitted Class :</strong> UKG
                                    </p>
                                    <p>
                                        <strong>Gender :</strong> Female
                                    </p>
                                    <p>
                                        <strong>Mobile :</strong> 0
                                    </p>
                                    <p>
                                        <strong>Email :</strong>{' '}
                                    </p>
                                    <p>
                                        <strong>Tpln :</strong> 180821001
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Tabs Content */}
                    <div className='flex w-2/3 flex-col'>
                        {/* Tabs Navigation - Using regular buttons */}
                        <div className='border-gray-200 border-b'>
                            <nav className='flex space-x-1 px-6 pt-4'>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type='button'
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`rounded-t-lg px-4 py-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-600 border-b-2 bg-blue-50 text-blue-700'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content with Scroll */}
                        <div className='flex-1 overflow-y-auto p-6'>{renderTabContent()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
