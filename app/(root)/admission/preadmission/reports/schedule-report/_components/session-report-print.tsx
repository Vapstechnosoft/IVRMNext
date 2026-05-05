'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface SessionReportPrintProps {
    data: IScheduleReportList[];
    logo?: string;
    academicYear?: string;
    scheduleName?: string;
    scheduleTime?: string;
    scheduleDate?: string;
}

/**
 * Session Report print component (SRKVS layout).
 */
export default function SessionReportPrint({
    data,
    logo,
    academicYear,
    scheduleName,
    scheduleTime,
    scheduleDate
}: SessionReportPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="p-8 bg-white printable-content" style={{ color: 'black', background: 'white' }}>
            <div className="text-center mb-4">
                {logo && <img src={logo} alt="Logo" className="mx-auto mb-2 max-h-24" />}
            </div>

            <div className="flex flex-row justify-between items-center mb-4 border-b-2 border-black pb-2 text-[10px] font-bold">
                <div>Academic Year: {academicYear || 'N/A'}</div>
                <div>Session: {scheduleName || 'N/A'} AT {scheduleTime || 'N/A'}</div>
                <div>Date: {scheduleDate ? format(new Date(scheduleDate), 'dd/MM/yyyy') : 'N/A'}</div>
            </div>

            <h2 className="text-center font-bold text-xl underline mb-6 uppercase">SESSION REPORT</h2>

            <table className="w-full border-collapse border border-black text-[10px]" style={{ border: '1px solid black' }}>
                <thead>
                    <tr className="bg-gray-100 font-bold">
                        <th className="border border-black p-2 text-center" style={{ border: '1px solid black', width: '50px' }}>SL.No</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Prospectus No</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Student Name</th>
                        <th className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>Age</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Place</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index} className="break-inside-avoid">
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{index + 1}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.regno}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.name}</td>
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{user.age}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.place}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
